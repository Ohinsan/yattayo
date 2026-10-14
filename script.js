// ==========================================================================
// 🐉 家事分担くん (v2.6.0) - メイン・エントリーポイント
// ==========================================================================

const APP_VERSION = '2.6.0';
let tempSettingsLayout = '2ldk';
let tempSettingsFloors = 1;
let tempSettingsEnvTheme = null;

// ==========================================================================
// 🚀 アプリ初期化
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
    const hasData = loadFromLocalStorage();

    if (hasData) {
        document.getElementById('setup-screen').classList.add('hidden');
        document.getElementById('main-screen').classList.remove('hidden');
        
        applyTheme();
        updateCompanionWidget();
        renderQuickAddButtons();
        renderCompleted();
        updateLuckyChore();
        renderBountyWidget();

        // Lv.10到達で未見ならエンディング画面
        if (getLevel() >= 10 && !kajigonState.endingSeen) {
            triggerEndingPresentation();
        }
    } else {
        document.getElementById('setup-screen').classList.remove('hidden');
        document.getElementById('main-screen').classList.add('hidden');
        generateSetupRoomFields();
    }

    // 毎分、窓の時間帯チェック
    setInterval(() => {
        if (typeof updateRoomWindow === 'function') {
            updateRoomWindow();
        }
    }, 60000);

    // PWA更新チェック
    initServiceWorker();
});

// ==========================================================================
// 🛠️ 間取りセットアップ画面
// ==========================================================================
function onSetupLayoutChange() {
    generateSetupRoomFields();
}

function generateSetupRoomFields() {
    const layout = document.getElementById('setupLayout').value;
    const container = document.getElementById('setupRoomFields');
    if (!container) return;

    const base = BASE_TEMPLATES[layout] || [];
    container.innerHTML = base.map(section => {
        if (section.id === 'trash') return '';
        const icon = getRoomIcon(section.id, section.defaultName);
        return `
            <div style="display:flex; align-items:center; gap:0.5rem; margin-bottom:0.4rem;">
                <span>${icon}</span>
                <input type="text" id="setup_room_${section.id}" value="${section.defaultName}" placeholder="${section.defaultName}" style="flex:1; padding:0.4rem; background:#14141f; color:#fff; border:1px solid #444; border-radius:4px; font-size:12px;">
            </div>
        `;
    }).join('');
}

function submitSetup() {
    if (typeof SoundEngine !== 'undefined') SoundEngine.playSE('click');
    const layout = document.getElementById('setupLayout').value;
    const floors = parseInt(document.getElementById('setupFloors').value, 10) || 1;
    const players = parseInt(document.getElementById('setupPlayers').value, 10) || 1;

    currentLayout = layout;
    currentFloors = floors;
    playerCount = players;
    customRoomNames = {};

    const base = BASE_TEMPLATES[layout] || [];
    base.forEach(section => {
        if (section.id === 'trash') return;
        const input = document.getElementById(`setup_room_${section.id}`);
        if (input && input.value.trim()) {
            customRoomNames[section.id] = input.value.trim();
        }
    });

    saveToLocalStorage();

    document.getElementById('setup-screen').classList.add('hidden');
    document.getElementById('main-screen').classList.remove('hidden');

    applyTheme();
    updateCompanionWidget();
    renderQuickAddButtons();
    renderCompleted();
    updateLuckyChore();
    renderBountyWidget();

    if (typeof showToast === 'function') {
        showToast('🏡 ようこそ！カジゴンとの新生活が始まりました！');
    }
}

// ==========================================================================
// ⚙️ 設定モーダル（お部屋・テーマ・フロア）
// ==========================================================================
function openSettingsModal() {
    if (typeof SoundEngine !== 'undefined') SoundEngine.playSE('click');
    tempSettingsLayout = currentLayout;
    tempSettingsFloors = currentFloors;
    tempSettingsEnvTheme = kajigonState.environmentTheme || 'classic';

    const layoutSelect = document.getElementById('settingsLayout');
    const floorsSelect = document.getElementById('settingsFloors');
    const playersSelect = document.getElementById('settingsPlayers');

    if (layoutSelect) layoutSelect.value = currentLayout;
    if (floorsSelect) floorsSelect.value = currentFloors;
    if (playersSelect) playersSelect.value = playerCount || 1;

    generateSettingsRoomFields();
    renderSettingsThemeCards();

    const modal = document.getElementById('settings-modal');
    if (modal) modal.classList.remove('hidden');
}

