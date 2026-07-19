/**
 * 沃尔玛品牌智能体 — Walmart Brand Agent
 *
 * 角色定位：智能匹配引擎 + 协商代理 + 服务编排器
 * - 接收消费者AI查询，理解深层需求
 * - 从海量SKU中精准匹配 + 智能替代推荐
 * - 自动应用最优定价策略和会员权益
 * - 持续学习消费者AI的偏好模式
 */
class BrandAI {
  constructor(knowledgeBase) {
    this.kb = knowledgeBase;
    this.state = {
      activeConversations: new Map(),
      totalQueries: 0,
      totalConversions: 0,
    };
    this.model = {
      strategyPerformance: {},
      seasonalInsights: {},
      productAffinity: {},       // "购买A的用户也买了B"
      queryPatterns: {},         // 查询模式 → 响应策略
      interactionLog: [],
    };
    this._init();
  }

  _init() {
    this.kb.negotiationStrategies.forEach(s => {
      this.model.strategyPerformance[s.id] = { used: 0, accepted: 0 };
    });
  }

  /** 接收消费者AI查询 — 主入口 */
  receiveQuery(query) {
    this.state.totalQueries++;
    const convId = query.id;

    const ctx = {
      query,
      phase: 'matching',
      matchedProducts: [],
      appliedStrategies: [],
      consumerProfile: query.consumerContext || {},
      history: [],
    };

    this.state.activeConversations.set(convId, ctx);

    // Step 1: 产品匹配
    const matched = this._matchProducts(query);
    ctx.matchedProducts = matched;
    ctx.phase = 'matching';

    ctx.history.push({ phase: 'matching', products: matched.map(p => p.id), timestamp: now() });

    // Step 2: 应用协商策略
    const optimized = this._applyStrategies(matched, query, ctx);
    ctx.optimizedRecommendations = optimized.recommendations;
    ctx.appliedStrategies = optimized.strategies;
    ctx.phase = 'optimized';

    ctx.history.push({ phase: 'optimized', strategies: optimized.strategies, timestamp: now() });

    return {
      type: 'RECOMMENDATIONS',
      conversationId: convId,
      recommendations: optimized.recommendations,
      appliedStrategies: optimized.strategies,
      summary: this._generateSummary(optimized),
      membershipContext: this._getMembershipContext(query),
    };
  }

  /** 确认成交 */
  confirmDeal(convId, chosenItem) {
    const ctx = this.state.activeConversations.get(convId);
    if (!ctx) return { error: '对话不存在' };

    this.state.totalConversions++;

    // 应用最终优惠
    const finalDeal = this._finalizeDeal(chosenItem, ctx);

    ctx.history.push({ phase: 'closed', deal: finalDeal, timestamp: now() });

    // 学习
    this._learn(ctx, chosenItem, finalDeal);

    this.state.activeConversations.delete(convId);

    return {
      type: 'DEAL_FINALIZED',
      deal: finalDeal,
      learning: this._learningSummary(),
    };
  }

  // ====== 产品匹配引擎 ======

  _matchProducts(query) {
    const scenario = query.scenario;
    const reqs = query.requirements || [];
    const budget = query.budget?.flexibleUpTo || query.budget?.limit || 5000;
    const ctx = query.consumerContext || {};

    // 收集所有产品并展平
    const allProducts = [];
    for (const [dept, items] of Object.entries(this.kb.products)) {
      items.forEach(item => allProducts.push({ ...item, department: dept }));
    }

    // 场景→品类映射
    const scenarioDeptMap = {
      health_matching: ['health', 'personal_care', 'grocery'],
      price_negotiation: ['electronics', 'household'],
      auto_replenish: ['grocery', 'household', 'personal_care', 'pet', 'baby'],
      after_sales: ['electronics', 'health', 'personal_care'],
      bundle_custom: ['grocery', 'household', 'personal_care', 'health'],
      default: ['grocery', 'household', 'personal_care', 'health', 'electronics', 'baby', 'pet'],
    };

    const targetDepts = scenarioDeptMap[scenario] || scenarioDeptMap['default'];

    // 筛选
    let candidates = allProducts.filter(p => targetDepts.includes(p.department));

    // 过敏原过滤
    const allergies = ctx.allergies || [];
    if (allergies.length > 0) {
      candidates = candidates.filter(p => {
        const text = (p.name + ' ' + (p.tags || []).join(' ')).toLowerCase();
        return !allergies.some(a => {
          const kw = a.toLowerCase();
          return text.includes(kw) || text.includes(this._allergyAlias(kw));
        });
      });
    }

    // 预算过滤
    candidates = candidates.filter(p => p.price <= budget * 1.3);

    // 关键词匹配（需求→标签）
    const keywordTagMap = {
      '低糖': ['无糖', '低卡', 'low sugar', 'unsweetened', '无高果糖浆'],
      '高蛋白': ['高蛋白', 'protein', '鸡胸', '三文鱼'],
      '敏感肌': ['低敏', 'hypoallergenic', '无香', '不致痘', 'pH平衡'],
      '有机': ['有机', 'organic', 'wild', 'cage_free', '散养'],
      '无添加': ['无添加', 'no artificial', '天然'],
      '家用': ['清洁', '厨房', '日用'],
      '安防': [],
      '清洁': ['清洁', '日用'],
    };

    let scored = candidates.map(p => {
      let relevance = 0.5;
      const tagText = (p.tags || []).join(' ').toLowerCase();
      const nameText = p.name.toLowerCase();

      for (const [req, keywords] of Object.entries(keywordTagMap)) {
        if (reqs.some(r => r.includes(req) || req.includes(r))) {
          for (const kw of keywords) {
            if (tagText.includes(kw.toLowerCase()) || nameText.includes(kw.toLowerCase())) {
              relevance += 0.12;
            }
          }
        }
      }

      // 库存充足加分
      if (p.stock > 5000) relevance += 0.05;
      // 好评标签加分
      if (tagText.includes('usp') || tagText.includes('认证')) relevance += 0.08;

      return { ...p, relevance: Math.min(1, relevance) };
    });

    // 排序取Top 5
    scored.sort((a, b) => b.relevance - a.relevance);
    return scored.slice(0, 5);
  }

