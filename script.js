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
    forceSpecial: null
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
        document.getElementById('current-layout-display').textContent = `現在のおうち: ${currentLayout} / ${currentFloors}フロア`;
        
        // Update Artifact Indicator UI
        updateArtifactIndicator();
        
        // Apply retro theme on body
        applyTheme();

        // 初回の相棒表示
        updateCompanionWidget();

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
function openSettingsModal() {
    const modal = document.getElementById('settings-modal');
    modal.classList.remove('hidden');
    
    document.getElementById('settings-layout-select').value = currentLayout;
    document.getElementById('settings-floor-select').value = currentFloors;
    document.getElementById('settings-players-select').value = playerCount;

    generateSettingsRoomFields();
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

    saveToLocalStorage();
    closeSettingsModal();
    initApp();
}

// ==========================================================================
// --- Dynamic Buttons Rendering ---
// ==========================================================================
function renderQuickAddButtons() {
    const container = document.getElementById('quick-add-container');
    const base = BASE_TEMPLATES[currentLayout];
    
    if (!base) return;

    // Get unique names of all chores done today
    const todayStr = getTodayDateString();
    const doneTodayNames = new Set(
        completedList
            .filter(c => getDateKey(c.time) === todayStr)
            .map(c => c.name)
    );

    let sectionsHtml = base.map(section => {
        const customName = customRoomNames[section.id] || section.defaultName;
        
        return `
            <div class="quick-add-section">
                <span class="group-label">${customName}</span>
                <div class="quick-add-buttons">
                    ${section.chores.map(chore => {
                        const fullName = section.id === 'trash' ? chore : `${customName}：${chore}`;
                        const isDoneToday = doneTodayNames.has(fullName);
                        const stats = getChoreStats(fullName);
                        const attrClass = stats.attr ? `attr-${stats.attr}` : '';
                        const attrName = stats.attr || '';
                        
                        return `<button class="quick-add-btn ${attrClass} ${isDoneToday ? 'done' : ''}" ${isDoneToday ? 'disabled' : ''} onclick="addQuickChore('${fullName}', this)" onmouseenter="setTemporaryTheme('${attrName}')" onmouseleave="clearTemporaryTheme()">${chore}</button>`;
                    }).join('')}
                </div>
            </div>
        `;
    }).join('');

    // 階数（フロア数）に応じた階段掃除ボタンの動的追加
    if (currentFloors >= 2) {
        let stairsHtml = `
            <div class="quick-add-section">
                <span class="group-label">階段</span>
                <div class="quick-add-buttons">
        `;

        if (currentFloors >= 2) {
            const stair1Sweep = '1F〜2F階段：掃き掃除';
            const stair1Wipe = '1F〜2F階段：拭き掃除';
            const doneSweep = doneTodayNames.has(stair1Sweep);
            const doneWipe = doneTodayNames.has(stair1Wipe);
            
            stairsHtml += `
                <button class="quick-add-btn attr-wind ${doneSweep ? 'done' : ''}" ${doneSweep ? 'disabled' : ''} onclick="addQuickChore('${stair1Sweep}', this)" onmouseenter="setTemporaryTheme('wind')" onmouseleave="clearTemporaryTheme()">1F〜2F階段 掃き</button>
                <button class="quick-add-btn attr-earth ${doneWipe ? 'done' : ''}" ${doneWipe ? 'disabled' : ''} onclick="addQuickChore('${stair1Wipe}', this)" onmouseenter="setTemporaryTheme('earth')" onmouseleave="clearTemporaryTheme()">1F〜2F階段 拭き</button>
            `;
        }
        if (currentFloors === 3) {
            const stair2Sweep = '2F〜3F階段：掃き掃除';
            const stair2Wipe = '2F〜3F階段：拭き掃除';
            const doneSweep2 = doneTodayNames.has(stair2Sweep);
            const doneWipe2 = doneTodayNames.has(stair2Wipe);
            
            stairsHtml += `
                <button class="quick-add-btn attr-wind ${doneSweep2 ? 'done' : ''}" ${doneSweep2 ? 'disabled' : ''} onclick="addQuickChore('${stair2Sweep}', this)" onmouseenter="setTemporaryTheme('wind')" onmouseleave="clearTemporaryTheme()">2F〜3F階段 掃き</button>
                <button class="quick-add-btn attr-earth ${doneWipe2 ? 'done' : ''}" ${doneWipe2 ? 'disabled' : ''} onclick="addQuickChore('${stair2Wipe}', this)" onmouseenter="setTemporaryTheme('earth')" onmouseleave="clearTemporaryTheme()">2F〜3F階段 拭き</button>
            `;
        }

        stairsHtml += `
                </div>
            </div>
        `;
        
        sectionsHtml += stairsHtml;
    }

    container.innerHTML = sectionsHtml;
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
                forceSpecial: parsed.forceSpecial !== undefined ? parsed.forceSpecial : null
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
                forceSpecial: null
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
            forceSpecial: null
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
    
    if (stats.isOther) {
        kajigonState.firePoints += stats.pt;
        kajigonState.waterPoints += stats.pt;
        kajigonState.windPoints += stats.pt;
        kajigonState.earthPoints += stats.pt;
    } else if (stats.attr === 'fire') {
        kajigonState.firePoints += stats.pt;
    } else if (stats.attr === 'water') {
        kajigonState.waterPoints += stats.pt;
    } else if (stats.attr === 'wind') {
        kajigonState.windPoints += stats.pt;
    } else if (stats.attr === 'earth') {
        kajigonState.earthPoints += stats.pt;
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
        triggerCutIn(getCompanionEmoji(), () => {
            openEndingModal();
        });
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
    }
}

