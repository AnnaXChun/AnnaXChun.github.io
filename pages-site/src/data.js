// Personal facts and captions are retained from the current public portfolio.
// Unused LegacyHome claims are deliberately excluded.
export const profile = {
  name: '椿襄',
  romanizedName: 'CHUNXIANG',
  role: 'Agent 开发、后训练算法工程师',
  education: '武汉大学软件工程背景',
  personality: 'ENFP',
  portrait: './assets/chunxiang-casual-portrait-v1.png',
  email: 'mshuwhu@whu.edu.cn',
  phone: '+86 182 8942 3880',
  phoneHref: 'tel:+8618289423880',
  introduction: '我喜欢有反馈的事情。代码会报错，球会落地，镜头会告诉你哪里拖沓。观察、调整，再试一次，这是我熟悉的节奏。',
  biography: '我关注智能体如何调用工具、从反馈中学习，以及后训练方法如何进入完整的工程系统。曾在字节跳动国际商业化部门从事 Agent 开发实习，也有后端研发、支付链路与数据库设计的项目经历。',
};

export const projects = [
  {
    id: 'agent',
    title: 'SFT / GRPO 与生命科学推理',
    category: '重点项目 · 后训练与智能体',
    organization: '生命科学多步推理',
    period: null,
    featured: true,
    image: './assets/verl-architecture.webp',
    imageAlt: 'VeRL 官方架构参考图：模型引擎、智能体循环、推理服务和训练控制器',
    imageCredit: 'VeRL 官方架构参考',
    summary: '基于 Verl 重写工具调用循环，识别 Python Markdown 代码块并触发安全执行，以 SFT 与 GRPO 增强垂直领域多步推理。',
    details: '从模型训练延伸到工具协议、沙箱执行和推理评估，将推理能力接入可执行的智能体系统。',
    stack: ['Verl', 'Agent Loop', 'Python', 'SFT', 'GRPO', 'Docker'],
    proof: '工具调用循环、安全执行和推理评估共同构成可验证的研发过程。',
  },
  {
    id: 'bytedance-agent',
    title: '字节跳动 · Agent 开发实习',
    category: '实习经历 · 国际商业化',
    organization: '字节跳动国际商业化部门',
    period: null,
    summary: '曾在字节跳动国际商业化部门实习，从事 Agent 开发。',
    stack: ['Agent 开发', '国际商业化'],
  },
  {
    id: 'taikang',
    title: '从数据库设计，到完整上线。',
    category: '企业实习 · 后端开发',
    organization: '武汉泰康科技有限公司',
    period: '2025.03 — 2025.07',
    image: './assets/taikang-code-review.webp',
    imageAlt: '泰康实习中的后端代码、MySQL 执行计划与测试结果',
    summary: '参与需求评审、业务表结构和 RESTful API 设计，完成页面联调、测试与部署。用 EXPLAIN、联合索引和查询重构处理慢查询。',
    details: '编写并调优复杂 SQL，与前端核对页面交互和接口契约，覆盖功能测试、回归测试、部署及问题跟踪。',
    stack: ['MySQL', 'RESTful API', 'EXPLAIN', '联合索引', '前后端联调'],
    proof: '覆盖需求评审、技术方案、数据库设计、编码、联调、测试与部署的完整研发周期。',
  },
  {
    id: 'sailing',
    title: '中帆协官网与支付链路',
    category: '国家级生产项目',
    organization: '中国帆船帆板运动协会',
    period: '2023.05 — 2025.07',
    image: './assets/chinasailing-site.webp',
    imageAlt: '中国帆船帆板运动协会官网页面及帆船赛事画面',
    summary: '持续迭代协会官网，接入支付宝与微信支付。以锁机制、状态机和熔断策略保障关键交易链路。',
    details: '围绕高流量场景设计稳定的接口、数据和降级策略，持续承担研发、维护、排障与交付。',
    stack: ['ThinkPHP', 'Vue 3', 'Spring Boot', 'MySQL', '支付系统'],
    proof: '真实生产系统，覆盖研发、维护、排障与持续交付。',
    supportingImage: './assets/payment-flow.webp',
    supportingLabel: '支付链路示意图',
  },
  {
    id: 'digital-twin',
    title: '数字孪生三维重建',
    category: '团队项目 · 空间计算',
    organization: '虚实智联',
    period: null,
    image: './assets/design-digital-twin-first.webp',
    imageAlt: '数字孪生三维人体重建项目的计算机设计大赛中南地区赛一等奖证书',
    summary: '围绕三维人体重建完成虚实融合系统，负责技术路线、团队协作与交付推进，以工程实现验证空间计算方案。',
    details: '项目名称为「虚实智联：基于数字孪生的三维人体重建系统」。',
    stack: ['三维重建', '数字孪生', '人工智能', '系统集成'],
    proof: '获 2025 年计算机设计大赛中南地区赛一等奖。',
  },
];

