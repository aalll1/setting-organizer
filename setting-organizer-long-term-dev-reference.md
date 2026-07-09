# Setting Organizer 长期开发参考文档

> 基于当前对 `aalll1/setting-organizer` 仓库的分析，以及围绕 SillyTavern 剧情状态管理、世界书整理、人物/势力/道具追踪等需求的讨论整理。  
> 本文档用于后续项目规划、Agent 开发任务拆分、功能边界控制和相似项目调研参考。

---

## 1. 项目当前定位

当前仓库地址：

https://github.com/aalll1/setting-organizer

当前项目更准确的定位是：

> SillyTavern 设定整理器，用于把粘贴文本或当前聊天内容整理成角色草稿和世界书草稿，并由用户确认后导出或写入 SillyTavern。

当前仓库已经具备的基础能力包括：

- 读取用户粘贴的设定文本；
- 主动读取当前 SillyTavern 聊天；
- 调用当前 SillyTavern 模型进行整理；
- 生成角色草稿；
- 生成世界书草稿；
- 进行基础 JSON 解析、校验、规范化；
- 导出 JSON；
- 创建世界书；
- 创建角色；
- 角色绑定本次新建世界书；
- 诊断日志导出；
- 本地备份；
- 基本安全策略：不默认覆盖、不删除、不绕过用户确认直接写入。

当前项目不是完整的剧情状态管理器，也不是完整的世界书管理器。

---

## 2. 当前主要问题

### 2.1 真实模型输出不稳定

当前最严重的问题是：真实模型输出容易不是合法 JSON。

典型错误：

```json
{
  "code": "E002",
  "message": "模型输出不是合法 JSON。",
  "details": {
    "cause": "Unexpected end of JSON input"
  }
}
```

这说明模型调用本身已经完成，但返回内容无法被 `JSON.parse()` 解析。

常见原因：

- 模型输出被最大回复长度截断；
- 模型返回空字符串；
- 模型输出半截 JSON；
- 模型在 JSON 前后加了解释文字；
- 模型使用 Markdown 代码块但格式不标准；
- SillyTavern 当前模型不擅长严格 JSON 输出；
- 输入内容较长，输出结构又较复杂，导致截断概率上升。

当前解析逻辑比较脆弱，大致是：

```js
JSON.parse(stripMarkdownFence(rawText.trim()))
```

这意味着只要模型输出有一点偏离，就会直接报错。

---

### 2.2 Prompt 过长且输出结构偏重

当前 `extractSetting.js` 会把完整 JSON 结构模板塞入 prompt，并且使用格式化缩进：

```js
JSON.stringify(createOutputShape(), null, 2)
```

这会增加输入 token，也会诱导模型输出较长 JSON。

问题：

- 长 JSON 更容易被截断；
- 手机端、轻量模型、小上下文模型更容易失败；
- 模型可能复制模板但没有填完整；
- 角色和世界书字段较多，首次整理负担偏重。

---

### 2.3 缺少原始模型输出调试能力

当前诊断日志能看到模型调用完成，但看不到完整原始模型输出。

这会导致排错困难：

- 不知道模型是空响应；
- 不知道模型是否被截断；
- 不知道模型是否加了废话；
- 不知道 JSON 尾部是否缺失；
- 不知道是否是 Markdown 包裹导致解析失败。

建议增加“查看 / 复制 / 下载原始模型输出”能力。

---

### 2.4 当前功能偏“设定整理”，不适合长期剧情状态追踪

当前输出核心是：

```json
{
  "characters": [],
  "lorebookEntries": []
}
```

适合整理角色卡和世界书，但不适合追踪：

- 当前剧情状态；
- 当前时间；
- 当前地点；
- 谁被派去哪里；
- 某个任务进展如何；
- 某个势力当前态度如何；
- 某个关键道具现在由谁持有；
- 旧状态是否已经过期。

这类需求需要独立的“剧情状态库”，而不是简单塞进普通世界书。

---

### 2.5 世界书容易被旧状态污染

如果把动态剧情状态直接写入世界书，很容易出现矛盾。

例如：

```text
赵衡正在前往山东。
赵衡已经抵达山东。
赵衡被叛军俘虏。
赵衡逃回京师。
```

如果这些状态同时启用，模型会混乱。

所以需要区分：

- 永久设定；
- 当前状态；
- 临时状态；
- 历史归档；
- 已过期状态。

---

## 3. 当前仓库的优化建议

### 3.1 优先修复 JSON 解析稳定性

建议作为 `v0.2.1` 的首要任务。

应增加：

1. 模型输出长度日志；
2. 模型输出开头预览；
3. 模型输出结尾预览；
4. 原始输出查看按钮；
5. 原始输出复制按钮；
6. 原始输出下载按钮；
7. JSON 自动提取逻辑；
8. JSON 截断识别；
9. JSON 修复重试；
10. 更明确的用户错误提示。

建议逻辑：

```js
function extractLikelyJson(rawText) {
  const text = String(rawText || '').trim();

  const fenced = text.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  if (fenced) return fenced[1].trim();

  const firstBrace = text.indexOf('{');
  const lastBrace = text.lastIndexOf('}');

  if (firstBrace >= 0 && lastBrace > firstBrace) {
    return text.slice(firstBrace, lastBrace + 1).trim();
  }

  return text;
}
```

如果报错为 `Unexpected end of JSON input`，应提示：

```text
模型输出疑似被截断。请提高最大回复长度，缩短输入，或改用模拟结果测试流程。
```

---

### 3.2 优化 Prompt

建议改成更短、更稳定的 JSON 输出要求。

当前：

```js
JSON.stringify(createOutputShape(), null, 2)
```

建议改为：

```js
JSON.stringify(createOutputShape())
```

并在提示词中加入：

```text
只输出一个压缩 JSON 对象。
不要 Markdown。
不要解释。
不要换行说明。
如果信息不足，使用空字符串或空数组。
字段缺失允许由程序补全，但顶层必须包含 characters 和 lorebookEntries。
```

还可以将 schema 改为最小必要结构：

```json
{
  "characters": [],
  "lorebookEntries": [],
  "warnings": []
}
```

其他字段由 normalizer 补全。

---

### 3.3 增加“模型输出调试面板”

建议诊断面板增加：

- 本次 prompt 长度；
- 本次输入文本长度；
- 本次模型返回长度；
- 模型返回开头 500 字；
- 模型返回结尾 500 字；
- 是否检测到 Markdown 代码块；
- 是否检测到 JSON 起止大括号；
- 是否疑似截断；
- 复制原始输出；
- 下载原始输出。

注意：默认只保存在本地，不上传。

---

### 3.4 增加输入规模提示

当前用户可能一次读取大量聊天。建议增加输入规模判断：

```text
输入超过 3000 字符：提示建议使用最近 20 条或分批整理。
输入超过 8000 字符：提示可能导致模型输出截断。
输入超过 15000 字符：默认建议不要直接真实模型分析，先分批处理。
```

可复用现有 `estimateTextTokens()`。

---

### 3.5 优化“读取当前聊天”

当前支持：

- 最近 20 条；
- 最近 50 条；
- 全部；
- 手动索引。

建议增加：

- 读取范围预览；
- 消息编号显示；
- 用户消息 / AI 消息数量；
- 总字符数；
- 估算 token 数；
- 是否超过建议预算；
- 读取后不立即分析，先让用户确认。

示例：

```text
将读取第 280-329 条，共 50 条。
用户消息 22 条，AI 消息 28 条。
总字符数 12640。
建议：当前内容较长，可能导致 JSON 输出截断。
```

