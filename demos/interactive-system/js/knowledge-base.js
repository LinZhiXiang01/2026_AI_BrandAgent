/**
 * 沃尔玛品牌知识库 — Walmart Brand Knowledge Base
 */
const WALMART_KB = {
  brand: {
    name: '沃尔玛',
    englishName: 'Walmart',
    tagline: 'Save Money. Live Better. — 省钱，省心，生活更好',
    founded: 1962,
    stores: '全球10,500+门店（美国4,700+）',
    ecommerce: 'Walmart.com · Walmart+ 会员 · 当日达/次日达',
    pricingPhilosophy: 'Every Day Low Price (EDLP) — 每日低价',
    aiInitiatives: 'Walmart Global Tech · AI供应链优化 · 智能客服 · 个性化推荐引擎',
  },

  // ========== 产品目录（按品类） ==========
  products: {
    grocery: [
      { id: 'wm-milk-organic', name: 'Great Value 有机全脂牛奶 1加仑', price: 5.98, category: '食品',
        specs: { size: '1加仑', organic: true, shelf_life: '14天' }, stock: 9999, tags: ['有机', '每日必需品'] },
      { id: 'wm-eggs-cagefree', name: 'Marketside 散养鸡蛋 18枚装', price: 6.47, category: '食品',
        specs: { count: 18, cage_free: true, grade: 'AA' }, stock: 9999, tags: ['散养', '高蛋白'] },
      { id: 'wm-bread-wholewheat', name: 'Great Value 100%全麦面包', price: 2.98, category: '食品',
        specs: { slices: 22, whole_grain: true, no_hfcs: true }, stock: 9999, tags: ['全麦', '无高果糖浆'] },
      { id: 'wm-chicken-breast', name: 'Tyson 新鲜鸡胸肉 3磅装', price: 12.99, category: '食品',
        specs: { weight: '3磅', no_antibiotics: true, fresh: true }, stock: 5000, tags: ['高蛋白', '无抗生素'] },
      { id: 'wm-salmon-fillet', name: 'Great Value 野生三文鱼排 2磅', price: 16.98, category: '食品',
        specs: { weight: '2磅', wild_caught: true, frozen: true }, stock: 3000, tags: ['野生', 'Omega-3'] },
      { id: 'wm-almond-milk', name: 'Silk 无糖杏仁奶 半加仑', price: 3.98, category: '食品',
        specs: { size: '半加仑', unsweetened: true, dairy_free: true }, stock: 8000, tags: ['植物基', '无乳糖', '低卡'] },
      { id: 'wm-rice-basmati', name: 'Great Value 巴斯马蒂香米 5磅', price: 8.98, category: '食品',
        specs: { weight: '5磅', type: 'basmati', origin: '印度' }, stock: 6000, tags: ['主食', '进口'] },
      { id: 'wm-avocado-organic', name: '有机牛油果 4枚装', price: 4.98, category: '食品',
        specs: { count: 4, organic: true, origin: '墨西哥' }, stock: 4000, tags: ['有机', '健康脂肪'] },
    ],
    household: [
      { id: 'wm-paper-towel', name: 'Bounty 厨房纸巾 12卷装', price: 24.99, category: '家居',
        specs: { rolls: 12, ply: 2, sheets_per_roll: 110 }, stock: 9999, tags: ['厨房必备', '大包装'] },
      { id: 'wm-detergent-tide', name: 'Tide 洗衣液 原味 100oz', price: 13.97, category: '家居',
        specs: { size: '100oz', loads: 64, he_compatible: true }, stock: 8000, tags: ['清洁', '大容量'] },
      { id: 'wm-trash-bags', name: 'Great Value 垃圾袋 13加仑 80只', price: 9.98, category: '家居',
        specs: { size: '13加仑', count: 80, drawstring: true }, stock: 9999, tags: ['日用', '大包装'] },
      { id: 'wm-dish-soap', name: 'Dawn 洗洁精 原味 56oz', price: 7.97, category: '家居',
        specs: { size: '56oz', grease_fighting: true, concentrated: true }, stock: 9999, tags: ['清洁', '浓缩'] },
    ],
    personal_care: [
      { id: 'wm-shampoo-dove', name: 'Dove 滋养洗发水 25oz', price: 6.98, category: '个护',
        specs: { size: '25oz', sulfate_free: false, for_dry_hair: true }, stock: 7000, tags: ['滋养', '修护'] },
      { id: 'wm-body-wash', name: 'Olay 超保湿沐浴露 22oz', price: 8.97, category: '个护',
        specs: { size: '22oz', shea_butter: true, ph_balanced: true }, stock: 6000, tags: ['保湿', 'pH平衡'] },
      { id: 'wm-toothpaste-sensodyne', name: 'Sensodyne 抗敏感牙膏 4oz', price: 5.97, category: '个护',
        specs: { size: '4oz', sensitivity_protection: true, fluoride: true }, stock: 8000, tags: ['抗敏感', '牙医推荐'] },
      { id: 'wm-sunscreen-neutrogena', name: 'Neutrogena 超薄防晒霜 SPF55 3oz', price: 11.97, category: '个护',
        specs: { size: '3oz', spf: 55, oil_free: true, non_comogenic: true }, stock: 5000, tags: ['防晒', '无油', '不致痘'] },
    ],
    health: [
      { id: 'wm-vitamin-d', name: 'Nature Made 维生素D3 2000IU 120粒', price: 12.98, category: '健康',
        specs: { count: 120, dosage: '2000IU', usp_verified: true }, stock: 9000, tags: ['骨骼健康', 'USP认证'] },
      { id: 'wm-allergy-zyrtec', name: 'Zyrtec 抗过敏药 24小时 90粒', price: 34.98, category: '健康',
        specs: { count: 90, type: 'cetirizine', non_drowsy: true }, stock: 6000, tags: ['抗过敏', '24小时'] },
      { id: 'wm-protein-powder', name: 'Optimum Nutrition 乳清蛋白粉 香草味 2磅', price: 35.98, category: '健康',
        specs: { weight: '2磅', protein_per_serving: '24g', flavors: 'vanilla' }, stock: 4000, tags: ['运动营养', '高蛋白'] },
    ],
    electronics: [
      { id: 'wm-ipad-10th', name: 'Apple iPad 第10代 64GB WiFi', price: 349.00, category: '电子',
        specs: { screen: '10.9"', chip: 'A14', storage: '64GB', wifi: true }, stock: 500, tags: ['平板', 'Apple'] },
      { id: 'wm-tv-samsung-55', name: 'Samsung 55" 4K UHD智能电视', price: 498.00, category: '电子',
        specs: { size: '55"', resolution: '4K UHD', smart: 'Tizen', hdr: true }, stock: 300, tags: ['电视', '4K'] },
      { id: 'wm-headphones-sony', name: 'Sony WH-1000XM5 降噪耳机', price: 328.00, category: '电子',
        specs: { type: 'over-ear', anc: true, battery: '30hrs', bluetooth: '5.3' }, stock: 400, tags: ['降噪', '高端'] },
      { id: 'wm-laptop-hp', name: 'HP Pavilion 15.6" 轻薄本 i5/8GB/256GB', price: 449.00, category: '电子',
        specs: { cpu: 'i5-1335U', ram: '8GB', storage: '256GB SSD', screen: '15.6" FHD' }, stock: 250, tags: ['笔记本', '办公'] },
    ],
    baby: [
      { id: 'wm-diapers-pampers', name: 'Pampers 纸尿裤 超级装 84片', price: 29.98, category: '母婴',
        specs: { size: '3号', count: 84, wetness_indicator: true, hypoallergenic: true }, stock: 9999, tags: ['纸尿裤', '低敏'] },
      { id: 'wm-formula-similac', name: 'Similac 360 Total Care 婴儿配方奶粉 30.8oz', price: 54.98, category: '母婴',
        specs: { size: '30.8oz', stage: '0-12月', hmo_prebiotics: true }, stock: 3000, tags: ['配方奶', 'HMO'] },
      { id: 'wm-baby-wipes', name: 'Huggies 婴儿湿巾 无香 768片', price: 16.98, category: '母婴',
        specs: { count: 768, fragrance_free: true, aloe_vera: true }, stock: 9999, tags: ['湿巾', '无香', '芦荟'] },
    ],
    pet: [
      { id: 'wm-dog-food-blue', name: 'Blue Buffalo 成犬粮 鸡肉味 30磅', price: 49.98, category: '宠物',
        specs: { weight: '30磅', protein: 'chicken', grain_free: false, life_stage: 'adult' }, stock: 4000, tags: ['狗粮', '天然'] },
      { id: 'wm-cat-litter', name: 'Tidy Cats 结团猫砂 35磅', price: 19.98, category: '宠物',
        specs: { weight: '35磅', clumping: true, odor_control: '24/7', dust_free: true }, stock: 8000, tags: ['猫砂', '除臭'] },
    ],
  },

  // ========== 会员体系 ==========
  membership: {
    program: 'Walmart+',
    annualFee: 98,
    monthlyFee: 12.95,
    benefits: [
      '免费无限次送货（$35+订单）',
      '加油每加仑省$0.10',
      'Paramount+ 免费订阅',
      '提前30分钟抢购限时优惠',
      '手机扫码结账（Scan & Go）',
      '免费线上退货上门取件',
    ],
    userTier: 'Walmart+',
    points: 0, // Walmart+ 不基于积分，而是固定会员费
    storedValue: 50, // Walmart Pay余额
    giftCards: [
      { id: 'gc001', balance: 25, expiry: null },
    ],
  },

  // ========== 服务能力 ==========
  services: {
    delivery: ['当日达', '次日达', '2小时极速达', '门店自提', '路边取货'],
    payment: ['Walmart Pay', '信用卡', '借记卡', 'PayPal', 'Affirm分期'],
    returns: '90天无忧退换（大部分商品）',
    pharmacy: '处方药配送 · 健康咨询 · 疫苗接种',
    auto: '汽车保养中心 · 轮胎安装 · 电瓶更换',
    photo: '照片打印 · 护照照片 · 定制礼品',
  },

  // ========== 协商策略 ==========
  negotiationStrategies: [
    { id: 'edlp_match', name: '每日低价匹配', desc: 'Walmart EDLP保证 — 如发现更低价格自动退差价', type: 'pricing' },
    { id: 'bundle_save', name: '组合省更多', desc: '同品类多件额外折扣，家庭装/大包装自动推荐', type: 'bundle' },
    { id: 'wplus_benefit', name: 'Walmart+ 专属价', desc: '会员专享价格 + 免运费 + 提前抢购', type: 'membership' },
    { id: 'rollback', name: '限时降价回馈', desc: 'Rollback 标志商品 — 临时降价，售完即止', type: 'promo' },
    { id: 'subscription_save', name: '订阅省', desc: '定期配送订阅可享额外5-10%折扣', type: 'subscription' },
    { id: 'pickup_discount', name: '自提优惠', desc: '选择门店自提可减免$5-10配送费', type: 'fulfillment' },
    { id: 'bulk_tier', name: '大宗采购阶梯价', desc: '批量采购达量享阶梯折扣', type: 'b2b' },
    { id: 'trade_in', name: '以旧换新折抵', desc: '旧电子产品回收折抵购新', type: 'sustainability' },
  ],

  // ========== 学习状态 ==========
  learningState: {
    totalInteractions: 0,
    totalConversions: 0,
    strategyPerformance: {},
    productAffinityMap: {},   // 品类偏好 → 复购率
    userSegmentInsights: {},  // 用户分群洞察
  },
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = WALMART_KB;
}
