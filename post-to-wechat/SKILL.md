---
name: post-to-wechat
description: 通过 API 或 Chrome CDP 将内容发布到微信公众号。支持用 HTML、markdown、纯文本或已准备好的 URL/X 内容发布文章，也支持包含多张图片的贴图/图文发布。URL/X 发布流程必须先准备中文改写、去 AI 味并配图的草稿，再发布。Markdown 文章流程默认将普通外部链接转换为底部引用，以适配微信排版。当用户提到“发布公众号”“post to wechat”“微信公众号”或“贴图/图文/文章”时使用。
version: 1.56.6
metadata:
  openclaw:
    homepage: 
    requires:
      anyBins:
        - bun
        - npx
---

# 发布到微信公众号

## 用户输入工具

当该技能需要向用户提问时，按以下优先级选择工具：

1. **优先使用当前 agent runtime 暴露的内置用户输入工具**，例如 `AskUserQuestion`、`request_user_input`、`clarify`、`ask_user` 或任何等价工具。
2. **兜底方式**：如果没有这类工具，输出带编号的纯文本问题，并要求用户为每个问题回复所选编号或答案。
3. **批量提问**：如果工具支持一次调用提出多个问题，将所有适用问题合并到一次调用中；如果只支持单个问题，则按优先级逐个询问。

下文中具体的 `AskUserQuestion` 引用只是示例；在其他 runtime 中请替换为本地等价工具。

## 语言

使用用户的语言回复。用户用中文，就用中文回复；用户用英文，就用英文回复。技术标记（路径、flag、字段名）保持英文。

## 脚本目录

`{baseDir}` = 该 SKILL.md 所在目录。解析 `${BUN_X}`：优先使用 `bun`；否则使用 `npx -y bun`；再否则建议执行 `brew install oven-sh/bun/bun`。

| 脚本 | 用途 |
|--------|---------|
| `scripts/wechat-browser.ts` | 图文发布 |
| `scripts/wechat-article.ts` | 通过浏览器发布文章 |
| `scripts/wechat-api.ts` | 通过 API 发布文章 |
| `scripts/md-to-wechat.ts` | Markdown → 带图片占位符、适合微信的 HTML |
| `scripts/check-permissions.ts` | 检查环境与权限 |

## 偏好配置（EXTEND.md）

按顺序检查以下路径；第一个命中的文件生效：

| 路径 | 作用域 |
|------|-------|
| `.post-to-wechat/EXTEND.md` | 项目 |
| `${XDG_CONFIG_HOME:-$HOME/.config}/post-to-wechat/EXTEND.md` | XDG |
| `$HOME/.post-to-wechat/EXTEND.md` | 用户主目录 |

找到后 → 读取、解析并应用。未找到 → 在执行其他任何步骤前，先运行首次设置（`references/config/first-time-setup.md`）。

**最小配置项**（大小写不敏感，接受 `1/0` 或 `true/false`）：

| 配置项 | 默认值 | 映射 |
|-----|---------|---------|
| `default_author` | 空 | CLI/frontmatter 未提供时作为 `author` 的兜底值 |
| `need_open_comment` | `1` | `draft/add` 中的 `articles[].need_open_comment` |
| `only_fans_can_comment` | `0` | `draft/add` 中的 `articles[].only_fans_can_comment` |
| `illustration_style` | 空 | Step 4 内置配图的默认 style，空则按内容自动选择 |
| `illustration_density` | `rich` | Step 4 默认图片密度，URL/X 流程至少 7 张 |
| `illustration_image_count` | `7` | Step 4 默认生成图片数量，包含封面 |
| `illustration_watermark` | 空 | Step 4 图片水印文字，空则不加水印 |
| `illustration_watermark_position` | `bottom-right` | 水印位置 |
| `illustration_language` | `zh` | 插图内文字语言 |

**推荐的 EXTEND.md**：

```md
default_theme: modern
default_color: orange
default_publish_method: api
default_author: AI 的岔路口
need_open_comment: 1
only_fans_can_comment: 0
chrome_profile_path: /path/to/chrome/profile
illustration_style: vector-illustration
illustration_density: rich
illustration_image_count: 7
illustration_watermark:
illustration_watermark_position: bottom-right
illustration_language: zh
```

**主题选项**：default、grace、simple、modern。**颜色预设**：blue、green、vermilion、yellow、purple、sky、rose、olive、black、gray、pink、red、orange（或 hex）。

