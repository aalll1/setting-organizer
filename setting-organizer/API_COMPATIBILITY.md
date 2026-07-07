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

## Decision

Proceed with local UI, state, validation, mock analysis, prompt, warnings, and JSON export tasks. Block business writes to SillyTavern until runtime API compatibility is confirmed.
