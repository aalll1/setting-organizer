# SillyTavern 设定整理器任务卡

## 使用说明

本文件用于把 `setting_organizer_agent_dev_plan.md` 拆解为可交给 Agent 逐项执行的任务卡。

Agent 执行任意任务卡前必须：

- 先读取相关文档和当前项目结构。
- 明确计划新增或修改的文件。
- 获得用户写入许可后再执行。
- 每张任务卡完成后输出验证结果和遗留问题。

任务状态建议使用：

```text
未开始 / 进行中 / 已完成 / 阻塞 / 暂缓
```

## TC-00 项目侦察

状态：已完成

阶段：阶段 0

目标：确认当前目录是空项目、已有扩展项目，还是只有规划文档。

输入：

- 当前工作目录
- 已有 Markdown 文档

建议只读命令：

- `rg --files`
- 查找 `manifest.json`
- 查找 `package.json`
- 查找 `index.js`
- 查找 `README.md`

输出：

- 当前目录结构说明
- 是否需要新建扩展目录
- 下一步实施建议

验收标准：

- 未发生写入。
- 能明确说明项目现状。
- 能判断后续是新建扩展还是改造已有扩展。

风险点：

- 不要因为只有规划文档就直接写代码。
- 不要修改现有规划文档。

## TC-01 创建扩展骨架

状态：已完成

阶段：阶段 1

依赖：TC-00

目标：创建最小可加载的 SillyTavern 扩展骨架。

计划文件：

- `setting-organizer/manifest.json`
- `setting-organizer/index.js`
- `setting-organizer/style.css`
- `setting-organizer/README.md`

功能要求：

- 扩展能注册并加载。
- 提供基础面板。
- 面板包含文本输入框、开始分析按钮、结果区域。
- 点击按钮显示占位结果。

验收标准：

- SillyTavern 能识别扩展。
- 打开面板不报错。
- 点击按钮有可见反馈。
- 页面刷新后扩展仍可加载。

风险点：

- SillyTavern 扩展 manifest 字段可能随版本变化。
- 需要先确认当前 SillyTavern 版本的第三方扩展规范。

## TC-01A SillyTavern API 探针

状态：已完成

阶段：阶段 1A

依赖：TC-01

目标：确认当前 SillyTavern 版本可用的扩展接口，避免后续任务建立在未验证 API 上。

计划文件：

- 原则上不新增业务文件。
- 如必须记录探针结果，可新增 `setting-organizer/API_COMPATIBILITY.md`。

探针范围：

- 扩展入口和加载生命周期。
- 扩展设置保存方式。
- 当前模型调用方式。
- 当前聊天读取方式。
- 角色创建能力。
- 世界书创建能力。
- 是否有官方接口、稳定辅助函数或只能访问内部对象。

输出：

```text
能力 | 可用性 | 接口位置 | 是否稳定 | 备注
扩展加载 | 是/否 | ... | ... | ...
设置保存 | 是/否 | ... | ... | ...
模型调用 | 是/否 | ... | ... | ...
聊天读取 | 是/否 | ... | ... | ...
角色创建 | 是/否 | ... | ... | ...
世界书创建 | 是/否 | ... | ... | ...
```

验收标准：

- 不进行业务写入。
- 明确后续 TC-06、TC-11、TC-12 是否可执行。
- 如果某项能力不可用，必须给出降级方案或标记阻塞。

风险点：

- 不要直接把探针代码混入业务逻辑。
- 不要在未确认接口稳定性前实现导入功能。

## TC-02 本地 UI 状态管理

状态：已完成

阶段：阶段 2

依赖：TC-01

目标：实现不依赖模型的基础 UI 流程和状态管理。

计划文件：

- `setting-organizer/src/ui/panel.js`
- `setting-organizer/src/storage/settings.js`
- `setting-organizer/style.css`

功能要求：

- 粘贴文本输入。
- 整理目标选择：角色卡、世界书。
- Token 预算模式选择：轻量、标准、长篇、自定义。
- 分析状态显示：空闲、分析中、成功、失败。
- 错误提示区域。
- 本地设置保存。

