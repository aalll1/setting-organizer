# Setting Organizer Data Model

## Scope

This document records the data boundary introduced in `TC-27` and extended through `TC-36`. The first campaign-state model is a draft-first structure. It does not change the existing character draft or lorebook draft flow, and it does not write anything to SillyTavern.

## Existing Drafts

The v0.2.x setting organizer flow still uses these independent draft types:

- `CharacterDraft`: editable character-card draft generated from pasted text or current chat.
- `LorebookDraft`: editable worldbook-entry draft generated from pasted text or current chat.
- `AnalysisResult`: wrapper containing character drafts, lorebook drafts, warnings, token estimate, and prompt metadata.

These drafts are import/export preparation objects. They are not long-running campaign state.

## CampaignState

`CampaignState` starts at schema version `campaign-state-v0.1`.

The first version covers only:

- Campaign summary.
- Character state.
- Faction state.
- Mission state.
- Key item state.

The schema file is:

```text
setting-organizer/src/schemas/campaignState.schema.json
```

The shared constants and typedef entry point are:

```text
setting-organizer/src/core/stateTypes.js
```

## Top-Level Shape

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
    "lastUpdatedAtMessage": 0,
    "sourceMessageRange": "",
    "confidence": 1,
    "warnings": []
  },
  "plotSummary": "",
  "characters": [],
  "factions": [],
  "missions": [],
  "items": [],
  "warnings": []
}
```

Every state item must include:

- `id`
- `sourceMessageRange`
- `confidence`
- `warnings`

## Boundary Rules

### Current State

Current state describes what is true now in the active campaign context. Examples:

- A character's current location.
- A mission's current status.
- A key item's current holder.
- A faction's current stance.

Current state is draft data until the user explicitly confirms a future save or sync operation.

### History Archive

History archive is for older state that has been superseded but should remain inspectable. TC-27 only defines the boundary. It does not implement archive storage or merge logic.

Later tasks must not delete old state silently. State update work should mark older entries as archived or produce a diff for user confirmation.

### Permanent Lore

Permanent lore is stable setting information, such as geography, rules, background institutions, and durable character facts. It should remain separate from campaign state because current plot state changes frequently.

The plugin must not merge permanent lore and dynamic state into one uncontrolled structure.

## Explicit Non-Goals

Implemented:

- `TC-27`: campaign state schema and type constants.
- `TC-28`: state prompt, parser, normalizer, and validator.
- `TC-29`: state draft UI for viewing, editing, and deleting draft items.
- `TC-30`: state JSON export/import and recent draft localStorage.
- `TC-32`: deterministic state merge and archive core logic.
- `TC-34`: deterministic conflict detection core logic.
- `TC-35`: read-only conflict display and handling suggestions.
- `TC-36`: campaign-state to lorebook-draft builder and draft-only diff preview.
- `TC-38`: built-in campaign-state templates for prompt focus and UI groups.

Still not implemented:

- SillyTavern writes.

## Import And Export

State export uses:

```text
setting-organizer/src/core/stateExporter.js
```

State import must pass `schemaVersion: "campaign-state-v0.1"`. Incompatible versions fail fast instead of being normalized into the current schema.

Recent state draft storage uses:

```text
setting-organizer/src/storage/stateStore.js
```

It stores only the latest state draft in browser localStorage. It does not merge multiple drafts, write to SillyTavern, or update worldbook entries.

## Merge And Archive

State merge uses:

```text
setting-organizer/src/core/stateMerger.js
```

Archive marking uses:

```text
setting-organizer/src/core/stateArchive.js
```

TC-32 merge behavior:

- Existing and incoming states are normalized and validated before merge.
- Identity matching is deterministic:
  - characters by `name`
  - factions by `name`
  - missions by `title`
  - items by `name`
- A changed active item is not deleted. The previous active item is marked `isActive: false`, `isArchived: true`, and receives `archiveOperationId`.
- The incoming changed item becomes the new active item.
- Re-importing the same incoming state does not create duplicate active items.
- Each merge returns an `operationId`, merged state, diff entries, and a summary count.

TC-32 does not perform semantic entity disambiguation. Similar names are treated as different entities unless their deterministic identity key matches.

## Conflict Detection

Rule-level conflict detection uses:

```text
setting-organizer/src/core/conflictDetector.js
```

TC-34 checks:

- same character with multiple current locations
- same character with multiple current statuses
- same mission with multiple statuses
- same item with multiple holders
- same faction with multiple attitudes to player
- an item marked as both active current state and archived history

Conflict detection is read-only. It returns warning records with `ruleId`, `entityType`, `identity`, `field`, `values`, `itemIds`, `sourceMessageRanges`, `message`, and `suggestion`; it does not edit state, archive entries, call models, or write to storage.

TC-35 renders these records in the state panel. The panel sorts by severity, shows the affected object, source IDs and source message ranges, and gives a handling suggestion. It remains informational: users can continue viewing and editing the draft, while no entry is automatically archived.

## Worldbook Sync Drafts

`worldbookSyncBuilder.js` converts a validated `CampaignState` into ordinary `LorebookDraft`-compatible entries. It does not call a SillyTavern API or save a worldbook.

The builder emits separate categories for `permanent_lore`, `current_state`, `mission_state`, `character_state`, `faction_state`, `item_state`, and `history_archive`. Archived source items remain visible as historical drafts but are emitted with `enabled: false`.

Each generated draft keeps `sourceStateId`, `sourceBoundary`, and `sourceMessageRange`. `lorebookAdapter.js` carries those values into `extensions.settingOrganizer` when a later, user-confirmed export or import occurs.

The builder also returns a draft-only preview containing `added`, `updated`, `unchanged`, and `removed` records against caller-supplied prior drafts. This comparison neither reads existing SillyTavern worldbooks nor overwrites them.

## State Templates

`src/templates/stateTemplates.js` supplies fixed built-in templates: `generic`, `historical`, and `dnd`. A template has an ID, display label, prompt focus, and allowed state UI groups. The selected ID is stored in settings and passed to the state prompt and state panel.

The default `generic` template preserves the previous field set. The historical and DND templates currently retain the same normalized campaign-state schema, while changing only extraction emphasis and the template-owned UI grouping contract. User-defined script templates are not supported.

## Maintenance Notes

- Add parser and normalizer logic in later tasks instead of overloading the existing setting parser.
- Keep `CampaignState` separate from `AnalysisResult`.
- Keep state-to-worldbook conversion in a later adapter/builder layer.
- Any future write path must preserve user confirmation, backup, diagnostics, and clear failure reporting.