  _allergyAlias(kw) {
    const map = { '花生': 'peanut', '贝类': 'shellfish', '海鲜': 'seafood', '牛奶': 'dairy', '鸡蛋': 'egg' };
    return map[kw] || '';
  }

  // ====== 协商策略引擎 ======

  _applyStrategies(products, query, ctx) {
    const appliedStrategies = [];
    let recommendations = products.map(p => ({
      ...p,
      originalPrice: p.price,
      finalPrice: p.price,
      appliedDiscounts: [],
      deliveryOptions: this._getDeliveryOptions(query),
      membershipValue: 0,
    }));

    const budget = query.budget?.limit || 5000;

    // 策略1: EDLP价格保证
    const edlp = this.kb.negotiationStrategies.find(s => s.id === 'edlp_match');
    appliedStrategies.push({ strategy: edlp, reason: 'Walmart每日低价承诺 — 如发现更低价格自动退差价' });

    // 策略2: Walmart+ 会员权益
    const wplus = this.kb.negotiationStrategies.find(s => s.id === 'wplus_benefit');
    const totalPrice = recommendations.reduce((s, r) => s + r.finalPrice, 0);
    if (totalPrice > 35) {
      recommendations = recommendations.map(r => ({
        ...r,
        deliveryOptions: [...r.deliveryOptions, '免费当日达 (Walmart+)'],
        membershipValue: 0.15,
      }));
      appliedStrategies.push({ strategy: wplus, reason: 'Walmart+会员免运费($35+订单) + 提前抢购' });
    }

    // 策略3: 组合折扣（3件以上）
    if (recommendations.length >= 3) {
      const bundle = this.kb.negotiationStrategies.find(s => s.id === 'bundle_save');
      recommendations = recommendations.map(r => ({
        ...r,
        finalPrice: Math.round(r.finalPrice * 0.94 * 100) / 100,
        appliedDiscounts: [...r.appliedDiscounts, '组合购94折'],
      }));
      appliedStrategies.push({ strategy: bundle, reason: '选购3+件享组合折扣6% off' });
    }

    // 策略4: 自提优惠
    const pickup = this.kb.negotiationStrategies.find(s => s.id === 'pickup_discount');
    recommendations = recommendations.map(r => ({
      ...r,
      deliveryOptions: [...r.deliveryOptions, '门店自提 (免费)'],
    }));
    appliedStrategies.push({ strategy: pickup, reason: '选择门店自提免运费 + 最快2小时可取' });

    // 策略5: 订阅省（高频消费品）
    const subSave = this.kb.negotiationStrategies.find(s => s.id === 'subscription_save');
    const highFreqCategories = ['grocery', 'household', 'personal_care', 'baby', 'pet'];
    recommendations = recommendations.map(r => {
      if (highFreqCategories.includes(r.department)) {
        return {
          ...r,
          subscriptionEligible: true,
          subscriptionPrice: Math.round(r.finalPrice * 0.92 * 100) / 100,
          subscriptionNote: '订阅定期配送再省8%',
        };
      }
      return r;
    });
    appliedStrategies.push({ strategy: subSave, reason: '日用品订阅配送享额外8%折扣' });

    // 记录策略使用
    appliedStrategies.forEach(s => {
      if (this.model.strategyPerformance[s.strategy.id]) {
        this.model.strategyPerformance[s.strategy.id].used++;
      }
    });

    return { recommendations, strategies: appliedStrategies };
  }

  _getDeliveryOptions(query) {
    const ctx = query.consumerContext || {};
    const isWplus = ctx.preferenceTags?.includes('convenience-first');
    const base = ['次日达', '门店自提 (免费)'];
    if (isWplus) base.unshift('当日达 (Walmart+)');
    return base;
  }

