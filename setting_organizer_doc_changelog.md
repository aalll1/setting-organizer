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

### 2026-07-07：完成 TC-05 Prompt 模板

变更类型：新增 / 修改

涉及文件：

- `setting-organizer/src/prompts/extractSetting.js`
- `setting-organizer/tests/prompt.test.mjs`
- `setting-organizer/README.md`
- `setting_organizer_development_log.md`
- `setting_organizer_doc_changelog.md`

变更原因：

- 为后续真实模型调用建立版本化 Prompt，确保输出结构与 parser / validator / normalizer 对齐。

主要变化：

- 新增 `extract-setting-v0.1.0` Prompt 构建函数。
- Prompt 明确只输出 JSON、禁止 Markdown 代码块、禁止自然语言解释、禁止编造未出现信息。
- Prompt 明确 AI 不能执行写入、导入、覆盖或删除操作。
- 新增 Prompt 测试。

影响范围：

- 只新增 Prompt 模板和测试。
- 未接入真实模型调用。
- 未写入 SillyTavern 数据。

验证情况：

- `node --check setting-organizer/src/prompts/extractSetting.js` 已通过。
- `node setting-organizer/tests/prompt.test.mjs` 已通过。
- `node setting-organizer/tests/validator.test.mjs` 仍通过。

后续建议：

- 继续执行 `TC-06 SillyTavern 模型调用适配`。
- 先实现集中 adapter 和失败降级，避免 UI 直接依赖未验证的 SillyTavern 内部对象。

### 2026-07-07：完成 TC-06 模型调用适配封装

变更类型：新增 / 修改

涉及文件：

- `setting-organizer/src/adapters/sillytavernApi.js`
- `setting-organizer/tests/sillytavernApi.test.mjs`
- `setting-organizer/src/core/analyzer.js`
- `setting-organizer/src/storage/settings.js`
- `setting-organizer/src/ui/panel.js`
- `setting_organizer_development_log.md`
- `setting_organizer_doc_changelog.md`

变更原因：

- 为真实模型调用建立集中 adapter，避免 UI 或核心校验逻辑直接依赖未确认的 SillyTavern 内部对象。
- 响应用户提醒：后续各模块和功能必须充分解耦，便于更新和替换。

主要变化：

- 新增 SillyTavern API adapter，集中处理上下文探测、兼容性快照和候选模型调用接口。
- 分析模式增加 `mock` 与 `sillytavern`。
- 默认保持 `mock`，真实模型调用需用户切换并依赖运行时接口可用。
- 无上下文或无模型接口时返回 `E010`，模型调用失败返回 `E001`。
- 新增 adapter 测试。

影响范围：

- UI 只选择分析模式，不直接访问 SillyTavern 内部对象。
- core analyzer 只编排 mock / adapter / parser 校验流程。
- 未写入 SillyTavern 角色、世界书或聊天数据。

验证情况：

- `node --check setting-organizer/src/adapters/sillytavernApi.js` 已通过。
- `node setting-organizer/tests/sillytavernApi.test.mjs` 已通过。
- prompt 与 validator 测试仍通过。

后续建议：

- 继续执行 `TC-07 Token 粗估`，放入独立 `core/tokenEstimate.js`。
- 在真实 SillyTavern 环境验证前，不应把更多内部 API 调用散落到其他模块。

### 2026-07-07：完成 TC-07 Token 粗估

变更类型：新增 / 修改

涉及文件：

- `setting-organizer/src/core/tokenEstimate.js`
- `setting-organizer/tests/tokenEstimate.test.mjs`
- `setting-organizer/src/core/analyzer.js`
- `setting-organizer/README.md`
- `setting_organizer_development_log.md`
- `setting_organizer_doc_changelog.md`

变更原因：

- 根据任务卡实现轻量 Token 粗估，并保持估算逻辑与 UI 解耦。

主要变化：

- 新增 Token 粗估模块。
- 支持中文、英文和混合文本粗估。
- 支持分析结果输入、角色、世界书和总量 token 统计。
- 集中定义轻量、标准、长篇、自定义预算解析。
- analyzer 改为调用 tokenEstimate 模块，不再内联估算规则。

影响范围：

- 只影响 mock 分析结果中的 tokenEstimate 字段和后续预算规则来源。
- 未写入 SillyTavern 数据。

验证情况：

