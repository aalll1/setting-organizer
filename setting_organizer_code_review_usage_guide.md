# Setting Organizer 代码审查与使用说明

审查日期：2026-07-08  
插件版本：`0.2.0`  
审查范围：`setting-organizer/index.js`、`src/`、`tests/`、`README.md`、`API_COMPATIBILITY.md`

独立文档：

- 插件功能说明：`setting_organizer_feature_overview.md`
- 使用说明：`setting_organizer_user_guide.md`

## 审查结论

未发现阻塞级问题。当前代码结构与 v0.2.0 目标一致：插件定位清晰，核心能力集中在“设定整理前置工作台”，没有扩展成完整角色管理器或世界书管理器。

主要风险为兼容性和运行时边界：

1. `SillyTavern.getContext()`、`saveWorldInfo()`、`reloadWorldInfoEditor()`、`/api/characters/create`、`/api/characters/merge-attributes` 均属于 SillyTavern 运行时能力，已在 SillyTavern 1.18.0 验证，但其他版本仍需先做 smoke test。
2. `reloadWorldInfoEditor(name, true)` 只应理解为“尝试交给原生世界书界面处理”，不能承诺一定打开到可见编辑状态；代码已有不可用降级提示。
3. 备份是 localStorage 中的手动恢复依据，不是完整自动回滚系统。
4. `tests/cdp-check.mjs` 是带参数的 CDP 辅助脚本，直接运行只打印用法并返回成功，不应被视为完整单元测试用例。

本次验证：

- `git status --short`：审查前工作区干净。
- `node --check`：关键入口、UI、导入流程和 SillyTavern adapter 通过。
- `setting-organizer/tests/*.mjs`：全部通过；`cdp-check.mjs` 直接运行输出用法，属于预期工具脚本行为。

## 插件定位

Setting Organizer 是 SillyTavern 第三方扩展，用于把粘贴文本或当前聊天内容整理成可检查、可编辑、可导出的角色草稿和世界书草稿。

它负责：

- 提取设定信息。
- 生成角色草稿和世界书草稿。
- 做结构校验、重复检测、token 预算提醒。
- 在用户确认后创建新角色或新世界书。
- 创建前备份、创建后报告、诊断日志和错误码。
- 可选将本次新建角色绑定到本次新建世界书。

它不负责：

- 替代 SillyTavern 原生角色管理器。
- 替代 SillyTavern 原生世界书编辑器。
- 删除、移动、复制、批量管理角色或世界书。
- 完整自动回滚。
- RAG、关系图或高级语义冲突推理。

## 功能清单

### 输入来源

- 手动粘贴设定文本、世界观、角色描述或剧情记录。
- 用户主动点击后读取当前聊天。
- 当前聊天范围支持：
  - 最近 20 条
  - 最近 50 条
  - 全部
  - 手动索引，例如 `0, 2, 5-8`

聊天读取失败会显示 `E012`。诊断日志只记录范围、条数和长度摘要，不保存完整聊天正文。

### 分析模式

- `模拟结果`：不调用模型，用于离线测试 UI、导出、备份和导入流程。
- `当前 SillyTavern 模型`：通过 adapter 调用当前 SillyTavern 可用的生成接口。

### 草稿结果

结果页包含：

- 总览：角色数、世界书条目数、警告数、粗估 token。
- 角色草稿：名称、描述、性格、场景、首条消息、创作者备注。
- 世界书草稿：标题、关键词、正文、启用状态。
- 警告：重复内容、重复关键词、token 预算等。

用户可以在结果页编辑草稿字段，删除不需要的角色或世界书条目。

### 导出与创建

支持导出：

- 完整内部草稿 JSON。
- 角色草稿 JSON。
- 世界书草稿 JSON。
- SillyTavern 兼容角色 JSON。
- SillyTavern 兼容世界书 JSON。

支持创建：

- 创建到酒馆世界书。
- 创建到酒馆角色。
- 创建角色后，显式可选绑定本次新建世界书。

绑定失败会以 `E013` 和步骤状态展示，不会把角色创建成功误判为失败。

### 备份与诊断

- 创建草稿备份。
- 写入前创建 localStorage 备份记录。
- 导出诊断日志。
- 清空诊断日志。
- 日志最多保留 200 条。
- 日志会脱敏 API key、Cookie、认证 header、token、secret、password 等字段。
- prompt、聊天正文、角色正文、世界书正文等长文本只保留长度和短预览。

