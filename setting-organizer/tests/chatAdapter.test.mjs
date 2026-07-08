import assert from 'node:assert/strict';
import { CHAT_RANGES, buildChatSourceText, normalizeChatMessages, readCurrentChatSource, selectChatMessages } from '../src/adapters/chatAdapter.js';
import { ERROR_CODES, SettingOrganizerError } from '../src/core/errors.js';

globalThis.console = {
    log() {},
    info() {},
    warn() {},
    error() {},
};

function createMemoryStorage() {
    const values = new Map();

    return {
        getItem(key) {
            return values.has(key) ? values.get(key) : null;
        },
        setItem(key, value) {
            values.set(key, value);
        },
    };
}

const rawChat = [
    { name: '用户', is_user: true, mes: '你好' },
    { name: '林月', is_user: false, mes: '欢迎来到<br>银月教会。' },
    { name: '用户', is_user: true, mes: '<i>灰雾边境</i>是什么？' },
    { name: '林月', is_user: false, mes: '那是魔物出现的地方。' },
];

const messages = normalizeChatMessages(rawChat);
assert.equal(messages.length, 4);
assert.equal(messages[1].text, '欢迎来到\n银月教会。');
assert.equal(messages[2].text, '灰雾边境是什么？');

assert.equal(selectChatMessages(messages, { range: CHAT_RANGES.RECENT_20 }).length, 4);
assert.equal(selectChatMessages(messages, { range: CHAT_RANGES.RECENT_50 }).length, 4);
assert.equal(selectChatMessages(messages, { range: CHAT_RANGES.ALL }).length, 4);
assert.deepEqual(
    selectChatMessages(messages, { range: CHAT_RANGES.MANUAL, selectedIndexes: [1, 3] }).map((message) => message.index),
    [1, 3],
);

const sourceText = buildChatSourceText(messages.slice(0, 2));
assert.ok(sourceText.includes('[用户] 你好'));
assert.ok(sourceText.includes('[林月] 欢迎来到'));

globalThis.window = {
    localStorage: createMemoryStorage(),
    SillyTavern: {
        getContext() {
            return {
                chat: rawChat,
            };
        },
    },
};

const readResult = readCurrentChatSource({
    range: CHAT_RANGES.MANUAL,
    selectedIndexes: [0, 2],
});
assert.equal(readResult.selectedMessages, 2);
assert.equal(readResult.totalMessages, 4);
assert.ok(readResult.sourceText.includes('灰雾边境'));
assert.ok(readResult.tokenEstimate > 0);

globalThis.window = {
    localStorage: createMemoryStorage(),
};

assert.throws(
    () => readCurrentChatSource({ range: CHAT_RANGES.RECENT_20 }),
    (error) => error instanceof SettingOrganizerError && error.code === ERROR_CODES.CHAT_READ_FAILED,
);

console.log('chat adapter tests passed');
