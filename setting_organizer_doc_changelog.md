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

### 2026-07-08：完成 TC-15 README 与使用说明

变更类型：修改 / 收尾

涉及文件：

- `setting-organizer/README.md`
- `setting_organizer_task_cards.md`
- `setting_organizer_development_log.md`
- `setting_organizer_doc_changelog.md`

变更原因：

- 按任务卡进入 TC-15，提供安装、使用和限制说明。
- 原 README 更像功能清单，不足以指导新用户安装和排障。

主要变化：

- 重写 README。
- 补充安装路径和步骤。
- 补充基础使用流程。
- 补充当前聊天读取说明。
- 补充安全策略。
- 补充诊断日志说明。
- 补充错误码表。
- 补充当前功能清单和已知限制。
- 补充 Android / MuMu / Termux 注意事项。
- 补充维护建议。
- 将 TC-15 状态标记为已完成。

影响范围：

- 只修改文档，不改动扩展运行逻辑。
- README 明确不承诺尚未实现的高级功能。

验证情况：

- 已检查 README 覆盖任务卡要求：扩展用途、安装方式、基础使用流程、安全策略、已知限制、错误码说明、Android / Termux 注意事项。

后续建议：

- 任务卡 TC-00 到 TC-15 已完成；后续可做完整 MuMu 真实页面回归。

### 2026-07-08：修正任务卡历史状态

变更类型：修改 / 文档一致性修复

涉及文件：

- `setting_organizer_task_cards.md`
- `setting_organizer_development_log.md`
- `setting_organizer_doc_changelog.md`

变更原因：

- 完成度审计发现 TC-00 到 TC-11 在任务卡中仍标记为“未开始”。
- 开发日志、源码文件、测试和 Git 提交记录已经证明这些任务已完成。

主要变化：

- 将 TC-00 到 TC-11 状态补正为“已完成”。
- 在开发日志中记录本次审计发现和修复。

影响范围：

- 只修正文档状态，不修改扩展源码。

验证情况：

- 任务卡中不再存在 `状态：未开始`、`状态：进行中`、`状态：阻塞` 或 `状态：暂缓`。

### 2026-07-08：运行时回归报告与原生优先优化

变更类型：新增 / 修改 / 文档同步 / 小范围优化

涉及文件：

- `setting_organizer_runtime_test_report_20260708.md`
- `setting_organizer_development_log.md`
- `setting_organizer_doc_changelog.md`
- `setting-organizer/README.md`
- `setting-organizer/API_COMPATIBILITY.md`
- `setting-organizer/src/ui/results.js`
- `setting-organizer/src/ui/confirm.js`

变更原因：

- 完成 MuMu + SillyTavern 1.18.0 真实环境回归后，需要沉淀可维护测试记录。
- 审计发现 SillyTavern 原生已提供完整世界书和角色管理能力，插件应避免重复实现。

主要变化：

- 新增运行时测试报告，记录单元测试、MuMu/CDP、扩展加载、mock 分析、导出、诊断日志、备份、真实世界书/角色创建和 `E012` 空聊天错误路径。
- 更新 README 和 API 兼容文档，移除已过期的“未在 MuMu 复测诊断导出”描述。
- 按原生优先原则调整按钮和状态文案：插件负责创建草稿与最小安全创建，后续编辑管理交给 SillyTavern 原生功能。

影响范围：

- 不改变 adapter 写入边界，不新增复杂原生功能复制。
- UI 文案更准确，导入流程仍沿用原有安全备份和旧数据校验。

验证情况：

- 关键模块语法检查通过。
- 全部本地单元测试通过。
- 优化后 MuMu smoke test 通过：扩展加载、mock 分析、诊断导出、备份和“创建到酒馆”按钮文案均正常。

### 2026-07-08：v0.2.0 追加功能文档规划

变更类型：新增 / 修改 / 文档规划

涉及文件：

- `setting_organizer_agent_dev_plan.md`
- `setting_organizer_task_cards.md`
- `setting_organizer_development_log.md`
- `setting_organizer_doc_changelog.md`
- `setting-organizer/README.md`

变更原因：

- 用户授权将追加功能正式策划进开发文档。
- 用户选择本阶段只做文档规划，目标版本为 `v0.2.0`，原生边界为适度扩展。

主要变化：

- 在 Agent 开发计划中新增 v0.2.0 追加功能规划。
- 在任务卡中新增 `TC-16` 到 `TC-20`。
- README 新增路线图，说明 v0.2.0 纳入项和暂不纳入项。
- 开发日志记录本次规划决策和后续执行约束。

