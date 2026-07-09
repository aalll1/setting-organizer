# Setting Organizer v0.2.1 运行时测试报告 2026-07-09

## 测试目标

- 验证 `TC-21` 到 `TC-25` 的稳定性修复在发布准备前可用。
- 验证 `manifest.json` 更新到 `0.2.1` 前后，本地语法检查和单元测试通过。
- 验证 SillyTavern 1.18.0 页面中扩展可加载，mock 分析、结果页、备份和诊断功能可用。

## 环境

| 项目 | 结果 |
| --- | --- |
| 日期 | 2026-07-09 |
| 宿主系统 | Windows |
| SillyTavern runtime | `SillyTavern-runtime` |
| SillyTavern 版本 | `1.18.0`，release `51ad27f` |
| Node.js | `v24.15.0` |
| 本地地址 | `http://127.0.0.1:8000/` |
| HTTP 检查 | `200` |
| ADB | 当前 PATH 未发现 `adb` |
| MuMu / Android CDP | 本轮未执行，改用宿主机浏览器 smoke test |

## 本地语法检查

命令范围：24 个关键 JS 文件。

覆盖模块：

- `index.js`
- `src/core/*`
- `src/ui/*`
- `src/adapters/*`
- `src/prompts/extractSetting.js`
- `src/storage/*`

结果：通过。

## 单元测试

命令范围：`setting-organizer/tests/*.mjs`，排除需要运行时参数的 `cdp-check.mjs`。

通过测试：

- `analyzer.test.mjs`
- `backups.test.mjs`
- `chatAdapter.test.mjs`
- `errors.test.mjs`
- `exporter.test.mjs`
- `importer.test.mjs`
- `logger.test.mjs`
- `modelOutputDebug.test.mjs`
- `parser.test.mjs`
- `prompt.test.mjs`
- `sillytavernApi.test.mjs`
- `tokenEstimate.test.mjs`
- `validator.test.mjs`
- `warnings.test.mjs`

结果：14 个无参数单元测试全部通过。

说明：`cdp-check.mjs` 直接运行会提示 `Usage: node cdp-check.mjs <websocket-url> <expression>`，因此记录为 CDP smoke 辅助脚本，不纳入无参数单元测试。

## SillyTavern 页面 Smoke Test

### 服务启动

- `npm start` 启动 `SillyTavern-runtime`。
- 首次启动自动创建 `config.yaml`、cookie secret 和默认用户数据。
- 服务输出 `SillyTavern is listening on IPv4: 127.0.0.1:8000`。
- 服务端扩展列表包含 `third-party/setting-organizer`。

### 扩展加载

页面检查结果：

- 页面标题：`SillyTavern`
- 扩展脚本：`/scripts/extensions/third-party/setting-organizer/index.js`
- 扩展样式：`/scripts/extensions/third-party/setting-organizer/style.css`
- 面板节点：`#setting-organizer-panel`
- 诊断按钮：
  - `导出诊断日志`
  - `清空诊断日志`
  - `复制原始模型输出`
  - `下载原始模型输出`

结果：通过。

### Mock 分析

测试输入摘要：

```text
SO_V021_Smoke 是雾城调查员，长期追踪旧城区异常。
```

验证结果：

- 状态显示 `分析完成。`
- 输入长度显示正常。
- 分析模式显示 `mock`。
- 结果区包含总览、角色、世界书、警告。
- 导出按钮显示正常。
- `创建备份` 按钮显示正常。

结果：通过。

### 备份

操作：点击 `创建备份`。

结果：

- 页面显示 `备份已创建`。
- 备份标识示例：`backup_20260709123623789_rq2tea`。

结果：通过。

### 诊断日志导出

操作：点击 `导出诊断日志`。

结果：

- 页面显示 `已导出诊断日志：5 条`。

结果：通过。

### 真实模型短文本路径

操作：

- 切换到 `当前 SillyTavern 模型`。
- 输入短文本。
- 点击 `开始分析`。

当前环境未配置可用模型连接，返回错误路径：

```text
模型输出格式错误
错误码：E002
技术详情：模型输出不是文本。
```

结果：

- UI 显示可读错误帮助。
- 页面未崩溃。
- 分析按钮恢复可用。

结论：真实模型成功路径未验证；错误路径通过。

### 原始模型输出隐私确认

操作：点击 `复制原始模型输出`。

结果：

- 触发隐私确认弹窗。
- Codex in-app Browser 控制 API 被该确认弹窗阻塞并超时。

结论：

- 隐私确认路径被触发，符合“完整原始输出只能用户显式确认导出”的设计。
- 本轮未继续点击确认导出，避免在测试中处理潜在聊天隐私内容。

## 未完成或受限项

- 当前 PATH 未发现 `adb`，未执行 MuMu / Android CDP smoke。
- 当前 SillyTavern runtime 未配置真实模型连接，未验证真实模型成功输出路径。
- 未创建新的真实角色或世界书；v0.2.1 只做稳定性修复，不新增写入能力。

## 问题复盘

1. runtime 扩展副本最初仍是旧代码。
   - 表现：`src/prompts/extractSetting.js` 仍为 `extract-setting-v0.1.0`。
   - 处理：同步 `setting-organizer/` 到 runtime 第三方扩展目录后重载页面。

2. SillyTavern 首次启动欢迎弹窗遮挡扩展面板。
   - 表现：面板 DOM 存在，但控件宽高为 0。
   - 处理：保留默认用户名 `User` 并点击确认后再打开扩展抽屉。

3. 原始模型输出导出确认弹窗会阻塞自动化控制。
   - 表现：点击复制按钮后浏览器控制 API 超时。
   - 处理：记录为测试限制；确认该路径已触发隐私确认。

## 结论

v0.2.1 本地语法检查、单元测试和 SillyTavern 1.18.0 宿主机浏览器 smoke test 通过。当前环境缺少 ADB 且未配置真实模型，因此 MuMu/CDP 和真实模型成功路径未完成；这些限制已记录，不影响 v0.2.1 稳定性修复版的本地发布准备。
