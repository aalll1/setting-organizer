import { ERROR_CODES, SettingOrganizerError } from './errors.js';
import { toSillyTavernCharacters } from '../adapters/characterAdapter.js';
import { toSillyTavernWorldInfo } from '../adapters/lorebookAdapter.js';

export const EXPORT_TYPES = Object.freeze({
    INTERNAL_FULL: 'internal-full',
    CHARACTER_DRAFTS: 'character-drafts',
    LOREBOOK_DRAFTS: 'lorebook-drafts',
    SILLYTAVERN_CHARACTERS: 'sillytavern-characters',
    SILLYTAVERN_WORLD_INFO: 'sillytavern-world-info',
});

export function buildExportPayload(result, type) {
    try {
        if (type === EXPORT_TYPES.INTERNAL_FULL) {
            return result;
        }

        if (type === EXPORT_TYPES.CHARACTER_DRAFTS) {
            return result.characters || [];
        }

        if (type === EXPORT_TYPES.LOREBOOK_DRAFTS) {
            return result.lorebookEntries || [];
        }

        if (type === EXPORT_TYPES.SILLYTAVERN_CHARACTERS) {
            return toSillyTavernCharacters(result);
        }

        if (type === EXPORT_TYPES.SILLYTAVERN_WORLD_INFO) {
            return toSillyTavernWorldInfo(result);
        }
    } catch (error) {
        throw new SettingOrganizerError(ERROR_CODES.EXPORT_FAILED, '导出失败。', {
            cause: error.message,
        });
    }

    throw new SettingOrganizerError(ERROR_CODES.EXPORT_FAILED, `未知导出类型：${type}`);
}

export function buildExportJson(result, type) {
    try {
        return JSON.stringify(buildExportPayload(result, type), null, 2);
    } catch (error) {
        if (error instanceof SettingOrganizerError) {
            throw error;
        }

        throw new SettingOrganizerError(ERROR_CODES.EXPORT_FAILED, '导出 JSON 序列化失败。', {
            cause: error.message,
        });
    }
}
