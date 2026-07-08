# 设定整理器开发日志

## 2026-07-07

### 已完成任务

- 完成 `TC-00 项目侦察`：当前目录最初只有规划 Markdown 文档，没有已有 SillyTavern 扩展源码。
- 完成 `TC-01 创建扩展骨架`：
  - 新增 `setting-organizer/manifest.json`。
  - 新增 `setting-organizer/index.js`。
  - 新增 `setting-organizer/style.css`。
  - 新增 `setting-organizer/README.md`。
- 完成 `TC-01A SillyTavern API 探针` 的文档记录：
  - 新增 `setting-organizer/API_COMPATIBILITY.md`。
  - 明确当前没有本地 SillyTavern 源码或运行实例可做完整接口验证。
  - 记录模型调用、聊天读取、角色创建、世界书创建仍需在实际 SillyTavern 环境复测。
- 完成 `TC-02 本地 UI 状态管理`：
  - 新增 `setting-organizer/src/storage/settings.js`。
  - 新增 `setting-organizer/src/ui/panel.js`。
  - 支持粘贴文本、整理目标选择、Token 预算模式、自定义预算、本地保存、分析状态和错误提示。
- 完成 `TC-03 模拟分析结果展示` 的主要开发：
  - 新增 `setting-organizer/src/core/analyzer.js`。
  - 新增 `setting-organizer/src/ui/editor.js`。
  - 新增 `setting-organizer/src/ui/results.js`。
  - 支持 mock 角色草稿、mock 世界书草稿、总览、角色、世界书、警告标签页。
  - 支持编辑角色字段、编辑世界书标题/关键词/正文、删除草稿条目、启用或禁用世界书条目。
- 完成 `TC-04 JSON Schema 与解析校验` 的主要开发：
  - 新增 `setting-organizer/src/core/errors.js`。
  - 新增 `setting-organizer/src/core/parser.js`。
  - 新增 `setting-organizer/src/core/normalizer.js`。
  - 新增 `setting-organizer/src/core/validator.js`。
  - 新增 `setting-organizer/src/schemas/analysisResult.schema.json`。
  - 新增 `setting-organizer/src/schemas/characterDraft.schema.json`。
  - 新增 `setting-organizer/src/schemas/lorebookDraft.schema.json`。
  - 新增 `setting-organizer/tests/validator.test.mjs` 和部分测试样例。
  - mock analyzer 输出已接入 `validateAndNormalizeAnalysisResult()`。
- 完成 `TC-05 Prompt 模板`：
  - 新增 `setting-organizer/src/prompts/extractSetting.js`。
  - 新增 `setting-organizer/tests/prompt.test.mjs`。
  - Prompt 版本为 `extract-setting-v0.1.0`。
  - Prompt 明确只输出 JSON、禁止 Markdown 代码块、禁止编造、禁止 AI 执行写入操作。
- 完成 `TC-06 SillyTavern 模型调用适配` 的第一版安全封装：
  - 新增 `setting-organizer/src/adapters/sillytavernApi.js`。
  - 新增 `setting-organizer/tests/sillytavernApi.test.mjs`。
  - UI 增加分析模式：`mock` 和 `sillytavern`。
  - 默认仍使用 `mock`，避免未确认环境中误调用 SillyTavern 内部接口。
  - SillyTavern 调用集中在 adapter，不让 UI 直接访问内部对象。
  - 找不到扩展上下文或模型接口时返回 `E010`，模型调用异常返回 `E001`。
- 架构约束更新：
  - 用户提醒整个开发过程各模块和功能要充分解耦，方便后期更新或修改。
  - 后续继续保持 UI / core / adapters / prompts / storage / schemas 分层，避免跨层直接耦合。
- 完成 `TC-07 Token 粗估`：
  - 新增 `setting-organizer/src/core/tokenEstimate.js`。
  - 新增 `setting-organizer/tests/tokenEstimate.test.mjs`。
  - analyzer 内部不再自行估算 token，统一调用 `estimateAnalysisTokens()`。
  - 预算预设和自定义预算解析集中在 tokenEstimate 模块。