**取值优先级**：CLI 参数 → frontmatter → EXTEND.md → 技能默认值。

## 发布前检查（可选）

首次使用前，建议执行环境检查（用户可以跳过）：

```bash
${BUN_X} {baseDir}/scripts/check-permissions.ts
```

检查项：Chrome、profile 隔离、Bun、辅助功能权限、剪贴板、粘贴快捷键、API 凭据、Chrome 冲突。

| 检查失败项 | 修复方式 |
|-------------|-----|
| Chrome | 安装 Chrome 或设置 `WECHAT_BROWSER_CHROME_PATH` |
| Profile dir | `post-to-wechat/chrome-profile` 中的共享 profile |
| Bun runtime | `brew install oven-sh/bun/bun` 或 `npm install -g bun` |
| Accessibility (macOS) | 系统设置 → 隐私与安全性 → 辅助功能 → 启用终端 app |
| Clipboard copy | 确保 Swift/AppKit 可用（macOS：`xcode-select --install`） |
| Paste keystroke (Linux) | 安装 `xdotool`（X11）或 `ydotool`（Wayland） |
| API credentials | 按 Step 5 的引导完成设置，或在 `.post-to-wechat/.env` 中配置 |

## 图文发布

带多张图片的短内容（最多 9 张）：

```bash
${BUN_X} {baseDir}/scripts/wechat-browser.ts --markdown /tmp/post-to-wechat/YYYY-MM-DD/<slug>/article.md --images /tmp/post-to-wechat/YYYY-MM-DD/<slug>/imgs/
${BUN_X} {baseDir}/scripts/wechat-browser.ts --title "标题" --content "内容" --image img.png --submit
```

详情见 `references/image-text-posting.md`。

## 文章发布流程

```
- [ ] Step 0: 加载偏好配置（EXTEND.md）
- [ ] Step 1: 判断输入类型
- [ ] Step 2: 为中文图文发布准备 URL/X 内容
- [ ] Step 3: 改写并去除中文草稿的 AI 味
- [ ] Step 4: 生成封面和插图素材
- [ ] Step 5: 选择发布方式并配置凭据
- [ ] Step 6: 解析主题/颜色并校验元数据
- [ ] Step 7: 发布到微信
- [ ] Step 8: 报告完成情况
```

**串行执行硬规则**：

- 对 URL/X 输入，必须按 Step 0 → Step 1 → Step 2 → Step 3 → Step 4 → Step 5 → Step 6 → Step 7 → Step 8 严格串行执行。
- 不得提前执行后续步骤。尤其禁止在 Step 2 生成中文源草稿、Step 3 生成最终改写稿之前，开始 Step 4 的 outline、prompt 或图片生成。
- 每一步都必须产生明确产物后才能进入下一步；如果产物缺失、抓取失败、翻译未完成、改写未完成或用户中断，则停在当前步骤并报告阻塞原因。
- 只有输入类型本身明确跳转时才允许跳步：HTML 文件跳到 Step 6；已准备好的 Markdown 文件跳到 Step 5；URL/X 输入不允许跳过 Step 2-4。
- “用户允许发布”只表示 Step 7 可以在前置步骤全部完成后执行，不表示可以跳过翻译、改写或配图前置步骤。

### Step 0：加载偏好配置

检查并加载 EXTEND.md（见上文“偏好配置”）。如果未找到，在提出任何其他问题前先完成首次设置。解析并缓存以下配置，供后续步骤使用：`default_theme`、`default_color`、`default_publish_method`、`default_author`、`need_open_comment`、`only_fans_can_comment`、`illustration_style`、`illustration_density`、`illustration_image_count`、`illustration_watermark`、`illustration_watermark_position`、`illustration_language`。

### Step 1：判断输入类型

| 输入 | 判断方式 | 下一步 |
|-------|-----------|------|
| HTML 文件 | 路径以 `.html` 结尾，且文件存在 | 跳到 Step 6 |
| Markdown 文件 | 路径以 `.md` 结尾，且文件存在 | Step 5 |
| X/Twitter URL | URL host 为 `x.com` 或 `twitter.com` | Step 2 |
| 其他 URL | 以 `http://` 或 `https://` 开头 | Step 2 |
| 纯文本 | 不是文件路径，或文件不存在 | 保存为 markdown，然后 Step 5 |

**文章工作区**：

