// State
let nameA = '自分';
let nameB = '家族';
let pendingChores = [];
let completedA = [];
let completedB = [];
let requestedChores = new Set();

// Initialize
document.addEventListener('DOMContentLoaded', function () {
    loadFromLocalStorage();
    renderAll();
});

// LocalStorage Functions
function saveToLocalStorage() {
    const data = {
        nameA,
        nameB,
        pendingChores,
        completedA,
        completedB,
        requestedChores: Array.from(requestedChores),
    };
    localStorage.setItem('choreAppState', JSON.stringify(data));
}

function loadFromLocalStorage() {
    const saved = localStorage.getItem('choreAppState');
    if (saved) {
        const data = JSON.parse(saved);
        nameA = data.nameA || '自分';
        nameB = data.nameB || '家族';
        pendingChores = data.pendingChores || [];
        completedA = data.completedA || [];
        completedB = data.completedB || [];
        requestedChores = new Set(data.requestedChores || []);
        updateNameDisplay();
    } else {
        initializeDefaultChores();
    }
}

// Initialize default chores
function initializeDefaultChores() {
    const defaults = ['洗い物', '掃除機', 'トイレ掃除', 'ゴミ出し', 'お風呂', 'キッチン掃除'];
    pendingChores = defaults.map((chore, i) => ({ id: i, name: chore }));
    saveToLocalStorage();
}

// Name Settings
function toggleNameEdit() {
    const display = document.getElementById('nameDisplay');
    const edit = document.getElementById('nameEdit');
    display.classList.toggle('hidden');
    edit.classList.toggle('hidden');
}

function saveNames() {
    const nameAInput = document.getElementById('nameAInput').value.trim() || '自分';
    const nameBInput = document.getElementById('nameBInput').value.trim() || '家族';
    nameA = nameAInput;
    nameB = nameBInput;
    updateNameDisplay();
    toggleNameEdit();
    saveToLocalStorage();
    renderAll();
}

function updateNameDisplay() {
    document.getElementById('nameBadgeA').textContent = nameA;
    document.getElementById('nameBadgeB').textContent = nameB;
    document.getElementById('nameA').textContent = nameA;
    document.getElementById('nameB').textContent = nameB;
    document.getElementById('nameAInput').value = nameA;
    document.getElementById('nameBInput').value = nameB;
}

// Add Chore
function addChore() {
    const input = document.getElementById('newChoreInput');
    const name = input.value.trim();
    if (name) {
        const id = Date.now();
        pendingChores.push({ id, name });
        input.value = '';
        saveToLocalStorage();
        renderAll();
    }
}

// Mark Done
function markDoneA(id) {
    const chore = pendingChores.find(c => c.id === id);
    if (chore) {
        pendingChores = pendingChores.filter(c => c.id !== id);
        completedA.push(chore);
        requestedChores.delete(id);
        saveToLocalStorage();
        renderAll();
    }
}

function markDoneB(id) {
    const chore = pendingChores.find(c => c.id === id);
    if (chore) {
        pendingChores = pendingChores.filter(c => c.id !== id);
        completedB.push(chore);
        requestedChores.delete(id);
        saveToLocalStorage();
        renderAll();
    }
}

// Toggle Request
function toggleRequest(id) {
    if (requestedChores.has(id)) {
        requestedChores.delete(id);
    } else {
        requestedChores.add(id);
    }
    saveToLocalStorage();
    renderAll();
}

// Undo Done
function undoDoneA(id) {
    const chore = completedA.find(c => c.id === id);
    if (chore) {
        completedA = completedA.filter(c => c.id !== id);
        pendingChores.push(chore);
        saveToLocalStorage();
        renderAll();
    }
}

function undoDoneB(id) {
    const chore = completedB.find(c => c.id === id);
    if (chore) {
        completedB = completedB.filter(c => c.id !== id);
        pendingChores.push(chore);
        saveToLocalStorage();
        renderAll();
    }
}

// Delete Chore
function deleteChore(id) {
    pendingChores = pendingChores.filter(c => c.id !== id);
    requestedChores.delete(id);
    saveToLocalStorage();
    renderAll();
}

// Reset Day
function resetDay() {
    if (window.confirm('本当に1日をリセットしますか？完了した家事が未完了に戻ります。')) {
        pendingChores = [...pendingChores, ...completedA, ...completedB];
        completedA = [];
        completedB = [];
        requestedChores.clear();
        saveToLocalStorage();
        renderAll();
    }
}

// Render Functions
function renderPendingChores() {
    const container = document.getElementById('pendingChoresList');
    if (pendingChores.length === 0) {
        container.innerHTML = '<div class="empty">やることなし！休んでください 😌</div>';
        return;
    }
    container.innerHTML = pendingChores.map(chore => {
        const isRequested = requestedChores.has(chore.id);
        return `
      <div class="chore-item-pending ${isRequested ? 'requested' : ''}">
        <div class="chore-item-pending-header">
          <span class="chore-item-pending-name">${chore.name}</span>
          <button class="btn-delete" onclick="deleteChore(${chore.id})">🗑️</button>
        </div>
        <div class="chore-buttons">
          <button class="btn-done btn-done-a" onclick="markDoneA(${chore.id})">${nameA}がやった</button>
          <button class="btn-done btn-done-b" onclick="markDoneB(${chore.id})">${nameB}がやった</button>
        </div>
        <button class="btn-request ${isRequested ? 'active' : 'inactive'}" onclick="toggleRequest(${chore.id})">
          ${isRequested ? '✋ これお願い中' : '🙏 これお願い'}
        </button>
      </div>
    `;
    }).join('');
}

function renderCompletedA() {
    const container = document.getElementById('completedAList');
    if (completedA.length === 0) {
        container.innerHTML = '<div class="empty">まだありません</div>';
        return;
    }
    container.innerHTML = completedA.map(chore => `
    <div class="chore-item-completed chore-item-completed-a">
      <span class="chore-item-completed-name">${chore.name}</span>
      <button class="btn-undo" onclick="undoDoneA(${chore.id})">やっぱりやってない</button>
    </div>
  `).join('');
}

function renderCompletedB() {
    const container = document.getElementById('completedBList');
    if (completedB.length === 0) {
        container.innerHTML = '<div class="empty">まだありません</div>';
        return;
    }
    container.innerHTML = completedB.map(chore => `
    <div class="chore-item-completed chore-item-completed-b">
      <span class="chore-item-completed-name">${chore.name}</span>
      <button class="btn-undo" onclick="undoDoneB(${chore.id})">やっぱりやってない</button>
    </div>
  `).join('');
}

function renderAll() {
    renderPendingChores();
    renderCompletedA();
    renderCompletedB();
}