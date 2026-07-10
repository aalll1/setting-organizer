import { removeArrayItem, updateArrayItem } from './editor.js';
import { detectCampaignStateConflicts } from '../core/conflictDetector.js';
import { formatError } from '../core/errors.js';
import { buildCampaignStateExportJson, parseCampaignStateImportJson } from '../core/stateExporter.js';
import { mergeCampaignStates } from '../core/stateMerger.js';
import { loadRecentCampaignState, saveRecentCampaignState } from '../storage/stateStore.js';
import { buildWorldbookSyncDraft } from '../core/worldbookSyncBuilder.js';
import { runCampaignStateWorldbookImport } from './confirm.js';
import { renderConflictPanelHtml } from './conflictPanel.js';
import { renderStateDiffPanelHtml } from './stateDiffPanel.js';

const STATE_TABS = [
    { id: 'overview', label: '总览' },
    { id: 'characters', label: '人物' },
    { id: 'factions', label: '势力' },
    { id: 'missions', label: '任务' },
    { id: 'items', label: '道具' },
    { id: 'warnings', label: '警告' },
];

export function mountStatePanel(container, campaignState) {
    const state = {
        activeTab: 'overview',
        campaignState: cloneState(campaignState),
        diffPreview: null,
        conflicts: null,
        worldbookSyncPreview: null,
        selectedWorldbookCategories: new Set(['permanent_lore', 'current_state', 'mission_state', 'character_state', 'faction_state', 'item_state', 'history_archive']),
    };

    render(container, state);
}

function render(container, state) {
    container.innerHTML = renderStatePanelHtml(state.campaignState, state.activeTab, state.diffPreview, state.conflicts, state.worldbookSyncPreview, state.selectedWorldbookCategories);

    bindStatePanel(container, state);
}

export function renderStatePanelHtml(campaignState, activeTab = 'overview', diffPreview = null, conflicts = null, worldbookSyncPreview = null, selectedWorldbookCategories = new Set()) {
    return `
        <div class="setting-organizer-state-note">剧情状态草稿，未写入、未保存、未同步世界书。</div>
        <div class="setting-organizer-export-actions">
            <button type="button" data-export-state-json>导出状态 JSON</button>
            <button type="button" data-import-state-json>导入状态 JSON</button>
            <button type="button" data-save-recent-state>保存最近状态草稿</button>
            <button type="button" data-load-recent-state>载入最近状态草稿</button>
            <button type="button" data-preview-state-merge>预览合并最近草稿</button>
            <button type="button" data-detect-state-conflicts>检测状态冲突</button>
            <button type="button" data-preview-state-worldbook>预览状态世界书草稿</button>
            <input type="file" accept="application/json,.json" data-import-state-file hidden>
        </div>
        <div class="setting-organizer-export-error" data-state-panel-status hidden></div>
        ${renderStateDiffPanelHtml(diffPreview)}
        ${renderConflictPanelHtml(conflicts)}
        ${renderWorldbookSyncPreviewHtml(worldbookSyncPreview, selectedWorldbookCategories)}
        <div class="setting-organizer-tabs" role="tablist">
            ${STATE_TABS.map((tab) => `
                <button type="button" data-state-tab="${tab.id}" class="${activeTab === tab.id ? 'active' : ''}">
                    ${tab.label}
                </button>
            `).join('')}
        </div>
        <div class="setting-organizer-tab-panel">
            ${renderActiveTab({ activeTab, campaignState })}
        </div>
    `;
}

function bindStatePanel(container, state) {
    container.querySelectorAll('[data-state-tab]').forEach((button) => {
        button.addEventListener('click', () => {
            state.activeTab = button.dataset.stateTab;
            render(container, state);
        });
    });

    container.querySelectorAll('[data-campaign-field]').forEach((field) => {
        field.addEventListener('input', () => {
            state.campaignState.campaign[field.dataset.field] = readFieldValue(field);
        });
    });

    bindCollectionFields(container, state, 'characters');
    bindCollectionFields(container, state, 'factions');
    bindCollectionFields(container, state, 'missions');
    bindCollectionFields(container, state, 'items');
    bindStateActions(container, state);
}