- URL/X、纯文本和新生成内容必须保存到临时目录：`/tmp/post-to-wechat/YYYY-MM-DD/<slug>/`。
- 文章、中文源稿、改写说明、HTML、封面、插图、outline、prompt 和下载媒体都放在该临时工作区内。
- 不要把运行产物写入 skill 仓库目录，避免长期占用硬盘；只有 skill 文档和脚本本身才保存在仓库内。

**纯文本处理**：

1. 生成 slug（取前 2-4 个有意义的词，使用 kebab-case；中文需翻译成英文作为 slug）。
2. 保存到 `/tmp/post-to-wechat/YYYY-MM-DD/<slug>/article.md`（必要时创建目录）。
3. 作为 markdown 文件继续处理。

### Step 2：为中文图文发布准备 URL/X 内容

对于来源为 URL 的发布任务，不要直接发布抓取到的原始草稿。先构建中文源草稿，再继续 Step 3。

1. **抓取来源**
   - `x.com` / `twitter.com`：在偏好配置允许时，使用当前可用的 X/Twitter-to-markdown 技能或工具，并启用媒体下载。
   - 其他 URL：使用当前 runtime 中可用的合适 URL-to-markdown 技能/工具。
2. **检测语言**
   - 如果正文不是中文，使用当前可用的翻译技能或工具翻译为 `zh-CN`。
   - 时间允许时使用 `refined` 模式获得发布级输出；否则使用 `normal`。
   - 将引用的 prompt、prompt 示例和指令块作为文章正文的一部分翻译成中文。代码、命令、文件名、变量、URL、模型名和产品名必须保持原样。
   - 如果来源已经是中文，将其保存为中文源草稿并继续。
3. **落地中文源草稿**
   - 保存翻译后或原本就是中文的草稿到 `/tmp/post-to-wechat/YYYY-MM-DD/<slug>/source-zh.md`，并包含来源说明与本地媒体引用。
   - 事实、数字、名称、链接、图片和代码必须保持准确。

**Step 2 完成门禁**：必须已经有一个中文源 markdown 文件。没有这个文件时，不得进入 Step 3，更不得进入 Step 4 图片生成。

### Step 3：改写并去除中文草稿的 AI 味

翻译完成后、生成图片前，读取并直接执行 `references/rewrite-humanize.md`。该参考文档已经包含结构分析、深度改写、标题/开头、AI 痕迹检查、必需输出和成功标准；不要在此处另行套用其他 humanizer/rewrite 技能或工具。

完成后只使用改写后的 markdown 继续流程。翻译草稿保留为中间产物。

**Step 3 完成门禁**：必须已经有最终改写后的中文 markdown。未完成改写和 AI 痕迹检查前，不得创建配图 outline、prompt，也不得调用任何图片生成能力。

### Step 4：生成封面和插图素材

使用改写后的中文 markdown 作为插图来源，执行本 skill 内置的配图流程。详细规则见 `references/illustration-workflow.md`、`references/illustration-prompt-construction.md`、`references/illustration-styles.md` 和 `references/illustration-style-presets.md`。

**Step 4 前置门禁**：仅允许使用 Step 3 的最终改写稿作为输入；禁止使用英文原文、未翻译草稿、未改写草稿或仅抓取到的 URL/X 内容生成图片。

**URL/X 流程的最低生成图片要求**：

- URL/X 发布前必须生成 **1 张独立封面 + 至少 6 张正文插图**，总数至少 7 张；用户要求更少时也不得低于这个发布门禁。
- 统计生成素材，不统计从 URL/X 帖子抓取的源图片。
- 默认拆分：**1 张封面 + 随机 6-10 张正文插图**。
- 自动发布模式下不请求确认；交互配图模式推荐 `rich (7+)` 或明确的 `image_count >= 7`，如果某个密度会产出少于 7 张总图或少于 6 张正文插图，则不要推荐。
- 即使文章较短，也要通过组合封面、章节开场图、流程图、对比图、检查清单、引用卡片或总结卡片，创建 7-11 个有用素材。

1. **生成封面和插图 prompt**
   - 按 `references/illustration-workflow.md` 分析改写后的中文草稿。
   - 将上述最低要求写入内置配图设置和 outline。
   - URL/X 自动发布模式下不得再次询问；按 EXTEND.md、内容分析和默认规则自动选择。
   - 在生成图片前，于 `/tmp/post-to-wechat/YYYY-MM-DD/<slug>/imgs/` 下创建 `outline.md` 和 `prompts/*.md`。
   - outline 必须列出至少 7 个生成素材，并包含 `cover.png`、正文插图文件名和插入位置。
