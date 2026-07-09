import { logInfo } from './logger.js';
import { buildExtractSettingPrompt } from '../prompts/extractSetting.js';
import { inspectModelOutput } from './parser.js';

const RAW_OUTPUT_FILENAME_PREFIX = 'setting-organizer-raw-model-output';

let lastModelOutputDebug = null;

export function captureModelOutputDebug({ sourceText, options, rawOutput }) {
    const promptText = buildExtractSettingPrompt(sourceText, options);
    const outputText = typeof rawOutput === 'string' ? rawOutput : String(rawOutput || '');
    const inspectedOutput = inspectModelOutput(outputText);

    lastModelOutputDebug = {
        capturedAt: new Date().toISOString(),
        sourceLength: String(sourceText || '').length,
        promptLength: promptText.length,
        rawOutputLength: outputText.length,
        rawOutput,
        inspection: inspectedOutput,
    };

    logInfo('model-output-debug-captured', {
        capturedAt: lastModelOutputDebug.capturedAt,
        sourceLength: lastModelOutputDebug.sourceLength,
        promptLength: lastModelOutputDebug.promptLength,
        rawOutputLength: lastModelOutputDebug.rawOutputLength,
        inspection: inspectedOutput,
    });

    return getModelOutputDebugSummary();
}

export function getModelOutputDebugSummary() {
    if (!lastModelOutputDebug) {
        return null;
    }

    return {
        capturedAt: lastModelOutputDebug.capturedAt,
        sourceLength: lastModelOutputDebug.sourceLength,
        promptLength: lastModelOutputDebug.promptLength,
        rawOutputLength: lastModelOutputDebug.rawOutputLength,
        inspection: lastModelOutputDebug.inspection,
    };
}

export function getRawModelOutputExport() {
    if (!lastModelOutputDebug) {
        return null;
    }

    return {
        filename: createRawOutputFilename(lastModelOutputDebug.capturedAt),
        content: String(lastModelOutputDebug.rawOutput || ''),
        summary: getModelOutputDebugSummary(),
    };
}

function createRawOutputFilename(capturedAt) {
    const stamp = capturedAt.replace(/[-:.TZ]/g, '');
    return `${RAW_OUTPUT_FILENAME_PREFIX}-${stamp}.txt`;
}