function closeSettingsModal() {
    if (typeof SoundEngine !== 'undefined') SoundEngine.playSE('click');
    const modal = document.getElementById('settings-modal');
    if (modal) modal.classList.add('hidden');
}

function renderSettingsThemeCards() {
    const container = document.getElementById('settings-theme-selector');
    if (!container) return;

    const currentLvl = getLevel();
    const isUnlocked = currentLvl >= 10;
    const currentTheme = kajigonState.environmentTheme || 'classic';

    container.innerHTML = Object.keys(ENVIRONMENT_THEMES).map(key => {
        const t = ENVIRONMENT_THEMES[key];
        const isCurrent = key === currentTheme;
        const isActive = tempSettingsEnvTheme === key;
        const isLocked = !isUnlocked && !isCurrent;

        return `
            <div class="theme-card-btn ${isActive ? 'active' : ''} ${isLocked ? 'locked-field' : ''}" 
                 onclick="selectSettingsTheme('${key}')"
                 style="cursor:${isLocked ? 'not-allowed' : 'pointer'}; opacity:${isLocked ? 0.6 : 1}; background:#14141f; border:2px solid ${isActive ? 'var(--accent)' : '#444'}; border-radius:8px; padding:0.6rem; margin-bottom:0.5rem; display:flex; align-items:center; gap:0.6rem;">
                <div style="font-size:24px;">${t.icon}</div>
                <div style="flex:1;">
                    <div style="font-weight:bold; font-size:13px; color:#fff;">${t.name} ${isCurrent ? '<span style="color:#10b981; font-size:10px;">(滞在中)</span>' : (isLocked ? '<span style="color:#ef4444; font-size:10px;">🔒Lv.10解放</span>' : '')}</div>
                    <div style="font-size:11px; color:#fbbf24;">${t.boostLabel}</div>
                </div>
            </div>
        `;
    }).join('');
}

function selectSettingsTheme(key) {
    if (getLevel() < 10 && key !== (kajigonState.environmentTheme || 'classic')) {
        alert(`🔒 新しいフィールドは Lv.10 到達で選べるようになります！（現在 Lv.${getLevel()}）`);
        return;
    }
    if (typeof SoundEngine !== 'undefined') SoundEngine.playSE('click');
    tempSettingsEnvTheme = key;
    renderSettingsThemeCards();
}

function generateSettingsRoomFields() {
    const layout = document.getElementById('settingsLayout') ? document.getElementById('settingsLayout').value : currentLayout;
    const container = document.getElementById('settings-room-names-container');
    if (!container) return;

    const base = BASE_TEMPLATES[layout] || [];
    container.innerHTML = base.map(section => {
        if (section.id === 'trash') return '';
        const curName = customRoomNames[section.id] || section.defaultName;
        const icon = getRoomIcon(section.id, curName);
        return `
            <div style="display:flex; align-items:center; gap:0.5rem; margin-bottom:0.4rem;">
                <span>${icon}</span>
                <input type="text" id="settings_room_${section.id}" value="${curName}" style="flex:1; padding:0.4rem; background:#14141f; color:#fff; border:1px solid #444; border-radius:4px; font-size:12px;">
            </div>
        `;
    }).join('');
}

function onSettingsLayoutChange() {
    generateSettingsRoomFields();
}

function saveSettings() {
    if (typeof SoundEngine !== 'undefined') SoundEngine.playSE('click');
    const layoutSelect = document.getElementById('settingsLayout');
    const floorsSelect = document.getElementById('settingsFloors');
    const playersSelect = document.getElementById('settingsPlayers');

    if (layoutSelect) currentLayout = layoutSelect.value;
    if (floorsSelect) currentFloors = parseInt(floorsSelect.value, 10) || 1;
    if (playersSelect) playerCount = parseInt(playersSelect.value, 10) || 1;

    const base = BASE_TEMPLATES[currentLayout] || [];
    base.forEach(section => {
        if (section.id === 'trash') return;
        const input = document.getElementById(`settings_room_${section.id}`);
        if (input && input.value.trim()) {
            customRoomNames[section.id] = input.value.trim();
        }
    });

    if (tempSettingsEnvTheme && getLevel() >= 10) {
        kajigonState.environmentTheme = tempSettingsEnvTheme;
    }

    saveToLocalStorage();
    applyTheme();
    updateCompanionWidget();
    renderQuickAddButtons();
    closeSettingsModal();

    if (typeof showToast === 'function') {
        showToast('⚙️ お部屋の設定を保存しました！');
    }
}

