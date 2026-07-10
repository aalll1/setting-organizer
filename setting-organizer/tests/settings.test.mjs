import assert from 'node:assert/strict';
import { DEFAULT_SETTINGS, normalizeSettings } from '../src/storage/settings.js';

const defaults = normalizeSettings(null);
assert.equal(defaults.organizeMode, DEFAULT_SETTINGS.organizeMode);
assert.equal(defaults.analysisMode, DEFAULT_SETTINGS.analysisMode);
assert.equal(defaults.stateTemplate, 'generic');

const stateSettings = normalizeSettings({
    sourceText: '测试',
    organizeMode: 'state',
    analysisMode: 'mock',
    tokenBudgetMode: 'custom',
    targets: {
        character: false,
        lorebook: true,
    },
    customBudget: {
        character: 1200,
        lorebookEntry: 300,
        constantLore: 900,
    },
});

assert.equal(stateSettings.organizeMode, 'state');
assert.equal(stateSettings.stateTemplate, 'generic');
assert.equal(stateSettings.targets.character, false);
assert.equal(stateSettings.customBudget.character, 1200);

const invalid = normalizeSettings({
    organizeMode: 'unknown',
});

assert.equal(invalid.organizeMode, DEFAULT_SETTINGS.organizeMode);

console.log('settings tests passed');
