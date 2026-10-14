// ==========================================================================
// 🏡 新・家具＆クラフト工房システム（『カジゴンの模様替え工房』）
// ==========================================================================

// クラフト可能な基本家具リスト（ドット絵アセット連携）
const CRAFTABLE_FURNITURE = [
    {
        id: 'plant',
        name: '小さな観葉植物',
        icon: '🪴',
        image: 'images/furniture/plant.png',
        materials: { wood: 2, cloth: 1 },
        desc: '新芽がすくすく育つ癒やしのグリーン',
        buffLabel: '🍃風・🪵土家事 EXP +15%',
        buffAttr: ['wind', 'earth'],
        multiplier: 1.15,
        slot: 'floor_left',
        tapAction: (dragonName) => `「お水やりありがとう！葉っぱがツヤツヤだぞ〜！」`
    },
    {
        id: 'rug',
        name: 'ふかふか絨毯',
        icon: '🛋️',
        image: 'images/furniture/rug.png',
        materials: { cloth: 3, wood: 1 },
        desc: 'カジゴンがゴロゴロ寝転がる心地よい敷物',
        buffLabel: '💬会話頻度UP ＆ ⚙️ネジ発見率UP',
        buffAttr: ['all'],
        multiplier: 1.05,
        slot: 'center',
        tapAction: (dragonName) => `「この絨毯、ふっかふかで最高〜！ゴロゴロしちゃうぞ！」`
    },
    {
        id: 'lamp',
        name: 'あたたかいランプ',
        icon: '💡',
        image: 'images/furniture/lamp.png',
        materials: { wood: 2, gear: 1 },
        desc: '夜のひとときをオレンジ色に照らす灯り',
        buffLabel: '🌙夜間家事 (18時以降) EXP +20%',
        buffNightOnly: true,
        multiplier: 1.20,
        slot: 'top_right',
        tapAction: (dragonName) => `「パチッ！カジゴンの部屋があたたかい光で包まれた！」`
    },
    {
        id: 'stew',
        name: 'ほかほかシチュー鍋',
        icon: '🍲',
        image: 'images/furniture/stew.png',
        materials: { brick: 3, wood: 1 },
        desc: 'いい匂いが部屋中に漂う栄養満点の鍋',
        buffLabel: '🔥火属性家事 EXP +20%',
        buffAttr: ['fire'],
        multiplier: 1.20,
        slot: 'floor_center',
        tapAction: (dragonName) => `「ぐつぐつ…！シチューのいい匂いが部屋いっぱいに広がる！」`
    },
    {
        id: 'bookshelf',
        name: '暮らしの魔導書棚',
        icon: '📚',
        image: 'images/furniture/bookshelf.png',
        materials: { wood: 4, brick: 2 },
        desc: 'おうちの知恵とレシピがぎっしり詰まった本棚',
        buffLabel: '⭐全家事の獲得EXP +10%',
        buffAttr: ['all'],
        multiplier: 1.10,
        slot: 'shelf',
        tapAction: (dragonName) => `「パラパラ…『きれいなおうちの秘訣』が書いてあるぞ！」`
    },
    {
        id: 'castle',
        name: 'カジゴン神殿の模型',
        icon: '🏰',
        image: 'images/furniture/castle.png',
        materials: { brick: 5, gear: 3 },
        desc: '家族の協力と毎日の継続を称える小さなお城',
        buffLabel: '👑全家事EXP +15% ＆ ラッキー強化',
        buffAttr: ['all'],
        multiplier: 1.15,
        slot: 'shelf',
        tapAction: (dragonName) => `「立派なお城だぞ〜！ボクたちの神殿みたいだな！」`
    }
];

