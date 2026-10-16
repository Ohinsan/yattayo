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

// 季節限定の行商人家具（レア素材「古代のネジ」交換対応）
const SEASONAL_MERCHANT_FURNITURE = {
    spring: { id: 'sakura', name: '桜の盆栽', icon: '🌸', cost: { gear: 1, wood: 2, cloth: 1 }, buffLabel: '⚔️ボス討伐EXP +30% ＆ 全家事+10%', buffAttr: ['all'], multiplier: 1.10, desc: '春爛漫！部屋の中でお花見気分が味わえる特別盆栽' },
    summer: { id: 'furin', name: '涼やかな風鈴', icon: '🎐', cost: { gear: 1, wood: 2 }, buffLabel: '⚔️ボス討伐EXP +30% ＆ 全家事+10%', buffAttr: ['all'], multiplier: 1.10, desc: '心地よい涼風とチリン♪という音色を呼ぶ夏の風物詩' },
    autumn: { id: 'pumpkin', name: 'カボチャランタン', icon: '🎃', cost: { gear: 1, brick: 2, wood: 1 }, buffLabel: '⚔️ボス討伐EXP +30% ＆ 全家事+10%', buffAttr: ['all'], multiplier: 1.10, desc: '秋の夜長をほっこり彩るあたたかな魔法の灯り' },
    winter: { id: 'kotatsu', name: 'ぬくぬくこたつ', icon: '🍊', cost: { gear: 1, wood: 2, cloth: 2 }, buffLabel: '⚔️ボス討伐EXP +30% ＆ 全家事+10%', buffAttr: ['all'], multiplier: 1.10, desc: 'みかん付き！一度入ると出られなくなる冬の天国' }
};

// 日替わりピックアップ＆行商人用の追加家具・アニメーション家具カタログ
const EXTRA_SHOP_FURNITURE = [
    {
        id: 'tea_table',
        name: 'カフェ風ティーテーブル',
        icon: '☕',
        materials: { wood: 3, cloth: 2 },
        desc: 'ほっと一息つけるおしゃれな木製カフェテーブル',
        buffLabel: '💧水・🔥火家事 EXP +15%',
        buffAttr: ['water', 'fire'],
        multiplier: 1.15,
        animated: false,
        tapAction: () => `「いい香りのお茶とおやつで、家事の合間にカフェタイムだぞ〜☕」`
    },
    {
        id: 'aroma_candle',
        name: '癒やしのアロマキャンドル',
        icon: '🕯️',
        materials: { brick: 2, cloth: 2 },
        desc: '優しい香りと揺れる炎で疲れを癒やすキャンドル',
        buffLabel: '🍃風・🪵土家事 EXP +15%',
        buffAttr: ['wind', 'earth'],
        multiplier: 1.15,
        animated: false,
        tapAction: () => `「ふわ〜っ…いい香りだな〜！心がぽかぽか落ち着くぞ🕯️」`
    },
    {
        id: 'planetarium',
        name: '星屑のプラネタリウム',
        icon: '🔮',
        materials: { gear: 2, brick: 2 },
        desc: '【アニメ付き】お部屋に満天の星空を映し出す魔導投影機',
        buffLabel: '✨全家事EXP +20%（星空キラキラアニメ）',
        buffAttr: ['all'],
        multiplier: 1.20,
        animated: true,
        animType: 'stars',
        tapAction: () => `「わあぁ…！お部屋の天井がキラキラの天の川になったぞ〜🔮✨」`
    },
    {
        id: 'fountain',
        name: '妖精のミニ噴水',
        icon: '⛲',
        materials: { gear: 2, wood: 2 },
        desc: '【アニメ付き】澄んだ水しぶきが絶えず湧き出る癒やしの噴水',
        buffLabel: '💧水・🍃風EXP +25%（水しぶきアニメ）',
        buffAttr: ['water', 'wind'],
        multiplier: 1.25,
        animated: true,
        animType: 'water',
        tapAction: () => `「ちょろちょろ…♪ 水の音が涼しくてマイナスイオンたっぷりだぞ⛲💧」`
    }
];

// 週末行商人のスペシャルオファー枠リスト生成
function getWeekendMerchantOffers() {
    const currentSeason = getCurrentSeasonKey();
    const seasonalFurn = SEASONAL_MERCHANT_FURNITURE[currentSeason];
    return [
        {
            offerId: `merchant_season_${seasonalFurn.id}`,
            type: 'furniture',
            furnId: seasonalFurn.id,
            name: `【季節限定】${seasonalFurn.name}`,
            icon: seasonalFurn.icon,
            badge: '季節の特別家具',
            cost: seasonalFurn.cost,
            buffLabel: seasonalFurn.buffLabel,
            desc: seasonalFurn.desc
        },
        {
            offerId: 'merchant_anim_planetarium',
            type: 'furniture',
            furnId: 'planetarium',
            name: '【アニメ家具】星屑のプラネタリウム',
            icon: '🔮',
            badge: '✨星空アニメ付き',
            cost: { gear: 2, brick: 2 },
            buffLabel: '✨全家事EXP +20%',
            desc: '古代のネジで動く魔導投影機。お部屋にきらめく星々が舞います！'
        },
        {
            offerId: 'merchant_anim_fountain',
            type: 'furniture',
            furnId: 'fountain',
            name: '【アニメ家具】妖精のミニ噴水',
            icon: '⛲',
            badge: '💧水しぶきアニメ付き',
            cost: { gear: 2, wood: 2 },
            buffLabel: '💧水・🍃風家事EXP +25%',
            desc: '心地よい水しぶきが絶えず弾ける精霊ゆかりのミニ噴水！'
        },
        {
            offerId: 'merchant_snack_new3',
            type: 'snack_bundle',
            snacks: { star_milk: 1, tsukimi_dango: 1, rainbow_berry: 1 },
            name: '【レアおやつ】新系統おやつ3種福袋',
            icon: '🎁',
            badge: '新系統進化＆大好物セット',
            cost: { gear: 1, wood: 1 },
            buffLabel: '🥛ミルク・🍡だんご・🍓ベリー 各1個',
            desc: 'もふもふ幻獣・和風座敷わらし・スイーツ精霊の大好物おやつ3種セット！'
        },
        {
            offerId: 'merchant_snack_all6',
            type: 'snack_bundle',
            snacks: { dragon_meat: 1, ancient_gear_snack: 1, fairy_honey: 1, star_milk: 1, tsukimi_dango: 1, rainbow_berry: 1 },
            name: '【豪華】全6系統おやつコンプリート箱',
            icon: '👑',
            badge: '全6種おやつ詰合せ',
            cost: { gear: 2, cloth: 1 },
            buffLabel: '全6系統のおやつ 各1個（計6個）',
            desc: 'どんなカジゴンの大好物にもすぐ応えられる贅沢おやつボックス！'
        }
    ];
}