影响范围：

- 只修改 Markdown 文档。
- 不修改扩展业务代码。
- 不运行 MuMu 实测。
- 不更新 `manifest.json` 版本。
- 不创建版本 tag。

验证情况：

- 已完成文档级验证：任务卡 `TC-16` 到 `TC-20` 编号连续，状态均为“未开始”。
- `git diff --name-only` 确认只修改 Markdown 文档。
- README 已新增 v0.2.0 路线图，并继续声明不复制 SillyTavern 原生角色 / 世界书管理器。

### 2026-07-08：v0.2.0 开发、测试与运行时实测

变更类型：新增 / 修改 / 功能开发 / 测试

涉及文件：

- `setting-organizer/manifest.json`
- `setting-organizer/src/adapters/sillytavernApi.js`
- `setting-organizer/src/core/errors.js`
- `setting-organizer/src/core/importer.js`
- `setting-organizer/src/core/validator.js`
- `setting-organizer/src/ui/confirm.js`
- `setting-organizer/src/ui/results.js`
- `setting-organizer/tests/*.mjs`
- `setting-organizer/test-samples/`
- `setting-organizer/README.md`
- `setting-organizer/API_COMPATIBILITY.md`
- `setting_organizer_task_cards.md`
- `setting_organizer_development_log.md`
- `setting_organizer_runtime_test_report_v020_20260708.md`

变更原因：

- 按 v0.2.0 任务卡完成追加功能开发、自动测试和 MuMu/SillyTavern 实测。

主要变化：

- 当前聊天读取测试覆盖最近 20、最近 50、全部和手动索引。
- 新增角色创建后可选绑定本次新建世界书。
- 新增 `E013` 角色世界书绑定失败错误码。
- 新增原生世界书入口按钮和降级提示。
- 加强轻量 schema 结构校验。
- manifest 版本更新为 `0.2.0`。
- `TC-16` 到 `TC-20` 标记为已完成。

影响范围：

- 不复制 SillyTavern 原生角色 / 世界书管理器。
- 不自动删除测试数据。
- 不执行远程 push。

验证情况：

- 关键模块语法检查通过。
- 全部 `.mjs` 单元测试通过。
- MuMu + SillyTavern 1.18.0 实测通过。
- 测试角色：`SO_V02_1783521618416`。
- 测试世界书：`SO_V02_设定整理器绑定 20260708144019894`。

### 2026-07-08：新增代码审查与使用说明文档

变更类型：新增 / 文档

涉及文件：

- `setting_organizer_code_review_usage_guide.md`
- `setting_organizer_development_log.md`
- `setting_organizer_doc_changelog.md`

变更原因：

- 按用户要求从头审查插件代码，并将插件功能和使用说明整理为 Markdown 文档保存到项目目录。

主要变化：

- 新增综合审查与使用说明文档。
- 记录插件定位、功能清单、使用流程、架构分层、数据流、错误码和维护排障方式。
- 明确本次审查未发现阻塞级问题，主要风险集中在 SillyTavern 运行时 API 兼容性和原生入口降级。

影响范围：

- 仅文档变更，不修改业务代码。

验证情况：

- 关键模块 `node --check` 通过。
- 全部 `.mjs` 测试通过。
- 确认文档描述与 `manifest.json` 版本 `0.2.0`、README 和 API 兼容文档一致。

### 2026-07-08：拆分插件功能与使用说明

变更类型：新增 / 文档

涉及文件：

- `setting_organizer_feature_overview.md`
- `setting_organizer_user_guide.md`
- `setting_organizer_code_review_usage_guide.md`
- `setting_organizer_development_log.md`
- `setting_organizer_doc_changelog.md`

变更原因：

- 用户要求将插件功能和使用说明独立成单独 Markdown 文档，并确认插件是否具备日志功能。

主要变化：

- 新增独立插件功能说明文档。
- 新增独立使用说明文档。
- 在综合审查文档中增加独立文档索引。
- 记录日志功能：console 输出、localStorage 存储、诊断导出、清空、脱敏和长文本摘要。

影响范围：

- 仅文档变更，不修改业务代码。

验证情况：

- 确认日志实现位于 `setting-organizer/src/core/logger.js` 和 `setting-organizer/src/ui/diagnostics.js`。
- 确认文档描述与当前 v0.2.0 实现一致。

### 2026-07-08：优化错误提示可读性

变更类型：修改 / 功能优化 / 测试 / 文档

涉及文件：

