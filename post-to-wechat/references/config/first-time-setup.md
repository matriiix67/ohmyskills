---
name: first-time-setup
description: post-to-wechat 偏好配置的首次设置流程
---

# 首次设置

## 概览

当未找到 EXTEND.md 时，引导用户完成偏好配置。

**阻塞操作**：该设置必须在任何其他工作流步骤之前完成。不要：
- 询问要发布的内容或文件
- 询问主题或发布方式
- 继续进行内容转换或发布

只询问本设置流程中的问题，保存 EXTEND.md，然后继续。

## 设置流程

```
未找到 EXTEND.md
        |
        v
+---------------------+
| AskUserQuestion     |
| （所有问题）        |
+---------------------+
        |
        v
+---------------------+
| 创建 EXTEND.md      |
+---------------------+
        |
        v
    继续 Step 1
```

## 问题

**语言**：使用用户输入语言或已保存的语言偏好。

使用 AskUserQuestion，并在一次调用中提出所有问题：

### 问题 1：默认主题

```yaml
header: "主题"
question: "文章转换的默认主题？"
options:
  - label: "default（推荐）"
    description: "经典布局：居中标题带边框，H2 为彩色底白字（默认：blue）"
  - label: "grace"
    description: "优雅风格：文字阴影、圆角卡片、精致引用块（默认：purple）"
  - label: "simple"
    description: "极简现代：非对称圆角、干净留白（默认：green）"
  - label: "modern"
    description: "大圆角、胶囊标题、宽松排版（默认：orange）"
```

### 问题 2：默认颜色

```yaml
header: "颜色"
question: "默认颜色预设？（未设置则使用主题默认值）"
options:
  - label: "主题默认值（推荐）"
    description: "使用主题内置默认颜色"
  - label: "blue"
    description: "#0F4C81 经典蓝"
  - label: "red"
    description: "#A93226 中国红"
  - label: "green"
    description: "#009874 翡翠绿"
```

注意：用户可以选择“其他”输入任意预设名（vermilion、yellow、purple、sky、rose、olive、black、gray、pink、orange）或 hex 值。

### 问题 3：默认发布方式

```yaml
header: "方式"
question: "默认发布方式？"
options:
  - label: "api（推荐）"
    description: "速度快，需要 API 凭据（AppID + AppSecret）"
  - label: "browser"
    description: "速度慢，需要 Chrome 和已登录会话"
```

### 问题 4：默认作者

```yaml
header: "作者"
question: "文章默认作者名？"
options:
  - label: "无默认值"
    description: "留空，每篇文章单独指定"
```

注意：用户很可能会选择“其他”来输入作者名。

### 问题 5：开启评论

```yaml
header: "评论"
question: "默认开启文章评论？"
options:
  - label: "是（推荐）"
    description: "允许读者评论文章"
  - label: "否"
    description: "默认关闭评论"
```

### 问题 6：仅粉丝评论

```yaml
header: "仅粉丝"
question: "评论是否仅限关注者？"
options:
  - label: "否（推荐）"
    description: "所有读者都可以评论"
  - label: "是"
    description: "仅关注者可以评论"
```

### 问题 7：默认配图风格

```yaml
header: "配图"
question: "URL/X 文章发布时，默认插图风格？"
options:
  - label: "自动选择（推荐）"
    description: "根据内容分析选择 type/style"
  - label: "vector-illustration"
    description: "干净扁平矢量风，适合知识文章和教程"
  - label: "notion"
    description: "极简手绘线稿，适合 SaaS、效率和通用知识内容"
```

### 问题 8：配图水印

```yaml
header: "水印"
question: "生成封面和正文插图时是否添加水印？"
options:
  - label: "无水印（推荐）"
    description: "不添加水印"
```

注意：用户可以选择“其他”输入水印文字，例如公众号名或 @handle。水印位置默认 `bottom-right`。

### 问题 9：保存位置

```yaml
header: "保存"
question: "偏好配置保存到哪里？"
options:
  - label: "项目（推荐）"
    description: ".post-to-wechat/（仅当前项目）"
  - label: "用户"
    description: "~/.post-to-wechat/（所有项目）"
```

## 保存位置

| 选择 | 路径 | 作用域 |
|--------|------|-------|
| 项目 | `.post-to-wechat/EXTEND.md` | 当前项目 |
| 用户 | `~/.post-to-wechat/EXTEND.md` | 所有项目 |

## 设置完成后

1. 如有需要，创建目录
2. 写入 EXTEND.md
3. 确认：“偏好配置已保存到 [path]”
4. 继续 Step 0（加载已保存的偏好配置）

## EXTEND.md 模板

### 单账号（默认）

```md
default_theme: [default/grace/simple/modern]
default_color: [预设名、hex，或留空以使用主题默认值]
default_publish_method: [api/browser]
default_author: [作者名或留空]
need_open_comment: [1/0]
only_fans_can_comment: [1/0]
chrome_profile_path:
illustration_style: [style 名，或留空以自动选择]
illustration_density: rich
illustration_image_count: 7
illustration_watermark: [水印文字，或留空]
illustration_watermark_position: bottom-right
illustration_language: zh
```

## 后续修改偏好配置

用户可以直接编辑 EXTEND.md，或删除它以重新触发设置流程。
