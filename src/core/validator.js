import { ERROR_CODES, SettingOrganizerError } from './errors.js';
import { normalizeAnalysisResult } from './normalizer.js';
import { parseAnalysisJson } from './parser.js';

export function parseValidateNormalize(rawText) {
    const parsed = parseAnalysisJson(rawText);
    return validateAndNormalizeAnalysisResult(parsed);
}

export function validateAndNormalizeAnalysisResult(value) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
        throw new SettingOrganizerError(ERROR_CODES.SCHEMA_VALIDATION_FAILED, '分析结果顶层必须是对象。');
    }

    validateRawAnalysisShape(value);

    const { result } = normalizeAnalysisResult(value);
    validateNormalizedAnalysisShape(result);

    if (!Array.isArray(result.characters) || !Array.isArray(result.lorebookEntries)) {
        throw new SettingOrganizerError(ERROR_CODES.SCHEMA_VALIDATION_FAILED, '分析结果缺少角色或世界书数组。');
    }

    if (!result.characters.length && !result.lorebookEntries.length) {
        throw new SettingOrganizerError(ERROR_CODES.EMPTY_RESULT, '分析结果为空。');
    }

    return result;
}

function validateRawAnalysisShape(value) {
    if ('characters' in value && !Array.isArray(value.characters)) {
        throw new SettingOrganizerError(ERROR_CODES.SCHEMA_VALIDATION_FAILED, 'characters 必须是数组。');
    }

    if ('lorebookEntries' in value && !Array.isArray(value.lorebookEntries)) {
        throw new SettingOrganizerError(ERROR_CODES.SCHEMA_VALIDATION_FAILED, 'lorebookEntries 必须是数组。');
    }
}

function validateNormalizedAnalysisShape(result) {
    const invalidCharacter = result.characters.find((character) => (
        !character
        || typeof character !== 'object'
        || typeof character.name !== 'string'
        || typeof character.description !== 'string'
        || typeof character.personality !== 'string'
        || typeof character.scenario !== 'string'
        || typeof character.firstMes !== 'string'
        || typeof character.creatorNotes !== 'string'
    ));

    if (invalidCharacter) {
        throw new SettingOrganizerError(ERROR_CODES.SCHEMA_VALIDATION_FAILED, '角色草稿结构不完整。');
    }

    const invalidLorebookEntry = result.lorebookEntries.find((entry) => (
        !entry
        || typeof entry !== 'object'
        || typeof entry.title !== 'string'
        || !Array.isArray(entry.keys)
        || typeof entry.content !== 'string'
        || typeof entry.enabled !== 'boolean'
    ));

    if (invalidLorebookEntry) {
        throw new SettingOrganizerError(ERROR_CODES.SCHEMA_VALIDATION_FAILED, '世界书草稿结构不完整。');
    }
}