- `setting-organizer/src/core/errors.js`
- `setting-organizer/tests/errors.test.mjs`
- `setting_organizer_feature_overview.md`
- `setting_organizer_user_guide.md`
- `setting_organizer_development_log.md`
- `setting_organizer_doc_changelog.md`

变更原因：

- 用户反馈单独显示错误码不明显，希望页面直接展示实际错误内容。

主要变化：

- 新增 `ERROR_HELP` 错误帮助映射。
- `formatError()` 改为显示错误标题、说明、建议、错误码和必要技术详情。
- 保留原有错误码，不破坏日志定位和测试断言。

影响范围：

- 改变 UI 中错误文本展示方式。
- 不改变错误抛出、错误码、日志记录和 SillyTavern 写入流程。

验证情况：

- 新增错误格式化单元测试。

### 2026-07-08：准备 SillyTavern 原生安装发布目录

变更类型：新增 / 文档 / 发布准备

涉及文件：

- `setting-organizer-native-install/`
- `setting-organizer-native-install/NATIVE_INSTALL.md`
- `setting_organizer_native_publish_plan.md`
- `setting_organizer_development_log.md`
- `setting_organizer_doc_changelog.md`

变更原因：

- 用户询问插件能否通过 SillyTavern 原生扩展安装器安装，并授权使用 GitHub 仓库上传发布版。

主要变化：

- 新增干净发布目录，目录根部直接包含 SillyTavern 扩展所需文件。
- 新增原生安装说明。
- 新增发布记录，说明推荐使用专用 GitHub 仓库 `aalll1/setting-organizer`。

影响范围：

- 不修改开发目录中的业务代码。
- 不上传到现有无关 GitHub 仓库。

验证情况：

- 已确认 GitHub 当前账号为 `aalll1`。
- 已确认本机未安装 `gh` CLI。
- 已确认当前可访问仓库列表中没有专用 `setting-organizer` 仓库。

### 2026-07-08：发布到 GitHub 原生安装仓库

变更类型：发布 / 文档

涉及文件：

- `setting_organizer_native_publish_plan.md`
- `setting_organizer_development_log.md`
- `setting_organizer_doc_changelog.md`

变更原因：

- 用户已创建发布仓库 `aalll1/setting-organizer`，要求使用 GitHub connector 自行发布。

主要变化：

- 已将 `setting-organizer-native-install/` 作为仓库根目录发布到 GitHub。
- 远程提交：`768f669 release: publish setting organizer 0.2.0`。
- 安装 URL：`https://github.com/aalll1/setting-organizer`。

影响范围：

- 远程 GitHub 仓库 `aalll1/setting-organizer` 的 `main` 分支已更新。
- 本地开发仓库仅更新发布记录文档。

验证情况：

- GitHub connector 已读取远程 `manifest.json`。
- 远程 `manifest.json` 版本为 `0.2.0`。
- 远程 `manifest.json` 的 `homePage` 指向发布仓库。

### 2026-07-09：补推 GitHub 发布 tag

变更类型：发布 / 文档

涉及文件：

- `setting_organizer_native_publish_plan.md`
- `setting_organizer_development_log.md`
- `setting_organizer_doc_changelog.md`

变更原因：

- 继续完成前一轮因环境额度限制未完成的 `v0.2.0` tag 推送。

主要变化：

- 已向 `aalll1/setting-organizer` 推送远程 tag：`v0.2.0`。
- 已验证 `v0.2.0` tag 下的 `manifest.json` 可读取。
- tag 下 `manifest.json` 版本为 `0.2.0`。

影响范围：

- 远程 GitHub 仓库新增 `v0.2.0` tag。
- 本地开发仓库更新发布记录文档。

验证情况：

- GitHub connector 已读取 `https://github.com/aalll1/setting-organizer/blob/v0.2.0/manifest.json`。

### 2026-07-09：新增长期规划任务卡

变更类型：新增 / 文档 / 规划

涉及文件：

- `setting_organizer_long_term_task_cards.md`
- `setting_organizer_development_log.md`
- `setting_organizer_doc_changelog.md`

变更原因：

- 用户要求根据长期开发规划文档，将尚未实现部分整理为任务卡，并以 Markdown 文档保存到项目目录。

主要变化：

- 新增 `TC-21` 到 `TC-42` 长期任务卡。
- 将 `v0.2.1` 稳定性修复设为近期最小可执行闭环。
- 将剧情状态、状态合并、冲突检测、世界书同步、模板系统拆成后续阶段。
- 增加工厂化任务：正式 docs 目录拆分、常量命名整理、质量脚本入口。