2. **生成图片**
   - 按 `imgs/outline.md` 顺序处理；每张图必须读取对应的 `imgs/prompts/*.md`，并按其 `style` frontmatter 读取 `references/illustration-styles/<style>.md`。缺 prompt 或 style 时停止，不得凭记忆补写。
   - 生成输入只能来自已保存的 prompt + style 文件；如需修改，先更新文件再重新读取，不得在调用图片生成时临场重写、摘要或替换。
   - 默认使用 Codex `image_gen`；不可用时才使用其他 runtime 原生图片生成能力；仍不可用则停止，不得用占位图或跳过 Step 4。
   - 批量生成时，可先用下列命令生成 batch JSON（该脚本只建任务，不生成图片）：
     ```bash
     ${BUN_X} {baseDir}/scripts/build-image-batch.ts \
       --outline /tmp/post-to-wechat/YYYY-MM-DD/<slug>/imgs/outline.md \
       --prompts /tmp/post-to-wechat/YYYY-MM-DD/<slug>/imgs/prompts \
       --styles-dir {baseDir}/references/illustration-styles \
       --output /tmp/post-to-wechat/YYYY-MM-DD/<slug>/imgs/batch.json \
       --images-dir /tmp/post-to-wechat/YYYY-MM-DD/<slug>/imgs \
       --min-images 7
     ```
   - 生成素材必须保存到文章工作区 `imgs/`，并按内置配图流程插入 markdown。dry-run/publish 前确认 `imgs/cover.png` 存在，正文已插入至少 6 张 `imgs/` 下的新生成正文图，且不统计 URL/X 抓取源图。
3. **继续发布**
   - 使用最终改写并配图的中文 markdown 作为 Step 5 的输入。
   - 对 API `news` 文章，通过 `--cover` 传入生成的封面图片。

### Step 5：选择发布方式并配置

除非用户明确要求浏览器自动化，文章发布默认使用 `api`。如果 EXTEND.md 指定了 `default_publish_method: api`，不要再询问。

| 方式 | 速度 | 要求 |
|--------|-------|----------|
| `api`（推荐） | 快 | API credentials |
| `browser` | 慢 | Chrome + 已登录会话 |

**选择 API 且缺少凭据** → 按 `references/api-setup.md` 运行引导式设置（写入 `.post-to-wechat/.env`）。

### Step 6：解析主题/颜色并校验元数据

1. **Theme**：CLI `--theme` → EXTEND.md `default_theme` → `default`（第一个命中值生效；如果已解析，不要再询问）。
2. **Color**：CLI `--color` → EXTEND.md `default_color` → 省略（使用主题默认值）。
3. **校验元数据**（markdown 使用 frontmatter，HTML 使用 meta tags）：

| 字段 | 缺失时 → |
|-------|-----------|
| Title | URL/X 自动发布时从内容自动生成；交互模式可询问或让用户按 Enter 自动生成 |
| Summary | Frontmatter `description` → `summary` → URL/X 自动发布时自动生成；交互模式可询问 |
| Author | CLI `--author` → frontmatter `author` → EXTEND.md `default_author` |

自动生成规则：title = 第一个 H1/H2 或第一句话；summary = 第一段，截断到 120 个字符。

4. **封面图**（API `article_type=news` 必需）：CLI `--cover` → frontmatter（`coverImage` / `featureImage` / `cover` / `image`）→ `imgs/cover.png`。URL/X 自动发布必须使用独立封面并传入 `--require-cover`，不得使用第一张正文图片兜底；非 URL/X 手动发布若未传 `--require-cover`，脚本才允许使用第一张正文图片作为最后兜底。

### Step 7：发布

**重要：绝不要预先将 markdown 转换成 HTML。** 发布脚本会在内部处理转换，而且两种方式渲染图片的方式不同：API 会渲染 `<img>` 标签用于上传，浏览器方式使用占位符进行粘贴后替换。传入预先转换好的 HTML 会破坏其中一种流程。

**Markdown 引用默认行为**：对于 markdown 输入，普通外部链接默认转换为底部引用。只有当用户明确希望保留行内链接时，才使用 `--no-cite`。已有 HTML 输入保持原样。