验收标准：

- 刷新页面后设置仍保留。
- 分析中按钮不可重复点击。
- 桌面和手机窄屏下可用。
- 不调用 AI。

风险点：

- 不要把设置保存到不可控全局对象。
- 不要保存 API Key 或认证信息。

## TC-03 模拟分析结果展示

状态：已完成

阶段：阶段 3

依赖：TC-02

目标：用 mock JSON 完成结果展示，不接入 AI。

计划文件：

- `setting-organizer/src/ui/results.js`
- `setting-organizer/src/ui/editor.js`
- `setting-organizer/src/core/analyzer.js`

功能要求：

- 固定 mock 角色草稿。
- 固定 mock 世界书草稿。
- 总览页。
- 角色字段展示。
- 世界书条目展示。
- 编辑字段。
- 删除草稿条目。
- 启用 / 禁用世界书条目。
- 修改关键词。

验收标准：

- mock 数据能完整展示。
- 用户编辑后状态同步更新。
- 删除条目不会影响其他条目。
- 修改关键词后结果区立即更新。
- 页面切换不丢失编辑结果。

风险点：

- 避免直接操作 DOM 导致状态不同步。
- 草稿数据不要使用 SillyTavern 原始写入格式。

## TC-04 JSON Schema 与解析校验

状态：已完成

阶段：阶段 4

依赖：TC-03

目标：建立模型输出到内部草稿的安全入口。

计划文件：

- `setting-organizer/src/schemas/analysisResult.schema.json`
- `setting-organizer/src/schemas/characterDraft.schema.json`
- `setting-organizer/src/schemas/lorebookDraft.schema.json`
- `setting-organizer/src/core/parser.js`
- `setting-organizer/src/core/validator.js`
- `setting-organizer/src/core/normalizer.js`

功能要求：

- 解析 JSON。
- 拦截非 JSON。
- 校验 schema。
- 缺省字段补全。
- 简单类型修正。
- 统一错误码。

错误码：

- `E001` 模型调用失败
- `E002` 模型输出不是合法 JSON
- `E003` JSON Schema 校验失败
- `E004` 结果为空
- `E005` Token 超过预算
- `E006` 导出失败
- `E007` 创建备份失败
- `E008` 创建角色失败
- `E009` 创建世界书失败
- `E010` 当前 SillyTavern 接口不兼容
- `E011` 旧数据完整性校验失败
- `E012` 当前聊天读取失败

Schema 异常处理规则：

| 场景 | 处理方式 |
| --- | --- |
| 顶层不是对象 | 拒绝，显示 `E003` |
| `characters` 缺失 | 补空数组 |
| `lorebookEntries` 缺失 | 补空数组 |
| `characters` 和 `lorebookEntries` 均为空 | 拒绝，显示 `E004` |
| `warnings` 缺失 | 补空数组 |
| `name` 为空 | 允许进入编辑，增加警告，禁止直接导入 |
| `title` 为空 | 允许进入编辑，增加警告，禁止直接导入 |
| `keys` 为字符串 | 转为单元素数组，并增加警告 |
| `keys` 为空数组 | 允许进入编辑，增加警告，禁止直接导入世界书 |
| `confidence` 缺失 | 补 `0.8` |
| `confidence` 超出 0 到 1 | 截断到范围内，并增加警告 |
| 未识别字段 | 内部草稿保留，导出到 SillyTavern 兼容格式时剔除 |

验收标准：

- 非 JSON 不崩溃。
- 缺少可补字段时能补默认值。
- 关键字段错误时给出错误信息。
- 错误能展示给用户。

风险点：

- 不要让未经校验的模型结果直接进入 UI 状态。
- 不要在日志中打印敏感信息。

## TC-05 Prompt 模板

状态：已完成

阶段：阶段 5

依赖：TC-04

目标：建立可版本化的整理 Prompt。

计划文件：

