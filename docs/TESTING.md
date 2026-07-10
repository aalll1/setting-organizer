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
