import { ERROR_CODES, SettingOrganizerError } from './errors.js';

const RAW_OUTPUT_PREVIEW_LENGTH = 500;

export function parseAnalysisJson(rawText) {
    return parseModelJson(rawText);
}

export function parseModelJson(rawText) {
    if (typeof rawText !== 'string') {
        throw new SettingOrganizerError(ERROR_CODES.INVALID_JSON, '模型输出不是文本。');
    }

    const sourceText = rawText.trim();
    const jsonText = extractLikelyJson(sourceText);

    try {
        return JSON.parse(jsonText);
    } catch (error) {
        const diagnostics = createParseDiagnostics(sourceText, jsonText, error);
        throw new SettingOrganizerError(ERROR_CODES.INVALID_JSON, diagnostics.message, {
            cause: error.message,
            ...diagnostics.details,
        });
    }
}

export function extractLikelyJson(rawText) {
    const text = String(rawText || '').trim();
    const fenced = extractFencedJson(text);
    if (fenced) {
        return fenced;
    }

    const startIndex = findLikelyJsonStart(text);
    const balancedEndIndex = findBalancedJsonEnd(text, startIndex);
    if (startIndex >= 0 && balancedEndIndex > startIndex) {
        return text.slice(startIndex, balancedEndIndex + 1).trim();
    }

    if (startIndex >= 0) {
        return text.slice(startIndex).trim();
    }

    return text;
}

export function inspectModelOutput(rawText) {
    const sourceText = String(rawText || '').trim();
    const jsonText = extractLikelyJson(sourceText);
    const startIndex = findLikelyJsonStart(sourceText);

    return {
        rawOutputLength: sourceText.length,
        extractedJsonLength: jsonText.length,
        rawOutputPreviewStart: sourceText.slice(0, RAW_OUTPUT_PREVIEW_LENGTH),
        rawOutputPreviewEnd: sourceText.slice(-RAW_OUTPUT_PREVIEW_LENGTH),
        hasFencedJson: /```(?:json)?/i.test(sourceText),
        hasLikelyJsonStart: startIndex >= 0,
        hasLikelyJsonEnd: findLikelyJsonEnd(sourceText, startIndex) > startIndex,
        isLikelyTruncated: isLikelyTruncatedText(jsonText),
    };
}

function extractFencedJson(text) {
    const fullFence = text.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
    if (fullFence) {
        return fullFence[1].trim();
    }

    const embeddedFence = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    return embeddedFence ? embeddedFence[1].trim() : '';
}

function findLikelyJsonStart(text) {
    const objectStart = text.indexOf('{');
    const arrayStart = text.indexOf('[');

    if (objectStart < 0) {
        return arrayStart;
    }

    if (arrayStart < 0) {
        return objectStart;
    }

    return Math.min(objectStart, arrayStart);
}

function findLikelyJsonEnd(text, startIndex) {
    if (startIndex < 0) {
        return -1;
    }

    const startChar = text[startIndex];
    if (startChar === '{') {
        return text.lastIndexOf('}');
    }

    if (startChar === '[') {
        return text.lastIndexOf(']');
    }

    return -1;
}

function findBalancedJsonEnd(text, startIndex) {
    if (startIndex < 0) {
        return -1;
    }

    const openChar = text[startIndex];
    const closeChar = openChar === '{' ? '}' : openChar === '[' ? ']' : '';
    if (!closeChar) {
        return -1;
    }

    let depth = 0;
    let inString = false;
    let escaped = false;

    for (let index = startIndex; index < text.length; index += 1) {
        const char = text[index];

        if (escaped) {
            escaped = false;
            continue;
        }

        if (char === '\\' && inString) {
            escaped = true;
            continue;
        }

        if (char === '"') {
            inString = !inString;
            continue;
        }

        if (inString) {
            continue;
        }

        if (char === openChar) {
            depth += 1;
        } else if (char === closeChar) {
            depth -= 1;
            if (depth === 0) {
                return index;
            }
        }
    }

    return -1;
}

function createParseDiagnostics(sourceText, jsonText, error) {
    const inspectedOutput = inspectModelOutput(sourceText);
    const truncated = inspectedOutput.isLikelyTruncated || isLikelyTruncatedJson(jsonText, error);
    return {
        message: truncated ? '模型输出疑似被截断，无法解析为完整 JSON。' : '模型输出不是合法 JSON。',
        details: {
            ...inspectedOutput,
            isLikelyTruncated: truncated,
        },
    };
}

function isLikelyTruncatedJson(jsonText, error) {
    if (/Unexpected end of JSON input/i.test(error.message || '')) {
        return true;
    }

    return isLikelyTruncatedText(jsonText);
}

function isLikelyTruncatedText(jsonText) {
    const trimmed = jsonText.trim();
    if (!trimmed) {
        return false;
    }

    const startsAsObject = trimmed.startsWith('{');
    const startsAsArray = trimmed.startsWith('[');

    return (startsAsObject && !trimmed.endsWith('}')) || (startsAsArray && !trimmed.endsWith(']'));
}
