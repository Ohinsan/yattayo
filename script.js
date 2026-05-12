/**
 * Household Chores App V2 - Script
 */

// 1. Template Definitions
const LAYOUT_TEMPLATES = {
    '1LDK': [
        { group: 'リビング', chores: ['掃除機がけ', '拭き掃除', 'カーペットころころ'] },
        { group: 'キッチン', chores: ['シンクの掃除', 'コンロの掃除', 'タオル交換'] },
        { group: 'お風呂', chores: ['浴槽・浴室の掃除', 'タオル交換'] },
        { group: 'トイレ', chores: ['トイレ掃除'] },
        { group: 'ごみ捨て', chores: ['ごみ捨て'] }
    ],
    '2LDK': [
        { group: 'リビング', chores: ['掃除機がけ', '拭き掃除', 'カーペットころころ'] },
        { group: 'キッチン', chores: ['シンクの掃除', 'コンロの掃除', 'タオル交換'] },
        { group: 'お風呂', chores: ['浴槽・浴室の掃除', 'タオル交換'] },
        { group: 'トイレ', chores: ['トイレ掃除'] },
        { group: '寝室', chores: ['掃除機がけ', '拭き掃除'] },
        { group: '自由な部屋', chores: ['掃除機がけ', '拭き掃除'] },
        { group: '洗面所', chores: ['洗面台の掃除', 'タオル交換'] },
        { group: 'ごみ捨て', chores: ['ごみ捨て'] }
    ],
    '3LDK+': [
        { group: 'リビング', chores: ['掃除機がけ', '拭き掃除', 'カーペットころころ'] },
        { group: 'キッチン', chores: ['シンクの掃除', 'コンロの掃除', 'タオル交換'] },
        { group: 'お風呂', chores: ['浴槽・浴室の掃除', 'タオル交換'] },
        { group: 'トイレ', chores: ['トイレ掃除'] },
        { group: '寝室', chores: ['掃除機がけ', '拭き掃除'] },
        { group: '自由な部屋', chores: ['掃除機がけ', '拭き掃除'] },
        { group: '洗面所', chores: ['洗面台の掃除', 'タオル交換'] },
        { group: '追加の部屋1', chores: ['掃除機がけ', '拭き掃除'] },
        { group: '追加の部屋2', chores: ['掃除機がけ', '拭き掃除'] },
        { group: 'ごみ捨て', chores: ['ごみ捨て'] }
    ]
};

// 完了ボタンの一時的な「つぶし」状態を解除するまでの時間（ミリ秒）
const BUTTON_RESET_MS = 4000;

// State
let completedList = [];
let currentLayout = null;

// --- Initialize ---
document.addEventListener('DOMContentLoaded', function () {
    loadFromLocalStorage();
    initApp();
});

function initApp() {
    const setupScreen = document.getElementById('setup-screen');
    const mainScreen = document.getElementById('main-screen');

    if (!currentLayout) {
        setupScreen.classList.remove('hidden');
        mainScreen.classList.add('hidden');
    } else {
        setupScreen.classList.add('hidden');
        mainScreen.classList.remove('hidden');
        renderQuickAddButtons();
        renderCompleted();
        document.getElementById('current-layout-display').textContent = `現在の間取り: ${currentLayout}`;
    }
}

// --- Layout Selection ---
function selectTemplate(layout) {
    currentLayout = layout;
    saveToLocalStorage();
    initApp();
}

function changeLayoutSettings() {
    if (window.confirm('部屋の設定を変更しますか？\n今日の「やったことリスト」はすべてリセットされます。')) {
        completedList = [];
        currentLayout = null;
        saveToLocalStorage();
        initApp();
    }
}