影响范围：

- 仅文档变更，不修改插件运行代码。

验证情况：

- 已检查任务卡编号接续 `TC-20`。
- 已将长期愿景和近期可执行任务分离。

### 2026-07-09：完成 TC-21 JSON 提取与截断识别

变更类型：修改 / 测试 / 文档

涉及文件：

- `setting-organizer/src/core/parser.js`
- `setting-organizer/tests/parser.test.mjs`
- `setting_organizer_long_term_task_cards.md`
- `setting_organizer_development_log.md`
- `setting_organizer_doc_changelog.md`

变更原因：

- 按长期任务卡推进 `TC-21`，降低真实模型输出因 Markdown 包裹、自然语言前后缀或半截 JSON 导致的 `E002` 排查难度。

主要变化：

- 新增确定性 JSON 提取逻辑。
- 解析失败时记录 raw output 长度和首尾预览等诊断字段。
- 半截 JSON 显示疑似截断提示。
- 新增 parser 单元测试。

影响范围：

- 仅影响模型输出解析和错误 details。
- 不改变草稿 schema、导入写入流程或 SillyTavern adapter。

验证情况：

- 新增测试覆盖普通 JSON、Markdown JSON、自然语言 + JSON、嵌入式 fenced JSON、非 JSON 和半截 JSON。

### 2026-07-09：完成 TC-22 Prompt 压缩与输出约束优化

变更类型：修改 / 测试 / 文档

涉及文件：

- `setting-organizer/src/prompts/extractSetting.js`
- `setting-organizer/tests/prompt.test.mjs`
- `setting-organizer/README.md`
- `setting_organizer_long_term_task_cards.md`
- `setting_organizer_development_log.md`
- `setting_organizer_doc_changelog.md`

变更原因：

- 按长期任务卡推进 `TC-22`，缩短设定提取 prompt，降低模型输出长 JSON 时被截断的概率。

主要变化：

- prompt 模板从格式化 JSON 改为压缩 JSON。
- 输出规则明确为只输出一个压缩 JSON 对象。
- 明确禁止 JSON 前后说明。
- prompt 版本更新为 `extract-setting-v0.2.1`。

影响范围：

- 仅影响 prompt 构建和对应测试。
- 不改变内部草稿 schema、parser、UI、adapter 或写入流程。

验证情况：

- `prompt.test.mjs` 增加压缩模板和长度下降断言。

### 2026-07-09：完成 TC-23 原始模型输出调试面板

变更类型：新增 / 测试 / 文档

涉及文件：

- `setting-organizer/src/core/modelOutputDebug.js`
- `setting-organizer/src/core/analyzer.js`
- `setting-organizer/src/core/parser.js`
- `setting-organizer/src/ui/diagnostics.js`
- `setting-organizer/style.css`
- `setting-organizer/tests/modelOutputDebug.test.mjs`
- `setting_organizer_long_term_task_cards.md`
- `setting_organizer_development_log.md`
- `setting_organizer_doc_changelog.md`

变更原因：

- 按长期任务卡推进 `TC-23`，提供显式触发的模型原始输出调试能力，解决 `E002` 排查困难。

主要变化：

- 新增最近一次模型输出调试摘要。
- 诊断面板显示 source、prompt、raw output 长度和截断识别信息。
- 用户可显式复制或下载完整原始输出。
- 默认日志不保存完整原始输出。

影响范围：

- 影响真实模型分析后的诊断面板展示。
- 不改变 mock 分析、导入写入、SillyTavern adapter 和草稿 schema。

验证情况：

- 新增测试验证日志只记录摘要，不记录完整 raw output。

### 2026-07-09：完成 TC-24 输入规模提示与分析前确认

变更类型：新增 / 测试 / 文档

涉及文件：

- `setting-organizer/src/core/tokenEstimate.js`
- `setting-organizer/src/core/warnings.js`
- `setting-organizer/src/adapters/chatAdapter.js`
- `setting-organizer/src/ui/panel.js`
- `setting-organizer/tests/tokenEstimate.test.mjs`
- `setting-organizer/tests/chatAdapter.test.mjs`
- `setting_organizer_long_term_task_cards.md`
- `setting_organizer_development_log.md`
- `setting_organizer_doc_changelog.md`

变更原因：

- 按长期任务卡推进 `TC-24`，在长输入或大量聊天读取时提前提示截断风险，减少真实模型输出失败。

主要变化：

