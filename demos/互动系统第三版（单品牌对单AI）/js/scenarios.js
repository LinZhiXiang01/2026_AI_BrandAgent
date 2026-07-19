/**
 * 5大核心交互场景 — Walmart品牌智能体
 */
const SCENARIOS = {
  health_matching: {
    id: 'health_matching',
    name: '🏥 健康适配商品匹配',
    category: '智能匹配',
    icon: '🏥',
    description: '消费者AI上传过敏原、饮食禁忌、健康目标，沃尔玛智能体精准筛选安全商品。',
    complexity: 'medium',
    requirements: ['无花生/海鲜过敏原', '低糖/高蛋白', '成分透明', 'USP/有机认证优先'],
    constraints: ['用户花生过敏、贝类过敏', '追求低糖高蛋白饮食', '偏好有机/天然产品'],
    budgetLimit: 150,
    initialMessage: '我的用户有花生和贝类过敏，同时在执行高蛋白低糖饮食计划。请沃尔玛推荐安全、适配的食品和个人护理产品。',
  },

  price_negotiation: {
    id: 'price_negotiation',
    name: '💰 跨平台价格智能比价',
    category: '价格协商',
    icon: '💰',
    description: '消费者AI提供全网比价数据，沃尔玛智能体以EDLP+会员权益回应。',
    complexity: 'medium',
    requirements: ['55寸4K电视', '降噪耳机', '预算$800以内'],
    constraints: ['Amazon同款电视$528', 'Best Buy耳机$348', 'Target电视$515'],
    budgetLimit: 800,
    initialMessage: '我在比价：Samsung 55" 4K电视 Amazon $528 / Target $515，Sony XM5耳机 Best Buy $348。Walmart能否给到更有竞争力的打包价？',
  },

  auto_replenish: {
    id: 'auto_replenish',
    name: '🔄 固定周期智能补货',
    category: '供应链',
    icon: '🔄',
    description: '双方AI按消耗周期自动规划复购时间和数量，享受订阅折扣。',
    complexity: 'low',
    requirements: ['洗衣液每月1瓶', '纸尿裤每2周1箱', '猫砂每月1袋', '自动计算最优补货窗口'],
    constraints: ['合并配送降低运费', '提前5天提醒确认', '避免囤积过多'],
    budgetLimit: 80,
    initialMessage: '我的家庭日用品消耗：Tide洗衣液(月耗1瓶)、Pampers纸尿裤(双周1箱84片)、Tidy Cats猫砂(月耗1袋35磅)。请规划最优订阅补货方案。',
  },

  after_sales: {
    id: 'after_sales',
    name: '🛡️ 售后纠纷自动协商',
    category: '售后与生命周期',
    icon: '🛡️',
    description: '消费者AI提交产品问题和证据，沃尔玛智能体自动给出退款/换货/维修方案。',
    complexity: 'medium',
    requirements: ['HP笔记本购买60天后屏幕出现亮点', '非人为损坏', '仍在1年保修期内'],
    constraints: ['超过30天退换期', '有完整购买记录和照片证据', '用户倾向换货'],
    budgetLimit: 0,
    initialMessage: '我60天前在Walmart购买的HP Pavilion笔记本屏幕出现3个亮点（非人为），附照片证据。虽然超过30天退换期但在1年保修内，希望申请换货。',
  },

  bundle_custom: {
    id: 'bundle_custom',
    name: '📦 家庭场景套餐定制',
    category: '会员与权益',
    icon: '📦',
    description: '按用户生活场景，沃尔玛智能体生成最优产品组合 + 会员专属权益。',
    complexity: 'high',
    requirements: ['新晋父母，家有新生儿+金毛犬', '需要囤积母婴+宠物+日用', '预算$300以内'],
    constraints: ['纸尿裤(3号)+湿巾+配方奶', '成犬粮(30磅)+猫砂', '厨房纸+垃圾袋+洗洁精', '总预算$300'],
    budgetLimit: 300,
    initialMessage: '我家有新生儿(3个月)和金毛犬。需要一次采购：母婴(纸尿裤3号+湿巾+配方奶)、宠物(Blue Buffalo狗粮30磅+猫砂)、日用(厨房纸+垃圾袋+洗洁精)。预算$300，请给最优组合。',
  },
};

const SCENARIO_CATEGORIES = {
  '智能匹配': ['health_matching'],
  '价格协商': ['price_negotiation'],
  '供应链': ['auto_replenish'],
  '售后与生命周期': ['after_sales'],
  '会员与权益': ['bundle_custom'],
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SCENARIOS, SCENARIO_CATEGORIES };
}
