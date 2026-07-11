import assert from 'node:assert/strict';
import { CHAT_RANGE_LIMITS, CHAT_RANGES } from '../src/constants/chat.js';
import { LOG_EVENTS } from '../src/constants/logEvents.js';
import { DEFAULT_CONFIDENCE, LOG_TEXT_PREVIEW_LENGTH, MAX_LOG_TEXT_LENGTH } from '../src/constants/quality.js';
import { CHAT_RANGES as adapterRanges } from '../src/adapters/chatAdapter.js';

assert.equal(CHAT_RANGE_LIMITS[CHAT_RANGES.RECENT_20], 20);
assert.equal(CHAT_RANGE_LIMITS[CHAT_RANGES.RECENT_50], 50);
assert.equal(adapterRanges, CHAT_RANGES);
assert.equal(DEFAULT_CONFIDENCE, 0.8);
assert.equal(LOG_TEXT_PREVIEW_LENGTH, 160);
assert.equal(MAX_LOG_TEXT_LENGTH, 2000);
assert.equal(LOG_EVENTS.CHAT_READ_COMPLETED, 'chat-read-completed');

console.log('constants tests passed');
