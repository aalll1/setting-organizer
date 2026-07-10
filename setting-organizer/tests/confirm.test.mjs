import assert from 'node:assert/strict';
import { renderImportReport } from '../src/ui/confirm.js';

globalThis.document = {
    createElement() {
        return { addEventListener() {} };
    },
    createTextNode(value) {
        return { textContent: value };
    },
};

function createContainer() {
    return {
        hidden: true,
        dataset: {},
        textContent: '',
        appendChild() {},
        append() {},
    };
}

const worldbookContainer = createContainer();
renderImportReport(worldbookContainer, { ok: true, backupId: 'backup_1', created: { name: 'SO_TC37_世界书' }, steps: [] }, 'worldbook');
assert.ok(worldbookContainer.textContent.includes('新建世界书：SO_TC37_世界书'));
assert.ok(!worldbookContainer.textContent.includes('新建角色：'));

const characterContainer = createContainer();
renderImportReport(characterContainer, { ok: true, created: { name: '林月', avatar: 'lin.png' }, steps: [] }, 'character');
assert.ok(characterContainer.textContent.includes('新建角色：林月 (lin.png)'));

console.log('confirm tests passed');