- 新增输入规模评估函数和字符阈值。
- 聊天读取后显示消息统计、字符数、token 估算和风险提示。
- 真实模型模式下超长输入需要用户确认。
- mock 模式不被超长确认阻塞。

影响范围：

- 影响聊天读取状态提示、草稿 warnings 和真实模型分析前确认。
- 不改变 parser、prompt、adapter 写入或导入流程。

验证情况：

- 新增 token 阈值测试和聊天统计测试。

### 2026-07-09：完成 TC-25 错误码扩展与错误帮助文档同步

变更类型：新增 / 测试 / 文档

涉及文件：

- `setting-organizer/src/core/errors.js`
- `setting-organizer/src/core/analyzer.js`
- `setting-organizer/src/ui/panel.js`
- `setting-organizer/tests/errors.test.mjs`
- `setting-organizer/tests/analyzer.test.mjs`
- `setting-organizer/README.md`
- `setting_organizer_feature_overview.md`
- `setting_organizer_user_guide.md`
- `setting_organizer_long_term_task_cards.md`
- `setting_organizer_development_log.md`
- `setting_organizer_doc_changelog.md`

变更原因：

- 按长期任务卡推进 `TC-25`，补齐输入类错误码，并同步 UI、测试和文档。

主要变化：

- 新增 `E014`、`E015`、`E016`。
- 空输入、非文本输入、超长确认取消进入统一错误格式。
- 错误码文档同步更新。

影响范围：

- 影响输入校验和错误展示。
- 不改变模型调用、parser、导入写入或 SillyTavern adapter。

验证情况：

- 新增 analyzer 输入校验测试。
- 扩展 errors 错误帮助映射测试。

### 2026-07-09：完成 TC-26 v0.2.1 回归测试与发布准备

变更类型：版本 / 测试 / 文档 / 发布准备

涉及文件：

- `setting-organizer/manifest.json`
- `setting-organizer-native-install/manifest.json`
- `setting-organizer-native-install/`
- `setting-organizer/README.md`
- `setting_organizer_long_term_task_cards.md`
- `setting_organizer_development_log.md`
- `setting_organizer_doc_changelog.md`
- `setting_organizer_runtime_test_report_v021_20260709.md`

变更原因：

- 按长期任务卡推进 `TC-26`，为 v0.2.1 稳定性修复版完成回归测试和发布准备。

主要变化：

- manifest 版本更新到 `0.2.1`。
- 发布目录同步当前开发版。
- 新增 v0.2.1 运行时测试报告。
- README 路线图从“v0.2.1 规划中”更新为“v0.2.1 已完成”。

影响范围：

- 影响安装元信息、发布副本和维护文档。
- 不改变 core、UI、adapter 的业务逻辑。

验证情况：

- 24 个关键 JS 文件语法检查通过。
- 14 个无参数单元测试通过。
- SillyTavern 1.18.0 本地浏览器 smoke test 覆盖扩展加载、mock 分析、结果页、备份、诊断导出和真实模式错误路径。
- GitHub `main` 和 `v0.2.1` tag 下的 `manifest.json` 已验证为 `0.2.1`。

### 2026-07-10：完成 TC-27 剧情状态数据模型与 schema 草案

变更类型：新增 / 文档 / 测试

涉及文件：

- `setting-organizer/src/schemas/campaignState.schema.json`
- `setting-organizer/src/core/stateTypes.js`
- `setting-organizer/tests/stateTypes.test.mjs`
- `docs/DATA_MODEL.md`
- `setting_organizer_long_term_task_cards.md`
- `setting_organizer_development_log.md`
- `setting_organizer_doc_changelog.md`

变更原因：

- 按长期任务卡推进 `TC-27`，先建立剧情状态草稿的数据边界，避免后续 UI 或 parser 直接混用角色 / 世界书草稿结构。

主要变化：

- 新增 `campaign-state-v0.1` schema。
- 新增状态类型常量和空状态工厂。
- 新增数据模型文档，说明当前状态、历史归档和永久设定边界。

影响范围：

- 只影响剧情状态数据模型草案和测试。
- 不改变现有设定整理分析、导入、导出、UI 或 SillyTavern 写入流程。

验证情况：

- 新增 `stateTypes.test.mjs`。

### 2026-07-10：完成 TC-28 剧情状态提取 prompt 与 parser

变更类型：新增 / 测试 / 解耦增强

涉及文件：

