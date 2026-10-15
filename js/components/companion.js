// ==========================================================================
// 🐉 カジゴン部屋 ＆ 窓の時間連動 ＆ 命名 ＆ おやつ系統分岐 ＆ 育成UI
// ==========================================================================

let tempTheme = null;

/**
 * 🌅 お部屋のリアルタイム・アンビエント照明更新（朝・昼・夕・夜）
 */
function updateRoomAmbientLighting() {
    const roomEl = document.getElementById('tamagotchi-room');
    if (!roomEl) return;

    const hour = new Date().getHours();
    roomEl.classList.remove('ambient-morning', 'ambient-noon', 'ambient-evening', 'ambient-night');

    if (hour >= 5 && hour < 11) {
        roomEl.classList.add('ambient-morning');
    } else if (hour >= 11 && hour < 17) {
        roomEl.classList.add('ambient-noon');
    } else if (hour >= 17 && hour < 20) {
        roomEl.classList.add('ambient-evening');
    } else {
        roomEl.classList.add('ambient-night');
    }
}

/**
 * 💤 カジゴンの夜間居眠り判定（22:00〜翌6:00）
 */
function isCompanionSleeping() {
    const hour = new Date().getHours();
    return hour >= 22 || hour < 6;
}

/**
 * 窓のリアルタイム時間連動（朝・昼・夕・夜）
 */
function updateRoomWindow() {
    const windowEl = document.querySelector('.room-window');
    if (!windowEl) return;

    const hour = new Date().getHours();
    windowEl.classList.remove('window-morning', 'window-day', 'window-evening', 'window-night');

    let glassHtml = '';
    if (hour >= 6 && hour < 11) {
        windowEl.classList.add('window-morning');
        glassHtml = `
            <div class="window-glass morning">
                <span class="window-sun">🌅</span>
                <span class="window-cloud c1">☁️</span>
            </div>
        `;
    } else if (hour >= 11 && hour < 17) {
        windowEl.classList.add('window-day');
        glassHtml = `
            <div class="window-glass day">
                <span class="window-sun">☀️</span>
                <span class="window-cloud c2">☁️</span>
            </div>
        `;
    } else if (hour >= 17 && hour < 19) {
        windowEl.classList.add('window-evening');
        glassHtml = `
            <div class="window-glass evening">
                <span class="window-sun">🌇</span>
                <span class="window-cloud c1">🌆</span>
            </div>
        `;
    } else {
        windowEl.classList.add('window-night');
        glassHtml = `
            <div class="window-glass night">
                <span class="window-moon">🌙</span>
                <span class="window-star s1">✦</span>
                <span class="window-star s2">✦</span>
            </div>
        `;
    }
    windowEl.innerHTML = glassHtml;
}

/**
 * カジゴン命名モーダル
 */
function openRenameCompanionModal() {
    if (typeof SoundEngine !== 'undefined') SoundEngine.playSE('click');
    const currentName = kajigonState.companionName || 'カジゴン';
    const newName = prompt('相棒カジゴンの新しい名前（ニックネーム）を入力してください：', currentName);
    if (newName && newName.trim()) {
        kajigonState.companionName = newName.trim();
        saveToLocalStorage();
        updateCompanionWidget();
        if (typeof showToast === 'function') {
            showToast(`✨ 相棒の名前を「${kajigonState.companionName}」に改名しました！`);
        }
        if (typeof showCompanionDialogue === 'function') {
            showCompanionDialogue(`「今日からボクは『${kajigonState.companionName}』だな！よろしくな総監督！」`);
        }
    }
}

/**
 * ベビー期のおやつ（大枠系統選択）モーダル
 */
function openBabySnackModal() {
    if (typeof SoundEngine !== 'undefined') SoundEngine.playSE('click');
    const modal = document.getElementById('snack-modal');
    if (!modal) return;
    modal.classList.remove('hidden');
}

function closeBabySnackModal() {
    if (typeof SoundEngine !== 'undefined') SoundEngine.playSE('click');
    const modal = document.getElementById('snack-modal');
    if (modal) modal.classList.add('hidden');
}

