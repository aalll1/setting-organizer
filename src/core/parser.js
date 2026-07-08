import { ERROR_CODES, SettingOrganizerError } from './errors.js';

export function parseAnalysisJson(rawText) {
    if (typeof rawText !== 'string') {
        throw new SettingOrganizerError(ERROR_CODES.INVALID_JSON, '模型输出不是文本。');
    }

    try {
        return JSON.parse(stripMarkdownFence(rawText.trim()));
    } catch (error) {
        throw new SettingOrganizerError(ERROR_CODES.INVALID_JSON, '模型输出不是合法 JSON。', {
            cause: error.message,
        });
    }
}

function stripMarkdownFence(value) {
    const match = value.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
    return match ? match[1] : value;
}