- 完成 `TC-08 基础警告`：
  - 新增 `setting-organizer/src/core/warnings.js`。
  - 新增 `setting-organizer/tests/warnings.test.mjs`。
  - analyzer 在 parser / validator / normalizer 后统一调用 `applyWarnings()`。
  - results UI 只展示顶层和条目 warnings，不内联警告规则。
  - 覆盖空名称、空标题、空正文、空关键词、短关键词、重复关键词、常驻过多、内容超预算等规则。
- 完成 `TC-09 JSON 导出`：
  - 新增 `setting-organizer/src/adapters/characterAdapter.js`。
  - 新增 `setting-organizer/src/adapters/lorebookAdapter.js`。
  - 新增 `setting-organizer/src/core/exporter.js`。
  - 新增 `setting-organizer/tests/exporter.test.mjs`。
  - results UI 增加 5 类导出按钮：完整草稿、角色草稿、世界书草稿、SillyTavern 兼容角色、SillyTavern 兼容世界书。
  - 导出格式转换集中在 adapters / exporter，UI 只负责触发下载和显示错误。
- 完成 `TC-10 备份能力` 的本地记录部分：
  - 新增 `setting-organizer/src/storage/backups.js`。
  - 新增 `setting-organizer/src/ui/confirm.js`。
  - 新增 `setting-organizer/tests/backups.test.mjs`。
  - 结果页增加“创建备份”按钮。
  - 备份记录包含 `backupVersion`、`id`、`createdAt`、`operation`、`sillyTavernVersion`、`sourceDraft`、`targetInfo`、`beforeState`、`afterState`。
  - 当前备份只写入浏览器 localStorage，作为后续导入前的本地恢复依据。
- 完成 `TC-11 创建新世界书` 的安全骨架：
  - 新增 `setting-organizer/src/core/importer.js`。
  - 新增 `setting-organizer/tests/importer.test.mjs`。
  - `sillytavernApi.js` 增加 `createWorldInfo()` 和 `hasWorldInfoCreate` 兼容性探测。
  - 结果页增加“预检导入世界书”按钮。
  - 当前未确认真实接口时会先创建备份，再返回 `E010` 兼容性错误和失败状态报告，不执行真实写入。
- 初始化本地 Git 仓库并提交首个开发快照：
  - `7836dc2 chore: initialize setting organizer extension`

### 验证结果

- `setting-organizer/manifest.json` 已通过 PowerShell `ConvertFrom-Json` 解析。
- 以下文件已通过 `node --check`：
  - `setting-organizer/index.js`
  - `setting-organizer/src/ui/panel.js`
  - `setting-organizer/src/ui/results.js`
  - `setting-organizer/src/ui/editor.js`
  - `setting-organizer/src/core/analyzer.js`
- `setting-organizer/src/core/errors.js`、`parser.js`、`normalizer.js`、`validator.js` 已通过 `node --check`。
- `setting-organizer/src/schemas/analysisResult.schema.json` 已通过 PowerShell `ConvertFrom-Json` 解析。
- `setting-organizer/tests/validator.test.mjs` 已通过，覆盖：
  - 合法 JSON 解析。
  - Markdown 代码块包裹 JSON 解析。
  - 非 JSON 返回 `E002`。
  - 顶层数组返回 `E003`。
  - 空结果返回 `E004`。
  - 字符串关键词转数组。
  - confidence 超界截断。
- `setting-organizer/tests/prompt.test.mjs` 已通过，覆盖：
  - prompt 版本号。
  - 只输出 JSON。
  - 禁止 Markdown 代码块。
  - 禁止编造。
  - 禁止 AI 执行写入。
  - 包含 characters / lorebookEntries 目标结构。
