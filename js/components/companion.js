// ==========================================================================
// 🐉 カジゴン部屋 ＆ 窓の時間連動 ＆ 命名 ＆ おやつ系統分岐 ＆ 育成UI
// ==========================================================================

let tempTheme = null;

// 🥚 卵ステージ（Lv.1〜2）専用のサイレント状況描写・擬音リスト
const EGG_SILENT_LINES = [
    '（コトン…と中から音がした）',
    '（ほんのり温かい気配がする…）',
    '（ピキッ…！殻がわずかに揺れた）',
    '（静かに家事のパワーを吸収しているようだ…）'
];

/**
 * 🌅 お部屋のリアルタイム・アンビエント照明更新（朝・昼・夕・夜）
 */
function updateRoomAmbientLighting() {
    const roomEl = document.getElementById('tamagotchi-room-container') || document.getElementById('tamagotchi-room');
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
 * 🍖 サイドバー「おやつ」ボタンの「!」バッジ表示更新
 * ベビー期で進化分岐おやつが未選択の時、またはおやつを所持している時に「!」を表示
 */
function updateSnackBadge() {
    const badgeEl = document.getElementById('side-snack-badge');
    const btnEl = document.getElementById('side-snack-btn');
    if (!badgeEl) return;

    const lv = getLevel();
    const stage = getCompanionStage(lv);
    const isBabyUnchosen = (stage === 'baby' && !kajigonState.chosenRoute);
    const inv = kajigonState.snackInventory || {};
    const totalSnacks = Object.values(inv).reduce((sum, v) => sum + (Number(v) || 0), 0);
    const hasSnackItem = Boolean(
        totalSnacks > 0 ||
        (kajigonState.snacks && kajigonState.snacks > 0) ||
        (kajigonState.snackCount && kajigonState.snackCount > 0) ||
        (Array.isArray(kajigonState.inventorySnacks) && kajigonState.inventorySnacks.length > 0)
    );

    if (isBabyUnchosen || hasSnackItem) {
        badgeEl.classList.remove('hidden');
        if (btnEl) btnEl.classList.add('has-snack-notice');
    } else {
        badgeEl.classList.add('hidden');
        if (btnEl) btnEl.classList.remove('has-snack-notice');
    }
}

/**
 * 💖 大好物おやつ専用・特別ハート＆キラキラバースト演出
 */
function createSpecialFavoriteHeartBurst(targetEl) {
    const el = targetEl || document.getElementById('room-pet-wrapper');
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const symbols = ['💖', '💕', '💗', '✨', '💓', '🎵', '👑', '💖', '✨', '💝'];
    symbols.forEach((sym, idx) => {
        setTimeout(() => {
            const p = document.createElement('div');
            p.className = 'favorite-heart-particle';
            p.textContent = sym;
            const angle = (Math.PI * 2 * idx) / symbols.length;
            const dist = 45 + Math.random() * 35;
            const dx = Math.cos(angle) * dist;
            const dy = Math.sin(angle) * dist - 40;
            p.style.left = `${centerX}px`;
            p.style.top = `${centerY}px`;
            p.style.setProperty('--tx', `${dx}px`);
            p.style.setProperty('--ty', `${dy}px`);
            document.body.appendChild(p);
            setTimeout(() => {
                if (p.parentNode) p.parentNode.removeChild(p);
            }, 1400);
        }, idx * 45);
    });

    // 頭上に特別ポップアップバナー表示
    const banner = document.createElement('div');
    banner.className = 'favorite-buff-popup';
    banner.innerHTML = `💖 大好物！ +40 EXP ＆ 次回家事1.5倍！`;
    banner.style.left = `${centerX}px`;
    banner.style.top = `${Math.max(60, rect.top - 16)}px`;
    document.body.appendChild(banner);
    setTimeout(() => {
        if (banner.parentNode) banner.parentNode.removeChild(banner);
    }, 2200);
}

/**
 * 🍖 おやつ（進化系統分岐 ＆ 大好物バフ）モーダルを開く
 */
function openBabySnackModal() {
    if (typeof SoundEngine !== 'undefined') SoundEngine.playSE('click');
    renderSnackModal();
    const modal = document.getElementById('snack-modal');
    if (!modal) return;
    modal.classList.remove('hidden');
}

function closeBabySnackModal() {
    if (typeof SoundEngine !== 'undefined') SoundEngine.playSE('click');
    const modal = document.getElementById('snack-modal');
    if (modal) modal.classList.add('hidden');
}

/**
 * おやつモーダル内の動的描画（全6系統・全ステージ対応）
 */
function renderSnackModal() {
    const bodyEl = document.getElementById('snack-modal-body');
    if (!bodyEl || typeof SNACK_ITEMS === 'undefined') return;

    const lv = getLevel();
    const stage = getCompanionStage(lv);
    const stageNames = {
        egg: '🥚 卵期 (Lv.1〜2)',
        baby: '🐣 ベビー期 (Lv.3〜5)',
        teen: '👾 青年期 (Lv.6〜9)',
        final: '👑 守護精霊期 (Lv.10+)'
    };
    const favInfo = (typeof getCurrentFavoriteSnackInfo === 'function')
        ? getCurrentFavoriteSnackInfo()
        : { route: 'dragon', snackId: 'dragon_meat', snack: SNACK_ITEMS[0] };

    const inv = kajigonState.snackInventory || {};
    const buffActive = (kajigonState.nextChoreExpBuff && kajigonState.nextChoreExpBuff > 1.0);

    const cardsHtml = SNACK_ITEMS.map(item => {
        const count = Number(inv[item.id] || 0);
        const isFavorite = (favInfo && favInfo.route === item.route);
        const isChosenRoute = (kajigonState.chosenRoute === item.route);
        const canFeed = count > 0 || stage === 'baby';

        let badges = '';
        if (isFavorite) {
            badges += `<span class="snack-fav-badge">💖 大好物 (+40 EXP & 次回1.5倍)</span>`;
        }
        if (isChosenRoute && stage !== 'final') {
            badges += `<span class="snack-route-badge">✨ 選択中ルート</span>`;
        }

        const btnLabel = count > 0
            ? `あげる (所持:${count})`
            : (stage === 'baby' ? `進化ルート選択` : `在庫0 (家事/工房で入手)`);

        return `
            <div class="snack-item-card ${isFavorite ? 'is-favorite' : ''} ${isChosenRoute ? 'is-chosen-route' : ''}" style="border-color:${isFavorite ? '#f43f5e' : item.color};">
                <div class="snack-card-left">
                    <div class="snack-card-icon">${item.icon}</div>
                    <div class="snack-card-info">
                        <div class="snack-card-title-row">
                            <span class="snack-card-name" style="color:${item.color};">${item.name}</span>
                            <span class="snack-stock-pill ${count > 0 ? 'has-stock' : 'no-stock'}">所持: ${count}個</span>
                        </div>
                        <div class="snack-card-route">${item.routeLabel} ｜ ${item.desc}</div>
                        <div class="snack-card-badges">${badges}</div>
                    </div>
                </div>
                <button type="button" class="snack-feed-action-btn ${canFeed ? '' : 'disabled'}"
                    onclick="feedSnackItem('${item.id}')"
                    ${canFeed ? '' : 'disabled'}>
                    ${btnLabel}
                </button>
            </div>
        `;
    }).join('');

    bodyEl.innerHTML = `
        <div class="snack-modal-status-box">
            <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:4px;">
                <span style="font-size:12px; font-weight:bold; color:#fde047;">現在: ${stageNames[stage] || stage}</span>
                ${buffActive
                    ? `<span class="snack-buff-active-pill">🔥 次回家事EXP 1.5倍バフ発動中！</span>`
                    : `<span style="font-size:11px; color:#94a3b8;">バフ未発動</span>`
                }
            </div>
            <div style="font-size:12px; color:#f8fafc; margin-top:6px; line-height:1.45;">
                💖 現在の相棒の大好物系統：<strong style="color:#fb7185;">${favInfo.snack ? `${favInfo.snack.icon} ${favInfo.snack.name}（${favInfo.snack.routeLabel}）` : '王道ドラゴン系統'}</strong>
            </div>
            <div style="font-size:11px; color:#cbd5e1; margin-top:4px; line-height:1.4;">
                ※ベビー期・青年期は与えたおやつで<strong>進化系統（全6系統）</strong>が分岐します！<br>
                ※青年期・守護精霊期でもおやつをあげられ、<strong>💖大好物系統</strong>をあげると<strong>+40 EXP ＆ 次の家事EXP 1.5倍バフ</strong>が付与されます！（通常おやつは+20 EXP）
            </div>
        </div>
        <div class="snack-cards-list">
            ${cardsHtml}
        </div>
        <div style="margin-top:0.75rem; display:flex; justify-content:space-between; align-items:center; gap:0.5rem;">
            <button type="button" onclick="closeBabySnackModal(); if(typeof openWorkshopModal==='function') openWorkshopModal();" style="flex:1; padding:0.55rem; background:#1e293b; color:#38bdf8; border:1px solid #38bdf8; border-radius:8px; font-size:12px; font-weight:bold; cursor:pointer;">🔨 工房・行商人でおやつを入手</button>
            <button type="button" onclick="closeBabySnackModal()" style="padding:0.55rem 1rem; background:#334155; color:#fff; border:none; border-radius:8px; font-size:12px; font-weight:bold; cursor:pointer;">閉じる</button>
        </div>
    `;
}

/**
 * 🍖 おやつをあげる処理（ベビー期・青年期・守護精霊期すべて対応）
 */
function feedSnackItem(snackIdOrRoute) {
    if (typeof SNACK_ITEMS === 'undefined') return;
    const snack = SNACK_ITEMS.find(s => s.id === snackIdOrRoute || s.route === snackIdOrRoute);
    if (!snack) return;

    const lvBefore = getLevel();
    const stage = getCompanionStage(lvBefore);

    if (!kajigonState.snackInventory) {
        kajigonState.snackInventory = {};
    }
    const currentStock = Number(kajigonState.snackInventory[snack.id] || 0);

    // ベビー期以外は在庫が必要
    if (currentStock <= 0 && stage !== 'baby') {
        if (typeof showToast === 'function') {
            showToast(`⚠️「${snack.name}」の在庫がありません！家事完了ドロップや工房ショップで入手できます。`);
        }
        return;
    }

    // 大好物判定（進化完了後は図鑑の大好物系統、進化前は現在の予定系統またはベビー期選択）
    const favInfoBefore = (typeof getCurrentFavoriteSnackInfo === 'function') ? getCurrentFavoriteSnackInfo() : null;

    // 進化前のステージ（egg / baby / teen）では進化ルートを更新
    if (stage !== 'final') {
        kajigonState.chosenRoute = snack.route;
        if (snack.route === 'golem') {
            if (!kajigonState.materials) kajigonState.materials = { wood: 0, cloth: 0, brick: 0, gear: 0 };
            kajigonState.materials.gear = (kajigonState.materials.gear || 0) + 1;
            if (kajigonState.artifactCount < 3) kajigonState.artifactCount++;
        }
    }

    // 在庫がある場合は1個消費
    const consumedStock = currentStock > 0;
    if (consumedStock) {
        kajigonState.snackInventory[snack.id] = currentStock - 1;
    }

    // 大好物一致判定（守護精霊期は図鑑の大好物系統、ベビー/青年期は大好物一致またはルート進化おやつとして大好物ボーナス発動！）
    const isFavoriteMatch = Boolean(
        (favInfoBefore && favInfoBefore.route === snack.route) ||
        (stage === 'baby' && consumedStock)
    );

    const bonusExp = consumedStock ? (isFavoriteMatch ? 40 : 20) : 0;
    if (bonusExp > 0) {
        kajigonState.totalExp += bonusExp;
    }
    if (isFavoriteMatch && consumedStock) {
        kajigonState.nextChoreExpBuff = 1.5;
    }

    const lvAfter = getLevel();
    saveToLocalStorage();
    closeBabySnackModal();
    updateCompanionWidget();
    if (typeof updateUI === 'function') {
        updateUI(lvAfter > lvBefore);
    }

    const petWrapper = document.getElementById('room-pet-wrapper');
    if (isFavoriteMatch && consumedStock) {
        if (typeof SoundEngine !== 'undefined') SoundEngine.playSE('level_up');
        createSpecialFavoriteHeartBurst(petWrapper);
    } else {
        if (typeof SoundEngine !== 'undefined') SoundEngine.playSE('karuta');
        if (typeof createFloatingHearts === 'function' && petWrapper) {
            createFloatingHearts(petWrapper);
        }
    }

    const routeMsgMap = {
        dragon: `「モグモグ…！ドラゴン肉で力がみなぎる！伝説の龍のパワーが湧いてきたぞ！」`,
        golem: `「モグモグ…！古代のネジの力で、頼もしい魔ゴーレムの装甲が輝くぞ！」`,
        fairy: `「モグモグ…！妖精のハチミツあま〜い！幸せな魔法の力が満ちていく〜♪」`,
        fluffy: `「ごくごく…！星降るホットミルクで心も毛並みもポカポカもふもふだぞ〜🐾」`,
        wafuu: `「もぐもぐ…！三色月見だんご、風流で美味なり！おうちに福を招くでござる🍵」`,
        sweets: `「パクッ♪ 虹色シュガーベリーが甘酸っぱくてとろける〜！極上スイーツパワー全開🍰」`
    };

    const baseLine = routeMsgMap[snack.route] || `「モグモグ！${snack.name}、とってもおいしかったぞ！」`;
    const buffLine = (isFavoriteMatch && consumedStock)
        ? ` 💖大好物ボーナスで +${bonusExp} EXP ＆ 次の家事EXPが1.5倍になったぞ！`
        : (bonusExp > 0 ? ` （+${bonusExp} EXP獲得！）` : '');

    if (typeof showCompanionDialogue === 'function') {
        showCompanionDialogue(baseLine + buffLine);
    }

    if (typeof showToast === 'function') {
        if (isFavoriteMatch && consumedStock) {
            showToast(`💖 大好物の「${snack.name}」をあげました！（+${bonusExp} EXP ＆ 次回家事EXP 1.5倍バフ発動！）`);
        } else if (consumedStock) {
            showToast(`${snack.icon}「${snack.name}」をあげました！（+${bonusExp} EXP / ${snack.routeLabel}）`);
        } else {
            showToast(`${snack.icon} 進化ルートを「${snack.routeLabel}」に設定しました！`);
        }
    }
}

// 後方互換エイリアス
function feedBabySnack(route) {
    feedSnackItem(route);
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
        if (kajigonState.selectedTitle && typeof TITLES_DATA !== 'undefined') {
            const tObj = Array.isArray(TITLES_DATA)
                ? TITLES_DATA.find(t => t.id === kajigonState.selectedTitle)
                : TITLES_DATA[kajigonState.selectedTitle];
            if (tObj) {
                titleBadgeHtml = `<span class="title-tag-badge" onclick="if(typeof openBookModal==='function'){openBookModal(); if(typeof switchBookTab==='function') switchBookTab('achievements');}" style="cursor:pointer; vertical-align:middle;" title="タップして称号変更">[${tObj.icon}${tObj.name}]</span> `;
            }
        }
        statusNameEl.innerHTML = `✅ ${titleBadgeHtml}${dragonName} (LV.${lv}) <span onclick="openRenameCompanionModal()" style="font-size:11px; cursor:pointer; color:#fbbf24; text-decoration:underline;">[改名]</span>${rebreedTag}`;
    }
    if (statusExpEl) {
        const nextLvExp = lv * 150;
        const buffTag = (kajigonState.nextChoreExpBuff && kajigonState.nextChoreExpBuff > 1.0)
            ? ` 🔥[次回家事1.5倍!]`
            : '';
        statusExpEl.textContent = `EXP: ${kajigonState.totalExp} / ${nextLvExp} (${stage.toUpperCase()})${buffTag}`;
    }

    // 💤 夜間居眠りモード判定（22:00〜翌6:00、卵ステージ時はzzzを出さない）
    const isSleeping = isCompanionSleeping();
    const animClass = isSleeping ? 'companion-sleeping' : 'companion-walking';
    const sleepBubbleHtml = (isSleeping && stage !== 'egg') ? `<div class="sleep-bubble">💭 zzz...</div>` : '';

    // スプライト画像（浮遊ボタンを廃止し、木の床へ自然に接地させる）
    let companionImgHtml = '';
    const envTheme = kajigonState.environmentTheme || 'classic';
    const route = kajigonState.chosenRoute || '';
    const routeBadgeIconMap = {
        dragon: '🍖',
        golem: '⚙️',
        fairy: '🍯',
        fluffy: '🐾',
        wafuu: '🍵',
        sweets: '🍰'
    };
    const routeBadgeHtml = (route && routeBadgeIconMap[route] && stage !== 'egg' && stage !== 'final')
        ? `<div class="companion-route-aura-badge" title="進化系統: ${route}">${routeBadgeIconMap[route]}</div>`
        : '';

    if (stage === 'egg') {
        companionImgHtml = `
            <div style="position:relative; display:flex; flex-direction:column; align-items:center;">
                <img class="companion-avatar-img ${animClass}" src="images/spirits/egg.png" alt="ドラゴンの卵" style="width:90px; height:90px; object-fit:contain; image-rendering:pixelated; filter:drop-shadow(0 4px 8px rgba(0,0,0,0.6));" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
                <div style="font-size:72px; display:none;">🥚</div>
            </div>
        `;
    } else if (stage === 'baby') {
        companionImgHtml = `
            <div style="position:relative; display:flex; flex-direction:column; align-items:center;">
                ${routeBadgeHtml}
                <img class="companion-avatar-img ${animClass} ${route ? `route-tint-${route}` : ''}" src="images/spirits/kajigon_baby.png" alt="ベビーカジゴン" style="width:110px; height:110px; object-fit:contain; image-rendering:pixelated; filter:drop-shadow(0 4px 8px rgba(0,0,0,0.6));" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
                <div style="font-size:64px; display:none;">🐣</div>
                ${sleepBubbleHtml}
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
                ${routeBadgeHtml}
                <img class="companion-avatar-img ${animClass} ${route ? `route-tint-${route}` : ''}" src="${teenImg}" alt="ティーンカジゴン" style="width:130px; height:130px; object-fit:contain; image-rendering:pixelated; filter:drop-shadow(0 4px 8px rgba(0,0,0,0.6));" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
                <div style="font-size:64px; display:none;">👾</div>
                ${sleepBubbleHtml}
            </div>
        `;
    } else {
        // 最終進化 (Lv.10)
        const evolved = getEvolvedForm();
        recordToEncyclopedia(evolved);
        const isSvgSprite = evolved.file && evolved.file.endsWith('.svg');
        companionImgHtml = `
            <div style="position:relative; display:flex; flex-direction:column; align-items:center;">
                <img class="companion-avatar-img ${animClass} ${isSvgSprite ? 'svg-spirit-sprite' : ''}" src="${evolved.file}" alt="${evolved.name}" style="width:150px; height:150px; object-fit:contain; ${isSvgSprite ? '' : 'image-rendering:pixelated;'} filter:drop-shadow(0 6px 12px rgba(0,0,0,0.7));" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
                <div style="font-size:72px; display:none;">🐉</div>
                ${sleepBubbleHtml}
            </div>
        `;
    }

    widget.innerHTML = companionImgHtml;

    // 🍖 サイドバー「おやつ」ボタンの「!」バッジ更新
    updateSnackBadge();

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
    const lv = getLevel();
    const stage = getCompanionStage(lv);

    // ぷにっと跳ねる演出
    const petWrapper = document.getElementById('room-pet-wrapper');
    if (petWrapper) {
        petWrapper.classList.remove('pet-spring-bounce');
        void petWrapper.offsetWidth;
        petWrapper.classList.add('pet-spring-bounce');
        setTimeout(() => {
            petWrapper.classList.remove('pet-spring-bounce');
        }, 600);
        if (stage !== 'egg' && typeof createFloatingHearts === 'function') {
            createFloatingHearts(petWrapper);
        }
    }

    // 🥚 Task 3: 卵ステージ（Lv.1〜2）はサイレント演出（発話SEを鳴らさず状況描写のみ表示）
    if (stage === 'egg') {
        const silentLine = EGG_SILENT_LINES[Math.floor(Math.random() * EGG_SILENT_LINES.length)];
        showCompanionDialogue(silentLine, { silent: true });
        return;
    }

    if (typeof SoundEngine !== 'undefined') {
        SoundEngine.playSE('talk');
    }

    const dragonName = kajigonState.companionName || 'カジゴン';

    // 💤 居眠り中のリアクション
    if (isCompanionSleeping()) {
        const sleepLines = [
            `「むにゃむにゃ…シチューの夢を見てるぞ…zzZ」`,
            `「すやすや…総監督、今日も一日お疲れさま…zzZ」`,
            `「むにゃ…きれいなお部屋…気持ちいいぞ…zzZ」`
        ];
        showCompanionDialogue(sleepLines[Math.floor(Math.random() * sleepLines.length)], { silent: true });
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

    showCompanionDialogue(lines[Math.floor(Math.random() * lines.length)], { silent: true });
}

let dialogueHideTimer = null;

function showCompanionDialogue(text, options = {}) {
    const bubble = document.getElementById('companion-speech-bubble');
    const speechText = document.getElementById('speech-text');
    if (!bubble || !speechText) return;

    const lv = (typeof getLevel === 'function') ? getLevel() : 1;
    const stage = (typeof getCompanionStage === 'function') ? getCompanionStage(lv) : 'egg';

    // 🥚 Task 3: 卵ステージ（Lv.1〜2）の間は通常の人間セリフを状況描写へ差し替え、発話SEもミュート
    let finalText = text;
    if (stage === 'egg') {
        const isAlreadySilentDesc = EGG_SILENT_LINES.includes(text) || (typeof text === 'string' && text.startsWith('（') && text.endsWith('）'));
        if (!isAlreadySilentDesc) {
            finalText = EGG_SILENT_LINES[Math.floor(Math.random() * EGG_SILENT_LINES.length)];
        }
    } else if (!options.silent && typeof SoundEngine !== 'undefined') {
        SoundEngine.playSE('talk');
    }

    speechText.textContent = finalText;
    bubble.classList.remove('hidden');

    if (dialogueHideTimer) {
        clearTimeout(dialogueHideTimer);
    }
    dialogueHideTimer = setTimeout(() => {
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

    showCompanionDialogue(`「お留守番中におみやげを拾ってきたぞ！【${gained.join(' と ')}】だ！使ってくれ！」`, { silent: true });
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
        // 🛡️ Task 4: 里帰り描画時のスプライト参照解決＆卵表示ガード
        let spriteSrc = currentVisitor.file || currentVisitor.spiritFile || '';
        const isEggOrInvalid = !spriteSrc || spriteSrc.includes('egg') || currentVisitor.spiritId === 'egg';

        if (isEggOrInvalid) {
            const fallbackAttr = currentVisitor.mainAttr || currentVisitor.attr || 'fire';
            if (typeof getGuardianSpiritByAttr === 'function') {
                const guardian = getGuardianSpiritByAttr(fallbackAttr);
                if (guardian && guardian.file && !guardian.file.includes('egg')) {
                    spriteSrc = guardian.file;
                    currentVisitor.file = guardian.file;
                    currentVisitor.spiritFile = guardian.file;
                    currentVisitor.spiritId = guardian.id;
                    if (!currentVisitor.spiritName || currentVisitor.spiritName.includes('卵')) {
                        currentVisitor.spiritName = guardian.name;
                    }
                }
            }
        }

        // 万が一それでも卵スプライトまたは空になる場合は先輩を表示しない
        if (!spriteSrc || spriteSrc.includes('egg')) {
            slot.classList.add('hidden');
            slot.innerHTML = '';
            currentVisitor = null;
            return;
        }

        const visitorName = currentVisitor.name || currentVisitor.spiritName || '先輩カジゴン';
        slot.classList.remove('hidden');
        slot.innerHTML = `
            <div class="visitor-speech-bubble">「見回りに来たぞ！」</div>
            <img class="visitor-avatar-img" src="${spriteSrc}" alt="${visitorName}">
        `;
    } else {
        slot.classList.add('hidden');
        slot.innerHTML = '';
    }
}

function onVisitorClick(event) {
    if (event && event.stopPropagation) event.stopPropagation();
    if (!currentVisitor) return;
    if (typeof SoundEngine !== 'undefined') SoundEngine.playSE('click');

    const slot = document.getElementById('room-visitor-slot');
    if (typeof createFloatingHearts === 'function' && slot) {
        createFloatingHearts(slot);
    }

    const visitorName = currentVisitor.name || currentVisitor.spiritName || '先輩カジゴン';

    if (!visitorGiftClaimed) {
        visitorGiftClaimed = true;
        kajigonState.materials = kajigonState.materials || { wood: 0, cloth: 0, brick: 0, gear: 0 };
        const matKeys = ['wood', 'cloth', 'brick', 'gear'];
        const names = { wood: 'きれいな木材', cloth: 'ふんわり布', brick: 'かたいレンガ', gear: '小さなネジ' };
        const pick = matKeys[Math.floor(Math.random() * matKeys.length)];
        kajigonState.materials[pick] = (kajigonState.materials[pick] || 0) + 1;
        saveToLocalStorage();

        if (typeof showToast === 'function') {
            showToast(`🏛️ 先輩カジゴン【${visitorName}】から手土産【${names[pick]}×1】を貰いました！`);
        }
    } else {
        if (typeof showToast === 'function') {
            showToast(`🏛️ 先輩カジゴン【${visitorName}】「後輩も頑張ってるな！応援してるぞ！」`);
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
        // 🛡️ Task 4: ステータスをLv.1（卵）にリセットする「前」に、必ずLv.10時点の最終進化形態IDと当時の主属性を保存
        if (lv >= 10) {
            const evolved = getEvolvedForm();
            const mainAttr = (typeof getDominantAttribute === 'function')
                ? getDominantAttribute(kajigonState)
                : (evolved && evolved.attr ? evolved.attr : 'fire');
            recordToEncyclopedia(evolved);
            if (typeof saveHallOfFame === 'function') {
                saveHallOfFame(evolved, mainAttr);
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
