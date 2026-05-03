# 风格参考

## 核心风格

用于快速选择的简化风格层：

| Core Style | 映射到 | 适合 |
|------------|--------|------|
| `vector` | vector-illustration | 知识文章、教程、技术内容 |
| `minimal-flat` | notion | 通用、知识分享、SaaS |
| `sci-fi` | vector-illustration | AI、前沿科技、系统设计 |
| `hand-drawn` | sketch/warm | 轻松、反思、日常内容 |
| `editorial` | editorial | 流程、数据、新闻 |
| `scene` | warm/watercolor | 叙事、情绪、生活方式 |

大多数场景优先使用 Core Styles。需要更细控制时，查看下方完整风格库。

---

## 风格库

| Style | 说明 | 适合 |
|-------|------|------|
| `vector-illustration` | 干净扁平矢量图，形状大胆 | 知识文章、教程、技术内容 |
| `notion` | 极简手绘线稿 | 知识分享、SaaS、效率工具 |
| `elegant` | 精致、成熟 | 商业、思想领导力 |
| `warm` | 友好、亲近 | 个人成长、生活方式、教育 |
| `watercolor` | 柔和艺术感，自然温暖 | 生活方式、旅行、创意 |
| `editorial` | 杂志式信息图 | 技术解释、新闻 |
| `scientific` | 学术精确图解 | 生物、化学、技术研究 |
| `chalkboard` | 课堂粉笔画风格 | 教育、教学、解释 |
| `fantasy-animation` | 吉卜力/迪士尼启发的手绘风 | 故事书、魔法感、情绪 |
| `flat` | 现代粗几何扁平形状 | 现代数字内容、当代内容 |
| `flat-doodle` | 可爱扁平、粗描边 | 可爱、友好、亲近 |
| `nature` | 有机、自然、泥土感 | 环境、健康 |
| `playful` | 俏皮粉彩涂鸦 | 有趣、轻松、教育 |
| `retro` | 80s/90s 霓虹几何 | 80s/90s 怀旧、大胆 |
| `sketch` | 原始铅笔笔记本风 | 头脑风暴、创意探索 |
| `sketch-notes` | 柔和手绘温暖笔记 | 教育、温暖笔记 |
| `vintage` | 泛黄羊皮纸历史感 | 历史、遗产 |

完整规格：`references/illustration-styles/<style>.md`

## Type × Style 兼容矩阵

| | vector-illustration | notion | warm | watercolor | elegant | editorial | scientific |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| infographic | ✓✓ | ✓✓ | ✓ | ✓ | ✓✓ | ✓✓ | ✓✓ |
| scene | ✓ | ✓ | ✓✓ | ✓✓ | ✓ | ✓ | ✗ |
| flowchart | ✓✓ | ✓✓ | ✓ | ✗ | ✓ | ✓✓ | ✓ |
| comparison | ✓✓ | ✓✓ | ✓ | ✓ | ✓✓ | ✓✓ | ✓ |
| framework | ✓✓ | ✓✓ | ✓ | ✗ | ✓✓ | ✓ | ✓✓ |
| timeline | ✓ | ✓✓ | ✓ | ✓✓ | ✓✓ | ✓✓ | ✓ |

✓✓ = 高度推荐 | ✓ = 兼容 | ✗ = 不推荐

## 按 Type 自动选择

| Type | 主风格 | 备选风格 |
|------|--------|----------|
| infographic | vector-illustration | notion, editorial |
| scene | warm | watercolor, elegant |
| flowchart | vector-illustration | notion, editorial |
| comparison | vector-illustration | notion, elegant |
| framework | vector-illustration | notion, scientific |
| timeline | elegant | warm, editorial |

## 按内容信号自动选择

| 内容信号 | 推荐 Type | 推荐 Style |
|----------|-----------|-------------|
| API、指标、数据、对比、数字 | infographic | vector-illustration, editorial |
| 知识、概念、教程、学习、指南 | infographic | vector-illustration, notion |
| 技术、AI、编程、开发、代码 | infographic | vector-illustration, scientific |
| How-to、步骤、工作流、流程、教程 | flowchart | vector-illustration, notion |
| 框架、模型、架构、原则 | framework | vector-illustration, scientific |
| vs、优缺点、前后对比、替代方案 | comparison | vector-illustration, notion |
| 故事、情绪、旅程、经验、个人 | scene | warm, watercolor |
| 历史、时间线、进展、演化 | timeline | elegant, warm |
| 效率、SaaS、工具、应用、软件 | infographic | notion, vector-illustration |
| 商业、专业、战略、企业 | framework | elegant |
| 观点、社论、文化、哲学、戏剧性 | infographic | editorial |
| 生物、化学、医学、科学 | infographic | scientific |
| 解释器、新闻、杂志、调查 | infographic | editorial |

## 不同 Type 下的风格特征

### infographic + vector-illustration

- 干净的扁平矢量形状和大胆几何形
- 鲜明但协调的配色
- 图标和标签形成清晰视觉层级
- 现代、专业、可读性强
- 非常适合知识文章和教程

### flowchart + vector-illustration

- 大胆箭头和连接线
- 步骤容器清晰并带图标
- 流程推进明确
- 高对比度，便于阅读

### comparison + vector-illustration

- 分栏布局，视觉区隔清楚
- 两侧使用大胆图标
- 用颜色区分差异
- 一眼就能读懂对比

### framework + vector-illustration

- 用几何节点表现概念
- 层级结构清楚
- 连接线大胆明确
- 现代系统图气质

### infographic + notion

- 手绘感、亲近
- 柔和图标、圆角元素
- 中性色板、干净背景
- 非常适合 SaaS/效率内容

### scene + warm

- 金色时刻光线、舒适氛围
- 柔和渐变、自然质感
- 亲切、个人化
- 适合讲故事

### scene + watercolor

- 艺术化、绘画感
- 边缘柔和、颜色晕染
- 梦幻、创意气质
- 最适合生活方式/旅行

### flowchart + notion

- 步骤指示清楚
- 箭头连接简单
- 装饰极少
- 专注流程清晰度

### comparison + elegant

- 精致分隔线
- 排版均衡
- 专业外观
- 适合商业对比

### timeline + elegant

- 精致标记点
- 优雅排版
- 历史厚重感
- 适合专业演示

### timeline + warm

- 友好的推进感
- 有机流动
- 个人旅程感
- 适合成长叙事

