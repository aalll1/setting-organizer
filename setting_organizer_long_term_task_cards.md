# Setting Organizer 长期规划任务卡

生成日期：2026-07-09  
来源文档：`setting-organizer-long-term-dev-reference.md`  
当前基线：`v0.2.0`，GitHub 原生安装仓库 `aalll1/setting-organizer`

## 使用说明

本文件把长期开发参考文档中尚未实现的部分拆成可执行任务卡。任务卡从 `TC-21` 开始，接续已完成的 `TC-00` 到 `TC-20`。

执行原则：

- 先做 `v0.2.1` 稳定性修复，再进入剧情状态功能。
- 长期愿景不得直接当成单次开发任务执行。
- 每个任务进入代码开发前，必须重新读取当前源码和相关文档。
- 任何写入 SillyTavern 的能力必须保留用户确认、备份、诊断日志和错误报告。
- 不复制 SillyTavern 原生角色管理器或世界书管理器。
- 原始模型输出可能包含隐私内容，默认不得完整写入诊断日志或自动导出。

任务状态建议：

```text
未开始 / 进行中 / 已完成 / 阻塞 / 暂缓
```

---

## v0.2.1 稳定性修复

### TC-21 JSON 提取与截断识别

状态：已完成

阶段：v0.2.1

依赖：TC-20

目标：降低真实模型输出因 Markdown 包裹、自然语言前后缀、半截 JSON 导致的 `E002` 失败率，并给出更明确的截断提示。

计划文件：

- `setting-organizer/src/core/parser.js`
- `setting-organizer/src/core/errors.js`
- `setting-organizer/tests/validator.test.mjs`
- `setting-organizer/tests/parser.test.mjs` 或新增同类测试
- `setting-organizer/test-samples/`

功能要求：

- 新增确定性 `extractLikelyJson(rawText)` 逻辑。
- 支持 fenced JSON、自然语言 + JSON、前后空白。
- 识别常见截断错误，例如缺少右大括号、`Unexpected end of JSON input`。
- 截断场景仍映射到 `E002`，但错误提示要明确“疑似被截断”。
- 增加 raw output 长度、首尾预览的日志字段，但默认不保存完整原始输出。

验收标准：

- 普通 JSON、Markdown JSON、自然语言 + JSON 均可解析。
- 半截 JSON 返回可读截断提示。
- 非 JSON 文本仍返回 `E002`。
- 新增测试覆盖至少 6 种模型输出形态。

完成记录：

- 新增 `extractLikelyJson(rawText)`。
- 支持完整 fenced JSON、嵌入式 fenced JSON、自然语言前后缀和前后空白。
- 解析失败时记录 raw output 长度、提取 JSON 长度、首尾预览、fenced JSON 标记、起止大括号标记和疑似截断标记。
- 半截 JSON 仍使用 `E002`，但错误消息改为“模型输出疑似被截断，无法解析为完整 JSON。”。
- 新增 `parser.test.mjs`，覆盖 7 种输出形态。

风险点：

- 不能用正则“修复”出错误 JSON 后静默通过。
- 自动提取 JSON 时不能误截取正文中的普通 `{}` 片段。

不做事项：

- 不做 LLM 二次修复重试。
- 不引入重型 JSON repair 依赖。

### TC-22 Prompt 压缩与输出约束优化

状态：已完成

阶段：v0.2.1

依赖：TC-21

目标：缩短设定提取 prompt，降低模型输出长 JSON 时被截断的概率。

计划文件：

- `setting-organizer/src/prompts/extractSetting.js`
- `setting-organizer/tests/prompt.test.mjs`
- `setting-organizer/README.md`

功能要求：

- 将完整模板从格式化 JSON 改为压缩 JSON。
- 明确要求模型只输出一个 JSON 对象。
- 明确禁止 Markdown、解释、前后说明。
- 顶层必须包含 `characters` 和 `lorebookEntries`。
- 缺失字段允许由 normalizer 补全。

验收标准：

- prompt 测试通过。
- prompt 长度比当前版本下降。
- mock 流程和当前模型流程仍使用同一内部草稿结构。

完成记录：

- `EXTRACT_SETTING_PROMPT_VERSION` 更新为 `extract-setting-v0.2.1`。
- 输出规则改为“只输出一个压缩 JSON 对象”。
- 明确禁止 JSON 前后说明、标题、列表或换行解释。
- 明确顶层必须包含 `characters` 和 `lorebookEntries`，缺失字段由 normalizer 补全。
- 模板序列化从格式化 JSON 改为压缩 JSON。
- `prompt.test.mjs` 增加压缩模板断言和长度下降断言。

