# 开发规范

- 保持 `ui`、`core`、`adapters`、`storage`、`prompts`、`templates` 和 `schemas` 的单向职责边界。
- SillyTavern API 与浏览器存储只能经 adapter 或 storage 层调用。
- 每张任务卡必须补测试、开发记录、changelog 和本地 Git 提交。
- 版本字段更新后必须完成回归测试；远程推送需要单独确认。
- 文档与样例使用 UTF-8；避免把测试密钥、聊天正文和秘密写入日志或版本库。

## 常量与命名边界

- 跨模块的聊天范围、默认 confidence、日志预览阈值和日志事件名放在 `src/constants/`。
- 内部草稿和业务概念统一使用 `lorebook`；仅 `adapters` 层使用 SillyTavern API 的 `worldInfo` 命名。
- 用户可见中文继续使用“世界书”，不要为内部命名统一而改动产品文案。

历史开发记录见 `setting_organizer_development_log.md`。