- `setting-organizer/tests/sillytavernApi.test.mjs` 已通过，覆盖：
  - 无 SillyTavern 上下文时返回 `E010`。
  - 存在 `generateQuietPrompt` 候选接口时可返回原始模型文本。
- `setting-organizer/tests/tokenEstimate.test.mjs` 已通过，覆盖：
  - 中文 token 估算。
  - 英文字符粗估。
  - 混合文本粗估。
  - 分析结果输入 / 输出 / 总量统计。
  - 轻量、自定义和默认预算解析。
- `setting-organizer/tests/warnings.test.mjs` 已通过，覆盖：
  - 角色名称为空。
  - 世界书标题 / 正文 / 关键词为空。
  - 关键词过短和重复。
  - 常驻世界书过多。
  - 条目 warnings 与顶层 warnings 同步展示。
- `setting-organizer/tests/exporter.test.mjs` 已通过，覆盖：
  - 内部完整草稿可序列化。
  - 角色草稿转 SillyTavern 兼容字段。
  - 世界书草稿转 SillyTavern World Info entries。
  - 内部 warnings 不会进入 SillyTavern 兼容角色顶层。
- `setting-organizer/tests/backups.test.mjs` 已通过，覆盖：
  - 备份记录创建。
  - 备份保存和倒序列表。
  - 存储失败时返回 `E007`。
- `setting-organizer/tests/importer.test.mjs` 已通过，覆盖：
  - 未发现世界书创建接口时返回失败报告和 `E010`。
  - 导入前备份步骤完成。
  - 候选 `createWorldInfo` 接口存在时可走成功路径。
- 当前目录已初始化为 Git 仓库。
- MuMu 模拟器进程存在，MuMu 自带 ADB 可用。
- 已连接 MuMu ADB：
  - `127.0.0.1:7555`
  - `emulator-5556`

### 开发中出现的问题

- 写入许可问题：
  - 初始 AGENTS.md 要求写入前必须确认，开发曾阻塞在创建扩展骨架前。
  - 用户随后授权本次开发中 `E:\Desktop\silly tavren` 内所有文件读写无需逐次确认。
- 沙箱权限问题：
  - `adb devices` 首次运行失败，原因是 ADB 需要写入 `%TEMP%\adb.log`，当前沙箱拒绝。
  - 解决方式：按权限规则使用提升权限重试。
- MuMu ADB 连接问题：
  - ADB daemon 启动后设备列表为空。
  - 通过读取 MuMu 监听端口，确认 `127.0.0.1:7555` 可用。
  - 执行 `adb connect 127.0.0.1:7555` 后设备上线。
- 目录创建问题：
  - `apply_patch` 无法为 `setting-organizer/src/core/analyzer.js` 自动创建缺失的 `src/core` 父目录。
  - 普通 `New-Item` 被只读沙箱拒绝。
  - 解决方式：使用提升权限创建 `setting-organizer/src/core` 后再应用补丁。
- 补丁上下文问题：
  - 一次复合补丁因 `panel.js` 上下文匹配失败而整体未应用。
  - 处理方式：先读取当前文件，再拆分为更小补丁分段落地。
- Git 初始化问题：
  - `git status` 初次提示无法读取全局 ignore：`C:\Users\Administrator/.config/git/ignore` 权限不足。
  - 处理方式：设置仓库级 `core.excludesFile` 为空，避免读取该全局 ignore。
  - 首次 `git commit` 因未设置作者信息失败。
  - 处理方式：仅在当前仓库设置 `user.name=Codex` 和 `user.email=codex@example.local`。
- PowerShell 命令写法问题：
  - 一次 `New-Item` 同时传两个路径，触发 “A positional parameter cannot be found”。
  - 处理方式：改为分别创建目录。
- TC-04 测试发现的问题：
  - 初版 normalizer 只把 confidence 截断警告保存在条目内部，没有汇总到顶层 `warnings`。
  - 影响：警告页无法展示部分规范化警告。
  - 修复：角色和世界书条目规范化后，将条目 warnings 同步汇总到顶层 warnings。
