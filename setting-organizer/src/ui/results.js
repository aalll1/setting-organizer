import { formatKeywordList, parseKeywordList, removeArrayItem, updateArrayItem } from './editor.js';
import { formatError } from '../core/errors.js';
import { buildExportJson, EXPORT_TYPES } from '../core/exporter.js';
import { logError, logInfo } from '../core/logger.js';
import { createDraftBackup, renderBackupStatus, renderCharacterImportReadiness, renderImportReadiness, runCharacterImportPreview, runLorebookImportPreview } from './confirm.js';

const RESULT_TABS = [
    { id: 'overview', label: '总览' },
    { id: 'characters', label: '角色' },
    { id: 'lorebook', label: '世界书' },
    { id: 'warnings', label: '警告' },
];

export function mountResults(container, result) {
    const state = {
        activeTab: 'overview',
        result: cloneResult(result),
    };

    render(container, state);
}

function render(container, state) {
    container.innerHTML = `
        <div class="setting-organizer-tabs" role="tablist">
            ${RESULT_TABS.map((tab) => `
                <button type="button" data-tab="${tab.id}" class="${state.activeTab === tab.id ? 'active' : ''}">
                    ${tab.label}
                </button>
            `).join('')}
        </div>
        <div class="setting-organizer-tab-panel">
            ${renderActiveTab(state)}
        </div>
        <div class="setting-organizer-export-actions">
            <button type="button" data-create-backup>创建备份</button>
            <button type="button" data-import-lorebook-preview>创建到酒馆世界书</button>
            <button type="button" data-import-character-preview>创建到酒馆角色</button>
            <button type="button" data-export="${EXPORT_TYPES.INTERNAL_FULL}">导出完整草稿</button>
            <button type="button" data-export="${EXPORT_TYPES.CHARACTER_DRAFTS}">导出角色草稿</button>
            <button type="button" data-export="${EXPORT_TYPES.LOREBOOK_DRAFTS}">导出世界书草稿</button>
            <button type="button" data-export="${EXPORT_TYPES.SILLYTAVERN_CHARACTERS}">导出 ST 角色</button>
            <button type="button" data-export="${EXPORT_TYPES.SILLYTAVERN_WORLD_INFO}">导出 ST 世界书</button>
        </div>
        <div class="setting-organizer-backup-status" data-backup-status hidden></div>
        <div class="setting-organizer-import-status" data-import-status hidden></div>
        <div class="setting-organizer-export-error" data-export-error hidden></div>
    `;

    bindResults(container, state);
}

function bindResults(container, state) {
    container.querySelectorAll('[data-tab]').forEach((button) => {
        button.addEventListener('click', () => {
            state.activeTab = button.dataset.tab;
            render(container, state);
        });
    });

    container.querySelectorAll('[data-character-field]').forEach((field) => {
        field.addEventListener('input', () => {
            const id = field.dataset.id;
            const fieldName = field.dataset.field;
            state.result.characters = updateArrayItem(state.result.characters, id, (item) => {
                item[fieldName] = field.value;
                return item;
            });
        });
    });

    container.querySelectorAll('[data-remove-character]').forEach((button) => {
        button.addEventListener('click', () => {
            state.result.characters = removeArrayItem(state.result.characters, button.dataset.removeCharacter);
            render(container, state);
        });
    });

    container.querySelectorAll('[data-lore-field]').forEach((field) => {
        field.addEventListener('input', () => {
            const id = field.dataset.id;
            const fieldName = field.dataset.field;
            state.result.lorebookEntries = updateArrayItem(state.result.lorebookEntries, id, (item) => {
                item[fieldName] = fieldName === 'keys' ? parseKeywordList(field.value) : field.value;
                return item;
            });
        });
    });

    container.querySelectorAll('[data-lore-toggle]').forEach((field) => {
        field.addEventListener('change', () => {
            const id = field.dataset.id;
            const fieldName = field.dataset.field;
            state.result.lorebookEntries = updateArrayItem(state.result.lorebookEntries, id, (item) => {
                item[fieldName] = field.checked;
                return item;
            });
        });
    });

    container.querySelectorAll('[data-remove-lore]').forEach((button) => {
        button.addEventListener('click', () => {
            state.result.lorebookEntries = removeArrayItem(state.result.lorebookEntries, button.dataset.removeLore);
            render(container, state);
        });
    });

    container.querySelectorAll('[data-export]').forEach((button) => {
        button.addEventListener('click', () => {
            const errorBox = container.querySelector('[data-export-error]');
            try {
                errorBox.hidden = true;
                errorBox.textContent = '';
                downloadJson(buildExportJson(state.result, button.dataset.export), `${button.dataset.export}.json`);
                logInfo('export-completed', {
                    type: button.dataset.export,
                    characterCount: state.result.characters.length,
                    lorebookEntryCount: state.result.lorebookEntries.length,
                });
            } catch (error) {
                logError('export-failed', error, {
                    type: button.dataset.export,
                });
                errorBox.hidden = false;
                errorBox.textContent = formatError(error);
            }
        });
    });

    const backupButton = container.querySelector('[data-create-backup]');
    if (backupButton) {
        backupButton.addEventListener('click', () => {
            const statusBox = container.querySelector('[data-backup-status]');
            try {
                renderBackupStatus(statusBox, createDraftBackup(state.result));
            } catch (error) {
                logError('backup-create-failed', error, {
                    operation: 'draft-export-preparation',
                });
                renderBackupStatus(statusBox, error);
            }
        });
    }

    const importButton = container.querySelector('[data-import-lorebook-preview]');
    if (importButton) {
        importButton.addEventListener('click', async () => {
            const statusBox = container.querySelector('[data-import-status]');
            renderImportReadiness(statusBox, state.result);
            await runLorebookImportPreview(state.result, statusBox);
        });
    }

    const characterImportButton = container.querySelector('[data-import-character-preview]');
    if (characterImportButton) {
        characterImportButton.addEventListener('click', async () => {
            const statusBox = container.querySelector('[data-import-status]');
            renderCharacterImportReadiness(statusBox, state.result);
            await runCharacterImportPreview(state.result, statusBox);
        });
    }
}