// 季節限定の行商人家具
const SEASONAL_MERCHANT_FURNITURE = {
    spring: { id: 'sakura', name: '桜の盆栽', icon: '🌸', cost: { wood: 3, cloth: 2 }, buffLabel: '⚔️ボス討伐EXP +30%', desc: '春爛漫！部屋の中でお花見気分' },
    summer: { id: 'furin', name: '涼やかな風鈴', icon: '🎐', cost: { wood: 3, gear: 2 }, buffLabel: '⚔️ボス討伐EXP +30%', desc: '心地よい涼風を呼ぶ夏の風物詩' },
    autumn: { id: 'pumpkin', name: 'カボチャランタン', icon: '🎃', cost: { brick: 3, wood: 2 }, buffLabel: '⚔️ボス討伐EXP +30%', desc: '秋の夜長を彩るあたたかな灯り' },
    winter: { id: 'kotatsu', name: 'ぬくぬくこたつ', icon: '🍊', cost: { wood: 3, cloth: 3 }, buffLabel: '⚔️ボス討伐EXP +30%', desc: '一度入ると出られなくなる天国' }
};

/**
 * 現在の季節キーを取得 ('spring' | 'summer' | 'autumn' | 'winter')
 */
function getCurrentSeasonKey() {
    const month = new Date().getMonth() + 1;
    if (month >= 3 && month <= 5) return 'spring';
    if (month >= 6 && month <= 8) return 'summer';
    if (month >= 9 && month <= 11) return 'autumn';
    return 'winter';
}

/**
 * 週末（金曜18時〜日曜24時）判定：さすらいの行商人開店チェック
 */
function isMerchantOpen() {
    const now = new Date();
    const day = now.getDay(); // 0: 日, 5: 金, 6: 土
    const hour = now.getHours();
    if (day === 5 && hour >= 18) return true;
    if (day === 6 || day === 0) return true;
    return false;
}

/**
 * 家事完了時の素材ドロップ判定
 */
function dropChoreMaterials(choreName, stats) {
    if (!kajigonState.materials) {
        kajigonState.materials = { wood: 0, cloth: 0, brick: 0, gear: 0 };
    }

    const dropped = [];
    const attr = stats.attr;

    // 家事内容に応じて基本素材が確定1〜2個ドロップ
    if (choreName.includes('掃除機') || choreName.includes('掃き掃除') || attr === 'wind') {
        const count = Math.random() < 0.3 ? 2 : 1;
        kajigonState.materials.wood += count;
        dropped.push({ name: '木材 🪵', count });
    } else if (choreName.includes('洗濯') || choreName.includes('干す') || choreName.includes('畳む') || choreName.includes('タオル')) {
        const count = Math.random() < 0.3 ? 2 : 1;
        kajigonState.materials.cloth += count;
        dropped.push({ name: '布 🧶', count });
    } else if (choreName.includes('料理') || choreName.includes('シンク') || choreName.includes('風呂') || choreName.includes('食器') || attr === 'fire' || attr === 'water') {
        const count = Math.random() < 0.3 ? 2 : 1;
        kajigonState.materials.brick += count;
        dropped.push({ name: 'レンガ 🧱', count });
    } else {
        const count = 1;
        kajigonState.materials.wood += count;
        dropped.push({ name: '木材 🪵', count });
    }

    // 物品補充、または15%のラッキー確率で「古代のネジ ⚙️」ドロップ
    if (choreName.startsWith('[物品補充]') || Math.random() < 0.15) {
        kajigonState.materials.gear = (kajigonState.materials.gear || 0) + 1;
        // ゴーレム進化用パーツにも加算（上限3）
        if (kajigonState.artifactCount < 3) {
            kajigonState.artifactCount++;
        }
        dropped.push({ name: '古代のネジ ⚙️', count: 1 });
    }

    return dropped;
}

/**
 * 所持・配置家具による獲得EXP倍率の計算
 */
function getFurnitureExpMultiplier(choreName, stats) {
    if (!kajigonState.unlockedFurniture || kajigonState.unlockedFurniture.length === 0) {
        return 1.0;
    }

    let multiplier = 1.0;
    const hour = new Date().getHours();
    const isNight = hour >= 18 || hour < 6;

    kajigonState.unlockedFurniture.forEach(furnId => {
        const furn = CRAFTABLE_FURNITURE.find(f => f.id === furnId);
        if (!furn) return;

        // 夜間ボーナス
        if (furn.buffNightOnly && isNight) {
            multiplier *= furn.multiplier;
        }
        // 属性ボーナス
        else if (furn.buffAttr) {
            if (furn.buffAttr.includes('all') || (stats && furn.buffAttr.includes(stats.attr))) {
                multiplier *= furn.multiplier;
            }
        }
    });

    return multiplier;
}

