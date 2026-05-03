# 风格预设

`--preset X` 会展开为 type + style 组合。用户可以覆盖任一维度。

## 按类别

### 技术与工程

| --preset | Type | Style | 适合 |
|----------|------|-------|----------|
| `tech-explainer` | `infographic` | `vector-illustration` | API 文档、系统指标、技术深度解析 |
| `system-design` | `framework` | `vector-illustration` | 架构图、系统设计 |
| `architecture` | `framework` | `vector-illustration` | 组件关系、模块结构 |
| `science-paper` | `infographic` | `scientific` | 研究发现、实验结果、学术内容 |

### 知识与教育

| --preset | Type | Style | 适合 |
|----------|------|-------|----------|
| `knowledge-base` | `infographic` | `vector-illustration` | 概念解释、教程、操作指南 |
| `saas-guide` | `infographic` | `notion` | 产品指南、SaaS 文档、工具演示 |
| `tutorial` | `flowchart` | `vector-illustration` | 分步教程、设置指南 |
| `process-flow` | `flowchart` | `notion` | 工作流文档、入门流程 |

### 数据与分析

| --preset | Type | Style | 适合 |
|----------|------|-------|----------|
| `data-report` | `infographic` | `editorial` | 数据新闻、指标报告、仪表盘 |
| `versus` | `comparison` | `vector-illustration` | 技术对比、框架横评 |
| `business-compare` | `comparison` | `elegant` | 产品评估、战略选项 |

### 叙事与创意

| --preset | Type | Style | 适合 |
|----------|------|-------|----------|
| `storytelling` | `scene` | `warm` | 个人随笔、反思、成长故事 |
| `lifestyle` | `scene` | `watercolor` | 旅行、健康、生活方式、创意 |
| `history` | `timeline` | `elegant` | 历史概览、里程碑 |
| `evolution` | `timeline` | `warm` | 进展叙事、成长旅程 |

### 社论与观点

| --preset | Type | Style | 适合 |
|----------|------|-------|----------|
| `opinion-piece` | `infographic` | `editorial` | 专栏、评论、批判性文章 |
| `editorial-poster` | `comparison` | `editorial` | 辩论、对立观点 |
| `cinematic` | `scene` | `warm` | 戏剧性叙事、文化随笔 |

## 内容类型 → Preset 推荐

在 Step 3 中，根据 Step 2 的内容分析使用此表推荐 preset：

| 内容类型（Step 2） | 主推荐 Preset | 备选 |
|------------------------|----------------|--------------|
| Technical | `tech-explainer` | `system-design`, `architecture` |
| Tutorial | `tutorial` | `process-flow`, `knowledge-base` |
| Methodology / Framework | `system-design` | `architecture`, `process-flow` |
| Data / Metrics | `data-report` | `versus`, `tech-explainer` |
| Comparison / Review | `versus` | `business-compare`, `editorial-poster` |
| Narrative / Personal | `storytelling` | `lifestyle`, `evolution` |
| Opinion / Editorial | `opinion-piece` | `cinematic`, `editorial-poster` |
| Historical / Timeline | `history` | `evolution` |
| Academic / Research | `science-paper` | `tech-explainer`, `data-report` |
| SaaS / Product | `saas-guide` | `knowledge-base`, `process-flow` |

## 覆盖示例

- `--preset tech-explainer --style notion` = infographic type + notion style
- `--preset storytelling --type timeline` = timeline type + warm style

显式传入的 `--type` / `--style` 参数总是覆盖 preset 值。