function bindStateActions(container, state) {
    const statusBox = container.querySelector('[data-state-panel-status]');
    const importInput = container.querySelector('[data-import-state-file]');

    container.querySelector('[data-export-state-json]')?.addEventListener('click', () => {
        try {
            downloadText(buildCampaignStateExportJson(state.campaignState), 'campaign-state.json');
            showStatus(statusBox, '已导出剧情状态 JSON。', 'success');
        } catch (error) {
            showStatus(statusBox, formatError(error), 'error');
        }
    });

    container.querySelector('[data-import-state-json]')?.addEventListener('click', () => {
        importInput?.click();
    });

    importInput?.addEventListener('change', async () => {
        const file = importInput.files && importInput.files[0];
        if (!file) {
            return;
        }

        try {
            state.campaignState = parseCampaignStateImportJson(await file.text());
            state.conflicts = null;
            state.diffPreview = null;
            render(container, state);
            showStatus(container.querySelector('[data-state-panel-status]'), '已导入剧情状态 JSON。', 'success');
        } catch (error) {
            showStatus(statusBox, formatError(error), 'error');
        } finally {
            importInput.value = '';
        }
    });

    container.querySelector('[data-save-recent-state]')?.addEventListener('click', () => {
        try {
            state.campaignState = saveRecentCampaignState(state.campaignState);
            showStatus(statusBox, '最近状态草稿已保存到本地浏览器。', 'success');
        } catch (error) {
            showStatus(statusBox, formatError(error), 'error');
        }
    });

    container.querySelector('[data-load-recent-state]')?.addEventListener('click', () => {
        try {
            const loaded = loadRecentCampaignState();
            if (!loaded) {
                showStatus(statusBox, '暂无最近状态草稿。', 'warning');
                return;
            }

            state.campaignState = loaded;
            state.conflicts = null;
            state.diffPreview = null;
            render(container, state);
            showStatus(container.querySelector('[data-state-panel-status]'), '已载入最近状态草稿。', 'success');
        } catch (error) {
            showStatus(statusBox, formatError(error), 'error');
        }
    });

    container.querySelector('[data-preview-state-merge]')?.addEventListener('click', () => {
        try {
            const existing = loadRecentCampaignState();
            if (!existing) {
                showStatus(statusBox, '暂无最近状态草稿，无法生成合并预览。', 'warning');
                return;
            }

            state.diffPreview = mergeCampaignStates(existing, state.campaignState);
            state.diffPreview.conflicts = detectCampaignStateConflicts(state.diffPreview.state);
            render(container, state);
            showStatus(container.querySelector('[data-state-panel-status]'), '已生成状态合并预览，确认前不会写入本地草稿。', 'warning');
        } catch (error) {
            showStatus(statusBox, formatError(error), 'error');
        }
    });

    container.querySelector('[data-confirm-state-merge]')?.addEventListener('click', () => {
        try {
            if (!state.diffPreview) {
                showStatus(statusBox, '没有可保存的合并预览。', 'warning');
                return;
            }

            state.campaignState = saveRecentCampaignState(state.diffPreview.state);
            state.diffPreview = null;
            state.conflicts = null;
            render(container, state);
            showStatus(container.querySelector('[data-state-panel-status]'), '状态合并结果已保存到最近状态草稿。', 'success');
        } catch (error) {
            showStatus(statusBox, formatError(error), 'error');
        }
    });

    container.querySelector('[data-cancel-state-merge]')?.addEventListener('click', () => {
        state.diffPreview = null;
        render(container, state);
        showStatus(container.querySelector('[data-state-panel-status]'), '已取消状态合并预览，未写入本地草稿。', 'warning');
    });

    container.querySelector('[data-detect-state-conflicts]')?.addEventListener('click', () => {
        try {
            state.conflicts = detectCampaignStateConflicts(state.campaignState);
            render(container, state);
            showStatus(container.querySelector('[data-state-panel-status]'), '状态冲突检测完成；检测结果只作提示，不会自动修改草稿。', 'warning');
        } catch (error) {
            showStatus(statusBox, formatError(error), 'error');
        }
    });

    container.querySelectorAll('[data-state-worldbook-category]').forEach((field) => {
        field.addEventListener('change', () => {
            if (field.checked) state.selectedWorldbookCategories.add(field.value);
            else state.selectedWorldbookCategories.delete(field.value);
        });
    });

    container.querySelector('[data-preview-state-worldbook]')?.addEventListener('click', () => {
        try {
            state.worldbookSyncPreview = buildWorldbookSyncDraft(state.campaignState);
            render(container, state);
            showStatus(container.querySelector('[data-state-panel-status]'), '已生成状态世界书草稿预览，尚未创建世界书。', 'warning');
        } catch (error) { showStatus(statusBox, formatError(error), 'error'); }
    });

    container.querySelector('[data-confirm-state-worldbook]')?.addEventListener('click', async () => {
        const categories = [...state.selectedWorldbookCategories];
        if (!categories.length) { showStatus(statusBox, '请至少选择一个状态世界书分类。', 'warning'); return; }
        await runCampaignStateWorldbookImport(state.campaignState, statusBox, { categories });
    });
}

