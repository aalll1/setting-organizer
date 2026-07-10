# Setting Organizer Testing

## Test Layers

The project currently uses plain Node.js `.mjs` tests with no build step.

Default local unit test scope:

```powershell
Get-ChildItem setting-organizer\tests\*.mjs |
  Where-Object { $_.Name -ne 'cdp-check.mjs' } |
  Sort-Object Name |
  ForEach-Object { node $_.FullName }
```

`cdp-check.mjs` is a runtime helper that requires a websocket URL and expression:

```text
node cdp-check.mjs <websocket-url> <expression>
```

It is not part of the no-argument unit test run.

## Syntax Check

Run `node --check` on changed JavaScript modules. For v0.3.x, the checked set includes:

- core modules
- adapters
- prompts
- storage modules
- UI modules

## v0.3.x Regression Scope

The v0.3.x campaign-state MVP must verify:

- Existing setting organizer tests still pass.
- `CampaignState` schema and type constants are stable.
- State parser handles plain JSON, Markdown JSON, natural-language wrapped JSON, and truncated JSON.
- State normalizer fills recoverable missing fields.
- Incompatible `schemaVersion` fails clearly.
- State draft UI renders current summary, characters, factions, missions, items, confidence, warnings, import/export controls, and “draft not written” messaging.
- State JSON export can be imported again.
- Recent state draft storage does not affect existing setting draft backups.

## v0.4.x Regression Scope

TC-32 state merge tests must verify:

- Same character with a changed location archives the old active character and creates one new active character.
- Same item with a changed holder produces a readable diff entry.
- Re-importing the same incoming state does not create duplicate active items.
- Merge returns a deterministic `operationId` when supplied by the caller.
- Merge does not write to localStorage or SillyTavern.

TC-33 state diff UI tests must verify:

- Diff panel shows added, updated, archived, and conflict sections.
- Unchanged entries are hidden from the visible diff list.
- State panel exposes an explicit merge preview action.
- Confirm and cancel actions are visible only when a preview exists.
- Preview generation is separate from save confirmation.

TC-34 conflict detector tests must verify:

- Same character with multiple locations.
- Same character with multiple statuses.
- Same mission with multiple statuses.
- Same item with multiple holders.
- Same faction with multiple attitudes.
- Active archived entries.
- Detection does not mutate the input state.

## Runtime Smoke

SillyTavern smoke should cover:

- Extension panel loads.
- Setting mode still performs mock analysis.
- State mode performs mock state analysis.
- State panel shows “剧情状态草稿，未写入、未保存、未同步世界书。”
- State JSON export/import controls are visible.

MuMu / Android smoke requires a working `adb` path. On this machine, MuMu adb was found at:

```text
C:\Program Files\Netease\MuMu\nx_main\adb.exe
```

During TC-31, daemon startup failed because adb could not write:

```text
C:\Users\ADMINI~1\AppData\Local\Temp\adb.log
```

When this environment issue is fixed, rerun MuMu smoke with the known adb path instead of doing broad disk searches.

## TC-31 Verification Record

Date: 2026-07-10

Local syntax check:

```powershell
$files = Get-ChildItem -Path setting-organizer -Recurse -File -Include *.js
foreach ($file in $files) { node --check $file.FullName }
```

Result: passed, 33 JavaScript files checked.

Local unit tests:

```powershell
$tests = Get-ChildItem setting-organizer\tests\*.mjs |
  Where-Object { $_.Name -ne 'cdp-check.mjs' } |
  Sort-Object Name
foreach ($test in $tests) { node $test.FullName }
```

Result: passed, 20 no-argument tests run.

MuMu smoke result: blocked by adb daemon startup failure. The failure is recorded above with the exact adb path and `adb.log` permission error.

## TC-32 Verification Record

Date: 2026-07-10

Targeted syntax and unit test:

```powershell
node --check setting-organizer\src\core\stateArchive.js
node --check setting-organizer\src\core\stateMerger.js
node setting-organizer\tests\stateMerger.test.mjs
```

Result: passed.

Full local regression:

```powershell
$files = Get-ChildItem -Path setting-organizer -Recurse -File -Include *.js
foreach ($file in $files) { node --check $file.FullName }

$tests = Get-ChildItem setting-organizer\tests\*.mjs |
  Where-Object { $_.Name -ne 'cdp-check.mjs' } |
  Sort-Object Name
foreach ($test in $tests) { node $test.FullName }
```

Result: passed, 35 JavaScript files checked and 21 no-argument tests run.

## TC-33 Verification Record

Date: 2026-07-10

Targeted syntax and UI tests:

```powershell
node --check setting-organizer\src\ui\stateDiffPanel.js
node --check setting-organizer\src\ui\statePanel.js
node setting-organizer\tests\stateDiffPanel.test.mjs
node setting-organizer\tests\statePanel.test.mjs
```

Result: passed.

Full local regression:

```powershell
$files = Get-ChildItem -Path setting-organizer -Recurse -File -Include *.js
foreach ($file in $files) { node --check $file.FullName }

$tests = Get-ChildItem setting-organizer\tests\*.mjs |
  Where-Object { $_.Name -ne 'cdp-check.mjs' } |
  Sort-Object Name
foreach ($test in $tests) { node $test.FullName }
```

Result: passed, 36 JavaScript files checked and 22 no-argument tests run.

## TC-34 Verification Record

Date: 2026-07-10

Targeted syntax and unit test:

```powershell
node --check setting-organizer\src\core\conflictDetector.js
node setting-organizer\tests\conflictDetector.test.mjs
```

Result: passed.

Full local regression:

```powershell
$files = Get-ChildItem -Path setting-organizer -Recurse -File -Include *.js
foreach ($file in $files) { node --check $file.FullName }

$tests = Get-ChildItem setting-organizer\tests\*.mjs |
  Where-Object { $_.Name -ne 'cdp-check.mjs' } |
  Sort-Object Name
foreach ($test in $tests) { node $test.FullName }
```

Result: passed, 37 JavaScript files checked and 23 no-argument tests run.

## TC-35 Verification Record

Date: 2026-07-10

Targeted syntax and UI tests:

```powershell
node --check setting-organizer\src\ui\conflictPanel.js
node --check setting-organizer\src\ui\statePanel.js
node setting-organizer\tests\conflictDetector.test.mjs
node setting-organizer\tests\conflictPanel.test.mjs
node setting-organizer\tests\statePanel.test.mjs
```

Expected coverage:

- Conflict records include source message ranges without mutating draft state.
- The panel renders severity, object, source ID, source range, and suggestion.
- An empty result is rendered as an informational empty state.
- Rendering conflict results does not remove or block the state draft.

Full local regression:

```powershell
$files = rg --files setting-organizer -g "*.js"
foreach ($file in $files) { node --check $file }

$tests = rg --files setting-organizer\tests -g "*.mjs" |
  Where-Object { (Split-Path $_ -Leaf) -ne 'cdp-check.mjs' } |
  Sort-Object
foreach ($test in $tests) { node $test }
```

Result: passed, 38 JavaScript files checked and 24 no-argument tests run.

SillyTavern browser smoke:

- Local SillyTavern 1.18.0 was available at `http://127.0.0.1:8001/`.
- The current extension source was mounted through a separate local test extension so the pre-existing global extension was not overwritten.
- The state-mode panel loaded, mock analysis created a draft, and the explicit conflict action rendered the empty-state result.
- The visible status states that detection does not automatically modify the draft.
- Positive detail rendering for severity, source IDs, source ranges, and suggestions is covered by `conflictPanel.test.mjs` and `conflictDetector.test.mjs`.
- No real model call, character creation, worldbook creation, or import action was performed in this TC-35 smoke test.
