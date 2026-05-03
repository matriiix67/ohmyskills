# 详细工作流

## Step 1：预检查

### 1.0 检测并保存参考图片 ⚠️ 如用户提供图片则必做

| 输入类型 | 操作 |
|----------|------|
| 用户上传图片文件 | 复制到 `imgs/references/NN-ref-{slug}.png` |
| 用户给出图片路径 | 复制到 `imgs/references/NN-ref-{slug}.png` |
| 只描述了参考风格 | 不写入 prompt frontmatter；将风格说明追加到 prompt 正文 |

**关键**：只有当 reference 文件确实保存到了 `imgs/references/` 目录时，才允许在 prompt frontmatter 中加入 `references` 字段。

保存 reference 时：

1. 目视分析图片，提取颜色、风格、构图。
2. 生成短 slug，例如 `brand-diagram`、`color-chart`。
3. 保存为 `imgs/references/NN-ref-{slug}.png`。
4. 同步保存说明文件 `imgs/references/NN-ref-{slug}.md`。

**说明文件格式**（仅当文件已保存）：

```yaml
---
ref_id: 01
filename: NN-ref-{slug}.png
usage: direct | style | palette
---

视觉特征：[颜色、线条、构图、质感]
适用位置：[可用于哪些插图]
```

汇报示例：

```
已保存参考图片：
- 01-ref-diagram.png：direct → Illustration 1, 3
- 02-ref-chart.png：palette → Illustration 2
```

如果只是提取风格而没有文件：

```
已提取参考风格（无文件）：
- 颜色：#E8756D、#7ECFC0
- 风格：minimal flat vector、clean lines
```

### 1.1 确定输出目录

`post-to-wechat` 的文章工作区固定在临时目录 `/tmp/post-to-wechat/YYYY-MM-DD/<slug>/`。配图输出目录固定为该工作区的 `imgs/`。所有 outline、prompt、reference 和生成图片都放在临时工作区下，方便后续发布脚本解析封面和正文图片，同时避免持续扩大 skill 仓库目录。

| 内容 | 路径 |
|------|------|
| 文章工作区 | `/tmp/post-to-wechat/YYYY-MM-DD/<slug>/` |
| 封面图 | `/tmp/post-to-wechat/YYYY-MM-DD/<slug>/imgs/cover.png` |
| 正文插图 | `/tmp/post-to-wechat/YYYY-MM-DD/<slug>/imgs/NN-{type}-{slug}.png` |
| 配图大纲 | `/tmp/post-to-wechat/YYYY-MM-DD/<slug>/imgs/outline.md` |
| Prompt 文件 | `/tmp/post-to-wechat/YYYY-MM-DD/<slug>/imgs/prompts/NN-{type}-{slug}.md` |
| Reference 文件 | `/tmp/post-to-wechat/YYYY-MM-DD/<slug>/imgs/references/NN-ref-{slug}.png` |

### 1.2 加载偏好配置（EXTEND.md）

配图偏好统一从 `.post-to-wechat/EXTEND.md` 读取。缺少相关字段时使用默认值，不为配图再触发独立首次设置。

```bash
# macOS、Linux、WSL、Git Bash
test -f .post-to-wechat/EXTEND.md && echo "project"
test -f "${XDG_CONFIG_HOME:-$HOME/.config}/post-to-wechat/EXTEND.md" && echo "xdg"
test -f "$HOME/.post-to-wechat/EXTEND.md" && echo "user"
```

```powershell
# PowerShell（Windows）
if (Test-Path .post-to-wechat/EXTEND.md) { "project" }
$xdg = if ($env:XDG_CONFIG_HOME) { $env:XDG_CONFIG_HOME } else { "$HOME/.config" }
if (Test-Path "$xdg/post-to-wechat/EXTEND.md") { "xdg" }
if (Test-Path "$HOME/.post-to-wechat/EXTEND.md") { "user" }
```

| 结果 | 操作 |
|------|------|
| 找到 | 读取、解析、展示摘要，然后继续 |
| 未找到 | 使用配图默认值继续；主发布流程的首次设置由 `post-to-wechat` Step 0 处理 |