// --- Dynamic Rendering ---
function renderQuickAddButtons() {
    const container = document.getElementById('quick-add-container');
    const template = LAYOUT_TEMPLATES[currentLayout];
    
    if (!template) return;

    container.innerHTML = template.map(section => `
        <div class="quick-add-section">
            <span class="group-label">${section.group}</span>
            <div class="quick-add-buttons">
                ${section.chores.map(chore => {
                    const fullName = section.group === 'ごみ捨て' ? chore : `${section.group}：${chore}`;
                    return `<button class="quick-add-btn" onclick="addQuickChore('${fullName}', this)">${chore}</button>`;
                }).join('')}
            </div>
        </div>
    `).join('');
}

// --- LocalStorage Functions ---
function saveToLocalStorage() {
    const data = { completedList, currentLayout };
    localStorage.setItem('yattayoStateV2', JSON.stringify(data));
}

function loadFromLocalStorage() {
    const oldSaved = localStorage.getItem('yattayoState');
    const saved = localStorage.getItem('yattayoStateV2');
    
    if (saved) {
        const data = JSON.parse(saved);
        completedList = data.completedList || [];
        currentLayout = data.currentLayout || null;
    } else if (oldSaved) {
        const data = JSON.parse(oldSaved);
        completedList = data.completedList || [];
    }
}

// --- Chore Logic ---
function addQuickChore(choreName, buttonElement) {
    const id = Date.now();
    completedList.unshift({ id, name: choreName, time: id });
    saveToLocalStorage();
    renderCompleted();

    if (buttonElement) {
        buttonElement.classList.add('done');
        setTimeout(() => {
            buttonElement.classList.remove('done');
        }, BUTTON_RESET_MS);
    }
}

function addFreeSupply() {
    const input = document.getElementById('freeSupplyInput');
    const text = input.value.trim();
    if (text) {
        const choreName = `[物品補充] ${text}`;
        const id = Date.now();
        completedList.unshift({ id, name: choreName, time: id });
        input.value = '';
        saveToLocalStorage();
        renderCompleted();
    }
}

function addOtherChore() {
    const input = document.getElementById('otherChoreInput');
    const text = input.value.trim();
    if (text) {
        const choreName = `[その他] ${text}`;
        const id = Date.now();
        completedList.unshift({ id, name: choreName, time: id });
        input.value = '';
        saveToLocalStorage();
        renderCompleted();
    }
}

function undoDone(id) {
    completedList = completedList.filter(c => c.id !== id);
    saveToLocalStorage();
    renderCompleted();
}

function undoGroup(idsStr) {
    const ids = idsStr.split(',').map(Number);
    completedList = completedList.filter(c => !ids.includes(c.id));
    saveToLocalStorage();
    renderCompleted();
}

function resetDay() {
    if (window.confirm('本当に1日をリセットしますか？\n「最近やったこと」がすべて消えます。')) {
        completedList = [];
        saveToLocalStorage();
        renderCompleted();
    }
}

// --- Render Completed List ---
function renderCompleted() {
    const container = document.getElementById('completedList');
    if (completedList.length === 0) {
        container.innerHTML = '<div class="empty">まだありません</div>';
        return;
    }

    const groupOrder = [];
    const groupMap = {};

    completedList.forEach(chore => {
        const key = getGroupKey(chore);
        if (!groupMap[key]) {
            groupMap[key] = { key, items: [] };
            groupOrder.push(key);
        }
        groupMap[key].items.push(chore);
    });

    container.innerHTML = groupOrder.map(key => {
        const group = groupMap[key];
        const items = [...group.items].reverse();
        const latestTime = group.items[0].time;

        if (items.length === 1) {
            const chore = items[0];
            const isSupply = chore.name.startsWith('[物品補充]');
            const isOther = chore.name.startsWith('[その他]');
            const displayName = chore.name
                .replace(/^\[物品補充\]\s*/, '')
                .replace(/^\[その他\]\s*/, '');

            return `
                <div class="chore-item-completed">
                    <div class="chore-item-completed-info">
                        <span class="chore-item-completed-name">
                            ${isSupply ? '<span class="chore-item-completed-tag">補充</span>' : ''}
                            ${isOther ? '<span class="chore-item-completed-tag tag-other">その他</span>' : ''}
                            ${displayName}
                        </span>
                        <span class="chore-item-completed-time">${formatTime(chore.time)}</span>
                    </div>
                    <button class="btn-undo" onclick="undoDone(${chore.id})">取消</button>
                </div>`;
        } else {
            const colonIdx = items[0].name.indexOf('：');
            const space = items[0].name.substring(0, colonIdx);
            const actions = items.map(item => item.name.substring(item.name.indexOf('：') + 1)).join('、');
            const allIds = group.items.map(item => item.id).join(',');

            return `
                <div class="chore-item-completed">
                    <div class="chore-item-completed-info">
                        <span class="chore-item-completed-name">${space}：${actions}</span>
                        <span class="chore-item-completed-time">${formatTime(latestTime)}</span>
                    </div>
                    <button class="btn-undo" onclick="undoGroup('${allIds}')">取消</button>
                </div>`;
        }
    }).join('');
}

