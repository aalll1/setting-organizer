# Setting Organizer v0.2.0 运行时测试报告 2026-07-08

## 测试环境

- 宿主工作目录：`E:\Desktop\silly tavren`
- SillyTavern runtime：`SillyTavern-runtime/`
- SillyTavern 版本：1.18.0，release commit `51ad27f`
- 扩展版本：`0.2.0`
- 本地服务：`http://127.0.0.1:8000/`
- MuMu 访问地址：`http://10.0.2.2:8000/`
- MuMu ADB：`127.0.0.1:7555`
- Android 版本：12
- 浏览器包名：`com.android.chromium`
- CDP：`ws://127.0.0.1:9222/devtools/page/3`

## 启动检查

- `npm run start:global` 启动成功。
- HTTP 探测 `http://127.0.0.1:8000/` 返回 `200`。
- 扩展列表包含 `third-party/setting-organizer`。
- 启动仍出现 3 条 `@popperjs/core` webpack warning，不阻断本次测试。

## 本地自动测试

- 关键模块 `node --check` 通过：
  - `index.js`
  - `sillytavernApi.js`
  - `importer.js`
  - `validator.js`
  - `confirm.js`
  - `results.js`
- 全部 `.mjs` 单元测试通过：
  - backups
  - exporter
  - importer
  - prompt
  - sillytavernApi
  - tokenEstimate
  - validator
  - warnings
  - chatAdapter
  - logger

## MuMu 页面实测

### 扩展加载

- 扩展面板存在。
- manifest 版本读取为 `0.2.0`。
- mock 分析状态为 `success`。

### 当前聊天范围读取

测试脚本向当前页面上下文注入 60 条 `SO_V02_Chat` 测试消息，只记录摘要，不记录完整聊天正文。

| 范围 | 结果 |
| --- | --- |
| 最近 20 条 | 成功读取 20/60，约 182 tokens |
| 最近 50 条 | 成功读取 50/60，约 456 tokens |
| 全部 | 成功读取 60/60，约 545 tokens |
| 手动索引 `0,2,59` | 成功读取 3/60，约 26 tokens |

### 诊断日志与备份

- 诊断日志导出成功。
- 下载名：`setting-organizer-diagnostics-20260708144019472.json`
- 本地备份状态：`success`

### 角色、世界书与绑定

- 测试角色：`SO_V02_1783521618416`
- 测试角色头像：`SO_V02_1783521618416.png`
- 测试世界书：`SO_V02_设定整理器绑定 20260708144019894`
- 创建到酒馆流程状态：`success`
- 报告包含 `绑定角色到新世界书: completed`
- 角色摘要确认：
  - `data.extensions.world` 指向 `SO_V02_设定整理器绑定 20260708144019894`
  - `getWorldInfoNames()` 确认该世界书存在

### 原生入口

- 创建报告显示 `打开酒馆原生世界书` 按钮。
- 点击后记录 `worldbook-native-editor-opened` 日志。
- 当前版本可用接口：`getContext().reloadWorldInfoEditor(name, true)`

## 日志摘要

最近关键日志事件包括：

- `worldbook-native-editor-opened`
- `character-import-completed`
- `character-world-bind-completed`
- `character-create-completed`
- `worldbook-create-completed`
- `backup-created`
- `diagnostics-exported`
- `analysis-completed`
- `chat-read-completed`

## 问题复盘

- MuMu 实测没有阻塞问题。
- 测试聊天通过页面上下文注入，未保存为持久聊天文件。
- 测试数据按约定保留，不自动删除。
- `@popperjs/core` warning 仍属于 SillyTavern runtime 依赖环境 warning，不影响扩展测试。

## 结论

v0.2.0 开发、自动测试和 MuMu/SillyTavern 实测通过，可创建本地 `v0.2.0-rc1` 候选版本 tag。