风险点：

- 过度压缩 prompt 可能降低模型遵循字段含义的能力。

不做事项：

- 不改变内部草稿 schema。
- 不新增剧情状态字段。

### TC-23 原始模型输出调试面板

状态：已完成

阶段：v0.2.1

依赖：TC-21

目标：提供用户显式触发的模型输出调试能力，解决 `E002` 排查困难。

计划文件：

- `setting-organizer/src/ui/diagnostics.js`
- `setting-organizer/src/core/logger.js`
- `setting-organizer/src/core/analyzer.js`
- `setting-organizer/src/storage/settings.js`
- `setting-organizer/tests/logger.test.mjs`

功能要求：

- 显示本次输入长度、prompt 长度、模型返回长度。
- 显示模型返回首部预览和尾部预览。
- 标记是否检测到 fenced JSON、JSON 起止大括号、疑似截断。
- 提供复制原始输出和下载原始输出按钮。
- 完整原始输出只在用户显式操作时导出。
- 导出完整原始输出前必须提示可能包含聊天隐私。

验收标准：

- 默认诊断日志不保存完整原始输出。
- 预览长度可控，长文本会截断。
- 用户可复制或下载完整原始输出。
- 清空诊断日志不影响当前页面已经显示的错误报告。

完成记录：

- 新增 `modelOutputDebug.js`，用 module-scoped 状态保存最近一次原始模型输出，默认不写入 localStorage。
- `analyzer.js` 在真实 SillyTavern 模型模式下捕获 source 长度、prompt 长度、raw output 长度和输出检查结果。
- `diagnostics.js` 显示本次模型输出调试摘要，并提供复制 / 下载原始输出按钮。
- 复制或下载完整原始输出前弹出隐私确认。
- 新增 `modelOutputDebug.test.mjs`，验证默认日志只保存摘要、不保存完整 raw output。

风险点：

- 原始输出可能包含敏感聊天内容。
- 移动端下载位置不可控。

不做事项：

- 不自动上传日志。
- 不默认把完整 raw output 写入 localStorage。

### TC-24 输入规模提示与分析前确认

状态：已完成

阶段：v0.2.1

依赖：TC-13，TC-16

目标：在长输入或大量聊天读取时提前提示截断风险，减少真实模型输出失败。

计划文件：

- `setting-organizer/src/core/tokenEstimate.js`
- `setting-organizer/src/core/warnings.js`
- `setting-organizer/src/ui/panel.js`
- `setting-organizer/src/adapters/chatAdapter.js`
- `setting-organizer/tests/tokenEstimate.test.mjs`
- `setting-organizer/tests/chatAdapter.test.mjs`

功能要求：

- 超过 3000 字符提示建议分批。
- 超过 8000 字符提示可能导致模型输出截断。
- 超过 15000 字符时，真实模型分析前要求用户确认。
- 聊天读取后显示消息条数、用户/AI 消息数、字符数、估算 token。
- 手动粘贴和聊天读取都走同一规模提示逻辑。

验收标准：

- 短文本不额外打扰。
- 长文本显示明确风险提示。
- 超长输入不会直接静默进入真实模型分析。
- mock 模式不被不必要阻塞。

完成记录：

- `tokenEstimate.js` 新增 `TEXT_LENGTH_THRESHOLDS` 和 `assessInputScale(text)`。
- `warnings.js` 复用输入规模评估，将长输入风险写入草稿 warnings。
- `chatAdapter.js` 返回用户消息数、AI/角色消息数、字符数、token 估算和输入规模评估。
- `panel.js` 在聊天读取后显示消息条数、用户/AI 数、字符数、token 和规模警告。
- `panel.js` 在真实模型模式且输入超过 15000 字符时要求用户确认；mock 模式不阻塞。
- `tokenEstimate.test.mjs` 和 `chatAdapter.test.mjs` 增加覆盖。

风险点：

- 字符阈值和 token 估算都是启发式，不应写成绝对上限。

不做事项：

- 不删除用户输入。
- 不自动截断输入。

### TC-25 错误码扩展与错误帮助文档同步

状态：已完成

阶段：v0.2.1

依赖：TC-21，TC-24

