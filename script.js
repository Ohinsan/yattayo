// ==========================================================================
// 1. Template Definitions (Base template room names)
// ==========================================================================
const BASE_TEMPLATES = {
    '1LDK': [
        { id: 'living', defaultName: 'リビング', chores: ['掃除機がけ', '拭き掃除', 'ベッドメイキング'] },
        { id: 'kitchen', defaultName: 'キッチン', chores: ['シンクの掃除', 'コンロの掃除', '料理', '食器洗い', 'タオル交換'] },
        { id: 'bath', defaultName: 'お風呂', chores: ['浴槽・浴室の掃除', '洗面台の掃除', 'タオル交換'] },
        { id: 'laundry', defaultName: '洗濯', chores: ['洗濯', '洗濯物を干す', '洗濯物を畳む'] },
        { id: 'toilet', defaultName: 'トイレ', chores: ['トイレ掃除'] },
        { id: 'trash', defaultName: 'ごみ捨て', chores: ['ごみ捨て'] }
    ],
    '2LDK': [
        { id: 'living', defaultName: 'リビング', chores: ['掃除機がけ', '拭き掃除'] },
        { id: 'kitchen', defaultName: 'キッチン', chores: ['シンクの掃除', 'コンロの掃除', '料理', '食器洗い', 'タオル交換'] },
        { id: 'bath', defaultName: 'お風呂', chores: ['浴槽・浴室の掃除', 'タオル交換'] },
        { id: 'laundry', defaultName: '洗濯', chores: ['洗濯', '洗濯物を干す', '洗濯物を畳む'] },
        { id: 'toilet', defaultName: 'トイレ', chores: ['トイレ掃除'] },
        { id: 'bedroom', defaultName: '部屋1', chores: ['掃除機がけ', '拭き掃除', 'ベッドメイキング'] },
        { id: 'room1', defaultName: '部屋2', chores: ['掃除機がけ', '拭き掃除', 'ベッドメイキング'] },
        { id: 'washroom', defaultName: '洗面所', chores: ['洗面台の掃除', 'タオル交換'] },
        { id: 'trash', defaultName: 'ごみ捨て', chores: ['ごみ捨て'] }
    ],
    '3LDK+': [
        { id: 'living', defaultName: 'リビング', chores: ['掃除機がけ', '拭き掃除'] },
        { id: 'kitchen', defaultName: 'キッチン', chores: ['シンクの掃除', 'コンロの掃除', '料理', '食器洗い', 'タオル交換'] },
        { id: 'bath', defaultName: 'お風呂', chores: ['浴槽・浴室の掃除', 'タオル交換'] },
        { id: 'laundry', defaultName: '洗濯', chores: ['洗濯', '洗濯物を干す', '洗濯物を畳む'] },
        { id: 'toilet', defaultName: 'トイレ', chores: ['トイレ掃除'] },
        { id: 'bedroom', defaultName: '部屋1', chores: ['掃除機がけ', '拭き掃除', 'ベッドメイキング'] },
        { id: 'room1', defaultName: '部屋2', chores: ['掃除機がけ', '拭き掃除', 'ベッドメイキング'] },
        { id: 'washroom', defaultName: '洗面所', chores: ['洗面台の掃除', 'タオル交換'] },
        { id: 'room2', defaultName: '部屋3', chores: ['掃除機がけ', '拭き掃除', 'ベッドメイキング'] },
        { id: 'room3', defaultName: '部屋4', chores: ['掃除機がけ', '拭き掃除', 'ベッドメイキング'] },
        { id: 'trash', defaultName: 'ごみ捨て', chores: ['ごみ捨て'] }
    ]
};

const BUTTON_RESET_MS = 4000;

// State variables (Unique keys to avoid collision)
let completedList = [];
let currentLayout = null;
let currentFloors = 1; 
let customRoomNames = {}; 
let playerCount = 1; // Default: 1 person

// Temporary setup variables
let tempLayout = null;
let tempFloors = 1;
let tempPlayers = 1;

// Stealth Companion State (2700 EXP Required for Lv.10)
let kajigonState = {
    totalExp: 0,
    firePoints: 0,
    waterPoints: 0,
    windPoints: 0,
    earthPoints: 0,
    endingSeen: false,
    lastLuckyDate: "",
    artifactCount: 0,
    forceSpecial: null,
    environmentTheme: "classic" // 'volcano' | 'abyss' | 'sky' | 'earth' | 'classic' | 'gameboy'
};

// ==========================================================================
// --- 🏛️ Environment Theme Definitions ---
// ==========================================================================
const ENVIRONMENT_THEMES = {
    'volcano': {
        id: 'volcano',
        name: '灼熱の火山',
        icon: '🌋',
        boostAttr: 'fire',
        boostLabel: '🔥火が育ちやすい (×1.3倍)',
        accent: '#ff4d4d',
        canvas: {
            base: '#221114',
            grain: '#2d161b',
            borderOuter: '#14080a',
            borderInner: '#e11d48',
            accent: '#ff4d4d',
            titleText: '#ff6b6b',
            corner: '#f43f5e'
        }
    },
    'abyss': {
        id: 'abyss',
        name: '深海の神殿',
        icon: '🌊',
        boostAttr: 'water',
        boostLabel: '💧水が育ちやすい (×1.3倍)',
        accent: '#38bdf8',
        canvas: {
            base: '#0c1626',
            grain: '#112238',
            borderOuter: '#060c17',
            borderInner: '#0284c7',
            accent: '#38bdf8',
            titleText: '#7dd3fc',
            corner: '#38bdf8'
        }
    },
    'sky': {
        id: 'sky',
        name: '天空の樹海',
        icon: '🍃',
        boostAttr: 'wind',
        boostLabel: '🍃風が育ちやすい (×1.3倍)',
        accent: '#10b981',
        canvas: {
            base: '#0f2017',
            grain: '#152d21',
            borderOuter: '#08140e',
            borderInner: '#059669',
            accent: '#10b981',
            titleText: '#6ee7b7',
            corner: '#34d399'
        }
    },
    'earth': {
        id: 'earth',
        name: '砂漠の巨石遺跡',
        icon: '🏜️',
        boostAttr: 'earth',
        boostLabel: '🪵土が育ちやすい (×1.3倍)',
        accent: '#f59e0b',
        canvas: {
            base: '#221811',
            grain: '#2c2017',
            borderOuter: '#140c08',
            borderInner: '#d97706',
            accent: '#f59e0b',
            titleText: '#fcd34d',
            corner: '#fbbf24'
        }
    },
    'classic': {
        id: 'classic',
        name: '星降る神殿（通常）',
        icon: '📜',
        boostAttr: null,
        boostLabel: '🌟全属性バランス育成',
        accent: '#f4ede2',
        canvas: {
            base: '#1c1b26',
            grain: '#232230',
            borderOuter: '#0d0d13',
            borderInner: '#8b5a2b',
            accent: '#c8924b',
            titleText: '#ffd700',
            corner: '#c8924b'
        }
    },
    'gameboy': {
        id: 'gameboy',
        name: '初代レトロ（GB調）',
        icon: '📟',
        boostAttr: null,
        boostLabel: '🎮ノスタルジー4階調',
        accent: '#9bbc0f',
        canvas: {
            base: '#1b2618',
            grain: '#243320',
            borderOuter: '#0d150c',
            borderInner: '#8bac0f',
            accent: '#9bbc0f',
            titleText: '#9bbc0f',
            corner: '#8bac0f'
        }
    }
};

// Lucky Chore
let luckyChore = "";

// ==========================================================================
// --- Initialize ---
// ==========================================================================
document.addEventListener('DOMContentLoaded', function () {
    loadFromLocalStorage();
    initApp();
});

function initApp() {
    const setupScreen = document.getElementById('setup-screen');
    const mainScreen = document.getElementById('main-screen');

    if (!currentLayout) {
        tempLayout = '1LDK';
        tempFloors = 1;
        tempPlayers = 1;
        updateSetupUI();
        setupScreen.classList.remove('hidden');
        mainScreen.classList.add('hidden');
    } else {
        setupScreen.classList.add('hidden');
        mainScreen.classList.remove('hidden');
        
        // Restore checkbox state
        const shareIncludeUndoneEl = document.getElementById('shareIncludeUndone');
        if (shareIncludeUndoneEl) {
            const savedSetting = localStorage.getItem('kajigonUltimate_shareIncludeUndone');
            if (savedSetting !== null) {
                shareIncludeUndoneEl.checked = savedSetting === 'true';
            }
        }

        // Initialize Daily Lucky Chore
        updateLuckyChore();
        
        renderQuickAddButtons();
        renderCompleted();
        const layoutDisp = document.getElementById('current-layout-display');
        if (layoutDisp) {
            layoutDisp.textContent = `現在のおうち: ${currentLayout} / ${currentFloors}フロア`;
        }
        
        // Update Artifact Indicator UI
        updateArtifactIndicator();
        
        // Apply retro theme on body
        applyTheme();

        // 初回の相棒表示
        updateCompanionWidget();

        // 突発ボス・名もなき家事討伐クエスト
        renderBountyWidget();

        // サウンドエンジンの初期化
        SoundEngine.init();

        // 🌟 カンスト(Lv.10)に達していてまだ表彰を見ていない場合は自動で表示
        if (getLevel() >= 10 && !kajigonState.endingSeen) {
            setTimeout(() => {
                triggerCutIn(getCompanionEmoji(), () => {
                    openEndingModal();
                });
            }, 500);
        }
    }
}

// --- Setup Screen Controls (3-Step) ---
function setSetupLayout(layout) {
    tempLayout = layout;
    updateSetupUI();
}

function setSetupFloors(floors) {
    tempFloors = floors;
    updateSetupUI();
}

function setSetupPlayers(players) {
    tempPlayers = players;
    updateSetupUI();
}

function updateSetupUI() {
    ['1ldk', '2ldk', '3ldk'].forEach(lay => {
        const btn = document.getElementById(`setup-${lay}`);
        if (btn) {
            if (lay === tempLayout.toLowerCase().replace('+', '')) btn.classList.add('active');
            else btn.classList.remove('active');
        }
    });

    [1, 2, 3].forEach(fl => {
        const btn = document.getElementById(`setup-floor${fl}`);
        if (btn) {
            if (fl === tempFloors) btn.classList.add('active');
            else btn.classList.remove('active');
        }
    });

    [1, 2, 3].forEach(pl => {
        const btn = document.getElementById(`setup-player${pl}`);
        if (btn) {
            if (pl === tempPlayers) btn.classList.add('active');
            else btn.classList.remove('active');
        }
    });
}

function submitSetup() {
    currentLayout = tempLayout;
    currentFloors = tempFloors;
    playerCount = tempPlayers;

    customRoomNames = {};
    const base = BASE_TEMPLATES[currentLayout];
    base.forEach(room => {
        customRoomNames[room.id] = room.defaultName;
    });

    saveToLocalStorage();
    initApp();
}

// ==========================================================================
// --- Settings⚙️ Dialog (In-app Setup & Room Customization) ---
// ==========================================================================
let tempSettingsEnvTheme = 'classic';

function openSettingsModal() {
    SoundEngine.playSE('click');
    const modal = document.getElementById('settings-modal');
    modal.classList.remove('hidden');
    
    document.getElementById('settings-layout-select').value = currentLayout;
    document.getElementById('settings-floor-select').value = currentFloors;
    document.getElementById('settings-players-select').value = playerCount;

    tempSettingsEnvTheme = kajigonState.environmentTheme || 'classic';
    renderSettingsThemeCards();
    generateSettingsRoomFields();
}

function renderSettingsThemeCards() {
    const container = document.getElementById('settings-theme-selector');
    if (!container) return;

    const currentLvl = getLevel();
    const isUnlocked = currentLvl >= 10;
    const currentTheme = kajigonState.environmentTheme || 'classic';

    // If level < 10, keep tempSettingsEnvTheme locked to the current theme
    if (!isUnlocked) {
        tempSettingsEnvTheme = currentTheme;
    }

    const noticeEl = document.getElementById('settings-theme-notice');
    if (noticeEl) {
        noticeEl.innerHTML = isUnlocked
            ? `<span style="color:#4caf50; font-weight:bold;">✨ Lv.10到達！次の滞在フィールドへ移動できます</span>`
            : `<span style="color:var(--text-sub,#888); font-size:11px;">🔒 現在の滞在フィールド（ポケモンスリープ仕様：Lv.10到達で次のフィールドへ移動可能 / 現在 Lv.${currentLvl}）</span>`;
    }

    container.innerHTML = Object.keys(ENVIRONMENT_THEMES).map(key => {
        const t = ENVIRONMENT_THEMES[key];
        const isCurrent = key === currentTheme;
        const isActive = tempSettingsEnvTheme === key;
        const isLocked = !isUnlocked && !isCurrent;

        return `
            <div class="theme-card-btn ${isActive ? 'active' : ''} ${isLocked ? 'locked-field' : ''}" 
                 onclick="selectSettingsTheme('${key}')"
                 style="${isLocked ? 'opacity: 0.55; cursor: not-allowed; filter: grayscale(0.5);' : ''}">
                <div class="theme-card-icon">${t.icon}</div>
                <div class="theme-card-name">${t.name} ${isCurrent ? '<span style="font-size:10px; color:#4caf50;">(滞在中)</span>' : (isLocked ? '<span style="font-size:10px; color:#e74c3c;">🔒Lv10</span>' : '')}</div>
                <div class="theme-card-boost">${t.boostLabel}</div>
            </div>
        `;
    }).join('');
}

function selectSettingsTheme(themeKey) {
    const currentLvl = getLevel();
    if (currentLvl < 10 && themeKey !== (kajigonState.environmentTheme || 'classic')) {
        SoundEngine.playSE('undo');
        showToast(`💤 ポケスリ仕様: 現在はこのフィールドで生活中です！Lv.10になると新しいフィールドへ旅立てます（現在 Lv.${currentLvl}）`);
        return;
    }
    SoundEngine.playSE('click');
    tempSettingsEnvTheme = themeKey;
    renderSettingsThemeCards();
}

function closeSettingsModal() {
    document.getElementById('settings-modal').classList.add('hidden');
}

function onSettingsLayoutChange() {
    generateSettingsRoomFields();
}

function generateSettingsRoomFields() {
    const layoutSelectVal = document.getElementById('settings-layout-select').value;
    const container = document.getElementById('settings-room-names-container');
    const base = BASE_TEMPLATES[layoutSelectVal];

    container.innerHTML = base.map(room => {
        const val = (layoutSelectVal === currentLayout && customRoomNames[room.id]) 
            ? customRoomNames[room.id] 
            : room.defaultName;

        return `
            <div class="settings-input-group">
                <label>${room.defaultName} の呼び名</label>
                <input type="text" id="roomname-${room.id}" value="${val}" placeholder="${room.defaultName}">
            </div>
        `;
    }).join('');
}

function saveSettings() {
    const newLayout = document.getElementById('settings-layout-select').value;
    const newFloors = parseInt(document.getElementById('settings-floor-select').value, 10);
    const newPlayers = parseInt(document.getElementById('settings-players-select').value, 10);
    
    const base = BASE_TEMPLATES[newLayout];
    const newNames = {};
    base.forEach(room => {
        const el = document.getElementById(`roomname-${room.id}`);
        if (el) {
            newNames[room.id] = el.value.trim() || room.defaultName;
        } else {
            newNames[room.id] = room.defaultName;
        }
    });

    if (newLayout !== currentLayout || newFloors !== currentFloors) {
        if (!window.confirm('間取りまたはフロア数を変更しますか？\n今日の「やったことリスト」はすべてクリアされますが、精霊の記録は引き継がれます。')) {
            return;
        }
        completedList = [];
    }

    currentLayout = newLayout;
    currentFloors = newFloors;
    playerCount = newPlayers;
    customRoomNames = newNames;
    if (getLevel() >= 10 && tempSettingsEnvTheme) {
        kajigonState.environmentTheme = tempSettingsEnvTheme;
    }

    saveToLocalStorage();
    closeSettingsModal();
    applyTheme();
    initApp();
}

// ==========================================================================
// --- Dynamic Buttons Rendering ---
// ==========================================================================
function getRoomIcon(roomId, roomName) {
    if (roomId === 'kitchen' || roomName.includes('キッチン')) return '🍳';
    if (roomId === 'bath' || roomName.includes('風呂')) return '🛁';
    if (roomId === 'laundry' || roomName.includes('洗濯')) return '👕';
    if (roomId === 'toilet' || roomName.includes('トイレ')) return '🚽';
    if (roomId === 'living' || roomName.includes('リビング')) return '🧹';
    if (roomId === 'washroom' || roomName.includes('洗面')) return '🪞';
    if (roomId === 'trash' || roomName.includes('ごみ')) return '🗑️';
    if (roomId === 'bedroom' || roomName.includes('寝室')) return '🛏️';
    if (roomId === 'stairs' || roomName.includes('階段')) return '🪜';
    return '🚪';
}