- `setting-organizer/src/prompts/extractSetting.js`

功能要求：

- Prompt 版本为 `extract-setting-v0.1.0`。
- 要求模型只输出 JSON。
- 禁止 Markdown 代码块。
- 明确 schemaVersion。
- 要求不要编造未出现的信息。
- 无法判断时留空或写入 warnings。

验收标准：

- Prompt 输出目标结构明确。
- Prompt 中包含字段说明。
- Prompt 不要求模型直接执行写入。

风险点：

- Prompt 不要过长。
- 不要把 UI 说明混入模型输出要求。

## TC-06 SillyTavern 模型调用适配

状态：已完成

阶段：阶段 5

依赖：TC-01A、TC-05

目标：封装 SillyTavern 当前连接模型的调用方式。

计划文件：

- `setting-organizer/src/adapters/sillytavernApi.js`
- `setting-organizer/src/core/analyzer.js`

功能要求：

- 调用当前 SillyTavern 模型。
- 捕获调用失败。
- 返回原始模型文本。
- 接入 parser / validator / normalizer。
- 模型调用失败显示 `E001`。

验收标准：

- 简单角色设定能生成角色草稿。
- 世界观设定能生成世界书条目。
- 模型返回非 JSON 时显示 `E002`。
- 用户可以重新分析。

风险点：

- SillyTavern 内部接口可能变化。
- 所有 SillyTavern 内部对象访问必须集中在 adapter。
- 如果 TC-01A 显示模型调用能力不可用，本任务必须标记阻塞或降级为手动粘贴模型输出。

## TC-07 Token 粗估

状态：已完成

阶段：阶段 6

依赖：TC-04

目标：实现轻量 Token 粗估，不引入复杂 tokenizer。

计划文件：

- `setting-organizer/src/core/tokenEstimate.js`

估算规则：

- 中文：1 个汉字约 1 token。
- 英文：4 个字符约 1 token。
- 混合文本：总字符数 / 2 作为保守估算。

验收标准：

- 输入文本有 token 粗估。
- 输出草稿有 token 粗估。
- 编辑后估算结果更新。

风险点：

- 估算值只用于提示，不应作为精确计费依据。

## TC-08 基础警告

状态：已完成

阶段：阶段 6

依赖：TC-07

目标：实现规则级警告。

计划文件：

- `setting-organizer/src/core/warnings.js`
- `setting-organizer/src/ui/results.js`

警告类型：

- 输入过长
- 角色名称为空
- 世界书标题为空
- 世界书内容为空
- 世界书关键词为空
- 世界书关键词少于 2 个字符
- 世界书关键词重复
- 常驻条目过多
- 单条世界书内容过长

验收标准：

- 总览页能显示警告。
- 条目页能显示对应警告。
- 警告不阻止用户编辑。
- 严重错误才阻止导出或导入。

风险点：

- 不要做复杂语义冲突判断。

## TC-09 JSON 导出

状态：已完成

阶段：阶段 7

依赖：TC-04、TC-08

目标：实现安全导出。

计划文件：

- `setting-organizer/src/adapters/characterAdapter.js`
- `setting-organizer/src/adapters/lorebookAdapter.js`
- `setting-organizer/src/ui/results.js`

导出类型：

- 内部完整草稿 JSON
- 角色草稿 JSON
- 世界书草稿 JSON
- SillyTavern 兼容角色 JSON
- SillyTavern 兼容世界书 JSON

验收标准：

- 导出的 JSON 可以 `JSON.parse`。
- 内部元数据不会误写入 SillyTavern 兼容格式。
- 用户编辑后的内容能正确导出。
- 导出失败显示 `E006`。

风险点：

- 内部格式和 SillyTavern 格式必须分离。

## TC-10 备份能力

状态：已完成

阶段：阶段 8

依赖：TC-09

目标：在写入前建立备份能力。

计划文件：

- `setting-organizer/src/storage/backups.js`
- `setting-organizer/src/ui/confirm.js`

