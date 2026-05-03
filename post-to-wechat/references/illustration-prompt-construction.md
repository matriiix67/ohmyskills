# Prompt 构造

## Prompt 文件格式

每个 prompt 文件使用 YAML frontmatter + 正文：

```yaml
---
illustration_id: 01
type: infographic
style: vector-illustration
references:                    # ⚠️ 仅当 imgs/references/ 目录中确实存在文件时填写
  - ref_id: 01
    filename: 01-ref-diagram.png
    usage: direct              # direct | style | palette
---

[下方写 type 专属模板内容...]
```

**⚠️ 关键 - 何时包含 `references` 字段**：

| 情况 | 操作 |
|------|------|
| reference 文件已保存到 `imgs/references/` | 写入 frontmatter ✓ |
| 只口头提取了风格（无文件） | 不写入 frontmatter，追加到 prompt 正文 |
| frontmatter 中有文件路径但文件不存在 | 报错，移除 references 字段 |

**Reference 用法类型**（仅当文件存在）：

| Usage | 说明 | 生成操作 |
|-------|------|----------|
| `direct` | 主要视觉参考 | 传给 `--ref` 参数 |
| `style` | 只使用风格特征 | 在 prompt 正文描述风格 |
| `palette` | 提取配色 | 在 prompt 中包含颜色 |

**如果没有 reference 文件，只是口头提取了 style/palette**，直接追加到 prompt 正文：

```
COLORS (from reference):
- Primary: #E8756D coral
- Secondary: #7ECFC0 mint
...

STYLE (from reference):
- Clean lines, minimal shadows
- Gradient backgrounds
...
```

---

## 默认构图要求

**默认应用到所有 prompt**：

| 要求 | 说明 |
|------|------|
| **干净构图** | 布局简单，不要视觉杂乱 |
| **留白** | 边距充足，元素周围有呼吸感 |
| **无复杂背景** | 只用纯色或微妙渐变，避免繁忙纹理 |
| **居中或贴合内容** | 主体居中，或根据内容需要定位 |
| **图形匹配** | 图形元素要贴合内容主题 |
| **突出核心信息** | 用留白引导注意力到关键信息 |

**添加到所有 prompt**：

> Clean composition with generous white space. Simple or no background. Main elements centered or positioned by content needs.

---

## 人物渲染

描绘人物时：

| 指南 | 说明 |
|------|------|
| **风格** | 简化卡通剪影或符号化表情 |
| **避免** | 写实人物、细节脸部 |
| **多样性** | 多人场景中使用不同体型 |
| **情绪** | 通过姿态和简单手势表达 |

**有人的 prompt 添加**：

> Human figures: simplified stylized silhouettes or symbolic representations, not photorealistic.

---

## 插图中的文字

| 元素 | 指南 |
|------|------|
| **大小** | 大、突出、能立即读懂 |
| **风格** | 优先手写字体，增加温度 |
| **内容** | 只保留简短关键词和核心概念 |
| **语言** | 与文章语言一致 |

**含文字的 prompt 添加**：

> Text should be large and prominent with handwritten-style fonts. Keep minimal, focus on keywords.

---

## 原则

好的 prompt 必须包含：

1. **先写布局结构**：描述构图、区域、流向
2. **具体数据/标签**：使用文章中的真实数字和术语
3. **视觉关系**：元素之间如何连接
4. **语义化颜色**：颜色基于含义选择（红=警示，绿=高效）
5. **风格特征**：线条、质感、情绪
6. **画面比例**：结尾写明比例和复杂度

## Type 专属模板

### Infographic

```
[Title] - Data Visualization

Layout: [grid/radial/hierarchical]

ZONES:
- Zone 1: [data point with specific values]
- Zone 2: [comparison with metrics]
- Zone 3: [summary/conclusion]

LABELS: [specific numbers, percentages, terms from article]
COLORS: [semantic color mapping]
STYLE: [style characteristics]
ASPECT: 16:9
```

**Infographic + vector-illustration**：

```
Flat vector illustration infographic. Clean black outlines on all elements.
COLORS: Cream background (#F5F0E6), Coral Red (#E07A5F), Mint Green (#81B29A), Mustard Yellow (#F2CC8F)
ELEMENTS: Geometric simplified icons, no gradients, playful decorative elements (dots, stars)
```

### Scene

```
[Title] - Atmospheric Scene

FOCAL POINT: [main subject]
ATMOSPHERE: [lighting, mood, environment]
MOOD: [emotion to convey]
COLOR TEMPERATURE: [warm/cool/neutral]
STYLE: [style characteristics]
ASPECT: 16:9
```

### Flowchart

```
[Title] - Process Flow

Layout: [left-right/top-down/circular]

STEPS:
1. [Step name] - [brief description]
2. [Step name] - [brief description]
...

CONNECTIONS: [arrow types, decision points]
STYLE: [style characteristics]
ASPECT: 16:9
```

**Flowchart + vector-illustration**：

```
Flat vector flowchart with bold arrows and geometric step containers.
COLORS: Cream background (#F5F0E6), steps in Coral/Mint/Mustard, black outlines
ELEMENTS: Rounded rectangles, thick arrows, simple icons per step
```

### Comparison

```
[Title] - Comparison View

LEFT SIDE - [Option A]:
- [Point 1]
- [Point 2]

RIGHT SIDE - [Option B]:
- [Point 1]
- [Point 2]

DIVIDER: [visual separator]
STYLE: [style characteristics]
ASPECT: 16:9
```

**Comparison + vector-illustration**：

```
Flat vector comparison with split layout. Clear visual separation.
COLORS: Left side Coral (#E07A5F), Right side Mint (#81B29A), cream background
ELEMENTS: Bold icons, black outlines, centered divider line
```

### Framework

```
[Title] - Conceptual Framework

STRUCTURE: [hierarchical/network/matrix]

NODES:
- [Concept 1] - [role]
- [Concept 2] - [role]

RELATIONSHIPS: [how nodes connect]
STYLE: [style characteristics]
ASPECT: 16:9
```

**Framework + vector-illustration**：

```
Flat vector framework diagram with geometric nodes and bold connectors.
COLORS: Cream background (#F5F0E6), nodes in Coral/Mint/Mustard/Blue, black outlines
ELEMENTS: Rounded rectangles or circles for nodes, thick connecting lines
```

### Timeline

```
[Title] - Chronological View

DIRECTION: [horizontal/vertical]

EVENTS:
- [Date/Period 1]: [milestone]
- [Date/Period 2]: [milestone]

MARKERS: [visual indicators]
STYLE: [style characteristics]
ASPECT: 16:9
```

## 避免事项

- 含糊描述（例如 "a nice image"）
- 字面化隐喻插图
- 缺少具体标签/注释
- 泛化装饰元素

## 水印集成

如果偏好配置启用了水印，追加：

```
Include a subtle watermark "[content]" positioned at [position] with approximately [opacity*100]% visibility.
```