function renderActiveTab(state) {
    if (state.activeTab === 'characters') {
        return renderCharacters(state.result.characters);
    }

    if (state.activeTab === 'lorebook') {
        return renderLorebook(state.result.lorebookEntries);
    }

    if (state.activeTab === 'warnings') {
        return renderWarnings(state.result.warnings);
    }

    return renderOverview(state.result);
}

function renderOverview(result) {
    return `
        <div class="setting-organizer-summary">
            <div><strong>${result.characters.length}</strong><span>角色草稿</span></div>
            <div><strong>${result.lorebookEntries.length}</strong><span>世界书条目</span></div>
            <div><strong>${result.warnings.length}</strong><span>警告</span></div>
            <div><strong>${result.tokenEstimate.totalTokens}</strong><span>粗估 Token</span></div>
        </div>
    `;
}

function renderCharacters(characters) {
    if (!characters.length) {
        return '<p class="setting-organizer-empty">暂无角色草稿。</p>';
    }

    return characters.map((character) => `
        <article class="setting-organizer-card">
            <div class="setting-organizer-card-header">
                <h4>${escapeHtml(character.name || '未命名角色')}</h4>
                <button type="button" data-remove-character="${character.id}">删除</button>
            </div>
            ${renderTextInput(character, 'name', '名称', 'character')}
            ${renderTextArea(character, 'description', '描述', 'character')}
            ${renderTextArea(character, 'personality', '性格', 'character')}
            ${renderTextArea(character, 'scenario', '场景', 'character')}
            ${renderTextArea(character, 'firstMes', '首条消息', 'character')}
            ${renderTextArea(character, 'creatorNotes', '创作者备注', 'character')}
            ${renderItemWarnings(character.warnings)}
        </article>
    `).join('');
}

function renderLorebook(entries) {
    if (!entries.length) {
        return '<p class="setting-organizer-empty">暂无世界书条目。</p>';
    }

    return entries.map((entry) => `
        <article class="setting-organizer-card">
            <div class="setting-organizer-card-header">
                <h4>${escapeHtml(entry.title || '未命名条目')}</h4>
                <button type="button" data-remove-lore="${entry.id}">删除</button>
            </div>
            <label class="setting-organizer-inline-toggle">
                <input type="checkbox" data-lore-toggle data-id="${entry.id}" data-field="enabled" ${entry.enabled ? 'checked' : ''}>
                <span>启用条目</span>
            </label>
            ${renderTextInput(entry, 'title', '标题', 'lore')}
            ${renderTextInput({ ...entry, keys: formatKeywordList(entry.keys) }, 'keys', '关键词', 'lore')}
            ${renderTextArea(entry, 'content', '正文', 'lore')}
            ${renderItemWarnings(entry.warnings)}
        </article>
    `).join('');
}

function renderWarnings(warnings) {
    if (!warnings.length) {
        return '<p class="setting-organizer-empty">暂无警告。</p>';
    }

    return `<ul class="setting-organizer-warning-list">
        ${warnings.map((warning) => `<li>${escapeHtml(warning)}</li>`).join('')}
    </ul>`;
}

function renderItemWarnings(warnings) {
    if (!Array.isArray(warnings) || !warnings.length) {
        return '';
    }

    return `<ul class="setting-organizer-warning-list">
        ${warnings.map((warning) => `<li>${escapeHtml(warning)}</li>`).join('')}
    </ul>`;
}

function renderTextInput(item, field, label, type) {
    return `
        <label class="setting-organizer-field">
            <span>${label}</span>
            <input data-${type}-field data-id="${item.id}" data-field="${field}" value="${escapeHtml(String(item[field] || ''))}">
        </label>
    `;
}

function renderTextArea(item, field, label, type) {
    return `
        <label class="setting-organizer-field">
            <span>${label}</span>
            <textarea data-${type}-field data-id="${item.id}" data-field="${field}" rows="4">${escapeHtml(String(item[field] || ''))}</textarea>
        </label>
    `;
}

function cloneResult(result) {
    return JSON.parse(JSON.stringify(result));
}

function downloadJson(jsonText, filename) {
    const blob = new Blob([jsonText], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
}

function escapeHtml(value) {
    return value
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;');
}
