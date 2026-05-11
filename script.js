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
    'ごみ捨て': 'btn-garbage',
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

// 日付キー（グルーピング用）
function getDateKey(timestamp) {
    const d = new Date(timestamp);
    return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

// グループキーを取得
// 「空間：動作」形式のものは同日同空間でまとめる
// それ以外（ごみ捨て・物品補充・その他）はID単位で独立
function getGroupKey(chore) {
    const dateKey = getDateKey(chore.time);
    const colonIdx = chore.name.indexOf('：');
    if (colonIdx > -1) {
        const space = chore.name.substring(0, colonIdx);
        return `${dateKey}|${space}`;
    }
    // スタンドアロン（空間なし）は個別行
    return `${dateKey}|${chore.id}`;
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

// 物品補充 Free Supply Add
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

// その他 Free Add
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

// Undo（単体）
function undoDone(id) {
    completedList = completedList.filter(c => c.id !== id);
    saveToLocalStorage();
    renderCompleted();
}

// Undo（グループ：同日同空間の複数まとめて取り消し）
function undoGroup(idsStr) {
    const ids = idsStr.split(',').map(Number);
    completedList = completedList.filter(c => !ids.includes(c.id));
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

// Render：同日同空間は1行にまとめて表示
function renderCompleted() {
    const container = document.getElementById('completedList');
    if (completedList.length === 0) {
        container.innerHTML = '<div class="empty">まだありません</div>';
        return;
    }

    // グループを順序付きで構築（completedList は新しい順）
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
        // グループ内は古い順に並べる（追加された順に表示）
        const items = [...group.items].reverse();
        const latestTime = group.items[0].time; // 最新時刻（リストの先頭）

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
        <button class="btn-undo" onclick="undoDone(${chore.id})">取り消し</button>
      </div>`;
        } else {
            // 同日同空間：「空間：動作1、動作2、...」を1行で表示
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
        <button class="btn-undo" onclick="undoGroup('${allIds}')">取り消し</button>
      </div>`;
        }
    }).join('');
}