- `setting-organizer/src/prompts/extractState.js`
- `setting-organizer/src/core/parser.js`
- `setting-organizer/src/core/stateParser.js`
- `setting-organizer/src/core/stateNormalizer.js`
- `setting-organizer/src/core/stateValidator.js`
- `setting-organizer/tests/stateParser.test.mjs`
- `setting_organizer_long_term_task_cards.md`
- `setting_organizer_development_log.md`
- `setting_organizer_doc_changelog.md`

变更原因：

- 按长期任务卡推进 `TC-28`，在不接入 UI 和写入流程的前提下，建立剧情状态 prompt / parser / normalizer / validator 的独立链路。

主要变化：

- 新增剧情状态提取 prompt。
- 新增剧情状态解析、规范化和校验模块。
- 通用 JSON 解析入口提取为 `parseModelJson()`，供设定整理和剧情状态共用。

影响范围：

- 影响 core/parser 的公开 API，但保留 `parseAnalysisJson()` 兼容入口。
- 不改变现有设定整理 UI、导入、导出或 SillyTavern 写入流程。

验证情况：

- 新增 `stateParser.test.mjs`。
- 覆盖普通 JSON、Markdown JSON、自然语言包裹 JSON、半截 JSON、缺失字段补全、无效任务状态修正和现有设定整理模式回归。

### 2026-07-10：完成 TC-29 剧情状态草稿 UI

变更类型：新增 / UI / 测试 / 文档

涉及文件：

- `setting-organizer/src/core/stateAnalyzer.js`
- `setting-organizer/src/adapters/sillytavernApi.js`
- `setting-organizer/src/storage/settings.js`
- `setting-organizer/src/ui/panel.js`
- `setting-organizer/src/ui/statePanel.js`
- `setting-organizer/style.css`
- `setting-organizer/tests/stateAnalyzer.test.mjs`
- `setting-organizer/tests/statePanel.test.mjs`
- `setting-organizer/tests/settings.test.mjs`
- `setting-organizer/tests/sillytavernApi.test.mjs`
- `setting_organizer_long_term_task_cards.md`
- `setting_organizer_development_log.md`
- `setting_organizer_doc_changelog.md`

变更原因：

- 按长期任务卡推进 `TC-29`，在不写入、不持久化的前提下，让剧情状态草稿可被用户查看、编辑和删除。

主要变化：

- 主面板新增整理模式选择。
- 状态模式挂载独立 `statePanel`，显示剧情摘要、人物、势力、任务、关键道具、confidence 和 warnings。
- 状态模式使用独立 `stateAnalyzer` 和 `extractState` prompt。
- 设置新增 `organizeMode`，默认仍为旧的设定整理模式。

影响范围：

- 影响主面板 UI 和设置保存。
- 不改变角色 / 世界书导入导出按钮逻辑。
- 不新增 SillyTavern 写入能力。

验证情况：

- 新增状态分析、状态面板、设置归一化测试。
- 扩展 SillyTavern API 测试，确认状态 prompt 独立调用。

### 2026-07-10：完成 TC-30 剧情状态导出与导入

变更类型：新增 / 测试 / 文档

涉及文件：

- `setting-organizer/src/core/stateExporter.js`
- `setting-organizer/src/core/stateValidator.js`
- `setting-organizer/src/storage/stateStore.js`
- `setting-organizer/src/ui/statePanel.js`
- `setting-organizer/style.css`
- `setting-organizer/tests/stateExporter.test.mjs`
- `setting-organizer/tests/statePanel.test.mjs`
- `setting_organizer_long_term_task_cards.md`
- `setting_organizer_development_log.md`
- `setting_organizer_doc_changelog.md`

变更原因：

- 按长期任务卡推进 `TC-30`，让剧情状态草稿可以导出为 JSON、从 JSON 重新载入，并可保存最近草稿。

主要变化：

- 新增状态 JSON 导出 / 导入模块。
- 新增最近状态草稿 localStorage 模块。
- 状态面板增加导入、导出、保存最近草稿、载入最近草稿操作。
- schemaVersion 不兼容时 fail-fast。

影响范围：

- 影响剧情状态草稿面板和状态数据层。
- 不影响现有设定草稿备份、角色 / 世界书导入导出或 SillyTavern 写入流程。

验证情况：

- 新增 `stateExporter.test.mjs`。
- 扩展 `statePanel.test.mjs`。

### 2026-07-10：完成 TC-31 v0.3.x 回归测试与文档收口

变更类型：文档 / 测试记录 / 范围说明

涉及文件：

- `setting-organizer/README.md`
- `docs/DATA_MODEL.md`
- `docs/TESTING.md`
- `setting_organizer_long_term_task_cards.md`
- `setting_organizer_development_log.md`
- `setting_organizer_doc_changelog.md`