/**
 * カジゴンのおねだり（次に作れる家具のリクエスト）を取得
 */
function getNextFurnitureWish() {
    const unlocked = new Set(kajigonState.unlockedFurniture || []);
    const materials = kajigonState.materials || { wood: 0, cloth: 0, brick: 0, gear: 0 };

    for (const furn of CRAFTABLE_FURNITURE) {
        if (!unlocked.has(furn.id)) {
            // 素材が足りているかチェック
            const canCraft = Object.entries(furn.materials).every(([m, req]) => (materials[m] || 0) >= req);
            return {
                furniture: furn,
                canCraft: canCraft,
                dialogue: canCraft
                    ? `「総監督！素材が集まったぞ！『${furn.name}（${furn.icon}）』を工房で作ってみないか？」`
                    : `「総監督、お部屋に『${furn.name}（${furn.icon}）』が欲しいな〜！家事で素材を集めよう！」`
            };
        }
    }
    return null;
}

/**
 * 家具をクラフトする処理
 */
function craftFurniture(furnId) {
    const furn = CRAFTABLE_FURNITURE.find(f => f.id === furnId);
    if (!furn) return false;

    if (!kajigonState.unlockedFurniture) kajigonState.unlockedFurniture = [];
    if (kajigonState.unlockedFurniture.includes(furnId)) {
        alert('その家具はすでに作成済みです！');
        return false;
    }

    const materials = kajigonState.materials || { wood: 0, cloth: 0, brick: 0, gear: 0 };
    // 素材チェック
    for (const [m, req] of Object.entries(furn.materials)) {
        if ((materials[m] || 0) < req) {
            alert(`素材が足りません！（必要: ${m} × ${req}）`);
            return false;
        }
    }

    // 素材消費
    for (const [m, req] of Object.entries(furn.materials)) {
        materials[m] -= req;
    }
    kajigonState.unlockedFurniture.push(furnId);

    if (typeof SoundEngine !== 'undefined') {
        SoundEngine.playSE('level_up');
    }

    saveToLocalStorage();
    renderFurnitureInRoom();
    renderCraftWorkshopModal();
    
    if (typeof showToast === 'function') {
        showToast(`🔨「${furn.name}」をクラフトしました！（${furn.buffLabel}）`);
    }

    return true;
}

/**
 * お部屋内の家具スロット描画（ドット絵アセット連携）
 */
function renderFurnitureInRoom() {
    const plantEl = document.getElementById('furniture-plant');
    const stewEl = document.getElementById('furniture-stew');
    const shelfEl = document.getElementById('furniture-shelf');
    const rugEl = document.getElementById('furniture-rug');
    const lampEl = document.querySelector('.room-lamp');

    const unlocked = new Set(kajigonState.unlockedFurniture || []);

    if (plantEl) {
        plantEl.style.display = unlocked.has('plant') ? 'block' : 'none';
        plantEl.onclick = () => onFurnitureItemClick('plant');
    }
    if (stewEl) {
        stewEl.style.display = unlocked.has('stew') ? 'block' : 'none';
        stewEl.onclick = () => onFurnitureItemClick('stew');
    }
    if (rugEl) {
        rugEl.style.display = unlocked.has('rug') ? 'block' : 'none';
        rugEl.onclick = () => onFurnitureItemClick('rug');
    }
    if (shelfEl) {
        // 模型・本棚・季節家具の優先表示
        if (unlocked.has('castle')) {
            shelfEl.src = 'images/furniture/castle.png';
            shelfEl.alt = 'カジゴン神殿の模型';
            shelfEl.title = 'カジゴン神殿の模型';
            shelfEl.style.display = 'block';
            shelfEl.onclick = () => onFurnitureItemClick('castle');
        } else if (unlocked.has('bookshelf')) {
            shelfEl.src = 'images/furniture/bookshelf.png';
            shelfEl.alt = '暮らしの魔導書棚';
            shelfEl.title = '暮らしの魔導書棚';
            shelfEl.style.display = 'block';
            shelfEl.onclick = () => onFurnitureItemClick('bookshelf');
        } else {
            shelfEl.style.display = 'none';
        }
    }
    if (lampEl) {
        // ランプの明るさ切り替え
        lampEl.onclick = () => onFurnitureItemClick('lamp');
    }
}

