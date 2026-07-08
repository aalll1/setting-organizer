import { ERROR_CODES, SettingOrganizerError } from '../core/errors.js';
import { logError, logInfo } from '../core/logger.js';
import { estimateTextTokens } from '../core/tokenEstimate.js';
import { getCurrentChatMessages } from './sillytavernApi.js';

export const CHAT_RANGES = Object.freeze({
    RECENT_20: 'recent20',
    RECENT_50: 'recent50',
    ALL: 'all',
    MANUAL: 'manual',
});

export function readCurrentChatSource(options = {}) {
    try {
        const messages = normalizeChatMessages(getCurrentChatMessages());
        const selected = selectChatMessages(messages, options);
        const sourceText = buildChatSourceText(selected);

        if (!sourceText.trim()) {
            throw new SettingOrganizerError(ERROR_CODES.CHAT_READ_FAILED, '当前聊天读取结果为空。');
        }

        logInfo('chat-read-completed', {
            range: options.range || CHAT_RANGES.RECENT_20,
            totalMessages: messages.length,
            selectedMessages: selected.length,
            sourceLength: sourceText.length,
            tokenEstimate: estimateTextTokens(sourceText),
        });

        return {
            sourceText,
            totalMessages: messages.length,
            selectedMessages: selected.length,
            tokenEstimate: estimateTextTokens(sourceText),
        };
    } catch (error) {
        logError('chat-read-failed', error, {
            range: options.range || CHAT_RANGES.RECENT_20,
        });

        if (error instanceof SettingOrganizerError) {
            throw error;
        }

        throw new SettingOrganizerError(ERROR_CODES.CHAT_READ_FAILED, '当前聊天读取失败。', {
            cause: error.message,
        });
    }
}

export function normalizeChatMessages(chat) {
    if (!Array.isArray(chat)) {
        return [];
    }

    return chat.map((message, index) => {
        const name = normalizeName(message);
        const role = message?.is_user ? 'user' : 'character';
        const text = normalizeMessageText(message);

        return {
            index,
            role,
            name,
            text,
        };
    }).filter((message) => message.text.trim());
}

export function selectChatMessages(messages, options = {}) {
    const range = options.range || CHAT_RANGES.RECENT_20;

    if (range === CHAT_RANGES.ALL) {
        return messages;
    }

    if (range === CHAT_RANGES.RECENT_50) {
        return messages.slice(-50);
    }

    if (range === CHAT_RANGES.MANUAL) {
        const selectedIndexes = Array.isArray(options.selectedIndexes) ? options.selectedIndexes : [];
        const selected = new Set(selectedIndexes.map((index) => Number(index)));
        return messages.filter((message) => selected.has(message.index));
    }

    return messages.slice(-20);
}

export function buildChatSourceText(messages) {
    return messages.map((message) => {
        const speaker = message.name || (message.role === 'user' ? '用户' : '角色');
        return `[${speaker}] ${message.text}`;
    }).join('\n\n');
}

function normalizeName(message) {
    if (typeof message?.name === 'string' && message.name.trim()) {
        return message.name.trim();
    }

    if (message?.is_user) {
        return '用户';
    }

    return '角色';
}

function normalizeMessageText(message) {
    if (typeof message?.mes === 'string') {
        return stripHtml(message.mes).trim();
    }

    if (typeof message?.message === 'string') {
        return stripHtml(message.message).trim();
    }

    if (typeof message?.text === 'string') {
        return stripHtml(message.text).trim();
    }

    return '';
}

function stripHtml(value) {
    return value
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<[^>]+>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&');
}
