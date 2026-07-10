# 架构

| 层 | 职责 |
| --- | --- |
| `src/ui` | 面板、草稿编辑、确认、诊断和只读预览 |
| `src/core` | 解析、校验、分析、合并、冲突检测、导入编排 |
| `src/adapters` | SillyTavern World Info、角色、聊天和模型接口转换 |
| `src/storage` | 浏览器设置、备份、最近状态草稿 |
| `src/prompts` | 设定与状态抽取 prompt |
| `src/templates` | 固定玩法模板的字段组和 prompt 侧重点 |
| `src/schemas` | 草稿与状态的数据结构参考 |

数据流：输入或聊天 -> prompt/analyzer -> parser/validator -> 可编辑草稿 -> 用户确认 -> importer -> adapter。状态到世界书同步先构建草稿和 diff，再复用 importer 的备份与新建策略。

禁止让 UI 直接调用 SillyTavern 写入接口，禁止让 adapter 承担状态解析或业务决策。