**API 方式**（接受 `.md` 或 `.html`）：

```bash
${BUN_X} {baseDir}/scripts/wechat-api.ts <file> --theme <theme> [--color <color>] [--title <title>] [--summary <summary>] [--author <author>] [--cover <cover_path>] [--min-images <n>] [--require-cover] [--no-cite]
```

CLI 未传 `--theme` / `--color` 时，脚本会按 EXTEND.md 默认值解析；执行者手动调用时可显式传入已解析值。

URL/X 自动发布流程必须传入 `--cover /tmp/post-to-wechat/YYYY-MM-DD/<slug>/imgs/cover.png --require-cover --min-images 6`，用于校验独立封面和正文内至少 6 张生成插图。

**`draft/add` payload 规则**：
- 端点：`POST https://api.weixin.qq.com/cgi-bin/draft/add?access_token=ACCESS_TOKEN`
- `article_type`：`news`（默认）或 `newspic`
- 对 `news`，需包含 `thumb_media_id`（必须有封面）
- 请求 body 中始终包含 `need_open_comment`（默认 `1`）和 `only_fans_can_comment`（默认 `0`），即使 CLI 没有暴露它们

**浏览器方式**（接受 `--markdown` 或 `--html`）：

```bash
${BUN_X} {baseDir}/scripts/wechat-article.ts --markdown <markdown_file> --theme <theme> [--color <color>] [--no-cite]
${BUN_X} {baseDir}/scripts/wechat-article.ts --html <html_file>
```

### Step 8：完成报告

```
微信发布完成！

输入：[type] - [path]
方式：[API | 浏览器]
主题：[theme] [如设置则显示 color]

文章：
• 标题：[title]
• 摘要：[summary]
• 语言：[source language] → zh-CN / 已是 zh-CN
• 草稿：[原始 | 已翻译 | 已改写 | 已配图]
• 图片：[N] 正文内
• 封面：[cover path]
• 评论：[open/closed], [fans-only/all]    ← 仅 API 方式

结果：
✓ 草稿已保存到微信公众号
• media_id：[media_id]                         ← 仅 API 方式

后续步骤（API）：
→ 管理草稿：https://mp.weixin.qq.com（登录后进入「内容管理」→「草稿箱」）

创建的文件：
[• /tmp/post-to-wechat/YYYY-MM-DD/<slug>/article.md（如果输入为纯文本或 URL/X）]
[• translation/polish workflow files（如果 URL/X 来源需要中文处理）]
[• rewrite-notes.md / 备选标题 / AI-trace 检查清单（如果执行了改写步骤）]
[• imgs/outline.md 和 imgs/prompts/*.md（如果生成了插图）]
[• imgs/*.png 或 imgs/*.jpg，用于封面和正文插图的生成/选定图片]
[• .wechat-render/temp-article.html（发布脚本内部生成的中间 HTML，如有）]
```

## 故障排查

| 问题 | 修复方式 |
|-------|-----|
| 缺少 API 凭据或 access token 错误 | 按 `references/api-setup.md` 配置并验证凭据 |
| 浏览器未登录或找不到 Chrome | 扫码登录；必要时设置 `WECHAT_BROWSER_CHROME_PATH` |
| 缺少标题、摘要或封面 | 自动生成标题/摘要；封面用 `--cover`、frontmatter 或 `imgs/cover.png`，URL/X 必须用独立封面 |
| 图片数量不足或图片生成失败 | 停在 Step 4，补齐 `cover.png` 和至少 6 张正文新生成图后再发布 |
| 粘贴失败 | 检查系统剪贴板和辅助功能权限 |

## 参考资料

| 文件 | 内容 |
|------|---------|
| `references/image-text-posting.md` | 图文参数、自动压缩 |
| `references/article-posting.md` | 文章主题、图片处理 |
| `references/rewrite-humanize.md` | 中文改写、去 AI 味、备选标题、AI-trace 检查清单 |
| `references/illustration-workflow.md` | 内置封面和正文插图生成流程 |
| `references/illustration-prompt-construction.md` | 配图 prompt 文件格式和 type 模板 |
| `references/illustration-styles.md` | 内置配图风格库和兼容矩阵 |
| `references/illustration-style-presets.md` | type + style 预设组合 |
| `references/api-setup.md` | 引导式凭据设置 |
| `references/config/first-time-setup.md` | 首次 EXTEND.md 设置 |