// ==========================================================================
// 🪚 モーダル開閉制御（家事きろく・工房・図鑑・討伐・サウンド・共有）
// ==========================================================================
function openChoreSelectModal() {
    if (typeof SoundEngine !== 'undefined') SoundEngine.playSE('click');
    const modal = document.getElementById('chore-select-modal');
    if (modal) modal.classList.remove('hidden');
    renderQuickAddButtons();
}

function closeChoreSelectModal() {
    if (typeof SoundEngine !== 'undefined') SoundEngine.playSE('click');
    const modal = document.getElementById('chore-select-modal');
    if (modal) modal.classList.add('hidden');
}

function openWorkshopModal() {
    if (typeof SoundEngine !== 'undefined') SoundEngine.playSE('click');
    const modal = document.getElementById('workshop-modal');
    if (modal) modal.classList.remove('hidden');
    if (typeof renderCraftWorkshopModal === 'function') {
        renderCraftWorkshopModal();
    }
}

function closeWorkshopModal() {
    if (typeof SoundEngine !== 'undefined') SoundEngine.playSE('click');
    const modal = document.getElementById('workshop-modal');
    if (modal) modal.classList.add('hidden');
}

function openBookModal() {
    if (typeof SoundEngine !== 'undefined') SoundEngine.playSE('click');
    const modal = document.getElementById('book-modal');
    if (modal) modal.classList.remove('hidden');
    if (typeof renderBookModal === 'function') {
        renderBookModal();
    }
}

function closeBookModal() {
    if (typeof SoundEngine !== 'undefined') SoundEngine.playSE('click');
    const modal = document.getElementById('book-modal');
    if (modal) modal.classList.add('hidden');
}

function openKarutaAlbumModal() {
    if (typeof SoundEngine !== 'undefined') SoundEngine.playSE('click');
    currentBookTab = 'karuta';
    openBookModal();
}

function openBountyModal() {
    if (typeof SoundEngine !== 'undefined') SoundEngine.playSE('click');
    const modal = document.getElementById('bounty-modal');
    if (modal) modal.classList.remove('hidden');
    if (typeof renderBountyWidget === 'function') {
        renderBountyWidget();
    }
}

function closeBountyModal() {
    if (typeof SoundEngine !== 'undefined') SoundEngine.playSE('click');
    const modal = document.getElementById('bounty-modal');
    if (modal) modal.classList.add('hidden');
}

function openSoundModal() {
    if (typeof SoundEngine !== 'undefined') SoundEngine.playSE('click');
    const modal = document.getElementById('sound-modal');
    if (modal) modal.classList.remove('hidden');
}

function closeSoundModal() {
    if (typeof SoundEngine !== 'undefined') SoundEngine.playSE('click');
    const modal = document.getElementById('sound-modal');
    if (modal) modal.classList.add('hidden');
}

function openShareActionModal() {
    if (typeof SoundEngine !== 'undefined') SoundEngine.playSE('click');
    const modal = document.getElementById('share-action-modal');
    if (modal) modal.classList.remove('hidden');
}

function closeShareActionModal() {
    if (typeof SoundEngine !== 'undefined') SoundEngine.playSE('click');
    const modal = document.getElementById('share-action-modal');
    if (modal) modal.classList.add('hidden');
}

function openSpellModal() {
    if (typeof SoundEngine !== 'undefined') SoundEngine.playSE('click');
    const modal = document.getElementById('spell-modal');
    if (modal) modal.classList.remove('hidden');
}

function closeSpellModal() {
    if (typeof SoundEngine !== 'undefined') SoundEngine.playSE('click');
    const modal = document.getElementById('spell-modal');
    if (modal) modal.classList.add('hidden');
}

// ==========================================================================
// 📱 共有＆バックアップ同期キー
// ==========================================================================
function generateSpellText() {
    const lv = getLevel();
    return `KJ-LV${lv}-F${Math.round(kajigonState.firePoints)}-W${Math.round(kajigonState.waterPoints)}-A${Math.round(kajigonState.windPoints)}-E${Math.round(kajigonState.earthPoints)}`;
}