/**
 * 家具をタップした際のアクション
 */
function onFurnitureItemClick(furnId) {
    if (typeof SoundEngine !== 'undefined') {
        SoundEngine.playSE('click');
    }
    const furn = CRAFTABLE_FURNITURE.find(f => f.id === furnId);
    const dragonName = kajigonState.companionName || 'カジゴン';

    if (furn && furn.tapAction) {
        const speech = furn.tapAction(dragonName);
        if (typeof showCompanionDialogue === 'function') {
            showCompanionDialogue(speech);
        }
    } else {
        if (typeof showCompanionDialogue === 'function') {
            showCompanionDialogue(`「お気に入りの家具だぞ！おうちが快適になって嬉しいな〜！」`);
        }
    }
}

/**
 * クラフト工房＆行商人モーダルのレンダリング
 */
function renderCraftWorkshopModal() {
    const container = document.getElementById('workshop-content-container');
    if (!container) return;

    const materials = kajigonState.materials || { wood: 0, cloth: 0, brick: 0, gear: 0 };
    const unlocked = new Set(kajigonState.unlockedFurniture || []);
    const merchantOpen = isMerchantOpen();
    const currentSeason = getCurrentSeasonKey();
    const seasonalFurn = SEASONAL_MERCHANT_FURNITURE[currentSeason];

    let html = `
        <!-- 所持素材ヘッダー -->
        <div class="materials-status-bar" style="background:#14141f; border:2px solid var(--accent); border-radius:8px; padding:0.6rem; margin-bottom:1rem; display:flex; justify-content:space-around; text-align:center;">
            <div><span style="font-size:18px;">🪵</span><div style="font-size:12px; font-weight:bold; color:#fff;">木材: ${materials.wood || 0}</div></div>
            <div><span style="font-size:18px;">🧶</span><div style="font-size:12px; font-weight:bold; color:#fff;">布: ${materials.cloth || 0}</div></div>
            <div><span style="font-size:18px;">🧱</span><div style="font-size:12px; font-weight:bold; color:#fff;">レンガ: ${materials.brick || 0}</div></div>
            <div><span style="font-size:18px;">⚙️</span><div style="font-size:12px; font-weight:bold; color:#ffd700;">ネジ: ${materials.gear || 0}</div></div>
        </div>

        <h3 style="font-size:14px; color:var(--accent); margin-bottom:0.5rem;">🔨 おうちDIYクラフト</h3>
        <div class="craft-grid" style="display:flex; flex-direction:column; gap:0.6rem; margin-bottom:1.2rem;">
            ${CRAFTABLE_FURNITURE.map(furn => {
                const isCrafted = unlocked.has(furn.id);
                const canCraft = !isCrafted && Object.entries(furn.materials).every(([m, req]) => (materials[m] || 0) >= req);
                const reqText = Object.entries(furn.materials).map(([m, req]) => {
                    const icon = m === 'wood' ? '🪵' : m === 'cloth' ? '🧶' : m === 'brick' ? '🧱' : '⚙️';
                    return `${icon}×${req}`;
                }).join(' ');

                return `
                    <div class="craft-card" style="background:${isCrafted ? '#0e1812' : '#1c1b26'}; border:2px solid ${isCrafted ? '#10b981' : (canCraft ? '#ffd700' : '#444')}; border-radius:8px; padding:0.6rem 0.8rem; display:flex; align-items:center; justify-content:space-between;">
                        <div style="display:flex; align-items:center; gap:0.6rem;">
                            ${furn.image ? `
                                <img src="${furn.image}" alt="${furn.name}" style="width:38px; height:38px; object-fit:contain; image-rendering:pixelated; filter:drop-shadow(0 2px 4px rgba(0,0,0,0.5));">
                            ` : `
                                <span style="font-size:26px;">${furn.icon}</span>
                            `}
                            <div>
                                <div style="font-weight:bold; font-size:13px; color:#fff;">${furn.name}</div>
                                <div style="font-size:11px; color:#a1a1aa;">${furn.buffLabel}</div>
                                <div style="font-size:10px; color:#fbbf24;">必要素材: ${reqText}</div>
                            </div>
                        </div>
                        <div>
                            ${isCrafted ? `
                                <span style="font-size:11px; color:#34d399; font-weight:bold; padding:0.3rem 0.6rem; background:#064e3b; border-radius:4px;">作成済み</span>
                            ` : `
                                <button onclick="craftFurniture('${furn.id}')" ${!canCraft ? 'disabled' : ''} style="padding:0.4rem 0.8rem; border-radius:6px; font-weight:bold; font-size:12px; cursor:${canCraft ? 'pointer' : 'not-allowed'}; background:${canCraft ? '#ffd700' : '#333'}; color:${canCraft ? '#000' : '#888'}; border:none;">作る！</button>
                            `}
                        </div>
                    </div>
                `;
            }).join('')}
        </div>

        <!-- 週末の行商人エリア -->
        <h3 style="font-size:14px; color:#f59e0b; margin-bottom:0.5rem;">🐪 さすらいの週末行商人</h3>
        <div style="background:#221811; border:2px dashed #f59e0b; border-radius:8px; padding:0.8rem;">
            ${merchantOpen ? `
                <div style="font-size:12px; color:#fbbf24; margin-bottom:0.4rem; font-weight:bold;">✨ 週末限定ショップ開店中！（日曜24時まで）</div>
                <div style="display:flex; align-items:center; justify-content:space-between;">
                    <div style="display:flex; align-items:center; gap:0.6rem;">
                        <span style="font-size:26px;">${seasonalFurn.icon}</span>
                        <div>
                            <div style="font-weight:bold; font-size:13px; color:#fff;">${seasonalFurn.name}</div>
                            <div style="font-size:11px; color:#34d399;">${seasonalFurn.buffLabel}</div>
                            <div style="font-size:10px; color:#a1a1aa;">${seasonalFurn.desc}</div>
                        </div>
                    </div>
                    <div>
                        ${unlocked.has(seasonalFurn.id) ? `
                            <span style="font-size:11px; color:#34d399; font-weight:bold;">購入済み</span>
                        ` : `
                            <button onclick="buyMerchantItem('${seasonalFurn.id}')" style="padding:0.4rem 0.8rem; border-radius:6px; font-weight:bold; font-size:12px; background:#f59e0b; color:#fff; border:none; cursor:pointer;">交換する</button>
                        `}
                    </div>
                </div>
            ` : `
                <div style="font-size:12px; color:#94a3b8; text-align:center; padding:0.5rem;">
                    🐪 行商人は旅の途中です…（金曜夜〜日曜日にやって来ます！）
                </div>
            `}
        </div>
    `;

    container.innerHTML = html;
}

function buyMerchantItem(itemId) {
    const currentSeason = getCurrentSeasonKey();
    const furn = SEASONAL_MERCHANT_FURNITURE[currentSeason];
    if (!furn || furn.id !== itemId) return;

    if (!kajigonState.unlockedFurniture) kajigonState.unlockedFurniture = [];
    if (kajigonState.unlockedFurniture.includes(itemId)) {
        alert('すでに手に入れています！');
        return;
    }

    const materials = kajigonState.materials || { wood: 0, cloth: 0, brick: 0, gear: 0 };
    for (const [m, req] of Object.entries(furn.cost)) {
        if ((materials[m] || 0) < req) {
            alert(`素材が足りません！（必要: ${m} × ${req}）`);
            return;
        }
    }

    for (const [m, req] of Object.entries(furn.cost)) {
        materials[m] -= req;
    }
    kajigonState.unlockedFurniture.push(itemId);

    if (typeof SoundEngine !== 'undefined') {
        SoundEngine.playSE('level_up');
    }

    saveToLocalStorage();
    renderFurnitureInRoom();
    renderCraftWorkshopModal();

    if (typeof showToast === 'function') {
        showToast(`🎉 行商人から「${furn.name}」を購入しました！`);
    }
}