function feedBabySnack(route) {
    kajigonState.chosenRoute = route;
    if (route === 'golem') {
        if (!kajigonState.materials) kajigonState.materials = { wood: 0, cloth: 0, brick: 0, gear: 0 };
        kajigonState.materials.gear = (kajigonState.materials.gear || 0) + 1;
        if (kajigonState.artifactCount < 3) kajigonState.artifactCount++;
    }

    saveToLocalStorage();
    closeBabySnackModal();
    updateCompanionWidget();

    if (typeof SoundEngine !== 'undefined') {
        SoundEngine.playSE('level_up');
    }

    const dragonName = kajigonState.companionName || 'カジゴン';
    const msgMap = {
        golem: `「モグモグ…！古代のネジのパワーで、頑丈な魔ゴーレムの気配がしてきたぞ！」`,
        dragon: `「モグモグ…！ドラゴン肉で力がみなぎる！大空を舞う伝説の龍を目指すぞ！」`,
        fairy: `「モグモグ…！妖精のハチミツあま〜い！おうちを守る愛らしい妖精になるぞ！」`
    };

    if (typeof showCompanionDialogue === 'function') {
        showCompanionDialogue(msgMap[route] || `「モグモグ！おいしかったぞ！」`);
    }

    if (typeof showToast === 'function') {
        const titleMap = { golem: '機械魔ゴーレム系統', dragon: '王道ドラゴン系統', fairy: '妖精・レリック系統' };
        showToast(`🍖 おやつを与えました！（${titleMap[route]}への進化兆候！）`);
    }
}

/**
 * カジゴンのメイン部屋ウィジェット更新
 */
