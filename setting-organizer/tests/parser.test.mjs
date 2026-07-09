import assert from 'node:assert/strict';
import { ERROR_CODES, SettingOrganizerError } from '../src/core/errors.js';
import { extractLikelyJson, parseAnalysisJson } from '../src/core/parser.js';

const compactJson = '{"characters":[{"name":"林月"}],"lorebookEntries":[]}';

assert.deepEqual(parseAnalysisJson(compactJson).characters[0].name, '林月');

assert.equal(
    extractLikelyJson(`\n\n${compactJson}\n\n`),
    compactJson,
);

assert.deepEqual(
    parseAnalysisJson(`\`\`\`json\n${compactJson}\n\`\`\``).characters[0].name,
    '林月',
);

assert.deepEqual(
    parseAnalysisJson(`以下是整理结果：\n${compactJson}\n请检查。`).characters[0].name,
    '林月',
);

assert.deepEqual(
    parseAnalysisJson(`前置说明\n\`\`\`json\n${compactJson}\n\`\`\`\n后置说明`).characters[0].name,
    '林月',
);

assert.throws(
    () => parseAnalysisJson('模型没有返回 JSON'),
    (error) => (
        error instanceof SettingOrganizerError
        && error.code === ERROR_CODES.INVALID_JSON
        && error.details.rawOutputLength > 0
        && error.details.isLikelyTruncated === false
    ),
);

assert.throws(
    () => parseAnalysisJson('{"characters":[{"name":"林月"}],"lorebookEntries":['),
    (error) => (
        error instanceof SettingOrganizerError
        && error.code === ERROR_CODES.INVALID_JSON
        && error.message.includes('疑似被截断')
        && error.details.isLikelyTruncated === true
        && typeof error.details.rawOutputPreviewStart === 'string'
        && typeof error.details.rawOutputPreviewEnd === 'string'
    ),
);

console.log('parser tests passed');
