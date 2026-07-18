/**
 * 主控制器 — Walmart Brand AI Demo
 *
 * 核心设计：统一对话视图 — 所有AI交互在一根时间线上展示
 * 用户可以看到消费者AI ↔ 沃尔玛品牌智能体 的完整对话
 */
class AINegotiationDemo {
  constructor() {
    this.userProfile = this._createProfile();
    this.consumerAI = new ConsumerAI(this.userProfile);
    this.brandAI = new BrandAI(WALMART_KB);
    this.currentScenario = null;
    this.currentConvId = null;
    this.phase = 'idle';
    this.ui = {};
    this._init();
  }

  _createProfile() {
    return {
      name: 'Fancy',
      age: 28,
      allergies: ['花生', '贝类海鲜'],
      healthGoals: ['低糖饮食', '高蛋白', '改善敏感肌'],
      healthConditions: ['季节性皮肤敏感', '轻度乳糖不耐受'],
      hasBaby: true,
      hasPets: true,
      householdSize: 3,
      budget: { monthly: 5000, flexible: 0.25 },
      lifestyle: { cookingFrequency: '每周5次', exerciseFrequency: '每周3次', commute: '自驾' },
      consumptionHistory: [
        { item: '某品牌花生酱', date: '2025-11', price: 8, regret: true, regretReason: '没看成分表导致过敏', category: '食品' },
        { item: '廉价洗衣液杂牌', date: '2025-12', price: 5, regret: true, regretReason: '香味刺鼻、洗不干净', category: '家居' },
        { item: 'Walmart有机鸡胸肉', date: '2026-01', price: 14, regret: false, category: '食品' },
        { item: 'Dove洗发水', date: '2026-02', price: 7, regret: false, category: '个护' },
        { item: '冲动买的网红护肤品', date: '2026-03', price: 60, regret: true, regretReason: '不适合敏感肌、酒精味重', category: '个护' },
        { item: 'Pampers纸尿裤', date: '2026-04', price: 30, regret: false, category: '母婴' },
        { item: 'Great Value有机牛奶', date: '2026-05', price: 6, regret: false, category: '食品' },
      ],
      blacklist: { brands: ['某网红护肤品牌', '廉价杂牌'], products: ['花生酱', '含酒精护肤品'] },
    };
  }

  _init() {
    this._cacheDom();
    this._renderScenarios();
    this._bindEvents();
    this._updateStatus();
    this._addConversationMsg('system', '🟢 系统就绪 · 请选择左侧场景开始交互');
  }

  _cacheDom() {
    const $ = (s) => document.getElementById(s);
    this.ui.conversation = $('conversation-thread');
    this.ui.scenarioGrid = $('scenario-grid');
    this.ui.startBtn = $('btn-start');
    this.ui.resetBtn = $('btn-reset');
    this.ui.confBar = $('confidence-bar');
    this.ui.confVal = $('confidence-value');
    this.ui.confLabel = $('confidence-label');
    this.ui.humanPanel = $('human-panel');
    this.ui.humanMsg = $('human-message');
    this.ui.humanOptions = $('human-options');
    this.ui.statusConsumer = $('status-consumer');
    this.ui.statusBrand = $('status-brand');
    this.ui.weightDisplay = $('weight-display');
    this.ui.logList = $('log-list');
    this.ui.phaseBadge = $('phase-badge');
  }

  _renderScenarios() {
    const grid = this.ui.scenarioGrid;
    if (!grid) return;
    grid.innerHTML = '';
    Object.values(SCENARIOS).forEach(s => {
      const card = document.createElement('div');
      card.className = 'scenario-card';
      card.dataset.id = s.id;
      card.innerHTML = `<span class="sc-icon">${s.icon}</span><div class="sc-info"><div class="sc-name">${s.name}</div><div class="sc-cat">${s.category}</div></div>`;
      card.addEventListener('click', () => this._selectScenario(s, card));
      grid.appendChild(card);
    });
  }

  _bindEvents() {
    this.ui.startBtn?.addEventListener('click', () => this._start());
    this.ui.resetBtn?.addEventListener('click', () => this._reset());
  }

  _selectScenario(scenario, cardEl) {
    document.querySelectorAll('.scenario-card').forEach(c => c.classList.remove('active'));
    cardEl.classList.add('active');
    this.currentScenario = scenario;
    this.phase = 'ready';
    this.ui.startBtn.disabled = false;
    this.ui.startBtn.textContent = '🚀 开始交互';
    this._clearConversation();
    this._addConversationMsg('system', `📋 场景就绪：${scenario.name}`);
    this._addConversationMsg('system', `"${scenario.description}"`);
    this._updateConfidence(0.90, '就绪');
    this.ui.humanPanel.style.display = 'none';
  }