目标：补齐长期规划中提到但当前未实现的输入类错误码，并保持 UI、日志、文档一致。

计划文件：

- `setting-organizer/src/core/errors.js`
- `setting-organizer/tests/errors.test.mjs`
- `setting-organizer/README.md`
- `setting_organizer_feature_overview.md`
- `setting_organizer_user_guide.md`

功能要求：

- 评估并新增输入类错误码，例如 `EMPTY_INPUT`、`INVALID_INPUT`。
- 每个新增错误码必须有 `ERROR_HELP` 标题、说明和建议。
- 错误码表、使用说明、功能说明同步更新。
- 旧错误码 `E001` 到 `E013` 不改含义。

验收标准：

- `errors.test.mjs` 覆盖所有错误码帮助映射。
- 空输入、非文本输入、超长确认取消等路径有明确错误提示。

完成记录：

- 新增 `E014 INVALID_INPUT`、`E015 EMPTY_INPUT`、`E016 INPUT_CONFIRMATION_CANCELLED`。
- `ERROR_HELP` 覆盖新增错误码。
- `analyzer.js` 在入口校验非文本输入和空输入。
- `panel.js` 的空输入和超长取消路径改为统一 `formatError()` 展示。
- README、功能说明和使用说明同步更新错误码表。
- 新增 `analyzer.test.mjs`，扩展 `errors.test.mjs`。

风险点：

- 改错误码可能影响已有文档和用户排障。

不做事项：

- 不重编号已有错误码。

### TC-26 v0.2.1 回归测试与发布准备

状态：未开始

阶段：v0.2.1 收尾

依赖：TC-21，TC-22，TC-23，TC-24，TC-25

目标：完成稳定性修复版测试、文档和发布准备。

计划文件：

- `setting-organizer/manifest.json`
- `setting-organizer/README.md`
- `setting_organizer_development_log.md`
- `setting_organizer_doc_changelog.md`
- `setting_organizer_runtime_test_report_v021_*.md`
- `setting-organizer-native-install/`

功能要求：

- 本地语法检查通过。
- 全部 `.mjs` 测试通过。
- MuMu / SillyTavern smoke test 覆盖 mock、真实短文本、截断错误提示、诊断导出。
- 发布目录同步更新。
- GitHub 发布仓库同步更新。

验收标准：

- manifest 版本仅在测试通过后更新到 `0.2.1`。
- 创建本地 tag 和 GitHub 发布 tag。
- 安装 URL 仍可用。

风险点：

- 真实模型输出受当前模型影响，测试报告必须记录模型和环境。

不做事项：

- 不进入剧情状态管理。
- 不新增世界书覆盖能力。

---

## v0.3.x 剧情状态整理 MVP

### TC-27 剧情状态数据模型与 schema 草案

状态：未开始

阶段：v0.3.0

依赖：TC-26

目标：建立剧情状态草稿的数据边界，不先做 UI 和写入。

计划文件：

- `setting-organizer/src/schemas/campaignState.schema.json`
- `setting-organizer/src/core/stateTypes.js` 或 JSDoc typedef 所在文件
- `docs/DATA_MODEL.md` 或项目现有数据模型文档

功能要求：

- 定义 `CampaignState` 顶层结构。
- 包含 `schemaVersion`。
- 首版只覆盖剧情摘要、人物、势力、任务、关键道具。
- 每类对象包含 `id`、`sourceMessageRange`、`confidence`、`warnings`。
- 明确当前状态、历史归档和永久设定的边界。

验收标准：

- 数据结构文档可单独指导实现。
- 不与现有角色草稿、世界书草稿结构混用。

风险点：

- 过早设计复杂 schema 会拖慢 MVP。

不做事项：

- 不做持久化。
- 不做世界书同步。

### TC-28 剧情状态提取 prompt 与 parser

状态：未开始

阶段：v0.3.0

依赖：TC-27

目标：从文本或聊天中生成剧情状态草稿。

计划文件：

- `setting-organizer/src/prompts/extractState.js`
- `setting-organizer/src/core/stateParser.js`
- `setting-organizer/src/core/stateNormalizer.js`
- `setting-organizer/src/core/stateValidator.js`
- `setting-organizer/tests/stateParser.test.mjs`

功能要求：

- 新增“剧情状态整理模式”的 prompt。
- 输出必须符合 `campaign-state-v0.1`。
- 复用 v0.2.1 的 JSON 提取和截断识别能力。
- 缺失字段由 normalizer 补全。

