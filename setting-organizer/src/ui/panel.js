import { analyzeSettingText } from '../core/analyzer.js';
import { CHAT_RANGES, readCurrentChatSource } from '../adapters/chatAdapter.js';
import { formatError } from '../core/errors.js';
import { logError, logInfo } from '../core/logger.js';
import { assessInputScale } from '../core/tokenEstimate.js';
import { loadSettings, saveSettings } from '../storage/settings.js';
import { bindDiagnosticsControls, renderDiagnosticsControls } from './diagnostics.js';
import { mountResults } from './results.js';

const EXTENSION_DISPLAY_NAME = '设定整理器';
const PANEL_ID = 'setting-organizer-panel';

const STATUS_TEXT = Object.freeze({
    idle: '等待输入。',
    analyzing: '分析中...',
    success: '分析完成。',
    failed: '分析失败。',
});

export function createPanel() {
    if (document.getElementById(PANEL_ID)) {
        return;
    }

    const settings = loadSettings();
    const panel = document.createElement('section');
    panel.id = PANEL_ID;
    panel.className = 'setting-organizer-panel';
    panel.innerHTML = renderPanel(settings);

    getContainer().appendChild(panel);
    bindPanel(panel, settings);
}

function getContainer() {
    return document.getElementById('extensions_settings')
        || document.getElementById('extensions_settings2')
        || document.body;
}

function renderPanel(settings) {
    return `
        <div class="setting-organizer-header">
            <h3>${EXTENSION_DISPLAY_NAME}</h3>
            <span class="setting-organizer-badge">MVP-A</span>
        </div>

        <label class="setting-organizer-field">
            <span>粘贴设定文本</span>
            <textarea id="setting-organizer-input" rows="8" placeholder="在这里粘贴角色设定、世界观或剧情记录">${escapeHtml(settings.sourceText)}</textarea>
        </label>

        <fieldset class="setting-organizer-fieldset setting-organizer-chat-source">
            <legend>当前聊天读取</legend>
            <label>
                <span>读取范围</span>
                <select id="setting-organizer-chat-range">
                    <option value="${CHAT_RANGES.RECENT_20}" ${settings.chatRange === CHAT_RANGES.RECENT_20 ? 'selected' : ''}>最近 20 条</option>
                    <option value="${CHAT_RANGES.RECENT_50}" ${settings.chatRange === CHAT_RANGES.RECENT_50 ? 'selected' : ''}>最近 50 条</option>
                    <option value="${CHAT_RANGES.ALL}" ${settings.chatRange === CHAT_RANGES.ALL ? 'selected' : ''}>全部</option>
                    <option value="${CHAT_RANGES.MANUAL}" ${settings.chatRange === CHAT_RANGES.MANUAL ? 'selected' : ''}>手动索引</option>
                </select>
            </label>
            <label id="setting-organizer-chat-manual-wrap" ${settings.chatRange === CHAT_RANGES.MANUAL ? '' : 'hidden'}>
                <span>消息索引</span>
                <input id="setting-organizer-chat-manual-indexes" placeholder="例如：0, 2, 5-8">
            </label>
            <button id="setting-organizer-load-chat" type="button">读取当前聊天</button>
            <span id="setting-organizer-chat-status" aria-live="polite"></span>
        </fieldset>

        <fieldset class="setting-organizer-fieldset">
            <legend>整理目标</legend>
            <label>
                <input id="setting-organizer-target-character" type="checkbox" ${settings.targets.character ? 'checked' : ''}>
                <span>角色卡</span>
            </label>
            <label>
                <input id="setting-organizer-target-lorebook" type="checkbox" ${settings.targets.lorebook ? 'checked' : ''}>
                <span>世界书</span>
            </label>
        </fieldset>

        <label class="setting-organizer-field">
            <span>分析模式</span>
            <select id="setting-organizer-analysis-mode">
                <option value="mock" ${settings.analysisMode === 'mock' ? 'selected' : ''}>模拟结果</option>
                <option value="sillytavern" ${settings.analysisMode === 'sillytavern' ? 'selected' : ''}>当前 SillyTavern 模型</option>
            </select>
        </label>

        <label class="setting-organizer-field">
            <span>Token 预算模式</span>
            <select id="setting-organizer-budget-mode">
                <option value="light" ${settings.tokenBudgetMode === 'light' ? 'selected' : ''}>轻量</option>
                <option value="standard" ${settings.tokenBudgetMode === 'standard' ? 'selected' : ''}>标准</option>
                <option value="long" ${settings.tokenBudgetMode === 'long' ? 'selected' : ''}>长篇</option>
                <option value="custom" ${settings.tokenBudgetMode === 'custom' ? 'selected' : ''}>自定义</option>
            </select>
        </label>

        <div id="setting-organizer-custom-budget" class="setting-organizer-budget-grid" ${settings.tokenBudgetMode === 'custom' ? '' : 'hidden'}>
            <label>
                <span>角色卡</span>
                <input id="setting-organizer-budget-character" type="number" min="1" step="1" value="${settings.customBudget.character}">
            </label>
            <label>
                <span>单条世界书</span>
                <input id="setting-organizer-budget-lorebook-entry" type="number" min="1" step="1" value="${settings.customBudget.lorebookEntry}">
            </label>
            <label>
                <span>常驻世界书</span>
                <input id="setting-organizer-budget-constant-lore" type="number" min="1" step="1" value="${settings.customBudget.constantLore}">
            </label>
        </div>

        <div class="setting-organizer-actions">
            <button id="setting-organizer-analyze" type="button">开始分析</button>
        </div>
        ${renderDiagnosticsControls()}

        <div id="setting-organizer-error" class="setting-organizer-error" hidden></div>
        <div id="setting-organizer-result" class="setting-organizer-result" data-state="idle" aria-live="polite">
            ${STATUS_TEXT.idle}
        </div>
        <div id="setting-organizer-results-mount" class="setting-organizer-results-mount"></div>
    `;
}

