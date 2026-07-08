import { createPanel } from './src/ui/panel.js';
import { logError, logInfo } from './src/core/logger.js';

function initExtension() {
    try {
        createPanel();
        logInfo('extension-loaded');
    } catch (error) {
        logError('extension-load-failed', error);
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initExtension);
} else {
    initExtension();
}