function updateCompanionWidget() {
    const widget = document.getElementById('companion-status-widget');
    if (!widget) return;

    const lv = getLevel();
    const stage = getCompanionStage(lv);
    const dragonName = kajigonState.companionName || 'カジゴン';

    // ヘッダー名表示
    const statusNameEl = document.getElementById('room-status-name');
    const statusExpEl = document.getElementById('room-status-exp');

    if (statusNameEl) {
        const rebreedTag = lv >= 10 ? ` <span onclick="rebreedCompanion()" style="font-size:11px; cursor:pointer; color:#f97316; text-decoration:underline; font-weight:bold;">[🥚そだてなおす]</span>` : '';
        let titleBadgeHtml = '';
        if (kajigonState.selectedTitle && typeof TITLES_DATA !== 'undefined' && TITLES_DATA[kajigonState.selectedTitle]) {
            const tObj = TITLES_DATA[kajigonState.selectedTitle];
            titleBadgeHtml = `<span class="title-tag-badge" onclick="if(typeof openBookModal==='function'){openBookModal(); if(typeof switchBookTab==='function') switchBookTab('achievements');}" style="cursor:pointer; vertical-align:middle;" title="タップして称号変更">[${tObj.icon}${tObj.name}]</span> `;
        }
        statusNameEl.innerHTML = `✅ ${titleBadgeHtml}${dragonName} (LV.${lv}) <span onclick="openRenameCompanionModal()" style="font-size:11px; cursor:pointer; color:#fbbf24; text-decoration:underline;">[改名]</span>${rebreedTag}`;
    }
    if (statusExpEl) {
        const nextLvExp = lv * 150;
        statusExpEl.textContent = `EXP: ${kajigonState.totalExp} / ${nextLvExp} (ステージ: ${stage.toUpperCase()})`;
    }

    // 💤 夜間居眠りモード判定（22:00〜翌6:00）
    const isSleeping = isCompanionSleeping();
    const animClass = isSleeping ? 'companion-sleeping' : 'companion-walking';
    const sleepBubbleHtml = isSleeping ? `<div class="sleep-bubble">💭 zzz...</div>` : '';

    // スプライト画像
    let companionImgHtml = '';
    const envTheme = kajigonState.environmentTheme || 'classic';

    if (stage === 'egg') {
        companionImgHtml = `
            <div style="position:relative; display:flex; flex-direction:column; align-items:center;">
                <img class="companion-avatar-img ${animClass}" src="images/spirits/egg.png" alt="ドラゴンの卵" style="width:90px; height:90px; object-fit:contain; image-rendering:pixelated; filter:drop-shadow(0 4px 8px rgba(0,0,0,0.6));" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
                <div style="font-size:72px; display:none;">🥚</div>
                ${sleepBubbleHtml}
            </div>
        `;
    } else if (stage === 'baby') {
        companionImgHtml = `
            <div style="position:relative; display:flex; flex-direction:column; align-items:center;">
                <img class="companion-avatar-img ${animClass}" src="images/spirits/kajigon_baby.png" alt="ベビーカジゴン" style="width:110px; height:110px; object-fit:contain; image-rendering:pixelated; filter:drop-shadow(0 4px 8px rgba(0,0,0,0.6));" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
                <div style="font-size:64px; display:none;">🐣</div>
                ${sleepBubbleHtml}
                ${!kajigonState.chosenRoute ? `
                    <button onclick="event.stopPropagation(); openBabySnackModal();" style="margin-top:0.4rem; padding:0.25rem 0.6rem; background:#fbbf24; color:#000; font-weight:bold; font-size:11px; border:none; border-radius:12px; cursor:pointer; box-shadow:0 2px 6px rgba(0,0,0,0.4); animation:bounce 1.5s infinite;">
                        🍖 おやつをあげる (進化先選択)
                    </button>
                ` : ''}
            </div>
        `;
    } else if (stage === 'teen') {
        const teenMap = {
            volcano: 'images/spirits/teen_fire.png',
            abyss: 'images/spirits/teen_water.png',
            sky: 'images/spirits/teen_wind.png',
            earth: 'images/spirits/teen_earth.png',
            classic: 'images/spirits/teen_light.png',
            gameboy: 'images/spirits/teen_retro.png'
        };
        const teenImg = teenMap[envTheme] || 'images/spirits/teen_light.png';
        companionImgHtml = `
            <div style="position:relative; display:flex; flex-direction:column; align-items:center;">
                <img class="companion-avatar-img ${animClass}" src="${teenImg}" alt="ティーンカジゴン" style="width:130px; height:130px; object-fit:contain; image-rendering:pixelated; filter:drop-shadow(0 4px 8px rgba(0,0,0,0.6));" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
                <div style="font-size:64px; display:none;">👾</div>
                ${sleepBubbleHtml}
            </div>
        `;
    } else {
        // 最終進化 (Lv.10)
        const evolved = getEvolvedForm();
        recordToEncyclopedia(evolved);
        companionImgHtml = `
            <div style="position:relative; display:flex; flex-direction:column; align-items:center;">
                <img class="companion-avatar-img ${animClass}" src="${evolved.file}" alt="${evolved.name}" style="width:150px; height:150px; object-fit:contain; image-rendering:pixelated; filter:drop-shadow(0 6px 12px rgba(0,0,0,0.7));" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
                <div style="font-size:72px; display:none;">🐉</div>
                ${sleepBubbleHtml}
                <button onclick="event.stopPropagation(); rebreedCompanion();" style="margin-top:0.4rem; padding:0.3rem 0.8rem; background:linear-gradient(135deg, #f59e0b, #d97706); color:#0d0d13; font-weight:800; font-size:11px; border:2px solid #fbbf24; border-radius:12px; cursor:pointer; box-shadow:0 3px 8px rgba(0,0,0,0.5); animation:bounce 2s infinite;">
                    🥚 そだてなおす (世代交代)
                </button>
            </div>
        `;
    }

    widget.innerHTML = companionImgHtml;

    // 家具描画
    if (typeof renderFurnitureInRoom === 'function') {
        renderFurnitureInRoom();
    }

    // 窓の更新
    updateRoomWindow();

    // 🌅 アンビエント照明更新
    updateRoomAmbientLighting();

    // 🏛️ 歴代殿堂入り先輩の里帰りチェック
    checkHallOfFameVisitor();
}

/**
 * カジゴンをタップした際のリアクション
 */
