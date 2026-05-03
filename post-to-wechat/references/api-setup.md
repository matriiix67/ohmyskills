# API 凭据设置

当缺少 `WECHAT_APP_ID` / `WECHAT_APP_SECRET` 时使用的引导式设置。由文章发布流程的 Step 5 调用。

## 检测

按以下顺序查找凭据：

1. 环境变量 `WECHAT_APP_ID` / `WECHAT_APP_SECRET`
2. 包含 `WECHAT_APP_ID=...` 的 `<cwd>/.post-to-wechat/.env`
3. 包含 `WECHAT_APP_ID=...` 的 `$HOME/.post-to-wechat/.env`

如果都不存在，执行下面的引导式设置。

## 引导式设置

向用户展示以下消息，并询问保存位置：

```
未找到微信 API 凭据。

获取凭据：
1. 访问 https://mp.weixin.qq.com
2. 前往：开发 → 基本配置
3. 复制 AppID 和 AppSecret

保存到哪里？
A) 项目级：.post-to-wechat/.env（仅当前项目）
B) 用户级：~/.post-to-wechat/.env（所有项目）
```

用户选择保存位置后，收集这些值（优先使用用户输入工具；如果没有，则按照 SKILL.md 中“用户输入工具”的规则，使用编号提示作为兜底），并追加：

```
WECHAT_APP_ID=<user_input>
WECHAT_APP_SECRET=<user_input>
```

