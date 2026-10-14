// ==========================================================================
// 🍞 トースト通知 ＆ スマートUndo（即時取り消し）システム
// ==========================================================================
let currentToastTimeout = null;
let lastRecordedChore = null; // { id, name, time }

function ensureToastContainer() {
    let container = document.getElementById('global-toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'global-toast-container';
        container.className = 'global-toast-container';
        document.body.appendChild(container);
    }
    return container;
}

/**
 * 汎用トースト通知を表示
 * @param {string} message - 表示メッセージ
 * @param {object} options - { undoCallback: Function, duration: number, isUndo: boolean }
 */
function showToast(message, options = {}) {
    const container = ensureToastContainer();
    const duration = options.duration || 8000;

    if (currentToastTimeout) {
        clearTimeout(currentToastTimeout);
        currentToastTimeout = null;
    }

    const toast = document.createElement('div');
    toast.className = `global-toast-item ${options.isUndo ? 'toast-undo' : 'toast-success'}`;
    
    let html = `<span class="toast-message">${message}</span>`;
    if (options.undoCallback) {
        html += `<button class="toast-undo-btn" id="toast-undo-button">取り消す</button>`;
    }
    toast.innerHTML = html;

    // 既存のトーストがあれば置換
    container.innerHTML = '';
    container.appendChild(toast);

    if (options.undoCallback) {
        const undoBtn = document.getElementById('toast-undo-button');
        if (undoBtn) {
            undoBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                options.undoCallback();
                hideToast();
            });
        }
    }

    currentToastTimeout = setTimeout(() => {
        hideToast();
    }, duration);
}

function hideToast() {
    const container = document.getElementById('global-toast-container');
    if (container) {
        const toast = container.querySelector('.global-toast-item');
        if (toast) {
            toast.classList.add('toast-fading');
            setTimeout(() => {
                container.innerHTML = '';
            }, 300);
        }
    }
    if (currentToastTimeout) {
        clearTimeout(currentToastTimeout);
        currentToastTimeout = null;
    }
}
