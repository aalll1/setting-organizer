# Setting Organizer 原生安装发布记录

日期：2026-07-08

## 目标

将 Setting Organizer 准备为 SillyTavern 原生 `Install Extension` 可安装的 Git 仓库形态。

## 本地发布目录

已新增：

```text
setting-organizer-native-install/
```

该目录是干净发布副本，根目录直接包含：

```text
manifest.json
index.js
style.css
src/
README.md
API_COMPATIBILITY.md
FEATURES.md
USER_GUIDE.md
NATIVE_INSTALL.md
```

## 建议 GitHub 仓库

建议创建或使用：

```text
https://github.com/aalll1/setting-organizer
```

发布目录内 `manifest.json` 的 `homePage` 已按该 URL 设置。如果最终仓库名不同，需要同步修改 `homePage` 和 `NATIVE_INSTALL.md` 中的安装 URL。

## 当前阻塞点

- 当前本地开发仓库没有 GitHub remote。
- 本机未安装 `gh` CLI。
- GitHub App 当前可访问的仓库列表中没有发现专门的 `setting-organizer` 仓库。
- 为避免污染现有无关仓库，未将发布目录上传到 `earth`、`tvbox`、`kk-excel-script`、`ocsjs`、`legado` 或 `VideoTogether`。

## 上传方案

### 推荐方案：新建专用仓库

1. 在 GitHub 创建空仓库：`aalll1/setting-organizer`。
2. 将 `setting-organizer-native-install/` 目录作为仓库根目录推送。
3. 用户在 SillyTavern 中通过 `Extensions => Install Extension` 粘贴仓库 URL 安装。

### 备选方案：使用现有仓库

如果必须使用现有仓库，应创建独立分支或独立目录，但 SillyTavern 原生安装更适合“仓库根目录就是扩展目录”的结构，因此不推荐把扩展放入现有大仓库子目录。

## 后续验证

上传后需要验证：

1. SillyTavern `Install Extension` 能通过仓库 URL 拉取。
2. `manifest.json` 被识别。
3. 扩展面板正常出现。
4. mock 分析、导出、诊断日志和备份通过。
5. 如需真实写入，再验证世界书创建、角色创建和可选绑定。