---

### 3.6 维持安全策略

当前仓库的安全方向是对的：

- 不默认覆盖已有角色；
- 不默认覆盖已有世界书；
- AI 输出必须先进入草稿；
- 用户确认后才写入；
- 写入前创建备份；
- 出错后保留诊断日志。

后续扩展时仍应坚持：

```text
AI 不直接写入最终数据。
AI 只生成草稿。
用户确认后再创建或同步。
默认不覆盖。
默认不删除。
默认不自动禁用旧状态。
```

---

## 4. 未来功能拓展方向

建议不要一次性开发“大而全”插件，而是分阶段扩展。

---

## 5. 建议路线图

### v0.2.1：稳定性修复版

目标：让当前设定整理功能更可靠。

功能：

- 优化 JSON 解析；
- 增加 JSON 提取；
- 增加截断识别；
- 增加模型原始输出查看；
- 增加模型输出长度日志；
- 优化 prompt；
- 压缩 JSON 模板；
- 增加输入长度提醒；
- 优化错误提示；
- 修复 E002 排查困难问题。

不做：

- 剧情状态管理；
- 世界书覆盖；
- 自动更新；
- 复杂 UI 改版。

---

### v0.3.0：剧情状态整理 MVP

目标：从“设定整理器”扩展为“设定 + 当前剧情状态整理器”。

新增模式：

```text
设定整理模式
剧情状态整理模式
```

剧情状态整理第一版只提取五类：

1. 剧情摘要；
2. 人物状态；
3. 势力状态；
4. 任务状态；
5. 关键道具。

建议新增文件：

```text
src/prompts/extractState.js
src/core/stateParser.js
src/core/stateNormalizer.js
src/core/stateValidator.js
src/ui/statePanel.js
src/storage/stateStore.js
src/schemas/campaignState.schema.json
```

建议数据结构：

```json
{
  "schemaVersion": "campaign-state-v0.1",
  "campaign": {
    "name": "",
    "currentTime": "",
    "currentLocation": "",
    "summary": ""
  },
  "plotSummary": "",
  "characters": [],
  "factions": [],
  "missions": [],
  "items": [],
  "warnings": []
}
```

---

### v0.4.0：状态更新与归档

目标：不只是生成状态，而是能更新旧状态。

功能：

- 读取最近聊天；
- 与已有状态库合并；
- 更新人物状态；
- 更新任务状态；
- 更新势力状态；
- 更新道具持有人；
- 保留旧状态记录；
- 标记旧状态为 archived；
- 显示状态变更差异；
- 用户确认后保存；
- 导出 / 导入状态 JSON。

必须避免：

- 自动无确认覆盖；
- 自动删除旧状态；
- 模型自行决定最终状态。

---

### v0.5.0：冲突检测

目标：降低长剧情混乱概率。

第一版冲突检测可做规则级，不做复杂语义推理。

检测项：

- 同名人物多个所在地；
- 同名人物多个生死状态；
- 同一任务多个状态；
- 同一道具多个持有人；
- 同一势力多个态度；
- 世界书关键词重复；
- 当前状态和历史归档同时启用；
- 新状态与旧状态冲突但未归档。

示例提示：

```text
检测到潜在冲突：
人物“赵衡”同时存在两个所在地：
1. 前往山东途中
2. 山东济南府
建议确认最新状态，并归档旧状态。
```

---

### v0.6.0：世界书同步增强

目标：把结构化状态安全同步为当前状态世界书。

功能：

- 选择哪些状态同步到世界书；
- 生成“当前状态世界书草稿”；
- 生成“历史归档世界书草稿”；
- 世界书差异预览；
- 旧状态条目建议禁用；
- 不自动覆盖已有条目；
- 用户确认后创建新世界书；
- 可选打开 SillyTavern 原生世界书编辑器。

建议世界书分类：

```text
永久设定
当前状态
任务状态
人物状态
势力状态
关键道具
历史归档
```

---

### v0.7.0：通用模板系统

目标：支持不同类型玩法。

模板示例：

- 历史模拟；
- 跑团 / DND；
- 王国经营；
- 宫斗权谋；
- 都市群像；
- 调查推理；
- 末日生存；
- 恋爱剧情；
- 科幻舰队；
- 战争沙盘。

每个模板拥有不同字段。

例如历史模拟模板：

```json
{
  "characters": [],
  "factions": [],
  "regions": [],
  "missions": [],
  "militaryStatus": [],
  "politicalStatus": [],
  "economicStatus": [],
  "events": []
}
```

DND 模板：

```json
{
  "partyMembers": [],
  "npcs": [],
  "quests": [],
  "locations": [],
  "items": [],
  "factions": [],
  "clues": [],
  "threats": []
}
```

---

## 6. 建议的核心数据结构

### 6.1 CampaignState

```json
{
  "schemaVersion": "campaign-state-v0.1",
  "campaign": {
    "id": "",
    "name": "",
    "genre": "",
    "currentTime": "",
    "currentLocation": "",
    "summary": "",
    "lastUpdatedAtMessage": 0
  },
  "characters": [],
  "factions": [],
  "missions": [],
  "items": [],
  "locations": [],
  "events": [],
  "openThreads": [],
  "warnings": []
}
```

---

### 6.2 CharacterState

```json
{
  "id": "",
  "type": "character",
  "name": "",
  "aliases": [],
  "role": "",
  "faction": "",
  "location": "",
  "status": "",
  "currentTask": "",
  "attitudeToPlayer": "",
  "resources": [],
  "relationships": [],
  "lastKnownUpdate": "",
  "sourceMessageRange": "",
  "isActive": true,
  "isArchived": false,
  "confidence": 0.8,
  "warnings": []
}
```

---

### 6.3 FactionState

```json
{
  "id": "",
  "type": "faction",
  "name": "",
  "leader": "",
  "controlledRegions": [],
  "stance": "",
  "attitudeToPlayer": "",
  "resources": "",
  "militaryStatus": "",
  "economicStatus": "",
  "currentGoal": "",
  "allies": [],
  "enemies": [],
  "lastKnownUpdate": "",
  "sourceMessageRange": "",
  "isActive": true,
  "isArchived": false,
  "confidence": 0.8,
  "warnings": []
}
```

---

### 6.4 MissionState

```json
{
  "id": "",
  "type": "mission",
  "title": "",
  "assignee": "",
  "assignedAt": "",
  "destination": "",
  "objective": "",
  "status": "pending | active | completed | failed | unknown",
  "progress": "",
  "expectedUpdate": "",
  "result": "",
  "relatedCharacters": [],
  "relatedFactions": [],
  "relatedItems": [],
  "sourceMessageRange": "",
  "isActive": true,
  "isArchived": false,
  "confidence": 0.8,
  "warnings": []
}
```

---

### 6.5 ItemState

```json
{
  "id": "",
  "type": "item",
  "name": "",
  "holder": "",
  "origin": "",
  "purpose": "",
  "status": "",
  "risk": "",
  "isUnique": true,
  "isConsumed": false,
  "relatedCharacters": [],
  "relatedMissions": [],
  "sourceMessageRange": "",
  "isActive": true,
  "isArchived": false,
  "confidence": 0.8,
  "warnings": []
}
```

---

### 6.6 WorldbookStateEntry