备份内容：

- 备份版本
- 创建时间
- 操作类型
- SillyTavern 版本
- 草稿数据
- 目标信息
- 写入前状态
- 写入后状态占位

验收标准：

- 备份成功后才允许导入。
- 备份失败显示 `E007`。
- 用户能看到备份时间和备份标识。
- 第一版不承诺完整自动回滚。
- 失败时必须显示已完成步骤、未完成步骤、可能影响范围和备份标识。

风险点：

- 不保存 API Key。
- 不保存不必要的隐私内容。

## TC-11 创建新世界书

状态：已完成

阶段：阶段 9

依赖：TC-10

目标：只创建新世界书，不修改已有世界书。

计划文件：

- `setting-organizer/src/adapters/lorebookAdapter.js`
- `setting-organizer/src/adapters/sillytavernApi.js`
- `setting-organizer/src/ui/confirm.js`

功能要求：

- 导入确认窗口。
- 显示即将创建的世界书名称。
- 显示条目数量。
- 显示关键词风险。
- 创建新世界书。
- 写入启用条目。
- 保存导入日志。

验收标准：

- 默认创建新世界书。
- 不修改全局世界书。
- 不修改已有世界书。
- 导入前记录已有世界书数量和摘要。
- 导入后对比旧世界书摘要，证明旧世界书未变化。
- 如果旧数据摘要变化，显示 `E011` 并标记导入异常。
- 失败时显示 `E009`。
- 显示成功创建的对象名称或 ID。

风险点：

- SillyTavern 世界书格式可能有版本差异。
- 不能用“导入成功”掩盖旧数据完整性校验失败。

## TC-12 创建新角色

状态：已完成

阶段：阶段 10

依赖：TC-10、TC-11

目标：只创建新角色，不覆盖当前角色。

计划文件：

- `setting-organizer/src/adapters/characterAdapter.js`
- `setting-organizer/src/adapters/sillytavernApi.js`
- `setting-organizer/src/ui/confirm.js`

功能要求：

- 角色草稿转 SillyTavern 角色格式。
- 创建新角色。
- 可选绑定新建世界书。
- 导入确认窗口展示所有变化。
- 保存导入日志。

验收标准：

- 默认创建新角色。
- 不覆盖当前角色。
- 导入前记录已有角色数量和摘要。
- 导入后对比旧角色摘要，证明旧角色未变化。
- 如果旧数据摘要变化，显示 `E011` 并标记导入异常。
- 失败时显示 `E008`。
- 创建成功后用户能在 SillyTavern 中看到新角色。
- 世界书绑定失败时必须明确提示。

风险点：

- 不要静默覆盖当前角色。
- 绑定世界书失败不能视为完整成功。
- 不能用“角色创建成功”掩盖旧数据完整性校验失败。

## TC-12A 运行日志与诊断导出

状态：已完成

阶段：阶段 10A

依赖：TC-04、TC-06、TC-10、TC-11、TC-12

目标：建立详细运行日志功能，方便运行时报错后的维护和复盘。

计划文件：

- `setting-organizer/src/core/logger.js`
- `setting-organizer/src/ui/diagnostics.js`
- `setting-organizer/src/ui/panel.js`
- `setting-organizer/src/ui/results.js`
- `setting-organizer/tests/logger.test.mjs`
- `setting-organizer/README.md`

功能要求：

- 集中记录扩展加载、设置读取 / 保存、分析、模型调用、解析校验、导出、备份、世界书导入、角色导入和旧数据校验的关键事件。
- 错误日志包含错误码、错误消息、步骤、模块、关键上下文摘要和时间戳。
- 日志保存到浏览器 localStorage，并限制最大条数。
- 日志同步输出到浏览器 console。
- 提供“导出诊断日志”按钮，导出 JSON。
- 提供“清空诊断日志”按钮。

验收标准：