  // ============ 核心交互流程 ============

  async _start() {
    if (!this.currentScenario) return;
    const s = this.currentScenario;
    this.ui.startBtn.disabled = true;
    this.ui.startBtn.textContent = '⏳ 交互中...';
    this.ui.humanPanel.style.display = 'none';

    // —— Phase 1: 消费者AI发起查询 ——
    this._setPhase('📤 消费者AI查询中');
    const query = this.consumerAI.formulateQuery(s);
    this.currentConvId = query.id;

    this._addConversationMsg('consumer', `
      <div class="msg-title">📤 消费者AI · 查询请求</div>
      <div class="msg-text">${s.initialMessage}</div>
      <div class="msg-detail">预算: $${s.budgetLimit || '不限'} · 约束: ${s.constraints.length}项 · 置信度: ${(this.consumerAI.state.confidence*100).toFixed(0)}%</div>
    `);
    await this._sleep(700);

    // —— Phase 2: 品牌AI接收并处理 ——
    this._setPhase('🔍 沃尔玛智能体匹配中');
    this._addConversationMsg('brand', `
      <div class="msg-title">🏪 沃尔玛智能体 · 收到查询</div>
      <div class="msg-text">正在分析需求，匹配${WALMART_KB.brand.stores.split('，')[0]}的商品库...</div>
    `);
    await this._sleep(600);

    const response = this.brandAI.receiveQuery(query);

    // 展示匹配结果
    const recs = response.recommendations;
    this._addConversationMsg('brand', `
      <div class="msg-title">🏪 沃尔玛智能体 · 推荐方案</div>
      <div class="msg-text">${response.summary.message}</div>
      <div class="product-grid">
        ${recs.slice(0, 4).map((r, i) => `
          <div class="product-mini">
            <span class="pm-rank">#${i+1}</span>
            <span class="pm-name">${r.name}</span>
            <span class="pm-price">$${r.finalPrice || r.price}</span>
            ${r.subscriptionEligible ? '<span class="pm-sub">🔁 订阅省8%</span>' : ''}
          </div>
        `).join('')}
      </div>
      <div class="msg-detail">
        ${response.appliedStrategies.map(s => `<span class="strategy-tag">✅ ${s.reason}</span>`).join('<br>')}
      </div>
    `);
    await this._sleep(800);

    // —— Phase 3: 消费者AI评估 ——
    this._setPhase('🧠 消费者AI评估中');
    const evaluation = this.consumerAI.evaluateRecommendations(
      recs.map(r => ({
        id: r.id, name: r.name, price: r.finalPrice || r.price,
        originalPrice: r.originalPrice || r.price,
        category: r.category, department: r.department,
        tags: r.tags, brand: r.name?.split(' ')[0],
        qualityScore: r.relevance || 0.7,
        convenienceScore: r.stock > 5000 ? 0.85 : 0.6,
        membershipValue: r.membershipValue || 0,
        organic: r.tags?.some(t => /有机|organic/i.test(t)),
        sustainable: r.tags?.some(t => /野生|cage.free|散养/i.test(t)),
        deliveryOptions: r.deliveryOptions,
        subscriptionEligible: r.subscriptionEligible,
        subscriptionPrice: r.subscriptionPrice,
        stock: r.stock,
      }))
    );

    this._updateConfidence(evaluation.confidence, evaluation.canDecide ? '✅ 可决策' : '⚠️ 不确定');

    // 展示评分
    const top3 = evaluation.allScores.slice(0, 3);
    this._addConversationMsg('consumer', `
      <div class="msg-title">🧠 消费者AI · 评估报告</div>
      <div class="score-list">
        ${top3.map((s, i) => `
          <div class="score-row ${i === 0 ? 'top' : ''}">
            <span class="sr-rank">${i+1}</span>
            <span class="sr-name">${s.item.name}</span>
            <span class="sr-bar"><span class="sr-fill" style="width:${(s.totalScore*100).toFixed(0)}%"></span></span>
            <span class="sr-score">${(s.totalScore*100).toFixed(0)}%</span>
          </div>
        `).join('')}
      </div>
      <div class="msg-detail">${evaluation.reasoning}</div>
      <div class="msg-detail">区分度: ${(evaluation.margin*100).toFixed(1)}% · 置信度: ${(evaluation.confidence*100).toFixed(0)}%</div>
    `);
    await this._sleep(700);

    // —— Phase 4: 决策分支 ——
    if (evaluation.canDecide && evaluation.topPick) {
      // AI可以自信决策
      this._addConversationMsg('system', `
        <div class="msg-title">✅ AI自主决策成功</div>
        <div class="msg-text">消费者AI置信度充足(${(evaluation.confidence*100).toFixed(0)}%)，推荐选择<strong>"${evaluation.topPick.item.name}"</strong></div>
      `);
      await this._sleep(500);
      this._finalize(evaluation.topPick);

    } else {
      // 触发人工介入
      this._addConversationMsg('system', `
        <div class="msg-title">🆘 需要人类决策</div>
        <div class="msg-text" style="color:var(--accent-warning)">${evaluation.reasoning}</div>
      `);
      await this._sleep(400);
      this._showHumanIntervention(evaluation);
    }

    this._updateStatus();
  }

