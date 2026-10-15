// ==========================================================================
// 🐉 家事分担くん (v2.9.0) - メイン・エントリーポイント
// ==========================================================================

const APP_VERSION = '2.9.0';
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
        const bottomNav = document.getElementById('cozy-bottom-nav');
        if (bottomNav) bottomNav.classList.remove('hidden');
        
        applyTheme();
        updateCompanionWidget();
        renderQuickAddButtons();
        renderCompleted();
        updateLuckyChore();
        renderBountyWidget();

        // 🌅 時間帯別アンビエント照明＆BGM判定
        if (typeof updateRoomAmbientLighting === 'function') updateRoomAmbientLighting();

        // 🏆 実績＆二つ名称号チェック
        if (typeof checkAchievementsAndTitles === 'function') checkAchievementsAndTitles();

        // 🏛️ 殿堂入り先輩カジゴンのひょっこり里帰りチェック
        if (typeof checkHallOfFameVisitor === 'function') checkHallOfFameVisitor();

        // Lv.10到達で未見ならエンディング画面
        if (getLevel() >= 10 && !kajigonState.endingSeen) {
            triggerEndingPresentation();
        }

        // 🎁 おみやげチェック ＆ 📖 日記初期化
        if (typeof checkCompanionGift === 'function') checkCompanionGift();
        if (typeof initCompanionDiary === 'function') initCompanionDiary();
    } else {
        document.getElementById('setup-screen').classList.remove('hidden');
        document.getElementById('main-screen').classList.add('hidden');
        const bottomNav = document.getElementById('cozy-bottom-nav');
        if (bottomNav) bottomNav.classList.add('hidden');
        updateSetupUI();
    }

    // 毎分、窓・照明・おみやげ・BGM・里帰り・カジゴン状態の定期チェック
    setInterval(() => {
        if (typeof updateRoomWindow === 'function') {
            updateRoomWindow();
        }
        if (typeof updateRoomAmbientLighting === 'function') {
            updateRoomAmbientLighting();
        }
        if (typeof checkCompanionGift === 'function') {
            checkCompanionGift();
        }
        if (typeof checkHallOfFameVisitor === 'function') {
            checkHallOfFameVisitor();
        }
        if (typeof SoundEngine !== 'undefined' && SoundEngine.checkTimeSlotChange) {
            SoundEngine.checkTimeSlotChange();
        }
        if (typeof updateCompanionWidget === 'function') {
            updateCompanionWidget();
        }
    }, 60000);

    // 💌 パートナーからのワンタップ同期URLチェック
    checkUrlSync();

    // PWA更新チェック
    initServiceWorker();
});

// ==========================================================================
// 🛠️ 間取りセットアップ画面（3-Step ボタン選択UI）
// ==========================================================================
let tempLayout = '2LDK';
let tempFloors = 1;
let tempPlayers = 1;

function setSetupLayout(layout) {
    if (typeof SoundEngine !== 'undefined') SoundEngine.playSE('click');
    tempLayout = layout;
    updateSetupUI();
}

function setSetupFloors(floors) {
    if (typeof SoundEngine !== 'undefined') SoundEngine.playSE('click');
    tempFloors = floors;
    updateSetupUI();
}

function setSetupPlayers(players) {
    if (typeof SoundEngine !== 'undefined') SoundEngine.playSE('click');
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
    if (typeof SoundEngine !== 'undefined') SoundEngine.playSE('click');
    currentLayout = tempLayout;
    currentFloors = tempFloors;
    playerCount = tempPlayers;

    customRoomNames = {};
    const base = BASE_TEMPLATES[currentLayout] || BASE_TEMPLATES['2LDK'];
    base.forEach(room => {
        customRoomNames[room.id] = room.defaultName;
    });

    saveToLocalStorage();

    document.getElementById('setup-screen').classList.add('hidden');
    document.getElementById('main-screen').classList.remove('hidden');
    const bottomNav = document.getElementById('cozy-bottom-nav');
    if (bottomNav) bottomNav.classList.remove('hidden');

    applyTheme();
    updateCompanionWidget();
    renderQuickAddButtons();
    renderCompleted();
    updateLuckyChore();
    renderBountyWidget();

    if (typeof updateRoomAmbientLighting === 'function') updateRoomAmbientLighting();
    if (typeof checkCompanionGift === 'function') checkCompanionGift();
    if (typeof initCompanionDiary === 'function') initCompanionDiary();
    if (typeof checkAchievementsAndTitles === 'function') checkAchievementsAndTitles();

    if (typeof showToast === 'function') {
        showToast('🏡 ようこそ！カジゴンとの新生活が始まりました！');
    }
}

