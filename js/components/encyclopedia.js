// ==========================================================================
// 📖 守護精霊図鑑 ＆ 毎朝1回デイリーおみくじ ＆ 歴代殿堂入りシステム
// ==========================================================================

const ALL_SPIRITS = [
    // 🐉 王道ドラゴン系統
    {
        id: 'light_dragon',
        attr: 'light',
        name: '🌟 創世輝龍アルティマ 🐉',
        file: 'images/spirits/dragon_all.png',
        desc: 'すべての家事を愛と調和の心でバランスよくこなし、世界に調和をもたらしました。',
        hint: '【光】全属性の家事をバランスよく行うと進化'
    },
    {
        id: 'fire_dragon',
        attr: 'fire',
        name: '🌋 獄炎龍ボルカノン 🦖',
        file: 'images/spirits/dragon_fire.png',
        desc: 'おうちのシンクやコンロをピカピカに磨き上げ、暮らしに熱い情熱の火を灯し続けてくれました。',
        hint: '【火】料理・コンロなどの熱い家事を極めると進化'
    },
    {
        id: 'water_dragon',
        attr: 'water',
        name: '🌊 海王神龍リヴァイア 🐙',
        file: 'images/spirits/dragon_water.png',
        desc: 'お風呂や洗濯、食器洗いで水回りを清め、家族みんなに清潔と潤いをもたらしてくれました。',
        hint: '【水】お風呂・洗濯・食器洗いなど水回りを極めると進化'
    },
    {
        id: 'wind_dragon',
        attr: 'wind',
        name: '🌪️ 嵐神翼龍ゼフィロス 🦅',
        file: 'images/spirits/dragon_wind.png',
        desc: '丁寧な掃除機がけや階段の掃き掃除でおうちの埃を吹き飛ばし、常に澄み切った新しい風を送り続けてくれました。',
        hint: '【風】掃除機や換気など風の家事を極めると進化'
    },
    {
        id: 'earth_dragon',
        attr: 'earth',
        name: '🪵 巌帝古龍ガイアード 🌲',
        file: 'images/spirits/dragon_earth.png',
        desc: '拭き掃除やゴミ捨て、ベッドメイキングでおうちの基礎をがっしりと支え、最高の安定感を与えてくれました。',
        hint: '【土】拭き掃除・ゴミ捨て・整理整頓を極めると進化'
    },

    // 🤖 機械魔ゴーレム系統
    {
        id: 'dark_golem',
        attr: 'dark',
        name: '👿 不完全なる闇 of 魔ゴーレム 🤖',
        file: 'images/spirits/golem_dark.png',
        desc: '古代パーツ（⚙️）が集まった、不穏で静かに佇む魔導のロボット。コアが怪しく光る姿です。',
        hint: '【闇】古代パーツを集めてバランスよく家事を行うと降臨'
    },
    {
        id: 'fire_golem',
        attr: 'fire',
        name: '🌋 獄炎魔ゴーレム 🤖',
        file: 'images/spirits/golem_fire.png',
        desc: 'おうちのシンクやコンロをピカピカに磨き上げ、熱い鉄の魂で暮らしを支えてくれました。',
        hint: '【火・機械】古代パーツを持ち、火の家事を極めると進化'
    },
    {
        id: 'water_golem',
        attr: 'water',
        name: '🌊 海王魔ゴーレム 🤖',
        file: 'images/spirits/golem_water.png',
        desc: 'お風呂や洗濯、食器洗いで水回りを清め、無休の歯車で清潔と潤いをもたらしてくれました。',
        hint: '【水・機械】古代パーツを持ち、水の家事を極めると進化'
    },
    {
        id: 'wind_golem',
        attr: 'wind',
        name: '🌪️ 嵐神魔ゴーレム 🤖',
        file: 'images/spirits/golem_wind.png',
        desc: '掃除機がけや階段の掃き掃除で埃を吸い込み、強力なファンで新しい風を送り続けてくれました。',
        hint: '【風・機械】古代パーツを持ち、風の家事を極めると進化'
    },
    {
        id: 'earth_golem',
        attr: 'earth',
        name: '🪵 巌帝魔ゴーレム 🤖',
        file: 'images/spirits/golem_earth.png',
        desc: '拭き掃除やゴミ捨て、ベッドメイキングを行い、どっしりとした金属の躯体でおうちの基礎を支えてくれました。',
        hint: '【土・機械】古代パーツを持ち、土の家事を極めると進化'
    },

    // 🌍 環境特化・固有種系統
    {
        id: 'unique_volcano',
        attr: 'fire',
        name: '🌋 溶岩料理神 ボルケフ 🐢',
        file: 'images/spirits/unique_volcano.png',
        desc: '火山玄武岩の甲羅にかまど鍋を背負い、家族の温かい食卓と美味しいご飯を見守る大地のカメ神。',
        hint: '【火山限定】灼熱の火山環境で火の家事を極めると降臨'
    },
    {
        id: 'unique_abyss',
        attr: 'water',
        name: '🌊 清流クラゲ姫 アンフィトリテ 🪼',
        file: 'images/spirits/unique_abyss.png',
        desc: '深海で青く透き通り発光するクラゲの姫君。水回りの滑りやカビを浄化し、家族に潤いを与える。',
        hint: '【深海限定】深海の神殿環境で水の家事を極めると降臨'
    },
    {
        id: 'unique_sky',
        attr: 'wind',
        name: '🍃 樹海番人 シルヴァニアン 🦉',
        file: 'images/spirits/unique_sky.png',
        desc: '緑深き樹海の葉をまとう森の賢者フクロウ。窓から入る澄んだ風とともに埃を吹き払う。',
        hint: '【樹海限定】天空の樹海環境で風の家事を極めると降臨'
    },
    {
        id: 'unique_earth',
        attr: 'earth',
        name: '🏜️ 機巧魔神 ギアオメガ ⚙️',
        file: 'images/spirits/unique_earth.png',
        desc: '古代スチームパンクの歯車と振り子時計を胸に宿した巨神。正確無比なリズムでおうちの秩序を守る。',
        hint: '【遺跡限定】砂漠の巨石遺跡環境で土の家事を極めると降臨'
    },
    {
        id: 'unique_temple',
        attr: 'light',
        name: '📜 彗星神竜 コスモアルティマ 🌌',
        file: 'images/spirits/unique_temple.png',
        desc: '星空の銀河と星座を身に宿した神話の宇宙竜。家中が愛と調和でピカピカに満ちた時にのみ空から舞い降りる。',
        hint: '【神殿限定】星降る神殿で全属性を調和させると降臨'
    },
    {
        id: 'unique_retro',
        attr: 'wind',
        name: '👾 原初ビット ビットゴン 📟',
        file: 'images/spirits/unique_retro.png',
        desc: 'ゲームボーイ初期の4階調ドット画面から実体化した原初のピクセル龍。ノスタルジックな魔力でおうちを包み込む。',
        hint: '【レトロ限定】初代レトロ環境で進化させると降臨'
    },

    // 🧚 妖精・レリック・スライム新種族系統
    {
        id: 'fairy_cook',
        attr: 'fire',
        name: '🍳 フライパン小人 ポックル 👨‍🍳',
        file: 'images/spirits/fairy_cook.png',
        desc: 'コック帽をかぶり黄金のフライパンを手にした料理妖精。フライパンやコンロをピカピカにする人に最高の朝食の幸運を授ける。',
        hint: '【妖精族】料理やキッチン周りの家事をたくさん行うと出現'
    },
    {
        id: 'fairy_cat',
        attr: 'water',
        name: '🧼 あわあわバブルキャット 🐱',
        file: 'images/spirits/fairy_cat.svg',
        desc: '石鹸のフワフワな泡でできた不思議な白猫。お風呂や洗濯を頑張る人の周りをぷかぷか漂い、いい匂いで癒やしてくれる。',
        hint: '【妖精族】お風呂掃除や洗濯の家事をたくさん行うと出現'
    },
    {
        id: 'fairy_broom',
        attr: 'wind',
        name: '🧹 ほうき小僧 ほうき丸 👺',
        file: 'images/spirits/fairy_broom.svg',
        desc: '職人気質の小さなほうき小僧。床や階段のチリひとつ許さず、ササッと掃き清めて爽快な一日を届けてくれる。',
        hint: '【妖精族】掃き掃除や掃除機がけをたくさん行うと出現'
    },
    {
        id: 'relic_book',
        attr: 'earth',
        name: '📖 飛翔魔導書 グリモワール 📜',
        file: 'images/spirits/relic_book.svg',
        desc: '家族の毎日の家事の歴史が書き込まれるにつれて自我を持った古代の魔導書。ページを開くたびにおうちに幸せの魔法をかける。',
        hint: '【レリック族】拭き掃除やゴミ捨てなど日々の記録を積み重ねると覚醒'
    },
    {
        id: 'relic_lamp',
        attr: 'fire',
        name: '🪔 団欒の魔人 ジン・ランタン 🧞',
        file: 'images/spirits/relic_lamp.svg',
        desc: '温かい光を放つ魔法のランプから現れる魔人。家族団欒のひとときを黄金のぬくもりで包み込み、みんなを笑顔にする。',
        hint: '【レリック族】夜の家事や物品補充を行うとランプが点灯'
    },
    {
        id: 'slime_prism',
        attr: 'light',
        name: '💎 キングプリズムスライム 👑',
        file: 'images/spirits/slime_prism.svg',
        desc: 'おうちの汚れを吸い取って体内でピカピカの虹色宝石に変えた奇跡のスライム王。王冠を輝かせ、家中に最高の福をもたらす。',
        hint: '【スライム族】ラッキー家事や討伐クエストを重ねると降臨'
    }
];