- TC-06 架构风险：
  - SillyTavern 模型调用接口尚未在真实运行环境确认。
  - 当前实现只做集中 adapter 和候选接口探测，不把候选 API 写散到 UI 或业务模块。
  - 后续如实际 API 不同，只需替换 `sillytavernApi.js`，不应改动 parser / validator / results UI。
- TC-10 范围控制：
  - 当前只实现备份记录，不实现自动回滚。
  - 这符合第一版“备份 + 失败状态报告 + 可手动恢复依据”的口径。
  - 后续导入功能必须先调用备份模块，备份失败应返回 `E007` 并阻止导入。
- TC-11 运行时限制：
  - 当前 `createWorldInfo()` 只是候选 adapter，不代表目标 SillyTavern 已确认支持。
  - 真实写入测试必须在 MuMu / SillyTavern 环境中确认接口后进行。
  - 在未确认接口时，UI 只展示失败报告和备份标识，不应宣称已导入成功。

### 运行验证补充

- 用户重启并创建新的 MuMu 模拟器后，重新连接 ADB：`127.0.0.1:7555`，设备别名 `emulator-5558`。
- MuMu Android 版本为 `12`。
- 系统浏览器包为 `com.android.chromium`。
- MuMu 可通过 `http://10.0.2.2:8000/` 访问宿主机 SillyTavern。
- 克隆官方 SillyTavern 到 `SillyTavern-runtime/`，并将该目录加入 `.gitignore`。
- SillyTavern 版本为 `1.18.0`，release commit `51ad27f`。
- 扩展被服务端识别为 `third-party/setting-organizer`。
- Chrome DevTools Protocol 验证 `#setting-organizer-panel` 存在。
- 端到端前端验证通过：输入测试文本、点击分析、生成 1 个角色草稿和 1 个世界书草稿，5 个导出按钮和备份按钮存在。
- 运行时 context 暴露 `chat`、`extensionSettings`、`saveSettingsDebounced`、`generateQuietPrompt`、`saveWorldInfo`、`getWorldInfoNames`。
- `saveWorldInfo(name, data, true)` 已验证可创建新世界书。
- 真实世界书导入第二次验证成功，并确认旧世界书名称仍保留。

### 运行验证中出现的问题

- 初次 `npm ci` 长时间无结束，手动停止后发现 `tiktoken` 半安装。
- 单独安装 `tiktoken` 首次因 `ECONNRESET` 失败。
- 删除损坏的 `node_modules/tiktoken` 后，使用 `https://registry.npmmirror.com` 成功安装。
- 首次启动 SillyTavern 时 webpack 报 `@popperjs/core` 内部文件缺失。
- 删除损坏的 `node_modules/@popperjs/core` 后，使用镜像成功重装。
- 第一次真实创建世界书成功，但报告 `E011`。
- 根因：默认世界书名使用 ISO 时间，包含 `:`，SillyTavern 保存后规范化名称，导致新建名称与 adapter 返回名称不一致。
- 修复：默认世界书名改为移除 `-:.TZ` 的安全时间戳，并在导入报告中区分“创建成功但校验失败”。

### TC-12 创建新角色

- 完成角色创建安全流程：
  - `characterAdapter.js` 新增角色草稿到 `/api/characters/create` FormData 字段的转换。
  - `sillytavernApi.js` 新增角色创建、角色摘要读取和刷新后角色摘要读取。
  - `importer.js` 新增 `importCharacterDraft()` 和 `getCharacterImportReadiness()`。
  - `confirm.js` 和 `results.js` 增加“预检导入角色”按钮、角色导入预检和角色导入报告。
- 写入策略仍保持分层：
  - UI 只触发导入动作和展示状态。
  - importer 只编排备份、创建和旧数据校验。
  - SillyTavern 内部接口只集中在 `sillytavernApi.js`。