  /** 确认成交 */
  _finalize(chosenScore) {
    this._setPhase('🤝 成交确认中');

    // 从品牌AI上下文中获取完整的产品数据（含定价优化）
    const ctx = this.brandAI.state.activeConversations.get(this.currentConvId);
    const enrichedItem = ctx?.optimizedRecommendations?.find(
      p => p.id === chosenScore.item.id
    );
    // 如果有品牌侧优化数据就用优化版，否则用原版
    const finalItem = enrichedItem || chosenScore.item;

    const deal = this.brandAI.confirmDeal(this.currentConvId, finalItem);

    this._addConversationMsg('brand', `
      <div class="msg-title">🎉 沃尔玛智能体 · 成交确认</div>
      <div class="deal-box">
        <div class="deal-item">📦 ${deal.deal.product.name}</div>
        <div class="deal-price">
          <span class="dp-original">$${deal.deal.product.price}</span>
          <span class="dp-arrow">→</span>
          <span class="dp-final">$${deal.deal.product.finalPrice}</span>
          <span class="dp-save">省$${deal.deal.product.savings}</span>
        </div>
        <div class="deal-delivery">🚚 ${deal.deal.delivery.method} · 预计${deal.deal.delivery.estimate} · ${deal.deal.delivery.free ? '免运费' : ''}</div>
        <div class="deal-promos">${(deal.deal.appliedPromos || []).map(p => `<span class="promo-tag">🏷️ ${p}</span>`).join(' ')}</div>
        <div class="deal-wplus">⭐ Walmart+权益：${deal.deal.walmartPlus.join(' · ')}</div>
        <div class="deal-return">↩️ ${deal.deal.returnPolicy}</div>
      </div>
    `);

    // 消费者AI学习
    this.consumerAI.learn(chosenScore, { allScores: [chosenScore] }, { regret: false });
    this._updateConfidence(0.90, '✅ 完成');
    this._updateStatus();
    this._updateLearning();
    this._addLog(`成交: ${deal.deal.product.name} $${deal.deal.product.finalPrice}`);

    this.ui.startBtn.disabled = false;
    this.ui.startBtn.textContent = '🔄 再来一次';
    this._setPhase('✅ 交互完成');
  }

  /** 显示人工介入 */
  _showHumanIntervention(evaluation) {
    const intervention = this.consumerAI.requestHumanIntervention(evaluation);

    this.ui.humanMsg.innerHTML = `
      <div class="human-alert">
        <span class="ha-icon">🆘</span>
        <div>
          <strong>AI决策置信度不足 — 需要您的判断</strong>
          <div style="font-size:13px;margin-top:4px;color:var(--text-secondary)">${intervention.message}</div>
        </div>
      </div>
    `;

    const options = evaluation.allScores.slice(0, 3);
    this.ui.humanOptions.innerHTML = options.map((s, i) => `
      <div class="human-card" onclick="demo._humanChoose('${s.item.id}', '${this.currentConvId}')">
        <div class="hc-rank">${i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}</div>
        <div class="hc-name">${s.item.name}</div>
        <div class="hc-price">$${s.item.finalPrice || s.item.price}</div>
        <div class="hc-score">匹配度: ${(s.totalScore*100).toFixed(0)}%</div>
        <div class="hc-dims">
          ${Object.entries(s.dimensionScores).filter(([,v]) => v > 0.7).map(([k]) => `<span class="dim-tag">${k}</span>`).join(' ')}
        </div>
        <button class="hc-btn">选这个 →</button>
      </div>
    `).join('');

    this.ui.humanPanel.style.display = 'block';
    this.ui.humanPanel.scrollIntoView({ behavior: 'smooth' });
    this._setPhase('👆 等待人类选择');
  }

