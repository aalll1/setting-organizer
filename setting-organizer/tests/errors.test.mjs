import assert from 'node:assert/strict';
import { ERROR_CODES, ERROR_HELP, SettingOrganizerError, formatError } from '../src/core/errors.js';

const formatted = formatError(new SettingOrganizerError(
    ERROR_CODES.CHARACTER_CREATE_FAILED,
    '创建角色失败。',
    { cause: 'HTTP 500' },
));

assert.ok(formatted.includes('创建角色失败'));
assert.ok(formatted.includes('无法通过 SillyTavern 角色创建接口完成写入。'));
assert.ok(formatted.includes('建议：'));
assert.ok(formatted.includes('错误码：E008'));
assert.ok(formatted.includes('原因：HTTP 500'));

const fallback = formatError(new Error('boom'));
assert.ok(fallback.includes('未知错误'));
assert.ok(fallback.includes('导出诊断日志'));

for (const code of Object.values(ERROR_CODES)) {
    assert.ok(ERROR_HELP[code], `missing help for ${code}`);
    assert.ok(ERROR_HELP[code].title, `missing title for ${code}`);
    assert.ok(ERROR_HELP[code].message, `missing message for ${code}`);
    assert.ok(Array.isArray(ERROR_HELP[code].suggestions), `missing suggestions for ${code}`);
}

console.log('errors tests passed');
