import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { analyzeCampaignStateText } from '../src/core/stateAnalyzer.js';
import { buildExtractStatePrompt } from '../src/prompts/extractState.js';

globalThis.window = { setTimeout(callback) { callback(); } };

for (const template of ['generic', 'historical', 'dnd']) {
    const root = new URL(`../test-samples/templates/${template}`, import.meta.url);
    const [input, expectedText] = await Promise.all([
        readFile(new URL(`${root.pathname}.input.txt`, root), 'utf8'),
        readFile(new URL(`${root.pathname}.expected.json`, root), 'utf8'),
    ]);
    const fixture = JSON.parse(expectedText);
    const state = await analyzeCampaignStateText(input, { analysisMode: 'mock', stateTemplate: fixture.template, sourceMessageRange: fixture.sourceMessageRange });
    assert.equal(state.characters.length, fixture.expected.characterCount);
    assert.equal(state.missions.length, fixture.expected.missionCount);
    assert.ok(state.campaign.currentLocation.startsWith(fixture.expected.locationPrefix));
    assert.ok(buildExtractStatePrompt(input, { stateTemplate: fixture.template }).includes(`stateTemplate: ${fixture.template}`));
}

console.log('templateSamples tests passed');