验收标准：

- mock 状态草稿可解析。
- Markdown JSON、自然语言 + JSON、半截 JSON 测试覆盖。
- 不影响现有设定整理模式。

风险点：

- 模型可能混淆角色草稿和状态草稿。

不做事项：

- 不写入 SillyTavern。
- 不做状态合并。

### TC-29 剧情状态草稿 UI

状态：未开始

阶段：v0.3.0

依赖：TC-28

目标：显示和编辑剧情状态草稿，但不持久化、不同步世界书。

计划文件：

- `setting-organizer/src/ui/statePanel.js`
- `setting-organizer/src/ui/panel.js`
- `setting-organizer/src/ui/results.js`
- `setting-organizer/style.css`

功能要求：

- 增加模式选择：设定整理 / 剧情状态整理。
- 展示剧情摘要、人物、势力、任务、关键道具。
- 支持编辑草稿字段。
- 支持删除草稿项。
- 显示 confidence 和 warnings。

验收标准：

- 状态草稿展示不影响角色/世界书草稿展示。
- 移动端可用。
- UI 文案明确“草稿，未写入”。

风险点：

- 状态 UI 过大可能挤占现有面板。

不做事项：

- 不做复杂关系图。
- 不做拖拽排序。

### TC-30 剧情状态导出与导入

状态：未开始

阶段：v0.3.1

依赖：TC-29

目标：让剧情状态草稿可保存为 JSON，并可从 JSON 重新载入。

计划文件：

- `setting-organizer/src/core/stateExporter.js`
- `setting-organizer/src/storage/stateStore.js`
- `setting-organizer/src/ui/statePanel.js`
- `setting-organizer/tests/stateExporter.test.mjs`

功能要求：

- 导出当前状态草稿 JSON。
- 导入状态 JSON 并校验 schemaVersion。
- localStorage 保存最近状态草稿。
- 导入失败显示可读错误。

验收标准：

- 导出的状态 JSON 可再次导入。
- schemaVersion 不匹配时有明确提示。
- 不影响现有设定草稿备份。

风险点：

- localStorage 容量有限。

不做事项：

- 不自动合并多份状态。

### TC-31 v0.3.x 回归测试与文档收口

状态：未开始

阶段：v0.3.x 收尾

依赖：TC-27，TC-28，TC-29，TC-30

目标：完成剧情状态 MVP 的测试和文档。

计划文件：

- `setting-organizer/README.md`
- `docs/DATA_MODEL.md`
- `docs/TESTING.md`
- `setting_organizer_development_log.md`
- `setting_organizer_doc_changelog.md`

功能要求：

- 记录剧情状态模式边界。
- 记录数据结构和测试样例。
- 更新使用说明和错误处理。

验收标准：

- 单元测试通过。
- MuMu 页面 smoke test 通过。
- 不改变 SillyTavern 写入安全策略。

风险点：

- 新模式可能让用户误以为已自动写入状态。

不做事项：

- 不发布未测试的状态写入能力。

---

## v0.4.x 状态更新与归档

### TC-32 状态合并与历史归档核心逻辑

状态：未开始

阶段：v0.4.0

依赖：TC-30

目标：将新提取的状态草稿与已有状态库合并，并保留历史归档。

计划文件：

- `setting-organizer/src/core/stateMerger.js`
- `setting-organizer/src/core/stateArchive.js`
- `setting-organizer/tests/stateMerger.test.mjs`
- `docs/DATA_MODEL.md`

功能要求：

- 合并人物、势力、任务、道具状态。
- 旧状态不删除，标记为 archived。
- 新旧状态差异可追踪。
- 每次合并生成 operationId。

验收标准：

- 同一人物地点变化时保留旧状态归档。
- 同一道具持有人变化时生成差异。
- 重复导入同一状态不会制造重复项。

风险点：

- 身份匹配错误会造成状态污染。

不做事项：

- 不做语义级实体消歧。

### TC-33 状态差异预览 UI

状态：未开始

阶段：v0.4.0

依赖：TC-32

目标：在保存合并前展示状态差异，让用户确认。

计划文件：

- `setting-organizer/src/ui/stateDiffPanel.js`
- `setting-organizer/src/ui/statePanel.js`
- `setting-organizer/style.css`

功能要求：

- 展示新增、修改、归档、冲突。
- 用户确认后保存。
- 用户取消时不改变已有状态。