function onCompanionClick(event) {
    if (typeof SoundEngine !== 'undefined') {
        SoundEngine.playSE('click');
    }

    // ぷにっと跳ねる演出
    const petWrapper = document.getElementById('room-pet-wrapper');
    if (petWrapper) {
        petWrapper.classList.remove('pet-spring-bounce');
        void petWrapper.offsetWidth;
        petWrapper.classList.add('pet-spring-bounce');
        setTimeout(() => {
            petWrapper.classList.remove('pet-spring-bounce');
        }, 600);
        if (typeof createFloatingHearts === 'function') {
            createFloatingHearts(petWrapper);
        }
    }

    const dragonName = kajigonState.companionName || 'カジゴン';
    const lv = getLevel();

    // 💤 居眠り中のリアクション
    if (isCompanionSleeping()) {
        const sleepLines = [
            `「むにゃむにゃ…シチューの夢を見てるぞ…zzZ」`,
            `「すやすや…総監督、今日も一日お疲れさま…zzZ」`,
            `「むにゃ…きれいなお部屋…気持ちいいぞ…zzZ」`
        ];
        showCompanionDialogue(sleepLines[Math.floor(Math.random() * sleepLines.length)]);
        return;
    }

    let lines = [
        `「ボクは${dragonName}だぞ！おうちが綺麗だとウキウキするな〜！」`,
        `「なでてくれてありがとう！今日も一緒に家事頑張ろうな！」`,
        `「おうちの中がピカピカで快適だぞ〜！」`
    ];

    if (lv >= 10) {
        lines.push(`「立派に育ててくれてありがとう！ボクはおうちの守護精霊だぞ！」`);
    }

    // 家具のおねだり
    if (typeof getNextFurnitureWish === 'function') {
        const wish = getNextFurnitureWish();
        if (wish) lines.push(wish.dialogue);
    }

    showCompanionDialogue(lines[Math.floor(Math.random() * lines.length)]);
}

function showCompanionDialogue(text) {
    const bubble = document.getElementById('companion-speech-bubble');
    const speechText = document.getElementById('speech-text');
    if (!bubble || !speechText) return;

    speechText.textContent = text;
    bubble.classList.remove('hidden');

    setTimeout(() => {
        bubble.classList.add('hidden');
    }, 4500);
}

// ==========================================================================
// 🎁 留守中の放置おみやげシステム（2時間以上でクラフト素材1〜2個プレゼント）
// ==========================================================================
function checkCompanionGift() {
    const now = Date.now();
    const lastTime = kajigonState.lastGiftTime || 0;
    const TWO_HOURS_MS = 2 * 60 * 60 * 1000;

    let giftBubble = document.getElementById('companion-gift-bubble');
    if (now - lastTime >= TWO_HOURS_MS) {
        if (!giftBubble) {
            const petArea = document.querySelector('.room-center-pet-area');
            if (petArea) {
                giftBubble = document.createElement('div');
                giftBubble.id = 'companion-gift-bubble';
                giftBubble.className = 'companion-gift-bubble';
                giftBubble.innerHTML = '🎁';
                giftBubble.onclick = (e) => {
                    e.stopPropagation();
                    claimCompanionGift();
                };
                petArea.appendChild(giftBubble);
            }
        }
    } else {
        if (giftBubble) giftBubble.remove();
    }
}

function claimCompanionGift() {
    const giftBubble = document.getElementById('companion-gift-bubble');
    if (giftBubble) giftBubble.remove();

    kajigonState.lastGiftTime = Date.now();
    kajigonState.materials = kajigonState.materials || { wood: 0, cloth: 0, brick: 0, gear: 0 };

    const matKeys = ['wood', 'cloth', 'brick', 'gear'];
    const names = { wood: 'きれいな木材', cloth: 'ふんわり布', brick: 'かたいレンガ', gear: '小さなネジ' };

    const count = Math.random() < 0.5 ? 2 : 1;
    const gained = [];
    for (let i = 0; i < count; i++) {
        const pick = matKeys[Math.floor(Math.random() * matKeys.length)];
        kajigonState.materials[pick] = (kajigonState.materials[pick] || 0) + 1;
        gained.push(names[pick]);
    }

    saveToLocalStorage();
    if (typeof SoundEngine !== 'undefined') SoundEngine.playSE('lucky');

    const petWrapper = document.getElementById('room-pet-wrapper');
    if (typeof createFloatingHearts === 'function' && petWrapper) {
        createFloatingHearts(petWrapper);
    }

    const dragonName = kajigonState.companionName || 'カジゴン';
    showCompanionDialogue(`「お留守番中におみやげを拾ってきたぞ！【${gained.join(' と ')}】だ！使ってくれ！」`);
    if (typeof showToast === 'function') {
        showToast(`🎁 カジゴンからおみやげ！【${gained.join(' と ')}】を受け取りました！`);
    }
}

// ==========================================================================
// 🏛️ 歴代殿堂入り精霊の里帰りシステム（30%確率で来訪・手土産素材プレゼント）
// ==========================================================================
let currentVisitor = null;
let visitorGiftClaimed = false;