function undoDone(id) {
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
            const stats = getChoreStats(chore.name);
            const attrClass = stats.attr ? `attr-${stats.attr}` : '';
            const isSupply = chore.name.startsWith('[物品補充]');
            const isOther = chore.name.startsWith('[その他]');
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

            return `
                <div class="chore-item-completed ${attrClass}">
                    <div class="chore-item-completed-info">
                        <span class="chore-item-completed-name">${space}：${actions}</span>
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
        companionImgHtml = `
            <img class="companion-avatar-img" src="kajigon_teen.png" alt="ティーンカジゴン" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
            <div class="companion-avatar-emoji" style="display:none;">👾</div>
        `;
    } else { // final
        const selected = getEvolvedForm();
        companionImgHtml = `
            <img class="companion-avatar-img" src="${selected.file}" alt="${selected.name}" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
            <div class="companion-avatar-emoji" style="display:none;">${selected.attr === 'dark' ? '🤖' : '🐉'}</div>
        `;
    }

    let buttonsHtml = '';
    if (lv >= 10) {
        buttonsHtml = `
            <div class="legendary-action-buttons">
                <button class="btn-legendary btn-review" onclick="openEndingModal()" title="表彰状を見なおす">🏆 みなおす</button>
                <button class="btn-legendary btn-rebreed" onclick="rebreedCompanion()" title="卵からそだてなおす">🔄 そだてなおす</button>
            </div>
        `;
    }

    widget.innerHTML = `
        <div class="companion-widget-container">
            <div class="companion-status-card" title="おうちの様子">
                <div class="companion-display-row">
                    <div class="companion-avatar-box">
                        ${companionImgHtml}
                    </div>
                    <div class="companion-info-box">
                        <div class="companion-level">LV.${lv} (${stage.toUpperCase()})</div>
                        <div class="status-emoji-container">
                            ${emojisStr}
                        </div>
                    </div>
                </div>
            </div>
            ${buttonsHtml}
        </div>
    `;
}

// 🔄 卵からそだてなおす (Reset growth data only)
function rebreedCompanion() {
    if (window.confirm('現在の守護精霊を「そだてなおす」しますか？\nこれまでの経験値や属性ポイントがリセットされ、新しく卵（🥚）から育て直すことができます。\n※今日の家事履歴やカスタム部屋名は消えません。')) {
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
        applyTheme();
        updateArtifactIndicator();
        updateCompanionWidget();
        updateLuckyChore();

        // 卵出現のカットイン演出
        triggerCutIn('🥚', () => {
            alert('守護精霊は旅立ち、おうちへ新しく卵が届きました！');
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

    let doneText = Array.from(doneNames).map(name => `・${name}`).join('\n');
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
    const messageText = message ? `\n🙏 伝言・お願い\n${message}` : '';

    const spell = generateSpellText();
    const reportText = `🏠 今日の家事レポート\n\n✅ やったこと\n${doneText}${undoneSection}${messageText}\n\n💾同期用バックアップキー: ${spell}`;

    navigator.clipboard.writeText(reportText).then(() => {
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
    const isLightDragon = isForcedLight || (isLightCondition && kajigonState.artifactCount < 3) || maxVal === 0;

    if (isDarkGolem) {
        return {
            attr: 'dark',
            name: '👿 不完全なる闇 of 魔ゴーレム 🤖',
            file: 'golem_dark.png',
            desc: '古代パーツ（⚙️）が3個集まった、不穏で静かに佇む魔導のロボット。コアが怪しく光る不完全なドット絵姿です。'
        };
    }

    if (isLightDragon) {
        return {
            attr: 'light',
            name: '🌟 創世輝龍アルティマ 🐉',
            file: 'dragon_all.png',
            desc: 'すべての家事を愛と調和の心でバランスよくこなし、世界に調和をもたらしました。'
        };
    }

    // Seed-based fair pseudo-random choice if there is a tie but it didn't trigger Light condition
    const seed = kajigonState.totalExp;
    const winnerAttr = maxPtsList[seed % maxPtsList.length].attr;

    if (isGolemRoute) {
        switch (winnerAttr) {
            case 'fire':
                return {
                    attr: 'fire',
                    name: '🌋 獄炎魔ゴーレム 🤖',
                    file: 'golem_fire.png',
                    desc: 'おうちのシンクやコンロをピカピカに磨き上げ、熱い鉄の魂で暮らしを支えてくれました。'
                };
            case 'water':
                return {
                    attr: 'water',
                    name: '🌊 海王魔ゴーレム 🤖',
                    file: 'golem_water.png',
                    desc: 'お風呂や洗濯、食器洗いで水回りを清め、無休の歯車で清潔と潤いをもたらしてくれました。'
                };
            case 'wind':
                return {
                    attr: 'wind',
                    name: '🌪️ 嵐神魔ゴーレム 🤖',
                    file: 'golem_wind.png',
                    desc: '掃除機がけや階段の掃き掃除で埃を吸い込み、強力なファンで新しい風を送り続けてくれました。'
                };
            case 'earth':
                return {
                    attr: 'earth',
                    name: '🪵 巌帝魔ゴーレム 🤖',
                    file: 'golem_earth.png',
                    desc: '拭き掃除やゴミ捨て、ベッドメイキングを行い、どっしりとした金属の躯体でおうちの基礎を支えてくれました。'
                };
        }
    } else {
        switch (winnerAttr) {
            case 'fire':
                return {
                    attr: 'fire',
                    name: '🌋 獄炎龍ボルカノン 🦖',
                    file: 'dragon_fire.png',
                    desc: 'おうちのシンクやコンロをピカピカに磨き上げ、暮らしに熱い情熱の火を灯し続けてくれました。'
                };
            case 'water':
                return {
                    attr: 'water',
                    name: '🌊 海王神龍リヴァイア 🐙',
                    file: 'dragon_water.png',
                    desc: 'お風呂や洗濯、食器洗いで水回りを清め、家族みんなに清潔と潤いをもたらしてくれました。'
                };
            case 'wind':
                return {
                    attr: 'wind',
                    name: '🌪️ 嵐神翼龍ゼフィロス 🦅',
                    file: 'dragon_wind.png',
                    desc: '丁寧な掃除機がけや階段の掃き掃除でおうちの埃を吹き飛ばし、常に澄み切った新しい風を送り続けてくれました。'
                };
            case 'earth':
                return {
                    attr: 'earth',
                    name: '🪵 巌帝古龍ガイアード 🌲',
                    file: 'dragon_earth.png',
                    desc: '拭き掃除やゴミ捨て、ベッドメイキングでおうちの基礎をがっしりと支え、最高の安定感を与えてくれました。'
                };
        }
    }
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
    document.body.classList.remove('theme-fire', 'theme-water', 'theme-wind', 'theme-earth', 'theme-light', 'theme-dark');
    const activeTheme = tempTheme || getCurrentKajigonTheme();
    if (activeTheme) {
        document.body.classList.add(`theme-${activeTheme}`);
    }
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
