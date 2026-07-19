/**
 * 消费者AI引擎 — Consumer AI Agent
 *
 * 设计原则：
 * 1. 活的、不断学习的 — 每次交互都在更新内部模型
 * 2. 多维度权衡 — 不只看价格，综合健康/品质/便利/生态/情感
 * 3. 自然决策 — 能决则决，不能决则诚实上报置信度不足
 * 4. 后悔驱动学习 — 从过往的"买错了"中持续进化
 */
class ConsumerAI {
  constructor(userProfile) {
    this.profile = userProfile;
    this.state = {
      confidence: 0.90,
      totalQueries: 0,
      totalDecisions: 0,
      humanEscalations: 0,
      currentConversation: null,
    };
    this.model = {
      weights: {
        price_sensitivity: 0.22,
        health_safety: 0.20,
        quality_rating: 0.16,
        convenience: 0.12,
        brand_trust: 0.10,
        eco_social: 0.08,
        novelty_explore: 0.07,
        membership_value: 0.05,
      },
      regretPatterns: [],
      brandTrust: new Map(),     // brandName → trustScore [0,1]
      categoryPreferences: {},  // category → { avgSpend, frequency, preferredAttributes }
      interactionHistory: [],
      learningRate: 0.04,
    };
    this._initFromProfile();
  }

  _initFromProfile() {
    const p = this.profile;
    if (p.allergies?.length > 0) {
      this.model.weights.health_safety = 0.28;
      this.model.weights.price_sensitivity = 0.16;
    }
    if (p.consumptionHistory) {
      const regrets = p.consumptionHistory.filter(h => h.regret);
      regrets.forEach(r => {
        this.model.regretPatterns.push({
          category: r.category,
          reason: r.regretReason || '未知',
          price: r.price,
          date: r.date,
        });
      });
    }
    if (p.blacklist?.brands) {
      p.blacklist.brands.forEach(b => this.model.brandTrust.set(b, 0.0));
    }
    // 默认信任大品牌
    ['Walmart', 'Great Value', 'Marketside', 'Tyson', 'Dove', 'Pampers'].forEach(b => {
      if (!this.model.brandTrust.has(b)) this.model.brandTrust.set(b, 0.75);
    });
    this.model.brandTrust.set('Walmart', 0.80);
  }