- 新增和更新测试：
  - `sillytavernApi.test.mjs` 覆盖 `/api/characters/create` 调用、FormData 字段和角色摘要读取。
  - `importer.test.mjs` 覆盖角色导入成功路径、导入前备份、旧角色保留校验。
- MuMu / SillyTavern 真实验证：
  - 通过 CDP 在 MuMu 浏览器中刷新 SillyTavern 页面。
  - mock 分析生成角色草稿后，执行真实角色导入。
  - 第一次导入创建 `TC12Test20260707143016577.png`，报告成功。
  - 复测导入创建 `TC12Retest20260707143136984.png`。
  - 复测前角色数量为 2，导入后角色数量为 3。
  - 复测确认旧角色 avatar 没有缺失，导入状态为 success。

### TC-12 开发中出现的问题

- SillyTavern 运行时的 `createCharacterData` 不是创建函数，而是默认角色数据模板对象。
- 处理方式：阅读 SillyTavern `src/endpoints/characters.js`，确认可用路径为 `/api/characters/create`，并通过 `getRequestHeaders({ omitContentType: true })` 携带请求头。
- 第一次真实角色导入虽然成功，但 before 快照为空。
- 根因：`context.characters` 在页面刷新后可能尚未预加载，直接读取无法证明旧角色未变化。
- 修复：新增 `getFreshCharacterSummaries()`，在导入前先调用 `getCharacters()` 刷新，再记录角色摘要。
- 复测结果证明 before 快照包含已有角色，导入后旧 avatar 没有丢失。
- 服务日志中出现过一次 SillyTavern `/api/characters/get` 的内部错误：`avatar_url` 为数字 `0`，导致 `path.join()` 参数类型错误。
- 定位结果：该错误来自 SillyTavern 读取角色详情端点，不是本扩展调用的 `/api/characters/create`；后续角色创建和旧 avatar 校验复测均成功。

### TC-12A 运行日志与诊断导出

- 用户提出需要详细日志功能，方便运行报错时维护。
- 完成运行日志基础能力：
  - 新增 `setting-organizer/src/core/logger.js`。
  - 新增 `setting-organizer/src/ui/diagnostics.js`。
  - 主面板新增“导出诊断日志”和“清空诊断日志”按钮。
  - 日志记录到浏览器 localStorage，并同步输出到 console。
  - 日志条数限制为 200 条，避免无限增长。
- 日志接入范围：
  - 扩展加载成功 / 失败。
  - 设置读取 / 保存失败。
  - 分析开始 / 成功 / 失败。
  - 模型调用成功 / 失败。
  - 导出成功 / 失败。
  - 备份创建成功 / 失败。
  - 世界书创建成功 / 失败。
  - 角色创建成功 / 失败。
  - 世界书导入和角色导入结果报告。
- 隐私与安全处理：
  - `apiKey`、`authorization`、`cookie`、`csrf`、`token`、`headers` 等字段写入日志时脱敏为 `<redacted>`。
  - `prompt`、`sourceText`、`chat`、`content`、`description` 等长文本字段只保留长度和短预览。
  - 日志导出只能由用户主动点击，不自动上传。
- 新增 `setting-organizer/tests/logger.test.mjs`，覆盖：
  - 日志写入和读取。
  - 错误序列化。
  - 敏感字段脱敏。
  - 长文本摘要。
  - 200 条上限裁剪。
  - 诊断快照可 JSON 序列化。
  - 清空日志。

### TC-12A 开发中出现的问题

- Node 24 中 `globalThis.navigator` 是只读 getter，测试中直接赋值会报错。
- 修复：测试里使用 `Object.defineProperty()` 注入可控 `navigator.userAgent`。
- 初版脱敏规则把错误对象的 `message` 字段也摘要成对象，不利于排查。
- 修复：长文本摘要规则不再匹配普通 `message` 字段，错误消息保持字符串。

### TC-13 当前聊天读取

