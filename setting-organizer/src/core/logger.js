import { LOG_TEXT_PREVIEW_LENGTH, MAX_LOG_TEXT_LENGTH } from '../constants/quality.js';

const LOG_STORAGE_KEY = 'setting-organizer.runtimeLogs.v1';
const MAX_LOG_RECORDS = 200;
const REDACTED_VALUE = '<redacted>';
const SENSITIVE_KEY_PATTERN = /(api.?key|authorization|auth|cookie|csrf|token|secret|password|headers?)/i;
const LARGE_TEXT_KEY_PATTERN = /(prompt|sourceText|chat|content|description|personality|scenario|firstMes|mesExample|creatorNotes)/i;

export const LOG_LEVELS = Object.freeze({
    DEBUG: 'debug',
    INFO: 'info',
    WARN: 'warn',
    ERROR: 'error',
});

export function logDebug(event, details = null) {
    return writeLog(LOG_LEVELS.DEBUG, event, details);
}

export function logInfo(event, details = null) {
    return writeLog(LOG_LEVELS.INFO, event, details);
}

export function logWarn(event, details = null) {
    return writeLog(LOG_LEVELS.WARN, event, details);
}

export function logError(event, error, details = null) {
    return writeLog(LOG_LEVELS.ERROR, event, {
        ...normalizeDetails(details),
        error: serializeError(error),
    });
}

export function listLogs(storage = getStorage()) {
    if (!storage) {
        return [];
    }

    try {
        const raw = storage.getItem(LOG_STORAGE_KEY);
        const parsed = raw ? JSON.parse(raw) : [];
        return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
        writeConsole(LOG_LEVELS.WARN, 'log-read-failed', { error: serializeError(error) });
        return [];
    }
}

export function clearLogs(storage = getStorage()) {
    if (!storage) {
        return;
    }

    if (typeof storage.removeItem === 'function') {
        storage.removeItem(LOG_STORAGE_KEY);
    } else {
        storage.setItem(LOG_STORAGE_KEY, '[]');
    }
    writeConsole(LOG_LEVELS.INFO, 'logs-cleared', null);
}

export function buildDiagnosticSnapshot(extra = {}) {
    return {
        generatedAt: new Date().toISOString(),
        app: 'setting-organizer',
        url: readLocation(),
        userAgent: readUserAgent(),
        sillyTavernVersion: readSillyTavernVersion(),
        extra: sanitizeValue(extra),
        logs: listLogs(),
    };
}

function writeLog(level, event, details = null, storage = getStorage()) {
    const record = {
        id: createLogId(),
        at: new Date().toISOString(),
        level,
        event,
        details: sanitizeValue(details),
    };

    writeConsole(level, event, record.details);

    if (!storage) {
        return record;
    }

    try {
        const logs = listLogs(storage);
        logs.unshift(record);
        storage.setItem(LOG_STORAGE_KEY, JSON.stringify(logs.slice(0, MAX_LOG_RECORDS)));
    } catch (error) {
        writeConsole(LOG_LEVELS.WARN, 'log-write-failed', { error: serializeError(error) });
    }

    return record;
}

function writeConsole(level, event, details) {
    if (typeof console === 'undefined') {
        return;
    }

    const method = level === LOG_LEVELS.ERROR ? 'error' : level === LOG_LEVELS.WARN ? 'warn' : 'info';
    console[method](`[setting-organizer] ${event}`, details || '');
}

function serializeError(error) {
    if (!error || typeof error !== 'object') {
        return {
            message: String(error || ''),
        };
    }

    return sanitizeValue({
        name: error.name,
        code: error.code,
        message: error.message,
        details: error.details,
        stack: error.stack,
    });
}

function normalizeDetails(details) {
    return details && typeof details === 'object' ? details : {};
}

function sanitizeValue(value, key = '') {
    if (key && SENSITIVE_KEY_PATTERN.test(key)) {
        return REDACTED_VALUE;
    }

    if (value === null || value === undefined) {
        return value;
    }

    if (typeof value === 'string') {
        if (key && LARGE_TEXT_KEY_PATTERN.test(key)) {
            return summarizeLongText(value);
        }

        return value.length > MAX_LOG_TEXT_LENGTH
            ? `${value.slice(0, MAX_LOG_TEXT_LENGTH)}...<truncated ${value.length - MAX_LOG_TEXT_LENGTH} chars>`
            : value;
    }

    if (typeof value === 'number' || typeof value === 'boolean') {
        return value;
    }

    if (Array.isArray(value)) {
        return value.map((item) => sanitizeValue(item, key));
    }

    if (typeof value === 'object') {
        return Object.fromEntries(
            Object.entries(value).map(([itemKey, item]) => [itemKey, sanitizeValue(item, itemKey)]),
        );
    }

    return String(value);
}

function summarizeLongText(value) {
    return {
        length: value.length,
        preview: value.length > LOG_TEXT_PREVIEW_LENGTH ? `${value.slice(0, LOG_TEXT_PREVIEW_LENGTH)}...` : value,
        truncated: value.length > LOG_TEXT_PREVIEW_LENGTH,
    };
}

function getStorage() {
    if (typeof window === 'undefined' || !window.localStorage) {
        return null;
    }

    return window.localStorage;
}

function readLocation() {
    if (typeof window === 'undefined' || !window.location) {
        return '';
    }

    return window.location.href;
}

function readUserAgent() {
    if (typeof navigator === 'undefined') {
        return '';
    }

    return navigator.userAgent || '';
}

function readSillyTavernVersion() {
    if (typeof window === 'undefined') {
        return '';
    }

    return window?.SillyTavern?.version || window?.APP_VERSION || '';
}

function createLogId() {
    return `log_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}