export const capabilities = [
  { title: '后训练与智能体', items: ['Agent Loop / 多工具路由', 'Verl / SFT / GRPO', '提示工程与垂直知识组织', '自动评测与异常回退'] },
  { title: '人工智能协作', items: ['Codex / Claude Code', 'LangChain / Llama', 'Skill / MCP / 上下文工程', '原型、重构、测试与部署'] },
  { title: '全栈与数据', items: ['Java / Python / C++', 'ThinkPHP / Vue 3 / Spring Boot', 'MySQL 表结构、SQL 与索引治理', '前后端联调、功能与回归测试'] },
  { title: '表达与协作', items: ['需求澄清、边界定义与任务拆分', '演示叙事、视频剪辑与信息取舍', '团队分工、节点推进与风险沟通', '知识内容沉淀与 SOP 复用'] },
];

export const methods = [
  { title: '先拆业务闭环', description: '核对用户、页面、接口、数据与异常路径，再写清验收条件。' },
  { title: '让想法接受验证', description: '用人工智能协作完成调研、原型、测试和排障，保留技术方案、代码审查与人工验收。' },
  { title: '用证据复核结果', description: '对照测试、日志和页面验收，准备回滚方案，再把经验整理成 SOP。' },
];

export const interests = [
  { id: 'badminton', title: '羽毛球', note: '预判与节奏', description: '读拍面、看重心，再决定下一步。享受单打的节奏，也重视双打里的补位、喊球和默契。' },
  { id: 'training', title: '健身', note: '动作与状态', description: '根据恢复调整重量与组数，优先保证动作质量。稳定出勤，认真对待长期状态。' },
  { id: 'editing', title: '视频剪辑', note: '叙事与取舍', description: '先找故事落点，再选素材、音乐和节奏。愿意删掉喜欢却多余的镜头，让表达更清楚。' },
];

export const experiment = {
  title: '个人建站产品与技术内容',
  status: '持续探索中',
  description: '用人工智能协作开发类似 Carrd 的个人建站产品，从需求、页面到测试、部署持续迭代。同时经营知识星球与个人技术内容，记录开发日志、疑难问题、Skill 和 SOP。',
};

export const awards = [
  { id: 'xiaomi-2025', year: '2025', title: '小米杯全国一等奖', category: '竞赛', meta: '队长 · DeepDog', image: './assets/xiaomi-2025-first.webp', description: '全国大学生计算机系统能力大赛智能系统创新设计赛，DeepDog 项目。' },
  { id: 'patent', year: '2025', title: '发明专利申请受理', category: '研究与专利', meta: '国家知识产权局', image: './assets/patent-acceptance.webp', description: '非接触式货币真伪检测方法、系统、装置及存储介质。当前材料为申请受理通知。' },
  { id: 'mobicom', year: null, title: 'MobiCom 论文成果', category: '研究与专利', meta: 'CCF-A · 学术研究', image: './assets/mobicom-paper.webp', description: '基于眨眼运动学与临床知识蒸馏的居家干眼评估研究。' },
  { id: 'mcm', year: '2025', title: '数学建模竞赛 Finalist', category: '竞赛', meta: 'MCM', image: './assets/mcm-finalist.webp', description: '美国大学生数学建模竞赛 Finalist，完成复杂问题建模与协作交付。' },
  { id: 'design-first', year: '2025', title: '计算机设计大赛一等奖', category: '竞赛', meta: '中南地区赛 · 数字孪生', image: './assets/design-digital-twin-first.webp', description: '虚实智联：基于数字孪生的三维人体重建系统。' },
  { id: 'design-second', year: '2025', title: '计算机设计大赛二等奖', category: '竞赛', meta: '中南地区赛 · 诗品', image: './assets/design-poetry-second.webp', description: '诗品：人工智能诗词创作助手。' },
  { id: 'polardb', year: '2024', title: 'PolarDB 外卡优胜奖', category: '竞赛', meta: '数据库创新设计赛', image: './assets/polardb-award.webp', description: '全国大学生计算机系统能力大赛 PolarDB 数据库创新设计赛。' },
  { id: 'xiaomi-2024', year: '2024', title: '小米杯全国三等奖', category: '竞赛', meta: '智能系统创新设计赛', image: './assets/xiaomi-2024-third.webp', description: '全国大学生计算机系统能力大赛智能系统创新设计赛。' },
];