```json
{
  "id": "",
  "title": "",
  "keys": [],
  "content": "",
  "category": "permanent | current_state | mission | character | faction | item | archive",
  "stability": "permanent | current | temporary | archived",
  "validFrom": "",
  "validUntil": "",
  "sourceMessageRange": "",
  "lastUpdatedAt": "",
  "supersedes": [],
  "enabled": true,
  "constant": false,
  "priority": 100
}
```

---

## 7. UI 设计建议

建议最终 UI 采用标签页结构：

```text
设定整理
剧情状态
人物
势力
任务
道具
世界书草稿
冲突检测
诊断日志
```

### 7.1 剧情状态页

展示：

- 当前时间；
- 当前地点；
- 当前主线局势；
- 最近重大事件；
- 未解决问题；
- 下一步提醒。

### 7.2 人物页

展示：

- 姓名；
- 阵营；
- 位置；
- 当前任务；
- 状态；
- 对玩家态度；
- 最近更新；
- 是否归档。

### 7.3 势力页

展示：

- 势力名称；
- 领导人；
- 控制区域；
- 态度；
- 当前目标；
- 资源状况；
- 军事状况；
- 最近变化。

### 7.4 任务页

展示：

- 任务标题；
- 执行人；
- 地点；
- 目标；
- 状态；
- 预计回报；
- 结果；
- 是否逾期。

### 7.5 道具页

展示：

- 道具名；
- 持有人；
- 用途；
- 状态；
- 风险；
- 是否消耗；
- 相关任务。

### 7.6 冲突检测页

展示：

- 冲突类型；
- 冲突实体；
- 旧状态；
- 新状态；
- 建议操作；
- 用户确认按钮。

---

## 8. 世界书同步策略

### 8.1 不建议直接覆盖世界书

错误做法：

```text
AI 分析后直接覆盖旧世界书。
```

原因：

- 模型可能误判；
- JSON 可能解析错；
- 旧状态可能仍有历史价值；
- 用户难以回滚；
- 容易污染长剧情。

正确做法：

```text
AI 生成草稿 → 用户预览 → 用户确认 → 创建新世界书或手动同步。
```

---

### 8.2 当前状态与历史归档分离

建议至少两个世界书：

```text
当前状态世界书
历史归档世界书
```

当前状态世界书只保存最新有效信息。

历史归档世界书默认不启用，仅用于回顾。

---

### 8.3 稳定设定与动态状态分离

建议至少三类：

```text
永久设定
当前状态
历史归档
```

例如：

永久设定：

```text
大明制度、地理、人物背景、势力基本设定。
```

当前状态：

```text
赵衡正在山东执行任务。
李自成军逼近京师。
江南士绅目前观望。
```

历史归档：

```text
赵衡曾于崇祯十七年三月初离京。
```

---

## 9. 相似功能仓库参考

以下仓库建议作为调研对象，不代表全部成熟可用，也不代表完全满足需求。

---

### 9.1 当前仓库

#### setting-organizer

https://github.com/aalll1/setting-organizer

用途：

- 当前开发基础；
- 设定整理；
- 角色草稿；
- 世界书草稿；
- 当前聊天读取；
- JSON 输出校验；
- 世界书创建；
- 角色创建。

建议：

- 继续作为主线开发仓库；
- 先修稳定性；
- 再加剧情状态模块；
- 不要直接膨胀成完整世界书编辑器。

---

### 9.2 状态追踪类

#### BetterSimTracker

https://github.com/ghostd93/BetterSimTracker

可能相关点：

- 模拟状态追踪；
- 角色面板；
- 状态编辑；
- JSON 抽取协议；
- 动态角色面板；
- slash commands。

建议调研：

- 状态数据结构；
- UI 面板实现；
- JSON 抽取协议；
- 状态编辑逻辑；
- 是否可 fork 或借鉴。

---

#### BlazeTracker

https://github.com/lunarblazepony/BlazeTracker

可能相关点：

- 状态显示；
- 状态编辑；
- 进度追踪；
- 事件溯源；
- 关系编辑；
- v2 状态系统；
- 状态注入。

建议重点研究：

- event-sourcing 设计；
- tracked-state 结构；
- state editor；
- state display；
- extraction lifecycle；
- relationship editor；
- 是否适合作为长期状态管理参考。

---

#### rpg-companion-sillytavern

https://github.com/SpicyMarinara/rpg-companion-sillytavern

可能相关点：

- RPG 辅助；
- 跑团状态；
- 面板化 UI；
- 可能存在多 fork。

其他 fork / 相近仓库：

- https://github.com/Subarashimo/rpg-companion-sillytavern
- https://github.com/ProgrammerFailure/rpg-companion-sillytavern
- https://github.com/nrahis/rpg-companion-sillytavern

建议：

- 查看是否有任务、角色、道具、状态面板；
- 若功能简单，可只作为 UI 参考。

---

### 9.3 记忆 / 摘要类

#### SillyTavern-ReMemory

https://github.com/InspectorCaracal/SillyTavern-ReMemory

可能相关点：

- 记忆管理；
- 世界书式记忆；
- 可能与长期上下文维护有关。

---

#### sillytavern-character-memory

https://github.com/bal-spec/sillytavern-character-memory

可能相关点：

- 角色记忆；
- 每聊天隔离；
- 角色相关长期记忆。

---

#### Smart-Memory

https://github.com/senjinthedragon/Smart-Memory

可能相关点：

- 智能记忆；
- 长期记忆；
- 自动提取记忆。

---

#### st-memory-enhancement

https://github.com/Nidelon/st-memory-enhancement

可能相关点：

- 记忆增强；
- 上下文补充。

---

#### SillyTavern-STARmem

https://github.com/EvaL3n4/SillyTavern-STARmem

可能相关点：

- 记忆系统；
- 长期记忆参考。

---

### 9.4 摘要类

#### Extension-Summaryception

https://github.com/Lodactio/Extension-Summaryception

可能相关点：

- 对话摘要；
- 长对话压缩；
- summary 插入逻辑。

---

#### InlineSummary

https://github.com/Kristyku/InlineSummary

可能相关点：

- 内联摘要；
- 轻量总结；
- 插入上下文。

---

#### SimpleSummary

https://github.com/bbw3000/SimpleSummary

可能相关点：

- 简单摘要；
- 可参考最小实现。

---

#### summary-sharder

https://github.com/Promansis/summary-sharder

可能相关点：

- 分片摘要；
- 长对话分段整理。

---

#### SillyTavern-SimpleSummarizer

https://github.com/mokimoko/SillyTavern-SimpleSummarizer

可能相关点：

- 简单总结；
- 可参考 UI 和 prompt。

---

### 9.5 世界书相关

#### SillyTavern-WorldInfoDrawer

https://github.com/lazuli-s/SillyTavern-WorldInfoDrawer

可能相关点：

- 世界书抽屉；
- 世界书界面增强；
- 世界书浏览体验。

其他 fork：

- https://github.com/Guhndahb/SillyTavern-WorldInfoDrawer
- https://github.com/elegarmco/SillyTavern-WorldInfoDrawer

---

#### SillyTavern-WorldInfo-Recommender

https://github.com/Kawhi42/SillyTavern-WorldInfo-Recommender

可能相关点：

- 世界书推荐；
- 根据上下文选择合适条目；
- 可参考自动激活或推荐逻辑。

---

#### lorebook-manager

https://github.com/subzero5544/lorebook-manager

可能相关点：

- 世界书管理；
- 条目管理。

---

#### Lorebook-Manager-Silly-Tavern

https://github.com/XaYS-101/Lorebook-Manager-Silly-Tavern

可能相关点：

- 世界书管理；
- 导入导出参考。

---

### 9.6 其他可能相关项目