function renderQuickAddButtons() {
    const container = document.getElementById('quick-add-container');
    if (!container) return;
    const base = BASE_TEMPLATES[currentLayout];
    
    if (!base) return;

    // Get unique names of all chores done today
    const todayStr = getTodayDateString();
    const doneTodayNames = new Set(
        completedList
            .filter(c => getDateKey(c.time) === todayStr)
            .map(c => c.name)
    );

    // ⭐ Calculate frequently used / favorite chores
    const counts = {};
    completedList.forEach(c => {
        counts[c.name] = (counts[c.name] || 0) + 1;
    });
    let topChores = Object.keys(counts).sort((a, b) => counts[b] - counts[a]).slice(0, 3);
    if (topChores.length === 0) {
        topChores = ['キッチン：食器洗い', '洗面・洗濯：洗濯機を回す', 'リビング：掃除機がけ'];
    }

    const favHtml = `
        <div class="quick-add-section favorites-section" style="border-radius: 8px;">
            <span class="group-label" style="color: #ffd700;"><span>⭐</span> <span>よく使う家事</span></span>
            <div class="quick-add-buttons">
                ${topChores.map(choreName => {
                    const isDoneToday = doneTodayNames.has(choreName);
                    const stats = getChoreStats(choreName);
                    const attrClass = stats.attr ? `attr-${stats.attr}` : '';
                    const attrName = stats.attr || '';
                    const checkLabel = isDoneToday ? '<span class="done-check-badge">✔ 完了</span>' : '';
                    return `<button class="quick-add-btn ${attrClass} ${isDoneToday ? 'done' : ''}" ${isDoneToday ? 'disabled' : ''} onclick="addQuickChore('${choreName}', this)" onmouseenter="setTemporaryTheme('${attrName}')" onmouseleave="clearTemporaryTheme()">${choreName} ${checkLabel}</button>`;
                }).join('')}
            </div>
        </div>
    `;

    let sectionsHtml = base.map(section => {
        const customName = customRoomNames[section.id] || section.defaultName;
        const icon = getRoomIcon(section.id, customName);
        
        return `
            <div class="quick-add-section">
                <span class="group-label"><span>${icon}</span> <span>${customName}</span></span>
                <div class="quick-add-buttons">
                    ${section.chores.map(chore => {
                        const fullName = section.id === 'trash' ? chore : `${customName}：${chore}`;
                        const isDoneToday = doneTodayNames.has(fullName);
                        const stats = getChoreStats(fullName);
                        const attrClass = stats.attr ? `attr-${stats.attr}` : '';
                        const attrName = stats.attr || '';
                        const checkLabel = isDoneToday ? '<span class="done-check-badge">✔ 完了</span>' : '';
                        
                        return `<button class="quick-add-btn ${attrClass} ${isDoneToday ? 'done' : ''}" ${isDoneToday ? 'disabled' : ''} onclick="addQuickChore('${fullName}', this)" onmouseenter="setTemporaryTheme('${attrName}')" onmouseleave="clearTemporaryTheme()">${chore} ${checkLabel}</button>`;
                    }).join('')}
                </div>
            </div>
        `;
    }).join('');

    // 階数（フロア数）に応じた階段掃除ボタンの動的追加
    if (currentFloors >= 2) {
        let stairsHtml = `
            <div class="quick-add-section">
                <span class="group-label"><span>🪜</span> <span>階段</span></span>
                <div class="quick-add-buttons">
        `;

        if (currentFloors >= 2) {
            const stair1Sweep = '1F〜2F階段：掃き掃除';
            const stair1Wipe = '1F〜2F階段：拭き掃除';
            const doneSweep = doneTodayNames.has(stair1Sweep);
            const doneWipe = doneTodayNames.has(stair1Wipe);
            const checkSweep = doneSweep ? '<span class="done-check-badge">✔ 完了</span>' : '';
            const checkWipe = doneWipe ? '<span class="done-check-badge">✔ 完了</span>' : '';
            
            stairsHtml += `
                <button class="quick-add-btn attr-wind ${doneSweep ? 'done' : ''}" ${doneSweep ? 'disabled' : ''} onclick="addQuickChore('${stair1Sweep}', this)" onmouseenter="setTemporaryTheme('wind')" onmouseleave="clearTemporaryTheme()">1F〜2F階段 掃き ${checkSweep}</button>
                <button class="quick-add-btn attr-earth ${doneWipe ? 'done' : ''}" ${doneWipe ? 'disabled' : ''} onclick="addQuickChore('${stair1Wipe}', this)" onmouseenter="setTemporaryTheme('earth')" onmouseleave="clearTemporaryTheme()">1F〜2F階段 拭き ${checkWipe}</button>
            `;
        }
        if (currentFloors === 3) {
            const stair2Sweep = '2F〜3F階段：掃き掃除';
            const stair2Wipe = '2F〜3F階段：拭き掃除';
            const doneSweep2 = doneTodayNames.has(stair2Sweep);
            const doneWipe2 = doneTodayNames.has(stair2Wipe);
            const checkSweep2 = doneSweep2 ? '<span class="done-check-badge">✔ 完了</span>' : '';
            const checkWipe2 = doneWipe2 ? '<span class="done-check-badge">✔ 完了</span>' : '';
            
            stairsHtml += `
                <button class="quick-add-btn attr-wind ${doneSweep2 ? 'done' : ''}" ${doneSweep2 ? 'disabled' : ''} onclick="addQuickChore('${stair2Sweep}', this)" onmouseenter="setTemporaryTheme('wind')" onmouseleave="clearTemporaryTheme()">2F〜3F階段 掃き ${checkSweep2}</button>
                <button class="quick-add-btn attr-earth ${doneWipe2 ? 'done' : ''}" ${doneWipe2 ? 'disabled' : ''} onclick="addQuickChore('${stair2Wipe}', this)" onmouseenter="setTemporaryTheme('earth')" onmouseleave="clearTemporaryTheme()">2F〜3F階段 拭き ${checkWipe2}</button>
            `;
        }

        stairsHtml += `
                </div>
            </div>
        `;
        
        sectionsHtml += stairsHtml;
    }

    container.innerHTML = favHtml + sectionsHtml;
}

// ==========================================================================
// --- LocalStorage Functions (安全なデータパース処理で競合バグを完全防止) ---
// ==========================================================================
function saveToLocalStorage() {
    const appData = { completedList, currentLayout, currentFloors, customRoomNames, playerCount };
    localStorage.setItem('kajigonUltimate_kajigonState', JSON.stringify(appData));
    localStorage.setItem('kajigonUltimate_status', JSON.stringify(kajigonState));
}

function loadFromLocalStorage() {
    let savedApp = localStorage.getItem('kajigonUltimate_kajigonState');
    if (!savedApp) {
        savedApp = localStorage.getItem('kajigonUltimate_yattayoState');
    }
    if (savedApp) {
        try {
            const data = JSON.parse(savedApp);
            completedList = data.completedList || [];
            currentLayout = data.currentLayout || null;
            currentFloors = data.currentFloors || 1;
            customRoomNames = data.customRoomNames || {};
            playerCount = data.playerCount !== undefined ? data.playerCount : 1;

            // --- Migration logic to split Bath and Laundry ---
            let migrated = false;
            if (customRoomNames['bath'] === 'お風呂・洗濯') {
                customRoomNames['bath'] = 'お風呂';
                migrated = true;
            }
            if (currentLayout && !customRoomNames['laundry']) {
                customRoomNames['laundry'] = '洗濯';
                migrated = true;
            }
            completedList.forEach(chore => {
                if (chore.name && chore.name.startsWith('お風呂・洗濯：')) {
                    const cleanChoreName = chore.name.replace('お風呂・洗濯：', '');
                    if (cleanChoreName === '洗濯' || cleanChoreName === '洗濯物を干す' || cleanChoreName === '洗濯物を畳む') {
                        chore.name = `洗濯：${cleanChoreName}`;
                    } else {
                        chore.name = `お風呂：${cleanChoreName}`;
                    }
                    migrated = true;
                }
            });
            if (migrated) {
                setTimeout(() => saveToLocalStorage(), 100);
            }
        } catch (e) {
            console.error("Failed to parse kajigonState:", e);
            completedList = [];
            currentLayout = null;
            currentFloors = 1;
            customRoomNames = {};
            playerCount = 1;
        }
    } else {
        playerCount = 1;
    }

    const savedKajigon = localStorage.getItem('kajigonUltimate_status');
    if (savedKajigon) {
        try {
            const parsed = JSON.parse(savedKajigon);
            kajigonState = {
                totalExp: parsed.totalExp || 0,
                firePoints: parsed.firePoints || 0,
                waterPoints: parsed.waterPoints || 0,
                windPoints: parsed.windPoints || 0,
                earthPoints: parsed.earthPoints || 0,
                endingSeen: parsed.endingSeen !== undefined ? parsed.endingSeen : false,
                lastLuckyDate: parsed.lastLuckyDate || "",
                artifactCount: parsed.artifactCount !== undefined ? parsed.artifactCount : 0,
                forceSpecial: parsed.forceSpecial !== undefined ? parsed.forceSpecial : null,
                environmentTheme: parsed.environmentTheme || "classic"
            };
        } catch (e) {
            console.error("Failed to parse status:", e);
            kajigonState = {
                totalExp: 0,
                firePoints: 0,
                waterPoints: 0,
                windPoints: 0,
                earthPoints: 0,
                endingSeen: false,
                lastLuckyDate: "",
                artifactCount: 0,
                forceSpecial: null,
                environmentTheme: "classic"
            };
        }
    } else {
        kajigonState = {
            totalExp: 0,
            firePoints: 0,
            waterPoints: 0,
            windPoints: 0,
            earthPoints: 0,
            endingSeen: false,
            lastLuckyDate: "",
            artifactCount: 0,
            forceSpecial: null,
            environmentTheme: "classic"
        };
    }
}

// ==========================================================================
// --- Core Game/Chore Logic & Balanced Scaling ---
// ==========================================================================
function getChoreStats(choreName) {
    // [物品補充]
    if (choreName.startsWith('[物品補充]')) {
        return { exp: 20, attr: 'earth', pt: 2, isOther: false };
    }
    // [その他]
    if (choreName.startsWith('[その他]')) {
        return { exp: 15, attr: 'other', pt: 1, isOther: true };
    }

    // 掃き掃除と拭き掃除の判定
    if (choreName.includes('掃き掃除')) {
        return { exp: 30, attr: 'wind', pt: 3, isOther: false };
    }
    if (choreName.includes('拭き掃除')) {
        return { exp: 30, attr: 'earth', pt: 3, isOther: false };
    }

    const cleanName = choreName.includes('：') ? choreName.split('：')[1] : choreName;

    // 火属性 (大掃除・低頻度 ➔ 配点特大)
    if (cleanName === 'シンクの掃除' || cleanName === 'コンロの掃除') {
        return { exp: 80, attr: 'fire', pt: 8, isOther: false };
    }
    // 水属性 (混合 ➔ 日常は極小、大掃除は特大)
    if (cleanName === '浴槽・浴室の掃除') {
        return { exp: 80, attr: 'water', pt: 8, isOther: false };
    }
    if (cleanName === 'トイレ掃除') {
        return { exp: 40, attr: 'water', pt: 4, isOther: false };
    }
    if (cleanName === '洗濯' || cleanName === '洗面台の掃除') {
        return { exp: 30, attr: 'water', pt: 3, isOther: false };
    }
    if (cleanName === '食器洗い') {
        return { exp: 5, attr: 'water', pt: 0.5, isOther: false }; // 超高頻度は極小に抑える
    }
    // 風属性 (中頻度)
    if (cleanName === '掃除機がけ') {
        return { exp: 30, attr: 'wind', pt: 3, isOther: false };
    }
    if (cleanName === 'タオル交換') {
        return { exp: 10, attr: 'wind', pt: 1, isOther: false }; 
    }
    if (cleanName === '料理') {
        return { exp: 30, attr: 'fire', pt: 3, isOther: false };
    }
    if (cleanName === '洗濯物を干す') {
        return { exp: 30, attr: 'fire', pt: 3, isOther: false };
    }
    if (cleanName === '洗濯物を畳む') {
        return { exp: 30, attr: 'earth', pt: 3, isOther: false };
    }
    // 土属性
    if (cleanName === 'ごみ捨て') {
        return { exp: 10, attr: 'earth', pt: 1, isOther: false }; 
    }
    if (cleanName === 'ベッドメイキング') {
        return { exp: 80, attr: 'earth', pt: 8, isOther: false }; 
    }

    // フォールバック
    return { exp: 10, attr: null, pt: 1, isOther: false };
}

function addChoreExp(choreName) {
    const previousLevel = getLevel();
    const stats = getChoreStats(choreName);
    
    // Scale experience based on player count
    const scaleCount = playerCount || 1;
    const playerMultiplier = scaleCount === 2 ? 1.5 : (scaleCount >= 3 ? 2.0 : 1.0);
    
    let baseExp = stats.exp;
    let expToAdd = baseExp * playerMultiplier;
    let wasLucky = false;
    
    const todayStr = getTodayDateString();
    const cleanName = choreName.includes('：') ? choreName.split('：')[1] : choreName;
    
    // Apply 1.2x Lucky Chore Bonus if not already completed today
    if (cleanName === luckyChore) {
        if (kajigonState.lastLuckyDate !== todayStr) {
            expToAdd = expToAdd * 1.2;
            kajigonState.lastLuckyDate = todayStr;
            wasLucky = true;
        }
    }
    
    const finalExp = Math.round(expToAdd);
    kajigonState.totalExp += finalExp;
    
    const currentEnv = ENVIRONMENT_THEMES[kajigonState.environmentTheme || 'classic'];
    const boostAttr = currentEnv ? currentEnv.boostAttr : null;

    if (stats.isOther) {
        kajigonState.firePoints += stats.pt;
        kajigonState.waterPoints += stats.pt;
        kajigonState.windPoints += stats.pt;
        kajigonState.earthPoints += stats.pt;
    } else if (stats.attr === 'fire') {
        const bonus = (boostAttr === 'fire') ? Math.round(stats.pt * 1.3) : stats.pt;
        kajigonState.firePoints += bonus;
    } else if (stats.attr === 'water') {
        const bonus = (boostAttr === 'water') ? Math.round(stats.pt * 1.3) : stats.pt;
        kajigonState.waterPoints += bonus;
    } else if (stats.attr === 'wind') {
        const bonus = (boostAttr === 'wind') ? Math.round(stats.pt * 1.3) : stats.pt;
        kajigonState.windPoints += bonus;
    } else if (stats.attr === 'earth') {
        const bonus = (boostAttr === 'earth') ? Math.round(stats.pt * 1.3) : stats.pt;
        kajigonState.earthPoints += bonus;
    }

    // 0.5% surprise chance to force light/dark evolution
    if (!kajigonState.forceSpecial) {
        if (Math.random() < 0.005) {
            const flag = Math.random() < 0.5 ? 'light' : 'dark';
            kajigonState.forceSpecial = flag;
            setTimeout(() => {
                showCompanionDialogue(`「総監督！何やら不思議な気配を感じます…進化の運命が変わるかも？」`);
            }, 1500);
        }
    }

    // Artifact collection drop logic
    if (wasLucky && kajigonState.artifactCount < 3) {
        if (Math.random() < 0.5) {
            kajigonState.artifactCount++;
            setTimeout(() => {
                SoundEngine.playSE('artifact');
                showCompanionDialogue(`「総監督！部屋の隅で珍しい古代パーツ（⚙️）を拾いました！」`);
                triggerArtifactFlash();
                updateArtifactIndicator();
            }, 1000);
        }
    }

    const newLevel = getLevel();

    saveToLocalStorage();
    applyTheme();
    updateCompanionWidget();
    updateLuckyChore();

    // 🌟 最終進化(レベル10以上)に達した瞬間に、即座に感動の表彰画面を大出現させる！
    if (newLevel >= 10 && previousLevel < 10) {
        kajigonState.endingSeen = false; // Reset seen so it triggers automatically
        saveToLocalStorage();
        SoundEngine.playSE('levelup');
        triggerCutIn(getCompanionEmoji(), () => {
            openEndingModal();
        });
    } else if (newLevel > previousLevel) {
        SoundEngine.playSE('levelup');
    } else if (wasLucky) {
        SoundEngine.playSE('lucky');
    } else {
        SoundEngine.playSE('done');
    }
    
    return { finalExp, wasLucky };
}

function undoChoreExp(chore) {
    let expToSubtract = 0;
    let stats = null;
    
    if (typeof chore === 'string') {
        stats = getChoreStats(chore);
        const scaleCount = playerCount || 1;
        const playerMultiplier = scaleCount === 2 ? 1.5 : (scaleCount >= 3 ? 2.0 : 1.0);
        expToSubtract = Math.round(stats.exp * playerMultiplier);
    } else {
        stats = getChoreStats(chore.name);
        expToSubtract = chore.gainedExp !== undefined ? chore.gainedExp : stats.exp;
        if (chore.isLucky) {
            kajigonState.lastLuckyDate = "";
        }
    }

    kajigonState.totalExp = Math.max(0, kajigonState.totalExp - expToSubtract);
    
    if (stats.isOther) {
        kajigonState.firePoints = Math.max(0, kajigonState.firePoints - stats.pt);
        kajigonState.waterPoints = Math.max(0, kajigonState.waterPoints - stats.pt);
        kajigonState.windPoints = Math.max(0, kajigonState.windPoints - stats.pt);
        kajigonState.earthPoints = Math.max(0, kajigonState.earthPoints - stats.pt);
    } else if (stats.attr === 'fire') {
        kajigonState.firePoints = Math.max(0, kajigonState.firePoints - stats.pt);
    } else if (stats.attr === 'water') {
        kajigonState.waterPoints = Math.max(0, kajigonState.waterPoints - stats.pt);
    } else if (stats.attr === 'wind') {
        kajigonState.windPoints = Math.max(0, kajigonState.windPoints - stats.pt);
    } else if (stats.attr === 'earth') {
        kajigonState.earthPoints = Math.max(0, kajigonState.earthPoints - stats.pt);
    }

    saveToLocalStorage();
    applyTheme();
    updateCompanionWidget();
    updateLuckyChore();
}

// ==========================================================================
// --- Chore Interactive Logic ---
// ==========================================================================
function addQuickChore(choreName, buttonElement) {
    const id = Date.now();
    const { finalExp, wasLucky } = addChoreExp(choreName);
    completedList.unshift({ id, name: choreName, time: id, gainedExp: finalExp, isLucky: wasLucky });
    
    saveToLocalStorage();
    renderCompleted();
    renderQuickAddButtons(); // Refresh buttons to disable the clicked one
    triggerFortuneToast(wasLucky);
}

function addFreeSupply() {
    const input = document.getElementById('freeSupplyInput');
    const text = input.value.trim();
    if (text) {
        const choreName = `[物品補充] ${text}`;
        const id = Date.now();
        const { finalExp, wasLucky } = addChoreExp(choreName);
        completedList.unshift({ id, name: choreName, time: id, gainedExp: finalExp, isLucky: wasLucky });
        
        input.value = '';
        saveToLocalStorage();
        renderCompleted();
        triggerFortuneToast(wasLucky);
    }
}

function addOtherChore() {
    const input = document.getElementById('otherChoreInput');
    const text = input.value.trim();
    if (text) {
        const choreName = `[その他] ${text}`;
        const id = Date.now();
        const { finalExp, wasLucky } = addChoreExp(choreName);
        completedList.unshift({ id, name: choreName, time: id, gainedExp: finalExp, isLucky: wasLucky });

        input.value = '';
        saveToLocalStorage();
        renderCompleted();
        triggerFortuneToast(wasLucky);
    }
}

function undoDone(id) {
    SoundEngine.playSE('undo');
    const found = completedList.find(c => c.id === id);
    if (found) {
        undoChoreExp(found);
    }
    completedList = completedList.filter(c => c.id !== id);
    saveToLocalStorage();
    renderCompleted();
    renderQuickAddButtons(); // Re-enable button
}