// 🏡 お部屋トップへスクロール＆モーダルクローズ
function scrollToRoomTop() {
    document.querySelectorAll('.spell-overlay, .ending-overlay').forEach(el => el.classList.add('hidden'));
    const room = document.getElementById('tamagotchi-room-container');
    if (room) {
        room.scrollIntoView({ behavior: 'smooth' });
    } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

// ==========================================================================
// 🌟 家事完了時の手触り（Juice）演出：EXPオーブ放物線飛翔 ＆ カジゴン歓喜
// ==========================================================================
function spawnExpOrbs(fromSource, onArrival) {
    const petWrapper = document.getElementById('room-pet-wrapper');
    if (!petWrapper) {
        if (onArrival) onArrival();
        return;
    }

    // 始点座標 (startX, startY)
    let startX = window.innerWidth / 2;
    let startY = window.innerHeight / 2;

    if (fromSource && fromSource.getBoundingClientRect) {
        const rect = fromSource.getBoundingClientRect();
        startX = rect.left + rect.width / 2;
        startY = rect.top + rect.height / 2;
    } else if (fromSource && fromSource.clientX) {
        startX = fromSource.clientX;
        startY = fromSource.clientY;
    }

    // 終点座標（カジゴンの中心）
    const targetRect = petWrapper.getBoundingClientRect();
    const targetX = targetRect.left + targetRect.width / 2;
    const targetY = targetRect.top + targetRect.height / 2;

    const orbCount = 5;
    let arrived = false;

    for (let i = 0; i < orbCount; i++) {
        setTimeout(() => {
            const orb = document.createElement('div');
            orb.className = 'exp-orb';
            document.body.appendChild(orb);

            const duration = 520; // ms
            const startTime = performance.now();

            // 放物線のアーチ頂点
            const midX = (startX + targetX) / 2 + (Math.random() - 0.5) * 60;
            const midY = Math.min(startY, targetY) - 50 - Math.random() * 50;

            function animateOrb(currentTime) {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);

                // 2次ベジェ曲線
                const t = progress;
                const invT = 1 - t;
                const curX = invT * invT * startX + 2 * invT * t * midX + t * t * targetX;
                const curY = invT * invT * startY + 2 * invT * t * midY + t * t * targetY;

                orb.style.left = `${curX}px`;
                orb.style.top = `${curY}px`;

                // 光の軌跡（トレイル）
                if (Math.random() < 0.6) {
                    const trail = document.createElement('div');
                    trail.className = 'exp-orb-trail';
                    trail.style.left = `${curX}px`;
                    trail.style.top = `${curY}px`;
                    document.body.appendChild(trail);
                    setTimeout(() => {
                        if (trail.parentNode) trail.parentNode.removeChild(trail);
                    }, 350);
                }

                if (progress < 1) {
                    requestAnimationFrame(animateOrb);
                } else {
                    if (orb.parentNode) orb.parentNode.removeChild(orb);
                    if (!arrived) {
                        arrived = true;
                        triggerCompanionJoy();
                        if (onArrival) onArrival();
                    }
                }
            }

            requestAnimationFrame(animateOrb);
        }, i * 60);
    }
}