function bindPanel(panel, settings) {
    const elements = getElements(panel);
    let currentSettings = settings;
    let isAnalyzing = false;

    const persist = () => {
        currentSettings = readSettingsFromPanel(elements);
        saveSettings(currentSettings);
        elements.customBudget.hidden = currentSettings.tokenBudgetMode !== 'custom';
    };

    elements.input.addEventListener('input', persist);
    elements.characterTarget.addEventListener('change', persist);
    elements.lorebookTarget.addEventListener('change', persist);
    elements.budgetMode.addEventListener('change', persist);
    elements.analysisMode.addEventListener('change', persist);
    elements.chatRange.addEventListener('change', () => {
        persist();
        elements.chatManualWrap.hidden = elements.chatRange.value !== CHAT_RANGES.MANUAL;
    });
    elements.budgetCharacter.addEventListener('input', persist);
    elements.budgetLorebookEntry.addEventListener('input', persist);
    elements.budgetConstantLore.addEventListener('input', persist);
    bindDiagnosticsControls(panel);

    elements.loadChatButton.addEventListener('click', () => {
        try {
            const chatSource = readCurrentChatSource({
                range: elements.chatRange.value,
                selectedIndexes: parseManualIndexes(elements.chatManualIndexes.value),
            });
            elements.input.value = chatSource.sourceText;
            persist();
            clearError(elements);
            elements.chatStatus.dataset.state = 'success';
            elements.chatStatus.textContent = formatChatReadStatus(chatSource);
        } catch (error) {
            elements.chatStatus.dataset.state = 'error';
            elements.chatStatus.textContent = formatError(error);
            showError(elements, formatError(error));
        }
    });

    elements.analyzeButton.addEventListener('click', async () => {
        if (isAnalyzing) {
            return;
        }

        persist();
        clearError(elements);

        if (!currentSettings.sourceText.trim()) {
            showError(elements, '请输入需要整理的设定文本。');
            setStatus(elements, 'failed');
            return;
        }

        if (!currentSettings.targets.character && !currentSettings.targets.lorebook) {
            showError(elements, '请至少选择一个整理目标。');
            setStatus(elements, 'failed');
            return;
        }

        const inputScale = assessInputScale(currentSettings.sourceText);
        if (currentSettings.analysisMode === 'sillytavern' && inputScale.requiresConfirmation && !confirmLongInput(inputScale)) {
            showError(elements, '已取消真实模型分析。建议缩短输入、改用最近 20 条聊天或分批整理。');
            setStatus(elements, 'failed');
            return;
        }

        isAnalyzing = true;
        elements.analyzeButton.disabled = true;
        setStatus(elements, 'analyzing');
        logInfo('analysis-started', {
            mode: currentSettings.analysisMode,
            targets: currentSettings.targets,
            sourceLength: currentSettings.sourceText.trim().length,
            inputScale,
        });

        try {
            const result = await analyzeSettingText(currentSettings.sourceText, currentSettings);
            setStatus(elements, 'success', buildPlaceholderResult(currentSettings));
            mountResults(elements.resultsMount, result);
            logInfo('analysis-completed', {
                characterCount: result.characters.length,
                lorebookEntryCount: result.lorebookEntries.length,
                warningCount: result.warnings.length,
            });
        } catch (error) {
            logError('analysis-failed', error, {
                mode: currentSettings.analysisMode,
                sourceLength: currentSettings.sourceText.trim().length,
            });
            showError(elements, formatError(error));
            setStatus(elements, 'failed');
        } finally {
            isAnalyzing = false;
            elements.analyzeButton.disabled = false;
        }
    });
}

