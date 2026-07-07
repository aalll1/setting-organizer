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

    const { result } = normalizeAnalysisResult(value);

    if (!Array.isArray(result.characters) || !Array.isArray(result.lorebookEntries)) {
        throw new SettingOrganizerError(ERROR_CODES.SCHEMA_VALIDATION_FAILED, '分析结果缺少角色或世界书数组。');
    }

    if (!result.characters.length && !result.lorebookEntries.length) {
        throw new SettingOrganizerError(ERROR_CODES.EMPTY_RESULT, '分析结果为空。');
    }

    return result;
}