- 分析失败、导出失败、备份失败、角色导入失败、世界书导入失败时均能生成结构化日志。
- 导出的诊断 JSON 可以 `JSON.parse`。
- 日志不包含 API Key、Cookie、认证 header、完整 prompt、完整聊天正文、完整角色正文或完整世界书正文。
- localStorage 写入失败不会影响主流程。
- 日志条数超过上限时自动裁剪旧记录。
- 单元测试覆盖写入、读取、清空、导出快照、错误序列化、敏感字段过滤和条数上限。

风险点：

- 不要把日志模块和业务状态强耦合。
- 不要为了排错记录过量隐私内容。
- 不要让日志写入失败阻断分析、导出或导入流程。

## TC-13 当前聊天读取

状态：已完成

阶段：阶段 11

依赖：TC-06

目标：支持从当前聊天读取内容作为输入来源。

计划文件：

- `setting-organizer/src/adapters/sillytavernApi.js`
- `setting-organizer/src/adapters/chatAdapter.js`
- `setting-organizer/src/ui/panel.js`

功能要求：

- 读取当前聊天消息。
- 读取范围：最近 20 条、最近 50 条、全部、手动选择。
- 显示预计输入长度。
- 发送给分析流程。

验收标准：

- 聊天读取失败不影响粘贴文本模式。
- 聊天读取失败显示 `E012`。
- 超长聊天会提示 Token 风险。
- 必须用户主动选择，不自动读取。

风险点：

- 聊天内容可能包含隐私信息。
- 超长聊天可能导致前端卡顿。

## TC-14 基础重复检测

状态：已完成

阶段：阶段 12

依赖：TC-08

目标：实现规则级重复检测。

计划文件：

- `setting-organizer/src/core/warnings.js`

检测内容：

- 同名角色
- 同标题世界书
- 完全相同关键词
- 完全相同世界书正文
- 过短关键词
- 泛化关键词

验收标准：

- 重复项能在警告页展示。
- 用户可以选择保留或删除。
- 检测不自动删除内容。

风险点：

- 不做复杂语义推理。
- 不自动合并用户未确认的内容。

## TC-15 README 与使用说明

状态：已完成

阶段：收尾

依赖：TC-09，建议 TC-12 后更新

目标：提供安装、使用和限制说明。

计划文件：

- `setting-organizer/README.md`

内容要求：

- 扩展用途
- 安装方式
- 基础使用流程
- 安全策略
- 已知限制
- 错误码说明
- Android / Termux 注意事项

验收标准：

- 新用户能按 README 安装。
- 用户能理解默认不覆盖策略。
- 用户能知道第一版不支持哪些高级功能。

风险点：

- 不要承诺尚未实现的功能。

## TC-16 真实聊天范围回归与样例补齐

状态：已完成

阶段：v0.2.0 规划 / 输入来源增强

依赖：TC-13，TC-15

目标：在有真实聊天记录的 SillyTavern 会话中补齐当前聊天读取范围测试，并完善测试样例清单。

计划文件：

- `setting-organizer/tests/chatAdapter.test.mjs`
- `setting-organizer/test-samples/`
- `setting_organizer_runtime_test_report_*.md`
- `setting_organizer_development_log.md`

功能要求：

- 复测最近 20 条、最近 50 条、全部、手动索引。
- 记录真实聊天为空、短聊天、长聊天三类表现。
- 补齐 `empty-input.txt`、`simple-character.txt`、`worldbuilding.txt`、`duplicated-lore.txt`、`too-long-input.txt` 等样例。
- 不自动读取聊天，仍必须由用户主动触发。

验收标准：

- 有真实聊天记录时能读取对应范围并写入输入框。
- 空聊天仍返回 `E012`。
- 超长聊天能进入现有 Token 风险提示链路。
- 测试报告记录 MuMu / 浏览器 / SillyTavern 版本和样例结论。

风险点：

- 聊天内容可能包含隐私信息，报告不得记录完整聊天正文。
- 手动索引输入错误不能导致面板崩溃。
- 长聊天不能造成明显前端卡死。

不做事项：

