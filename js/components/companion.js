// ==========================================================================
// 🐉 カジゴン部屋 ＆ 窓の時間連動 ＆ 命名 ＆ おやつ系統分岐 ＆ 育成UI
// ==========================================================================

let tempTheme = null;

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

    // 🌅 アンビエント照明 ＆ 窓の更新
    updateRoomAmbientLighting();
    updateRoomWindow();

    // 🎁 おみやげチェック ＆ 📖 日記更新
    checkCompanionGift();
    initCompanionDiary();

    // 🏛️ 先輩カジゴンの里帰りチェック
    checkHallOfFameVisitor();
}

/**
 * 💤 居眠り時間帯（22:00〜翌6:00）判定
 */
function isCompanionSleeping() {
    const h = new Date().getHours();
    return h >= 22 || h < 6;
}

/**
 * 🌅 【フェーズ4】お部屋のアンビエント照明更新（朝・昼・夕・夜）
 */
function updateRoomAmbientLighting() {
    const room = document.querySelector('.tamagotchi-room');
    if (!room) return;

    const h = new Date().getHours();
    let slot = 'noon';
    if (h >= 5 && h < 11) slot = 'morning';
    else if (h >= 11 && h < 17) slot = 'noon';
    else if (h >= 17 && h < 20) slot = 'evening';
    else slot = 'night';

    room.classList.remove('ambient-morning', 'ambient-noon', 'ambient-evening', 'ambient-night');
    room.classList.add(`ambient-${slot}`);

    if (typeof SoundEngine !== 'undefined' && typeof SoundEngine.checkTimeSlotChange === 'function') {
        SoundEngine.checkTimeSlotChange();
    }
}

/**
 * 💖 浮遊ハートエフェクト生成ヘルパー
 */
function createFloatingHearts(targetElOrEvent) {
    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;

    if (targetElOrEvent && targetElOrEvent.clientX) {
        x = targetElOrEvent.clientX;
        y = targetElOrEvent.clientY;
    } else if (targetElOrEvent && targetElOrEvent.getBoundingClientRect) {
        const rect = targetElOrEvent.getBoundingClientRect();
        x = rect.left + rect.width / 2;
        y = rect.top + rect.height / 3;
    } else {
        const pet = document.getElementById('room-pet-wrapper');
        if (pet) {
            const rect = pet.getBoundingClientRect();
            x = rect.left + rect.width / 2;
            y = rect.top + rect.height / 3;
        }
    }

    const hearts = ['💖', '💕', '✨', '🥰', '💗'];
    for (let i = 0; i < 4; i++) {
        setTimeout(() => {
            const heart = document.createElement('div');
            heart.className = 'floating-heart';
            heart.textContent = hearts[Math.floor(Math.random() * hearts.length)];
            heart.style.left = `${x + (Math.random() * 40 - 20)}px`;
            heart.style.top = `${y + (Math.random() * 20 - 10)}px`;
            heart.style.setProperty('--dx', `${(Math.random() - 0.5) * 60}px`);
            heart.style.setProperty('--rot', `${(Math.random() - 0.5) * 45}deg`);
            document.body.appendChild(heart);

            setTimeout(() => {
                if (heart.parentNode) heart.parentNode.removeChild(heart);
            }, 1300);
        }, i * 90);
    }
}

/**
 * カジゴンをタップした際のリアクション（なでなでスプリング演出＆ハート）
 */