- `node --check setting-organizer/src/core/tokenEstimate.js` 已通过。
- `node setting-organizer/tests/tokenEstimate.test.mjs` 已通过。
- adapter、prompt、validator 测试仍通过。

后续建议：

- 继续执行 `TC-08 基础警告`。
- 警告规则应集中在 `core/warnings.js`，保持 UI 只负责展示。

### 2026-07-07：完成 TC-08 基础警告

变更类型：新增 / 修改

涉及文件：

- `setting-organizer/src/core/warnings.js`
- `setting-organizer/tests/warnings.test.mjs`
- `setting-organizer/src/core/analyzer.js`
- `setting-organizer/src/ui/results.js`
- `setting-organizer/README.md`
- `setting_organizer_development_log.md`
- `setting_organizer_doc_changelog.md`

变更原因：

- 实现规则级警告，并保持警告规则位于 core 层，UI 只负责展示。

主要变化：

- 新增 `applyWarnings()`。
- 支持输入过长、角色名称为空、世界书标题为空、正文为空、关键词为空、关键词过短、关键词重复、常驻条目过多和内容超预算等提示。
- analyzer 在校验规范化后统一附加警告。
- 结果页显示角色和世界书条目级 warnings。

影响范围：

- 影响分析结果展示中的 warnings。
- 不阻止用户继续编辑。
- 未写入 SillyTavern 数据。

验证情况：

- `node --check setting-organizer/src/core/warnings.js` 已通过。
- `node setting-organizer/tests/warnings.test.mjs` 已通过。
- token、adapter、validator 测试仍通过。

后续建议：

- 继续执行 `TC-09 JSON 导出`。
- 导出格式转换必须放在 adapter 中，保持内部草稿格式与 SillyTavern 兼容格式分离。

### 2026-07-07：完成 TC-09 JSON 导出

变更类型：新增 / 修改

涉及文件：

- `setting-organizer/src/adapters/characterAdapter.js`
- `setting-organizer/src/adapters/lorebookAdapter.js`
- `setting-organizer/src/core/exporter.js`
- `setting-organizer/tests/exporter.test.mjs`
- `setting-organizer/src/ui/results.js`
- `setting-organizer/style.css`
- `setting-organizer/README.md`
- `setting_organizer_development_log.md`
- `setting_organizer_doc_changelog.md`

变更原因：

- 完成 MVP-A 的安全导出闭环，并保持内部草稿格式与 SillyTavern 兼容导出格式分离。

主要变化：

- 新增角色导出 adapter。
- 新增世界书导出 adapter。
- 新增统一 exporter，支持完整草稿、角色草稿、世界书草稿、SillyTavern 兼容角色、SillyTavern 兼容世界书。
- 结果页新增导出按钮和导出错误反馈。

影响范围：

- 只导出 JSON 文件，不写入 SillyTavern。
- UI 不直接构造 SillyTavern 格式，格式转换由 adapters 负责。

验证情况：

- `node --check` 已覆盖新增导出相关模块。
- `node setting-organizer/tests/exporter.test.mjs` 已通过。
- warnings、prompt、tokenEstimate、validator 回归测试仍通过。

后续建议：

- MVP-A 已基本形成“粘贴文本 -> mock/候选模型 -> 校验 -> 编辑 -> 导出”闭环。
- 真实模型调用仍需在目标 SillyTavern 环境验证。
- 下一步可进入 `TC-10 备份能力` 或先做运行环境验证。

### 2026-07-07：完成 TC-10 本地备份能力

变更类型：新增 / 修改

涉及文件：

- `setting-organizer/src/storage/backups.js`
- `setting-organizer/src/ui/confirm.js`
- `setting-organizer/tests/backups.test.mjs`
- `setting-organizer/src/ui/results.js`
- `setting-organizer/style.css`
- `setting-organizer/README.md`
- `setting_organizer_development_log.md`
- `setting_organizer_doc_changelog.md`

变更原因：

- 在任何 SillyTavern 写入能力前，先建立备份记录能力，符合第一版安全策略。

主要变化：

- 新增备份记录创建、保存和读取。
- 结果页新增“创建备份”按钮和备份状态展示。
- 备份失败返回 `E007`。
- 明确当前备份只作为手动恢复依据，不承诺完整自动回滚。

影响范围：

