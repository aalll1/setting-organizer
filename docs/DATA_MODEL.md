# Setting Organizer Data Model

## Scope

This document records the data boundary introduced in `TC-27` and extended through `TC-32`. The first campaign-state model is a draft-first structure. It does not change the existing character draft or lorebook draft flow, and it does not write anything to SillyTavern.

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

Still not implemented:

- Conflict detection.
- Worldbook sync.
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

## Maintenance Notes

- Add parser and normalizer logic in later tasks instead of overloading the existing setting parser.
- Keep `CampaignState` separate from `AnalysisResult`.
- Keep state-to-worldbook conversion in a later adapter/builder layer.
- Any future write path must preserve user confirmation, backup, diagnostics, and clear failure reporting.