function onCompanionClick(event) {
    const isSleeping = isCompanionSleeping();
    const dragonName = kajigonState.companionName || 'カジゴン';
    const lv = getLevel();

    if (isSleeping) {
        // 💤 居眠りモード中のリアクション
        if (typeof SoundEngine !== 'undefined') {
            SoundEngine.playWarmTone(523.25, 0.45, 0, SoundEngine.seGain, 0.22, 'musicbox');
        }
        createFloatingHearts(event);

        const sleepLines = [
            `「…ふにゃ…むにゃむにゃ…おやすみだぞ…💤」`,
            `「…総監督…まだ起きてるのか…？夜更かしは体に毒だぞ…💤」`,
            `「…ふわぁ〜…シチューの夢を見てたぞ…グースカ…💤」`,
            `「…すやすや…いつもおうちを守ってくれてありがとうだぞ…💤」`
        ];
        showCompanionDialogue(sleepLines[Math.floor(Math.random() * sleepLines.length)]);
        return;
    }

    if (typeof SoundEngine !== 'undefined') {
        SoundEngine.playSE('karuta');
    }

    // ぷにっと跳ねるスプリングアニメーション
    const petWrapper = document.getElementById('room-pet-wrapper');
    if (petWrapper) {
        petWrapper.classList.remove('pet-spring-bounce');
        void petWrapper.offsetWidth; // リフロー発生
        petWrapper.classList.add('pet-spring-bounce');
        setTimeout(() => {
            petWrapper.classList.remove('pet-spring-bounce');
        }, 500);
    }

    // 💖 ハートのエフェクト
    createFloatingHearts(event || petWrapper);

    let lines = [
        `「ボクは${dragonName}だぞ！なでなで気持ちいいぞ〜！えへへ♪」`,
        `「なでてくれてありがとう！今日も一緒に家事頑張ろうな！」`,
        `「おうちの中がピカピカで快適だぞ〜！総監督だいすき！」`,
        `「ふふっ、くすぐったいぞ〜！でももっと撫でてほしいな！」`,
        `「今日も総監督が無事に帰ってきてくれて嬉しいぞ〜！」`
    ];

    if (lv >= 10) {
        lines.push(`「立派に育ててくれてありがとう！ボクはおうちの守護精霊だぞ！」`);
    }

    // 家具のおねだり
    if (typeof getNextFurnitureWish === 'function') {
        const wish = getNextFurnitureWish();
        if (wish && Math.random() < 0.35) lines.push(wish.dialogue);
    }

    showCompanionDialogue(lines[Math.floor(Math.random() * lines.length)]);
}

function showCompanionDialogue(text) {
    const bubble = document.getElementById('companion-speech-bubble');
    const speechText = document.getElementById('speech-text');
    if (!bubble || !speechText) return;

    speechText.textContent = text;
    bubble.classList.remove('hidden');

    if (window._companionDialogueTimer) {
        clearTimeout(window._companionDialogueTimer);
    }
    window._companionDialogueTimer = setTimeout(() => {
        bubble.classList.add('hidden');
    }, 4500);
}

// ==========================================================================
// 🎁 【フェーズ5】カジゴンのおみやげギミック（不在時間2時間以上でプレゼント出現）
// ==========================================================================
function checkCompanionGift() {
    const giftBubble = document.getElementById('companion-gift-bubble');
    if (!giftBubble) return;

    // 🛡️ 初期値ガード（既存セーブデータ互換性保証）
    kajigonState.lastGiftTime = kajigonState.lastGiftTime || parseInt(localStorage.getItem('kajigon_last_gift_time') || '0', 10);
    const lastGiftTime = kajigonState.lastGiftTime;
    const now = Date.now();
    const TWO_HOURS_MS = 2 * 60 * 60 * 1000;

    // 初回起動時（lastGiftTime === 0）または前回から2時間以上経過していた場合
    if (!lastGiftTime || (now - lastGiftTime) >= TWO_HOURS_MS) {
        giftBubble.classList.remove('hidden');
    } else {
        giftBubble.classList.add('hidden');
    }
}