function undoGroup(idsStr) {
    SoundEngine.playSE('undo');
    const ids = idsStr.split(',').map(Number);
    ids.forEach(id => {
        const found = completedList.find(c => c.id === id);
        if (found) {
            undoChoreExp(found);
        }
    });
    completedList = completedList.filter(c => !ids.includes(c.id));
    saveToLocalStorage();
    renderCompleted();
    renderQuickAddButtons(); // Re-enable buttons
}

// 2-Type Reset
function resetDayOnly() {
    if (window.confirm('本日の家事の記録を整理（クリア）しますか？\n※これまでの成長データは失われません。')) {
        SoundEngine.playSE('undo');
        completedList = [];
        saveToLocalStorage();
        renderCompleted();
        renderQuickAddButtons(); // Re-enable all buttons
    }
}

function resetAppFully() {
    if (window.confirm('本当にアプリのすべての設定とデータを完全初期化しますか？\n家事履歴、カスタム部屋名、および裏の成長データが完全にリセットされます。')) {
        completedList = [];
        currentLayout = null;
        currentFloors = 1;
        playerCount = 1;
        customRoomNames = {};
        
        kajigonState = {
            totalExp: 0,
            firePoints: 0,
            waterPoints: 0,
            windPoints: 0,
            earthPoints: 0,
            endingSeen: false,
            lastLuckyDate: "",
            artifactCount: 0,
            forceSpecial: null
        };
        
        saveToLocalStorage();
        renderCompleted();
        initApp();
    }
}

