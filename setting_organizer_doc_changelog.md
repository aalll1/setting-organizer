# 设定整理器文档变更记录

## 说明

本文件用于跟踪当前目录中设定整理器相关 Markdown 文档的变化。

记录范围：

- 新增文档
- 修改文档
- 删除文档
- 重大结构调整
- 需求范围变化
- 版本说明变化

建议每次文档变更后追加一条记录，不直接覆盖旧记录。

## 文档清单

| 文件名 | 用途 | 当前状态 |
| --- | --- | --- |
| `sillytavern_setting_organizer_dev_plan.md` | 原始开发计划 | 已存在 |
| `setting_organizer_agent_dev_plan.md` | 面向 Agent 执行的优化版开发计划 | 已新增 |
| `setting_organizer_task_cards.md` | 基于开发计划拆分的任务卡 | 已新增 |
| `setting_organizer_doc_changelog.md` | 文档变更记录 | 已新增 |
| `setting_organizer_qa_review.md` | QA 评审意见与优化建议 | 已新增 |
| `setting_organizer_development_log.md` | 实际开发过程、验证结果和问题复盘 | 已新增 |

## 变更记录

### 2026-07-07：新增 Agent 版开发计划与任务卡

变更类型：新增文档

新增文件：

- `setting_organizer_agent_dev_plan.md`
- `setting_organizer_task_cards.md`
- `setting_organizer_doc_changelog.md`

变更原因：

- 原始开发计划内容完整，但范围较大，不适合直接交给 Agent 一次性执行。
- 需要将开发计划拆分为更小、更可验证、更符合 Agent 工作方式的阶段。
- 需要单独维护任务卡，方便后续按阶段推进。
- 需要建立文档变更记录，跟踪规划变化。

主要变化：

- 将第一版目标收敛为“粘贴文本 -> AI 返回 JSON -> 校验 -> 人工编辑 -> 导出 -> 安全新建”。
- 明确第一版禁止实现自动持续更新、RAG、关系图、高级冲突推理等复杂功能。
- 增加 Agent 执行规则：写入前说明影响范围并获得许可。
- 将开发拆分为阶段 0 到阶段 12。
- 增加任务卡 TC-00 到 TC-15。
- 增加内部草稿格式和 SillyTavern 写入格式分离的要求。
- 增加错误码、Token 粗估、基础警告、备份和导入确认要求。

影响范围：

- 只新增 Markdown 文档。
- 不修改原始开发计划。
- 不新增或修改扩展代码。
- 不执行 Git 操作。

后续建议：

- 若开始实际开发，优先执行 `setting_organizer_task_cards.md` 中的 `TC-00 项目侦察`。
- 每完成一个任务卡，应在本文件追加变更记录。
- 如果任务范围发生变化，应同步更新开发计划和任务卡。

### 2026-07-07：新增 QA 评审并修订 Agent 执行文档

变更类型：新增 / 修改

涉及文件：

- `setting_organizer_qa_review.md`
- `setting_organizer_agent_dev_plan.md`
- `setting_organizer_task_cards.md`
- `setting_organizer_doc_changelog.md`

变更原因：

- QA 评审发现错误码、备份回滚口径、MVP 边界、API 探针、Schema 判定规则和导入验收存在可执行性风险。
- 需要在实际开发前修订文档，降低 Agent 执行时的歧义。

主要变化：

- 新增 QA 评审文档。
- 在 Agent 开发计划中增加 MVP-A / MVP-B / MVP-C 分层。
- 增加阶段 1A：SillyTavern API 探针。
- 统一错误码到 `E001` 到 `E012`。
- 明确第一版不承诺完整自动回滚，只承诺备份、失败状态报告和可手动恢复依据。
- 增加 Schema 可修复 / 不可修复规则表。
- 增加导入前后旧角色、旧世界书不变验证。
- 在任务卡中新增 `TC-01A SillyTavern API 探针`。
- 补充测试样例清单。

影响范围：

- 只修改 Markdown 文档。
- 不新增或修改扩展代码。
- 不执行 Git 操作。

验证情况：

- 已通过文档级审查确认主要 QA 建议被纳入 Agent 开发计划和任务卡。

后续建议：

- 开发前优先执行 `TC-00` 和 `TC-01A`。
- 若实际 SillyTavern API 与计划不一致，应先更新兼容性记录，再继续实现。

### 2026-07-07：开始扩展开发并新增开发日志

变更类型：新增 / 修改

涉及文件：

