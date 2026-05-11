// Define all quick chore templates
const QUICK_CHORES = {
    'リビング：掃除機がけ': 'btn-living-vacuum',
    'リビング：クイックルワイパー': 'btn-living-quickle',
    'リビング：カーペットころころ': 'btn-living-roller',
    '寝室：掃除機がけ': 'btn-bedroom-vacuum',
    '寝室：クイックルワイパー': 'btn-bedroom-quickle',
    '自由な部屋：掃除機がけ': 'btn-any-vacuum',
    '自由な部屋：クイックルワイパー': 'btn-any-quickle',
    'キッチン：シンクの掃除': 'btn-kitchen-sink',
    'キッチン：コンロの掃除': 'btn-kitchen-stove',
    'キッチン：タオル交換': 'btn-kitchen-towel',
    'お風呂：浴槽・浴室の掃除': 'btn-bath-clean',
    'お風呂:タオル交換': 'btn-bath-towel',
    '洗面所：洗面台の掃除': 'btn-washroom-clean',
    '洗面所：タオル交換': 'btn-washroom-towel',
    'トイレ：トイレ掃除': 'btn-toilet-clean',
};

// 完了ボタンの一時的な「つぶし」状態を解除するまでの時間（ミリ秒）
const BUTTON_RESET_MS = 4000;

// State
let completedList = [];

// Initialize
document.addEventListener('DOMContentLoaded', function () {
    loadFromLocalStorage();
    renderCompleted();
});

// LocalStorage Functions
function saveToLocalStorage() {
    const data = { completedList };
    localStorage.setItem('yattayoState', JSON.stringify(data));
}

function loadFromLocalStorage() {
    const saved = localStorage.getItem('yattayoState');
    if (saved) {
        const data = JSON.parse(saved);
        completedList = data.completedList || [];
    }
}

// 時刻フォーマット
function formatTime(timestamp) {
    const d = new Date(timestamp);
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    return `${m}/${day} ${hh}:${mm}`;
}

// Quick Add Chore（やった記録 + ボタンをつぶし状態に）
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

// Free Supply Add
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

// Undo
function undoDone(id) {
    completedList = completedList.filter(c => c.id !== id);
    saveToLocalStorage();
    renderCompleted();
}

// Reset Day
function resetDay() {
    if (window.confirm('本当に1日をリセットしますか？「最近やったこと」がすべて消えます。')) {
        completedList = [];
        saveToLocalStorage();
        renderCompleted();
        // ボタンのつぶし状態も全解除
        Object.values(QUICK_CHORES).forEach(buttonId => {
            const btn = document.getElementById(buttonId);
            if (btn) btn.classList.remove('done');
        });
    }
}

// Render
function renderCompleted() {
    const container = document.getElementById('completedList');
    if (completedList.length === 0) {
        container.innerHTML = '<div class="empty">まだありません</div>';
        return;
    }
    container.innerHTML = completedList.map(chore => {
        const isSupply = chore.name.startsWith('[物品補充]');
        return `
      <div class="chore-item-completed">
        <div class="chore-item-completed-info">
          <span class="chore-item-completed-name">
            ${isSupply ? '<span class="chore-item-completed-tag">補充</span>' : ''}${chore.name}
          </span>
          <span class="chore-item-completed-time">${formatTime(chore.time)}</span>
        </div>
        <button class="btn-undo" onclick="undoDone(${chore.id})">取り消し</button>
      </div>
    `;
    }).join('');
}