#### SillyTavern-Horae

https://github.com/SenriYuki/SillyTavern-Horae

可能相关点：

- 抽屉式 UI；
- 向量摘要；
- 自定义 prompt；
- 地点/状态类处理；
- 中文 README。

建议：

- 研究 UI 和 memory / vector 相关设计；
- 看是否能借鉴“侧边栏展示状态”的方式。

---

#### memu-sillytavern-extension

https://github.com/NevaMind-AI/memu-sillytavern-extension

可能相关点：

- 外部记忆系统接入；
- SillyTavern 记忆扩展。

---

## 10. 和相似仓库的关系判断

### 10.1 不建议盲目重复造轮子

在继续开发前，应重点研究：

```text
BlazeTracker
BetterSimTracker
SillyTavern-ReMemory
SillyTavern-WorldInfoDrawer
Extension-Summaryception
```

如果已有项目已经实现状态面板或事件溯源，可以借鉴或 fork。

---

### 10.2 本仓库的差异化方向

`setting-organizer` 应避免变成普通摘要插件。

它更适合走这个方向：

```text
设定整理 + 结构化状态提取 + 世界书草稿生成 + 用户确认同步
```

核心差异：

- 不只是摘要；
- 不只是记忆；
- 不只是世界书编辑；
- 而是把剧情内容整理成可管理的结构化状态。

---

### 10.3 不建议直接做完整世界书管理器

SillyTavern 原生已有世界书编辑器。

本仓库应该做：

```text
世界书草稿生成
世界书状态分类
世界书同步建议
世界书冲突提示
世界书导出导入辅助
```

不应该第一阶段就做：

```text
完整世界书编辑器
复杂拖拽管理
完整条目 CRUD 替代原生功能
大型资料库 UI
```

---

## 11. 推荐 Agent 开发任务描述

### 11.1 第一阶段任务描述

```text
在 setting-organizer 现有架构上进行稳定性修复：

1. 优化 src/core/parser.js：
   - 增加 JSON 提取逻辑；
   - 支持从模型废话中截取 JSON；
   - 识别疑似截断；
   - 保留原始错误原因。

2. 优化 src/adapters/sillytavernApi.js：
   - 记录模型返回长度；
   - 记录开头和结尾预览；
   - 不记录完整敏感正文；
   - 支持调试模式保存完整原始输出到本地。

3. 优化 src/prompts/extractSetting.js：
   - 压缩 JSON 模板；
   - 缩短提示词；
   - 明确要求压缩 JSON；
   - 减少输出字段依赖。

4. 优化 UI：
   - 增加原始模型输出查看/复制按钮；
   - 增加输入长度和 token 估算提醒；
   - 增加 E002 的专门提示。
```

---

### 11.2 第二阶段任务描述

```text
在 setting-organizer 中新增 campaign-state 剧情状态整理模块：

1. 新增 src/prompts/extractState.js；
2. 新增 src/core/stateNormalizer.js；
3. 新增 src/core/stateValidator.js；
4. 新增 src/ui/statePanel.js；
5. 新增 src/storage/stateStore.js；
6. 支持从当前聊天或粘贴文本中提取：
   - 剧情摘要；
   - 人物状态；
   - 势力状态；
   - 任务状态；
   - 关键道具；
7. 在 UI 中以标签页展示；
8. 支持用户手动编辑；
9. 支持导出/导入 campaign-state JSON；
10. 支持生成当前状态世界书草稿；
11. 第一版不得自动覆盖已有世界书。
```

---

### 11.3 第三阶段任务描述

```text
为 campaign-state 模块增加状态合并和冲突检测：

1. 支持读取最近聊天作为增量输入；
2. 将新提取状态与旧状态合并；
3. 检测同名人物、任务、势力、道具冲突；
4. 显示差异预览；
5. 用户确认后保存新状态；
6. 旧状态可标记 archived；
7. 支持生成当前状态世界书和历史归档世界书；
8. 不允许无确认覆盖。
```

---

## 12. 长期开发原则

### 12.1 数据优先，UI 次之

先保证数据结构稳定，再做复杂界面。

否则后期会反复重构。

---

### 12.2 当前状态和历史记录必须分离

这是长剧情能否稳定的核心。

必须避免旧状态和新状态同时污染上下文。

---

### 12.3 AI 只做建议，不做最终写入

AI 可以：

- 提取；
- 总结；
- 合并建议；
- 冲突提示；
- 生成草稿。

AI 不应该：

- 自动覆盖；
- 自动删除；
- 自动决定最终状态；
- 自动禁用旧世界书；
- 自动写入无预览数据。

---

### 12.4 不追求第一版完美自动化

第一版应该追求：

```text
可看
可改
可导出
可回滚
不污染
```

而不是：

```text
全自动
全智能
全同步
全推演
```

---

### 12.5 优先适配历史模拟和跑团场景

因为这两类最需要状态追踪。

重点实体：

- 人物；
- 势力；
- 地点；
- 任务；
- 道具；
- 时间线；
- 未完成事项；
- 历史归档。

---

## 13. 推荐最终产品定位

建议项目长期定位为：

> SillyTavern 结构化设定与剧情状态管理扩展。

英文名可考虑：

```text
Setting Organizer
Campaign State Organizer
Narrative State Manager
SillyTavern Campaign Manager
Lore & State Organizer
```

中文名可考虑：

```text
设定整理器
剧情状态管理器
世界书状态助手
酒馆战役管理器
设定与剧情台账
```

最准确的定位：

```text
不是单纯摘要插件；
不是完整世界书编辑器；
不是完整 RAG 系统；
而是把聊天和设定整理成可编辑、可导出、可同步的结构化状态。
```

---

## 14. 最终建议

短期不要追求通用型大插件。

建议顺序：

```text
1. 先修 JSON 稳定性。
2. 再做剧情状态整理 MVP。
3. 再做状态合并和冲突检测。
4. 再做世界书同步。
5. 最后才做模板系统和书籍管理增强。
```

核心判断：

```text
这个仓库可以继续作为主线开发基础。
但不能只靠增加 prompt 解决长期剧情管理问题。
必须引入独立的 Campaign State 数据层。
必须区分永久设定、当前状态、历史归档。
必须保持用户确认写入。
```

如果按照这个方向推进，项目可以从“设定整理器”逐步升级为真正适合历史模拟、跑团、群像剧情和长篇角色扮演的 SillyTavern 状态管理插件。
---

# 15. 新增开发规范：模块化、文档、日志、测试、注释与命名

> 本节根据后续讨论补充。  
> 这些规范不是附加要求，而是项目从“设定整理器”扩展为“长期剧情状态管理插件”时必须遵守的工程底线。

---

## 15.1 功能必须方便删改、增添和替换

后续功能会越来越多，例如：

```text
设定整理
剧情状态整理
人物状态追踪
势力状态追踪
任务追踪
关键道具追踪
地点追踪
世界书同步
冲突检测
模板系统
诊断日志
导入导出
```

如果所有功能混在一个大文件里，项目很快会不可维护。

### 基本要求

每个功能模块必须满足：

```text
能单独关闭
能单独替换
能单独测试
能单独回滚
不强依赖其他模块
不把 UI、数据处理、SillyTavern 适配混在一起
```

### 推荐模块结构