- `setting-organizer/manifest.json`
- `setting-organizer/index.js`
- `setting-organizer/style.css`
- `setting-organizer/README.md`
- `setting-organizer/API_COMPATIBILITY.md`
- `setting-organizer/src/storage/settings.js`
- `setting-organizer/src/ui/panel.js`
- `setting-organizer/src/core/analyzer.js`
- `setting-organizer/src/ui/editor.js`
- `setting-organizer/src/ui/results.js`
- `setting_organizer_development_log.md`
- `setting_organizer_doc_changelog.md`

变更原因：

- 按任务卡开始实际开发，先完成扩展骨架、本地 UI 状态管理和 mock 结果展示。
- 用户要求开发过程中同步更新开发文档，并把关键问题复盘整理为 Markdown 文档。

主要变化：

- 新增 `setting-organizer/` 扩展目录。
- 实现最小扩展入口、基础面板、输入保存、目标选择、Token 预算设置。
- 实现 mock 分析结果、结果标签页和基础草稿编辑能力。
- 新增 API 兼容性记录，明确后续真实 SillyTavern 接口需要运行时复测。
- 新增开发日志，记录已完成任务、验证结果、MuMu/ADB 状态和开发问题。

影响范围：

- 新增扩展源码和开发日志。
- 未修改原始总体规划文档。
- 未接入真实 AI 模型。
- 未写入 SillyTavern 角色、世界书或聊天数据。
- 未执行 Git 操作。

验证情况：

- `manifest.json` 已通过 JSON 解析检查。
- 当前 JS 文件已通过 `node --check`。
- MuMu ADB 已连接到 `127.0.0.1:7555` 和 `emulator-5556`。

后续建议：

- 继续执行 `TC-04 JSON Schema 与解析校验`。
- 后续每完成任务卡，都同步更新 `setting_organizer_development_log.md`。

### 2026-07-07：完成 TC-04 解析校验与 Git 初始化

变更类型：新增 / 修改

涉及文件：

- `setting-organizer/src/core/errors.js`
- `setting-organizer/src/core/parser.js`
- `setting-organizer/src/core/normalizer.js`
- `setting-organizer/src/core/validator.js`
- `setting-organizer/src/schemas/analysisResult.schema.json`
- `setting-organizer/src/schemas/characterDraft.schema.json`
- `setting-organizer/src/schemas/lorebookDraft.schema.json`
- `setting-organizer/tests/validator.test.mjs`
- `setting-organizer/test-samples/bad-json-response.txt`
- `setting-organizer/test-samples/markdown-wrapped-json.txt`
- `setting-organizer/test-samples/wrong-field-types.json`
- `setting-organizer/src/core/analyzer.js`
- `setting-organizer/src/ui/panel.js`
- `setting-organizer/README.md`
- `setting_organizer_development_log.md`
- `setting_organizer_doc_changelog.md`

变更原因：

- 接入真实 AI 前必须建立模型输出的安全入口，避免非 JSON、空结果或字段异常直接进入 UI 状态。
- 用户授权初始化 Git 仓库并追踪开发进度。

主要变化：

- 新增错误码常量和扩展专用错误类型。
- 新增 JSON 解析器，支持剥离 Markdown JSON 代码块。
- 新增 normalizer，补全缺失数组、修正字符串关键词、截断 confidence、补默认字段。
- 新增 validator，拦截顶层非对象和空结果。
- 新增 schema JSON 文件作为数据格式契约。
- 新增 validator 测试脚本和测试样例。
- mock analyzer 输出改为经过 validator/normalizer 后再进入 UI。
- 初始化本地 Git 仓库并提交初始快照。

影响范围：

- 只影响扩展本地分析和校验链路。
- 未接入真实 AI 模型。
- 未写入 SillyTavern 角色、世界书或聊天数据。
- 未推送远程仓库。

验证情况：

- 新增核心 JS 文件已通过 `node --check`。
- `analysisResult.schema.json` 已通过 JSON 解析。
- `node setting-organizer/tests/validator.test.mjs` 已通过。

后续建议：

- 继续执行 `TC-05 Prompt 模板`。
- 后续可考虑引入轻量 JSON Schema validator，但需注意浏览器扩展环境依赖体积。

## 变更记录模板

```text
### YYYY-MM-DD：变更标题

变更类型：新增 / 修改 / 删除 / 重构 / 范围调整

涉及文件：

- `文件名`

变更原因：

- ...

主要变化：

- ...

影响范围：

- ...

验证情况：

- ...

后续建议：

- ...
```