// 図鑑保存
function recordToEncyclopedia(evolved) {
    if (!evolved || !evolved.file) return;
    try {
        const raw = localStorage.getItem('kajigon_encyclopedia');
        let list = raw ? JSON.parse(raw) : [];
        if (!Array.isArray(list)) list = [];
        if (!list.includes(evolved.file)) {
            list.push(evolved.file);
            localStorage.setItem('kajigon_encyclopedia', JSON.stringify(list));
        }
    } catch (e) {}
}

function getUnlockedFiles() {
    try {
        const raw = localStorage.getItem('kajigon_encyclopedia');
        const list = raw ? JSON.parse(raw) : [];
        return new Set(Array.isArray(list) ? list : []);
    } catch (e) {
        return new Set();
    }
}

// 歴代殿堂入りアルバム
function saveHallOfFame(evolvedDragon) {
    if (!evolvedDragon) return;
    try {
        const raw = localStorage.getItem('kajigon_hall_of_fame');
        let list = raw ? JSON.parse(raw) : [];
        if (!Array.isArray(list)) list = [];

        const entry = {
            generation: list.length + 1,
            name: kajigonState.companionName || 'カジゴン',
            spiritName: evolvedDragon.name,
            spiritFile: evolvedDragon.file,
            envTheme: kajigonState.environmentTheme || 'classic',
            date: getTodayDateString(),
            totalExp: kajigonState.totalExp || 0
        };
        list.push(entry);
        localStorage.setItem('kajigon_hall_of_fame', JSON.stringify(list));
    } catch (e) {}
}