```text
src/
  core/
    parser.js
    validator.js
    normalizer.js
    stateMerger.js
    conflictDetector.js
    tokenEstimate.js

  prompts/
    extractSetting.js
    extractState.js
    mergeState.js
    repairJson.js

  ui/
    panel.js
    settingPanel.js
    statePanel.js
    characterPanel.js
    factionPanel.js
    missionPanel.js
    itemPanel.js
    diagnosticsPanel.js

  storage/
    settingsStore.js
    draftStore.js
    stateStore.js
    backupStore.js

  adapters/
    sillytavernApi.js
    worldInfoAdapter.js
    characterAdapter.js

  schemas/
    settingDraft.schema.json
    campaignState.schema.json
    worldbookSync.schema.json
```

### 功能开关设计

建议新增统一功能开关：

```json
{
  "features": {
    "settingOrganizer": true,
    "campaignState": true,
    "characterTracking": true,
    "factionTracking": true,
    "missionTracking": true,
    "itemTracking": true,
    "worldbookSync": false,
    "conflictDetector": true,
    "rawOutputDebug": true
  }
}
```

原则：

```text
一个模块失败，不应拖垮整个插件。
状态整理失败，不影响设定整理。
世界书同步失败，不影响 JSON 导出。
冲突检测失败，不阻止用户查看状态。
```

---

## 15.2 开发文档必须随代码推进

这个项目不能只靠 README。随着功能复杂化，必须建立稳定文档体系。

建议仓库固定维护：

```text
docs/DEVELOPMENT.md
docs/ARCHITECTURE.md
docs/ROADMAP.md
docs/API_COMPATIBILITY.md
docs/TESTING.md
docs/DATA_MODEL.md
docs/CHANGELOG.md
docs/KNOWN_ISSUES.md
docs/MIGRATION.md
```

### 文档职责

| 文档 | 作用 |
|---|---|
| DEVELOPMENT.md | 开发流程、代码规范、Agent 执行规则 |
| ARCHITECTURE.md | 项目架构、模块边界、数据流 |
| ROADMAP.md | 版本计划、功能优先级、延期功能 |
| API_COMPATIBILITY.md | SillyTavern 版本接口兼容记录 |
| TESTING.md | 测试流程、测试用例、环境说明 |
| DATA_MODEL.md | 草稿、状态、世界书同步等数据结构 |
| CHANGELOG.md | 每个版本的新增、修改、修复、测试、兼容性 |
| KNOWN_ISSUES.md | 已知问题和规避方式 |
| MIGRATION.md | 数据结构升级、旧数据迁移方案 |

### 文档同步规则

每次开发都必须遵守：

```text
改功能 → 更新 ROADMAP / DEVELOPMENT
改结构 → 更新 ARCHITECTURE / DATA_MODEL
改 SillyTavern 接口 → 更新 API_COMPATIBILITY
改测试 → 更新 TESTING
修 bug → 更新 CHANGELOG / KNOWN_ISSUES
改数据版本 → 更新 MIGRATION
```

Agent 开发时必须把“代码变更”和“文档更新”当成同一个任务，不允许只改代码不改文档。

---

## 15.3 更新日志必须覆盖运行到测试的每个方面

CHANGELOG 不能只写“新增了什么”。

因为 SillyTavern 扩展强依赖运行环境：

```text
SillyTavern 版本
浏览器
手机端
Termux
模型类型
上下文长度
最大回复长度
世界书接口
角色创建接口
本地存储
下载权限
```

所以每个版本的更新日志至少应包含：

```text
新增
修改
修复
删除
测试
兼容性
已知问题
风险
回滚建议
```

### 推荐格式

```md
## v0.3.0 - 剧情状态 MVP

### 新增
- 新增剧情状态整理模式。
- 新增人物、势力、任务、道具四类状态面板。
- 新增当前状态世界书草稿生成。

### 修改
- 优化 JSON 解析逻辑。
- 调整 extractSetting prompt 为压缩 JSON 输出。
- 将模型原始输出记录改为首尾预览，避免诊断日志泄露完整正文。

### 修复
- 修复模型输出 Markdown 包裹时解析失败的问题。
- 修复 E002 错误提示不明确的问题。
- 修复长文本输入时没有提前提醒的问题。

### 测试
- 模拟结果模式：通过。
- 当前 SillyTavern 模型模式：通过。
- 最近 20 条聊天读取：通过。
- 最近 50 条聊天读取：通过。
- 全部聊天读取：手动验证。
- 手动粘贴文本：通过。
- Android 浏览器下载：通过。
- JSON 截断场景：通过错误提示验证。
- 世界书重名场景：通过错误提示验证。

### 兼容性
- SillyTavern 1.18.0：基础流程通过。
- Android Chrome：基础 UI 和下载流程通过。
- Termux 环境：路径需手动确认。
- 其他 SillyTavern 版本：未完全验证。

### 已知问题
- 长文本仍可能导致模型输出截断。
- 真实模型 JSON 遵循能力依赖具体模型。
- 移动端复杂状态面板可能需要横屏使用。

### 风险
- 剧情状态由模型提取，可能误判。
- 世界书同步前必须人工确认。

### 回滚建议
- 如状态模块异常，可关闭 campaignState 功能开关。
- 世界书写入失败时，使用导出的草稿 JSON 手动导入。
```

---

## 15.4 测试必须形成闭环

测试不能只看“代码是否能运行”，还要看真实使用流程是否可靠。

### 测试分层

```text
单元测试
集成测试
UI 手动测试
SillyTavern 真实环境测试
Android / 移动端测试
模型输出异常测试
世界书写入测试
回滚测试
```

### 必测场景

```text
模型返回空字符串
模型返回半截 JSON
模型返回 Markdown JSON
模型返回自然语言 + JSON
输入文本很长
当前聊天为空
读取最近 20 条
读取最近 50 条
读取全部聊天
手动索引读取
世界书重名
角色重名
localStorage 不可用或已满
浏览器下载失败
SillyTavern 接口缺失
移动端按钮显示异常
模型调用失败
模型调用成功但 JSON 解析失败
世界书创建成功但绑定失败
```

### 测试文档要求

每个版本发布前，应在 `docs/TESTING.md` 中记录：

```text
测试日期
测试环境
SillyTavern 版本
浏览器
设备
模型
测试项
测试结果
失败项
规避方式
是否阻塞发布
```

示例：

```md
## 2026-07-09 v0.2.1 测试记录

### 环境
- SillyTavern：1.18.0
- 浏览器：Android Chrome
- 运行环境：Termux / Android
- 模型：当前 SillyTavern 默认模型

### 结果
| 测试项 | 结果 | 备注 |
|---|---|---|
| 模拟结果模式 | 通过 | UI 正常 |
| 当前模型分析短文本 | 通过 | JSON 可解析 |
| 当前模型分析长文本 | 部分失败 | 出现 E002，已提示疑似截断 |
| 读取最近 20 条 | 通过 | 字符数正常 |
| 导出诊断日志 | 通过 | Android 下载正常 |
```

---

## 15.5 代码注释规范

代码必须有必要注释，但不能堆无意义注释。

注释的目的：

```text
解释为什么这样做
解释兼容性风险
解释安全边界
解释后续维护注意事项
```

不是机械重复代码。

### 必须注释的地方

```text
SillyTavern 接口适配处
JSON 解析和修复逻辑
模型输出截断检测
数据结构迁移逻辑
世界书写入和备份逻辑
状态合并逻辑
冲突检测逻辑
历史归档逻辑
移动端 / Termux 特殊处理
不覆盖、不删除、不自动写入等安全保护逻辑
```

### 不建议注释的地方

```text
变量名已经说明含义的简单赋值
普通按钮绑定
简单 DOM 查询
机械重复代码
注释内容与代码完全重复的地方
```