function shareReport() {
    const todayStr = getTodayDateString();
    const doneNames = Array.from(new Set(
        completedList.filter(c => getDateKey(c.time) === todayStr).map(c => c.name)
    ));
    const dragonName = kajigonState.companionName || 'カジゴン';
    const lv = getLevel();

    let text = `🧹【本日のおうち家事レポート】(${todayStr})\n相棒: ${dragonName} (Lv.${lv})\n\n`;
    if (doneNames.length > 0) {
        text += `✨ 完了した家事:\n` + doneNames.map(n => `✔ ${n}`).join('\n') + `\n\n`;
    } else {
        text += `・今日の記録はまだありません\n\n`;
    }

    const dinner = document.getElementById('shareDinnerMenu') ? document.getElementById('shareDinnerMenu').value.trim() : '';
    if (dinner) text += `🍳 今日の献立: ${dinner}\n`;

    const msg = document.getElementById('shareMessage') ? document.getElementById('shareMessage').value.trim() : '';
    if (msg) text += `💬 伝言: ${msg}\n`;

    text += `\n同期キー: ${generateSpellText()}\n#家事分担くん`;

    if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => {
            alert('レポートテキストをクリップボードにコピーしました！\nLINEや家族チャットに貼り付けて共有してください。');
        });
    } else {
        prompt('以下のテキストをコピーしてください：', text);
    }
}

function castSpell() {
    const input = document.getElementById('spellInput');
    if (!input || !input.value.trim()) return;
    const key = input.value.trim();

    const m = key.match(/^KJ-LV(\d+)-F(\d+)-W(\d+)-A(\d+)-E(\d+)$/);
    if (!m) {
        alert('同期キーの形式が正しくありません。\n例: KJ-LV3-F10-W20-A5-E15');
        return;
    }

    kajigonState.firePoints = parseInt(m[2], 10);
    kajigonState.waterPoints = parseInt(m[3], 10);
    kajigonState.windPoints = parseInt(m[4], 10);
    kajigonState.earthPoints = parseInt(m[5], 10);
    kajigonState.totalExp = (parseInt(m[1], 10) - 1) * 150 + 10;

    saveToLocalStorage();
    applyTheme();
    updateCompanionWidget();
    closeSpellModal();
    alert('同期が完了しました！');
}

// ==========================================================================
// ⭐ 今日のラッキー家事判定
// ==========================================================================
function updateLuckyChore() {
    const todayStr = getTodayDateString();
    luckyChore = getLuckyChoreForDate(todayStr);

    const badgeContainer = document.getElementById('lucky-chore-container');
    if (badgeContainer) {
        const isDoneToday = kajigonState.lastLuckyDate === todayStr;
        badgeContainer.innerHTML = `
            <div class="lucky-chore-badge" style="${isDoneToday ? 'opacity:0.6; text-decoration:line-through;' : ''}">
                ⭐ 今日のラッキー家事：${luckyChore} (EXP 1.2倍) ${isDoneToday ? '【達成済】' : ''}
            </div>
        `;
    }
}

function getLuckyChoreForDate(dateStr) {
    const chores = ['料理', '食器洗い', 'シンクの掃除', '掃除機がけ', '洗濯', '洗濯物を干す', '浴槽・浴室の掃除', 'トイレ掃除', 'ごみ捨て'];
    let hash = 0;
    for (let i = 0; i < dateStr.length; i++) {
        hash = (hash * 31 + dateStr.charCodeAt(i)) >>> 0;
    }
    return chores[hash % chores.length];
}

// ==========================================================================
// 🏆 感動の表彰エンディング
// ==========================================================================
function triggerEndingPresentation() {
    kajigonState.endingSeen = true;
    saveToLocalStorage();

    const modal = document.getElementById('ending-modal');
    const imgEl = document.getElementById('ending-dragon-image');
    const nameEl = document.getElementById('ending-dragon-name');
    const descEl = document.getElementById('ending-dragon-desc');

    const evolved = getEvolvedForm();
    if (imgEl) imgEl.src = evolved.file;
    if (nameEl) nameEl.textContent = `${evolved.name} （${kajigonState.companionName || 'カジゴン'}）`;
    if (descEl) descEl.textContent = evolved.desc;

    if (modal) modal.classList.remove('hidden');
    if (typeof SoundEngine !== 'undefined') SoundEngine.playSE('level_up');
}

function closeEndingModal() {
    const modal = document.getElementById('ending-modal');
    if (modal) modal.classList.add('hidden');
}

// ==========================================================================
// 📱 PWA Service Worker
// ==========================================================================
function initServiceWorker() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./sw.js').then(reg => {
            reg.update();
        }).catch(err => {
            console.warn('SW registration failed:', err);
        });
    }
}

function forceReloadApp() {
    if ('caches' in window) {
        caches.keys().then(names => {
            return Promise.all(names.map(name => caches.delete(name)));
        }).then(() => {
            window.location.reload(true);
        });
    } else {
        window.location.reload(true);
    }
}