function getHallOfFameList() {
    try {
        const raw = localStorage.getItem('kajigon_hall_of_fame');
        const list = raw ? JSON.parse(raw) : [];
        return Array.isArray(list) ? list : [];
    } catch (e) {
        return [];
    }
}

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

// 🥠 毎朝1回デイリーおみくじ
function getTodayFortuneStatus() {
    const todayStr = getTodayDateString();
    try {
        const raw = localStorage.getItem('kajigon_daily_fortune');
        const data = raw ? JSON.parse(raw) : null;
        if (data && data.date === todayStr) {
            return { drawn: true, data: data.chosen, bonusMultiplier: data.bonusMultiplier || 1.0 };
        }
    } catch (e) {}
    return { drawn: false, data: null, bonusMultiplier: 1.0 };
}

function drawDailyKarutaFortune() {
    const todayStatus = getTodayFortuneStatus();
    if (todayStatus.drawn) {
        alert('本日のおみくじはすでに引いています！明日の朝また引けますよ！');
        return;
    }

    if (typeof SoundEngine !== 'undefined') {
        SoundEngine.playSE('karuta');
    }

    const list = (typeof EXPANDED_KARUTA_LIST !== 'undefined') ? EXPANDED_KARUTA_LIST : [
        { id: 'k_rainbow_1', rank: '🌈 虹色ウルトラ大吉', text: '最高の愛と調和！全家事EXP 1.5倍！', rarity: 'ultra' },
        { id: 'k_daikichi_1', rank: '🎉 大吉', text: '家事スキル神域へ！全家事EXP 1.2倍！', rarity: 'common' }
    ];

    const chosen = list[Math.floor(Math.random() * list.length)];
    const isUltra = (chosen.rarity === 'ultra');
    const isRare = (chosen.rarity === 'rare');

    // ボーナス倍率の決定
    let multiplier = 1.0;
    if (isUltra) {
        multiplier = 1.5;
        // 古代パーツ⚙️確定ゲット！
        if (!kajigonState.materials) kajigonState.materials = { wood: 0, cloth: 0, brick: 0, gear: 0 };
        kajigonState.materials.gear = (kajigonState.materials.gear || 0) + 1;
        if (kajigonState.artifactCount < 3) kajigonState.artifactCount++;
    } else if (isRare || chosen.rank.includes('大吉')) {
        multiplier = 1.2;
    } else {
        multiplier = 1.1;
    }

    // 保存
    const todayStr = getTodayDateString();
    localStorage.setItem('kajigon_daily_fortune', JSON.stringify({
        date: todayStr,
        chosen: chosen,
        bonusMultiplier: multiplier
    }));

    if (chosen.id) {
        saveUnlockedKaruta(chosen.id);
    }
    saveToLocalStorage();

    renderKarutaTab();

    if (typeof showToast === 'function') {
        showToast(`🥠「${chosen.rank}」を引きました！（本日EXP ×${multiplier}倍！）`);
    }

    if (typeof showCompanionDialogue === 'function') {
        showCompanionDialogue(`「おみくじ『${chosen.rank}』が出たぞ！今日の家事は絶好調間違いなしだ！」`);
    }
}

