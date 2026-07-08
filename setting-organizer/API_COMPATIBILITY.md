# SillyTavern API Compatibility

This file records the `TC-01A` compatibility probe for the Setting Organizer extension.

Probe date: 2026-07-07

## Probe Scope

The current workspace contains only planning documents and the local extension skeleton. It does not contain a SillyTavern checkout, running SillyTavern instance, or version-specific server files. Therefore this probe can only record documented and source-level interface candidates. Runtime compatibility must still be verified inside the user's actual SillyTavern installation before implementing model calls, chat reads, character creation, or world info writes.

## Sources Checked

- Official SillyTavern extensions documentation: third-party extensions are installed through the Extensions panel by repository URL.
- Official SillyTavern installable extension manifest pattern, using `display_name`, `loading_order`, `requires`, `optional`, `js`, `css`, `author`, `version`, and `homePage`.
- Official SillyTavern extension source examples that import from core modules such as `script.js`, `extensions.js`, tokenizers, and app event APIs.

## Compatibility Matrix

| Capability | Availability | Interface Location | Stability | Notes |
| --- | --- | --- | --- | --- |
| Extension loading | Likely available | `manifest.json` with `js` and `css` entries | Medium | Needs runtime install test in SillyTavern. Current skeleton follows the observed manifest shape. |
| Settings panel mounting | Likely available | DOM containers such as `extensions_settings` / `extensions_settings2` | Medium | Current skeleton uses DOM fallback only. Later code should prefer the active SillyTavern settings container after runtime verification. |
| Settings save | Candidate available | `extension_settings`, `saveSettingsDebounced` from SillyTavern extension modules | Medium | Do not rely on this until import paths are verified in the target SillyTavern version. |
| Model call | Unknown | Candidate core generation APIs or server endpoints | Low | Must be probed in runtime before `TC-06`. If unavailable, degrade to manual model-output paste. |
| Current chat read | Candidate available | `getContext().chat` | Medium | Must verify message shape and privacy behavior in runtime before `TC-13`. |
| Character creation | Unknown | Candidate internal character import/create APIs | Low | Must not implement until runtime API is confirmed. First version must avoid overwriting existing characters. |
| World book creation | Unknown | Candidate world-info APIs and server endpoints | Low | Must not implement until runtime API is confirmed. First version must avoid modifying existing world books. |

## Runtime Probe Checklist

Run these checks inside the user's actual SillyTavern instance before implementing later task cards:

1. Confirm the extension appears in the Extensions panel and loads `index.js` / `style.css`.
2. Confirm which settings container is present: `extensions_settings`, `extensions_settings2`, or another current container.
3. Confirm whether third-party extension code can import from `../../../../script.js` and `../../../extensions.js`.
4. Confirm `extension_settings` and `saveSettingsDebounced` are available for persistent local settings.
5. Confirm `getContext()` exists and inspect the shape of `getContext().chat`.
6. Identify the current safe model invocation path.
7. Identify whether there is a supported create-character API.
8. Identify whether there is a supported create-world-info API.
9. Record the SillyTavern version, branch, and commit if available.

## Runtime Verification Update

Verified on 2026-07-07 with a local official SillyTavern test checkout:

- Test checkout: `SillyTavern-runtime/`
- SillyTavern version: `1.18.0`, release commit `51ad27f`
- MuMu Android version: `12`
- MuMu browser package: `com.android.chromium`
- MuMu URL for host SillyTavern: `http://10.0.2.2:8000/`
- Server listed extension: `third-party/setting-organizer`
- Chrome DevTools Protocol confirmed `#setting-organizer-panel` exists in the real page.

Runtime context findings:

| Capability | Runtime Result | Interface |
| --- | --- | --- |
| Extension loading | Verified | third-party manifest and panel DOM |
| Settings context | Verified candidate | `SillyTavern.getContext().extensionSettings`, `saveSettingsDebounced` |
| Model call | Verified candidate | `SillyTavern.getContext().generateQuietPrompt` |
| Current chat read | Verified candidate | `SillyTavern.getContext().chat` |
| World book names | Verified | `SillyTavern.getContext().getWorldInfoNames()` |
| World book creation | Verified | `SillyTavern.getContext().saveWorldInfo(name, data, true)` |
| Character list refresh | Verified | `SillyTavern.getContext().getCharacters()` and `SillyTavern.getContext().characters` |
| Character creation | Verified | `fetch('/api/characters/create', { method: 'POST', headers: getRequestHeaders({ omitContentType: true }), body: FormData })` |

Runtime test results:

- Mock analysis generated 1 character draft and 1 world book draft.
- Backup creation succeeded in the real page.
- First real world book creation exposed a name-sanitization bug: an ISO timestamp with `:` was normalized by SillyTavern, so verification failed with `E011` after creation.
- Default world book names now use a filesystem-safe timestamp.
- Second real world book creation succeeded.
- Existing world book names remained present after import.
- Runtime probing showed `createCharacterData` is a template object, not a callable creation function.
- Character creation through `/api/characters/create` succeeded with FormData fields such as `ch_name`, `description`, `personality`, `scenario`, `first_mes`, and `json_data`.
- Character import now refreshes `getCharacters()` before taking the before snapshot because `context.characters` can be empty until refreshed.
- Real character import created `TC12Retest20260707143136984.png`; before count was 2, after count was 3, and no previous avatar was missing.
- Current chat read is implemented through `SillyTavern.getContext().chat`. TC-13 normalizes message objects in `chatAdapter.js` and only reads chat after a user clicks the chat-read button.

## Decision

Proceed with world book creation through the centralized `sillytavernApi.js` adapter using `saveWorldInfo`. Proceed with character creation through the same adapter using `/api/characters/create`, with pre-write backup and post-write old-avatar verification.