- 只写入浏览器 localStorage 备份记录。
- 不创建角色。
- 不创建或修改世界书。
- 不写入 SillyTavern 数据。

验证情况：

- `node --check` 已覆盖新增备份模块和确认 UI。
- `node setting-organizer/tests/backups.test.mjs` 已通过。
- exporter 和 validator 回归测试仍通过。

后续建议：

- `TC-11 创建新世界书` 需要真实 SillyTavern API 验证后才能做实际写入。
- 在接口未确认前，可先实现导入确认和失败报告骨架，但必须禁用真实写入。

### 2026-07-07：完成 TC-11 安全导入世界书骨架

变更类型：新增 / 修改

涉及文件：

- `setting-organizer/src/core/importer.js`
- `setting-organizer/tests/importer.test.mjs`
- `setting-organizer/src/adapters/sillytavernApi.js`
- `setting-organizer/src/ui/confirm.js`
- `setting-organizer/src/ui/results.js`
- `setting-organizer/style.css`
- `setting-organizer/README.md`
- `setting_organizer_development_log.md`
- `setting_organizer_doc_changelog.md`

变更原因：

- 在真实写入接口确认前，先建立导入编排、备份前置和失败状态报告，确保后续写入只集中在 adapter 中实现。

主要变化：

- 新增 worldbook 导入编排层。
- 新增导入预检 UI。
- adapter 增加世界书创建候选接口。
- 未确认接口时返回 `E010` 和失败报告。
- 导入流程失败时展示备份标识、步骤状态和可能影响范围。

影响范围：

- 不直接写入 SillyTavern 数据，除非运行时存在并显式暴露候选 `createWorldInfo` 接口。
- 写入逻辑仍集中在 `sillytavernApi.js`。

验证情况：

- `node setting-organizer/tests/importer.test.mjs` 已通过。
- backups 和 exporter 回归测试仍通过。

后续建议：

- 使用新的 MuMu 模拟器确认浏览器与 SillyTavern 运行环境。
- 如果可访问真实 SillyTavern 页面，更新 `API_COMPATIBILITY.md` 的运行时兼容性矩阵。

### 2026-07-07：完成 MuMu / SillyTavern 运行验证并修复世界书导入

变更类型：新增 / 修改 / 验证

涉及文件：

- `setting-organizer/API_COMPATIBILITY.md`
- `setting-organizer/src/adapters/sillytavernApi.js`
- `setting-organizer/src/core/importer.js`
- `setting-organizer/tests/importer.test.mjs`
- `setting-organizer/tests/cdp-check.mjs`
- `.gitignore`
- `setting_organizer_development_log.md`
- `setting_organizer_doc_changelog.md`

变更原因：

- 用户要求在 MuMu 模拟器中确认并测试 SillyTavern 环境。
- 真实运行验证发现世界书导入名称校验问题，需要修复。

主要变化：

- 新增 CDP 检查脚本，用于在 MuMu 浏览器中执行前端验证。
- `SillyTavern-runtime/` 加入 `.gitignore`。
- `sillytavernApi.js` 改为使用已验证的 `saveWorldInfo(name, data, true)` 创建世界书。
- `importer.js` 默认世界书名称改为安全时间戳。
- 导入流程区分创建失败和旧数据校验失败。
- 更新 API 兼容性记录为运行时验证结果。

影响范围：

- 测试环境中创建了新的世界书用于验证。
- 项目源码仍保持 adapter 集中写入，UI 不直接调用 SillyTavern 内部接口。
- 未实现角色创建。

验证情况：

- MuMu 浏览器成功访问 `http://10.0.2.2:8000/`。
- SillyTavern 1.18.0 成功启动。
- 扩展面板在真实页面中加载。
- mock 分析、备份、世界书导入流程在真实页面中通过。
- 旧世界书名称在导入后仍保留。

后续建议：

- 进入 `TC-12 创建新角色` 前，先探测 SillyTavern 运行时 context 中的角色创建相关接口。

### 2026-07-07：完成 TC-12 角色创建与运行验证

变更类型：新增 / 修改 / 验证

涉及文件：

