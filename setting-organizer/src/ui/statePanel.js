import { removeArrayItem, updateArrayItem } from './editor.js';

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
    };

    render(container, state);
}

function render(container, state) {
    container.innerHTML = renderStatePanelHtml(state.campaignState, state.activeTab);

    bindStatePanel(container, state);
}

export function renderStatePanelHtml(campaignState, activeTab = 'overview') {
    return `
        <div class="setting-organizer-state-note">剧情状态草稿，未写入、未保存、未同步世界书。</div>
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
}

function bindCollectionFields(container, state, collectionName) {
    container.querySelectorAll(`[data-state-field][data-collection="${collectionName}"]`).forEach((field) => {
        field.addEventListener('input', () => {
            const id = field.dataset.id;
            const fieldName = field.dataset.field;
            state.campaignState = updateStateField(state.campaignState, collectionName, id, fieldName, readFieldValue(field));
        });
    });

    container.querySelectorAll(`[data-remove-state][data-collection="${collectionName}"]`).forEach((button) => {
        button.addEventListener('click', () => {
            state.campaignState = removeStateItem(state.campaignState, collectionName, button.dataset.removeState);
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

function escapeHtml(value) {
    return value
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;');
}