变更原因：

- 按长期任务卡推进 `TC-31`，完成 v0.3.x 剧情状态 MVP 的文档收口和回归范围记录。

主要变化：

- README 更新到 v0.3.x 完成状态。
- 数据模型文档补充状态导入导出和最近草稿存储边界。
- 新增测试文档，记录本地测试命令、v0.3.x 回归范围和 MuMu smoke 前置条件。
- 记录 MuMu adb 的环境问题。

影响范围：

- 只影响文档。
- 不改变代码逻辑和 SillyTavern 写入策略。

验证情况：

- TC-31 后执行语法检查：33 个 JavaScript 文件通过。
- TC-31 后执行无参数单元测试：20 个 `.mjs` 测试通过。
- MuMu 页面 smoke 因 adb daemon 无法写入 Temp `adb.log` 被阻塞，已记录明确环境原因。

### 2026-07-10：完成 TC-32 状态合并与历史归档核心逻辑

变更类型：功能 / 测试 / 文档

涉及文件：

- `setting-organizer/src/core/stateArchive.js`
- `setting-organizer/src/core/stateMerger.js`
- `setting-organizer/tests/stateMerger.test.mjs`
- `docs/DATA_MODEL.md`
- `docs/TESTING.md`
- `setting_organizer_long_term_task_cards.md`
- `setting_organizer_development_log.md`
- `setting_organizer_doc_changelog.md`

变更原因：

- 按长期任务卡推进 `TC-32`，为后续状态差异预览 UI 和冲突检测提供可复用 core 层。

主要变化：

- 新增状态归档 helper。
- 新增状态合并器，支持人物、势力、任务、道具合并。
- 合并结果返回 `operationId`、merged state、diff 和 summary。
- 旧状态通过归档字段保留，不直接删除。

影响范围：

- 影响剧情状态 core 层。
- 不影响设定整理、角色创建、世界书创建或 SillyTavern 写入流程。

验证情况：

- 新增模块语法检查通过。
- `stateMerger.test.mjs` 通过。
- 全量回归通过：35 个 JavaScript 文件语法检查，21 个无参数 `.mjs` 测试。

### 2026-07-10：完成 TC-33 状态差异预览 UI

变更类型：功能 / UI / 测试 / 文档

涉及文件：

- `setting-organizer/src/ui/stateDiffPanel.js`
- `setting-organizer/src/ui/statePanel.js`
- `setting-organizer/style.css`
- `setting-organizer/tests/stateDiffPanel.test.mjs`
- `setting-organizer/tests/statePanel.test.mjs`
- `setting-organizer/README.md`
- `docs/TESTING.md`
- `setting_organizer_long_term_task_cards.md`
- `setting_organizer_development_log.md`
- `setting_organizer_doc_changelog.md`

变更原因：

- 按长期任务卡推进 `TC-33`，为状态合并结果提供确认前预览，避免自动接受合并结论。

主要变化：

- 新增状态差异预览 UI。
- 状态面板新增“预览合并最近草稿”入口。
- 用户确认前不写 localStorage；确认后才保存最近状态草稿。

影响范围：

- 影响剧情状态 UI。
- 不影响角色 / 世界书创建流程。
- 不新增 SillyTavern 写入能力。

验证情况：

- 新增 UI 模块语法检查通过。
- `stateDiffPanel.test.mjs` 和 `statePanel.test.mjs` 通过。
- 全量回归通过：36 个 JavaScript 文件语法检查，22 个无参数 `.mjs` 测试。

### 2026-07-10：完成 TC-34 规则级状态冲突检测

变更类型：功能 / 测试 / 文档

涉及文件：

- `setting-organizer/src/core/conflictDetector.js`
- `setting-organizer/tests/conflictDetector.test.mjs`
- `setting-organizer/README.md`
- `docs/DATA_MODEL.md`
- `docs/TESTING.md`
- `setting_organizer_long_term_task_cards.md`
- `setting_organizer_development_log.md`
- `setting_organizer_doc_changelog.md`

变更原因：

- 按长期任务卡推进 `TC-34`，为后续冲突检测 UI 提供只读规则检测能力。

主要变化：

- 新增规则级冲突检测器。
- 覆盖人物地点、人物状态、任务状态、道具持有人、势力态度和 active archive 边界。
- 冲突检测只提示，不修改状态。

影响范围：

- 影响剧情状态 core 层。
- 不影响 UI、角色 / 世界书创建或 SillyTavern 写入流程。