// ==========================================================================
// --- Render Completed List ---
// ==========================================================================
function renderCompleted() {
    const container = document.getElementById('completedList');
    if (!container) return;
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

    // Find today's MVP chore
    const todayDateStr = getTodayDateString();
    let todayMvpName = "";
    let todayMaxPt = 0;
    completedList
        .filter(c => getDateKey(c.time) === todayDateStr)
        .forEach(c => {
            const st = getChoreStats(c.name);
            if (st.pt > todayMaxPt) {
                todayMaxPt = st.pt;
                todayMvpName = c.name;
            }
        });

    container.innerHTML = groupOrder.map(key => {
        const group = groupMap[key];
        const items = [...group.items].reverse();
        const latestTime = group.items[0].time;

        if (items.length === 1) {
            const chore = items[0];
            const stats = getChoreStats(chore.name);
            const attrClass = stats.attr ? `attr-${stats.attr}` : '';
            const isSupply = chore.name.startsWith('[物品補充]');
            const isOther = chore.name.startsWith('[その他]');
            const isMvp = (chore.name === todayMvpName && todayMaxPt >= 3);
            const displayName = chore.name
                .replace(/^\[物品補充\]\s*/, '')
                .replace(/^\[その他\]\s*/, '');

            return `
                <div class="chore-item-completed ${attrClass}">
                    <div class="chore-item-completed-info">
                        <span class="chore-item-completed-name">
                            ${isSupply ? '<span class="chore-item-completed-tag">補充</span>' : ''}
                            ${isOther ? '<span class="chore-item-completed-tag tag-other">その他</span>' : ''}
                            ${displayName}
                            ${isMvp ? '<span class="mvp-badge">👑 MVP</span>' : ''}
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
            const stats = getChoreStats(items[0].name);
            const attrClass = stats.attr ? `attr-${stats.attr}` : '';
            const hasMvp = items.some(it => it.name === todayMvpName && todayMaxPt >= 3);

            return `
                <div class="chore-item-completed ${attrClass}">
                    <div class="chore-item-completed-info">
                        <span class="chore-item-completed-name">
                            ${space}：${actions}
                            ${hasMvp ? '<span class="mvp-badge">👑 MVP</span>' : ''}
                        </span>
                        <span class="chore-item-completed-time">${formatTime(latestTime)}</span>
                    </div>
                    <button class="btn-undo" onclick="undoGroup('${allIds}')">取消</button>
                </div>`;
        }
    }).join('');
}

// ==========================================================================
// --- Utils ---
// ==========================================================================
function getDateKey(timestamp) {
    if (!timestamp) return "";
    const d = new Date(timestamp);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
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

function getTodayDateString() {
    return getDateKey(Date.now());
}

/**
 * 完了履歴の描画で呼び出される、timestampをHH:mm形式に安全に変換する関数
 */
function formatTime(timestamp) {
    if (!timestamp) return "";
    try {
        const d = new Date(timestamp);
        if (isNaN(d.getTime())) return "";
        const h = String(d.getHours()).padStart(2, '0');
        const m = String(d.getMinutes()).padStart(2, '0');
        return `${h}:${m}`;
    } catch (e) {
        return "";
    }
}

// ==========================================================================
// --- Companion Core Logic (Quiet, Simple & Absolute Surprise) ---
// ==========================================================================
function getLevel() {
    // 2x Speed: 1350 EXP Required for Lv.10 (150 EXP per level)
    return Math.min(10, Math.floor(kajigonState.totalExp / 150) + 1);
}

function getCompanionStage(level) {
    if (level <= 2) return 'egg';
    if (level <= 5) return 'baby';
    if (level <= 9) return 'teen';
    return 'final';
}

function getCompanionEmoji() {
    const lv = getLevel();
    const stage = getCompanionStage(lv);

    if (stage === 'egg') {
        return '🥚';
    }

    const pts = [
        { attr: 'fire', val: kajigonState.firePoints },
        { attr: 'water', val: kajigonState.waterPoints },
        { attr: 'wind', val: kajigonState.windPoints },
        { attr: 'earth', val: kajigonState.earthPoints }
    ];

    const maxVal = Math.max(...pts.map(p => p.val));
    if (maxVal === 0) {
        return stage === 'baby' ? '🐣' : (stage === 'teen' ? '👾' : '🐉');
    }

    // Stable fair pseudo-random tie-breaker based on totalExp seed
    const maxPtsList = pts.filter(p => p.val === maxVal);
    const seed = kajigonState.totalExp;
    const winner = maxPtsList[seed % maxPtsList.length].attr;

    if (stage === 'baby') {
        switch (winner) {
            case 'fire': return '🦎';
            case 'water': return '🐙';
            case 'wind': return '🐥';
            case 'earth': return '🐢';
            default: return '🐣';
        }
    } else if (stage === 'teen') {
        switch (winner) {
            case 'fire': return '🦖';
            case 'water': return '🐬';
            case 'wind': return '🦅';
            case 'earth': return '🐗';
            default: return '👾';
        }
    } else {
        const evolved = getEvolvedForm();
        return evolved.attr === 'light' ? '🐉' : (evolved.attr === 'dark' ? '🤖' : '🐉');
    }
}

// 2つの絵文字を使ってどの属性なのか・どの進化段階なのかわかるようにする
function getCompanionEmojiString() {
    const companion = getCompanionEmoji();
    const lv = getLevel();
    if (lv <= 2 && kajigonState.totalExp === 0) {
        return '🥚✨';
    }

    // 現在最も高い属性シンボルを決定
    const pts = [
        { attr: 'fire', val: kajigonState.firePoints, symbol: '🔥' },
        { attr: 'water', val: kajigonState.waterPoints, symbol: '💧' },
        { attr: 'wind', val: kajigonState.windPoints, symbol: '🍃' },
        { attr: 'earth', val: kajigonState.earthPoints, symbol: '🪵' }
    ];

    const maxVal = Math.max(...pts.map(p => p.val));
    if (maxVal === 0) {
        return companion + '✨';
    }

    if (lv >= 10) {
        const evolved = getEvolvedForm();
        if (evolved.attr === 'light') return '🐉🌟';
        if (evolved.attr === 'dark') return '🤖👿';
        const symbolMap = { fire: '🔥', water: '💧', wind: '🍃', earth: '🪵' };
        return (evolved.attr === 'fire' || evolved.attr === 'water' || evolved.attr === 'wind' || evolved.attr === 'earth')
            ? (evolved.file.includes('golem') ? '🤖' : '🐉') + symbolMap[evolved.attr]
            : '🐉🌟';
    }

    const maxPtsList = pts.filter(p => p.val === maxVal);
    const seed = kajigonState.totalExp;
    const winner = maxPtsList[seed % maxPtsList.length];
    const symbol = winner ? winner.symbol : '✨';
    return companion + symbol;
}

// 👾 相棒表示（絵文字とドット絵画像を静かに表示。カンスト時は「みなおす」「そだてなおす」ボタンを出現！）
function updateCompanionWidget() {
    const widget = document.getElementById('companion-status-widget');
    if (!widget || !currentLayout) return;

    const lv = getLevel();
    const stage = getCompanionStage(lv);
    const emojisStr = getCompanionEmojiString();

    let companionImgHtml = '';
    if (stage === 'egg') {
        companionImgHtml = `<div class="companion-avatar-emoji">🥚</div>`;
    } else if (stage === 'baby') {
        companionImgHtml = `
            <img class="companion-avatar-img" src="kajigon_baby.png" alt="ベビーカジゴン" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
            <div class="companion-avatar-emoji" style="display:none;">🐣</div>
        `;
    } else if (stage === 'teen') {
        const envTheme = kajigonState.environmentTheme || 'classic';
        const teenMap = {
            volcano: { file: 'teen_fire.png', name: '溶岩ティーン', emoji: '🔥' },
            abyss: { file: 'teen_water.png', name: '深海ティーン', emoji: '💧' },
            sky: { file: 'teen_wind.png', name: '樹海ティーン', emoji: '🍃' },
            earth: { file: 'teen_earth.png', name: '遺跡ティーン', emoji: '🪵' },
            classic: { file: 'teen_light.png', name: 'ルクスティーン', emoji: '🌟' },
            gameboy: { file: 'teen_retro.png', name: 'GBティーン', emoji: '📟' }
        };
        const currentTeen = teenMap[envTheme] || teenMap.classic;
        companionImgHtml = `
            <img class="companion-avatar-img" src="${currentTeen.file}" alt="${currentTeen.name}" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
            <div class="companion-avatar-emoji" style="display:none;">${currentTeen.emoji}</div>
        `;
    } else { // final
        const selected = getEvolvedForm();
        companionImgHtml = `
            <img class="companion-avatar-img" src="${selected.file}" alt="${selected.name}" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
            <div class="companion-avatar-emoji" style="display:none;">${selected.attr === 'dark' ? '🤖' : '🐉'}</div>
        `;
    }

    // Update top room status badge
    const statusNameEl = document.getElementById('room-status-name');
    const statusExpEl = document.getElementById('room-status-exp');
    if (statusNameEl) {
        statusNameEl.textContent = `✅ カジゴン (LV.${lv}) ${emojisStr}`;
    }
    if (statusExpEl) {
        const nextLvExp = (typeof LEVEL_THRESHOLDS !== 'undefined' && LEVEL_THRESHOLDS[lv]) ? LEVEL_THRESHOLDS[lv] : 100;
        statusExpEl.textContent = `EXP: ${kajigonState.totalExp || 0} (ステージ: ${stage.toUpperCase()})`;
    }

    // Update floor furniture visibility according to progress
    const plantEl = document.getElementById('furniture-plant');
    const stewEl = document.getElementById('furniture-stew');
    const shelfEl = document.getElementById('furniture-shelf');
    const totalDone = completedList.length;

    if (plantEl) plantEl.style.display = totalDone >= 2 ? 'block' : 'none';
    if (stewEl) stewEl.style.display = totalDone >= 12 ? 'block' : 'none';
    if (shelfEl) {
        if (totalDone >= 4 && typeof getCurrentSeasonalFurniture === 'function') {
            const seasonals = getCurrentSeasonalFurniture();
            shelfEl.textContent = seasonals[0].icon;
            shelfEl.title = `[季節] ${seasonals[0].name}`;
            shelfEl.style.display = 'block';
        } else {
            shelfEl.style.display = 'none';
        }
    }

    // Check if bounty quest cleared to hide/show notification ping
    const questBadge = document.getElementById('side-quest-badge');
    if (questBadge && typeof getTodayBounty === 'function') {
        const { defeated } = getTodayBounty();
        if (defeated) questBadge.classList.add('hidden');
        else questBadge.classList.remove('hidden');
    }

    widget.innerHTML = `
        <div style="width: 100%; height: 100%; display:flex; align-items:center; justify-content:center;">
            ${companionImgHtml}
        </div>
    `;
}

// 🔄 卵からそだてなおす (Reset growth data only)
function rebreedCompanion() {
    SoundEngine.playSE('click');
    if (window.confirm('現在の守護精霊を「そだてなおす」しますか？\nこれまでの経験値や属性ポイントがリセットされ、新しく卵（🥚）から育て直すことができます。\n※今日の家事履歴やカスタム部屋名は消えません。')) {
        if (getLevel() >= 10) {
            recordToEncyclopedia(getEvolvedForm());
        }
        const themeChoice = window.prompt(
            '次の世代の育成環境テーマを選択してください：\n1: 🌋 灼熱の火山 (🔥火UP)\n2: 🌊 深海の神殿 (💧水UP)\n3: 🍃 天空の樹海 (🍃風UP)\n4: 🏜️ 砂漠の巨石遺跡 (🪵土UP)\n5: 📜 星降る神殿 (全属性バランス)\n6: 📟 初代レトロ (GB調)\n※半角数字 1〜6 を入力（キャンセルで現状維持）',
            '1'
        );

        let newEnvTheme = kajigonState.environmentTheme || 'classic';
        if (themeChoice === '1') newEnvTheme = 'volcano';
        else if (themeChoice === '2') newEnvTheme = 'abyss';
        else if (themeChoice === '3') newEnvTheme = 'sky';
        else if (themeChoice === '4') newEnvTheme = 'earth';
        else if (themeChoice === '5') newEnvTheme = 'classic';
        else if (themeChoice === '6') newEnvTheme = 'gameboy';

        kajigonState = {
            totalExp: 0,
            firePoints: 0,
            waterPoints: 0,
            windPoints: 0,
            earthPoints: 0,
            endingSeen: false,
            lastLuckyDate: "",
            artifactCount: 0,
            forceSpecial: null,
            environmentTheme: newEnvTheme
        };
        
        saveToLocalStorage();
        applyTheme();
        updateArtifactIndicator();
        updateCompanionWidget();
        updateLuckyChore();

        // 卵出現のカットイン演出
        triggerCutIn('🥚', () => {
            const chosen = ENVIRONMENT_THEMES[newEnvTheme];
            alert(`守護精霊は旅立ち、おうちへ新しく卵が届きました！\n新環境：${chosen.icon} ${chosen.name} (${chosen.boostLabel})`);
        });
    }
}

// ==========================================================================
// --- Share & Cryptographic Spell Generation ---
// ==========================================================================
function generateSpellText() {
    const lv = getLevel();
    return `KJ-LV${lv}-F${Math.round(kajigonState.firePoints)}-W${Math.round(kajigonState.waterPoints)}-A${Math.round(kajigonState.windPoints)}-E${Math.round(kajigonState.earthPoints)}`;
}

function shareReport() {
    const todayStr = getTodayDateString();
    
    const doneNames = new Set(
        completedList
            .filter(c => getDateKey(c.time) === todayStr)
            .map(c => c.name)
    );

    const base = BASE_TEMPLATES[currentLayout];
    const allTemplateChores = [];
    
    base.forEach(section => {
        const customName = customRoomNames[section.id] || section.defaultName;
        section.chores.forEach(chore => {
            const fullName = section.id === 'trash' ? chore : `${customName}：${chore}`;
            allTemplateChores.push(fullName);
        });
    });

    if (currentFloors >= 2) {
        allTemplateChores.push('1F〜2F階段：掃き掃除');
        allTemplateChores.push('1F〜2F階段：拭き掃除');
    }
    if (currentFloors === 3) {
        allTemplateChores.push('2F〜3F階段：掃き掃除');
        allTemplateChores.push('2F〜3F階段：拭き掃除');
    }

    // Find MVP chore (highest pt)
    let mvpChoreName = "";
    let maxPt = 0;
    doneNames.forEach(name => {
        const stats = getChoreStats(name);
        if (stats.pt > maxPt) {
            maxPt = stats.pt;
            mvpChoreName = name;
        }
    });

    let doneText = Array.from(doneNames).map(name => {
        const isMvp = (name === mvpChoreName && maxPt >= 3);
        return isMvp ? `・${name} 👑(本日のMVP家事!)` : `・${name}`;
    }).join('\n');
    if (!doneText) doneText = '（まだありません）';

    // Conditionally include undone chores
    const shareIncludeUndoneEl = document.getElementById('shareIncludeUndone');
    const includeUndone = shareIncludeUndoneEl ? shareIncludeUndoneEl.checked : true;
    
    let undoneSection = "";
    if (includeUndone) {
        const todoChores = allTemplateChores.filter(name => !doneNames.has(name));
        let todoText = todoChores.map(name => `・${name}`).join('\n');
        if (!todoText) todoText = '（すべて完了！）';
        undoneSection = `\n\n⬜️ まだやってないこと\n${todoText}`;
    }

    const message = document.getElementById('shareMessage').value.trim();
    const messageText = message ? `\n\n🙏 伝言・お願い\n${message}` : '';

    const dinnerMenuEl = document.getElementById('shareDinnerMenu');
    const dinnerMenu = dinnerMenuEl ? dinnerMenuEl.value.trim() : '';
    const dinnerText = dinnerMenu ? `\n\n🍳 今日・今夜のごはん\n${dinnerMenu}` : '';

    const shareIncludeThanksEl = document.getElementById('shareIncludeThanks');
    const includeThanks = shareIncludeThanksEl ? shareIncludeThanksEl.checked : true;
    const thanksText = includeThanks ? `\n\n💌 家族からの返信・感謝スタンプ\n[いつもありがとう！💖 / 大助かり！🌟 / お疲れさま！🍵]` : '';

    const spell = generateSpellText();
    const reportText = `🏠 今日の家事レポート\n\n✅ やったこと\n${doneText}${undoneSection}${dinnerText}${messageText}${thanksText}\n\n💾同期用バックアップキー: ${spell}`;

    navigator.clipboard.writeText(reportText).then(() => {
        SoundEngine.playSE('click');
        alert('レポートと同期キーをコピーしました！LINEなどに貼り付けて送信できます。');
    }).catch(err => {
        console.error("コピー失敗:", err);
        alert('コピーに失敗しました。');
    });
}

// ==========================================================================
// --- 🔮 同期コード入力ダイアログの制御 ---
// ==========================================================================
function openSpellModal() {
    if (getLevel() >= 10) {
        openEndingModal();
        return;
    }

    document.getElementById('spell-modal').classList.remove('hidden');
    document.getElementById('spellInput').value = '';
    document.getElementById('spellInput').focus();
}

function closeSpellModal() {
    document.getElementById('spell-modal').classList.add('hidden');
}

// ==========================================================================
// --- 呪文同期 (復号) ---
// ==========================================================================
function castSpell() {
    const spell = document.getElementById('spellInput').value.trim();
    
    // Support Developer Test Keys
    const testMatch = spell.match(/^TEST-(FIRE|WATER|WIND|EARTH|ULTIMA|DARK|GOLEM-FIRE|GOLEM-WATER|GOLEM-WIND|GOLEM-EARTH)$/i);
    if (testMatch) {
        const type = testMatch[1].toUpperCase();
        kajigonState.totalExp = 1350; // Max Level (Level 10)
        kajigonState.endingSeen = false;
        
        if (type === 'FIRE') {
            kajigonState.firePoints = 100; kajigonState.waterPoints = 0; kajigonState.windPoints = 0; kajigonState.earthPoints = 0;
            kajigonState.artifactCount = 0; kajigonState.forceSpecial = null;
        } else if (type === 'WATER') {
            kajigonState.firePoints = 0; kajigonState.waterPoints = 100; kajigonState.windPoints = 0; kajigonState.earthPoints = 0;
            kajigonState.artifactCount = 0; kajigonState.forceSpecial = null;
        } else if (type === 'WIND') {
            kajigonState.firePoints = 0; kajigonState.waterPoints = 0; kajigonState.windPoints = 100; kajigonState.earthPoints = 0;
            kajigonState.artifactCount = 0; kajigonState.forceSpecial = null;
        } else if (type === 'EARTH') {
            kajigonState.firePoints = 0; kajigonState.waterPoints = 0; kajigonState.windPoints = 0; kajigonState.earthPoints = 100;
            kajigonState.artifactCount = 0; kajigonState.forceSpecial = null;
        } else if (type === 'ULTIMA') {
            kajigonState.firePoints = 50; kajigonState.waterPoints = 50; kajigonState.windPoints = 50; kajigonState.earthPoints = 50;
            kajigonState.artifactCount = 0; kajigonState.forceSpecial = null;
        } else if (type === 'DARK') {
            kajigonState.firePoints = 50; kajigonState.waterPoints = 50; kajigonState.windPoints = 50; kajigonState.earthPoints = 50;
            kajigonState.artifactCount = 3; kajigonState.forceSpecial = null;
        } else if (type === 'GOLEM-FIRE') {
            kajigonState.firePoints = 100; kajigonState.waterPoints = 0; kajigonState.windPoints = 0; kajigonState.earthPoints = 0;
            kajigonState.artifactCount = 3; kajigonState.forceSpecial = null;
        } else if (type === 'GOLEM-WATER') {
            kajigonState.firePoints = 0; kajigonState.waterPoints = 100; kajigonState.windPoints = 0; kajigonState.earthPoints = 0;
            kajigonState.artifactCount = 3; kajigonState.forceSpecial = null;
        } else if (type === 'GOLEM-WIND') {
            kajigonState.firePoints = 0; kajigonState.waterPoints = 0; kajigonState.windPoints = 100; kajigonState.earthPoints = 0;
            kajigonState.artifactCount = 3; kajigonState.forceSpecial = null;
        } else if (type === 'GOLEM-EARTH') {
            kajigonState.firePoints = 0; kajigonState.waterPoints = 0; kajigonState.windPoints = 0; kajigonState.earthPoints = 100;
            kajigonState.artifactCount = 3; kajigonState.forceSpecial = null;
        }
        
        saveToLocalStorage();
        closeSpellModal();
        applyTheme();
        updateArtifactIndicator();
        updateCompanionWidget();
        updateLuckyChore();
        
        triggerCutIn(getCompanionEmoji(), () => {
            openEndingModal();
        });
        return;
    }

    const match = spell.match(/KJ-LV(\d+)-F(\d+)-W(\d+)-A(\d+)-E(\d+)/i);

    if (!match) {
        alert('同期キーが正しくありません。正しいキーを入力してください。');
        return;
    }

    const lv = parseInt(match[1], 10);
    const fire = parseInt(match[2], 10);
    const water = parseInt(match[3], 10);
    const wind = parseInt(match[4], 10);
    const earth = parseInt(match[5], 10);

    // Apply state
    kajigonState.firePoints = fire;
    kajigonState.waterPoints = water;
    kajigonState.windPoints = wind;
    kajigonState.earthPoints = earth;

    if (lv >= 10) {
        kajigonState.totalExp = 1350; // 150 * 9 = 1350
        kajigonState.endingSeen = false; // Reset ending seen for synchronized Level 10
    } else {
        kajigonState.totalExp = (lv - 1) * 150;
        kajigonState.endingSeen = false;
    }

    saveToLocalStorage();
    closeSpellModal();
    applyTheme();
    updateArtifactIndicator();
    updateCompanionWidget();
    updateLuckyChore();

    // 成功エフェクトの表示
    triggerCutIn(getCompanionEmoji(), () => {
        if (getLevel() >= 10) {
            openEndingModal();
        } else {
            alert('データの同期に成功しました！');
        }
    });
}

// 召喚成功カットイン演出
function triggerCutIn(emoji, callback) {
    const cutin = document.getElementById('cutin-container');
    const cutinBox = document.getElementById('cutin-box');
    
    cutinBox.innerHTML = `
        <div style="font-size: 20px; color: var(--primary); font-weight: 700; margin-bottom: 0.5rem;">💾 RESTORE</div>
        <div class="cutin-emoji">${emoji}</div>
        <div style="font-size: 15px; color: var(--text-main); margin-top: 0.5rem; font-weight: bold;">おうちの記録を同期しました。</div>
    `;
    
    cutin.classList.remove('hidden');

    setTimeout(() => {
        cutin.classList.add('hidden');
        if (callback) callback();
    }, 2500);
}

// ==========================================================================
// --- Evolution & Theme Controls ---
// ==========================================================================
function getEvolvedForm() {
    const pts = [
        { attr: 'fire', val: kajigonState.firePoints },
        { attr: 'water', val: kajigonState.waterPoints },
        { attr: 'wind', val: kajigonState.windPoints },
        { attr: 'earth', val: kajigonState.earthPoints }
    ];

    const maxVal = Math.max(...pts.map(p => p.val));
    const maxPtsList = pts.filter(p => p.val === maxVal);
    const isLightCondition = maxPtsList.length >= 2;

    const isForcedDark = kajigonState.forceSpecial === 'dark';
    const isForcedLight = kajigonState.forceSpecial === 'light';

    const isGolemRoute = kajigonState.artifactCount >= 1;
    const isDarkGolem = isForcedDark || (isLightCondition && kajigonState.artifactCount === 3);

    if (isDarkGolem) {
        return ALL_SPIRITS.find(s => s.id === 'dark_golem');
    }

    const seed = kajigonState.totalExp;
    const winnerAttr = maxPtsList[seed % maxPtsList.length].attr;
    const envTheme = kajigonState.environmentTheme || 'classic';

    // 1. 環境特化・地域固有種ルート (Environment Uniques)
    if (envTheme === 'gameboy') {
        return ALL_SPIRITS.find(s => s.id === 'unique_retro');
    }
    if (envTheme === 'classic' && (isLightCondition || isForcedLight)) {
        return (seed % 2 === 0) 
            ? ALL_SPIRITS.find(s => s.id === 'unique_temple') 
            : ALL_SPIRITS.find(s => s.id === 'light_dragon');
    }
    if (envTheme === 'volcano' && winnerAttr === 'fire' && !isGolemRoute) {
        if (seed % 3 === 0) return ALL_SPIRITS.find(s => s.id === 'unique_volcano');
        if (seed % 3 === 1) return ALL_SPIRITS.find(s => s.id === 'fairy_cook');
        return ALL_SPIRITS.find(s => s.id === 'fire_dragon');
    }
    if (envTheme === 'abyss' && winnerAttr === 'water' && !isGolemRoute) {
        if (seed % 3 === 0) return ALL_SPIRITS.find(s => s.id === 'unique_abyss');
        if (seed % 3 === 1) return ALL_SPIRITS.find(s => s.id === 'fairy_cat');
        return ALL_SPIRITS.find(s => s.id === 'water_dragon');
    }
    if (envTheme === 'sky' && winnerAttr === 'wind' && !isGolemRoute) {
        if (seed % 3 === 0) return ALL_SPIRITS.find(s => s.id === 'unique_sky');
        if (seed % 3 === 1) return ALL_SPIRITS.find(s => s.id === 'fairy_broom');
        return ALL_SPIRITS.find(s => s.id === 'wind_dragon');
    }
    if (envTheme === 'earth' && winnerAttr === 'earth' && !isGolemRoute) {
        if (seed % 3 === 0) return ALL_SPIRITS.find(s => s.id === 'unique_earth');
        if (seed % 3 === 1) return ALL_SPIRITS.find(s => s.id === 'relic_book');
        return ALL_SPIRITS.find(s => s.id === 'earth_dragon');
    }

    // 2. 機械魔ゴーレムルート (Golems)
    if (isGolemRoute) {
        const golemMap = {
            fire: 'fire_golem',
            water: 'water_golem',
            wind: 'wind_golem',
            earth: 'earth_golem'
        };
        return ALL_SPIRITS.find(s => s.id === (golemMap[winnerAttr] || 'earth_golem'));
    }

    // 3. スライム・光の調和ルート (Prism Slime vs Light Dragon)
    if (isLightCondition || isForcedLight || maxVal === 0) {
        if (seed % 3 === 0) return ALL_SPIRITS.find(s => s.id === 'slime_prism');
        if (seed % 3 === 1) return ALL_SPIRITS.find(s => s.id === 'relic_lamp');
        return ALL_SPIRITS.find(s => s.id === 'light_dragon');
    }

    // 4. 王道ドラゴンルート (Dragons)
    const dragonMap = {
        fire: 'fire_dragon',
        water: 'water_dragon',
        wind: 'wind_dragon',
        earth: 'earth_dragon'
    };
    return ALL_SPIRITS.find(s => s.id === (dragonMap[winnerAttr] || 'light_dragon'));
}

function getCurrentKajigonTheme() {
    const lv = getLevel();
    if (lv < 10) {
        const pts = [
            { attr: 'fire', val: kajigonState.firePoints },
            { attr: 'water', val: kajigonState.waterPoints },
            { attr: 'wind', val: kajigonState.windPoints },
            { attr: 'earth', val: kajigonState.earthPoints }
        ];
        const maxVal = Math.max(...pts.map(p => p.val));
        if (maxVal > 0) {
            const maxPtsList = pts.filter(p => p.val === maxVal);
            const seed = kajigonState.totalExp;
            return maxPtsList[seed % maxPtsList.length].attr;
        }
        return null;
    } else {
        const evolved = getEvolvedForm();
        return evolved.attr;
    }
}

let tempTheme = null;
function setTemporaryTheme(theme) {
    if (!theme) return;
    tempTheme = theme;
    applyTheme();
}

function clearTemporaryTheme() {
    tempTheme = null;
    applyTheme();
}

function applyTheme() {
    // Remove element theme classes
    document.body.classList.remove('theme-fire', 'theme-water', 'theme-wind', 'theme-earth', 'theme-light', 'theme-dark');
    // Remove environment theme classes
    document.body.classList.remove('env-volcano', 'env-abyss', 'env-sky', 'env-earth', 'env-classic', 'env-gameboy');

    // Apply environment theme base
    const envTheme = kajigonState.environmentTheme || 'classic';
    document.body.classList.add(`env-${envTheme}`);

    // Apply temporary/companion hover accent
    const activeTheme = tempTheme || getCurrentKajigonTheme();
    if (activeTheme) {
        document.body.classList.add(`theme-${activeTheme}`);
    }

    updateEnvironmentBadge();
}

function updateEnvironmentBadge() {
    const container = document.getElementById('env-badge-container');
    if (!container) return;
    const envKey = kajigonState.environmentTheme || 'classic';
    const envData = ENVIRONMENT_THEMES[envKey] || ENVIRONMENT_THEMES['classic'];

    container.innerHTML = `
        <div class="env-badge" title="${envData.boostLabel}">
            <span>${envData.icon}</span>
            <span>環境: ${envData.name}</span>
            <span style="font-size: 11px; opacity: 0.85; margin-left: 0.2rem;">[${envData.boostLabel}]</span>
        </div>
    `;
}

function updateArtifactIndicator() {
    const el = document.getElementById('artifact-count-val');
    if (el) {
        el.textContent = kajigonState.artifactCount;
    }
}

function triggerArtifactFlash() {
    const indicator = document.getElementById('artifact-indicator');
    if (indicator) {
        indicator.classList.remove('flash-effect');
        void indicator.offsetWidth; // Trigger reflow
        indicator.classList.add('flash-effect');
    }
}

function showCompanionDialogue(text) {
    const bubble = document.getElementById('companion-speech-bubble');
    const textEl = document.getElementById('speech-text');
    if (bubble && textEl) {
        textEl.textContent = text;
        bubble.classList.remove('hidden');
        if (window.dialogueTimeout) clearTimeout(window.dialogueTimeout);
        window.dialogueTimeout = setTimeout(() => {
            bubble.classList.add('hidden');
        }, 6000);
    }
}

function onCompanionClick() {
    SoundEngine.playSE('click');
    const lv = getLevel();
    const stage = getCompanionStage(lv);
    const now = new Date();
    const totalDone = completedList.length;

    // 家事連続コンボの判定（直近15分以内に完了した家事の個数）
    const fifteenMinAgo = Date.now() - 15 * 60 * 1000;
    const comboCount = completedList.filter(c => {
        const t = (typeof c.time === 'number') ? c.time : new Date(c.time).getTime();
        return t >= fifteenMinAgo;
    }).length;

    let lines = [];
    if (typeof getExpandedCompanionLines === 'function') {
        lines = getExpandedCompanionLines({ lv, stage, now, totalDone, comboCount });
    } else {
        const hour = now.getHours();
        if (hour >= 5 && hour < 10) {
            lines.push('「おはようございます！今日も朝からおうちを綺麗にしていきましょう！」');
        } else if (hour >= 22 || hour < 4) {
            lines.push('「夜遅くまで本当にお疲れさまです…！無理しないで休んでくださいね。」');
        }
        lines.push('「今日もマイペースにおうちを守っていきましょう！」');
    }

    const chosen = lines[Math.floor(Math.random() * lines.length)];
    showCompanionDialogue(chosen);
}

function openEndingModal() {
    const modal = document.getElementById('ending-modal');
    const titleEl = document.getElementById('ending-celebration-title');
    const imgEl = document.getElementById('ending-dragon-image');
    const textContainer = document.getElementById('ending-scroll-content');

    const selectedDragon = getEvolvedForm();

    // Apply corresponding final theme to body to trigger Dark Halo etc.
    document.body.classList.remove('theme-fire', 'theme-water', 'theme-wind', 'theme-earth', 'theme-light', 'theme-dark');
    document.body.classList.add(`theme-${selectedDragon.attr}`);

    titleEl.textContent = selectedDragon.attr === 'dark' ? '⚙️ 不完全なる闇 of 魔ゴーレム ⚙️' : '🏆 よく頑張りました！';
    imgEl.src = selectedDragon.file;
    imgEl.alt = selectedDragon.name;

    // Fallback logic
    imgEl.onerror = function() {
        this.style.display = 'none';
        const parent = this.parentNode;
        if (!document.getElementById('ending-fallback-emoji')) {
            const fallback = document.createElement('div');
            fallback.id = 'ending-fallback-emoji';
            fallback.style.fontSize = '80px';
            fallback.textContent = selectedDragon.attr === 'dark' ? '🤖' : '🐉';
            parent.appendChild(fallback);
        }
    };

    textContainer.innerHTML = `
        <p>◆ 素晴らしい取り組みへの表彰 ◆</p>
        <p>日々の細やかな家事という、目立たずとも最も尊いおうちの戦いにおいて、あなたは素晴らしい功績を収めました。</p>
        <p>あなたの絶え間ない献身によって、おうちの守護精霊はついに究極の姿である</p>
        <p style="font-size: 16px; font-weight: 800; color: var(--accent); text-align: center; margin: 0.5rem 0;">【 ${selectedDragon.name} 】</p>
        <p>へと最終変化を遂げました。</p>
        <p style="font-size: 12px; color: var(--text-sub); border-left: 3px solid var(--accent); padding-left: 0.5rem; margin: 0.75rem 0;">
            "${selectedDragon.desc}"
        </p>
        <p>いつもおうちをきれいに保ち、温かく支えてくれて本当にありがとうございます。</p>
        <p>その努力に、心からの感謝と最大の労いを贈ります。</p>
    `;

    modal.classList.remove('hidden');

    // Automatically register unlocked companion to encyclopedia
    recordToEncyclopedia(selectedDragon);

    // Only trigger sparkles if NOT Dark Golem (ゴールドの輝きを一切消し)
    if (selectedDragon.attr !== 'dark') {
        generateSparkles();
    }
}

function closeEndingModal() {
    document.getElementById('ending-modal').classList.add('hidden');
    const sparkles = document.querySelectorAll('.sparkle');
    sparkles.forEach(s => s.remove());
    
    const fallback = document.getElementById('ending-fallback-emoji');
    if (fallback) fallback.remove();
    document.getElementById('ending-dragon-image').style.display = 'block';

    // Mark ending as seen and save
    kajigonState.endingSeen = true;
    saveToLocalStorage();
}

// ==========================================================================
// --- 📖 守護精霊図鑑 (Encyclopedia System) ---
// ==========================================================================
const ALL_SPIRITS = [
    // 🐉 王道ドラゴン系統
    {
        id: 'light_dragon',
        attr: 'light',
        name: '🌟 創世輝龍アルティマ 🐉',
        file: 'dragon_all.png',
        desc: 'すべての家事を愛と調和の心でバランスよくこなし、世界に調和をもたらしました。',
        hint: '【光】全属性の家事をバランスよく行うと進化'
    },
    {
        id: 'fire_dragon',
        attr: 'fire',
        name: '🌋 獄炎龍ボルカノン 🦖',
        file: 'dragon_fire.png',
        desc: 'おうちのシンクやコンロをピカピカに磨き上げ、暮らしに熱い情熱の火を灯し続けてくれました。',
        hint: '【火】料理・コンロなどの熱い家事を極めると進化'
    },
    {
        id: 'water_dragon',
        attr: 'water',
        name: '🌊 海王神龍リヴァイア 🐙',
        file: 'dragon_water.png',
        desc: 'お風呂や洗濯、食器洗いで水回りを清め、家族みんなに清潔と潤いをもたらしてくれました。',
        hint: '【水】お風呂・洗濯・食器洗いなど水回りを極めると進化'
    },
    {
        id: 'wind_dragon',
        attr: 'wind',
        name: '🌪️ 嵐神翼龍ゼフィロス 🦅',
        file: 'dragon_wind.png',
        desc: '丁寧な掃除機がけや階段の掃き掃除でおうちの埃を吹き飛ばし、常に澄み切った新しい風を送り続けてくれました。',
        hint: '【風】掃除機や換気など風の家事を極めると進化'
    },
    {
        id: 'earth_dragon',
        attr: 'earth',
        name: '🪵 巌帝古龍ガイアード 🌲',
        file: 'dragon_earth.png',
        desc: '拭き掃除やゴミ捨て、ベッドメイキングでおうちの基礎をがっしりと支え、最高の安定感を与えてくれました。',
        hint: '【土】拭き掃除・ゴミ捨て・整理整頓を極めると進化'
    },

    // 🤖 機械魔ゴーレム系統
    {
        id: 'dark_golem',
        attr: 'dark',
        name: '👿 不完全なる闇 of 魔ゴーレム 🤖',
        file: 'golem_dark.png',
        desc: '古代パーツ（⚙️）が3個集まった、不穏で静かに佇む魔導のロボット。コアが怪しく光る不完全なドット絵姿です。',
        hint: '【闇】古代パーツを3つ集めてバランスよく家事を行うと降臨'
    },
    {
        id: 'fire_golem',
        attr: 'fire',
        name: '🌋 獄炎魔ゴーレム 🤖',
        file: 'golem_fire.png',
        desc: 'おうちのシンクやコンロをピカピカに磨き上げ、熱い鉄の魂で暮らしを支えてくれました。',
        hint: '【火・機械】古代パーツを持ち、火の家事を極めると進化'
    },
    {
        id: 'water_golem',
        attr: 'water',
        name: '🌊 海王魔ゴーレム 🤖',
        file: 'golem_water.png',
        desc: 'お風呂や洗濯、食器洗いで水回りを清め、無休の歯車で清潔と潤いをもたらしてくれました。',
        hint: '【水・機械】古代パーツを持ち、水の家事を極めると進化'
    },
    {
        id: 'wind_golem',
        attr: 'wind',
        name: '🌪️ 嵐神魔ゴーレム 🤖',
        file: 'golem_wind.png',
        desc: '掃除機がけや階段の掃き掃除で埃を吸い込み、強力なファンで新しい風を送り続けてくれました。',
        hint: '【風・機械】古代パーツを持ち、風の家事を極めると進化'
    },
    {
        id: 'earth_golem',
        attr: 'earth',
        name: '🪵 巌帝魔ゴーレム 🤖',
        file: 'golem_earth.png',
        desc: '拭き掃除やゴミ捨て、ベッドメイキングを行い、どっしりとした金属の躯体でおうちの基礎を支えてくれました。',
        hint: '【土・機械】古代パーツを持ち、土の家事を極めると進化'
    },

    // 🌍 環境特化・固有種系統
    {
        id: 'unique_volcano',
        attr: 'fire',
        name: '🌋 溶岩料理神 ボルケフ 🐢',
        file: 'unique_volcano.png',
        desc: '火山玄武岩の甲羅にかまど鍋を背負い、家族の温かい食卓と美味しいご飯を永遠に見守る大地のカメ神。',
        hint: '【火山限定】灼熱の火山環境で火の家事を極めると降臨'
    },
    {
        id: 'unique_abyss',
        attr: 'water',
        name: '🌊 清流クラゲ姫 アンフィトリテ 🪼',
        file: 'unique_abyss.png',
        desc: '深海で青く透き通り発光するクラゲの姫君。水回りの滑りやカビを浄化し、家族に極上の潤いを与える。',
        hint: '【深海限定】深海の神殿環境で水の家事を極めると降臨'
    },
    {
        id: 'unique_sky',
        attr: 'wind',
        name: '🍃 樹海番人 シルヴァニアン 🦉',
        file: 'unique_sky.png',
        desc: '緑深き樹海の葉をまとう森の賢者フクロウ。窓から入る澄んだ風とともに家中を駆け抜け、埃を吹き払う。',
        hint: '【樹海限定】天空の樹海環境で風の家事を極めると降臨'
    },
    {
        id: 'unique_earth',
        attr: 'earth',
        name: '🏜️ 機巧魔神 ギアオメガ ⚙️',
        file: 'unique_earth.png',
        desc: '古代スチームパンクの歯車と振り子時計を胸に宿した巨神。正確無比なリズムでおうちの秩序と生活リズムを守る。',
        hint: '【遺跡限定】砂漠の巨石遺跡環境で土の家事を極めると降臨'
    },
    {
        id: 'unique_temple',
        attr: 'light',
        name: '📜 彗星神竜 コスモアルティマ 🌌',
        file: 'unique_temple.png',
        desc: '星空の銀河と星座をその身に宿した神話の宇宙竜。家中が愛と調和でピカピカに満ちた時にのみ空から舞い降りる。',
        hint: '【神殿限定】星降る神殿で全属性を調和させると降臨'
    },
    {
        id: 'unique_retro',
        attr: 'wind',
        name: '👾 原初ビット ビットゴン 📟',
        file: 'unique_retro.png',
        desc: 'ゲームボーイ初期の4階調ドット画面から実体化した原初のピクセル龍。ノスタルジックな魔力でおうちを包み込む。',
        hint: '【レトロ限定】初代レトロ環境で進化させると降臨'
    },

    // 🧚 妖精・レリック・スライム新種族系統
    {
        id: 'fairy_cook',
        attr: 'fire',
        name: '🍳 フライパン小人 ポックル 👨‍🍳',
        file: 'fairy_cook.png',
        desc: 'コック帽をかぶり黄金のフライパンを手にした料理妖精。フライパンやコンロをピカピカにする人に最高の朝食の幸運を授ける。',
        hint: '【妖精族】料理やキッチン周りの家事をたくさん行うと出現'
    },
    {
        id: 'fairy_cat',
        attr: 'water',
        name: '🧼 あわあわバブルキャット 🐱',
        file: 'fairy_cat.svg',
        desc: '石鹸のフワフワな泡でできた不思議な白猫。お風呂や洗濯を頑張る人の周りをぷかぷか漂い、いい匂いで癒やしてくれる。',
        hint: '【妖精族】お風呂掃除や洗濯の家事をたくさん行うと出現'
    },
    {
        id: 'fairy_broom',
        attr: 'wind',
        name: '🧹 ほうき小僧 ほうき丸 👺',
        file: 'fairy_broom.svg',
        desc: '職人気質の小さなほうき小僧。床や階段のチリひとつ許さず、ササッと掃き清めて爽快な一日を届けてくれる。',
        hint: '【妖精族】掃き掃除や掃除機がけをたくさん行うと出現'
    },
    {
        id: 'relic_book',
        attr: 'earth',
        name: '📖 飛翔魔導書 グリモワール 📜',
        file: 'relic_book.svg',
        desc: '家族の毎日の家事の歴史が書き込まれるにつれて自我を持った古代の魔導書。ページを開くたびにおうちに幸せの魔法をかける。',
        hint: '【レリック族】拭き掃除やゴミ捨てなど日々の記録を積み重ねると覚醒'
    },
    {
        id: 'relic_lamp',
        attr: 'fire',
        name: '🪔 団欒の魔人 ジン・ランタン 🧞',
        file: 'relic_lamp.svg',
        desc: '温かい光を放つ魔法のランプから現れる魔人。家族団欒のひとときを黄金のぬくもりで包み込み、みんなを笑顔にする。',
        hint: '【レリック族】夜の家事や物品補充を行うとランプが点灯'
    },
    {
        id: 'slime_prism',
        attr: 'light',
        name: '💎 キングプリズムスライム 👑',
        file: 'slime_prism.svg',
        desc: 'おうちの汚れを吸い取って体内でピカピカの虹色宝石に変えた奇跡のスライム王。王冠を輝かせ、家中に最高の福をもたらす。',
        hint: '【スライム族】ラッキー家事や討伐クエストを重ねると降臨'
    }
];

function recordToEncyclopedia(evolved) {
    if (!evolved || !evolved.file) return;
    try {
        const raw = localStorage.getItem('kajigon_encyclopedia');
        let list = raw ? JSON.parse(raw) : [];
        if (!Array.isArray(list)) list = [];
        
        const existingIdx = list.findIndex(item => item.file === evolved.file);
        const record = {
            name: evolved.name,
            file: evolved.file,
            attr: evolved.attr,
            desc: evolved.desc,
            date: new Date().toLocaleDateString('ja-JP')
        };
        
        if (existingIdx >= 0) {
            list[existingIdx] = record;
        } else {
            list.push(record);
        }
        localStorage.setItem('kajigon_encyclopedia', JSON.stringify(list));
    } catch(e) {
        console.error('Error saving to encyclopedia:', e);
    }
}

function openBookModal() {
    SoundEngine.playSE('click');
    if (getLevel() >= 10) {
        recordToEncyclopedia(getEvolvedForm());
    }
    
    let unlocked = [];
    try {
        const raw = localStorage.getItem('kajigon_encyclopedia');
        unlocked = raw ? JSON.parse(raw) : [];
        if (!Array.isArray(unlocked)) unlocked = [];
    } catch(e) {
        unlocked = [];
    }

    const container = document.getElementById('book-list-container');
    if (!container) return;

    const unlockedFiles = new Set(unlocked.map(u => u.file));
    const totalCount = ALL_SPIRITS.length;
    const unlockedCount = ALL_SPIRITS.filter(s => unlockedFiles.has(s.file)).length;

    let currentTab = window._currentBookTab || 'spirits';

    const unlockedKarutaSet = getUnlockedKarutaSet();
    const karutaList = (typeof EXPANDED_KARUTA_LIST !== 'undefined') ? EXPANDED_KARUTA_LIST : [];
    const karutaTotal = karutaList.length;
    const karutaUnlockedCount = karutaList.filter(k => unlockedKarutaSet.has(k.id)).length;

    let html = `
        <div style="display: flex; gap: 0.5rem; margin-bottom: 0.75rem;">
            <button onclick="switchBookTab('spirits')" style="flex:1; padding: 0.5rem; border: 2px solid var(--accent); background: ${currentTab === 'spirits' ? 'var(--accent)' : '#0d0d13'}; color: ${currentTab === 'spirits' ? '#0d0d13' : 'var(--accent)'}; font-weight: bold; cursor: pointer; border-radius: 4px;">
                🐉 守護精霊 (${unlockedCount}/${totalCount})
            </button>
            <button onclick="switchBookTab('karuta')" style="flex:1; padding: 0.5rem; border: 2px solid var(--accent); background: ${currentTab === 'karuta' ? 'var(--accent)' : '#0d0d13'}; color: ${currentTab === 'karuta' ? '#0d0d13' : 'var(--accent)'}; font-weight: bold; cursor: pointer; border-radius: 4px;">
                🥠 かるた帳 (${karutaUnlockedCount}/${karutaTotal})
            </button>
        </div>
    `;

    if (currentTab === 'spirits') {
        html += `
            <div style="background: rgba(255,255,255,0.06); border: 2px solid var(--accent); padding: 0.6rem 0.8rem; border-radius: 6px; font-weight: bold; font-size: 13px; text-align: center; color: var(--accent); margin-bottom: 0.5rem;">
                発見数: ${unlockedCount} / ${totalCount} 体 （達成率: ${Math.round((unlockedCount / totalCount) * 100)}%）<br>
                <span style="font-size: 11px; color: #a1a1aa; font-weight: normal;">※発見した精霊をタップすると【裏設定・好物・メッセージ】が読めます！</span>
            </div>
        `;

        ALL_SPIRITS.forEach(spirit => {
            const isDiscovered = unlockedFiles.has(spirit.file);
            const record = unlocked.find(u => u.file === spirit.file);
            const dateStr = record && record.date ? `（発見日: ${record.date}）` : '';

            if (isDiscovered) {
                html += `
                    <div class="book-card" style="border-color: var(--accent); cursor: pointer;" onclick="openSpiritDetailModal('${spirit.id}')" title="タップして裏設定・メッセージを見る！">
                        <div class="book-avatar">
                            <img src="${spirit.file}" alt="${spirit.name}" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
                            <span style="display:none; font-size: 32px;">${spirit.file.includes('golem') ? '🤖' : '🐉'}</span>
                        </div>
                        <div class="book-info">
                            <div class="book-info-title">${spirit.name} <span style="font-size:11px; color:var(--accent); font-weight:bold;">🔍 詳しく見る</span></div>
                            <div class="book-info-desc">${spirit.desc}</div>
                            <div class="book-date">✨ 発見済み ${dateStr}</div>
                        </div>
                    </div>
                `;
            } else {
                html += `
                    <div class="book-card" style="opacity: 0.65; border: 2px dashed #444; background: #0e0e14;">
                        <div class="book-avatar" style="border-color: #444; background: #07070a; display:flex; align-items:center; justify-content:center; color: #888; font-size: 26px;">
                            ❓
                        </div>
                        <div class="book-info">
                            <div class="book-info-title" style="color: #888;">？？？？？？</div>
                            <div class="book-info-desc" style="color: #71717a;">ヒント: ${spirit.hint}</div>
                            <div class="book-date" style="color: #555;">🔒 未発見</div>
                        </div>
                    </div>
                `;
            }
        });
    } else {
        // かるた帳タブ
        html += `
            <div style="background: rgba(255,255,255,0.06); border: 2px solid var(--accent); padding: 0.6rem 0.8rem; border-radius: 6px; font-weight: bold; font-size: 13px; text-align: center; color: var(--accent); margin-bottom: 0.5rem;">
                集めた家事かるた: ${karutaUnlockedCount} / ${karutaTotal} 枚 （収集率: ${Math.round((karutaUnlockedCount / karutaTotal) * 100)}%）
            </div>
            <div style="display: flex; flex-direction: column; gap: 0.5rem;">
        `;

        karutaList.forEach(k => {
            const isUnlocked = unlockedKarutaSet.has(k.id);
            if (isUnlocked) {
                const isUltra = (k.rarity === 'ultra');
                html += `
                    <div style="background: #14141f; border: 2px solid ${isUltra ? '#ff007f' : 'var(--accent)'}; border-radius: 6px; padding: 0.6rem 0.8rem; box-shadow: ${isUltra ? '0 0 10px rgba(255,0,128,0.3)' : 'none'};">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 0.25rem;">
                            <span style="font-size: 12px; font-weight: bold; color: ${isUltra ? '#ff007f' : 'var(--accent)'};">${k.rank}</span>
                            <span style="font-size: 10px; color: #10b981; font-weight: bold;">COLLECTED</span>
                        </div>
                        <div style="font-size: 13px; color: #f4ede2; line-height: 1.4;">${k.text}</div>
                    </div>
                `;
            } else {
                html += `
                    <div style="background: #0e0e14; border: 2px dashed #444; border-radius: 6px; padding: 0.6rem 0.8rem; opacity: 0.6;">
                        <div style="font-size: 12px; font-weight: bold; color: #71717a;">🔒 未発見のかるた</div>
                        <div style="font-size: 12px; color: #555; margin-top: 0.2rem;">家事を完了してかるた・おみくじを引くと解放！</div>
                    </div>
                `;
            }
        });

        html += `</div>`;
    }

    container.innerHTML = html;
    document.getElementById('book-modal').classList.remove('hidden');
}

function switchBookTab(tab) {
    SoundEngine.playSE('click');
    window._currentBookTab = tab;
    openBookModal();
}

function closeBookModal() {
    SoundEngine.playSE('click');
    document.getElementById('book-modal').classList.add('hidden');
}

function openSpiritDetailModal(spiritId) {
    SoundEngine.playSE('click');
    const spirit = ALL_SPIRITS.find(s => s.id === spiritId);
    if (!spirit) return;

    const profile = (typeof SPIRIT_PROFILES !== 'undefined' && SPIRIT_PROFILES[spiritId]) ? SPIRIT_PROFILES[spiritId] : {
        favorite: '美味しいご飯 & 家族の笑顔',
        specialty: 'おうちの清潔と平和を守ること',
        episode: 'いつも家族の頑張りを見守り、温かい応援の光を届けてくれる優しい精霊。',
        message: '「今日も家事を頑張ってくれてありがとう！おうちがピカピカで嬉しいよ！」'
    };

    const container = document.getElementById('spirit-detail-content');
    if (!container) return;

    container.innerHTML = `
        <div style="text-align: center; margin-bottom: 1rem;">
            <div style="width: 100px; height: 100px; margin: 0 auto; background: rgba(0,0,0,0.3); border: 3px solid var(--accent); border-radius: 8px; display:flex; align-items:center; justify-content:center; overflow:hidden;">
                <img src="${spirit.file}" alt="${spirit.name}" style="width: 100%; height: 100%; object-fit: contain; image-rendering: pixelated; filter: drop-shadow(0 4px 8px rgba(0,0,0,0.6));">
            </div>
            <h3 style="font-size: 16px; font-weight: bold; color: var(--accent); margin-top: 0.5rem; letter-spacing: 0.5px;">${spirit.name}</h3>
            <p style="font-size: 12px; color: var(--text-sub); margin-top: 0.2rem;">${spirit.desc}</p>
        </div>

        <div style="display: flex; flex-direction: column; gap: 0.75rem; text-align: left;">
            <div style="background: #14141f; border-left: 4px solid #ef4444; padding: 0.5rem 0.75rem; border-radius: 4px;">
                <div style="font-size: 11px; font-weight: bold; color: #f87171;">🍽️ 大好物</div>
                <div style="font-size: 13px; color: #f4ede2; margin-top: 0.2rem;">${profile.favorite}</div>
            </div>

            <div style="background: #14141f; border-left: 4px solid #3b82f6; padding: 0.5rem 0.75rem; border-radius: 4px;">
                <div style="font-size: 11px; font-weight: bold; color: #60a5fa;">⚔️ 得意な家事</div>
                <div style="font-size: 13px; color: #f4ede2; margin-top: 0.2rem;">${profile.specialty}</div>
            </div>

            <div style="background: #14141f; border-left: 4px solid #10b981; padding: 0.5rem 0.75rem; border-radius: 4px;">
                <div style="font-size: 11px; font-weight: bold; color: #34d399;">📜 知られざる裏設定・日常エピソード</div>
                <div style="font-size: 12px; color: #cbd5e1; line-height: 1.5; margin-top: 0.25rem;">${profile.episode}</div>
            </div>

            <div style="background: #1e1b4b; border: 1.5px solid #818cf8; padding: 0.6rem 0.75rem; border-radius: 6px; margin-top: 0.25rem;">
                <div style="font-size: 11px; font-weight: bold; color: #a5b4fc;">💖 住まい手への感謝メッセージ</div>
                <div style="font-size: 13px; color: #fff; font-weight: 500; font-style: italic; line-height: 1.4; margin-top: 0.25rem;">${profile.message}</div>
            </div>
        </div>
    `;

    document.getElementById('spirit-detail-modal').classList.remove('hidden');
}

function closeSpiritDetailModal() {
    SoundEngine.playSE('click');
    document.getElementById('spirit-detail-modal').classList.add('hidden');
}

// ==========================================================================
// --- ⚔️ 名もなき家事 突発討伐クエスト (案1：20種以上のシチュエーション別ボス) ---
// ==========================================================================
const BOUNTY_BOSSES = (typeof EXPANDED_BOUNTY_BOSSES !== 'undefined') ? EXPANDED_BOUNTY_BOSSES : [
    { id: 'cardboard', name: '📦 ダンボールゴーレム', target: '玄関や廊下のダンボール解体・まとめ', exp: 50, attr: 'earth', desc: '通販の箱が溜まりつつある！一気に畳んで撃破せよ！' },
    { id: 'drain', name: '🫧 排水口ヘドロサタン', target: 'キッチンか風呂の排水口ネット交換＆掃除', exp: 45, attr: 'water', desc: 'ヌメリの魔王が潜んでいる！新しいネットを張って清めよ！' },
    { id: 'shampoo', name: '🧴 詰め替えキメラ', target: 'シャンプー・ハンドソープの補充', exp: 35, attr: 'water', desc: 'ボトルが軽くなっている！最後の一滴が出る前に満タンにせよ！' },
    { id: 'toilet_core', name: '🧻 芯ファントム', target: 'トイレットペーパーの芯回収＆新しいペーパー装着', exp: 30, attr: 'wind', desc: 'ホルダーの上に置き去りにされた芯を成仏させよ！' },
    { id: 'vent_dust', name: '🌪️ 換気扇ホコリバード', target: '換気扇や通気口のホコリ取り・拭き掃除', exp: 60, attr: 'wind', desc: '見えざるホコリの怪鳥！サッと拭き取って爽やかな風を呼べ！' },
    { id: 'sponge', name: '🧽 スポンジ老朽ナイト', target: 'キッチンスポンジの交換または熱湯消毒', exp: 35, attr: 'fire', desc: '使い古したスポンジを新調して、シンクの魔力を高めよ！' },
    { id: 'icebox_check', name: '🧊 賞味期限シャドウ', target: '冷蔵庫のドレッシングや奥の食材チェック', exp: 40, attr: 'fire', desc: '奥に眠る怪しい調味料を点検し、安全な庫内を取り戻せ！' }
];

function getTodayBounty() {
    const todayStr = getTodayDateString();
    let bountyData = null;
    try {
        const raw = localStorage.getItem('kajigon_bounty_quest');
        bountyData = raw ? JSON.parse(raw) : null;
    } catch(e) {
        bountyData = null;
    }

    const bossList = (typeof EXPANDED_BOUNTY_BOSSES !== 'undefined') ? EXPANDED_BOUNTY_BOSSES : BOUNTY_BOSSES;

    if (!bountyData || bountyData.date !== todayStr) {
        let seed = 0;
        for (let i = 0; i < todayStr.length; i++) {
            seed = (seed * 31 + todayStr.charCodeAt(i)) >>> 0;
        }
        const boss = bossList[seed % bossList.length];
        bountyData = {
            date: todayStr,
            bossId: boss.id,
            defeated: false
        };
        localStorage.setItem('kajigon_bounty_quest', JSON.stringify(bountyData));
    }
    const boss = bossList.find(b => b.id === bountyData.bossId) || bossList[0];
    return { boss, defeated: bountyData.defeated };
}

function renderBountyWidget() {
    const container = document.getElementById('bounty-quest-widget');
    if (!container) return;

    const { boss, defeated } = getTodayBounty();
    const content = defeated ? `
        <div class="bounty-card defeated" style="border: 2px solid #10b981; border-radius: 8px; padding: 1rem; background: #064e3b; text-align: center;">
            <div style="font-size: 16px; font-weight: bold; color: #34d399; margin-bottom: 0.5rem;">✨ 本日の討伐成功！</div>
            <div style="font-size: 13px; color: #a7f3d0;">⚔️ ${boss.name} は討伐され、おうちの平和は守られた！</div>
        </div>
    ` : `
        <div class="bounty-card" style="border: 2px solid #ff4b4b; border-radius: 8px; padding: 1rem; background: #1f1416;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 0.5rem;">
                <span style="font-size: 14px; font-weight: bold; color: #f87171;">⚔️ 【突発討伐】${boss.name} 現る！</span>
                <span style="font-size: 11px; background: #ff4b4b; color: white; padding: 0.2rem 0.5rem; border-radius: 4px; font-weight: bold;">+${boss.exp} EXP</span>
            </div>
            <div style="font-size: 13px; color: #f4ede2; margin-bottom: 0.5rem;">🎯 討伐任務：<strong>${boss.target}</strong></div>
            <div style="font-size: 11px; color: #94a3b8; margin-bottom: 1rem;">${boss.desc}</div>
            <button class="btn-spell-action btn-spell-cast" style="width: 100%; background: #ff4b4b; border-color: #ff7878;" onclick="defeatBountyQuest()">⚔️ 討伐完了！</button>
        </div>
    `;

    if (container) container.innerHTML = content;
    const modalContainer = document.getElementById('bounty-quest-modal-container');
    if (modalContainer) modalContainer.innerHTML = content;
}

function defeatBountyQuest() {
    const { boss, defeated } = getTodayBounty();
    if (defeated) return;

    const todayStr = getTodayDateString();
    localStorage.setItem('kajigon_bounty_quest', JSON.stringify({
        date: todayStr,
        bossId: boss.id,
        defeated: true
    }));

    const choreName = `⚔️ 討伐：${boss.name}（${boss.target}）`;
    const id = Date.now();
    const { finalExp } = addChoreExp(choreName);
    completedList.unshift({ id, name: choreName, time: id, gainedExp: finalExp, isLucky: true });

    saveToLocalStorage();
    renderCompleted();
    renderBountyWidget();
    updateCompanionWidget();

    SoundEngine.playSE('lucky');
    triggerCutIn('⚔️', () => {
        triggerFortuneToast(true);
    });
}

// ==========================================================================
// --- 🎮 新UIモーダル開閉ハンドラ (ADD CHORE, SHARE, QUEST, KARUTA) ---
// ==========================================================================
function openChoreSelectModal() {
    SoundEngine.playSE('click');
    const modal = document.getElementById('chore-select-modal');
    if (modal) modal.classList.remove('hidden');
}

function closeChoreSelectModal() {
    SoundEngine.playSE('click');
    const modal = document.getElementById('chore-select-modal');
    if (modal) modal.classList.add('hidden');
}

function openShareActionModal() {
    SoundEngine.playSE('click');
    const modal = document.getElementById('share-action-modal');
    if (modal) modal.classList.remove('hidden');
}

function closeShareActionModal() {
    SoundEngine.playSE('click');
    const modal = document.getElementById('share-action-modal');
    if (modal) modal.classList.add('hidden');
}

function openBountyModal() {
    SoundEngine.playSE('click');
    renderBountyWidget();
    const modal = document.getElementById('bounty-modal');
    if (modal) modal.classList.remove('hidden');
}

function closeBountyModal() {
    SoundEngine.playSE('click');
    const modal = document.getElementById('bounty-modal');
    if (modal) modal.classList.add('hidden');
}

function openKarutaAlbumModal() {
    SoundEngine.playSE('click');
    window._currentBookTab = 'karuta';
    openBookModal();
}

// ==========================================================================
// --- 🥠 家事かるた・おみくじ トースト演出 (案4) ---
// ==========================================================================
const FORTUNE_LIST = (typeof EXPANDED_KARUTA_LIST !== 'undefined') ? EXPANDED_KARUTA_LIST : [
    { id: 'k_default_1', rank: '🎉 大吉', text: '靴下の裏返しが1発で直った！奇跡の快感！', rarity: 'common' },
    { id: 'k_default_2', rank: '✨ 中吉', text: '冷蔵庫の奥から賞味期限内のお宝プリンを発見！', rarity: 'common' }
];

let fortuneToastTimer = null;

function getUnlockedKarutaSet() {
    try {
        const raw = localStorage.getItem('kajigon_unlocked_karuta');
        return new Set(raw ? JSON.parse(raw) : []);
    } catch(e) {
        return new Set();
    }
}

function saveUnlockedKaruta(id) {
    if (!id) return;
    try {
        const set = getUnlockedKarutaSet();
        set.add(id);
        localStorage.setItem('kajigon_unlocked_karuta', JSON.stringify(Array.from(set)));
    } catch(e) {}
}

function triggerFortuneToast(force = false) {
    if (!force && Math.random() > 0.35) return;

    const toast = document.getElementById('fortune-toast');
    const rankEl = document.getElementById('fortune-toast-rank');
    const textEl = document.getElementById('fortune-toast-text');
    if (!toast || !rankEl || !textEl) return;

    const list = (typeof EXPANDED_KARUTA_LIST !== 'undefined') ? EXPANDED_KARUTA_LIST : FORTUNE_LIST;
    const chosen = list[Math.floor(Math.random() * list.length)];
    
    // Save to collected karuta album
    if (chosen.id) {
        saveUnlockedKaruta(chosen.id);
    }

    rankEl.textContent = chosen.rank;
    textEl.textContent = chosen.text;

    // Apply rainbow glow styling for ultra rare
    if (chosen.rarity === 'ultra') {
        rankEl.style.background = 'linear-gradient(90deg, #ff007f, #7928ca, #0070f3, #00dfd8)';
        rankEl.style.color = '#fff';
        rankEl.style.boxShadow = '0 0 10px rgba(255, 0, 128, 0.8)';
    } else {
        rankEl.style.background = '';
        rankEl.style.color = '';
        rankEl.style.boxShadow = '';
    }

    toast.classList.remove('hidden');

    if (fortuneToastTimer) clearTimeout(fortuneToastTimer);
    fortuneToastTimer = setTimeout(() => {
        hideFortuneToast();
    }, 4200);
}

function hideFortuneToast() {
    const toast = document.getElementById('fortune-toast');
    if (toast) toast.classList.add('hidden');
    if (fortuneToastTimer) clearTimeout(fortuneToastTimer);
}

// ==========================================================================
// --- 📰 週刊カジゴン号外ニュース (案5) ---
// ==========================================================================
function openWeeklyNewsModal() {
    SoundEngine.playSE('click');
    const container = document.getElementById('weekly-news-content');
    if (!container) return;

    const now = Date.now();
    const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
    const weeklyChores = completedList.filter(c => {
        const time = (typeof c.time === 'number') ? c.time : new Date(c.time).getTime();
        return time >= sevenDaysAgo;
    });

    const article = (typeof generateWeeklyNewsArticle === 'function') 
        ? generateWeeklyNewsArticle(weeklyChores)
        : {
            totalCount: weeklyChores.length,
            totalExp: weeklyChores.reduce((s, c) => s + (c.gainedExp || 10), 0),
            topChoreName: "（記録なし）",
            topChoreMax: 0,
            nightChoreCount: 0,
            bannerTitle: "★ 坂本家・特別号外速報 ★",
            mainHeadline: "📰 週刊カジゴン通信",
            editorial: "『コツコツと確かな歩み！おうちの平和は守られた！』",
            themeColor: "#b91c1c"
        };

    const todayDate = new Date().toLocaleDateString('ja-JP');

    container.innerHTML = `
        <div class="weekly-news-paper" id="weekly-news-paper-element">
            <div class="weekly-news-header" style="border-bottom: 3px double ${article.themeColor};">
                <div>
                    <div style="font-size: 11px; color: ${article.themeColor}; font-weight: 900; letter-spacing: 1px;">${article.bannerTitle}</div>
                    <div class="weekly-news-maintitle">${article.mainHeadline}</div>
                </div>
                <div class="weekly-news-date">発行日: ${todayDate}</div>
            </div>

            <div class="weekly-news-stats-grid">
                <div class="weekly-stat-box">
                    <div class="weekly-stat-val">${article.totalCount} <span style="font-size:12px;">回</span></div>
                    <div class="weekly-stat-lbl">今週の家事達成数</div>
                </div>
                <div class="weekly-stat-box">
                    <div class="weekly-stat-val">+${article.totalExp} <span style="font-size:12px;">EXP</span></div>
                    <div class="weekly-stat-lbl">家庭内総獲得EXP</div>
                </div>
            </div>

            <div class="weekly-highlight-section">
                <div class="weekly-highlight-title" style="color: ${article.themeColor};">👑 今週の最多討伐王（MVP家事）</div>
                <div class="weekly-highlight-item">${article.topChoreName} ${article.topChoreMax > 0 ? `（計 ${article.topChoreMax} 回達成！）` : ''}</div>
            </div>

            ${article.nightChoreCount > 0 ? `
            <div class="weekly-highlight-section" style="border-left: 3px solid #8b5cf6;">
                <div class="weekly-highlight-title" style="color:#6d28d9;">🌙 電撃ナイトファインプレー</div>
                <div class="weekly-highlight-item">夜遅くの家事：計 ${article.nightChoreCount} 回 （寝る前のリセット大感謝！）</div>
            </div>
            ` : ''}

            <div class="weekly-editorial" style="border-left-color: ${article.themeColor};">
                <strong>🐉 カジゴン記者の一言社説：</strong><br>
                ${article.editorial}
            </div>
        </div>
    `;

    document.getElementById('weekly-news-modal').classList.remove('hidden');
}

function closeWeeklyNewsModal() {
    SoundEngine.playSE('click');
    document.getElementById('weekly-news-modal').classList.add('hidden');
}

async function shareWeeklyNewsCard() {
    SoundEngine.playSE('click');
    const width = 640;
    const height = 760;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    // Newspaper background
    ctx.fillStyle = '#fbf0d9';
    ctx.fillRect(0, 0, width, height);

    // Double borders
    ctx.strokeStyle = '#2b2b2b';
    ctx.lineWidth = 6;
    ctx.strokeRect(15, 15, width - 30, height - 30);
    ctx.lineWidth = 2;
    ctx.strokeRect(23, 23, width - 46, height - 46);

    // Header
    ctx.textAlign = 'center';
    ctx.fillStyle = '#b91c1c';
    ctx.font = 'bold 16px "DotGothic16", sans-serif';
    ctx.fillText('★ 坂本家・家庭内特別号外速報 ★', width / 2, 60);

    ctx.fillStyle = '#1a1a24';
    ctx.font = '900 32px "DotGothic16", sans-serif';
    ctx.fillText('📰 週刊カジゴン通信', width / 2, 105);

    ctx.strokeStyle = '#2b2b2b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(35, 125);
    ctx.lineTo(width - 35, 125);
    ctx.stroke();

    // Date
    ctx.textAlign = 'right';
    ctx.fillStyle = '#555';
    ctx.font = '14px "DotGothic16", sans-serif';
    ctx.fillText(`発行日: ${new Date().toLocaleDateString('ja-JP')}`, width - 40, 150);

    // Weekly Stats Box
    const now = Date.now();
    const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
    const weeklyChores = completedList.filter(c => {
        const time = (typeof c.time === 'number') ? c.time : new Date(c.time).getTime();
        return time >= sevenDaysAgo;
    });

    const totalCount = weeklyChores.length;
    let totalExp = 0;
    const choreCounts = {};
    weeklyChores.forEach(c => {
        totalExp += (c.gainedExp || 10);
        choreCounts[c.name] = (choreCounts[c.name] || 0) + 1;
    });
    let topChoreName = "（まだ今週の記録はありません）";
    let topChoreMax = 0;
    Object.keys(choreCounts).forEach(name => {
        if (choreCounts[name] > topChoreMax) {
            topChoreMax = choreCounts[name];
            topChoreName = name;
        }
    });

    // Draw Stats
    ctx.fillStyle = '#fff';
    ctx.fillRect(40, 175, width - 80, 95);
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.strokeRect(40, 175, width - 80, 95);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#777';
    ctx.font = '14px "DotGothic16", sans-serif';
    ctx.fillText('今週の家事総達成数', 180, 205);
    ctx.fillText('家庭内総獲得EXP', width - 180, 205);

    ctx.fillStyle = '#b91c1c';
    ctx.font = 'bold 36px "DotGothic16", sans-serif';
    ctx.fillText(`${totalCount} 回`, 180, 250);
    ctx.fillText(`+${totalExp} EXP`, width - 180, 250);

    // MVP Chore
    ctx.fillStyle = '#fff';
    ctx.fillRect(40, 295, width - 80, 90);
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.strokeRect(40, 295, width - 80, 90);

    ctx.textAlign = 'left';
    ctx.fillStyle = '#1e3a8a';
    ctx.font = 'bold 17px "DotGothic16", sans-serif';
    ctx.fillText('👑 今週の最多討伐王（MVP家事）', 60, 325);

    ctx.fillStyle = '#111';
    ctx.font = 'bold 20px "DotGothic16", sans-serif';
    ctx.fillText(`${topChoreName} ${topChoreMax > 0 ? `(計 ${topChoreMax} 回)` : ''}`, 60, 360);

    // Companion Avatar Box
    const companionY = 415;
    ctx.fillStyle = '#f4e5c8';
    ctx.fillRect(40, companionY, width - 80, 155);
    ctx.strokeStyle = '#8b5a2b';
    ctx.lineWidth = 2;
    ctx.strokeRect(40, companionY, width - 80, 155);

    ctx.textAlign = 'center';
    ctx.font = '54px sans-serif';
    ctx.fillText(getCompanionEmoji(), 110, companionY + 90);

    ctx.textAlign = 'left';
    ctx.fillStyle = '#8b5a2b';
    ctx.font = 'bold 16px "DotGothic16", sans-serif';
    ctx.fillText('🐉 カジゴン記者の一言社説：', 180, companionY + 40);

    let editorial = "『今週もおうちを支えてくれて本当にありがとう！素晴らしい連携に最大の敬意を！今夜は乾杯だ！』";
    if (totalCount >= 20) {
        editorial = "『今週は伝説級の神殿！2人の奮闘であらゆる汚れが一掃された！文句なしの大殊勲である！』";
    } else if (totalCount === 0) {
        editorial = "『今週はのんびり休息ウィーク！たまには家事を忘れて羽を伸ばすのも大切だぞ！』";
    }

    ctx.fillStyle = '#222';
    ctx.font = '16px "DotGothic16", sans-serif';
    ctx.fillText(editorial.slice(0, 24), 180, companionY + 75);
    if (editorial.length > 24) {
        ctx.fillText(editorial.slice(24), 180, companionY + 105);
    }

    // Footer
    ctx.textAlign = 'center';
    ctx.fillStyle = '#555';
    ctx.font = '14px "DotGothic16", sans-serif';
    ctx.fillText('✨ 坂本家 家事分担プロジェクト - 週刊カジゴン号外 ✨', width / 2, height - 50);

    canvas.toBlob(blob => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `kajigon_weekly_news_${new Date().toISOString().slice(0, 10)}.png`;
        a.click();
        URL.revokeObjectURL(url);
    }, 'image/png');
}

// 星屑 of ending sparkles
function generateSparkles() {
    const container = document.getElementById('ending-modal');
    const colors = ['#f59e0b', '#fbbf24', '#fef08a', '#e9d5ff', '#fff'];
    
    for (let i = 0; i < 40; i++) {
        const sparkle = document.createElement('div');
        sparkle.classList.add('sparkle');
        
        sparkle.style.left = Math.random() * 100 + 'vw';
        const size = Math.random() * 8 + 4;
        sparkle.style.width = size + 'px';
        sparkle.style.height = size + 'px';
        sparkle.style.background = colors[Math.floor(Math.random() * colors.length)];
        
        sparkle.style.animationDelay = Math.random() * 4 + 's';
        sparkle.style.animationDuration = (Math.random() * 3 + 2) + 's';
        sparkle.style.opacity = Math.random();

        container.appendChild(sparkle);
    }
}

// ==========================================================================
// --- ⭐ Lucky Chore Core Functions ---
// ==========================================================================
function getUniqueChoresList() {
    const allChores = new Set();
    for (const layout in BASE_TEMPLATES) {
        BASE_TEMPLATES[layout].forEach(section => {
            section.chores.forEach(chore => {
                allChores.add(chore);
            });
        });
    }
    return Array.from(allChores).sort();
}

function getLuckyChoreForDate(dateStr) {
    const chores = getUniqueChoresList();
    if (chores.length === 0) return "";
    
    // Categorize chores by attribute
    const fireChores = [];
    const waterChores = [];
    const windChores = [];
    const earthChores = [];
    
    chores.forEach(chore => {
        const stats = getChoreStats(chore);
        if (stats.attr === 'fire') {
            fireChores.push(chore);
        } else if (stats.attr === 'water') {
            waterChores.push(chore);
        } else if (stats.attr === 'wind') {
            windChores.push(chore);
        } else if (stats.attr === 'earth') {
            earthChores.push(chore);
        }
    });

    // Parse the date safely to determine day index since epoch
    const dateParts = dateStr.split('-');
    const year = parseInt(dateParts[0], 10);
    const month = parseInt(dateParts[1], 10) - 1;
    const day = parseInt(dateParts[2], 10);
    const dateObj = new Date(year, month, day, 12, 0, 0); // Noon to avoid timezone shifts
    const timeMs = dateObj.getTime();
    const dayIndex = Math.floor(timeMs / (1000 * 60 * 60 * 24));
    
    // Rotate through attributes: 0=fire, 1=water, 2=wind, 3=earth
    const attrIndex = Math.abs(dayIndex) % 4;
    
    let targetList = [];
    if (attrIndex === 0) {
        targetList = fireChores;
    } else if (attrIndex === 1) {
        targetList = waterChores;
    } else if (attrIndex === 2) {
        targetList = windChores;
    } else {
        targetList = earthChores;
    }
    
    // Fallback if target list is empty
    if (targetList.length === 0) {
        targetList = chores;
    }
    
    let hash = 0;
    for (let i = 0; i < dateStr.length; i++) {
        hash = dateStr.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % targetList.length;
    return targetList[index];
}

function updateLuckyChore() {
    const todayStr = getTodayDateString();
    luckyChore = getLuckyChoreForDate(todayStr);
    
    const badgeContainer = document.getElementById('lucky-chore-widget');
    if (badgeContainer) {
        const isDoneToday = kajigonState.lastLuckyDate === todayStr;
        badgeContainer.innerHTML = `
            <div class="lucky-chore-badge" style="${isDoneToday ? 'background-color: #0d0d13 !important; border-color: #0d0d13 !important; color: #555568 !important; text-decoration: line-through;' : ''}">
                ⭐今日のラッキー家事: ${luckyChore} (EXP 1.2倍)${isDoneToday ? ' (完了)' : ''}
            </div>
        `;
    }
}

// ==========================================================================
// --- 🎵 8-bit Retro Sound Engine (Web Audio API Synthesizer) ---
// ==========================================================================
const SoundEngine = {
    ctx: null,
    bgmGain: null,
    seGain: null,
    bgmVol: 0.3,
    seVol: 0.7,
    bgmPlaying: false,
    filterNode: null,

    init() {
        if (this.ctx) return;
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (!AudioContextClass) return;
        this.ctx = new AudioContextClass();

        // Master Low-pass filter for cozy warm retro warmth (cuts harsh shrill frequencies)
        this.filterNode = this.ctx.createBiquadFilter();
        this.filterNode.type = 'lowpass';
        this.filterNode.frequency.setValueAtTime(2200, this.ctx.currentTime);
        this.filterNode.connect(this.ctx.destination);

        // BGM Gain node
        this.bgmGain = this.ctx.createGain();
        this.bgmGain.gain.setValueAtTime(this.bgmVol, this.ctx.currentTime);
        this.bgmGain.connect(this.filterNode);

        // SE Gain node
        this.seGain = this.ctx.createGain();
        this.seGain.gain.setValueAtTime(this.seVol, this.ctx.currentTime);
        this.seGain.connect(this.ctx.destination);

        // Load saved preferences
        const savedBgm = localStorage.getItem('kajigon_bgm_vol');
        const savedSe = localStorage.getItem('kajigon_se_vol');
        if (savedBgm !== null) {
            this.setBGMVolume(parseFloat(savedBgm));
        }
        if (savedSe !== null) {
            this.setSEVolume(parseFloat(savedSe));
        }
    },

    resume() {
        if (!this.ctx) this.init();
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    },

    setBGMVolume(val) {
        this.bgmVol = Math.max(0, Math.min(1, val));
        if (this.bgmGain && this.ctx) {
            this.bgmGain.gain.setValueAtTime(this.bgmVol, this.ctx.currentTime);
        }
        localStorage.setItem('kajigon_bgm_vol', this.bgmVol);
        const slider = document.getElementById('bgmVolumeSlider');
        const text = document.getElementById('bgm-vol-text');
        if (slider) slider.value = Math.round(this.bgmVol * 100);
        if (text) text.textContent = `${Math.round(this.bgmVol * 100)}%`;
        const toggleBtn = document.getElementById('btn-sound-toggle');
        if (toggleBtn) {
            toggleBtn.textContent = (this.bgmVol === 0 && this.seVol === 0) ? '🔇' : '🔊';
        }
    },

    setSEVolume(val) {
        this.seVol = Math.max(0, Math.min(1, val));
        if (this.seGain && this.ctx) {
            this.seGain.gain.setValueAtTime(this.seVol, this.ctx.currentTime);
        }
        localStorage.setItem('kajigon_se_vol', this.seVol);
        const slider = document.getElementById('seVolumeSlider');
        const text = document.getElementById('se-vol-text');
        if (slider) slider.value = Math.round(this.seVol * 100);
        if (text) text.textContent = `${Math.round(this.seVol * 100)}%`;
        const toggleBtn = document.getElementById('btn-sound-toggle');
        if (toggleBtn) {
            toggleBtn.textContent = (this.bgmVol === 0 && this.seVol === 0) ? '🔇' : '🔊';
        }
    },

    playTone(freq, type, duration, startTime = 0, gainTarget = this.seGain, maxGain = 0.25) {
        if (!this.ctx || !gainTarget || freq <= 0) return;
        try {
            const osc = this.ctx.createOscillator();
            const noteGain = this.ctx.createGain();

            osc.type = type;
            osc.frequency.setValueAtTime(freq, this.ctx.currentTime + startTime);

            noteGain.gain.setValueAtTime(maxGain, this.ctx.currentTime + startTime);
            noteGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + startTime + duration);

            osc.connect(noteGain);
            noteGain.connect(gainTarget);

            osc.start(this.ctx.currentTime + startTime);
            osc.stop(this.ctx.currentTime + startTime + duration);
        } catch (e) {
            // Audio context might be suspended or closed
        }
    },

    playSE(type) {
        this.resume();
        if (this.seVol <= 0 || !this.ctx) return;

        if (type === 'done') {
            // Cheerful mellow 8-bit blip (E5 -> B5)
            this.playTone(659.25, 'triangle', 0.09, 0, this.seGain, 0.35);
            this.playTone(987.77, 'square', 0.14, 0.06, this.seGain, 0.3);
        } else if (type === 'undo') {
            // Cancel sound (G3 -> E3)
            this.playTone(196.00, 'triangle', 0.09, 0, this.seGain, 0.3);
            this.playTone(164.81, 'triangle', 0.14, 0.07, this.seGain, 0.3);
        } else if (type === 'lucky') {
            // Lucky chore fanfare (C5 -> E5 -> G5 -> C6)
            this.playTone(523.25, 'triangle', 0.09, 0, this.seGain, 0.35);
            this.playTone(659.25, 'triangle', 0.09, 0.07, this.seGain, 0.35);
            this.playTone(783.99, 'square', 0.10, 0.14, this.seGain, 0.3);
            this.playTone(1046.50, 'square', 0.28, 0.21, this.seGain, 0.35);
        } else if (type === 'artifact') {
            // Ancient relic sparkle (A5 -> D6 -> F#6 -> A6)
            this.playTone(880.00, 'triangle', 0.08, 0, this.seGain, 0.3);
            this.playTone(1174.66, 'triangle', 0.08, 0.06, this.seGain, 0.3);
            this.playTone(1479.98, 'square', 0.09, 0.12, this.seGain, 0.25);
            this.playTone(1760.00, 'triangle', 0.28, 0.18, this.seGain, 0.3);
        } else if (type === 'levelup') {
            // Victorious fanfare
            const notes = [523.25, 523.25, 523.25, 659.25, 783.99, 1046.50];
            const delays = [0, 0.1, 0.2, 0.3, 0.45, 0.6];
            notes.forEach((n, idx) => {
                this.playTone(n, 'square', idx === 5 ? 0.45 : 0.1, delays[idx], this.seGain, 0.35);
            });
        } else if (type === 'click') {
            // Short soft click
            this.playTone(750, 'triangle', 0.04, 0, this.seGain, 0.2);
        }
    },

    bgmTrack: 'village',

    setBGMTrack(trackName) {
        this.bgmTrack = trackName;
        localStorage.setItem('kajigon_bgm_track', trackName);
        if (this.bgmPlaying) {
            this.stopBGM();
            this.startBGM();
        }
    },

    startBGM() {
        this.resume();
        if (this.bgmPlaying || !this.ctx) return;
        this.bgmPlaying = true;
        this.bgmStep = 0;
        const text = document.getElementById('bgm-toggle-btn-text');
        if (text) text.textContent = 'BGM 一時停止';

        // 3 Distinct Chiptune compositions with rich 3/4-note chords, walking bass, and mellow melodies
        let chordProgression = [];
        let bassLine = [];
        let melodyLine = [];
        let tickInterval = 280;

        if (this.bgmTrack === 'ruins') {
            // --- Ruins of Time (Ancient Mystic Chill / Lofi) ---
            // Am7 -> Dm7 -> Fmaj7 -> E7
            chordProgression = [
                [220.00, 261.63, 329.63],
                [220.00, 261.63, 329.63],
                [146.83, 220.00, 261.63],
                [146.83, 220.00, 261.63],
                [174.61, 261.63, 329.63],
                [174.61, 261.63, 329.63],
                [164.81, 246.94, 329.63],
                [164.81, 246.94, 329.63]
            ];
            bassLine = [
                110.00, 110.00, 164.81, 110.00,
                146.83, 146.83, 220.00, 146.83,
                87.31, 87.31, 130.81, 87.31,
                82.41, 82.41, 123.47, 82.41,
                110.00, 130.81, 164.81, 220.00,
                146.83, 174.61, 220.00, 261.63,
                174.61, 164.81, 146.83, 130.81,
                82.41, 98.00, 110.00, 123.47
            ];
            melodyLine = [
                440.00, 0, 523.25, 0, 659.25, 587.33, 523.25, 0,
                587.33, 0, 523.25, 0, 440.00, 392.00, 440.00, 0,
                523.25, 0, 659.25, 0, 783.99, 659.25, 523.25, 0,
                659.25, 0, 587.33, 0, 493.88, 440.00, 493.88, 0,
                440.00, 523.25, 659.25, 783.99, 880.00, 0, 783.99, 0,
                659.25, 587.33, 523.25, 440.00, 523.25, 0, 0, 0,
                392.00, 440.00, 523.25, 659.25, 587.33, 0, 523.25, 0,
                493.88, 0, 440.00, 0, 415.30, 0, 440.00, 0
            ];
            tickInterval = 270;
        } else if (this.bgmTrack === 'tavern') {
            // --- Cozy Tavern & Fest (Upbeat Folk Chiptune) ---
            // F -> G -> Em -> Am
            chordProgression = [
                [174.61, 220.00, 261.63],
                [174.61, 220.00, 261.63],
                [196.00, 246.94, 293.66],
                [196.00, 246.94, 293.66],
                [164.81, 196.00, 246.94],
                [164.81, 196.00, 246.94],
                [220.00, 261.63, 329.63],
                [220.00, 261.63, 329.63]
            ];
            bassLine = [
                174.61, 174.61, 261.63, 174.61,
                196.00, 196.00, 293.66, 196.00,
                164.81, 164.81, 246.94, 164.81,
                220.00, 220.00, 329.63, 220.00,
                174.61, 220.00, 261.63, 174.61,
                196.00, 246.94, 293.66, 196.00,
                164.81, 196.00, 246.94, 164.81,
                220.00, 196.00, 174.61, 164.81
            ];
            melodyLine = [
                523.25, 587.33, 659.25, 523.25, 587.33, 659.25, 783.99, 0,
                659.25, 783.99, 880.00, 659.25, 783.99, 880.00, 987.77, 0,
                783.99, 659.25, 587.33, 659.25, 523.25, 440.00, 392.00, 0,
                440.00, 523.25, 659.25, 523.25, 440.00, 0, 523.25, 0,
                659.25, 0, 783.99, 0, 880.00, 783.99, 659.25, 0,
                587.33, 659.25, 783.99, 659.25, 587.33, 523.25, 440.00, 0,
                523.25, 659.25, 783.99, 880.00, 783.99, 659.25, 587.33, 0,
                523.25, 0, 440.00, 0, 523.25, 0, 0, 0
            ];
            tickInterval = 210;
        } else {
            // --- Default: Pokésleep & Cozy Tamagotchi Room (Lo-Fi Warm 8-bit) ---
            // Cmaj7 -> Am7 -> Dm7 -> G7 (Classic mellow loop)
            chordProgression = [
                [261.63, 329.63, 392.00, 493.88],
                [261.63, 329.63, 392.00, 493.88],
                [220.00, 261.63, 329.63, 392.00],
                [220.00, 261.63, 329.63, 392.00],
                [146.83, 220.00, 261.63, 349.23],
                [146.83, 220.00, 261.63, 349.23],
                [196.00, 246.94, 293.66, 349.23],
                [196.00, 246.94, 293.66, 349.23]
            ];
            bassLine = [
                130.81, 0, 196.00, 130.81,
                110.00, 0, 164.81, 110.00,
                146.83, 0, 220.00, 146.83,
                98.00, 0, 146.83, 196.00,
                130.81, 164.81, 196.00, 246.94,
                220.00, 196.00, 164.81, 130.81,
                146.83, 174.61, 220.00, 261.63,
                196.00, 174.61, 146.83, 123.47
            ];
            melodyLine = [
                523.25, 0, 659.25, 0, 783.99, 0, 659.25, 523.25,
                440.00, 0, 523.25, 0, 659.25, 0, 523.25, 0,
                587.33, 0, 523.25, 0, 440.00, 0, 392.00, 440.00,
                392.00, 0, 493.88, 0, 523.25, 0, 0, 0,
                783.99, 0, 659.25, 0, 523.25, 659.25, 783.99, 0,
                880.00, 0, 783.99, 0, 659.25, 0, 523.25, 0,
                587.33, 659.25, 587.33, 523.25, 440.00, 0, 493.88, 0,
                523.25, 0, 392.00, 0, 523.25, 0, 0, 0
            ];
            tickInterval = 290;
        }

        const totalSteps = melodyLine.length;

        this.bgmTimer = setInterval(() => {
            if (!this.bgmPlaying || this.bgmVol <= 0) return;

            const step = this.bgmStep % totalSteps;

            // 1. Warm Chord Pad (Soft triangle wave every 4 steps / measure start)
            if (step % 4 === 0) {
                const chordIdx = Math.floor(step / 4) % chordProgression.length;
                const chord = chordProgression[chordIdx];
                if (chord) {
                    chord.forEach((freq) => {
                        this.playTone(freq, 'triangle', 1.05, 0, this.bgmGain, 0.08);
                    });
                }
            }

            // 2. Soft Bassline (Round low sine/triangle)
            const bass = bassLine[step % bassLine.length];
            if (bass && bass > 0) {
                this.playTone(bass, 'triangle', 0.22, 0, this.bgmGain, 0.22);
            }

            // 3. Relaxing Melodic Lead (Gentle chime / soft square with decay)
            const mel = melodyLine[step];
            if (mel && mel > 0) {
                this.playTone(mel, 'sine', 0.24, 0, this.bgmGain, 0.20);
                // Subtle shimmer octave up
                if (step % 8 === 0) {
                    this.playTone(mel * 2, 'triangle', 0.15, 0.02, this.bgmGain, 0.05);
                }
            }

            this.bgmStep++;
        }, tickInterval);
    },

    stopBGM() {
        this.bgmPlaying = false;
        if (this.bgmTimer) {
            clearInterval(this.bgmTimer);
            this.bgmTimer = null;
        }
        const text = document.getElementById('bgm-toggle-btn-text');
        if (text) text.textContent = 'BGM 再生する';
    },

    toggleBGM() {
        if (this.bgmPlaying) {
            this.stopBGM();
        } else {
            this.startBGM();
        }
    }
};

// Open and Close Sound Modal
function openSoundModal() {
    SoundEngine.resume();
    SoundEngine.playSE('click');
    const modal = document.getElementById('sound-modal');
    if (modal) modal.classList.remove('hidden');

    // Sync sliders & track select
    const sliderBgm = document.getElementById('bgmVolumeSlider');
    const sliderSe = document.getElementById('seVolumeSlider');
    const trackSelect = document.getElementById('bgmTrackSelect');
    if (sliderBgm) sliderBgm.value = Math.round(SoundEngine.bgmVol * 100);
    if (sliderSe) sliderSe.value = Math.round(SoundEngine.seVol * 100);
    if (trackSelect) trackSelect.value = SoundEngine.bgmTrack;
}

function closeSoundModal() {
    SoundEngine.playSE('click');
    const modal = document.getElementById('sound-modal');
    if (modal) modal.classList.add('hidden');
}

function onBgmVolumeChange(val) {
    const num = parseInt(val, 10) / 100;
    SoundEngine.setBGMVolume(num);
    if (num > 0 && !SoundEngine.bgmPlaying) {
        SoundEngine.startBGM();
    } else if (num === 0 && SoundEngine.bgmPlaying) {
        SoundEngine.stopBGM();
    }
}

function onSeVolumeChange(val) {
    const num = parseInt(val, 10) / 100;
    SoundEngine.setSEVolume(num);
}

// User-interaction sound ignition
window.addEventListener('click', function() {
    SoundEngine.resume();
}, { once: true });
window.addEventListener('touchstart', function() {
    SoundEngine.resume();
}, { once: true });

// ==========================================================================
// --- 📜 Ancient Artifact Image (Canvas Generator) ---
// ==========================================================================
let currentAncientBlob = null;

function openAncientScrollModal() {
    SoundEngine.playSE('click');
    const modal = document.getElementById('ancient-scroll-modal');
    const loading = document.getElementById('ancient-loading');
    const previewImg = document.getElementById('ancient-preview-img');

    if (!modal) return;
    modal.classList.remove('hidden');
    if (loading) loading.style.display = 'block';
    if (previewImg) previewImg.style.display = 'none';

    // Generate ancient canvas in background
    setTimeout(() => {
        generateAncientCardCanvas().then(blob => {
            currentAncientBlob = blob;
            const url = URL.createObjectURL(blob);
            if (previewImg) {
                previewImg.src = url;
                previewImg.style.display = 'block';
            }
            if (loading) loading.style.display = 'none';
        }).catch(err => {
            console.error("Canvas generation failed:", err);
            if (loading) loading.textContent = "石板の生成に失敗しました。";
        });
    }, 100);
}

function closeAncientScrollModal() {
    SoundEngine.playSE('click');
    const modal = document.getElementById('ancient-scroll-modal');
    if (modal) modal.classList.add('hidden');
}

function saveAncientScrollImage() {
    SoundEngine.playSE('click');
    if (!currentAncientBlob) return;
    const todayStr = getTodayDateString();
    const a = document.createElement('a');
    a.href = URL.createObjectURL(currentAncientBlob);
    a.download = `kajigon_ancient_scroll_${todayStr}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    alert('古代の石板画像を保存しました！');
}

function shareAncientScrollImage() {
    SoundEngine.playSE('click');
    if (!currentAncientBlob) return;
    const todayStr = getTodayDateString();
    const file = new File([currentAncientBlob], `kajigon_ancient_scroll_${todayStr}.png`, { type: 'image/png' });

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
        navigator.share({
            title: '古代の家事碑文 - カジゴン',
            text: '今日のおうちの家事記録（古代の碑文）です！',
            files: [file]
        }).catch(err => {
            if (err.name !== 'AbortError') {
                saveAncientScrollImage();
            }
        });
    } else {
        // Fallback to saving image and prompt copy text
        saveAncientScrollImage();
    }
}

async function generateAncientCardCanvas() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    const width = 800;
    const padding = 40;
    
    // Gather chores data
    const todayStr = getTodayDateString();
    const doneNames = Array.from(new Set(
        completedList
            .filter(c => getDateKey(c.time) === todayStr)
            .map(c => c.name)
    ));

    const shareIncludeUndoneEl = document.getElementById('shareIncludeUndone');
    const includeUndone = shareIncludeUndoneEl ? shareIncludeUndoneEl.checked : true;

    const base = BASE_TEMPLATES[currentLayout] || [];
    const allTemplateChores = [];
    base.forEach(section => {
        const customName = customRoomNames[section.id] || section.defaultName;
        section.chores.forEach(chore => {
            const fullName = section.id === 'trash' ? chore : `${customName}：${chore}`;
            allTemplateChores.push(fullName);
        });
    });

    const undoneNames = includeUndone ? allTemplateChores.filter(n => !doneNames.includes(n)) : [];
    const message = document.getElementById('shareMessage') ? document.getElementById('shareMessage').value.trim() : '';
    const spell = generateSpellText();
    const currentLv = getLevel();
    const evolved = getEvolvedForm();

    // Calculate height dynamically
    let calculatedHeight = 440; // Base header + companion area
    calculatedHeight += Math.max(1, doneNames.length) * 32 + 50; // Done section
    if (includeUndone && undoneNames.length > 0) {
        calculatedHeight += undoneNames.length * 28 + 50; // Undone section
    }
    if (message) {
        calculatedHeight += 80; // Message box
    }
    calculatedHeight += 120; // Spell & footer area
    calculatedHeight = Math.max(760, calculatedHeight);

    const envKey = kajigonState.environmentTheme || 'classic';
    const envTheme = ENVIRONMENT_THEMES[envKey] || ENVIRONMENT_THEMES['classic'];
    const cvColors = envTheme.canvas;

    canvas.width = width;
    canvas.height = calculatedHeight;

    // 1. Draw Ancient Stone Slab Background (Theme-Adaptive)
    // Base slab
    ctx.fillStyle = cvColors.base;
    ctx.fillRect(0, 0, width, calculatedHeight);

    // Stone texture grain & cracks
    ctx.fillStyle = cvColors.grain;
    for (let i = 0; i < 400; i++) {
        const rx = (i * 97) % width;
        const ry = (i * 137) % calculatedHeight;
        const rw = (i % 5) + 2;
        const rh = (i % 3) + 2;
        ctx.fillRect(rx, ry, rw, rh);
    }

    // Outer ancient carved border
    ctx.strokeStyle = cvColors.borderOuter;
    ctx.lineWidth = 14;
    ctx.strokeRect(7, 7, width - 14, calculatedHeight - 14);

    // Inner sacred trim
    ctx.strokeStyle = cvColors.borderInner;
    ctx.lineWidth = 4;
    ctx.strokeRect(20, 20, width - 40, calculatedHeight - 40);

    // Decorative corner notches
    const cornerSize = 24;
    ctx.fillStyle = cvColors.corner;
    ctx.fillRect(20, 20, cornerSize, cornerSize);
    ctx.fillRect(width - 20 - cornerSize, 20, cornerSize, cornerSize);
    ctx.fillRect(20, calculatedHeight - 20 - cornerSize, cornerSize, cornerSize);
    ctx.fillRect(width - 20 - cornerSize, calculatedHeight - 20 - cornerSize, cornerSize, cornerSize);

    // 2. Title & Ancient Header
    ctx.fillStyle = cvColors.titleText;
    ctx.font = 'bold 30px "DotGothic16", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`◆ 古代の家事碑文 [${envTheme.name}] ◆`, width / 2, 65);

    ctx.fillStyle = '#a0a0b0';
    ctx.font = '16px "DotGothic16", monospace';
    ctx.fillText(`- KAJIGON CHRONICLE -  ${todayStr}  (${envTheme.icon} ${envTheme.boostLabel})`, width / 2, 95);

    // Divider line
    ctx.strokeStyle = '#3a3a4c';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(40, 115);
    ctx.lineTo(width - 40, 115);
    ctx.stroke();

    // 3. Companion Status Display (Left: Avatar, Right: Stats)
    const avatarBoxX = 50;
    const avatarBoxY = 135;
    const avatarBoxSize = 130;

    // Avatar Box
    ctx.fillStyle = '#12121c';
    ctx.fillRect(avatarBoxX, avatarBoxY, avatarBoxSize, avatarBoxSize);
    ctx.strokeStyle = '#8b5a2b';
    ctx.lineWidth = 3;
    ctx.strokeRect(avatarBoxX, avatarBoxY, avatarBoxSize, avatarBoxSize);

    // Load and draw avatar image if available, else emoji
    let avatarDrawn = false;
    let avatarImgSrc = "";
    if (currentLv <= 2) {
        avatarImgSrc = "";
    } else if (currentLv <= 5) {
        avatarImgSrc = "kajigon_baby.png";
    } else if (currentLv <= 9) {
        const envTheme = kajigonState.environmentTheme || 'classic';
        const teenMap = {
            volcano: 'teen_fire.png',
            abyss: 'teen_water.png',
            sky: 'teen_wind.png',
            earth: 'teen_earth.png',
            classic: 'teen_light.png',
            gameboy: 'teen_retro.png'
        };
        avatarImgSrc = teenMap[envTheme] || 'teen_light.png';
    } else {
        avatarImgSrc = evolved.file;
    }

    if (avatarImgSrc) {
        try {
            const img = new Image();
            img.src = avatarImgSrc;
            await new Promise((resolve) => {
                img.onload = () => {
                    ctx.drawImage(img, avatarBoxX + 10, avatarBoxY + 10, avatarBoxSize - 20, avatarBoxSize - 20);
                    avatarDrawn = true;
                    resolve();
                };
                img.onerror = () => resolve();
            });
        } catch(e) {
            avatarDrawn = false;
        }
    }

    if (!avatarDrawn) {
        ctx.font = '60px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(getCompanionEmoji(), avatarBoxX + avatarBoxSize / 2, avatarBoxY + avatarBoxSize / 2 + 22);
    }

    // Companion Details (Right side)
    const infoX = 205;
    ctx.textAlign = 'left';
    ctx.fillStyle = '#f4ede2';
    ctx.font = 'bold 24px "DotGothic16", sans-serif';
    const companionName = currentLv >= 10 ? evolved.name : `カジゴン (Lv.${currentLv})`;
    ctx.fillText(companionName, infoX, 170);

    ctx.font = '17px "DotGothic16", sans-serif';
    ctx.fillStyle = '#f59e0b';
    ctx.fillText(`経験値: ${kajigonState.totalExp} EXP  |  古代パーツ: ⚙️×${kajigonState.artifactCount}`, infoX, 205);

    // Attribute mini-gauges
    ctx.fillStyle = '#a0a0b0';
    ctx.font = '15px "DotGothic16", sans-serif';
    ctx.fillText(`🔥火:${kajigonState.firePoints}  💧水:${kajigonState.waterPoints}  🍃風:${kajigonState.windPoints}  🪵土:${kajigonState.earthPoints}`, infoX, 240);

    let curY = 300;

    // 4. Completed Chores Section
    ctx.fillStyle = '#10b981';
    ctx.font = 'bold 20px "DotGothic16", sans-serif';
    ctx.fillText('📜 本日の奉納（達成した家事）', 50, curY);
    curY += 15;

    ctx.strokeStyle = '#2d4a3e';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(50, curY);
    ctx.lineTo(width - 50, curY);
    ctx.stroke();
    curY += 26;

    // Find MVP chore
    let mvpChoreName = "";
    let maxPt = 0;
    doneNames.forEach(name => {
        const stats = getChoreStats(name);
        if (stats.pt > maxPt) {
            maxPt = stats.pt;
            mvpChoreName = name;
        }
    });

    if (doneNames.length === 0) {
        ctx.fillStyle = '#a0a0b0';
        ctx.font = '16px "DotGothic16", sans-serif';
        ctx.fillText('・（まだ家事の記録はありません）', 60, curY);
        curY += 30;
    } else {
        ctx.font = '17px "DotGothic16", sans-serif';
        doneNames.forEach(name => {
            const isMvp = (name === mvpChoreName && maxPt >= 3);
            ctx.fillStyle = isMvp ? '#ffd700' : '#34d399';
            ctx.fillText(isMvp ? '👑' : '✔', 60, curY);
            ctx.fillStyle = '#f4ede2';
            ctx.fillText(isMvp ? `${name} (本日の大功績！)` : name, 85, curY);
            curY += 30;
        });
    }

    // 5. Undone Chores Section (if included)
    if (includeUndone && undoneNames.length > 0) {
        curY += 15;
        ctx.fillStyle = '#e2e8f0';
        ctx.font = 'bold 18px "DotGothic16", sans-serif';
        ctx.fillText('⬜ これからやること', 50, curY);
        curY += 15;

        ctx.strokeStyle = '#3a3a4c';
        ctx.beginPath();
        ctx.moveTo(50, curY);
        ctx.lineTo(width - 50, curY);
        ctx.stroke();
        curY += 24;

        ctx.font = '15px "DotGothic16", sans-serif';
        ctx.fillStyle = '#94a3b8';
        undoneNames.forEach(name => {
            ctx.fillText(`・${name}`, 65, curY);
            curY += 26;
        });
    }

    // 🍳 Dinner Menu Box (if any)
    const dinnerMenuEl = document.getElementById('shareDinnerMenu');
    const dinnerMenu = dinnerMenuEl ? dinnerMenuEl.value.trim() : '';
    if (dinnerMenu) {
        curY += 15;
        ctx.fillStyle = '#1c1712';
        ctx.fillRect(50, curY, width - 100, 56);
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2;
        ctx.strokeRect(50, curY, width - 100, 56);

        ctx.fillStyle = '#fbbf24';
        ctx.font = 'bold 15px "DotGothic16", sans-serif';
        ctx.fillText('🍳 本日の献立・ごはん:', 65, curY + 22);

        ctx.fillStyle = '#fde68a';
        ctx.font = '16px "DotGothic16", sans-serif';
        ctx.fillText(dinnerMenu, 65, curY + 44);
        curY += 66;
    }

    // 6. Message Section (if any)
    if (message) {
        curY += 15;
        ctx.fillStyle = '#1a1926';
        ctx.fillRect(50, curY, width - 100, 65);
        ctx.strokeStyle = cvColors.borderInner;
        ctx.lineWidth = 2;
        ctx.strokeRect(50, curY, width - 100, 65);

        ctx.fillStyle = '#fbbf24';
        ctx.font = 'bold 15px "DotGothic16", sans-serif';
        ctx.fillText('💬 家族への伝言:', 65, curY + 24);

        ctx.fillStyle = '#f4ede2';
        ctx.font = '16px "DotGothic16", sans-serif';
        ctx.fillText(message, 65, curY + 48);
        curY += 75;
    }

    // 💌 Thanks Stamp Box
    const shareIncludeThanksEl = document.getElementById('shareIncludeThanks');
    const includeThanks = shareIncludeThanksEl ? shareIncludeThanksEl.checked : true;
    if (includeThanks) {
        curY += 10;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
        ctx.fillRect(50, curY, width - 100, 40);
        ctx.strokeStyle = '#3a3a4c';
        ctx.lineWidth = 1;
        ctx.strokeRect(50, curY, width - 100, 40);

        ctx.textAlign = 'center';
        ctx.fillStyle = '#e2e8f0';
        ctx.font = '14px "DotGothic16", sans-serif';
        ctx.fillText('💌 感謝の受領印: [ いつもありがとう！ 💖 大助かり！ 🌟 お疲れさま！ 🍵 ]', width / 2, curY + 25);
        ctx.textAlign = 'left';
        curY += 50;
    }

    // 7. Footer & Spell Key
    curY += 25;
    ctx.strokeStyle = '#3a3a4c';
    ctx.beginPath();
    ctx.moveTo(40, curY);
    ctx.lineTo(width - 40, curY);
    ctx.stroke();
    curY += 30;

    ctx.textAlign = 'center';
    ctx.fillStyle = '#a0a0b0';
    ctx.font = '14px "DotGothic16", monospace';
    ctx.fillText(`古代の封印キー [同期]: ${spell}`, width / 2, curY);

    curY += 22;
    ctx.fillStyle = '#71717a';
    ctx.font = '12px "DotGothic16", sans-serif';
    ctx.fillText('✨ カジゴン - RPG家事分担システム ✨', width / 2, curY);

    return new Promise(resolve => {
        canvas.toBlob(blob => resolve(blob), 'image/png');
    });
}

// ==========================================================================
// --- 📱 PWA Service Worker Registration & Cache Busting ---
// ==========================================================================
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js').then(reg => {
            // Check for updates immediately
            reg.update();
        }).catch(err => {
            console.log('PWA ServiceWorker registration failed:', err);
        });
    });

    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!refreshing) {
            refreshing = true;
            window.location.reload();
        }
    });
}

// 🔄 強制リロード＆キャッシュクリア関数（設定画面やトラブル時にタップ1発で最新化）
function forceReloadApp() {
    if ('caches' in window) {
        caches.keys().then(names => {
            return Promise.all(names.map(name => caches.delete(name)));
        }).then(() => {
            if ('serviceWorker' in navigator) {
                navigator.serviceWorker.getRegistrations().then(registrations => {
                    for (let reg of registrations) {
                        reg.unregister();
                    }
                    window.location.reload(true);
                });
            } else {
                window.location.reload(true);
            }
        });
    } else {
        window.location.reload(true);
    }
}