  /** 人类选择后的处理 */
  _humanChoose(itemId, convId) {
    this.ui.humanPanel.style.display = 'none';

    // 优先从品牌AI上下文中获取已优化的产品数据（含定价优惠等）
    const ctx = this.brandAI.state.activeConversations.get(convId);
    let item = ctx?.optimizedRecommendations?.find(p => p.id === itemId)
            || this._findProduct(itemId);

    if (!item) {
      this._addConversationMsg('system', '⚠️ 未找到所选商品，请重试');
      return;
    }

    this._addConversationMsg('system', `
      <div class="msg-title">👤 人类已选择</div>
      <div class="msg-text">您选择了 <strong>"${item.name}"</strong> — 决策已传达给沃尔玛智能体</div>
    `);

    // 构建选中项的评分结构（供消费者AI学习）
    const chosenScore = {
      item,
      dimensionScores: { quality: 0.9, price: 0.7, convenience: 0.85, brand: 0.8 },
      totalScore: 0.85,
      safetyFlags: [],
    };

    // 消费者AI从人类选择中学习
    this.consumerAI.learn(chosenScore, { allScores: [chosenScore], topPick: chosenScore }, { regret: false });
    setTimeout(() => this._finalize(chosenScore), 500);
  }

  _findProduct(id) {
    for (const [, items] of Object.entries(WALMART_KB.products)) {
      const found = items.find(i => i.id === id);
      if (found) return found;
    }
    return null;
  }

  // ============ UI方法 ============

  _addConversationMsg(type, html) {
    const thread = this.ui.conversation;
    if (!thread) return;
    const div = document.createElement('div');
    div.className = `conv-msg conv-${type}`;
    div.innerHTML = html;
    thread.appendChild(div);
    thread.scrollTop = thread.scrollHeight;
  }

  _clearConversation() {
    if (this.ui.conversation) this.ui.conversation.innerHTML = '';
  }

  _setPhase(text) {
    if (this.ui.phaseBadge) this.ui.phaseBadge.textContent = text;
  }

  _updateConfidence(val, label) {
    const pct = Math.round(val * 100);
    if (this.ui.confBar) {
      this.ui.confBar.style.width = pct + '%';
      this.ui.confBar.style.background = pct > 65 ? 'var(--accent-success)' : pct > 35 ? 'var(--accent-warning)' : 'var(--accent-danger)';
    }
    if (this.ui.confVal) this.ui.confVal.textContent = pct + '%';
    if (this.ui.confLabel) this.ui.confLabel.textContent = label || '';
  }

  _updateStatus() {
    const cs = this.consumerAI.getStatus();
    const bs = this.brandAI.getStatus();
    if (this.ui.statusConsumer) {
      this.ui.statusConsumer.innerHTML = `
        <div>查询: ${cs.totalQueries} | 决策: ${cs.totalDecisions} | 介入率: ${cs.escalationRate}</div>
      `;
    }
    if (this.ui.statusBrand) {
      this.ui.statusBrand.innerHTML = `
        <div>查询: ${bs.totalQueries} | 成交: ${bs.totalConversions} | 转化: ${bs.conversionRate}</div>
      `;
    }
  }

  _updateLearning() {
    const w = this.consumerAI.model.weights;
    if (this.ui.weightDisplay) {
      this.ui.weightDisplay.innerHTML = Object.entries(w)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([k, v]) => `
          <div class="wl-row"><span>${k.replace('_',' ')}</span>
            <span class="wl-bar"><span style="width:${(v*100).toFixed(0)}%"></span></span>
            <span>${(v*100).toFixed(0)}%</span></div>
        `).join('');
    }
  }

  _addLog(msg) {
    if (!this.ui.logList) return;
    const entry = document.createElement('div');
    entry.textContent = `[${new Date().toLocaleTimeString()}] ${msg}`;
    this.ui.logList.prepend(entry);
    if (this.ui.logList.children.length > 10) this.ui.logList.lastChild?.remove();
  }

  _reset() {
    this.currentScenario = null;
    this.currentConvId = null;
    this.phase = 'idle';
    this._clearConversation();
    this._addConversationMsg('system', '🔄 已重置。请选择场景开始。');
    this._updateConfidence(0.90, '就绪');
    this.ui.startBtn.disabled = true;
    this.ui.startBtn.textContent = '🚀 开始交互（请先选择场景）';
    this.ui.humanPanel.style.display = 'none';
    this._setPhase('就绪');
    document.querySelectorAll('.scenario-card').forEach(c => c.classList.remove('active'));
  }

  _sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
}

let demo;
document.addEventListener('DOMContentLoaded', () => {
  demo = new AINegotiationDemo();
  window.demo = demo;
});