// かるた帳タブ描画
function renderKarutaTab() {
    const container = document.getElementById('book-content-container');
    if (!container) return;

    const todayStatus = getTodayFortuneStatus();
    const unlockedSet = getUnlockedKarutaSet();
    const list = (typeof EXPANDED_KARUTA_LIST !== 'undefined') ? EXPANDED_KARUTA_LIST : [];

    let html = `
        <!-- 今日の運勢カード -->
        <div style="background: linear-gradient(135deg, rgba(139, 92, 246, 0.25) 0%, rgba(236, 72, 153, 0.25) 100%); border: 2px solid #8b5cf6; border-radius: 8px; padding: 0.9rem; margin-bottom: 1rem; text-align: center;">
            <div style="font-size: 13px; color: #f4ede2; font-weight: bold; margin-bottom: 0.4rem;">🥠 本日のデイリーおみくじ</div>
            ${todayStatus.drawn ? `
                <div style="font-size: 16px; font-weight: 900; color: #ffd700; margin-bottom: 0.3rem;">${todayStatus.data.rank}</div>
                <div style="font-size: 13px; color: #fff; margin-bottom: 0.4rem;">「${todayStatus.data.text}」</div>
                <div style="font-size: 12px; color: #34d399; font-weight: bold;">✨ 本日のボーナス：全家事獲得EXP ×${todayStatus.bonusMultiplier}倍発動中！</div>
            ` : `
                <button onclick="drawDailyKarutaFortune()" style="background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%); color: #fff; font-weight: 900; font-size: 14px; padding: 0.6rem 1.4rem; border: 2px solid #fff; border-radius: 20px; cursor: pointer; box-shadow: 0 4px 10px rgba(139, 92, 246, 0.5); width: 100%;">
                    🥠 今日の運勢を引く！（1日1回限定）
                </button>
            `}
        </div>

        <div style="font-size: 13px; font-weight: bold; color: var(--accent); margin-bottom: 0.5rem; text-align:center;">
            📜 集めたかるた帳（${unlockedSet.size} / ${list.length}種）
        </div>

        <div style="display:flex; flex-direction:column; gap:0.5rem; max-height:280px; overflow-y:auto;">
            ${list.map(k => {
                const isUnlocked = unlockedSet.has(k.id);
                const isUltra = (k.rarity === 'ultra');
                return `
                    <div style="background:${isUnlocked ? '#14141f' : '#0e0e14'}; border:2px ${isUnlocked ? 'solid' : 'dashed'} ${isUnlocked ? (isUltra ? '#ff007f' : 'var(--accent)') : '#444'}; border-radius:6px; padding:0.6rem 0.8rem; opacity:${isUnlocked ? 1 : 0.5};">
                        <div style="font-size:12px; font-weight:bold; color:${isUltra ? '#ff007f' : 'var(--accent)'}; margin-bottom:0.2rem;">${isUnlocked ? k.rank : '🔒 ？？？'}</div>
                        <div style="font-size:12px; color:#f4ede2;">${isUnlocked ? k.text : 'まだ引いたことがないかるたです'}</div>
                    </div>
                `;
            }).join('')}
        </div>
    `;

    container.innerHTML = html;
}