### 推荐注释示例

```js
// generateQuietPrompt 在部分 SillyTavern 版本中可能返回空字符串，
// 也可能因为最大回复长度不足导致 JSON 被截断。
// 这里只记录首尾预览而不是完整正文，是为了兼顾排错能力和隐私保护。
const rawModelOutput = await context.generateQuietPrompt(prompt);
```

```js
// 不直接覆盖已有世界书。
// 模型整理结果必须先进入草稿，等待用户确认，避免误判导致长期剧情状态被污染。
const worldInfoPayload = convertLorebookDraftToWorldInfo(lorebookDraft);
```

```js
// 同名人物的 location/status/currentTask 属于动态字段。
// 合并时不能简单覆盖，必须保留旧值用于冲突检测和历史归档。
const mergedCharacterState = mergeCharacterState(oldCharacterState, newCharacterState);
```

### Agent 开发要求

```text
所有新增代码必须包含必要注释。
注释重点解释设计原因、兼容性原因、风险控制原因和后续维护注意事项。
不要添加无意义逐行注释。
注释要服务于维护，不是服务于凑数量。
```

---

## 15.6 变量命名必须统一

变量名必须尽早统一。随着项目扩展，如果同一概念有多套叫法，后期会非常难维护。

### 核心原则

```text
同一概念只能有一个主命名。
插件内部命名和 SillyTavern 原生字段要区分。
AI 生成但未确认的数据统一称为 Draft。
当前有效剧情数据统一称为 State。
已过期或不再注入的数据统一称为 Archive。
原始模型返回统一称为 rawModelOutput。
用户输入文本统一称为 sourceText。
世界书在插件内部统一称为 lorebook，在 SillyTavern 适配层使用 worldInfo。
```

---

### 推荐命名表

| 概念 | 推荐命名 | 不建议 |
|---|---|---|
| 用户输入文本 | sourceText | input, text, content |
| 模型原始输出 | rawModelOutput | result, response, answer |
| 解析后模型输出 | parsedModelOutput | json, data |
| 规范化结果 | normalizedResult | fixedData, finalData |
| 角色草稿 | characterDraft | charData, roleInfo |
| 世界书草稿 | lorebookDraft | worldbook, worldInfo, lore |
| SillyTavern 世界书格式 | worldInfoPayload | lorebookData |
| 剧情状态 | campaignState | memory, statusData |
| 人物状态 | characterState | characterMemory |
| 势力状态 | factionState | factionInfo |
| 任务状态 | missionState | questInfo, taskData |
| 道具状态 | itemState | inventoryInfo |
| 历史归档 | archiveEntry / isArchived | oldData, disabledData |
| Prompt | extractSettingPrompt / extractStatePrompt | message, instruction |
| JSON 修复 Prompt | repairJsonPrompt | fixPrompt, retryText |
| 世界书同步草稿 | worldbookSyncDraft | syncData, bookOutput |

---

### 世界书命名边界

建议：

```text
插件内部：lorebook
SillyTavern 原生适配层：worldInfo
UI 中文：世界书
```

示例：

```js
const lorebookDraft = buildLorebookDraft(normalizedResult);
const worldInfoPayload = convertLorebookDraftToWorldInfo(lorebookDraft);
await saveWorldInfo(worldInfoPayload);
```

不要写成：

```js
const worldbook = buildData(result);
const info = convert(worldbook);
```

---

### Draft / State / Payload 三层边界

项目必须明确区分三种数据：

```text
Draft：AI 生成，用户还没确认
State：插件内部当前有效状态
Payload：准备写入 SillyTavern 的原生格式
```

推荐流程：

```js
const rawModelOutput = await callCurrentModel(extractStatePrompt);
const parsedModelOutput = parseAnalysisJson(rawModelOutput);
const stateDraft = normalizeStateDraft(parsedModelOutput);
const campaignState = mergeCampaignState(previousCampaignState, stateDraft);
const worldInfoPayload = convertCampaignStateToWorldInfo(campaignState);
```

这比以下写法清楚得多：

```js
const result = await callModel(prompt);
const data = parse(result);
const info = update(data);
const output = convert(info);
```

---

### 命名检查规则

Agent 或开发者新增代码前应检查：

```text
是否已有同类命名
是否重复发明了同义词
是否混用了插件内部数据和 SillyTavern 原生格式
是否把 Draft、State、Payload 混在一起
是否把临时变量写成了全局概念名
```

新增变量、函数、文件、字段前，必须先检查是否已有同类命名。不得为同一概念新增第二套叫法。

---

## 15.7 新功能开发准入标准

每个新功能必须同时包含：

```text
功能说明
数据结构
UI 入口
错误处理
测试用例
诊断日志
回滚方式
文档更新
必要注释
命名规范检查
```

如果一个功能只有代码，没有测试、日志、文档和回滚方式，不应合入主分支。

---

## 15.8 总结后的长期工程原则

项目后续必须遵守：

```text
模块化开发
文档同步
日志完整
测试闭环
必要注释
命名统一
可关闭
可回滚
可迁移
```

最重要的判断：

```text
功能越多，越不能靠临时补丁堆。
必须先守住架构、命名、文档、测试和安全边界。
```

如果这些规范不落实，项目从“设定整理器”扩展为“剧情状态管理器”后，复杂度会迅速失控。
---

# 16. 吸收通用代码开发规范后的项目化工程标准

> 本节吸收 `Universal_Code_Development_Specification.md` 中适合本项目的内容，并将其落地为 `setting-organizer` 的专项工程规范。  
> 通用规范作为底座，本项目专项规范作为执行细则。若两者冲突，优先遵守本项目专项规范；若专项规范未覆盖，则遵守通用规范。

---

## 16.1 规范层级

建议在仓库中形成三层规范：

```text
第一层：通用代码规范
  docs/UNIVERSAL_CODE_SPEC.md
  作用：约束所有代码开发行为。

第二层：本项目开发规范
  docs/DEVELOPMENT.md
  作用：把通用规范落地到 setting-organizer 的目录、模块、数据流和 Agent 开发流程。

第三层：功能专项文档
  docs/DATA_MODEL.md
  docs/TESTING.md
  docs/API_COMPATIBILITY.md
  docs/MIGRATION.md
  docs/CHANGELOG.md
  作用：记录具体功能、数据结构、兼容性、测试和版本演进。
```

长期开发参考文档只负责总体方向，真正进入仓库后应拆分为多个正式文档。

---

## 16.2 可读性优先

本项目后续会同时处理：

```text
用户输入文本
模型原始输出
角色草稿
世界书草稿
剧情状态
人物状态
势力状态
任务状态
道具状态
SillyTavern 原生世界书格式
诊断日志
导入导出文件
```

因此代码必须优先保证可读性。

### 执行要求

```text
变量名必须表达业务含义。
函数名必须表达动作和返回结果。
模块名必须表达职责。
禁止使用 data、info、result、temp 等模糊命名承载核心业务对象。
复杂流程必须拆分为多个可读函数。
```

示例：

```js
// 推荐
const rawModelOutput = await callCurrentModel(extractStatePrompt);
const parsedModelOutput = parseAnalysisJson(rawModelOutput);
const stateDraft = normalizeStateDraft(parsedModelOutput);
const campaignState = mergeCampaignState(previousCampaignState, stateDraft);

// 不推荐
const result = await callModel(prompt);
const data = parse(result);
const info = fix(data);
const output = merge(info);
```

---

## 16.3 高内聚、低耦合