**支持项**：水印、偏好 type/style、自定义 style、语言、默认生成数量。

---

## Step 2：设置与分析

### 2.1 分析内容

| 分析项 | 说明 |
|--------|------|
| 内容类型 | Technical / Tutorial / Methodology / Narrative |
| 插图目的 | information / visualization / imagination |
| 核心论点 | 需要视觉化的 2-5 个主要观点 |
| 视觉机会 | 插图能增加价值的位置 |
| 推荐 type | 基于内容信号和用途 |
| 推荐 density | 基于文章长度和复杂度 |

### 2.2 提取核心论点

- 主旨
- 读者需要理解的关键概念
- 对比/反差
- 文章提出的框架/模型

**关键**：如果文章使用隐喻（例如“电锯切西瓜”），不要按字面画图。应视觉化**底层概念**。

### 2.3 识别插图位置

**应该配图**：

- 核心论点（必需）
- 抽象概念
- 数据对比
- 流程、工作流

**不要配图**：

- 字面化隐喻
- 装饰性场景
- 泛泛而谈的插图

### 2.4 分析参考图片（如 Step 1.0 提供）

对每张参考图片分析：

| 分析项 | 说明 |
|--------|------|
| 视觉特征 | 风格、颜色、构图 |
| 内容/主体 | reference 描绘了什么 |
| 适合位置 | 哪些段落适合使用该 reference |
| 风格匹配 | 与哪些 type/style 匹配 |
| 使用建议 | `direct` / `style` / `palette` |

| 用法 | 何时使用 |
|------|----------|
| `direct` | reference 与目标输出高度接近 |
| `style` | 只提取视觉风格特征 |
| `palette` | 只提取配色 |

---

## Step 3：确认设置或自动选择 ⚠️

如果用户只是请求配图，进入**交互配图模式**：只调用一次 AskUserQuestion，最多 4 个问题。**Q1、Q2、Q3 都是必问**。

如果用户已经明确授权发布到微信公众号，或主流程已经进入 URL/X 串行发布流程，进入**自动发布模式**：不要再询问用户；按 EXTEND.md、内容分析和下方默认规则自动选择，直到发布完成。

### Q1：Preset 或 Type

基于 Step 2 的内容分析，优先推荐 preset（同时确定 type 和 style）。查阅 [illustration-style-presets.md](illustration-style-presets.md) 中的 “Content Type → Preset Recommendations” 表。

- [推荐 preset] — [简述：type + style + 原因]（推荐）
- [备选 preset] — [简述]
- 或手动选择 type：infographic / scene / flowchart / comparison / framework / timeline / mixed

**如果用户选择 preset → 跳过 Q3**（type 和 style 都已确定）。
**如果用户选择 type → Q3 必问。**

自动发布模式下：基于内容类型选择推荐 preset；如果无法判断，使用 `mixed` type。

### Q2：Density

- minimal (1-2) - 只覆盖核心概念
- balanced (3-5) - 覆盖主要章节
- per-section - 每个章节/小节至少 1 张（推荐）
- rich (7+) - 全面覆盖

自动发布模式下：URL/X 流程使用 `rich`，并至少生成 7 张图片（1 张封面 + 至少 6 张正文图）。

### Q3：Style（如 Q1 已选 preset 则跳过）

如果 EXTEND.md 有 `illustration_style`：

- [自定义 style 名 + 简述]（推荐）
- [最兼容的核心 style 1]
- [最兼容的核心 style 2]
- Other（查看完整 Style Gallery）

如果没有 `illustration_style`（优先展示 Core Styles）：

- [最兼容的核心 style]（推荐）
- [其他兼容核心 style 1]
- [其他兼容核心 style 2]
- Other（查看完整 Style Gallery）

**Core Styles**（简化选择）：