- 不实现自动后台读取聊天。
- 不上传聊天内容。
- 不把聊天记录保存为持久项目数据。

## TC-17 角色创建后可选绑定新建世界书

状态：已完成

阶段：v0.2.0 规划 / 轻量联动

依赖：TC-11，TC-12，TC-12A

目标：规划并实现角色创建成功后，用户可显式选择把新建世界书绑定到新建角色的安全流程。

计划文件：

- `setting-organizer/src/core/importer.js`
- `setting-organizer/src/adapters/sillytavernApi.js`
- `setting-organizer/src/ui/confirm.js`
- `setting-organizer/tests/importer.test.mjs`
- `setting-organizer/API_COMPATIBILITY.md`

功能要求：

- 绑定必须是用户显式选择的可选步骤。
- 角色创建成功不等于绑定成功。
- 绑定失败必须显示独立错误状态和诊断日志。
- 绑定前必须确认目标角色和目标世界书均为本次新建或用户明确选择的对象。
- 优先复用 SillyTavern 原生角色 / 世界书接口。

验收标准：

- 未选择绑定时，角色和世界书创建流程保持现状。
- 选择绑定且接口可用时，新角色能关联目标世界书。
- 绑定失败不会回滚或否定角色创建成功，但必须明确提示“绑定未完成”。
- 诊断日志能区分 `character-create-completed`、`worldbook-create-completed` 和绑定步骤结果。

风险点：

- SillyTavern 版本间角色绑定接口可能变化。
- 绑定错误可能误改已有角色。
- 绑定动作不可与角色创建成功状态混淆。

不做事项：

- 不静默修改已有角色。
- 不自动绑定任意已有世界书。
- 不实现完整角色管理器或世界书管理器。

## TC-18 轻量 JSON Schema 校验接入评估与实现计划

状态：已完成

阶段：v0.2.0 规划 / 校验增强

依赖：TC-04

目标：评估并规划轻量 JSON Schema 校验接入，增强模型输出结构验证，同时避免引入过重浏览器依赖。

计划文件：

- `setting-organizer/src/core/validator.js`
- `setting-organizer/src/schemas/`
- `setting-organizer/tests/validator.test.mjs`
- `setting_organizer_development_log.md`

功能要求：

- 先评估候选方案体积、浏览器兼容性和离线可用性。
- 保留现有 normalizer 作为容错层。
- Schema 校验失败仍映射到 `E003`。
- 不允许因为依赖加载失败导致基础 mock / 导出流程不可用。

验收标准：

- 文档记录选择的校验策略和拒绝的候选方案。
- 单元测试覆盖合法 JSON、字段缺失、字段类型错误、空结果。
- 浏览器扩展环境加载不出现模块解析错误。

风险点：

- 第三方 validator 可能增加包体积或引入构建要求。
- 严格 schema 可能拒绝可被 normalizer 修复的模型输出。

不做事项：

- 不引入需要构建步骤才能运行的重依赖。
- 不移除现有 parser / normalizer。
- 不让 schema 校验直接写入 SillyTavern。

## TC-19 原生世界书 / 角色管理辅助入口规划

状态：已完成

阶段：v0.2.0 规划 / 原生能力联动

依赖：TC-12，TC-17

目标：规划少量辅助入口，引导用户在创建后使用 SillyTavern 原生界面继续编辑角色或世界书。

计划文件：

- `setting-organizer/src/ui/confirm.js`
- `setting-organizer/src/adapters/sillytavernApi.js`
- `setting-organizer/API_COMPATIBILITY.md`
- `setting-organizer/README.md`

功能要求：

- 创建成功报告中可以提供“打开原生世界书”或“查看原生角色”的辅助入口。
- 入口必须通过已验证的 SillyTavern 原生 API 或稳定 UI 行为实现。
- 若目标版本不支持打开入口，应降级为文字提示。
- 辅助入口不能绕过备份、创建报告和旧数据校验。

验收标准：