function renderWorldbookSyncPreviewHtml(preview, selectedCategories) {
    if (!preview) return '';
    const categories = ['permanent_lore', 'current_state', 'mission_state', 'character_state', 'faction_state', 'item_state', 'history_archive'];
    return `<section class="setting-organizer-state-diff" data-state-worldbook-preview>
        <div class="setting-organizer-card-header"><h4>状态世界书草稿预览</h4><span class="setting-organizer-confidence">新增 ${preview.preview.summary.added} / 修改 ${preview.preview.summary.updated}</span></div>
        <p>仅会创建新的世界书；当前预览不会写入酒馆。</p>
        <div class="setting-organizer-inline-toggle">${categories.map((category) => `<label><input type="checkbox" data-state-worldbook-category value="${category}" ${selectedCategories.has(category) ? 'checked' : ''}><span>${category}</span></label>`).join('')}</div>
        <button type="button" data-confirm-state-worldbook>创建新世界书</button>
    </section>`;
}

function bindCollectionFields(container, state, collectionName) {
    container.querySelectorAll(`[data-state-field][data-collection="${collectionName}"]`).forEach((field) => {
        field.addEventListener('input', () => {
            const id = field.dataset.id;
            const fieldName = field.dataset.field;
            state.campaignState = updateStateField(state.campaignState, collectionName, id, fieldName, readFieldValue(field));
            state.conflicts = null;
        });
    });

    container.querySelectorAll(`[data-remove-state][data-collection="${collectionName}"]`).forEach((button) => {
        button.addEventListener('click', () => {
            state.campaignState = removeStateItem(state.campaignState, collectionName, button.dataset.removeState);
            state.conflicts = null;
            state.diffPreview = null;
            render(container, state);
        });
    });
}

export function updateStateField(campaignState, collectionName, id, fieldName, value) {
    return {
        ...campaignState,
        [collectionName]: updateArrayItem(campaignState[collectionName] || [], id, (item) => {
            item[fieldName] = value;
            return item;
        }),
    };
}

export function removeStateItem(campaignState, collectionName, id) {
    return {
        ...campaignState,
        [collectionName]: removeArrayItem(campaignState[collectionName] || [], id),
    };
}

function renderActiveTab(state) {
    if (state.activeTab === 'characters') {
        return renderCharacters(state.campaignState.characters);
    }

    if (state.activeTab === 'factions') {
        return renderFactions(state.campaignState.factions);
    }

    if (state.activeTab === 'missions') {
        return renderMissions(state.campaignState.missions);
    }

    if (state.activeTab === 'items') {
        return renderItems(state.campaignState.items);
    }

    if (state.activeTab === 'warnings') {
        return renderWarnings(state.campaignState.warnings);
    }

    return renderOverview(state.campaignState);
}

function renderOverview(campaignState) {
    return `
        <div class="setting-organizer-summary">
            <div><strong>${campaignState.characters.length}</strong><span>人物状态</span></div>
            <div><strong>${campaignState.factions.length}</strong><span>势力状态</span></div>
            <div><strong>${campaignState.missions.length}</strong><span>任务状态</span></div>
            <div><strong>${campaignState.items.length}</strong><span>关键道具</span></div>
        </div>
        <article class="setting-organizer-card">
            <div class="setting-organizer-card-header">
                <h4>${escapeHtml(campaignState.campaign.name || '剧情概况')}</h4>
                ${renderConfidence(campaignState.campaign.confidence)}
            </div>
            ${renderCampaignInput(campaignState.campaign, 'name', '剧情名')}
            ${renderCampaignInput(campaignState.campaign, 'currentTime', '当前时间')}
            ${renderCampaignInput(campaignState.campaign, 'currentLocation', '当前位置')}
            ${renderCampaignTextarea(campaignState.campaign, 'summary', '当前摘要')}
            ${renderItemWarnings(campaignState.campaign.warnings)}
        </article>
    `;
}