| Core Style | 映射到 | 适合 |
|------------|--------|------|
| `minimal-flat` | notion | 通用、知识分享、SaaS |
| `sci-fi` | vector-illustration | AI、前沿科技、系统设计 |
| `hand-drawn` | sketch/warm | 轻松、反思、日常 |
| `editorial` | editorial | 流程、数据、新闻 |
| `scene` | warm/watercolor | 叙事、情绪、生活方式 |

Style 选择基于 Type × Style 兼容矩阵（illustration-styles.md）。完整规格见 `illustration-styles/<style>.md`。

自动发布模式下：优先使用 `illustration_style`；否则按内容信号自动选择，无法判断时使用 `vector-illustration`。

### Q4：图片文字语言

检测文章语言。如果不同于 EXTEND.md 的 `illustration_language` 设置：

- 文章语言（匹配文章内容）（推荐）
- EXTEND.md 语言（用户通用偏好）

交互配图模式下询问。自动发布模式下，优先使用文章语言；如果无法判断，使用 `illustration_language`，仍无法判断则使用 `zh`。

### 展示参考图片用法（如 Step 1.0 检测到 reference）

向用户展示 outline 预览时，显示 reference 分配：

```
Reference Images:
| Ref | Filename | 推荐用法 |
|-----|----------|----------|
| 01 | 01-ref-diagram.png | direct → Illustration 1, 3 |
| 02 | 02-ref-chart.png | palette → Illustration 2 |
```

---

## Step 4：生成大纲

保存为 `outline.md`：

```yaml
---
type: infographic
density: rich
style: vector-illustration
image_count: 7
references:                    # 仅在提供 reference 时填写
  - ref_id: 01
    filename: 01-ref-diagram.png
    description: "展示系统架构的技术图"
  - ref_id: 02
    filename: 02-ref-chart.png
    description: "品牌配色图"
---

## Illustration 1

**Position**: [section] / [paragraph]
**Purpose**: [为什么有帮助]
**Visual Content**: [画什么]
**Type Application**: [如何应用 type]
**References**: [01]                    # 可选：使用的 ref_id
**Reference Usage**: direct             # direct | style | palette
**Filename**: cover.png

## Illustration 2
...
```

**要求**：

- 每个位置都要说明内容价值
- type 应用一致
- 描述中体现 style
- 数量匹配 density
- reference 分配基于 Step 2.4 分析

---

## Step 5：生成图片

### 5.1 创建 Prompt ⛔ 阻塞

**每张插图在生成前都必须先保存 prompt 文件。不要跳过。**

对 outline 中的每张插图：

1. **创建 prompt 文件**：`imgs/prompts/NN-{type}-{slug}.md`
2. **包含 YAML frontmatter**：
   ```yaml
   ---
   illustration_id: 01
   type: infographic
   style: vector-illustration
   ---
   ```
3. **遵循 [illustration-prompt-construction.md](illustration-prompt-construction.md) 中的 type 专属模板**
4. **Prompt 质量要求**（全部必需）：
   - `Layout`：描述整体构图（grid / radial / hierarchical / left-right / top-down）
   - `ZONES`：描述每个视觉区域的具体内容，不要含糊
   - `LABELS`：使用文章中的**真实数字、术语、指标、引用**，不要用泛化占位符
   - `COLORS`：给出有语义的 hex 色值（如 `Coral (#E07A5F) for emphasis`）
   - `STYLE`：描述线条、质感、情绪、人物处理
   - `ASPECT`：指定比例（如 `16:9`）
5. **应用默认要求**：构图要求、人物渲染、文字规范、水印
6. **备份规则**：如果 prompt 文件已存在，重命名为 `imgs/prompts/NN-{type}-{slug}-backup-YYYYMMDD-HHMMSS.md`

**验证** ⛔：进入 5.2 前确认所有 prompt 文件都存在：

```
Prompt Files:
- imgs/prompts/01-cover.md ✓
- imgs/prompts/02-infographic-overview.md ✓
...
```

**不要**在未保存 prompt 文件前，将临时文本直接传给 `--prompt`。生成命令应使用 `--promptfiles imgs/prompts/NN-{type}-{slug}.md references/illustration-styles/<style>.md`，或读取已保存 prompt 文件和 style 文件内容作为 `--prompt`。

