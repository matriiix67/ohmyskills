# 贴图发表（原“图文”）

向微信公众号发布包含多张图片的贴图消息。

> **注意**：截至 2026 年，微信已在公众号菜单中将“图文”改名为“贴图”。

## 用法

```bash
# 使用图片和 markdown 文件发布（自动提取标题/内容）
${BUN_X} ./scripts/wechat-browser.ts --markdown /tmp/post-to-wechat/YYYY-MM-DD/slug/article.md --images /tmp/post-to-wechat/YYYY-MM-DD/slug/imgs/

# 使用明确的标题和内容发布
${BUN_X} ./scripts/wechat-browser.ts --title "标题" --content "内容" --image img1.png --image img2.png

# 保存为草稿
${BUN_X} ./scripts/wechat-browser.ts --markdown /tmp/post-to-wechat/YYYY-MM-DD/slug/article.md --images /tmp/post-to-wechat/YYYY-MM-DD/slug/imgs/ --submit
```

## 参数

| 参数 | 说明 |
|-----------|-------------|
| `--markdown <path>` | 用于提取标题/内容的 Markdown 文件 |
| `--images <dir>` | 包含图片的目录（按名称排序） |
| `--title <text>` | 文章标题（最多 20 个字符，过长时自动压缩） |
| `--content <text>` | 文章内容（最多 1000 个字符，过长时自动压缩） |
| `--image <path>` | 单个图片文件（可重复传入） |
| `--submit` | 保存为草稿（默认：仅预览） |
| `--profile <dir>` | Chrome profile 目录 |

## 从 Markdown 自动提取标题/内容

使用 `--markdown` 时，脚本会：

1. **解析 frontmatter** 中的标题和作者：
   ```yaml
   ---
   title: 文章标题
   author: 作者名
   ---
   ```

2. **如果没有 frontmatter 标题，则回退到 H1**：
   ```markdown
   # 这将成为标题
   ```

3. **如果标题过长，则压缩到 20 个字符**：
   - 原始标题："如何在一天内彻底重塑你的人生"
   - 压缩后："一天彻底重塑你的人生"

4. **提取前几个段落** 作为内容（最多 1000 个字符）

## 图片目录模式

使用 `--images <dir>` 时：

- 上传目录中的所有 PNG/JPG 文件
- 文件按名称字母序排序
- 命名约定：`01-cover.png`、`02-content.png` 等

## 限制

| 字段 | 最大长度 | 说明 |
|-------|------------|-------|
| 标题 | 20 个字符 | 超出时自动压缩 |
| 内容 | 1000 个字符 | 超出时自动压缩 |
| 图片 | 最多 9 张 | 微信限制 |

## 示例会话

```
用户：/post-to-wechat --markdown /tmp/post-to-wechat/YYYY-MM-DD/slug/article.md --images /tmp/post-to-wechat/YYYY-MM-DD/slug/imgs/

Claude:
1. 解析 markdown 元数据：
   - Title: "如何在一天内彻底重塑你的人生" → "一天内重塑你的人生"
   - Author: 来自 frontmatter 或默认值
2. 从前几个段落提取内容
3. 在临时工作区 `imgs/` 中找到图片
4. 打开 Chrome，进入微信“图文”编辑器
5. 上传所有图片
6. 填写标题和内容
7. 报告：“已发布包含 7 张图片的贴图内容。”
```

## 脚本

| 脚本 | 用途 |
|--------|---------|
| `wechat-browser.ts` | 主要贴图发布脚本 |
| `cdp.ts` | Chrome DevTools Protocol 工具 |
| `copy-to-clipboard.ts` | 剪贴板操作 |