function renderCharacters(characters) {
    return renderCollection(characters, 'characters', '暂无人物状态。', (character) => `
        ${renderStateInput(character, 'name', '名称', 'characters')}
        ${renderStateInput(character, 'location', '当前位置', 'characters')}
        ${renderStateInput(character, 'status', '当前状态', 'characters')}
        ${renderStateTextarea(character, 'currentTask', '当前任务', 'characters')}
    `);
}

function renderFactions(factions) {
    return renderCollection(factions, 'factions', '暂无势力状态。', (faction) => `
        ${renderStateInput(faction, 'name', '名称', 'factions')}
        ${renderStateInput(faction, 'leader', '领袖', 'factions')}
        ${renderStateInput(faction, 'stance', '立场', 'factions')}
        ${renderStateTextarea(faction, 'currentGoal', '当前目标', 'factions')}
    `);
}

function renderMissions(missions) {
    return renderCollection(missions, 'missions', '暂无任务状态。', (mission) => `
        ${renderStateInput(mission, 'title', '标题', 'missions')}
        ${renderStateInput(mission, 'status', '状态', 'missions')}
        ${renderStateTextarea(mission, 'objective', '目标', 'missions')}
        ${renderStateTextarea(mission, 'progress', '进展', 'missions')}
    `);
}

function renderItems(items) {
    return renderCollection(items, 'items', '暂无关键道具。', (item) => `
        ${renderStateInput(item, 'name', '名称', 'items')}
        ${renderStateInput(item, 'holder', '持有人', 'items')}
        ${renderStateInput(item, 'status', '状态', 'items')}
        ${renderStateTextarea(item, 'purpose', '用途', 'items')}
    `);
}

function renderCollection(items, collectionName, emptyText, renderFields) {
    if (!items.length) {
        return `<p class="setting-organizer-empty">${emptyText}</p>`;
    }

    return items.map((item) => `
        <article class="setting-organizer-card">
            <div class="setting-organizer-card-header">
                <h4>${escapeHtml(item.name || item.title || '未命名状态')}</h4>
                <button type="button" data-remove-state="${item.id}" data-collection="${collectionName}">删除</button>
            </div>
            <div class="setting-organizer-state-meta">
                ${renderConfidence(item.confidence)}
                <span>来源：${escapeHtml(item.sourceMessageRange || '未记录')}</span>
            </div>
            ${renderFields(item)}
            ${renderItemWarnings(item.warnings)}
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

function renderConfidence(value) {
    return `<span class="setting-organizer-confidence">confidence ${Number(value || 0).toFixed(2)}</span>`;
}

function renderCampaignInput(item, field, label) {
    return renderInput({
        item,
        field,
        label,
        attributes: `data-campaign-field data-field="${field}"`,
    });
}

function renderCampaignTextarea(item, field, label) {
    return renderTextarea({
        item,
        field,
        label,
        attributes: `data-campaign-field data-field="${field}"`,
    });
}

function renderStateInput(item, field, label, collectionName) {
    return renderInput({
        item,
        field,
        label,
        attributes: `data-state-field data-collection="${collectionName}" data-id="${item.id}" data-field="${field}"`,
    });
}

function renderStateTextarea(item, field, label, collectionName) {
    return renderTextarea({
        item,
        field,
        label,
        attributes: `data-state-field data-collection="${collectionName}" data-id="${item.id}" data-field="${field}"`,
    });
}

function renderInput({ item, field, label, attributes }) {
    return `
        <label class="setting-organizer-field">
            <span>${label}</span>
            <input ${attributes} value="${escapeHtml(String(item[field] || ''))}">
        </label>
    `;
}

function renderTextarea({ item, field, label, attributes }) {
    return `
        <label class="setting-organizer-field">
            <span>${label}</span>
            <textarea ${attributes} rows="4">${escapeHtml(String(item[field] || ''))}</textarea>
        </label>
    `;
}

function readFieldValue(field) {
    return field.value;
}

function cloneState(value) {
    return JSON.parse(JSON.stringify(value));
}

function showStatus(container, message, state) {
    if (!container) {
        return;
    }

    container.hidden = false;
    container.dataset.state = state;
    container.textContent = message;
}

function downloadText(text, filename) {
    const blob = new Blob([text], { type: 'application/json;charset=utf-8' });
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