  // ====== 成交引擎 ======

  _finalizeDeal(chosenItem, ctx) {
    const item = { ...chosenItem };
    let finalPrice = item.finalPrice || item.price;

    // 如果选择了订阅
    if (item.subscriptionEligible && item.subscriptionPrice) {
      finalPrice = item.subscriptionPrice;
    }

    const savings = (item.originalPrice || item.price) - finalPrice;

    // 计算送达时间
    const deliveryEstimate = item.deliveryOptions?.includes('当日达 (Walmart+)')
      ? '今天下午5-8点'
      : item.deliveryOptions?.includes('次日达')
        ? '明天'
        : '2-3个工作日';

    // Walmart+ 权益
    const wplusBenefits = [
      '加油每加仑省$0.10',
      'Paramount+ 免费流媒体',
      '手机扫码结账 Skip the Line',
    ];

    return {
      product: {
        name: item.name,
        price: item.originalPrice || item.price,
        finalPrice: Math.round(finalPrice * 100) / 100,
        savings: Math.round(Math.max(0, savings) * 100) / 100,
      },
      delivery: {
        method: item.deliveryOptions?.[0] || '次日达',
        estimate: deliveryEstimate,
        free: true,
      },
      walmartPlus: wplusBenefits,
      returnPolicy: '90天无忧退换',
      appliedPromos: item.appliedDiscounts || [],
      expiresAt: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
    };
  }

  _generateSummary(optimized) {
    const recs = optimized.recommendations;
    const strategies = optimized.strategies;
    const totalOriginal = recs.reduce((s, r) => s + (r.originalPrice || r.price), 0);
    const totalFinal = recs.reduce((s, r) => s + (r.finalPrice || r.price), 0);

    return {
      totalProducts: recs.length,
      totalOriginal: Math.round(totalOriginal * 100) / 100,
      totalFinal: Math.round(totalFinal * 100) / 100,
      totalSavings: Math.round((totalOriginal - totalFinal) * 100) / 100,
      strategyCount: strategies.length,
      message: `为您匹配了${recs.length}件商品，应用${strategies.length}项Walmart优惠策略，共节省$${Math.round((totalOriginal-totalFinal)*100)/100}`,
    };
  }

  _getMembershipContext(query) {
    const wplus = this.kb.membership;
    return {
      program: wplus.program,
      annualFee: wplus.annualFee,
      keyBenefits: wplus.benefits.slice(0, 3),
      userHasMembership: true,
      giftCardBalance: wplus.giftCards.reduce((s, g) => s + g.balance, 0),
      storedValue: wplus.storedValue,
    };
  }

  // ====== 学习引擎 ======

  _learn(ctx, chosenItem, finalDeal) {
    const log = {
      timestamp: now(),
      scenario: ctx.query.scenario,
      productCategory: chosenItem.department || chosenItem.category,
      productId: chosenItem.id,
      strategiesUsed: ctx.appliedStrategies?.map(s => s.strategy?.id).filter(Boolean) || [],
      converted: true,
    };
    this.model.interactionLog.push(log);

    // 更新策略效果
    ctx.appliedStrategies?.forEach(s => {
      if (s.strategy?.id && this.model.strategyPerformance[s.strategy.id]) {
        this.model.strategyPerformance[s.strategy.id].accepted++;
      }
    });

    // 更新产品亲和力
    const cat = chosenItem.department || chosenItem.category;
    this.model.productAffinity[cat] = (this.model.productAffinity[cat] || 0) + 1;

    if (this.model.interactionLog.length > 500) {
      this.model.interactionLog = this.model.interactionLog.slice(-500);
    }
  }

  _learningSummary() {
    const topStrategies = Object.entries(this.model.strategyPerformance)
      .sort(([,a], [,b]) => (b.accepted/(b.used||1)) - (a.accepted/(a.used||1)))
      .slice(0, 3)
      .map(([id, perf]) => ({
        id,
        successRate: perf.used > 0 ? (perf.accepted / perf.used * 100).toFixed(0) + '%' : 'N/A',
      }));

    const topCategories = Object.entries(this.model.productAffinity)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([cat, count]) => ({ category: cat, conversions: count }));

    return { topStrategies, topCategories, totalInteractions: this.state.totalQueries };
  }

  getStatus() {
    return {
      brand: 'Walmart',
      totalQueries: this.state.totalQueries,
      totalConversions: this.state.totalConversions,
      conversionRate: this.state.totalQueries > 0
        ? (this.state.totalConversions / this.state.totalQueries * 100).toFixed(1) + '%'
        : '0%',
      activeConversations: this.state.activeConversations.size,
      topCategories: Object.entries(this.model.productAffinity)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3)
        .map(([c]) => c),
    };
  }
}

function now() { return new Date().toISOString(); }

if (typeof module !== 'undefined' && module.exports) {
  module.exports = BrandAI;
}