- `setting-organizer/src/adapters/characterAdapter.js`
- `setting-organizer/src/adapters/sillytavernApi.js`
- `setting-organizer/src/core/importer.js`
- `setting-organizer/src/ui/confirm.js`
- `setting-organizer/src/ui/results.js`
- `setting-organizer/tests/importer.test.mjs`
- `setting-organizer/tests/sillytavernApi.test.mjs`
- `setting-organizer/README.md`
- `setting-organizer/API_COMPATIBILITY.md`
- `setting_organizer_task_cards.md`
- `setting_organizer_development_log.md`
- `setting_organizer_doc_changelog.md`

变更原因：

- 完成 MVP-B 中“创建新角色、不覆盖旧角色”的安全写入闭环。
- 用户要求开发过程中同步更新文档，并复盘记录关键问题。

主要变化：

- 新增角色导入编排流程。
- 新增角色创建 FormData adapter。
- 新增 `/api/characters/create` 封装。
- 角色导入前自动创建本地备份。
- 角色导入前刷新并记录已有角色摘要。
- 角色导入后验证旧角色 avatar 仍保留。
- 结果页新增“预检导入角色”按钮和角色导入报告。

影响范围：

- 在 SillyTavern 测试环境中创建了两个测试角色。
- 不覆盖、不删除、不修改已有角色。
- 角色写入仍集中在 `sillytavernApi.js`，UI 不直接访问内部接口。
- 暂未实现角色与新建世界书的自动绑定。

验证情况：

- `node --check` 已覆盖角色导入相关模块。
- `node setting-organizer/tests/sillytavernApi.test.mjs` 已通过。
- `node setting-organizer/tests/importer.test.mjs` 已通过。
- 其余 backups、exporter、prompt、tokenEstimate、validator、warnings 测试均通过。
- MuMu 浏览器真实验证通过：导入前角色数量 2，导入后角色数量 3，旧 avatar 无缺失，报告状态为 success。

开发问题复盘：

- `createCharacterData` 是模板对象，不是创建函数；实际写入需要调用 `/api/characters/create`。
- `context.characters` 可能在刷新页面后为空；导入前必须先调用 `getCharacters()` 再记录 before 快照。

后续建议：

- 进入 `TC-13 当前聊天读取` 前，应继续保持用户主动触发原则。
- 若后续实现角色绑定世界书，应把绑定流程作为独立步骤和独立错误状态，不要并入角色创建成功状态。

### 2026-07-08：新增 TC-12A 运行日志与诊断导出计划

变更类型：范围调整 / 修改

涉及文件：

- `setting_organizer_agent_dev_plan.md`
- `setting_organizer_task_cards.md`
- `setting_organizer_development_log.md`
- `setting_organizer_doc_changelog.md`

变更原因：

- 用户提出需要详细日志功能，方便运行报错时维护。
- 当前实现只有少量 console 输出、导入报告和备份记录，不足以支持稳定排障。

主要变化：

- 在 Agent 开发计划中新增 `阶段 10A：运行日志与诊断导出`。
- 将运行日志与诊断导出纳入 MVP-B 必须完成项、完成条件和 P1 优先级。
- 在任务卡中新增 `TC-12A 运行日志与诊断导出`。
- 将 TC-12A 放在 TC-12 之后、TC-13 之前。
- 明确日志必须支持 localStorage 记录、console 输出、诊断 JSON 导出、清空日志和单元测试。
- 明确日志隐私约束：不得记录 API Key、Cookie、认证 header、完整 prompt、完整聊天正文、完整角色正文或完整世界书正文。

影响范围：

- 本次主要更新开发计划和任务拆分。
- 后续实现会新增独立日志模块和诊断 UI，保持与业务模块解耦。

验证情况：

- 已确认任务卡中包含 TC-12A。
- 已确认推荐执行顺序和 MVP-B 范围包含 TC-12A。

后续建议：

- 先完成 TC-12A，再进入 TC-13 当前聊天读取。

### 2026-07-08：完成 TC-12A 运行日志与诊断导出

变更类型：新增 / 修改

涉及文件：

- `setting-organizer/src/core/logger.js`
- `setting-organizer/src/ui/diagnostics.js`
- `setting-organizer/index.js`
- `setting-organizer/src/storage/settings.js`
- `setting-organizer/src/ui/panel.js`
- `setting-organizer/src/ui/results.js`
- `setting-organizer/src/ui/confirm.js`
- `setting-organizer/src/adapters/sillytavernApi.js`
- `setting-organizer/style.css`
- `setting-organizer/tests/logger.test.mjs`
- `setting-organizer/README.md`
- `setting_organizer_task_cards.md`
- `setting_organizer_development_log.md`
- `setting_organizer_doc_changelog.md`