验证情况：

- 新增模块语法检查通过。
- `conflictDetector.test.mjs` 通过。
- 全量回归通过：37 个 JavaScript 文件语法检查，23 个无参数 `.mjs` 测试。

### 2026-07-10：完成 TC-35 冲突检测 UI 与处理建议

变更类型：功能 / UI / 测试 / 文档

涉及文件：

- `setting-organizer/src/core/conflictDetector.js`
- `setting-organizer/src/ui/conflictPanel.js`
- `setting-organizer/src/ui/statePanel.js`
- `setting-organizer/style.css`
- `setting-organizer/tests/conflictDetector.test.mjs`
- `setting-organizer/tests/conflictPanel.test.mjs`
- `setting-organizer/tests/statePanel.test.mjs`
- `setting-organizer/README.md`
- `docs/DATA_MODEL.md`
- `setting_organizer_long_term_task_cards.md`
- `setting_organizer_development_log.md`
- `setting_organizer_doc_changelog.md`

变更原因：

- 按长期任务卡推进 `TC-35`，让规则级冲突结果可理解、可追溯且不改变草稿。

主要变化：

- 新增按严重程度排序的冲突提示面板。
- 展示冲突对象、字段、取值、来源 ID 和来源消息范围，并提供处理建议。
- 状态面板增加显式检测操作；检测不会自动归档或写入酒馆。

影响范围：

- 影响剧情状态 UI 与冲突记录数据。
- 不影响角色 / 世界书创建流程，不新增 SillyTavern 写入能力。

验证情况：

- 全量回归通过：38 个 JavaScript 文件语法检查，24 个无参数 `.mjs` 测试。
- SillyTavern 1.18.0 本地浏览器 smoke 通过：状态模式、mock 草稿、冲突检测空结果和不自动修改草稿提示。
- 冲突详情、来源 ID、来源范围和处理建议由定向单元测试覆盖。

### 2026-07-10：完成 TC-36 状态到世界书草稿转换

变更类型：功能 / 测试 / 文档

涉及文件：

- `setting-organizer/src/core/worldbookSyncBuilder.js`
- `setting-organizer/src/adapters/lorebookAdapter.js`
- `setting-organizer/tests/worldbookSyncBuilder.test.mjs`
- `setting-organizer/tests/exporter.test.mjs`
- `docs/DATA_MODEL.md`
- `setting_organizer_long_term_task_cards.md`
- `setting_organizer_development_log.md`
- `setting_organizer_doc_changelog.md`

主要变化：

- 将剧情状态构建为已有世界书草稿兼容结构。
- 输出分类草稿、来源元数据和不触碰酒馆数据的差异预览。

影响范围：

- 影响剧情状态 core 与世界书 adapter 元数据。
- 不新增 SillyTavern 写入、覆盖或自动禁用能力。

验证情况：

- 全量回归通过：39 个 JavaScript 文件语法检查，25 个无参数 `.mjs` 测试。

### 2026-07-10：完成 TC-37 世界书同步确认流程

变更类型：功能 / UI / 测试 / 实测 / 文档

主要变化：

- 状态世界书预览后可选择分类并显式创建新的世界书。
- 复用备份、创建、旧数据校验和原生编辑器交接机制。
- 修正创建报告把世界书名称显示为角色名称的问题。

实测情况：

- SillyTavern 1.18.0 创建流程通过；测试世界书 `设定整理器导入 20260710103723705` 保留。

验证情况：

- 全量回归通过：39 个 JavaScript 文件语法检查，26 个无参数 `.mjs` 测试。

### 2026-07-10：完成 TC-38 模板定义与选择

变更类型：功能 / UI / 测试 / 文档

主要变化：

- 增加通用、历史模拟和跑团 / DND 内置模板。
- 通过模板 ID 解耦设置、prompt 与状态面板 UI 分组。
- 保持默认模板的已有状态草稿兼容性，不支持用户自定义脚本模板。

验证情况：

- 全量回归通过：40 个 JavaScript 文件语法检查，27 个无参数 `.mjs` 测试。

### 2026-07-10：完成 TC-39 模板测试样例与文档

变更类型：测试 / 文档

主要变化：

- 为三种内置模板添加文本输入和期望草稿样例。
- 样例在 mock 模式下自动验证，避免把模型随机性写成固定断言。
- 增加模板使用场景与限制说明。

验证情况：

- 全量回归通过：40 个 JavaScript 文件语法检查，28 个无参数 `.mjs` 测试。

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
