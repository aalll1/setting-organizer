import { buildDiagnosticSnapshot, clearLogs, logInfo } from '../core/logger.js';
import { getModelOutputDebugSummary, getRawModelOutputExport } from '../core/modelOutputDebug.js';

export function renderDiagnosticsControls() {
    return `
        <div class="setting-organizer-diagnostics">
            <button type="button" data-export-diagnostics>导出诊断日志</button>
            <button type="button" data-clear-diagnostics>清空诊断日志</button>
            <button type="button" data-copy-raw-output>复制原始模型输出</button>
            <button type="button" data-download-raw-output>下载原始模型输出</button>
            <span data-diagnostics-status hidden></span>
            <pre data-model-output-debug hidden></pre>
        </div>
    `;
}

export function bindDiagnosticsControls(container) {
    const exportButton = container.querySelector('[data-export-diagnostics]');
    const clearButton = container.querySelector('[data-clear-diagnostics]');
    const copyRawButton = container.querySelector('[data-copy-raw-output]');
    const downloadRawButton = container.querySelector('[data-download-raw-output]');
    const status = container.querySelector('[data-diagnostics-status]');
    renderModelOutputDebug(container);

    if (exportButton) {
        exportButton.addEventListener('click', () => {
            const snapshot = buildDiagnosticSnapshot({
                source: 'manual-export',
            });
            downloadJson(JSON.stringify(snapshot, null, 2), createDiagnosticsFilename());
            logInfo('diagnostics-exported', {
                logCount: snapshot.logs.length,
            });
            showStatus(status, `已导出诊断日志：${snapshot.logs.length} 条`);
        });
    }

    if (clearButton) {
        clearButton.addEventListener('click', () => {
            clearLogs();
            showStatus(status, '诊断日志已清空。');
        });
    }

    if (copyRawButton) {
        copyRawButton.addEventListener('click', async () => {
            const exported = getRawModelOutputExport();
            if (!exported) {
                showStatus(status, '暂无原始模型输出。');
                return;
            }

            if (!confirmRawOutputExport()) {
                showStatus(status, '已取消复制原始模型输出。');
                return;
            }

            if (!navigator.clipboard || typeof navigator.clipboard.writeText !== 'function') {
                showStatus(status, '当前浏览器不支持剪贴板写入，请改用下载原始模型输出。');
                return;
            }

            await navigator.clipboard.writeText(exported.content);
            logInfo('raw-model-output-copied', exported.summary);
            showStatus(status, `已复制原始模型输出：${exported.summary.rawOutputLength} 字符`);
        });
    }

    if (downloadRawButton) {
        downloadRawButton.addEventListener('click', () => {
            const exported = getRawModelOutputExport();
            if (!exported) {
                showStatus(status, '暂无原始模型输出。');
                return;
            }

            if (!confirmRawOutputExport()) {
                showStatus(status, '已取消下载原始模型输出。');
                return;
            }

            downloadText(exported.content, exported.filename);
            logInfo('raw-model-output-downloaded', exported.summary);
            showStatus(status, `已下载原始模型输出：${exported.summary.rawOutputLength} 字符`);
        });
    }
}

function downloadJson(jsonText, filename) {
    downloadText(jsonText, filename, 'application/json;charset=utf-8');
}

function downloadText(text, filename, type = 'text/plain;charset=utf-8') {
    const blob = new Blob([text], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
}

function createDiagnosticsFilename() {
    const stamp = new Date().toISOString().replace(/[-:.TZ]/g, '');
    return `setting-organizer-diagnostics-${stamp}.json`;
}

function showStatus(container, message) {
    if (!container) {
        return;
    }

    container.hidden = false;
    container.textContent = message;
}

function renderModelOutputDebug(container) {
    const debugBox = container.querySelector('[data-model-output-debug]');
    if (!debugBox) {
        return;
    }

    const summary = getModelOutputDebugSummary();
    if (!summary) {
        debugBox.hidden = true;
        debugBox.textContent = '';
        return;
    }

    debugBox.hidden = false;
    debugBox.textContent = [
        `模型输出调试：${summary.capturedAt}`,
        `输入长度：${summary.sourceLength}`,
        `Prompt 长度：${summary.promptLength}`,
        `模型返回长度：${summary.rawOutputLength}`,
        `检测到 Markdown 代码块：${summary.inspection.hasFencedJson ? '是' : '否'}`,
        `检测到 JSON 起点：${summary.inspection.hasLikelyJsonStart ? '是' : '否'}`,
        `检测到 JSON 终点：${summary.inspection.hasLikelyJsonEnd ? '是' : '否'}`,
        `疑似截断：${summary.inspection.isLikelyTruncated ? '是' : '否'}`,
        '返回开头预览：',
        summary.inspection.rawOutputPreviewStart,
        '返回结尾预览：',
        summary.inspection.rawOutputPreviewEnd,
    ].join('\n');
}

function confirmRawOutputExport() {
    if (typeof window === 'undefined' || typeof window.confirm !== 'function') {
        return true;
    }

    return window.confirm('原始模型输出可能包含完整聊天或设定隐私。确认只在本机复制/下载？');
}