项目必须避免 UI、模型调用、解析、状态合并、世界书写入混在一起。

### 必须分层

```text
UI 层：
  只负责展示、交互、按钮事件、用户确认。

Core 层：
  负责解析、校验、规范化、状态合并、冲突检测。

Prompts 层：
  负责 prompt 构建，不处理业务状态。

Adapters 层：
  负责 SillyTavern 原生接口适配。

Storage 层：
  负责草稿、状态、设置、备份的读写。

Schemas 层：
  负责数据结构定义和版本校验。
```

### 禁止事项

```text
禁止在 UI 代码里直接拼 SillyTavern worldInfo payload。
禁止在 prompt 构建代码里写状态合并逻辑。
禁止在 adapter 里写业务判断。
禁止在 parser 里偷偷修改业务字段。
禁止在 storage 里调用模型。
```

---

## 16.4 单一职责与函数粒度

通用规范中提出单个函数原则上不超过 50 行。本项目可以将其作为软约束，但更重要的是职责单一。

### 判断标准

一个函数如果同时做了以下两件以上的事，就应该拆分：

```text
读取 UI
构建 prompt
调用模型
解析 JSON
修复 JSON
校验 schema
规范化字段
合并状态
检测冲突
写入世界书
导出文件
显示错误
```

### 推荐拆分

```js
async function analyzeStateFromSource(sourceText, options) {
  validateSourceText(sourceText);
  const extractStatePrompt = buildExtractStatePrompt(sourceText, options);
  const rawModelOutput = await callCurrentModel(extractStatePrompt);
  const stateDraft = parseValidateNormalizeStateDraft(rawModelOutput);
  return applyStateWarnings(stateDraft, sourceText, options);
}
```

如果后续继续变复杂，应进一步拆成：

```text
validateSourceText()
buildExtractStatePrompt()
callCurrentModel()
parseModelOutput()
validateStateDraft()
normalizeStateDraft()
applyStateWarnings()
```

---

## 16.5 确定性与防御性

模型输出天然不稳定，因此本项目必须比普通插件更重视防御性。

### 必须防御的输入

```text
空 sourceText
超长 sourceText
空 rawModelOutput
半截 JSON
Markdown 包裹 JSON
自然语言 + JSON
JSON 顶层结构不对
characters 不是数组
lorebookEntries 不是数组
任务状态缺少 assignee
道具状态缺少 holder
世界书条目缺少 keys
SillyTavern context 不存在
generateQuietPrompt 不存在
世界书接口变化
浏览器下载失败
localStorage 不可用或已满
```

### Fail-Fast 原则

函数入口必须尽早校验参数。发现明显错误时，不要带着错误数据继续向下跑。

示例：

```js
function validateSourceText(sourceText) {
  if (typeof sourceText !== 'string') {
    throw new SettingOrganizerError(ERROR_CODES.INVALID_INPUT, '输入内容必须是文本。');
  }

  if (!sourceText.trim()) {
    throw new SettingOrganizerError(ERROR_CODES.EMPTY_INPUT, '输入内容为空。');
  }
}
```

---

## 16.6 类型与 Schema 校验

当前仓库是普通 JavaScript，不建议为了短期开发立刻强行全量迁移 TypeScript。

建议采用渐进路线：

```text
短期：
  JSDoc + ESLint + JSON Schema / 手写 validator

中期：
  核心数据结构增加 typedef
  parser / normalizer / validator / merger 形成明确输入输出

长期：
  如项目持续扩大，再考虑迁移 TypeScript
```

### 短期必须做

```text
核心函数补 JSDoc。
核心对象补 typedef。
草稿、状态、世界书同步结构必须有 schemaVersion。
所有 parse/normalize/merge 函数必须有明确输入输出。
```

示例：

```js
/**
 * @typedef {Object} StateDraft
 * @property {string} schemaVersion
 * @property {Array<CharacterState>} characters
 * @property {Array<FactionState>} factions
 * @property {Array<MissionState>} missions
 * @property {Array<ItemState>} items
 * @property {Array<string>} warnings
 */

/**
 * 将模型输出解析、校验并规范化为剧情状态草稿。
 * @param {string} rawModelOutput 模型原始输出。
 * @returns {StateDraft}
 * @throws {SettingOrganizerError} 当模型输出不是合法 JSON 或结构不符合要求时抛出。
 */
function parseValidateNormalizeStateDraft(rawModelOutput) {
  // ...
}
```

---

## 16.7 消除魔法值

本项目中容易出现大量硬编码：

```text
最近 20 条
最近 50 条
最大预览长度 500
最大输入提醒阈值 3000
长文本警告阈值 8000
严重超长阈值 15000
默认 priority 100
默认 confidence 0.8
默认世界书分类名
错误码
事件名
日志级别
```

这些不应散落在 UI 或 core 代码中。

### 建议新增

```text
src/constants/index.js
src/constants/errorCodes.js
src/constants/defaults.js
src/constants/featureFlags.js
src/constants/logEvents.js
src/constants/schemaVersions.js
```

示例：

```js
export const CHAT_READ_LIMITS = {
  RECENT_20: 20,
  RECENT_50: 50,
};

export const TEXT_LENGTH_THRESHOLDS = {
  SUGGEST_SPLIT: 3000,
  WARN_TRUNCATION_RISK: 8000,
  BLOCK_OR_CONFIRM: 15000,
};

export const RAW_OUTPUT_PREVIEW_LENGTH = 500;

export const DEFAULT_CONFIDENCE = 0.8;
export const DEFAULT_WORLDBOOK_PRIORITY = 100;
```

---

## 16.8 异常处理与错误边界

### 禁止吞异常

禁止：

```js
try {
  await doSomething();
} catch (error) {}
```

也禁止只打印无上下文文本：

```js
console.error('failed');
```

### 正确方式

错误必须包含：

```text
错误码
错误消息
原始错误 cause
当前模式
输入长度
模型输出长度
操作对象
可恢复建议
```

示例：

```js
throw new SettingOrganizerError(
  ERROR_CODES.INVALID_JSON,
  '模型输出不是合法 JSON。',
  {
    cause: error.message,
    rawOutputLength: rawModelOutput.length,
    rawOutputPreviewStart: rawModelOutput.slice(0, RAW_OUTPUT_PREVIEW_LENGTH),
    rawOutputPreviewEnd: rawModelOutput.slice(-RAW_OUTPUT_PREVIEW_LENGTH),
    recoveryHint: '请提高最大回复长度、缩短输入，或使用模拟结果测试流程。',
  }
);
```

### 错误边界

不同模块应有不同错误边界：

```text
模型调用失败：不影响模拟模式。
JSON 解析失败：显示原始输出和修复建议。
状态整理失败：不影响设定整理。
世界书写入失败：保留草稿，可导出 JSON。
角色创建失败：保留角色草稿。
冲突检测失败：不阻止查看状态。
```

---

## 16.9 结构化日志与诊断日志

通用规范建议生产日志使用 JSON。对浏览器扩展来说，应落地为：

```text
内部日志对象结构化
导出诊断日志为 JSON
UI 展示时转换成人类可读文本
```

### 日志级别

```text
DEBUG：调试追踪，例如 prompt 长度、解析路径。
INFO：关键业务节点，例如读取聊天、模型调用完成、草稿生成。
WARN：可容忍异常，例如输入较长、疑似截断、字段缺失后已补默认值。
ERROR：功能失败，例如模型调用失败、JSON 无法解析、世界书写入失败。
```

### 日志必须包含上下文

建议结构：