  /** 发起查询 — 动态构造，非预设 */
  formulateQuery(scenario) {
    this.state.totalQueries++;
    const p = this.profile;

    // 动态计算预算弹性
    const monthlyBudget = p.budget?.monthly || 5000;
    const scenarioBudget = scenario.budgetLimit || monthlyBudget;
    const flexibility = p.budget?.flexible || 0.20;

    // 构建上下文摘要，只发送品牌AI需要的信息
    const query = {
      id: `cq_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      scenario: scenario.id,
      timestamp: new Date().toISOString(),
      requirements: scenario.requirements || [],
      constraints: scenario.constraints || [],
      budget: {
        limit: scenarioBudget,
        flexibleUpTo: Math.round(scenarioBudget * (1 + flexibility)),
      },
      consumerContext: {
        allergies: p.allergies || [],
        healthGoals: p.healthGoals || [],
        healthConditions: p.healthConditions || [],
        lifestyle: p.lifestyle || {},
        householdSize: p.householdSize || 1,
        hasPets: !!p.hasPets,
        hasBaby: !!p.hasBaby,
        // 偏好摘要（内部权重不暴露，只给方向）
        preferenceTags: this._derivePreferenceTags(),
      },
      // 记录最近后悔，帮品牌AI避开雷区
      recentRegretCategories: this.model.regretPatterns.slice(-3).map(r => r.category),
    };

    this.state.currentConversation = { query, responses: [] };
    this.state.confidence = Math.min(0.92, 0.70 + scenario.complexity === 'high' ? 0.05 : 0.15);
    return query;
  }

  /** 从权重推导偏好标签（不暴露内部权重值） */
  _derivePreferenceTags() {
    const w = this.model.weights;
    const tags = [];
    if (w.health_safety > 0.20) tags.push('health-first');
    if (w.price_sensitivity > 0.20) tags.push('budget-conscious');
    if (w.quality_rating > 0.18) tags.push('quality-seeker');
    if (w.convenience > 0.14) tags.push('convenience-first');
    if (w.eco_social > 0.10) tags.push('eco-friendly');
    if (w.novelty_explore > 0.10) tags.push('early-adopter');
    return tags;
  }

  /**
   * 评估品牌AI返回的推荐
   * @returns {Object} { canDecide, topPick, allScores, confidence, reasoning }
   */
  evaluateRecommendations(recommendations) {
    if (!recommendations || recommendations.length === 0) {
      return { canDecide: false, reason: '无可评估方案', confidence: 0 };
    }

    // 对每个推荐多维度打分
    const scored = recommendations.map(rec => this._scoreItem(rec));

    // 按总分排序
    scored.sort((a, b) => b.totalScore - a.totalScore);

    // 检查区分度 — 如果第一名和第二名差距大，AI可以自信决策
    const margin = scored.length > 1
      ? scored[0].totalScore - scored[1].totalScore
      : 1.0;

    let confidence, canDecide;

    if (margin > 0.15) {
      confidence = Math.min(0.95, 0.70 + margin);
      canDecide = true;
    } else if (margin > 0.05) {
      confidence = 0.50 + margin;
      canDecide = confidence > 0.55;
    } else {
      confidence = Math.max(0.15, 0.35 + margin);
      canDecide = false;
    }

    // 检查健康安全 — 如果有过敏风险直接否决
    const safetyIssues = scored.filter(s => s.safetyFlags?.length > 0);
    if (safetyIssues.length > 0 && scored[0].safetyFlags?.length > 0) {
      canDecide = false;
      confidence = Math.min(confidence, 0.25);
    }

    this.state.confidence = confidence;

    return {
      canDecide,
      confidence,
      margin,
      topPick: canDecide ? scored[0] : null,
      allScores: scored,
      reasoning: this._generateReasoning(scored, margin, canDecide),
      needsHuman: !canDecide,
    };
  }

  /** 对单个商品/组合进行多维度评分 */
  _scoreItem(item) {
    const w = this.model.weights;
    const scores = {};
    const safetyFlags = [];

    // 1. 价格维度（越低越好，但有"过于便宜可能质量差"的拐点）
    if (item.price != null) {
      const budgetLimit = this.profile.budget?.monthly || 5000;
      const ratio = item.price / budgetLimit;
      if (ratio < 0.05) scores.price = 0.85;      // 非常便宜
      else if (ratio < 0.2) scores.price = 0.90;    // 合理
      else if (ratio < 0.5) scores.price = 0.60;    // 有点贵
      else scores.price = 0.30;                     // 超出预算
    }

    // 2. 健康安全维度
    scores.health = this._evaluateHealthSafety(item);
    if (scores.health < 0.4) {
      safetyFlags.push(`健康安全评分过低(${(scores.health*100).toFixed(0)}%)`);
    }

    // 3. 品质维度
    scores.quality = item.qualityScore || this._estimateQuality(item);

    // 4. 便利性
    scores.convenience = item.convenienceScore || this._estimateConvenience(item);

    // 5. 品牌信任
    scores.brand = this._getBrandTrust(item);

    // 6. 生态/会员价值
    scores.membership = item.membershipValue || 0.5;

    // 7. 可持续/社会价值（简单启发式）
    scores.eco = item.organic || item.sustainable ? 0.85 : 0.5;

    // 8. 新颖度（新品/首次尝试）
    scores.novelty = item.noveltyScore || 0.5;

    // 加权总分
    let total = 0;
    let weightSum = 0;
    const dimMap = {
      price: 'price_sensitivity', health: 'health_safety',
      quality: 'quality_rating', convenience: 'convenience',
      brand: 'brand_trust', membership: 'membership_value',
      eco: 'eco_social', novelty: 'novelty_explore',
    };

    for (const [dim, weightKey] of Object.entries(dimMap)) {
      if (scores[dim] != null) {
        total += scores[dim] * w[weightKey];
        weightSum += w[weightKey];
      }
    }

    return {
      item,
      dimensionScores: scores,
      totalScore: weightSum > 0 ? total / weightSum : 0.5,
      safetyFlags,
      summary: `${item.name || '商品'} · 综合评分${((total/(weightSum||1))*100).toFixed(0)}%`,
    };
  }

  _evaluateHealthSafety(item) {
    let score = 0.8;
    const allergies = this.profile.allergies || [];
    const tags = (item.tags || []).join(' ').toLowerCase();
    const name = (item.name || '').toLowerCase();

    // 检查过敏原关键词
    const allergyKeywords = {
      '花生': ['peanut', '花生'],
      '贝类海鲜': ['shellfish', 'shrimp', 'crab', '海鲜', '虾', '蟹'],
      '乳制品': ['dairy', 'milk', 'cheese', '乳', '奶', '黄油'],
      '麸质': ['gluten', 'wheat', '面粉', '麸质'],
      '坚果': ['nut', 'almond', '核桃', '杏仁'],
      '大豆': ['soy', 'soybean', '大豆', '豆乳'],
    };

    for (const [allergy, keywords] of Object.entries(allergyKeywords)) {
      if (allergies.some(a => a.includes(allergy) || allergy.includes(a))) {
        for (const kw of keywords) {
          if (tags.includes(kw) || name.includes(kw)) {
            score = 0.15; // 严重不匹配
            break;
          }
        }
      }
    }

    // 无过敏原标签加分
    if (tags.includes('hypoallergenic') || tags.includes('低敏')) score += 0.1;
    if (tags.includes('无添加') || tags.includes('有机')) score += 0.05;

    return Math.min(1, score);
  }

  _estimateQuality(item) {
    let q = 0.6;
    if (item.tags) {
      const t = item.tags.join(' ');
      if (/有机|organic|野生|wild/i.test(t)) q += 0.15;
      if (/USP|认证|certified/i.test(t)) q += 0.1;
      if (/高端|premium/i.test(t)) q += 0.1;
    }
    if (item.price && item.price > 20) q += 0.05; // 价格信号
    return Math.min(1, q);
  }

  _estimateConvenience(item) {
    let c = 0.5;
    if (item.deliveryOptions) {
      if (item.deliveryOptions.includes('当日达')) c += 0.2;
      if (item.deliveryOptions.includes('自提')) c += 0.1;
    } else c += 0.1; // Walmart默认有良好配送
    if (item.stock > 5000) c += 0.1; // 库存充足
    return Math.min(1, c);
  }

  _getBrandTrust(item) {
    const brand = item.brand || (item.name || '').split(' ')[0];
    return this.model.brandTrust.get(brand) || 0.55;
  }

  _generateReasoning(scored, margin, canDecide) {
    if (canDecide) {
      return `首选"${scored[0].item.name}"评分领先${(margin*100).toFixed(0)}个百分点，可自信推荐。`;
    }
    const reasons = [];
    if (margin < 0.05) reasons.push('前两名分数过于接近');
    if (scored.some(s => s.safetyFlags?.length > 0)) reasons.push('存在安全隐患需人类确认');
    if (scored[0].totalScore < 0.5) reasons.push('最高评分仍低于阈值');
    return reasons.join('；') || '多维度评分无法收敛';
  }

  /** 请求人工介入 */
  requestHumanIntervention(evaluation) {
    this.state.humanEscalations++;
    return {
      type: 'HUMAN_NEEDED',
      message: evaluation.allScores.length >= 2 && evaluation.margin < 0.06
        ? '🤔 几个选项都非常接近，我的数据模型无法做出有意义的区分。这取决于您此刻更看重什么——请亲自选择。'
        : evaluation.allScores.some(s => s.safetyFlags?.length > 0)
          ? '⚠️ 检测到潜在的健康/安全风险，我需要您亲自确认是否接受。'
          : '📊 当前选项的差异超出了纯数据判断的范围，需要您的价值判断。',
      confidence: evaluation.confidence,
      options: evaluation.allScores,
    };
  }

  /** 学习 — 从人类选择中更新模型 */
  learn(chosenItem, evaluation, outcome = {}) {
    const log = {
      timestamp: new Date().toISOString(),
      chosen: chosenItem.item?.name || chosenItem.name,
      rejected: evaluation.allScores
        .filter(s => s !== chosenItem && s !== evaluation.topPick)
        .map(s => s.item?.name || s.item?.id),
      outcome,
    };
    this.model.interactionHistory.push(log);

    // 更新品牌信任
    const brand = chosenItem.item?.brand || chosenItem.brand;
    if (brand) {
      const current = this.model.brandTrust.get(brand) || 0.55;
      this.model.brandTrust.set(brand, Math.min(1, current + this.model.learningRate));
    }

    // 更新权重 — 强化被选择维度的权重
    const lr = this.model.learningRate;
    const w = this.model.weights;
    if (chosenItem.dimensionScores) {
      const dimToWeight = {
        price: 'price_sensitivity', health: 'health_safety',
        quality: 'quality_rating', convenience: 'convenience',
        brand: 'brand_trust', membership: 'membership_value',
        eco: 'eco_social', novelty: 'novelty_explore',
      };
      for (const [dim, weightKey] of Object.entries(dimToWeight)) {
        if (chosenItem.dimensionScores[dim] > 0.75) {
          w[weightKey] = Math.min(0.35, w[weightKey] + lr * 0.5);
        }
      }
      // 归一化
      const total = Object.values(w).reduce((a, b) => a + b, 0);
      for (const k of Object.keys(w)) w[k] /= total;
    }

    // 记录后悔
    if (outcome.regret) {
      this.model.regretPatterns.push({
        category: chosenItem.item?.category,
        reason: outcome.regretReason || '事后不满意',
        date: new Date().toISOString(),
      });
    }

    this.state.confidence = 0.90;
    this.state.totalDecisions++;

    if (this.model.interactionHistory.length > 200) {
      this.model.interactionHistory = this.model.interactionHistory.slice(-200);
    }
  }

  getStatus() {
    return {
      confidence: this.state.confidence,
      totalQueries: this.state.totalQueries,
      totalDecisions: this.state.totalDecisions,
      escalations: this.state.humanEscalations,
      escalationRate: this.state.totalQueries > 0
        ? (this.state.humanEscalations / this.state.totalQueries * 100).toFixed(1) + '%'
        : '0%',
      topWeights: Object.entries(this.model.weights)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3)
        .map(([k, v]) => ({ dim: k.replace('_', ' '), val: (v*100).toFixed(0)+'%' })),
    };
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = ConsumerAI;
}
