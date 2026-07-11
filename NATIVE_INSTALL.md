# SillyTavern 原生扩展安装说明

本目录是 Setting Organizer 的发布用目录。目录根部直接包含 `manifest.json`、`index.js`、`style.css` 和 `src/`，可作为独立 Git 仓库供 SillyTavern 原生扩展安装器使用。

## 原生安装方式

1. 确认运行 SillyTavern 的机器已安装 `git`。
2. 打开 SillyTavern。
3. 点击顶部 `Extensions`。
4. 进入 `Install Extension`。
5. 粘贴发布仓库 URL：

```text
https://github.com/aalll1/setting-organizer
```

6. 选择分支，例如 `main` 或 `master`。
7. 安装完成后刷新 SillyTavern 页面。
8. 在扩展设置区域找到“设定整理器”面板。

## 发布仓库要求

发布仓库根目录必须直接包含：

```text
manifest.json
index.js
style.css
src/
README.md
```

不要把开发仓库根目录直接作为 SillyTavern 安装 URL。开发仓库包含测试报告、运行时目录和开发文档，不适合作为最终用户安装入口。

## 当前发布内容

- 插件版本：`0.7.1`
- 支持粘贴文本和当前聊天读取。
- 支持 mock 分析和当前 SillyTavern 模型分析。
- 支持角色草稿、世界书草稿、导出、备份、诊断日志。
- 支持创建到酒馆世界书。
- 支持创建到酒馆角色。
- 支持显式可选绑定本次新建世界书。
- 支持可读错误提示和保留错误码。
- 支持剧情状态草稿、内置模板、JSON 导入导出、确认式合并和规则级冲突提示。
- 支持状态世界书草稿预览和显式新建确认。
- 表单为 PC 与移动端提供高对比度输入、选项和禁用按钮样式。

## 注意事项

- 已在 SillyTavern 1.18.0 + MuMu Android 12 环境实测。
- 其他 SillyTavern 版本需要先做 smoke test。
- 第三方扩展应只从可信仓库安装。
- 插件不会替代 SillyTavern 原生角色管理器或世界书管理器。