function getElements(panel) {
    return {
        input: panel.querySelector('#setting-organizer-input'),
        characterTarget: panel.querySelector('#setting-organizer-target-character'),
        lorebookTarget: panel.querySelector('#setting-organizer-target-lorebook'),
        budgetMode: panel.querySelector('#setting-organizer-budget-mode'),
        analysisMode: panel.querySelector('#setting-organizer-analysis-mode'),
        chatRange: panel.querySelector('#setting-organizer-chat-range'),
        chatManualWrap: panel.querySelector('#setting-organizer-chat-manual-wrap'),
        chatManualIndexes: panel.querySelector('#setting-organizer-chat-manual-indexes'),
        loadChatButton: panel.querySelector('#setting-organizer-load-chat'),
        chatStatus: panel.querySelector('#setting-organizer-chat-status'),
        customBudget: panel.querySelector('#setting-organizer-custom-budget'),
        budgetCharacter: panel.querySelector('#setting-organizer-budget-character'),
        budgetLorebookEntry: panel.querySelector('#setting-organizer-budget-lorebook-entry'),
        budgetConstantLore: panel.querySelector('#setting-organizer-budget-constant-lore'),
        analyzeButton: panel.querySelector('#setting-organizer-analyze'),
        error: panel.querySelector('#setting-organizer-error'),
        result: panel.querySelector('#setting-organizer-result'),
        resultsMount: panel.querySelector('#setting-organizer-results-mount'),
    };
}

function readSettingsFromPanel(elements) {
    return {
        sourceText: elements.input.value,
        targets: {
            character: elements.characterTarget.checked,
            lorebook: elements.lorebookTarget.checked,
        },
        tokenBudgetMode: elements.budgetMode.value,
        analysisMode: elements.analysisMode.value,
        chatRange: elements.chatRange.value,
        customBudget: {
            character: elements.budgetCharacter.value,
            lorebookEntry: elements.budgetLorebookEntry.value,
            constantLore: elements.budgetConstantLore.value,
        },
    };
}

function setStatus(elements, state, text = STATUS_TEXT[state]) {
    elements.result.dataset.state = state;
    elements.result.textContent = text;
}

function showError(elements, message) {
    elements.error.hidden = false;
    elements.error.textContent = message;
}

function clearError(elements) {
    elements.error.hidden = true;
    elements.error.textContent = '';
}

function parseManualIndexes(value) {
    return String(value || '').split(',')
        .flatMap((part) => {
            const trimmed = part.trim();
            if (!trimmed) {
                return [];
            }

            const rangeMatch = trimmed.match(/^(\d+)\s*-\s*(\d+)$/);
            if (!rangeMatch) {
                return [Number(trimmed)];
            }

            const start = Number(rangeMatch[1]);
            const end = Number(rangeMatch[2]);
            if (!Number.isInteger(start) || !Number.isInteger(end) || end < start) {
                return [];
            }

            return Array.from({ length: end - start + 1 }, (_, index) => start + index);
        })
        .filter((index) => Number.isInteger(index) && index >= 0);
}

function formatChatReadStatus(chatSource) {
    const lines = [
        `已读取 ${chatSource.selectedMessages}/${chatSource.totalMessages} 条，用户 ${chatSource.userMessages} 条，AI/角色 ${chatSource.characterMessages} 条。`,
        `总字符数 ${chatSource.inputScale.characterCount}，约 ${chatSource.tokenEstimate} tokens。`,
    ];

    if (chatSource.inputScale.warnings.length) {
        lines.push(...chatSource.inputScale.warnings);
    }

    return lines.join('\n');
}

function confirmLongInput(inputScale) {
    if (typeof window === 'undefined' || typeof window.confirm !== 'function') {
        return true;
    }

    return window.confirm([
        `当前输入 ${inputScale.characterCount} 字符，约 ${inputScale.tokenEstimate} tokens。`,
        '真实模型输出可能被截断。',
        '仍要继续分析吗？',
    ].join('\n'));
}

function buildPlaceholderResult(settings) {
    const targets = [
        settings.targets.character ? '角色卡' : '',
        settings.targets.lorebook ? '世界书' : '',
    ].filter(Boolean).join('、');

    return [
        STATUS_TEXT.success,
        `输入长度：${settings.sourceText.trim().length} 字符`,
        `整理目标：${targets}`,
        `分析模式：${settings.analysisMode}`,
        `Token 预算：${settings.tokenBudgetMode}`,
    ].join('\n');
}

function escapeHtml(value) {
    return value
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;');
}