- 完成当前聊天读取能力：
  - 新增 `setting-organizer/src/adapters/chatAdapter.js`。
  - `sillytavernApi.js` 新增 `getCurrentChatMessages()`，只负责读取 SillyTavern context 的 `chat` 数组。
  - `panel.js` 新增“当前聊天读取”区域。
  - 支持读取范围：最近 20 条、最近 50 条、全部、手动索引。
  - 手动索引支持 `0, 2, 5-8` 形式。
  - 读取成功后把聊天内容转换为输入框文本，并显示已读取条数和 token 粗估。
  - 读取失败显示 `E012`，不影响用户继续使用粘贴文本模式。
- 解耦策略：
  - UI 只处理用户主动点击、范围选择和状态展示。
  - `chatAdapter.js` 负责 SillyTavern 聊天消息格式归一化、范围选择和文本构造。
  - `sillytavernApi.js` 只暴露最小上下文读取接口。
- 隐私策略：
  - 当前聊天不会自动读取，必须用户点击“读取当前聊天”。
  - 读取内容只进入本地输入框，不自动上传或写入。
  - 日志只记录范围、条数、长度和 token 粗估，不记录完整聊天正文。
- 新增 `setting-organizer/tests/chatAdapter.test.mjs`，覆盖：
  - SillyTavern `mes` 字段归一化。
  - HTML / `<br>` 清理。
  - 最近 20、最近 50、全部、手动索引选择。
  - 聊天文本构造。
  - 无上下文时返回 `E012`。

### TC-13 开发中出现的问题

- 面板补丁第一次包含了 `settings.js` 的上下文字段，导致 `apply_patch` 上下文匹配失败。
- 处理方式：重新读取 `panel.js`，按导入、DOM、事件绑定、状态读取拆分小补丁落地。

### TC-14 基础重复检测

- 完成规则级重复检测：
  - 同名角色检测。
  - 同标题世界书检测。
  - 完全相同关键词组合检测。
  - 完全相同世界书正文检测。
  - 泛化关键词检测。
  - 继续保留已有的过短关键词、重复关键词、空字段和 token 预算警告。
- 检测结果进入条目级 `warnings`，并同步汇总到顶层 `warnings`。
- 不做语义推理、不自动删除、不自动合并；用户仍通过现有结果页删除按钮决定保留或删除。
- 新增 / 更新测试：
  - `setting-organizer/tests/warnings.test.mjs` 覆盖 TC-14 所有规则。

### TC-14 开发中出现的问题

- 重复检测需要避免因为空字段产生噪声。
- 处理方式：同名、同标题、相同正文和相同关键词组合都先做 trim / lower / 空值过滤，空值仍由原有空字段规则负责提示。

### TC-15 README 与使用说明

- 完成 README 收尾：
  - 补充扩展用途。
  - 补充安装路径和安装步骤。
  - 补充基础使用流程。
  - 补充当前聊天读取说明。
  - 补充安全策略。
  - 补充诊断日志说明。
  - 补充错误码表。
  - 补充当前功能清单。
  - 补充已知限制。
  - 补充 Android / MuMu / Termux 注意事项。
  - 补充维护建议。
- README 明确不承诺尚未实现的能力：
  - 不承诺完整自动回滚。
  - 不承诺自动持续更新。
  - 不承诺 RAG、关系图、高级语义冲突推理。
  - 不承诺角色创建后自动绑定新建世界书。

### TC-15 开发中出现的问题

- 原 README 已经长期追加功能清单，但缺少新用户可直接执行的安装和使用流程。
- 处理方式：重写 README 结构，而不是继续追加零散段落。
- 完成度审计发现 `setting_organizer_task_cards.md` 中 TC-00 到 TC-11 仍标记为“未开始”，但开发日志、源码和提交记录已经证明这些任务已完成。
- 修复：将 TC-00 到 TC-11 的任务卡状态补正为“已完成”，避免后续维护误判。

### 当前限制