## 架构审查

### 入口与 UI

`index.js` 只负责扩展初始化、挂载面板和记录加载日志。面板实现集中在 `src/ui/`：

- `panel.js`：输入区、目标选择、分析模式、聊天读取、设置保存。
- `results.js`：结果页签、草稿编辑、导出、备份、导入入口。
- `confirm.js`：创建前提示、创建报告、原生世界书入口降级。
- `diagnostics.js`：诊断日志导出和清空。
- `editor.js`：数组项和关键词编辑辅助。

UI 层主要调用 core 和 adapter，不直接散落 SillyTavern 写入逻辑，解耦情况良好。

### Core 层

`src/core/` 负责业务规则：

- `analyzer.js`：分析入口，连接模型/mock、校验和警告。
- `parser.js`：JSON 和 Markdown fenced JSON 解析。
- `normalizer.js`：可恢复字段规范化。
- `validator.js`：轻量结构校验，非法结构映射到 `E003`，空结果映射到 `E004`。
- `warnings.js`：token、重复角色名、重复世界书标题、重复关键词和重复正文检测。
- `tokenEstimate.js`：粗略 token 估算和预算模式。
- `exporter.js`：内部草稿和 SillyTavern 格式导出。
- `importer.js`：安全创建流程、备份、步骤报告、旧数据摘要校验。
- `logger.js`：结构化日志、脱敏和诊断快照。
- `errors.js`：统一错误码和格式化。

Core 层没有直接绑定 DOM，后续维护时可以继续独立测试。

### Adapter 层

`src/adapters/` 集中处理 SillyTavern 运行时边界：

- `sillytavernApi.js`：获取上下文、模型调用、聊天读取、世界书创建、角色创建、角色绑定世界书、原生世界书入口。
- `chatAdapter.js`：聊天消息规范化、范围选择、聊天文本构建。
- `characterAdapter.js`：内部角色草稿转 SillyTavern 创建字段。
- `lorebookAdapter.js`：内部世界书草稿转 SillyTavern world info 结构。

写入 SillyTavern 的能力集中在 adapter，符合后续兼容不同 SillyTavern 版本时只改边界层的要求。

### Storage 层

`src/storage/settings.js` 负责本地设置读取、保存和默认值规范化。  
`src/storage/backups.js` 负责备份记录创建、保存和读取。

备份保存在浏览器 localStorage，不自动上传，不自动删除用户数据。

## 数据流

1. 用户粘贴文本，或主动读取当前聊天。
2. `panel.js` 收集设置和输入。
3. `analyzer.js` 使用 mock 或 SillyTavern 模型生成分析结果。
4. `parser.js`、`validator.js`、`normalizer.js` 解析并规范化结果。
5. `warnings.js` 添加重复和 token 风险提示。
6. `results.js` 展示可编辑草稿。
7. 用户选择导出、备份、创建世界书或创建角色。
8. `importer.js` 创建备份、调用 adapter 写入、校验旧数据摘要、返回步骤报告。
9. `confirm.js` 展示报告，并在可用时提供原生世界书入口。

## 错误码速查

| 错误码 | 含义 | 建议处理 |
| --- | --- | --- |
| `E001` | 模型调用失败 | 检查当前 SillyTavern 模型连接。 |
| `E002` | 模型输出不是合法 JSON | 重试分析或改用模拟结果验证流程。 |
| `E003` | 结构校验失败 | 检查模型输出字段类型。 |
| `E004` | 分析结果为空 | 增加输入内容或调整目标。 |
| `E005` | token 超过预算 | 缩短输入或调高预算模式。 |
| `E006` | 导出失败 | 查看诊断日志和草稿结构。 |
| `E007` | 备份失败 | 检查浏览器 localStorage。 |
| `E008` | 角色创建失败 | 检查 `/api/characters/create` 兼容性。 |
| `E009` | 世界书创建失败 | 检查 `saveWorldInfo` 兼容性和重名。 |
| `E010` | SillyTavern API 不兼容 | 先看 `API_COMPATIBILITY.md` 并做 runtime probe。 |
| `E011` | 旧数据摘要校验失败 | 停止后续写入，手动检查数据。 |
| `E012` | 当前聊天读取失败 | 确认当前页面有聊天，或改用粘贴文本。 |
| `E013` | 角色世界书绑定失败 | 角色或世界书可能已创建，按步骤报告手动检查。 |