function triggerCompanionJoy() {
    const petWrapper = document.getElementById('room-pet-wrapper');
    if (petWrapper) {
        petWrapper.classList.remove('orb-impact-flash', 'pet-spring-bounce');
        void petWrapper.offsetWidth;
        petWrapper.classList.add('orb-impact-flash');
        setTimeout(() => {
            petWrapper.classList.remove('orb-impact-flash');
        }, 500);
    }

    // EXPバッジのキラッと光る演出
    const expBadge = document.getElementById('room-status-exp');
    if (expBadge) {
        expBadge.style.transition = 'transform 0.25s ease, color 0.25s ease';
        expBadge.style.color = '#ffd700';
        expBadge.style.transform = 'scale(1.18)';
        setTimeout(() => {
            expBadge.style.transform = 'scale(1)';
            expBadge.style.color = '';
        }, 350);
    }

    // ハートがふわっと舞う
    if (typeof createFloatingHearts === 'function') {
        createFloatingHearts(petWrapper);
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

    const layoutSelect = document.getElementById('settings-layout-select');
    const floorsSelect = document.getElementById('settings-floor-select');
    const playersSelect = document.getElementById('settings-players-select');

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
    const layoutSelect = document.getElementById('settings-layout-select');
    const layout = layoutSelect ? layoutSelect.value : currentLayout;
    const container = document.getElementById('settings-room-names-container');
    if (!container) return;

    const base = BASE_TEMPLATES[layout] || BASE_TEMPLATES['2LDK'];
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
    const layoutSelect = document.getElementById('settings-layout-select');
    const floorsSelect = document.getElementById('settings-floor-select');
    const playersSelect = document.getElementById('settings-players-select');

    if (layoutSelect) currentLayout = layoutSelect.value;
    if (floorsSelect) currentFloors = parseInt(floorsSelect.value, 10) || 1;
    if (playersSelect) playerCount = parseInt(playersSelect.value, 10) || 1;

    const base = BASE_TEMPLATES[currentLayout] || BASE_TEMPLATES['2LDK'];
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
// ==========================================================================
// 📱 共有＆ワンタップURL同期システム
// ==========================================================================
let pendingSyncData = null;

function generateSpellText() {
    const lv = getLevel();
    return `KJ-LV${lv}-F${Math.round(kajigonState.firePoints)}-W${Math.round(kajigonState.waterPoints)}-A${Math.round(kajigonState.windPoints)}-E${Math.round(kajigonState.earthPoints)}`;
}

/**
 * 🔗 ワンタップ同期用URLの生成
 */
function generateSyncUrl() {
    const spell = generateSpellText();
    const origin = window.location.origin;
    const pathname = window.location.pathname;
    return `${origin}${pathname}?sync=${encodeURIComponent(spell)}&t=${Date.now()}`;
}

/**
 * 🔗 ワンタップ同期リンクをクリップボードにコピー
 */
function copySyncUrl() {
    if (typeof SoundEngine !== 'undefined') SoundEngine.playSE('click');
    const url = generateSyncUrl();
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(() => {
            if (typeof showToast === 'function') {
                showToast('🔗 同期リンクをコピーしました！パートナーにLINE等で送ればワンタップで同期できます');
            }
        }).catch(() => {
            prompt('以下の同期リンクをコピーしてパートナーに送ってください：', url);
        });
    } else {
        prompt('以下の同期リンクをコピーしてパートナーに送ってください：', url);
    }
}

/**
 * 📱 リンクを直接共有（Web Share API対応時）
 */
function shareSyncUrlDirect() {
    if (typeof SoundEngine !== 'undefined') SoundEngine.playSE('click');
    const url = generateSyncUrl();
    const dragonName = kajigonState.companionName || 'カジゴン';
    const lv = getLevel();
    const text = `🏡 我が家の「家事分担くん」最新記録だぞ！\n相棒: ${dragonName} (Lv.${lv})\nタップするだけで最新のおうち記録を同期できます✨`;

    if (navigator.share) {
        navigator.share({
            title: '家事分担くん - おうち記録の同期リンク',
            text: text,
            url: url
        }).catch(err => {
            console.log('Share canceled or failed', err);
        });
    } else {
        copySyncUrl();
    }
}

/**
 * 💌 アプリ起動時のURLパラメータ（?sync=...）自動検出
 */
function checkUrlSync() {
    try {
        const params = new URLSearchParams(window.location.search);
        const syncKey = params.get('sync');
        if (!syncKey) return;

        const m = syncKey.match(/^KJ-LV(\d+)-F(\d+)-W(\d+)-A(\d+)-E(\d+)$/);
        if (!m) return;

        pendingSyncData = {
            rawKey: syncKey,
            lv: parseInt(m[1], 10),
            fire: parseInt(m[2], 10),
            water: parseInt(m[3], 10),
            wind: parseInt(m[4], 10),
            earth: parseInt(m[5], 10),
            timestamp: params.get('t') ? parseInt(params.get('t'), 10) : null
        };

        // 少しだけ描画を待ってからコージー風カスタムダイアログを表示
        setTimeout(() => {
            openSyncConfirmModal(pendingSyncData);
        }, 350);
    } catch (e) {
        console.warn('checkUrlSync error:', e);
    }
}

/**
 * 💌 パートナーからの同期確認モーダルを表示
 */
function openSyncConfirmModal(data) {
    if (!data) return;
    if (typeof SoundEngine !== 'undefined') SoundEngine.playSE('lucky');

    const lvlEl = document.getElementById('sync-preview-level');
    const valF = document.getElementById('sync-val-f');
    const valW = document.getElementById('sync-val-w');
    const valA = document.getElementById('sync-val-a');
    const valE = document.getElementById('sync-val-e');

    if (lvlEl) lvlEl.textContent = `Lv.${data.lv}`;
    if (valF) valF.textContent = data.fire;
    if (valW) valW.textContent = data.water;
    if (valA) valA.textContent = data.wind;
    if (valE) valE.textContent = data.earth;

    const modal = document.getElementById('sync-confirm-modal');
    if (modal) modal.classList.remove('hidden');
}

/**
 * ✨ ワンタップ同期を実行（合算・更新）
 */
function confirmAndApplySync() {
    if (!pendingSyncData) return;

    // 初回起動（未セットアップ）の場合、デフォルトで生活スタート
    const setupScreen = document.getElementById('setup-screen');
    if (setupScreen && !setupScreen.classList.contains('hidden')) {
        setupScreen.classList.add('hidden');
        document.getElementById('main-screen').classList.remove('hidden');
        const bottomNav = document.getElementById('cozy-bottom-nav');
        if (bottomNav) bottomNav.classList.remove('hidden');
        currentLayout = '2LDK';
        currentFloors = 1;
        playerCount = 2;
    }

    // パートナーのデータとお互いの実績を合算・マージ（高い方を採用）
    kajigonState.firePoints = Math.max(kajigonState.firePoints || 0, pendingSyncData.fire);
    kajigonState.waterPoints = Math.max(kajigonState.waterPoints || 0, pendingSyncData.water);
    kajigonState.windPoints = Math.max(kajigonState.windPoints || 0, pendingSyncData.wind);
    kajigonState.earthPoints = Math.max(kajigonState.earthPoints || 0, pendingSyncData.earth);

    const partnerExp = (pendingSyncData.lv - 1) * 150 + 10;
    if (partnerExp > (kajigonState.totalExp || 0)) {
        kajigonState.totalExp = partnerExp;
    }

    saveToLocalStorage();
    applyTheme();
    updateCompanionWidget();
    renderQuickAddButtons();
    renderCompleted();

    // 演出: カジゴン歓喜ジャンプ ＆ 祝福のベルファンファーレ
    if (typeof triggerCompanionJoy === 'function') {
        triggerCompanionJoy();
    }
    if (typeof SoundEngine !== 'undefined') {
        SoundEngine.playSE('levelup');
    }

    if (typeof showToast === 'function') {
        showToast(`🎉 パートナーの記録と同期しました！（Lv.${getLevel()}）相棒も大喜びです！`);
    }

    dismissSyncConfirmModal();
}

/**
 * 💌 同期モーダルを閉じる＆URLパラメータをクリーンアップ
 */
function dismissSyncConfirmModal() {
    const modal = document.getElementById('sync-confirm-modal');
    if (modal) modal.classList.add('hidden');
    pendingSyncData = null;

    // URLから ?sync=... を綺麗に除去（リロード時の再表示を防止）
    try {
        const cleanUrl = window.location.pathname + window.location.hash;
        window.history.replaceState({}, document.title, cleanUrl);
    } catch (e) {
        // history API fallback
    }
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

    const badgeContainer = document.getElementById('lucky-chore-widget') || document.getElementById('lucky-chore-container');
    if (badgeContainer) {
        const isDoneToday = kajigonState.lastLuckyDate === todayStr;
        badgeContainer.style.display = 'block';
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
    const titleEl = document.getElementById('ending-celebration-title');
    const scrollEl = document.getElementById('ending-scroll-content');

    const evolved = getEvolvedForm();
    if (imgEl) imgEl.src = evolved.file;
    if (titleEl) titleEl.textContent = `祝！${evolved.name} に進化！`;
    if (scrollEl) {
        scrollEl.innerHTML = `
            <p style="font-size:16px; font-weight:bold; color:var(--accent); margin-bottom:0.5rem;">相棒「${kajigonState.companionName || 'カジゴン'}」の姿が神々しく変化した！</p>
            <p style="line-height:1.6; margin-bottom:0.8rem;">${evolved.desc}</p>
            <p style="font-size:13px; color:#888;">今日までの家事への献身とおうちへの愛に、心からの感謝を！</p>
        `;
    }

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