- 支持时，入口能打开或定位到对应原生管理界面。
- 不支持时，用户仍能从报告中看到创建对象名称和手动查找方式。
- API 兼容性文档记录入口依赖和降级策略。

风险点：

- 原生 UI DOM 或函数名可能随版本变化。
- 自动跳转可能干扰用户当前操作。

不做事项：

- 不复制世界书编辑器。
- 不复制角色管理器。
- 不实现删除、移动、复制、批量管理。

## TC-20 v0.2.0 回归测试、文档收口和版本发布准备

状态：已完成

阶段：v0.2.0 收尾

依赖：TC-16，TC-17，TC-18，TC-19

目标：完成 v0.2.0 范围内的回归测试、文档更新和版本发布准备。

计划文件：

- `setting-organizer/manifest.json`
- `setting-organizer/README.md`
- `setting_organizer_development_log.md`
- `setting_organizer_doc_changelog.md`
- `setting_organizer_runtime_test_report_*.md`

功能要求：

- 全部 v0.2.0 任务通过本地测试和 MuMu 真实页面 smoke test。
- README 更新当前功能、限制和维护建议。
- API 兼容性文档更新新增接口探测结果。
- 只有代码和测试完成后，才允许把 manifest 版本更新为 `0.2.0`。

验收标准：

- 全部单元测试通过。
- MuMu + SillyTavern 真实页面通过 smoke test。
- 开发日志记录完成内容、问题复盘和测试数据。
- 版本提交完成后才允许创建 `v0.2.0` 或 `v0.2.0-rc*` tag。

风险点：

- 版本号提前更新会误导使用者。
- 如果新增接口只在单一 SillyTavern 版本验证，README 必须明确兼容范围。

不做事项：

- 不在未完成开发测试前更新 manifest 版本。
- 不自动推送远程仓库。
- 不删除用户环境中的测试数据。

## 任务执行顺序

推荐顺序：

```text
TC-00
-> TC-01
-> TC-01A
-> TC-02
-> TC-03
-> TC-04
-> TC-05
-> TC-06
-> TC-07
-> TC-08
-> TC-09
-> TC-10
-> TC-11
-> TC-12
-> TC-12A
-> TC-13
-> TC-14
-> TC-15
-> TC-16
-> TC-17
-> TC-18
-> TC-19
-> TC-20
```

最小可用闭环：

```text
TC-00
-> TC-01
-> TC-01A
-> TC-02
-> TC-03
-> TC-04
-> TC-05
-> TC-06
-> TC-09
```

## MVP 分层

### MVP-A：整理与导出闭环

任务范围：

```text
TC-00
-> TC-01
-> TC-01A
-> TC-02
-> TC-03
-> TC-04
-> TC-05
-> TC-06
-> TC-07
-> TC-08
-> TC-09
```

### MVP-B：安全新建闭环

任务范围：

```text
TC-10
-> TC-11
-> TC-12
-> TC-12A
```

### MVP-C：输入来源与兼容增强

任务范围：

```text
TC-13
-> TC-14
-> TC-15
```

### v0.2.0：追加功能规划

任务范围：

```text
TC-16
-> TC-17
-> TC-18
-> TC-19
-> TC-20
```

## 补充测试样例清单

后续创建 `test-samples/` 时，至少包含：

- `empty-input.txt`：空输入，应阻止分析。
- `simple-character.txt`：简单角色设定。
- `worldbuilding.txt`：世界观设定。
- `bad-json-response.txt`：非 JSON 文本，应显示 `E002`。
- `truncated-json-response.txt`：半截 JSON，应显示 `E002` 或 `E003`。
- `markdown-wrapped-json.txt`：Markdown 代码块包裹 JSON，应按 parser 策略处理。
- `wrong-field-types.json`：字段类型错误，用于验证 normalizer。
- `duplicated-lore.txt`：重复设定。
- `too-long-input.txt`：超长输入，应出现 Token 风险提示。
- `backup-failure-case.md`：备份失败手测步骤。
- `import-failure-case.md`：导入失败手测步骤。