- 已在真实 SillyTavern 页面完成扩展加载、mock 分析、备份、世界书创建和角色创建验证。
- 已确认当前 SillyTavern 版本的模型调用候选接口、聊天读取候选接口、世界书创建接口和角色创建接口。
- `TC-03` 使用 mock 分析结果，不代表最终 AI 输出质量。
- 当前 schema 文件已建立，但尚未接入完整 JSON Schema 引擎，TC-04 目前使用手写结构校验和规范化规则。
- 角色创建暂未实现新建世界书绑定。
- 诊断日志已完成本地记录与导出，但尚未在 MuMu 真实页面复测导出文件下载。
- 当前聊天读取已完成本地测试，但尚未在 MuMu 真实页面复测不同聊天范围。
- 基础重复检测只做规则级精确匹配，不做复杂语义冲突判断。

### 下一步建议

- 任务卡 TC-00 到 TC-15 已全部完成；后续建议先做一次 MuMu 真实页面回归，重点覆盖诊断日志导出和当前聊天读取。
- 继续保持写入逻辑集中在 `sillytavernApi.js`，不要把内部 API 调用散落到 UI。

## 2026-07-08 运行时回归与原生优先审计

- 完成 MuMu + SillyTavern 1.18.0 真实环境回归，详见 `setting_organizer_runtime_test_report_20260708.md`。
- 测试结论：
  - 本地全部单元测试通过。
  - SillyTavern 服务返回 HTTP 200。
  - MuMu Android 12 / `com.android.chromium` 可打开 `http://10.0.2.2:8000/`。
  - 扩展面板加载成功。
  - mock 分析、结果页签、诊断日志导出、诊断日志清空、完整草稿导出、本地备份通过。
  - 世界书真实创建通过，测试世界书：`设定整理器导入 20260708061922789`。
  - 角色真实创建通过，测试角色：`SO_TC_1783491562109` / `SO_TC_1783491562109.png`。
  - 当前聊天为空时返回 `E012 当前聊天读取结果为空。`，属于预期错误路径。
- 原生能力审计：
  - SillyTavern 原生已经提供完整世界书创建、导入、编辑、删除、条目移动/复制、角色创建和角色管理能力。
  - Setting Organizer 应保持为设定整理前置工作台，不扩展成完整世界书编辑器或角色管理器。
- 代码优化：
  - 将结果区按钮文案从“预检导入世界书 / 预检导入角色”改为“创建到酒馆世界书 / 创建到酒馆角色”。
  - 将创建前状态文案改为明确复用 SillyTavern 原生接口，并提示后续编辑管理交给酒馆原生功能。
- 优化后回归：
  - 关键模块 `node --check` 通过。
  - 全部本地单元测试通过。
  - MuMu smoke test 通过：扩展加载、mock 分析、优化后按钮文案、诊断日志导出和本地备份均正常。

### 本次测试中出现的问题

- ADB 首次启动因沙箱只读无法写入用户 Temp 下的 `adb.log`，使用已授权提权命令后正常启动。
- CDP 脚本第一次使用错误导出类型 `internal_full`，实际导出类型为 `internal-full`；修正选择器后测试通过。
- 世界书验证不能读取不存在的静态字段，应调用 `getWorldInfoNames()`。
- SillyTavern runtime 编译时出现 3 条 `@popperjs/core` webpack warning，不阻断本次测试。

## 2026-07-08 v0.2.0 追加功能文档规划

- 用户授权根据追加功能策划开发文档，并在后续按文档继续开发测试。
- 本阶段范围：只做文档规划，不进入代码开发，不跑 MuMu 实测，不更新 `manifest.json` 版本。
- 目标版本：`v0.2.0`。
- 原生边界：适度扩展。
  - 允许提供少量辅助入口或绑定流程。
  - 不重做 SillyTavern 原生角色管理器。
  - 不重做 SillyTavern 原生世界书管理器。