function claimCompanionGift() {
    if (typeof SoundEngine !== 'undefined') {
        SoundEngine.playSE('level_up');
    }

    const giftBubble = document.getElementById('companion-gift-bubble');
    if (giftBubble) giftBubble.classList.add('hidden');

    // 最終受取時刻を更新
    kajigonState.lastGiftTime = Date.now();
    localStorage.setItem('kajigon_last_gift_time', kajigonState.lastGiftTime.toString());

    if (!kajigonState.materials) {
        kajigonState.materials = { wood: 0, cloth: 0, brick: 0, gear: 0 };
    }

    // ランダムなおみやげ素材（1〜2個）
    const gifts = [
        { key: 'wood', name: 'きれいな木材 🪵', count: Math.random() < 0.5 ? 2 : 1 },
        { key: 'gear', name: '小さなネジ ⚙️', count: 1 },
        { key: 'cloth', name: 'やわらかな布 🧶', count: Math.random() < 0.5 ? 2 : 1 },
        { key: 'brick', name: '頑丈なレンガ 🧱', count: Math.random() < 0.5 ? 2 : 1 }
    ];
    const chosen = gifts[Math.floor(Math.random() * gifts.length)];
    kajigonState.materials[chosen.key] = (kajigonState.materials[chosen.key] || 0) + chosen.count;

    // ネジの場合はアーティファクトカウントも連動（上限3）
    if (chosen.key === 'gear' && kajigonState.artifactCount < 3) {
        kajigonState.artifactCount++;
    }

    saveToLocalStorage();

    // 演出：ハート舞い上がり
    const pet = document.getElementById('room-pet-wrapper');
    createFloatingHearts(pet);

    // セリフとお知らせ
    const dragonName = kajigonState.companionName || 'カジゴン';
    showCompanionDialogue(`「留守中にお部屋の隅で【${chosen.name}×${chosen.count}】を見つけたぞ！工房で使ってくれよな！」`);

    if (typeof showToast === 'function') {
        showToast(`🎁 相棒からのおみやげ！【${chosen.name}×${chosen.count}】を受け取りました！`);
    }
}

// ==========================================================================
// 🏛️ 【フェーズ6】先輩カジゴンのひょっこり里帰り訪問演出 ＆ 手土産ギミック
// ==========================================================================
let currentVisitor = null;

function checkHallOfFameVisitor() {
    const slot = document.getElementById('room-visitor-slot');
    if (!slot) return;

    let hallList = [];
    if (typeof getHallOfFameList === 'function') {
        hallList = getHallOfFameList();
    } else if (Array.isArray(kajigonState.hallOfFame)) {
        hallList = kajigonState.hallOfFame;
    }

    // 殿堂入り精霊がいない場合は訪問なし
    if (!hallList || hallList.length === 0) {
        slot.classList.add('hidden');
        currentVisitor = null;
        return;
    }

    // 約30%の確率で遊びに来る（すでに表示中の場合はそのまま維持）
    if (currentVisitor) {
        slot.classList.remove('hidden');
        return;
    }

    if (Math.random() < 0.35) {
        const visitor = hallList[Math.floor(Math.random() * hallList.length)];
        currentVisitor = visitor;

        const cheerMessages = [
            `「後輩よ！今日もいい調子だな！」`,
            `「おうちピカピカで嬉しいぞ〜！」`,
            `「総監督と一緒にがんばれよ！」`,
            `「里帰りしに来たぞ！いい匂いだな！」`
        ];
        const speech = cheerMessages[Math.floor(Math.random() * cheerMessages.length)];

        slot.innerHTML = `
            <img class="visitor-avatar-img" src="${visitor.spiritFile}" alt="${visitor.name}">
            <div class="visitor-speech-bubble">💭 ${speech}</div>
        `;
        slot.classList.remove('hidden');
    } else {
        slot.classList.add('hidden');
        currentVisitor = null;
    }
}

/**
 * 先輩カジゴンをタップした際のプチご褒美（手土産プレゼント）
 */
