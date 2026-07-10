import { logError } from '../core/logger.js';

const STORAGE_KEY = 'setting-organizer.settings.v1';

export const DEFAULT_SETTINGS = Object.freeze({
    sourceText: '',
    organizeMode: 'setting',
    targets: {
        character: true,
        lorebook: true,
    },
    tokenBudgetMode: 'standard',
    analysisMode: 'mock',
    chatRange: 'recent20',
    customBudget: {
        character: 2000,
        lorebookEntry: 350,
        constantLore: 1200,
    },
});

export function loadSettings() {
    try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (!raw) {
            return cloneDefaultSettings();
        }

        return normalizeSettings(JSON.parse(raw));
    } catch (error) {
        logError('settings-load-failed', error);
        return cloneDefaultSettings();
    }
}

export function saveSettings(settings) {
    try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizeSettings(settings)));
    } catch (error) {
        logError('settings-save-failed', error);
    }
}

export function normalizeSettings(settings) {
    const safeSettings = settings && typeof settings === 'object' ? settings : {};
    const safeTargets = safeSettings.targets && typeof safeSettings.targets === 'object' ? safeSettings.targets : {};
    const safeCustomBudget = safeSettings.customBudget && typeof safeSettings.customBudget === 'object'
        ? safeSettings.customBudget
        : {};

    return {
        sourceText: typeof safeSettings.sourceText === 'string' ? safeSettings.sourceText : DEFAULT_SETTINGS.sourceText,
        organizeMode: normalizeOrganizeMode(safeSettings.organizeMode),
        targets: {
            character: typeof safeTargets.character === 'boolean' ? safeTargets.character : DEFAULT_SETTINGS.targets.character,
            lorebook: typeof safeTargets.lorebook === 'boolean' ? safeTargets.lorebook : DEFAULT_SETTINGS.targets.lorebook,
        },
        tokenBudgetMode: normalizeBudgetMode(safeSettings.tokenBudgetMode),
        analysisMode: normalizeAnalysisMode(safeSettings.analysisMode),
        chatRange: normalizeChatRange(safeSettings.chatRange),
        customBudget: {
            character: normalizePositiveInteger(safeCustomBudget.character, DEFAULT_SETTINGS.customBudget.character),
            lorebookEntry: normalizePositiveInteger(safeCustomBudget.lorebookEntry, DEFAULT_SETTINGS.customBudget.lorebookEntry),
            constantLore: normalizePositiveInteger(safeCustomBudget.constantLore, DEFAULT_SETTINGS.customBudget.constantLore),
        },
    };
}

function cloneDefaultSettings() {
    return JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
}

function normalizeBudgetMode(value) {
    return ['light', 'standard', 'long', 'custom'].includes(value) ? value : DEFAULT_SETTINGS.tokenBudgetMode;
}

function normalizeOrganizeMode(value) {
    return ['setting', 'state'].includes(value) ? value : DEFAULT_SETTINGS.organizeMode;
}

function normalizeAnalysisMode(value) {
    return ['mock', 'sillytavern'].includes(value) ? value : DEFAULT_SETTINGS.analysisMode;
}

function normalizeChatRange(value) {
    return ['recent20', 'recent50', 'all', 'manual'].includes(value) ? value : DEFAULT_SETTINGS.chatRange;
}

function normalizePositiveInteger(value, fallback) {
    const numberValue = Number(value);
    if (!Number.isFinite(numberValue) || numberValue <= 0) {
        return fallback;
    }

    return Math.round(numberValue);
}