function checkHallOfFameVisitor() {
    const slot = document.getElementById('room-visitor-slot');
    if (!slot) return;

    let hallList = [];
    if (typeof getHallOfFameList === 'function') {
        hallList = getHallOfFameList();
    } else if (Array.isArray(kajigonState.hallOfFame)) {
        hallList = kajigonState.hallOfFame;
    }

    if (!hallList || hallList.length === 0) {
        slot.classList.add('hidden');
        slot.innerHTML = '';
        currentVisitor = null;
        return;
    }

    if (!currentVisitor && Math.random() < 0.35) {
        currentVisitor = hallList[Math.floor(Math.random() * hallList.length)];
        visitorGiftClaimed = false;
    }

    if (currentVisitor) {
        slot.classList.remove('hidden');
        slot.innerHTML = `
            <div class="visitor-speech-bubble">「見回りに来たぞ！」</div>
            <img class="visitor-avatar-img" src="${currentVisitor.file || 'images/spirits/egg.png'}" alt="${currentVisitor.name}">
        `;
    } else {
        slot.classList.add('hidden');
        slot.innerHTML = '';
    }
}

function onVisitorClick(event) {
    if (!currentVisitor) return;
    if (typeof SoundEngine !== 'undefined') SoundEngine.playSE('click');

    const slot = document.getElementById('room-visitor-slot');
    if (typeof createFloatingHearts === 'function' && slot) {
        createFloatingHearts(slot);
    }

    if (!visitorGiftClaimed) {
        visitorGiftClaimed = true;
        kajigonState.materials = kajigonState.materials || { wood: 0, cloth: 0, brick: 0, gear: 0 };
        const matKeys = ['wood', 'cloth', 'brick', 'gear'];
        const names = { wood: 'きれいな木材', cloth: 'ふんわり布', brick: 'かたいレンガ', gear: '小さなネジ' };
        const pick = matKeys[Math.floor(Math.random() * matKeys.length)];
        kajigonState.materials[pick] = (kajigonState.materials[pick] || 0) + 1;
        saveToLocalStorage();

        if (typeof showToast === 'function') {
            showToast(`🏛️ 先輩カジゴン【${currentVisitor.name}】から手土産【${names[pick]}×1】を貰いました！`);
        }
    } else {
        if (typeof showToast === 'function') {
            showToast(`🏛️ 先輩カジゴン【${currentVisitor.name}】「後輩も頑張ってるな！応援してるぞ！」`);
        }
    }
}

/**
 * 環境テーマ（壁紙・カラーパレット）適用
 */
function applyTheme() {
    document.body.classList.remove('theme-fire', 'theme-water', 'theme-wind', 'theme-earth', 'theme-light', 'theme-dark');
    document.body.classList.remove('env-volcano', 'env-abyss', 'env-sky', 'env-earth', 'env-classic', 'env-gameboy');

    const envTheme = kajigonState.environmentTheme || 'classic';
    document.body.classList.add(`env-${envTheme}`);

    const activeTheme = tempTheme || (getLevel() >= 10 ? getEvolvedForm().attr : null);
    if (activeTheme) {
        document.body.classList.add(`theme-${activeTheme}`);
    }
}

/**
 * 🔄 そだてなおす（世代交代＆歴代殿堂入り）
 */
function rebreedCompanion() {
    if (typeof SoundEngine !== 'undefined') SoundEngine.playSE('click');
    const lv = getLevel();

    if (window.confirm('現在の相棒を「そだてなおす」しますか？\nこれまでの経験値や属性がリセットされ、新しく卵（🥚）から育て直せます。\n※Lv.10まで育てた相棒は「歴代殿堂入り」に永遠に記録されます！')) {
        if (lv >= 10) {
            const evolved = getEvolvedForm();
            recordToEncyclopedia(evolved);
            if (typeof saveHallOfFame === 'function') {
                saveHallOfFame(evolved);
            }
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

        kajigonState.totalExp = 0;
        kajigonState.firePoints = 0;
        kajigonState.waterPoints = 0;
        kajigonState.windPoints = 0;
        kajigonState.earthPoints = 0;
        kajigonState.artifactCount = 0;
        kajigonState.forceSpecial = null;
        kajigonState.chosenRoute = null;
        kajigonState.environmentTheme = newEnvTheme;
        kajigonState.companionName = 'カジゴン';

        saveToLocalStorage();
        applyTheme();
        updateCompanionWidget();

        if (typeof showToast === 'function') {
            showToast('🥚 新しい命（卵）を迎えました！新しい世代の家事習慣の始まりです！');
        }
    }
}