验收标准：

- 差异列表可读。
- 确认前不写 localStorage。

风险点：

- 差异 UI 复杂度可能较高。

不做事项：

- 不自动接受 AI 结论。

---

## v0.5.x 冲突检测

### TC-34 规则级状态冲突检测

状态：未开始

阶段：v0.5.0

依赖：TC-32

目标：用确定性规则检测剧情状态冲突。

计划文件：

- `setting-organizer/src/core/conflictDetector.js`
- `setting-organizer/tests/conflictDetector.test.mjs`
- `docs/TESTING.md`

功能要求：

- 检测同名人物多个所在地。
- 检测同名人物多个生死状态。
- 检测同一任务多个状态。
- 检测同一道具多个持有人。
- 检测同一势力多个态度。
- 检测当前状态和历史归档同时启用。

验收标准：

- 每类冲突至少有一个测试。
- 冲突只提示，不自动修改状态。

风险点：

- 规则级检测可能产生误报。

不做事项：

- 不做高级语义冲突推理。
- 不调用模型判断冲突。

### TC-35 冲突检测 UI 与处理建议

状态：未开始

阶段：v0.5.0

依赖：TC-34

目标：把冲突结果以用户可处理的方式展示。

计划文件：

- `setting-organizer/src/ui/conflictPanel.js`
- `setting-organizer/src/ui/statePanel.js`
- `setting-organizer/style.css`

功能要求：

- 按严重程度展示冲突。
- 显示冲突对象和来源范围。
- 给出处理建议，例如确认最新状态、归档旧状态。

验收标准：

- 用户能看懂冲突原因。
- 不阻塞查看状态草稿。

风险点：

- 误报过多会影响体验。

不做事项：

- 不自动归档旧状态。

---

## v0.6.x 世界书同步增强

### TC-36 状态到世界书草稿转换

状态：未开始

阶段：v0.6.0

依赖：TC-34

目标：把结构化剧情状态转换为 SillyTavern 世界书草稿。

计划文件：

- `setting-organizer/src/core/worldbookSyncBuilder.js`
- `setting-organizer/src/adapters/lorebookAdapter.js`
- `setting-organizer/tests/worldbookSyncBuilder.test.mjs`
- `docs/DATA_MODEL.md`

功能要求：

- 生成当前状态世界书草稿。
- 生成历史归档世界书草稿。
- 支持分类：永久设定、当前状态、任务状态、人物状态、势力状态、关键道具、历史归档。
- 生成前展示差异预览。

验收标准：

- 输出仍走现有世界书草稿和导入确认流程。
- 不直接覆盖已有世界书。

风险点：

- 动态状态写入世界书容易污染上下文。

不做事项：

- 不直接覆盖旧世界书。
- 不自动禁用旧条目。

### TC-37 世界书同步确认流程

状态：未开始

阶段：v0.6.0

依赖：TC-36

目标：提供安全的状态世界书创建流程。

计划文件：

- `setting-organizer/src/core/importer.js`
- `setting-organizer/src/ui/confirm.js`
- `setting-organizer/src/ui/statePanel.js`
- `setting-organizer/tests/importer.test.mjs`

功能要求：

- 用户选择哪些状态同步到世界书。
- 写入前创建备份。
- 创建新世界书。
- 显示创建报告。
- 可选打开原生世界书编辑器。

验收标准：

- 复用现有创建世界书安全策略。
- 旧世界书不被覆盖或删除。

风险点：

- 用户可能误以为同步会自动维护最新状态。

不做事项：

- 不做完整世界书编辑器。

---

## v0.7.x 模板系统

### TC-38 模板定义与选择

状态：未开始

阶段：v0.7.0

依赖：TC-31

目标：支持不同玩法模板，控制剧情状态字段和 prompt。

计划文件：

- `setting-organizer/src/templates/`
- `setting-organizer/src/prompts/extractState.js`
- `setting-organizer/src/storage/settings.js`
- `docs/DATA_MODEL.md`

功能要求：

- 内置基础模板：通用、历史模拟、跑团 / DND。
- 模板决定状态字段、提示词侧重点和 UI 分组。
- 用户可选择模板。
- 默认模板保持向后兼容。

验收标准：

- 切换模板不会破坏已有基础状态草稿。
- 每个模板有测试样例。

风险点：

- 模板系统容易过早复杂化。

不做事项：

- 不支持用户自定义脚本模板。