// 現在のショップタブ状態 ('daily' | 'merchant') ＆ 平日プレビューフラグ
let currentWorkshopTab = 'daily';
let forceMerchantPreview = false;

/**
 * 日付文字列（YYYY-MM-DD）をシード値にした決定論的ランダム生成器（夫婦端末シンクロ用）
 */
function createDateSeededRandom(dateStr) {
    let h = 2166136261 >>> 0;
    const str = String(dateStr || '2026-01-01');
    for (let i = 0; i < str.length; i++) {
        h ^= str.charCodeAt(i);
        h = Math.imul(h, 16777619);
    }
    return function () {
        h += 0x6D2B79F5;
        let t = Math.imul(h ^ (h >>> 15), 1 | h);
        t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

/**
 * 今日の日付（YYYY-MM-DD）シードから決定論的に「本日のピックアップ3枠」を生成
 */
function getDailyShopPickups(dateStr) {
    const seedDate = dateStr || (typeof getTodayDateString === 'function' ? getTodayDateString() : new Date().toISOString().slice(0, 10));
    const rng = createDateSeededRandom(seedDate);

    // 枠1: 新系統おやつ3種から1つ（2個セット）
    const newSnacksPool = [
        {
            pickupId: 'daily_snack_fluffy',
            type: 'snack',
            snackId: 'star_milk',
            count: 2,
            name: '星降るホットミルク ×2個',
            icon: '🥛',
            categoryLabel: '🐾 おやつ（もふもふ幻獣系統）',
            desc: 'もふもふ幻獣系統への進化＆大好物バフ（+40 EXP & 次回1.5倍）用おやつ！',
            cost: { wood: 2 }
        },
        {
            pickupId: 'daily_snack_wafuu',
            type: 'snack',
            snackId: 'tsukimi_dango',
            count: 2,
            name: '三色月見だんご ×2個',
            icon: '🍡',
            categoryLabel: '🍵 おやつ（和風・座敷わらし系統）',
            desc: '和風・座敷わらし系統への進化＆大好物バフ（+40 EXP & 次回1.5倍）用おやつ！',
            cost: { cloth: 2 }
        },
        {
            pickupId: 'daily_snack_sweets',
            type: 'snack',
            snackId: 'rainbow_berry',
            count: 2,
            name: '虹色シュガーベリー ×2個',
            icon: '🍓',
            categoryLabel: '🍰 おやつ（スイーツ精霊系統）',
            desc: 'スイーツ精霊系統への進化＆大好物バフ（+40 EXP & 次回1.5倍）用おやつ！',
            cost: { brick: 2 }
        }
    ];

    // 枠2: 定番系統おやつ3種＋新系統残りから1つ（2個セット）
    const classicSnacksPool = [
        {
            pickupId: 'daily_snack_dragon',
            type: 'snack',
            snackId: 'dragon_meat',
            count: 2,
            name: 'ドラゴン肉 ×2個',
            icon: '🍖',
            categoryLabel: '🐉 おやつ（王道ドラゴン系統）',
            desc: '王道ドラゴン系統への進化＆大好物バフ（+40 EXP & 次回1.5倍）用おやつ！',
            cost: { brick: 2 }
        },
        {
            pickupId: 'daily_snack_golem',
            type: 'snack',
            snackId: 'ancient_gear_snack',
            count: 2,
            name: '古代のネジおやつ ×2個',
            icon: '⚙️',
            categoryLabel: '🤖 おやつ（機械魔ゴーレム系統）',
            desc: '機械魔ゴーレム系統への進化＆大好物バフ（+40 EXP & 次回1.5倍）用おやつ！',
            cost: { wood: 1, brick: 1 }
        },
        {
            pickupId: 'daily_snack_fairy',
            type: 'snack',
            snackId: 'fairy_honey',
            count: 2,
            name: '妖精のハチミツ ×2個',
            icon: '🍯',
            categoryLabel: '🧚 おやつ（妖精・レリック系統）',
            desc: '妖精・レリック系統への進化＆大好物バフ（+40 EXP & 次回1.5倍）用おやつ！',
            cost: { cloth: 2 }
        }
    ];

    // 枠3: 新家具または部屋テーマ模様替えチケットから1つ
    const specialDecorPool = [
        {
            pickupId: 'daily_furn_tea_table',
            type: 'furniture',
            furnId: 'tea_table',
            name: '新家具：カフェ風ティーテーブル',
            icon: '☕',
            categoryLabel: '🪑 ピックアップ新家具',
            desc: '💧水・🔥火家事 EXP +15%！お部屋でおしゃれなカフェタイムを楽しめます',
            cost: { wood: 3, cloth: 1 }
        },
        {
            pickupId: 'daily_furn_aroma_candle',
            type: 'furniture',
            furnId: 'aroma_candle',
            name: '新家具：癒やしのアロマキャンドル',
            icon: '🕯️',
            categoryLabel: '🕯️ ピックアップ新家具',
            desc: '🍃風・🪵土家事 EXP +15%！優しい香りと灯りでお部屋を彩ります',
            cost: { brick: 2, cloth: 2 }
        },
        {
            pickupId: 'daily_theme_sky',
            type: 'theme',
            themeId: 'sky',
            name: '部屋テーマ：天空の樹海リフォーム',
            icon: '🍃',
            categoryLabel: '🎨 日替わり部屋テーマ（+30 EXP付）',
            desc: 'お部屋の環境テーマを「天空の樹海」へ模様替え＆ボーナス+30 EXP獲得！',
            cost: { wood: 2 }
        },
        {
            pickupId: 'daily_theme_abyss',
            type: 'theme',
            themeId: 'abyss',
            name: '部屋テーマ：深海の神殿リフォーム',
            icon: '🌊',
            categoryLabel: '🎨 日替わり部屋テーマ（+30 EXP付）',
            desc: 'お部屋の環境テーマを「深海の神殿」へ模様替え＆ボーナス+30 EXP獲得！',
            cost: { brick: 2 }
        },
        {
            pickupId: 'daily_theme_volcano',
            type: 'theme',
            themeId: 'volcano',
            name: '部屋テーマ：灼熱の火山リフォーム',
            icon: '🌋',
            categoryLabel: '🎨 日替わり部屋テーマ（+30 EXP付）',
            desc: 'お部屋の環境テーマを「灼熱の火山」へ模様替え＆ボーナス+30 EXP獲得！',
            cost: { brick: 1, wood: 1 }
        },
        {
            pickupId: 'daily_theme_classic',
            type: 'theme',
            themeId: 'classic',
            name: '部屋テーマ：星降る神殿リフォーム',
            icon: '📜',
            categoryLabel: '🎨 日替わり部屋テーマ（+30 EXP付）',
            desc: 'お部屋の環境テーマを「星降る神殿」へ模様替え＆ボーナス+30 EXP獲得！',
            cost: { cloth: 1, wood: 1 }
        }
    ];

    const slot1 = newSnacksPool[Math.floor(rng() * newSnacksPool.length)];
    const slot2 = classicSnacksPool[Math.floor(rng() * classicSnacksPool.length)];
    const slot3 = specialDecorPool[Math.floor(rng() * specialDecorPool.length)];

    return [slot1, slot2, slot3];
}

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
 * 家事完了時の素材＆おやつドロップ判定
 */
function dropChoreMaterials(choreName, stats) {
    if (!kajigonState.materials) {
        kajigonState.materials = { wood: 0, cloth: 0, brick: 0, gear: 0 };
    }
    if (!kajigonState.snackInventory) {
        kajigonState.snackInventory = {};
    }

    const dropped = [];
    const attr = stats ? stats.attr : 'earth';
    const isSetPack = stats && stats.isSetPack;

    // 家事内容に応じて基本素材が確定1〜2個ドロップ（セット家事パックは確定2個）
    if (choreName.includes('掃除機') || choreName.includes('掃き掃除') || attr === 'wind') {
        const count = isSetPack ? 2 : (Math.random() < 0.3 ? 2 : 1);
        kajigonState.materials.wood += count;
        dropped.push({ name: '木材 🪵', count });
    } else if (choreName.includes('洗濯') || choreName.includes('干す') || choreName.includes('畳む') || choreName.includes('タオル') || choreName.includes('ランドリー')) {
        const count = isSetPack ? 2 : (Math.random() < 0.3 ? 2 : 1);
        kajigonState.materials.cloth += count;
        dropped.push({ name: '布 🧶', count });
    } else if (choreName.includes('料理') || choreName.includes('シンク') || choreName.includes('風呂') || choreName.includes('食器') || choreName.includes('キッチン') || attr === 'fire' || attr === 'water') {
        const count = isSetPack ? 2 : (Math.random() < 0.3 ? 2 : 1);
        kajigonState.materials.brick += count;
        dropped.push({ name: 'レンガ 🧱', count });
    } else {
        const count = isSetPack ? 2 : 1;
        kajigonState.materials.wood += count;
        dropped.push({ name: '木材 🪵', count });
    }

    // 👑 「今日はめちゃくちゃ働いた！」はレア素材「古代のネジ ⚙️」1個確定ドロップ
    const isGuaranteedGear = (stats && stats.guaranteedGear) || choreName.includes('今日はめちゃくちゃ働いた') || choreName.startsWith('[物品補充]');
    if (isGuaranteedGear || Math.random() < 0.15) {
        kajigonState.materials.gear = (kajigonState.materials.gear || 0) + 1;
        if (kajigonState.artifactCount < 3) {
            kajigonState.artifactCount++;
        }
        dropped.push({ name: '古代のネジ ⚙️', count: 1 });
    }

    // 🍖 Phase 3 Task 1: 家事完了時におやつもドロップ（セット家事・大ボタンは確定、通常家事は35%確率）
    if (typeof SNACK_ITEMS !== 'undefined' && SNACK_ITEMS.length > 0) {
        const shouldDropSnack = isSetPack || isGuaranteedGear || Math.random() < 0.35;
        if (shouldDropSnack) {
            const pickedSnack = SNACK_ITEMS[Math.floor(Math.random() * SNACK_ITEMS.length)];
            if (pickedSnack) {
                kajigonState.snackInventory[pickedSnack.id] = (Number(kajigonState.snackInventory[pickedSnack.id]) || 0) + 1;
                dropped.push({ name: `${pickedSnack.name} ${pickedSnack.icon}`, count: 1 });
                if (typeof updateSnackBadge === 'function') {
                    setTimeout(updateSnackBadge, 50);
                }
            }
        }
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

    const allFurnList = [
        ...CRAFTABLE_FURNITURE,
        ...EXTRA_SHOP_FURNITURE,
        ...Object.values(SEASONAL_MERCHANT_FURNITURE)
    ];

    kajigonState.unlockedFurniture.forEach(furnId => {
        const furn = allFurnList.find(f => f.id === furnId);
        if (!furn) return;

        // 夜間ボーナス
        if (furn.buffNightOnly && isNight) {
            multiplier *= furn.multiplier;
        }
        // 属性ボーナス
        else if (furn.buffAttr && furn.multiplier) {
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
 * お部屋内の家具スロット描画（ドット絵アセット＆追加・アニメーション家具連携）
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
        plantEl.onclick = (e) => { if (e && e.stopPropagation) e.stopPropagation(); onFurnitureItemClick('plant'); };
    }
    if (stewEl) {
        stewEl.style.display = unlocked.has('stew') ? 'block' : 'none';
        stewEl.onclick = (e) => { if (e && e.stopPropagation) e.stopPropagation(); onFurnitureItemClick('stew'); };
    }
    if (rugEl) {
        rugEl.style.display = unlocked.has('rug') ? 'block' : 'none';
        rugEl.style.pointerEvents = 'none';
    }
    if (shelfEl) {
        // 模型・本棚の優先表示
        if (unlocked.has('castle')) {
            shelfEl.src = 'images/furniture/castle.png';
            shelfEl.alt = 'カジゴン神殿の模型';
            shelfEl.title = 'カジゴン神殿の模型';
            shelfEl.style.display = 'block';
            shelfEl.onclick = (e) => { if (e && e.stopPropagation) e.stopPropagation(); onFurnitureItemClick('castle'); };
        } else if (unlocked.has('bookshelf')) {
            shelfEl.src = 'images/furniture/bookshelf.png';
            shelfEl.alt = '暮らしの魔導書棚';
            shelfEl.title = '暮らしの魔導書棚';
            shelfEl.style.display = 'block';
            shelfEl.onclick = (e) => { if (e && e.stopPropagation) e.stopPropagation(); onFurnitureItemClick('bookshelf'); };
        } else {
            shelfEl.style.display = 'none';
        }
    }
    if (lampEl) {
        lampEl.onclick = (e) => { if (e && e.stopPropagation) e.stopPropagation(); onFurnitureItemClick('lamp'); };
    }

    // ランプの明暗状態をお部屋に反映
    const room = document.getElementById('tamagotchi-room-container');
    if (room) {
        if (kajigonState.lampOff) {
            room.classList.add('lamp-off');
        } else {
            room.classList.remove('lamp-off');
        }
    }

    // 🌟 Phase 3: 日替わり新家具・季節家具・アニメーション付き家具のお部屋表示レイヤー
    const roomInner = document.getElementById('tamagotchi-room');
    if (roomInner) {
        let specialLayer = document.getElementById('room-special-decor-layer');
        if (!specialLayer) {
            specialLayer = document.createElement('div');
            specialLayer.id = 'room-special-decor-layer';
            specialLayer.className = 'room-special-decor-layer';
            roomInner.appendChild(specialLayer);
        }

        const specialCandidates = [
            ...EXTRA_SHOP_FURNITURE,
            ...Object.values(SEASONAL_MERCHANT_FURNITURE)
        ];
        const unlockedSpecials = specialCandidates.filter(item => unlocked.has(item.id));

        if (unlockedSpecials.length === 0) {
            specialLayer.innerHTML = '';
        } else {
            specialLayer.innerHTML = unlockedSpecials.map(item => {
                const animBadge = item.animated
                    ? (item.animType === 'stars'
                        ? `<span class="decor-anim-fx stars-fx">✦✨✦</span>`
                        : `<span class="decor-anim-fx water-fx">💧🫧💧</span>`)
                    : '';
                return `
                    <div class="special-decor-item ${item.animated ? 'is-animated-decor' : ''}"
                         title="${item.name}（タップでリアクション）"
                         onclick="event.stopPropagation(); onFurnitureItemClick('${item.id}')">
                        ${animBadge}
                        <span class="special-decor-icon">${item.icon}</span>
                    </div>
                `;
            }).join('');
        }
    }
}

/**
 * 🍲 湯気パーティクル生成ヘルパー
 */
function createSteamParticles(targetEl) {
    if (!targetEl) return;
    const rect = targetEl.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 3;

    for (let i = 0; i < 4; i++) {
        setTimeout(() => {
            const steam = document.createElement('div');
            steam.className = 'steam-particle';
            steam.textContent = '♨️';
            steam.style.left = `${x + (Math.random() * 20 - 10)}px`;
            steam.style.top = `${y}px`;
            steam.style.setProperty('--dx', `${(Math.random() - 0.5) * 35}px`);
            document.body.appendChild(steam);

            setTimeout(() => {
                if (steam.parentNode) steam.parentNode.removeChild(steam);
            }, 1400);
        }, i * 180);
    }
}

/**
 * 🪴 水やりマーク＆ハート舞い上がりヘルパー
 */
function createWateringEffect(targetEl) {
    if (!targetEl) return;
    const rect = targetEl.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 3;

    // 💧 水滴エフェクト
    const drop = document.createElement('div');
    drop.className = 'water-drop-effect';
    drop.textContent = '💧';
    drop.style.left = `${x}px`;
    drop.style.top = `${y}px`;
    document.body.appendChild(drop);

    setTimeout(() => {
        if (drop.parentNode) drop.parentNode.removeChild(drop);
    }, 850);

    // 小さなハート＆きらめきが舞う
    setTimeout(() => {
        if (typeof createFloatingHearts === 'function') {
            createFloatingHearts(targetEl);
        }
    }, 350);
}

/**
 * 家具をタップした際のアクション
 */
function onFurnitureItemClick(furnId) {
    const dragonName = kajigonState.companionName || 'カジゴン';

    // 1. 💡 ランプの明暗切り替え（部屋全体の暗さをトグル）
    if (furnId === 'lamp') {
        if (typeof SoundEngine !== 'undefined') SoundEngine.playSE('click');
        const room = document.getElementById('tamagotchi-room-container');
        kajigonState.lampOff = !kajigonState.lampOff;
        if (room) {
            room.classList.toggle('lamp-off', kajigonState.lampOff);
        }
        saveToLocalStorage();

        const speech = kajigonState.lampOff
            ? `「カチッ！お部屋を暗くして、のんびりチルタイムだな〜🌙」`
            : `「パチッ！あたたかい光がついたぞ！お部屋が明るくてポカポカだぞ〜💡」`;
        if (typeof showCompanionDialogue === 'function') {
            showCompanionDialogue(speech);
        }
        return;
    }

    // 2. 🍲 シチュー鍋のタップ（湯気パーティクル＆美味しそうだぞ！）
    if (furnId === 'stew') {
        if (typeof SoundEngine !== 'undefined') SoundEngine.playSE('click');
        const stewEl = document.getElementById('furniture-stew');
        if (stewEl) {
            stewEl.classList.remove('pot-bounce');
            void stewEl.offsetWidth;
            stewEl.classList.add('pot-bounce');
            createSteamParticles(stewEl);
        }
        if (typeof showCompanionDialogue === 'function') {
            showCompanionDialogue(`「美味しそうだぞ！野菜とお肉がとろとろに煮込んであるぞ〜！じゅるり…🤤」`);
        }
        return;
    }

    // 3. 🪴 観葉植物のタップ（水やりマーク💧＆ハート舞い上がり）
    if (furnId === 'plant') {
        if (typeof SoundEngine !== 'undefined') SoundEngine.playSE('karuta');
        const plantEl = document.getElementById('furniture-plant');
        if (plantEl) {
            plantEl.classList.remove('plant-bounce');
            void plantEl.offsetWidth;
            plantEl.classList.add('plant-bounce');
            createWateringEffect(plantEl);
        }
        if (typeof showCompanionDialogue === 'function') {
            showCompanionDialogue(`「お水やりありがとう！葉っぱがツヤツヤ生き生きしてるぞ〜！🌱」`);
        }
        return;
    }

    // 4. その他の家具（絨毯・本棚・模型・追加家具・季節家具）
    if (typeof SoundEngine !== 'undefined') SoundEngine.playSE('click');
    const allFurn = [
        ...CRAFTABLE_FURNITURE,
        ...EXTRA_SHOP_FURNITURE,
        ...Object.values(SEASONAL_MERCHANT_FURNITURE)
    ];
    const furn = allFurn.find(f => f.id === furnId);

    if (furnId === 'rug') {
        const rugEl = document.getElementById('furniture-rug');
        if (typeof createFloatingHearts === 'function') createFloatingHearts(rugEl);
    }

    if (furn && furn.tapAction) {
        const speech = furn.tapAction(dragonName);
        if (typeof showCompanionDialogue === 'function') {
            showCompanionDialogue(speech);
        }
    } else if (furn) {
        if (typeof showCompanionDialogue === 'function') {
            showCompanionDialogue(`「『${furn.name}（${furn.icon}）』素敵だろ〜！${furn.desc}なんだぞ！」`);
        }
    } else {
        if (typeof showCompanionDialogue === 'function') {
            showCompanionDialogue(`「お気に入りの家具だぞ！おうちが快適になって嬉しいな〜！」`);
        }
    }
}

/**
 * ショップタブ切り替え ('daily' | 'merchant')
 */
function switchWorkshopTab(tab) {
    if (typeof SoundEngine !== 'undefined') SoundEngine.playSE('click');
    currentWorkshopTab = tab === 'merchant' ? 'merchant' : 'daily';
    renderCraftWorkshopModal();
}

/**
 * 平日でも行商人を特別に呼び出すトグル
 */
function toggleForceMerchantPreview() {
    if (typeof SoundEngine !== 'undefined') SoundEngine.playSE('karuta');
    forceMerchantPreview = !forceMerchantPreview;
    renderCraftWorkshopModal();
}

/**
 * 素材コスト文字列の整形ヘルパー
 */
function formatMaterialCostText(costObj) {
    const iconMap = { wood: '🪵木材', cloth: '🧶布', brick: '🧱レンガ', gear: '⚙️ネジ' };
    return Object.entries(costObj || {})
        .map(([m, req]) => `${iconMap[m] || m}×${req}`)
        .join(' ＋ ');
}

/**
 * 2階建て工房＆行商人モーダルのレンダリング（Phase 3 Task 3）
 */
function renderCraftWorkshopModal() {
    const container = document.getElementById('workshop-content-container');
    if (!container) return;

    const materials = kajigonState.materials || { wood: 0, cloth: 0, brick: 0, gear: 0 };
    const unlocked = new Set(kajigonState.unlockedFurniture || []);
    const todayStr = (typeof getTodayDateString === 'function') ? getTodayDateString() : new Date().toISOString().slice(0, 10);
    const dailyPickups = getDailyShopPickups(todayStr);
    const purchasedTodayMap = (kajigonState.dailyShopPurchased && kajigonState.dailyShopPurchased[todayStr]) || {};
    const merchantOpen = isMerchantOpen() || forceMerchantPreview;
    const merchantOffers = getWeekendMerchantOffers();

    // 所持おやつ合計
    const snackInv = kajigonState.snackInventory || {};
    const totalSnacks = Object.values(snackInv).reduce((s, v) => s + (Number(v) || 0), 0);

    // タブ1：🔨 常設：気まぐれおうち工房（日替わりピックアップ3枠 ＋ 定番DIY家具クラフト）
    const dailyTabHtml = `
        <!-- 🌟 本日の日替わりピックアップ（3枠・日付シード同期） -->
        <div class="daily-pickup-section">
            <div class="daily-pickup-header">
                <div>
                    <span style="font-size:13px; font-weight:bold; color:#fde047;">✨ 本日の日替わりピックアップ（3枠）</span>
                    <div style="font-size:10px; color:#94a3b8;">📅 シード値: <code>${todayStr}</code>（夫婦の端末で同じ3商品が並びます）</div>
                </div>
                <span class="daily-sync-pill">🔄 端末間シンクロ対応</span>
            </div>
            <div class="daily-pickup-list">
                ${dailyPickups.map((item, idx) => {
                    const isAlreadyUnlockedFurn = item.type === 'furniture' && unlocked.has(item.furnId);
                    const isAlreadyTheme = item.type === 'theme' && kajigonState.environmentTheme === item.themeId;
                    const isBoughtToday = Boolean(purchasedTodayMap[item.pickupId]);
                    const isSoldOut = isAlreadyUnlockedFurn || isAlreadyTheme || isBoughtToday;
                    const canAfford = !isSoldOut && Object.entries(item.cost).every(([m, req]) => (materials[m] || 0) >= req);
                    const costText = formatMaterialCostText(item.cost);

                    let statusLabel = '交換する';
                    if (isAlreadyUnlockedFurn) statusLabel = '所持済み';
                    else if (isAlreadyTheme) statusLabel = '適用中テーマ';
                    else if (isBoughtToday) statusLabel = '本日交換済';

                    return `
                        <div class="shop-pickup-card ${isSoldOut ? 'is-sold-out' : (canAfford ? 'can-afford' : '')}">
                            <div class="shop-pickup-left">
                                <div class="shop-pickup-icon">${item.icon}</div>
                                <div class="shop-pickup-info">
                                    <div class="shop-pickup-cat">${item.categoryLabel}</div>
                                    <div class="shop-pickup-title">${item.name}</div>
                                    <div class="shop-pickup-desc">${item.desc}</div>
                                    <div class="shop-pickup-cost">必要素材: ${costText}</div>
                                </div>
                            </div>
                            <button type="button" class="shop-buy-btn ${isSoldOut ? 'sold' : (canAfford ? 'ready' : 'locked')}"
                                onclick="buyDailyPickupItem(${idx})"
                                ${(isSoldOut || !canAfford) ? 'disabled' : ''}>
                                ${statusLabel}
                            </button>
                        </div>
                    `;
                }).join('')}
            </div>
        </div>

        <!-- 🔨 定番：おうちDIY家具クラフト -->
        <h3 style="font-size:13px; color:var(--accent); margin:1rem 0 0.5rem 0; display:flex; align-items:center; justify-content:space-between;">
            <span>🔨 定番：おうちDIY家具クラフト</span>
            <span style="font-size:10px; color:#94a3b8; font-weight:normal;">配置すると常時EXPバフ発動</span>
        </h3>
        <div class="craft-grid" style="display:flex; flex-direction:column; gap:0.55rem;">
            ${CRAFTABLE_FURNITURE.map(furn => {
                const isCrafted = unlocked.has(furn.id);
                const canCraft = !isCrafted && Object.entries(furn.materials).every(([m, req]) => (materials[m] || 0) >= req);
                const reqText = formatMaterialCostText(furn.materials);

                return `
                    <div class="craft-card" style="background:${isCrafted ? '#0e1812' : '#1c1b26'}; border:2px solid ${isCrafted ? '#10b981' : (canCraft ? '#ffd700' : '#334155')}; border-radius:8px; padding:0.55rem 0.75rem; display:flex; align-items:center; justify-content:space-between; gap:0.5rem;">
                        <div style="display:flex; align-items:center; gap:0.6rem;">
                            ${furn.image ? `
                                <img src="${furn.image}" alt="${furn.name}" style="width:36px; height:36px; object-fit:contain; image-rendering:pixelated; filter:drop-shadow(0 2px 4px rgba(0,0,0,0.5));">
                            ` : `
                                <span style="font-size:26px;">${furn.icon}</span>
                            `}
                            <div>
                                <div style="font-weight:bold; font-size:13px; color:#fff;">${furn.name}</div>
                                <div style="font-size:11px; color:#34d399;">${furn.buffLabel}</div>
                                <div style="font-size:10px; color:#fbbf24;">必要素材: ${reqText}</div>
                            </div>
                        </div>
                        <div>
                            ${isCrafted ? `
                                <span style="font-size:11px; color:#34d399; font-weight:bold; padding:0.3rem 0.55rem; background:#064e3b; border-radius:4px; white-space:nowrap;">作成済み</span>
                            ` : `
                                <button type="button" onclick="craftFurniture('${furn.id}')" ${!canCraft ? 'disabled' : ''} style="padding:0.4rem 0.75rem; border-radius:6px; font-weight:bold; font-size:12px; cursor:${canCraft ? 'pointer' : 'not-allowed'}; background:${canCraft ? '#ffd700' : '#334155'}; color:${canCraft ? '#000' : '#94a3b8'}; border:none; white-space:nowrap;">作る！</button>
                            `}
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
    `;

    // タブ2：🐪 週末：さすらいの行商人（金曜18:00〜日曜24:00オープン・古代のネジ特別交換）
    const merchantTabHtml = `
        <div class="merchant-special-section">
            <div class="merchant-status-banner ${merchantOpen ? 'open' : 'closed'}">
                <div style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:6px;">
                    <span style="font-size:13px; font-weight:bold; color:${merchantOpen ? '#fde047' : '#cbd5e1'};">
                        ${isMerchantOpen()
                            ? '🐪 週末限定：さすらいの行商人 開店中！（金曜18:00〜日曜24:00）'
                            : (forceMerchantPreview
                                ? '🐪 特別呼び出し中：さすらいの行商人（いつでも取引モード）'
                                : '🐪 さすらいの行商人（金曜18:00〜日曜24:00オープン）')
                        }
                    </span>
                    ${!isMerchantOpen() ? `
                        <button type="button" onclick="toggleForceMerchantPreview()" style="padding:0.25rem 0.6rem; border-radius:6px; font-size:11px; font-weight:bold; background:${forceMerchantPreview ? '#475569' : '#f59e0b'}; color:#fff; border:none; cursor:pointer;">
                            ${forceMerchantPreview ? '通常スケジュールに戻す' : '🔔 行商人を今すぐ呼ぶ'}
                        </button>
                    ` : ''}
                </div>
                <div style="font-size:11px; color:#fed7aa; margin-top:4px;">
                    レア素材「<strong>古代のネジ ⚙️</strong>」等を使って、<strong>季節の特別家具・アニメーション付き家具・レアおやつセット</strong>と交換できるスペシャルオファー枠です！
                </div>
            </div>

            <div class="merchant-offers-list" style="display:flex; flex-direction:column; gap:0.6rem; margin-top:0.75rem;">
                ${merchantOffers.map(offer => {
                    const isOwnedFurn = offer.type === 'furniture' && unlocked.has(offer.furnId);
                    const canAfford = !isOwnedFurn && merchantOpen && Object.entries(offer.cost).every(([m, req]) => (materials[m] || 0) >= req);
                    const costText = formatMaterialCostText(offer.cost);

                    let btnText = '交換する';
                    if (isOwnedFurn) btnText = '所持済み';
                    else if (!merchantOpen) btnText = '週末限定';

                    return `
                        <div class="merchant-offer-card ${isOwnedFurn ? 'is-owned' : (canAfford ? 'can-afford' : '')}">
                            <div class="shop-pickup-left">
                                <div class="shop-pickup-icon">${offer.icon}</div>
                                <div class="shop-pickup-info">
                                    <div style="display:flex; align-items:center; gap:6px; flex-wrap:wrap;">
                                        <span class="merchant-offer-badge">${offer.badge}</span>
                                        <span style="font-size:11px; color:#34d399; font-weight:bold;">${offer.buffLabel}</span>
                                    </div>
                                    <div class="shop-pickup-title" style="margin-top:2px;">${offer.name}</div>
                                    <div class="shop-pickup-desc">${offer.desc}</div>
                                    <div class="shop-pickup-cost">交換レート: ${costText}</div>
                                </div>
                            </div>
                            <button type="button" class="shop-buy-btn merchant-btn ${isOwnedFurn ? 'sold' : (canAfford ? 'ready' : 'locked')}"
                                onclick="buyMerchantSpecialOffer('${offer.offerId}')"
                                ${(isOwnedFurn || !canAfford) ? 'disabled' : ''}>
                                ${btnText}
                            </button>
                        </div>
                    `;
                }).join('')}
            </div>
        </div>
    `;

    container.innerHTML = `
        <!-- 所持素材＆おやつヘッダー -->
        <div class="materials-status-bar" style="background:#14141f; border:2px solid var(--accent); border-radius:8px; padding:0.55rem; margin-bottom:0.75rem; display:flex; justify-content:space-around; text-align:center;">
            <div><span style="font-size:17px;">🪵</span><div style="font-size:11px; font-weight:bold; color:#fff;">木材: ${materials.wood || 0}</div></div>
            <div><span style="font-size:17px;">🧶</span><div style="font-size:11px; font-weight:bold; color:#fff;">布: ${materials.cloth || 0}</div></div>
            <div><span style="font-size:17px;">🧱</span><div style="font-size:11px; font-weight:bold; color:#fff;">レンガ: ${materials.brick || 0}</div></div>
            <div><span style="font-size:17px;">⚙️</span><div style="font-size:11px; font-weight:bold; color:#ffd700;">ネジ: ${materials.gear || 0}</div></div>
            <div onclick="closeWorkshopModal(); if(typeof openBabySnackModal==='function') openBabySnackModal();" style="cursor:pointer;" title="タップでおやつ画面へ"><span style="font-size:17px;">🍖</span><div style="font-size:11px; font-weight:bold; color:#fb7185; text-decoration:underline;">おやつ: ${totalSnacks}</div></div>
        </div>

        <!-- 2階建てショップ切り替えタブ -->
        <div class="workshop-two-tabs">
            <button type="button" class="workshop-tab-btn ${currentWorkshopTab === 'daily' ? 'active' : ''}" onclick="switchWorkshopTab('daily')">
                🔨 常設：気まぐれおうち工房
            </button>
            <button type="button" class="workshop-tab-btn merchant-tab ${currentWorkshopTab === 'merchant' ? 'active' : ''}" onclick="switchWorkshopTab('merchant')">
                🐪 週末：さすらいの行商人 ${isMerchantOpen() ? '<span class="merchant-open-dot">OPEN</span>' : ''}
            </button>
        </div>

        <!-- タブコンテンツ本体 -->
        <div class="workshop-tab-content">
            ${currentWorkshopTab === 'merchant' ? merchantTabHtml : dailyTabHtml}
        </div>
    `;
}

/**
 * 🔨 常設：気まぐれおうち工房「本日のピックアップ枠」交換処理
 */
function buyDailyPickupItem(slotIndex) {
    const todayStr = (typeof getTodayDateString === 'function') ? getTodayDateString() : new Date().toISOString().slice(0, 10);
    const pickups = getDailyShopPickups(todayStr);
    const item = pickups[slotIndex];
    if (!item) return;

    const materials = kajigonState.materials || { wood: 0, cloth: 0, brick: 0, gear: 0 };
    for (const [m, req] of Object.entries(item.cost)) {
        if ((materials[m] || 0) < req) {
            if (typeof showToast === 'function') showToast('⚠️ 交換に必要な素材が足りません！');
            return;
        }
    }

    // 素材消費
    for (const [m, req] of Object.entries(item.cost)) {
        materials[m] -= req;
    }

    if (!kajigonState.dailyShopPurchased) kajigonState.dailyShopPurchased = {};
    if (!kajigonState.dailyShopPurchased[todayStr]) kajigonState.dailyShopPurchased[todayStr] = {};
    kajigonState.dailyShopPurchased[todayStr][item.pickupId] = true;

    if (item.type === 'snack') {
        if (!kajigonState.snackInventory) kajigonState.snackInventory = {};
        kajigonState.snackInventory[item.snackId] = (Number(kajigonState.snackInventory[item.snackId]) || 0) + (item.count || 1);
    } else if (item.type === 'furniture') {
        if (!kajigonState.unlockedFurniture) kajigonState.unlockedFurniture = [];
        if (!kajigonState.unlockedFurniture.includes(item.furnId)) {
            kajigonState.unlockedFurniture.push(item.furnId);
        }
    } else if (item.type === 'theme') {
        kajigonState.environmentTheme = item.themeId;
        kajigonState.totalExp += 30;
        if (typeof applyTheme === 'function') applyTheme();
    }

    if (typeof SoundEngine !== 'undefined') SoundEngine.playSE('level_up');
    saveToLocalStorage();
    renderFurnitureInRoom();
    renderCraftWorkshopModal();
    if (typeof updateCompanionWidget === 'function') updateCompanionWidget();

    if (typeof showToast === 'function') {
        showToast(`✨ 本日のピックアップ「${item.name}」を交換しました！`);
    }
}

/**
 * 🐪 週末：さすらいの行商人「スペシャルオファー枠」交換処理
 */
function buyMerchantSpecialOffer(offerId) {
    const offers = getWeekendMerchantOffers();
    const offer = offers.find(o => o.offerId === offerId);
    if (!offer) return;

    const materials = kajigonState.materials || { wood: 0, cloth: 0, brick: 0, gear: 0 };
    for (const [m, req] of Object.entries(offer.cost)) {
        if ((materials[m] || 0) < req) {
            if (typeof showToast === 'function') showToast('⚠️ 交換に必要な素材（古代のネジ等）が足りません！');
            return;
        }
    }

    if (offer.type === 'furniture') {
        if (!kajigonState.unlockedFurniture) kajigonState.unlockedFurniture = [];
        if (kajigonState.unlockedFurniture.includes(offer.furnId)) {
            if (typeof showToast === 'function') showToast('すでに所持している家具です！');
            return;
        }
        kajigonState.unlockedFurniture.push(offer.furnId);
    } else if (offer.type === 'snack_bundle') {
        if (!kajigonState.snackInventory) kajigonState.snackInventory = {};
        Object.entries(offer.snacks || {}).forEach(([sId, cnt]) => {
            kajigonState.snackInventory[sId] = (Number(kajigonState.snackInventory[sId]) || 0) + cnt;
        });
    }

    for (const [m, req] of Object.entries(offer.cost)) {
        materials[m] -= req;
    }

    if (typeof SoundEngine !== 'undefined') SoundEngine.playSE('level_up');
    saveToLocalStorage();
    renderFurnitureInRoom();
    renderCraftWorkshopModal();
    if (typeof updateCompanionWidget === 'function') updateCompanionWidget();

    if (typeof showToast === 'function') {
        showToast(`🐪 行商人から「${offer.name}」を交換しました！`);
    }
}

// 後方互換エイリアス
function buyMerchantItem(itemId) {
    buyMerchantSpecialOffer(`merchant_season_${itemId}`);
}

