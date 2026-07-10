# API 兼容性

已在 SillyTavern 1.18.0 本地环境验证：

- `getContext().saveWorldInfo(name, data, true)` 新建世界书。
- `/api/characters/create` 新建角色。
- `/api/characters/merge-attributes` 绑定新角色与本次新建世界书。
- `reloadWorldInfoEditor(name)` 可用时打开原生世界书编辑器。

所有调用都集中在 `setting-organizer/src/adapters/sillytavernApi.js`。若接口不可用，必须返回明确兼容性错误并保留草稿/备份，不能在 UI 或 core 中添加旁路写入。

历史兼容性详情见 `setting-organizer/API_COMPATIBILITY.md`。