function onVisitorClick(event) {
    if (!currentVisitor) return;
    if (event) event.stopPropagation();

    if (typeof SoundEngine !== 'undefined') {
        SoundEngine.playSE('lucky');
    }

    createFloatingHearts(event || document.getElementById('room-visitor-slot'));

    // 手土産素材（木材・布・レンガ・ネジ）
    const gifts = [
        { key: 'wood', name: 'きれいな木材 🪵' },
        { key: 'cloth', name: 'やわらかな布 🧶' },
        { key: 'brick', name: '頑丈なレンガ 🧱' },
        { key: 'gear', name: '小さなネジ ⚙️' }
    ];
    const present = gifts[Math.floor(Math.random() * gifts.length)];
    if (!kajigonState.materials) kajigonState.materials = { wood: 0, cloth: 0, brick: 0, gear: 0 };
    kajigonState.materials[present.key] = (kajigonState.materials[present.key] || 0) + 1;
    saveToLocalStorage();

    const slot = document.getElementById('room-visitor-slot');
    if (slot) {
        slot.innerHTML = `
            <img class="visitor-avatar-img" src="${currentVisitor.spiritFile}" alt="${currentVisitor.name}">
            <div class="visitor-speech-bubble">✨「手土産に【${present.name}】を置いていくぞ！またな！」</div>
        `;
    }

    if (typeof showToast === 'function') {
        showToast(`🎁 歴代の先輩【${currentVisitor.name}】から手土産（${present.name}×1）をもらいました！`);
    }

    // 満足して優しくフェードアウト
    setTimeout(() => {
        if (slot) slot.classList.add('hidden');
        currentVisitor = null;
    }, 3500);
}

// ==========================================================================
// 📖 カジゴン日記（不在時のつぶやき・全24種）
// ==========================================================================
const COMPANION_DIARIES = [
    "お昼寝してたらシチューの夢を見たぞ…むにゃむにゃ",
    "窓の外を小鳥が飛んでいくのをじーっと眺めていたぞ🕊️",
    "ふかふか絨毯の上で3回くらいゴロゴロ転がってみたぞ！",
    "部屋のすみのホコリと真剣白刃取りの練習をしてたぞ⚔️",
    "観葉植物の葉っぱを数えてたら10枚あったぞ！すくすく育ってる！",
    "ランプのあたたかい光を見つめてたらうとうとしてきたぞ💡",
    "総監督の足音がしないか耳をピクピクさせて待ってたぞ！",
    "本棚の魔導書を開こうとしたけど重たくて断念したぞ…📚",
    "シチュー鍋のフタを開けようとして我慢したぞ！えらい！🍲",
    "床の模様をたどって散歩してたら少し目が回ったぞ🌀",
    "お部屋の空気がきれいだと、深呼吸がとっても気持ちいいな〜✨",
    "窓ガラスに映った自分の顔を見て『強そうだぞ！』と威嚇してみたぞ🔥",
    "お留守番中にちょっとだけオリジナルダンスの練習をしたぞ♪",
    "総監督が帰ってきたら何を褒めてもらおうか考えてたぞ💭",
    "おひさまの光がぽかぽかして、あくびが3回出ちゃったぞ〜☀️",
    "おうちの守護精霊として、お部屋の平和をしっかり見張ってたぞ！🛡️",
    "おやつ箱の匂いをクンクン嗅いでたらお腹がグーッと鳴ったぞ🍖",
    "きれいになった床の上をツルツル滑って遊んでたぞ！",
    "今日のラッキー家事は何かな〜とワクワク考えてたぞ🥠",
    "総監督、おかえりなさい！待ってたぞ〜！ぎゅ〜っ！",
    "ふかふか絨毯にすりすりしてたら静電気がパチッとしたぞ⚡",
    "お留守番中に拾った木材をこっそり隠しておいたぞ（あとで渡すぞ！）🪵",
    "星空の窓を眺めながら、昔の伝説のドラゴンの本を思い出してたぞ🌌",
    "おうちが綺麗だと、心までぽかぽか温かくなるな〜🏡"
];

let currentDiaryIndex = 0;

function initCompanionDiary() {
    const textEl = document.getElementById('diary-text');
    if (!textEl) return;

    currentDiaryIndex = Math.floor(Math.random() * COMPANION_DIARIES.length);
    textEl.textContent = COMPANION_DIARIES[currentDiaryIndex];
}

function onDiaryClick() {
    if (typeof SoundEngine !== 'undefined') {
        SoundEngine.playSE('click');
    }
    const textEl = document.getElementById('diary-text');
    if (!textEl) return;

    currentDiaryIndex = (currentDiaryIndex + 1) % COMPANION_DIARIES.length;
    textEl.style.opacity = '0';
    setTimeout(() => {
        textEl.textContent = COMPANION_DIARIES[currentDiaryIndex];
        textEl.style.opacity = '1';
    }, 150);
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
