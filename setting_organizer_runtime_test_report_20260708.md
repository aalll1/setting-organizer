# Setting Organizer 运行时测试报告 2026-07-08

## 测试环境

- 宿主系统：Windows，工作目录 `E:\Desktop\silly tavren`
- SillyTavern runtime：`SillyTavern-runtime/`
- SillyTavern 版本：1.18.0，release commit `51ad27f`
- 本地服务：`http://127.0.0.1:8000/`
- MuMu 访问地址：`http://10.0.2.2:8000/`
- MuMu ADB：`127.0.0.1:7555`，别名 `emulator-5558`
- Android 版本：12
- 浏览器包名：`com.android.chromium`
- CDP 转发：`tcp:9222 -> localabstract:chrome_devtools_remote`

## 本地单元测试

执行并通过：

- `backups.test.mjs`
- `exporter.test.mjs`
- `importer.test.mjs`
- `prompt.test.mjs`
- `sillytavernApi.test.mjs`
- `tokenEstimate.test.mjs`
- `validator.test.mjs`
- `warnings.test.mjs`
- `chatAdapter.test.mjs`
- `logger.test.mjs`

说明：

- `importer` 和 `sillytavernApi` 测试会输出结构化日志，这是 logger 预期行为。
- `chatAdapter` 和 `logger` 测试没有成功文本，但退出码为 0。

## SillyTavern 启动与扩展加载

- `npm run start:global` 启动成功。
- HTTP 探测 `http://127.0.0.1:8000/` 返回 `200`。
- 启动日志确认扩展可用：`third-party/setting-organizer`。
- 启动过程中出现 3 条 `@popperjs/core` webpack warning，不阻断服务：
  - `detectOverflow` reexport not found in `createPopper.js`
- MuMu 页面标题为 `SillyTavern`。
- 扩展面板存在，标题为 `设定整理器`，初始状态为 `等待输入。`
- 诊断控件存在：
  - `导出诊断日志`
  - `清空诊断日志`

## 页面功能测试

### Mock 分析

输入：

```text
林月 是雾城调查员，擅长追踪旧城区的异常传闻。
雾城 图书馆 保存 禁书 档案。
```

结果：

- 状态：`success`
- 角色草稿：1
- 世界书条目：1
- 警告：1
- 粗估 Token：149
- 角色名：`林月`
- 世界书标题：`林月`

### 导出、诊断日志与备份

- 诊断日志导出成功，生成下载名：`setting-organizer-diagnostics-20260708061922109.json`
- 诊断日志清空成功，状态文本：`诊断日志已清空。`
- 完整草稿导出成功，生成下载名：`internal-full.json`
- 本地备份创建成功，示例备份标识：`backup_20260708061922346_q0wv1a`

### 真实世界书创建

- 创建流程完成。
- 备份标识：`backup_20260708061922790_5tp066`
- 步骤状态：
  - 校验世界书草稿：completed
  - 创建导入前备份：completed
  - 创建新世界书：completed
  - 验证旧世界书未变化：completed
- `getWorldInfoNames()` 确认存在测试世界书：
  - `设定整理器导入 20260708061922789`

### 真实角色创建

- 创建流程完成。
- 测试角色名：`SO_TC_1783491562109`
- 测试角色头像文件：`SO_TC_1783491562109.png`
- 备份标识：`backup_20260708061926364_kzwyw0`
- 步骤状态：
  - 校验角色草稿：completed
  - 创建导入前备份：completed
  - 创建新角色：completed
  - 验证旧角色未变化：completed

### 当前聊天读取

- 当前会话没有可读取聊天消息。
- 点击“读取当前聊天”后返回预期错误：
  - `E012 当前聊天读取结果为空。`
- 面板错误状态和诊断日志均可记录该失败路径。

## 原生能力对比

SillyTavern 1.18.0 原生已提供：

- 世界书创建、导入、编辑、删除、条目复制/移动。
- 角色创建和角色管理。
- 角色内嵌 world/lorebook 导入。
- 世界书绑定、辅助世界书、聊天 / 角色 / persona 世界书能力。

Setting Organizer 的定位应保持为设定整理前置工作台：

- 从粘贴文本或当前聊天整理成角色草稿和世界书草稿。
- 负责 AI/mock 分析、结构校验、重复检测、token 预算警告。
- 负责导入前备份、诊断日志和最小安全创建。
- 后续复杂编辑和管理交给 SillyTavern 原生功能。

## 发现的问题与处理建议

- ADB 首次启动受只读沙箱影响，无法写入用户 Temp 下的 `adb.log`。处理：使用已授权的提权命令启动 ADB daemon。
- CDP 测试脚本第一次使用了错误导出类型 `internal_full`，实际为 `internal-full`。处理：修正选择器后重跑成功。
- 世界书名称不能依赖静态上下文字段，SillyTavern 当前版本应调用 `getWorldInfoNames()` 验证。
- 当前聊天为空时返回 `E012` 是预期失败路径，不是阻塞问题。
- `@popperjs/core` webpack warning 属于 runtime 依赖环境警告，当前未阻断插件测试。

## 测试结论

- 当前扩展在 SillyTavern 1.18.0 + MuMu Android 12 环境下通过运行时回归。
- 无阻塞问题。
- 测试数据按计划保留，不自动删除，便于后续手动复核。

## 优化后 Smoke Test

- 优化内容同步到 `SillyTavern-runtime/public/scripts/extensions/third-party/setting-organizer` 后重启 runtime。
- `http://127.0.0.1:8000/` 返回 `200`。
- MuMu 重新连接 `127.0.0.1:7555`，页面通过 CDP `page/2` 验证。
- 验证结果：
  - 扩展面板存在，标题为 `设定整理器`。
  - mock 分析状态为 `success`。
  - 结果区按钮包含 `创建到酒馆世界书`。
  - 结果区按钮包含 `创建到酒馆角色`。
  - 诊断日志导出成功，下载名：`setting-organizer-diagnostics-20260708134759521.json`。
  - 本地备份状态为 `success`。
