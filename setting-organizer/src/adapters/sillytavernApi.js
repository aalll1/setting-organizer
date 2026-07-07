import { ERROR_CODES, SettingOrganizerError } from '../core/errors.js';
import { buildExtractSettingPrompt } from '../prompts/extractSetting.js';

export function getSillyTavernContext() {
    if (typeof window === 'undefined') {
        return null;
    }

    if (typeof window.SillyTavern === 'object' && typeof window.SillyTavern.getContext === 'function') {
        return window.SillyTavern.getContext();
    }

    if (typeof window.getContext === 'function') {
        return window.getContext();
    }

    return null;
}

export function getCompatibilitySnapshot() {
    const context = getSillyTavernContext();

    return {
        hasContext: Boolean(context),
        hasChat: Boolean(context && Array.isArray(context.chat)),
        hasGenerate: Boolean(context && typeof context.generate === 'function'),
        hasGenerateQuietPrompt: Boolean(context && typeof context.generateQuietPrompt === 'function'),
        hasExtensionSettings: Boolean(context && context.extensionSettings),
        hasWorldInfoCreate: Boolean(context && typeof context.saveWorldInfo === 'function'),
        hasWorldInfoNames: Boolean(context && typeof context.getWorldInfoNames === 'function'),
    };
}

export async function callCurrentModel(sourceText, options) {
    const context = getSillyTavernContext();
    const prompt = buildExtractSettingPrompt(sourceText, options);

    if (!context) {
        throw new SettingOrganizerError(ERROR_CODES.INCOMPATIBLE_API, '当前页面未发现 SillyTavern 扩展上下文。');
    }

    try {
        if (typeof context.generateQuietPrompt === 'function') {
            return await context.generateQuietPrompt(prompt);
        }

        if (typeof context.generate === 'function') {
            return await context.generate(prompt);
        }
    } catch (error) {
        throw new SettingOrganizerError(ERROR_CODES.MODEL_CALL_FAILED, '模型调用失败。', {
            cause: error.message,
        });
    }

    throw new SettingOrganizerError(ERROR_CODES.INCOMPATIBLE_API, '当前 SillyTavern 版本未发现可用的模型调用接口。');
}

export async function createWorldInfo({ name, worldInfo }) {
    const context = getSillyTavernContext();

    if (!context) {
        throw new SettingOrganizerError(ERROR_CODES.INCOMPATIBLE_API, '当前页面未发现 SillyTavern 扩展上下文。');
    }

    if (typeof context.saveWorldInfo !== 'function') {
        throw new SettingOrganizerError(ERROR_CODES.INCOMPATIBLE_API, '当前 SillyTavern 版本未发现已验证的新建世界书接口。');
    }

    const existingNames = getWorldInfoNames();
    if (existingNames.includes(name)) {
        throw new SettingOrganizerError(ERROR_CODES.LOREBOOK_CREATE_FAILED, `世界书“${name}”已存在，已停止导入以避免覆盖。`);
    }

    try {
        await context.saveWorldInfo(name, worldInfo, true);

        if (typeof context.updateWorldInfoList === 'function') {
            await context.updateWorldInfoList();
        }

        return {
            name,
            entryCount: Object.keys(worldInfo.entries || {}).length,
        };
    } catch (error) {
        throw new SettingOrganizerError(ERROR_CODES.LOREBOOK_CREATE_FAILED, '创建世界书失败。', {
            cause: error.message,
        });
    }
}

export function getWorldInfoNames() {
    const context = getSillyTavernContext();

    if (!context || typeof context.getWorldInfoNames !== 'function') {
        return [];
    }

    const names = context.getWorldInfoNames();
    return Array.isArray(names) ? names : [];
}