// 図鑑モーダル（精霊／かるた／殿堂／実績・称号 タブ）
let currentBookTab = 'spirits';
function switchBookTab(tab) {
    currentBookTab = tab;
    renderBookModal();
}

function renderBookModal() {
    const container = document.getElementById('book-content-container');
    if (!container) return;

    if (currentBookTab === 'spirits') {
        renderSpiritsTab();
    } else if (currentBookTab === 'karuta') {
        renderKarutaTab();
    } else if (currentBookTab === 'hall_of_fame') {
        renderHallOfFameTab();
    } else if (currentBookTab === 'achievements') {
        renderAchievementsTab();
    }
}

function renderSpiritsTab() {
    const container = document.getElementById('book-content-container');
    if (!container) return;

    const unlockedFiles = getUnlockedFiles();
    const totalCount = ALL_SPIRITS.length;
    const unlockedCount = ALL_SPIRITS.filter(s => unlockedFiles.has(s.file)).length;

    let html = `
        <div style="background: rgba(255,255,255,0.06); border: 2px solid var(--accent); padding: 0.6rem 0.8rem; border-radius: 6px; font-weight: bold; font-size: 13px; text-align: center; color: var(--accent); margin-bottom: 0.8rem;">
            守護精霊の解放率：${unlockedCount} / ${totalCount} 体 (${Math.round((unlockedCount / totalCount) * 100)}%)
        </div>
        <div class="book-grid" style="display:grid; grid-template-columns: repeat(2, 1fr); gap: 0.6rem;">
            ${ALL_SPIRITS.map(spirit => {
                const isUnlocked = unlockedFiles.has(spirit.file);
                return `
                    <div class="book-card ${isUnlocked ? 'unlocked' : 'locked'}" onclick="${isUnlocked ? `openSpiritDetailModal('${spirit.id}')` : `alert('${spirit.hint}')`}" style="cursor:pointer; background:#14141f; border:2px solid ${isUnlocked ? 'var(--accent)' : '#444'}; border-radius:8px; padding:0.6rem; text-align:center;">
                        <div style="width:70px; height:70px; margin:0 auto 0.4rem; border-radius:6px; background:#07070a; display:flex; align-items:center; justify-content:center; overflow:hidden;">
                            ${isUnlocked ? `<img src="${spirit.file}" style="max-width:100%; max-height:100%; object-fit:contain; image-rendering:pixelated;">` : `<span style="font-size:24px; color:#555;">？</span>`}
                        </div>
                        <div style="font-weight:bold; font-size:12px; color:${isUnlocked ? '#fff' : '#888'}; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                            ${isUnlocked ? spirit.name : '未確認の守護精霊'}
                        </div>
                        <div style="font-size:10px; color:${isUnlocked ? '#fbbf24' : '#666'}; margin-top:0.2rem;">
                            ${isUnlocked ? 'タップでプロフィール詳細' : spirit.hint}
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
    `;

    container.innerHTML = html;
}

function renderHallOfFameTab() {
    const container = document.getElementById('book-content-container');
    if (!container) return;

    const list = getHallOfFameList();
    const blessingBonus = (typeof getHallOfFameBlessingBonus === 'function') ? getHallOfFameBlessingBonus() : Math.min(50, list.length * 5);

    let html = `
        <!-- 🏛️ 殿堂パッシブ加護バナー -->
        <div class="hall-blessing-banner">
            <span style="font-size:24px;">✨</span>
            <div style="flex:1;">
                <div style="font-size:12px; font-weight:bold; color:#fef3c7;">【歴代殿堂の守護加護】発動中！</div>
                <div style="font-size:11px; color:#fde68a;">全家事の獲得EXPが永続で <strong style="font-size:14px; color:#ffd700;">+${blessingBonus}%</strong>（殿堂1体につき+5%、最大+50%）</div>
            </div>
        </div>

        <div style="font-size: 13px; font-weight: bold; color: var(--accent); margin-bottom: 0.8rem; text-align: center;">
            🏛️ 歴代カジゴン殿堂入りアルバム
        </div>
        ${list.length === 0 ? `
            <div style="background:#14141f; border:2px dashed #444; border-radius:8px; padding:1.5rem; text-align:center; color:#888; font-size:12px;">
                まだ巣立ったカジゴンはいません。<br>Lv.10まで育てて「そだてなおす」と、ここに殿堂入りします！
            </div>
        ` : `
            <div style="display:flex; flex-direction:column; gap:0.6rem;">
                ${list.map(item => `
                    <div style="background:#14141f; border:2px solid #ffd700; border-radius:8px; padding:0.6rem 0.8rem; display:flex; align-items:center; gap:0.8rem;">
                        <img src="${item.spiritFile}" style="width:50px; height:50px; object-fit:contain; image-rendering:pixelated; background:#07070a; border-radius:6px;">
                        <div style="flex:1;">
                            <div style="font-size:11px; color:#ffd700; font-weight:bold;">第${item.generation}世代 相棒：【${item.name}】</div>
                            <div style="font-size:13px; font-weight:bold; color:#fff;">${item.spiritName}</div>
                            <div style="font-size:10px; color:#a1a1aa;">達成日: ${item.date} | 累計EXP: ${item.totalExp}</div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `}
        <div style="margin-top: 1.2rem; text-align: center;">
            <button onclick="closeBookModal(); rebreedCompanion();" style="background: rgba(234, 88, 12, 0.2); border: 2px solid #ea580c; color: #f97316; font-size: 13px; font-weight: bold; padding: 0.6rem 1.2rem; border-radius: 8px; cursor: pointer; width: 100%;">
                🥚 新しい相棒をそだてなおす（世代交代）
            </button>
        </div>
    `;

    container.innerHTML = html;
}

// ==========================================================================
// 🏆 フェーズ7: 特別実績 ＆ 二つ名称号 タブ描画
// ==========================================================================
function renderAchievementsTab() {
    const container = document.getElementById('book-content-container');
    if (!container) return;

    const titles = (typeof TITLES_DATA !== 'undefined') ? TITLES_DATA : [];
    const achieves = (typeof ACHIEVEMENTS_DATA !== 'undefined') ? ACHIEVEMENTS_DATA : [];
    const unlockedTitles = kajigonState.unlockedTitles || [];
    const achievementsObj = kajigonState.achievements || {};

    const completedAchieveCount = achieves.filter(a => !!achievementsObj[a.id]).length;

    let html = `
        <!-- 二つ名称号セレクター -->
        <div style="background: #14141f; border: 1.5px solid #d97706; border-radius: 10px; padding: 0.8rem; margin-bottom: 1rem;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.5rem;">
                <span style="font-size:12px; font-weight:bold; color:#fde68a;">🎖️ セット中の二つ名称号</span>
                <span style="font-size:11px; color:#a1a1aa;">獲得数: ${unlockedTitles.length} / ${titles.length}</span>
            </div>
            <div style="font-size: 14px; font-weight:bold; color:#ffd700; margin-bottom:0.6rem;">
                ${kajigonState.selectedTitle && titles.find(t => t.id === kajigonState.selectedTitle)
                    ? `【${titles.find(t => t.id === kajigonState.selectedTitle).icon} ${titles.find(t => t.id === kajigonState.selectedTitle).name}】`
                    : '（未設定）'}
            </div>
            <div style="display:flex; flex-wrap:wrap; gap:0.4rem;">
                ${titles.map(t => {
                    const isUnlocked = unlockedTitles.includes(t.id);
                    const isSelected = (kajigonState.selectedTitle === t.id);
                    return `
                        <button class="title-tag-badge ${isSelected ? 'active' : ''}"
                            onclick="${isUnlocked ? `selectTitle('${t.id}')` : `alert('未獲得の称号です\\n\\n【条件】: ${t.desc}')`}"
                            style="cursor:pointer; opacity: ${isUnlocked ? 1 : 0.4}; border-style: ${isUnlocked ? 'solid' : 'dashed'};"
                            title="${t.desc}">
                            ${t.icon} ${isUnlocked ? t.name : '？？？'}
                        </button>
                    `;
                }).join('')}
            </div>
        </div>

        <!-- おうち特別実績ボード -->
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.6rem;">
            <span style="font-size:13px; font-weight:bold; color:#fbbf24;">🏆 おうち特別実績ボード</span>
            <span style="font-size:11px; color:#fde68a;">達成度: ${completedAchieveCount} / ${achieves.length}</span>
        </div>

        <div style="display:flex; flex-direction:column; gap:0.6rem; max-height:300px; overflow-y:auto;">
            ${achieves.map(a => {
                const isCompleted = !!achievementsObj[a.id];
                return `
                    <div class="achievement-card ${isCompleted ? 'completed' : ''}">
                        <div style="font-size:24px; min-width:32px; text-align:center;">${isCompleted ? a.icon : '🔒'}</div>
                        <div style="flex:1;">
                            <div style="display:flex; justify-content:space-between; align-items:center;">
                                <span style="font-size:12px; font-weight:bold; color:${isCompleted ? '#ffd700' : '#cbd5e1'};">${a.name}</span>
                                ${isCompleted ? '<span style="font-size:10px; color:#34d399; font-weight:bold;">✔ 達成済</span>' : ''}
                            </div>
                            <div style="font-size:11px; color:#94a3b8; margin-top:2px;">${a.desc}</div>
                            <div style="font-size:10px; color:#f59e0b; margin-top:2px;">報酬: ${a.reward}</div>
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
    `;

    container.innerHTML = html;
}

function selectTitle(titleId) {
    if (typeof SoundEngine !== 'undefined') SoundEngine.playSE('click');
    kajigonState.selectedTitle = titleId;
    saveToLocalStorage();
    if (typeof updateCompanionWidget === 'function') updateCompanionWidget();
    renderAchievementsTab();
    const tObj = (typeof TITLES_DATA !== 'undefined') ? TITLES_DATA.find(t => t.id === titleId) : null;
    if (tObj && typeof showToast === 'function') {
        showToast(`🎖️ 二つ名称号を【${tObj.name}】に設定しました！`);
    }
}

function openSpiritDetailModal(spiritId) {
    if (typeof SoundEngine !== 'undefined') SoundEngine.playSE('click');
    const spirit = ALL_SPIRITS.find(s => s.id === spiritId);
    if (!spirit) return;

    const profile = (typeof SPIRIT_PROFILES !== 'undefined' && SPIRIT_PROFILES[spiritId]) ? SPIRIT_PROFILES[spiritId] : {
        food: 'あたたかい手料理',
        chore: 'きれいなお部屋の掃除',
        lore: spirit.desc,
        message: '「いつも家族のためにおうちをピカピカにしてくれてありがとう！」'
    };

    const modal = document.getElementById('spirit-detail-modal');
    const body = document.getElementById('spirit-detail-content') || document.getElementById('spirit-detail-body');
    if (!modal || !body) return;

    body.innerHTML = `
        <div style="text-align:center; margin-bottom:1rem;">
            <div style="width:100px; height:100px; margin:0 auto 0.5rem; background:#07070a; border:2px solid var(--accent); border-radius:8px; display:flex; align-items:center; justify-content:center;">
                <img src="${spirit.file}" style="max-width:90%; max-height:90%; object-fit:contain; image-rendering:pixelated;">
            </div>
            <h2 style="font-size:16px; color:#fff; font-weight:bold; margin-bottom:0.3rem;">${spirit.name}</h2>
            <div style="font-size:12px; color:var(--accent);">${spirit.hint}</div>
        </div>
        <div style="display:flex; flex-direction:column; gap:0.6rem; font-size:12px;">
            <div style="background:#14141f; border-left:4px solid #ef4444; padding:0.5rem 0.75rem; border-radius:4px;">
                <span style="color:#f87171; font-weight:bold;">🍽️ 大好物：</span><span style="color:#f4ede2;">${profile.food}</span>
            </div>
            <div style="background:#14141f; border-left:4px solid #3b82f6; padding:0.5rem 0.75rem; border-radius:4px;">
                <span style="color:#60a5fa; font-weight:bold;">🧹 得意な家事：</span><span style="color:#f4ede2;">${profile.chore}</span>
            </div>
            <div style="background:#14141f; border-left:4px solid #10b981; padding:0.5rem 0.75rem; border-radius:4px;">
                <div style="color:#34d399; font-weight:bold; margin-bottom:0.2rem;">📜 エピソード・裏設定：</div>
                <div style="color:#e2e8f0; line-height:1.5;">${profile.lore}</div>
            </div>
            <div style="background:#1e1b4b; border:1.5px solid #818cf8; padding:0.6rem 0.75rem; border-radius:6px;">
                <div style="color:#a5b4fc; font-weight:bold; margin-bottom:0.2rem;">💌 住まい手への感謝メッセージ：</div>
                <div style="color:#fff; font-style:italic; line-height:1.4;">${profile.message}</div>
            </div>
        </div>
    `;

    modal.classList.remove('hidden');
}

function closeSpiritDetailModal() {
    if (typeof SoundEngine !== 'undefined') SoundEngine.playSE('click');
    const modal = document.getElementById('spirit-detail-modal');
    if (modal) modal.classList.add('hidden');
}