// --- Utils ---
function formatTime(timestamp) {
    const d = new Date(timestamp);
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    return `${m}/${day} ${hh}:${mm}`;
}

function getDateKey(timestamp) {
    const d = new Date(timestamp);
    return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function getGroupKey(chore) {
    const dateKey = getDateKey(chore.time);
    const colonIdx = chore.name.indexOf('：');
    if (colonIdx > -1) {
        const space = chore.name.substring(0, colonIdx);
        return `${dateKey}|${space}`;
    }
    return `${dateKey}|${chore.id}`;
}

// --- Share Feature ---
async function shareReport() {
    const shareText = generateShareText();
    const appWrapper = document.querySelector('.app-wrapper');
    
    // 画像化（魔法のカメラ機能）
    try {
        const canvas = await html2canvas(appWrapper, { 
            scale: 2, 
            backgroundColor: '#fef3c7' 
        });
        
        canvas.toBlob(async blob => {
            const file = new File([blob], 'today_task.png', { type: 'image/png' });
            if(navigator.share) {
                try {
                    await navigator.share({ 
                        title: '今日の家事レポート',
                        text: shareText, // テキストと画像をセット
                        files: [file] 
                    });
                } catch (e) {
                    console.log("シェアがキャンセルされました");
                }
            } else {
                alert('ブラウザが画像シェアに対応していません。テキストをコピーしました！');
                copyToClipboard(shareText);
            }
        });
    } catch (error) {
        console.error("画像化エラー", error);
        alert("画像の生成に失敗しました。テキストのみコピーします。");
        copyToClipboard(shareText);
    }
}

function generateShareText() {
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
    
    const doneNames = new Set(
        completedList
            .filter(c => getDateKey(c.time) === todayStr)
            .map(c => c.name)
    );

    const template = LAYOUT_TEMPLATES[currentLayout];
    const allTemplateChores = [];
    template.forEach(section => {
        section.chores.forEach(chore => {
            const fullName = section.group === 'ごみ捨て' ? chore : `${section.group}：${chore}`;
            allTemplateChores.push(fullName);
        });
    });

    let doneText = Array.from(doneNames).map(name => `・${name}`).join('\n');
    if (!doneText) doneText = '（まだありません）';

    const todoChores = allTemplateChores.filter(name => !doneNames.has(name));
    let todoText = todoChores.map(name => `・${name}`).join('\n');
    if (!todoText) todoText = '（すべて完了！）';

    const message = document.getElementById('shareMessage').value.trim();
    const messageText = message ? `\n🙏 伝言・お願い\n${message}` : '';

    return `🏠 今日の家事レポート\n\n✅ やったこと\n${doneText}\n\n⬜️ まだやってないこと\n${todoText}${messageText}`;
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        alert('レポートをクリップボードにコピーしました！LINE等に貼り付けて送信してください。');
    }).catch(err => {
        alert('コピーに失敗しました。');
    });
}