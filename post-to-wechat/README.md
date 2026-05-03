# post-to-wechat 配置说明

`post-to-wechat` 用于把 Markdown、HTML、URL/X 内容发布到微信公众号。URL/X 流程会先生成中文源稿、改写去 AI 味、生成封面和正文插图，然后发布到微信公众号草稿。

## 必需环境

- `bun`：运行发布脚本。
- `npx`：作为 `bun` 的兜底执行方式。
- 微信公众号 API 凭据：使用 API 发布文章时必需。
- Chrome：只有使用浏览器发布方式或图文贴图方式时才需要。

可选环境检查：

```bash
bun scripts/check-permissions.ts
```

## 微信 API 凭据

API 发布默认读取以下位置，按顺序使用第一个完整配置：

1. 环境变量 `WECHAT_APP_ID` / `WECHAT_APP_SECRET`
2. 当前工作目录的 `.post-to-wechat/.env`
3. 用户目录的 `~/.post-to-wechat/.env`

`.env` 示例：

```env
WECHAT_APP_ID=your_app_id
WECHAT_APP_SECRET=your_app_secret
```

获取位置：微信公众号后台 → 开发 → 基本配置。

## EXTEND.md 偏好配置

`EXTEND.md` 用来保存默认主题、作者、评论和配图偏好。读取顺序：

1. `.post-to-wechat/EXTEND.md`
2. `${XDG_CONFIG_HOME:-$HOME/.config}/post-to-wechat/EXTEND.md`
3. `$HOME/.post-to-wechat/EXTEND.md`

推荐配置：

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

配置 key 大小写不敏感；布尔值支持 `1/0`、`true/false`。

## 配图配置

URL/X 发布默认要求至少 7 张新生成图片：1 张封面 + 至少 6 张正文图。

常用字段：

- `illustration_style`：默认配图风格，例如 `vector-illustration`。留空时按内容自动选择。
- `illustration_density`：默认 `rich`。
- `illustration_image_count`：默认 `7`。
- `illustration_watermark`：水印文字，留空则不加水印。
- `illustration_language`：插图内文字语言，默认 `zh`。

风格文件位于：

```text
references/illustration-styles/<style>.md
```

生成图片时必须同时读取 prompt 文件和对应 style 文件。批量生成时也必须传入 style 目录：

```bash
bun scripts/build-image-batch.ts \
  --outline /tmp/post-to-wechat/YYYY-MM-DD/slug/imgs/outline.md \
  --prompts /tmp/post-to-wechat/YYYY-MM-DD/slug/imgs/prompts \
  --styles-dir references/illustration-styles \
  --output /tmp/post-to-wechat/YYYY-MM-DD/slug/imgs/batch.json \
  --images-dir /tmp/post-to-wechat/YYYY-MM-DD/slug/imgs \
  --min-images 7
```

该命令只生成 batch JSON。只有当前运行环境提供图片批处理后端时才消费它；否则按 prompt 顺序逐张读取 prompt + style 文件生成。

## 工作区位置

运行产物不会写入 skill 仓库目录，而是写入临时目录：

```text
/tmp/post-to-wechat/YYYY-MM-DD/<slug>/
```

典型产物：

- `source-original.md`：抓取到的原文备份。
- `source-zh.md`：中文源稿。
- `article.md`：最终改写并插图后的文章。
- `rewrite-notes.md`：改写说明和备选标题。
- `imgs/cover.png`：封面图。
- `imgs/*.png`：正文插图。
- `imgs/outline.md`：配图大纲。
- `imgs/prompts/*.md`：图片生成 prompt。
- `.wechat-render/temp-article.html`：发布脚本渲染出的中间 HTML，仅用于上传前处理。

## 发布方式

默认推荐 API 发布：

```bash
bun scripts/wechat-api.ts /tmp/post-to-wechat/YYYY-MM-DD/slug/article.md \
  --theme default \
  --cover /tmp/post-to-wechat/YYYY-MM-DD/slug/imgs/cover.png \
  --require-cover \
  --min-images 6
```

发布前可 dry-run：

```bash
bun scripts/wechat-api.ts /tmp/post-to-wechat/YYYY-MM-DD/slug/article.md \
  --theme default \
  --cover /tmp/post-to-wechat/YYYY-MM-DD/slug/imgs/cover.png \
  --require-cover \
  --min-images 6 \
  --dry-run
```

浏览器发布用于需要登录会话或手动后台发布的场景：

```bash
bun scripts/wechat-article.ts --markdown /tmp/post-to-wechat/YYYY-MM-DD/slug/article.md --theme default
```

## 关键流程约束

- URL/X 输入必须严格执行：抓取 → 翻译 → 改写 → 配图 → dry-run → 发布。
- 改写前不得生成图片。
- URL/X 发布前必须至少有 1 张独立封面 + 6 张正文插图，并传入 `--require-cover`。
- 图片生成前必须保存 `imgs/outline.md` 和 `imgs/prompts/*.md`。
- 每张图片必须读取对应 prompt 文件和 `references/illustration-styles/<style>.md`。
- 用户明确允许发布后，自动发布模式不再反复确认，除非缺少必需凭据或硬性产物。