**Style 文件读取规则** ⛔：

- 生成每张图片前，读取该 prompt frontmatter 中的 `style`。
- 必须读取 `references/illustration-styles/<style>.md`，并将该 style 文件内容与 prompt 文件内容一起作为图片生成输入。
- 如果 style 文件不存在，停下并报告缺失；不得凭记忆、默认印象或 prompt 中的简短 `STYLE` 字段替代完整风格规范。
- 如果需要调整风格，先修改对应 style 文件或 prompt 文件，再重新读取文件后生成。

**执行选择**：

- 如果多张插图都已有保存的 prompt 文件，且当前 runtime 支持 batch 后端，可用 `scripts/build-image-batch.ts --styles-dir references/illustration-styles --min-images 7` 生成 batch JSON
- 只有当每张图仍需单独改写 prompt、探索风格或做其他逐图推理时，才使用 subagent

**关键 - Frontmatter 中的 references**：

- 只有当文件确实存在于 `references/` 目录时，才添加 `references` 字段
- 如果只是口头提取风格/配色（无文件），把信息追加到 prompt 正文
- 写 frontmatter 前先验证：`test -f imgs/references/NN-ref-{slug}.png`

### 5.2 选择图片生成技能

检查可用技能。交互配图模式下，如果有多个，询问用户；自动发布模式下，优先使用 runtime 原生图片生成能力，其次使用已配置的 batch 后端。

### 5.3 处理 Reference ⚠️ 如果 Step 1.0 保存了 reference 则必做

**用户提供 reference 图片时不要跳过。** 对每张包含 reference 的插图：

1. **先验证文件存在**：
   ```bash
   test -f imgs/references/NN-ref-{slug}.png && echo "exists" || echo "MISSING"
   ```
   - 如果文件缺失但 frontmatter 中存在 → 报错，修正 frontmatter 或移除 references 字段
   - 如果文件存在 → 继续处理
2. 读取 prompt frontmatter 中的 reference 信息
3. 根据 usage 类型处理：

| Usage | 操作 | 示例 |
|-------|------|------|
| `direct` | 将 reference 路径加入 `--ref` 参数 | `--ref references/01-ref-brand.png` |
| `style` | 分析 reference，把风格特征追加到 prompt | "Style: clean lines, gradient backgrounds..." |
| `palette` | 从 reference 提取颜色并追加到 prompt | "Colors: #E8756D coral, #7ECFC0 mint..." |

4. 检查图片生成技能能力：

| 技能是否支持 `--ref` | 操作 |
|----------------------|------|
| 是 | 通过 `--ref` 传入 reference 图片 |
| 否 | 转换为文字描述，追加到 prompt |

**验证**：生成前确认 reference 已处理：

```
Reference Processing:
- Illustration 1: using 01-ref-brand.png (direct) ✓
- Illustration 2: extracted palette from 02-ref-style.png ✓
```

### 5.4 应用水印（如启用）

追加：`Include a subtle watermark "[content]" at [position].`

### 5.5 生成

1. 对每张插图：
   - **备份规则**：如果图片文件已存在，重命名为 `NN-{type}-{slug}-backup-YYYYMMDD-HHMMSS.png`
   - 如果 reference 的 usage 为 `direct`：包含 `--ref` 参数
   - 生成图片
2. 每张完成后汇报："Generated X/N"
3. 失败时重试一次；仍失败则记录并继续

---

## Step 6：收尾

### 6.1 更新文章

插入到对应段落后：

```markdown
![description](imgs/NN-{type}-{slug}.png)
```

Alt text：使用文章语言写简洁说明。

### 6.2 输出摘要

```
文章配图完成！

文章：[path]
Type: [type] | Density: [level] | Style: [style]
位置：[directory]
图片：已生成 X/N

插入位置：
- 01-xxx.png → 在 "[Section]" 后
- 02-yyy.png → 在 "[Section]" 后

[如有失败]
失败：
- NN-zzz.png：[原因]
```