## 使用说明

### 安装

将整个 `setting-organizer` 文件夹放入 SillyTavern 第三方扩展目录：

```text
SillyTavern/public/scripts/extensions/third-party/setting-organizer
```

目录中应包含：

```text
manifest.json
index.js
style.css
src/
```

重启 SillyTavern 或刷新浏览器页面后，在扩展设置区域找到“设定整理器”面板。

### 基础流程

1. 打开 SillyTavern 页面。
2. 打开扩展设置中的“设定整理器”面板。
3. 在输入框粘贴设定文本，或点击“读取当前聊天”。
4. 选择整理目标：角色卡、世界书，或两者都选。
5. 选择分析模式：
   - 首次测试建议用 `模拟结果`。
   - 真实整理时使用 `当前 SillyTavern 模型`。
6. 选择 token 预算模式。
7. 点击“开始分析”。
8. 在结果页检查总览、角色、世界书和警告。
9. 编辑草稿，删除不需要的条目。
10. 根据需要导出 JSON、创建备份、创建到酒馆世界书或创建到酒馆角色。

### 创建世界书

1. 确认结果页存在启用的世界书条目。
2. 点击“创建到酒馆世界书”。
3. 查看步骤报告：
   - 校验世界书草稿
   - 创建导入前备份
   - 创建新世界书
   - 验证旧世界书未变化
4. 创建成功后，使用 SillyTavern 原生世界书界面继续编辑、移动、复制或删除。

### 创建角色

1. 确认结果页存在角色草稿。
2. 如需同时新建并绑定本次世界书，勾选“创建角色后绑定本次新建世界书”。
3. 点击“创建到酒馆角色”。
4. 查看步骤报告：
   - 校验角色草稿
   - 创建导入前备份
   - 可选创建待绑定世界书
   - 创建新角色
   - 可选绑定角色到新世界书
   - 验证旧角色未变化
5. 创建成功后，在 SillyTavern 原生角色面板继续管理角色。

### MuMu / Android 测试

在 MuMu 浏览器中访问宿主机 SillyTavern，一般使用：

```text
http://10.0.2.2:8000/
```

建议 smoke test 顺序：

1. 确认 SillyTavern 服务返回 200。
2. 打开 MuMu 浏览器访问页面。
3. 确认扩展面板出现。
4. 运行 mock 分析。
5. 验证结果页、导出、本地备份、诊断日志导出。
6. 如需验证真实写入，创建 `SO_*` 前缀测试角色和世界书，并记录名称。

## 维护指南

### 本地语法检查

```powershell
node --check setting-organizer\index.js
node --check setting-organizer\src\ui\panel.js
node --check setting-organizer\src\ui\results.js
node --check setting-organizer\src\ui\confirm.js
node --check setting-organizer\src\core\importer.js
node --check setting-organizer\src\adapters\sillytavernApi.js
```

### 单元测试

```powershell
Get-ChildItem setting-organizer\tests\*.mjs | ForEach-Object {
    Write-Host "Running $($_.Name)"
    node $_.FullName
}
```

注意：`cdp-check.mjs` 是 CDP 辅助脚本，完整调用格式为：

```powershell
node setting-organizer\tests\cdp-check.mjs <websocket-url> <expression>
```

### 排障流程

1. 先导出诊断日志。
2. 记录错误码、操作步骤、是否使用当前聊天、是否执行真实写入。
3. 若是 `E010`、`E008`、`E009`、`E013`，优先检查 SillyTavern 版本和 `API_COMPATIBILITY.md`。
4. 若是导入相关错误，查看步骤报告，确认失败发生在创建、绑定还是旧数据校验。
5. 若 SillyTavern 升级后 API 失效，优先修改 `src/adapters/sillytavernApi.js`，不要把兼容逻辑散落到 UI。

## 后续建议

- 给 `cdp-check.mjs` 增加单独说明或从通用测试循环中排除，避免误读测试输出。
- 后续若支持更多 SillyTavern 版本，应先扩展 `API_COMPATIBILITY.md` 的 runtime probe 记录，再改 adapter。
- 继续保持“UI / core / adapter / storage”分层，不把原生角色或世界书管理器能力复制进插件。