变更原因：

- 用户要求加入详细日志功能，方便运行报错时维护。

主要变化：

- 新增集中日志模块，提供 `logInfo()`、`logWarn()`、`logError()`、`listLogs()`、`clearLogs()` 和 `buildDiagnosticSnapshot()`。
- 运行日志写入 localStorage，并限制最多 200 条。
- 主面板新增“导出诊断日志”和“清空诊断日志”按钮。
- 关键流程接入日志：扩展加载、设置读取 / 保存、分析、模型调用、导出、备份、世界书创建、角色创建、导入报告。
- 日志对认证、Cookie、token、API Key、headers 做脱敏，对 prompt、聊天、正文等长文本做摘要。
- 新增 logger 单元测试。

影响范围：

- 新增本地诊断能力，不自动上传日志。
- 不改变角色或世界书写入策略。
- 不改变现有备份和导入流程的业务结果。

验证情况：

- `node --check` 已覆盖新增 logger、diagnostics 和被修改模块。
- `node setting-organizer/tests/logger.test.mjs` 已通过。

后续建议：

- 下一步进入 TC-13 前，可在 MuMu 真实页面补一次诊断日志导出手测。

### 2026-07-08：完成 TC-13 当前聊天读取

变更类型：新增 / 修改

涉及文件：

- `setting-organizer/src/adapters/chatAdapter.js`
- `setting-organizer/src/adapters/sillytavernApi.js`
- `setting-organizer/src/storage/settings.js`
- `setting-organizer/src/ui/panel.js`
- `setting-organizer/style.css`
- `setting-organizer/tests/chatAdapter.test.mjs`
- `setting-organizer/README.md`
- `setting_organizer_task_cards.md`
- `setting_organizer_development_log.md`
- `setting_organizer_doc_changelog.md`

变更原因：

- 按任务卡进入 TC-13，支持从当前聊天读取内容作为输入来源。
- 必须保持用户主动触发，避免自动读取隐私内容。

主要变化：

- 新增聊天读取 adapter，负责聊天消息归一化、范围选择和文本构造。
- `sillytavernApi.js` 新增 `getCurrentChatMessages()`。
- 主面板新增“当前聊天读取”区域。
- 支持最近 20 条、最近 50 条、全部和手动索引。
- 读取成功后写入输入框，并显示读取条数和 token 粗估。
- 读取失败显示 `E012`，不影响粘贴文本模式。
- 新增聊天读取单元测试。

影响范围：

- 只读取当前页面内的 SillyTavern chat context，不写入角色、世界书或聊天数据。
- 不自动触发读取，必须用户点击按钮。
- 日志只记录范围、条数和长度摘要，不记录完整聊天正文。

验证情况：

- `node --check` 已覆盖聊天读取相关模块。
- `node setting-organizer/tests/chatAdapter.test.mjs` 已通过。

后续建议：

- 在 MuMu 真实页面补测不同聊天范围。
- 下一步可进入 `TC-14 基础重复检测`。

### 2026-07-08：完成 TC-14 基础重复检测

变更类型：新增 / 修改

涉及文件：

- `setting-organizer/src/core/warnings.js`
- `setting-organizer/tests/warnings.test.mjs`
- `setting-organizer/README.md`
- `setting_organizer_task_cards.md`
- `setting_organizer_development_log.md`
- `setting_organizer_doc_changelog.md`

变更原因：

- 按任务卡进入 TC-14，实现规则级重复检测。

主要变化：

- 新增同名角色检测。
- 新增同标题世界书检测。
- 新增完全相同关键词组合检测。
- 新增完全相同世界书正文检测。
- 新增泛化关键词检测。
- 保持检测结果只作为 warning，不自动删除、不自动合并。
- 扩展 `warnings.test.mjs` 覆盖新增规则。

影响范围：

- 只影响分析结果中的 warnings。
- 不改变草稿内容。
- 不写入 SillyTavern 数据。

验证情况：

- `node --check setting-organizer/src/core/warnings.js` 已通过。
- `node setting-organizer/tests/warnings.test.mjs` 已通过。

后续建议：

- 下一步进入 `TC-15 README 与使用说明`。

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