- 新增 v0.2.0 任务卡：
  - `TC-16` 真实聊天范围回归与样例补齐。
  - `TC-17` 角色创建后可选绑定新建世界书。
  - `TC-18` 轻量 JSON Schema 校验接入评估与实现计划。
  - `TC-19` 原生世界书 / 角色管理辅助入口规划。
  - `TC-20` v0.2.0 回归测试、文档收口和版本发布准备。
- 明确不纳入 v0.2.0：
  - 完整 RAG / Data Bank 管理。
  - 关系图。
  - 高级语义冲突推理。
  - 完整自动回滚。
  - 完整角色 / 世界书管理器。
- 后续执行要求：
  - 任一任务进入代码开发前，应重新读取对应任务卡和当前源码。
  - 角色绑定世界书必须是可选显式步骤，绑定失败不能并入角色创建成功状态。
  - 原生管理辅助入口只做打开或引导，不能复制编辑、删除、移动、批量管理能力。

## 2026-07-08 v0.2.0 开发与实测完成

- 完成 `TC-16` 到 `TC-20`。
- 代码变更：
  - 扩展聊天读取测试和 `test-samples/` 样例。
  - 新增角色创建后可选绑定本次新建世界书。
  - 新增 `E013` 角色世界书绑定失败错误码。
  - 新增 `/api/characters/merge-attributes` 绑定 adapter。
  - 新增 `reloadWorldInfoEditor` 原生世界书入口和不可用时的降级提示。
  - 加强轻量 schema 结构校验，不引入第三方重依赖。
  - manifest 版本更新为 `0.2.0`。
- 本地验证：
  - 关键模块 `node --check` 通过。
  - 全部 `.mjs` 单元测试通过。
- MuMu / SillyTavern 实测：
  - 扩展版本 `0.2.0` 加载成功。
  - 当前聊天最近 20、最近 50、全部、手动索引读取通过。
  - 诊断日志导出和本地备份通过。
  - 创建测试角色 `SO_V02_1783521618416`。
  - 创建并绑定测试世界书 `SO_V02_设定整理器绑定 20260708144019894`。
  - 原生世界书入口按钮出现并记录 `worldbook-native-editor-opened`。
- 测试报告：`setting_organizer_runtime_test_report_v020_20260708.md`。

### v0.2.0 开发中出现的问题

- 绑定成功单元测试第一次失败，根因是测试数据只包含角色草稿，没有可绑定世界书条目。
- 修复：在 `characterResult` 测试对象中补充已启用世界书条目。
- 为避免绑定失败与角色创建失败混淆，新增 `E013` 独立错误码。
- `reloadWorldInfoEditor` 只负责加载原生世界书编辑数据，不复制世界书管理器能力；如果不可用则显示手动查找提示。

## 2026-07-08 代码审查与使用说明文档

- 按用户要求从入口、UI、core、adapter、storage、tests、docs 全链路审查 `setting-organizer` 插件。
- 新增综合文档：`setting_organizer_code_review_usage_guide.md`。
- 文档内容包括：
  - 代码审查结论。
  - 插件定位和功能清单。
  - 使用说明。
  - 架构与数据流。
  - 错误码、维护流程和排障建议。
- 验证情况：
  - 关键模块 `node --check` 通过。
  - 全部 `.mjs` 测试通过。
  - `tests/cdp-check.mjs` 是带参数的 CDP 辅助脚本，直接运行只打印用法，不作为完整单元测试断言。

## 2026-07-08 插件功能与使用说明拆分

- 按用户要求将插件功能和使用说明从综合审查文档中独立出来。
- 新增：
  - `setting_organizer_feature_overview.md`
  - `setting_organizer_user_guide.md`
- 明确插件具备日志功能：
  - 控制台日志前缀为 `[setting-organizer]`。
  - localStorage 键名为 `setting-organizer.runtimeLogs.v1`。
  - 最多保留 200 条日志。
  - 面板支持导出诊断日志和清空诊断日志。
  - 日志会脱敏敏感字段，并对长文本只记录摘要。
