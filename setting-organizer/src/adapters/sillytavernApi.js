import { ERROR_CODES, SettingOrganizerError } from '../core/errors.js';
import { logError, logInfo } from '../core/logger.js';
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
        hasWorldInfoEditorOpen: Boolean(context && typeof context.reloadWorldInfoEditor === 'function'),
        hasCharacterCreate: Boolean(context && typeof context.getRequestHeaders === 'function'),
        hasCharacterWorldBind: Boolean(context && typeof context.getRequestHeaders === 'function'),
        hasCharacters: Boolean(context && Array.isArray(context.characters)),
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
            const result = await context.generateQuietPrompt(prompt);
            logInfo('model-call-completed', { interface: 'generateQuietPrompt' });
            return result;
        }

        if (typeof context.generate === 'function') {
            const result = await context.generate(prompt);
            logInfo('model-call-completed', { interface: 'generate' });
            return result;
        }
    } catch (error) {
        logError('model-call-failed', error, {
            hasGenerate: typeof context.generate === 'function',
            hasGenerateQuietPrompt: typeof context.generateQuietPrompt === 'function',
            sourceLength: sourceText.length,
        });
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

        logInfo('worldbook-create-completed', {
            name,
            entryCount: Object.keys(worldInfo.entries || {}).length,
        });

        return {
            name,
            entryCount: Object.keys(worldInfo.entries || {}).length,
        };
    } catch (error) {
        logError('worldbook-create-failed', error, {
            name,
            entryCount: Object.keys(worldInfo.entries || {}).length,
        });
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

export function getCurrentChatMessages() {
    const context = getSillyTavernContext();

    if (!context) {
        throw new SettingOrganizerError(ERROR_CODES.CHAT_READ_FAILED, '当前页面未发现 SillyTavern 扩展上下文。');
    }

    if (!Array.isArray(context.chat)) {
        throw new SettingOrganizerError(ERROR_CODES.CHAT_READ_FAILED, '当前 SillyTavern 版本未发现可读取的当前聊天。');
    }

    return context.chat;
}

export async function createCharacter({ fields }) {
    const context = getSillyTavernContext();

    if (!context) {
        throw new SettingOrganizerError(ERROR_CODES.INCOMPATIBLE_API, '当前页面未发现 SillyTavern 扩展上下文。');
    }

    if (typeof context.getRequestHeaders !== 'function') {
        throw new SettingOrganizerError(ERROR_CODES.INCOMPATIBLE_API, '当前 SillyTavern 版本未发现已验证的新建角色接口。');
    }

    const formData = new FormData();
    Object.entries(fields).forEach(([key, value]) => {
        formData.append(key, value);
    });

    try {
        const response = await fetch('/api/characters/create', {
            method: 'POST',
            headers: context.getRequestHeaders({ omitContentType: true }),
            body: formData,
            cache: 'no-cache',
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const avatar = await response.text();

        if (typeof context.getCharacters === 'function') {
            await context.getCharacters();
        }

        logInfo('character-create-completed', {
            name: fields.ch_name,
            avatar,
        });

        return {
            avatar,
            name: fields.ch_name,
        };
    } catch (error) {
        logError('character-create-failed', error, {
            name: fields.ch_name,
        });
        throw new SettingOrganizerError(ERROR_CODES.CHARACTER_CREATE_FAILED, '创建角色失败。', {
            cause: error.message,
        });
    }
}

export async function bindCharacterWorld({ avatar, worldName }) {
    const context = getSillyTavernContext();

    if (!context) {
        throw new SettingOrganizerError(ERROR_CODES.INCOMPATIBLE_API, '当前页面未发现 SillyTavern 扩展上下文。');
    }

    if (typeof context.getRequestHeaders !== 'function') {
        throw new SettingOrganizerError(ERROR_CODES.INCOMPATIBLE_API, '当前 SillyTavern 版本未发现已验证的角色世界书绑定接口。');
    }

    if (!avatar || !worldName) {
        throw new SettingOrganizerError(ERROR_CODES.CHARACTER_WORLD_BIND_FAILED, '角色或世界书为空，无法绑定。');
    }

    try {
        const response = await fetch('/api/characters/merge-attributes', {
            method: 'POST',
            headers: context.getRequestHeaders(),
            body: JSON.stringify({
                avatar,
                data: {
                    extensions: {
                        world: worldName,
                    },
                },
            }),
            cache: 'no-cache',
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `HTTP ${response.status}`);
        }

        if (typeof context.getOneCharacter === 'function') {
            await context.getOneCharacter(avatar);
        } else if (typeof context.getCharacters === 'function') {
            await context.getCharacters();
        }

        logInfo('character-world-bind-completed', {
            avatar,
            worldName,
        });

        return {
            avatar,
            worldName,
        };
    } catch (error) {
        logError('character-world-bind-failed', error, {
            avatar,
            worldName,
        });
        throw new SettingOrganizerError(ERROR_CODES.CHARACTER_WORLD_BIND_FAILED, '角色世界书绑定失败。', {
            cause: error.message,
        });
    }
}

export function openWorldInfoEditor(name) {
    const context = getSillyTavernContext();

    if (!context || typeof context.reloadWorldInfoEditor !== 'function') {
        return false;
    }

    context.reloadWorldInfoEditor(name, true);
    logInfo('worldbook-native-editor-opened', { name });
    return true;
}

export function getCharacterSummaries() {
    const context = getSillyTavernContext();

    if (!context || !Array.isArray(context.characters)) {
        return [];
    }

    return context.characters.map((character) => ({
        name: character.name,
        avatar: character.avatar,
    }));
}

export async function getFreshCharacterSummaries() {
    const context = getSillyTavernContext();

    if (!context) {
        return [];
    }

    if (typeof context.getCharacters === 'function') {
        await context.getCharacters();
    }

    return getCharacterSummaries();
}