```json
{
  "level": "ERROR",
  "event": "analysis-failed",
  "timestamp": "2026-07-09T00:00:00.000Z",
  "mode": "sillytavern",
  "sourceLength": 4349,
  "rawOutputLength": 1200,
  "errorCode": "E002",
  "errorMessage": "模型输出不是合法 JSON。",
  "cause": "Unexpected end of JSON input",
  "recoveryHint": "请提高最大回复长度，或缩短输入后重试。"
}
```

### 隐私原则

```text
默认日志不记录完整 sourceText。
默认日志不记录完整 rawModelOutput。
调试模式可允许用户本地查看完整原始输出。
导出诊断日志前应提示可能包含聊天内容。
```

---

## 16.10 幂等性与重复调用安全

涉及写入和状态更新的操作必须尽量幂等。

### 需要重点处理的操作

```text
创建世界书
创建角色
绑定世界书
同步状态到世界书
归档旧状态
导入状态 JSON
合并剧情状态
```

### 设计原则

```text
重复点击按钮不应重复创建大量同名世界书。
重复同步不应生成重复条目。
重复导入同一个状态文件不应污染当前状态。
写入前必须检测是否已存在同名对象。
涉及写入时应生成操作 ID 或批次 ID。
```

示例字段：

```json
{
  "operationId": "sync-20260709-001",
  "sourceDraftId": "draft-abc123",
  "targetWorldbookName": "当前状态世界书",
  "createdEntryIds": [],
  "skippedDuplicateIds": []
}
```

---

## 16.11 纯函数优先

以下逻辑应尽量写成纯函数，方便测试：

```text
stripMarkdownFence()
extractLikelyJson()
normalizeCharacterDraft()
normalizeLorebookEntry()
mergeCharacterState()
mergeFactionState()
detectStateConflicts()
convertCampaignStateToWorldInfo()
estimateTextTokens()
```

纯函数特点：

```text
相同输入得到相同输出
不直接读写 DOM
不直接读写 localStorage
不直接调用 SillyTavern API
不直接弹窗
```

这样可以独立写单元测试，不依赖 SillyTavern 运行环境。

---

## 16.12 测试质量要求

通用规范提出核心模块测试覆盖率原则上不低于 80%。本项目可将其作为长期目标。

### 短期最低要求

`v0.2.1` 开始，以下函数必须有测试：

```text
stripMarkdownFence()
extractLikelyJson()
parseAnalysisJson()
validateAndNormalizeAnalysisResult()
estimateTextTokens()
normalizeAnalysisResult()
```

`v0.3.0` 开始，以下函数必须有测试：

```text
parseStateDraft()
normalizeStateDraft()
mergeCampaignState()
mergeCharacterState()
mergeFactionState()
mergeMissionState()
mergeItemState()
detectStateConflicts()
convertCampaignStateToWorldInfo()
```

### 测试类型

```text
正常 JSON
Markdown JSON
自然语言 + JSON
空输出
半截 JSON
字段缺失
字段类型错误
数组变字符串
重复人物
重复任务
冲突所在地
冲突道具持有人
超长输入
```

### 测试命令要求

如果 Agent 修改代码，完成前必须尝试运行：

```text
npm test
npm run lint
npm run build
```

如果项目尚未配置这些命令，Agent 必须：

```text
说明当前缺少对应脚本。
补充最小可用测试脚本。
至少运行语法检查或相关替代检查。
不得直接宣称“测试通过”。
```

---

## 16.13 Agent 专属开发约束

吸收通用规范后，Agent 开发本项目时必须遵守以下流程。

### 修改前

```text
阅读相关文件。
说明将修改哪些文件。
说明每个文件的修改目的。
检查是否已有同类函数或命名。
不得重复造同义函数。
```

### 修改中

```text
保持模块边界。
新增代码必须有必要注释。
新增命名必须符合命名规范。
新增魔法值必须进入 constants。
新增核心逻辑必须可测试。
```

### 修改后

```text
运行 lint / test / build。
更新对应文档。
更新 CHANGELOG。
列出测试结果。
列出未能测试的项目。
列出风险和回滚方式。
```

### 禁止

```text
禁止生成未验证代码后直接声称完成。
禁止隐藏测试失败。
禁止吞异常。
禁止无说明大规模重构。
禁止随意改动 SillyTavern 适配层。
禁止自动覆盖用户世界书或角色。
```

---

## 16.14 提交与版本管理

每个功能或修复应尽量原子化。

### 单个提交应包含

```text
代码变更
相关测试
相关文档
CHANGELOG 记录
必要迁移说明
```

### 不建议

```text
一个提交里同时改 UI、状态合并、世界书写入、测试框架和文档结构。
```

### 推荐提交粒度

```text
fix(parser): tolerate fenced JSON and detect truncated output
feat(state): add campaign state draft schema
test(parser): cover markdown and truncated JSON outputs
docs(testing): add E002 troubleshooting test matrix
```

---

## 16.15 本项目对通用规范的适配差异

通用规范中的部分要求需要结合本项目实际调整。

### TypeScript 要求

通用规范建议动态语言强制类型声明或使用 TypeScript。  
本项目当前可采用渐进策略：

```text
不要求立即全量 TypeScript 化。
短期用 JSDoc + schema validation。
中期核心模块类型化。
长期视复杂度决定是否迁移 TypeScript。
```

### 函数 50 行限制

通用规范建议单函数不超过 50 行。  
本项目采用：

```text
职责单一优先。
超过 50 行必须自查是否可以拆分。
UI 渲染函数可适当放宽，但必须保持结构清晰。
核心逻辑函数应严格控制长度。
```

### JSON 日志

通用规范建议生产日志 JSON 化。  
本项目采用：

```text
内部诊断日志使用结构化对象。
导出日志使用 JSON。
UI 中以可读格式展示。
```

---

## 16.16 应写入仓库的建议文档结构

建议最终在仓库中形成：

```text
docs/
  UNIVERSAL_CODE_SPEC.md
  DEVELOPMENT.md
  ARCHITECTURE.md
  ROADMAP.md
  DATA_MODEL.md
  TESTING.md
  API_COMPATIBILITY.md
  CHANGELOG.md
  KNOWN_ISSUES.md
  MIGRATION.md
  AGENT_GUIDE.md
```

其中：

```text
UNIVERSAL_CODE_SPEC.md
  存放通用代码规范。

DEVELOPMENT.md
  存放本项目开发规范，包括模块边界、注释、命名、常量、异常、日志等。

AGENT_GUIDE.md
  专门约束 Agent 开发流程，包括修改前检查、修改后测试、文档更新和禁止事项。
```

---

## 16.17 最终落地建议

短期下一步应做：

```text
1. 把通用规范保存为 docs/UNIVERSAL_CODE_SPEC.md。
2. 把本长期开发文档拆分为 docs/ROADMAP.md、docs/DEVELOPMENT.md、docs/DATA_MODEL.md、docs/TESTING.md。
3. 在 DEVELOPMENT.md 中引用通用规范，并写明本项目专项规则优先。
4. 给 Agent 新增 AGENT_GUIDE.md。
5. 先执行 v0.2.1 稳定性修复。
```

核心原则：

```text
通用规范提供工程底线。
本项目规范提供业务边界。
Agent 指南提供执行流程。
测试文档提供质量闭环。
CHANGELOG 提供历史可追溯性。
```

如果这些文件建立起来，后续无论是人类开发者还是 Agent 接手，都能更稳定地推进项目，而不是靠聊天记录和临时记忆开发。