### TC-39 模板测试样例与文档

状态：未开始

阶段：v0.7.0

依赖：TC-38

目标：为模板系统补充测试文本和说明。

计划文件：

- `setting-organizer/test-samples/templates/`
- `docs/TESTING.md`
- `docs/USER_GUIDE.md`

功能要求：

- 每个模板至少一份输入样例。
- 每个模板至少一份期望输出草稿。
- 文档说明模板适用场景和限制。

验收标准：

- 模板测试可自动运行或半自动验证。

风险点：

- 样例过少会导致模板质量不可评估。

不做事项：

- 不承诺覆盖所有玩法。

---

## 工程化与文档体系

### TC-40 正式 docs 目录拆分

状态：未开始

阶段：工程化

依赖：当前长期规划文档

目标：把长期参考文档拆分成正式维护文档，降低单文件过长和职责混杂问题。

计划文件：

- `docs/ROADMAP.md`
- `docs/DEVELOPMENT.md`
- `docs/ARCHITECTURE.md`
- `docs/DATA_MODEL.md`
- `docs/TESTING.md`
- `docs/API_COMPATIBILITY.md`
- `docs/CHANGELOG.md`
- `docs/KNOWN_ISSUES.md`
- `docs/AGENT_GUIDE.md`

功能要求：

- 长期路线进入 `ROADMAP.md`。
- 工程规范进入 `DEVELOPMENT.md`。
- 模块边界进入 `ARCHITECTURE.md`。
- 测试矩阵进入 `TESTING.md`。
- Agent 执行规则进入 `AGENT_GUIDE.md`。

验收标准：

- 每份文档职责明确。
- README 只保留用户安装和使用入口。
- 旧长期参考文档保留为历史材料或索引。

风险点：

- 一次性拆分文档较多，容易造成重复和过期。

不做事项：

- 不在本任务中改业务代码。

### TC-41 常量与命名边界整理

状态：未开始

阶段：工程化

依赖：TC-26

目标：减少魔法值，统一核心概念命名。

计划文件：

- `setting-organizer/src/constants/`
- `setting-organizer/src/core/errors.js`
- `setting-organizer/src/adapters/chatAdapter.js`
- `setting-organizer/src/core/tokenEstimate.js`
- `docs/DEVELOPMENT.md`

功能要求：

- 提取聊天范围、文本长度阈值、预览长度、默认 confidence、日志事件名。
- 明确内部使用 `lorebook`，SillyTavern adapter 使用 `worldInfo`。
- 不重命名用户可见中文“世界书”。

验收标准：

- 常量集中管理。
- 现有测试通过。
- 文档记录命名边界。

风险点：

- 机械重命名可能引入回归。

不做事项：

- 不做大规模 UI 重构。

### TC-42 质量脚本与测试入口工程化

状态：未开始

阶段：工程化

依赖：TC-26

目标：给项目补充统一测试入口，避免每次手写长命令。

计划文件：

- `setting-organizer/package.json`
- `setting-organizer/tests/`
- `docs/TESTING.md`

功能要求：

- 增加 `npm test`。
- 增加 `npm run check` 或等价语法检查脚本。
- 明确 `cdp-check.mjs` 是辅助脚本，不作为默认单元测试。
- 不引入不必要构建步骤。

验收标准：

- `npm test` 运行全部单元测试。
- `npm run check` 检查关键 JS 文件语法。
- 文档同步测试命令。

风险点：

- 引入 npm 项目后可能被误解为需要构建。

不做事项：

- 不迁移 TypeScript。
- 不引入打包器。

---

## 推荐执行顺序

```text
TC-21
-> TC-22
-> TC-23
-> TC-24
-> TC-25
-> TC-26
-> TC-40
-> TC-41
-> TC-42
-> TC-27
-> TC-28
-> TC-29
-> TC-30
-> TC-31
-> TC-32
-> TC-33
-> TC-34
-> TC-35
-> TC-36
-> TC-37
-> TC-38
-> TC-39
```

近期最小可执行闭环：

```text
TC-21
-> TC-22
-> TC-23
-> TC-24
-> TC-25
-> TC-26
```

## 明确暂不执行

- 完整 RAG。
- 向量数据库。
- 关系图。
- 高级语义冲突推理。
- 完整世界书管理器。
- 完整角色管理器。
- 自动覆盖或删除用户已有 SillyTavern 数据。
- 未经确认自动禁用旧世界书条目。
