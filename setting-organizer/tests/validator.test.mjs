import assert from 'node:assert/strict';
import { ERROR_CODES, SettingOrganizerError } from '../src/core/errors.js';
import { parseValidateNormalize, validateAndNormalizeAnalysisResult } from '../src/core/validator.js';

const validResult = parseValidateNormalize(JSON.stringify({
    characters: [{ name: '林月', confidence: 2 }],
    lorebookEntries: [{ title: '银月教会', keys: '银月教会', confidence: -1 }],
}));

assert.equal(validResult.characters[0].confidence, 1);
assert.equal(validResult.lorebookEntries[0].confidence, 0);
assert.deepEqual(validResult.lorebookEntries[0].keys, ['银月教会']);
assert.ok(validResult.warnings.length >= 2);

assert.throws(
    () => parseValidateNormalize('这不是 JSON'),
    (error) => error instanceof SettingOrganizerError && error.code === ERROR_CODES.INVALID_JSON,
);

assert.throws(
    () => validateAndNormalizeAnalysisResult([]),
    (error) => error instanceof SettingOrganizerError && error.code === ERROR_CODES.SCHEMA_VALIDATION_FAILED,
);

assert.throws(
    () => validateAndNormalizeAnalysisResult({ characters: [], lorebookEntries: [] }),
    (error) => error instanceof SettingOrganizerError && error.code === ERROR_CODES.EMPTY_RESULT,
);

const markdownWrapped = parseValidateNormalize('```json\n{"characters":[{"name":"林月"}]}\n```');
assert.equal(markdownWrapped.characters[0].name, '林月');

console.log('validator tests passed');
