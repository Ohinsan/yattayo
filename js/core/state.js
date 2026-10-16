// ==========================================================================
// ⚙️ コアステート管理 ＆ 成長判定 ＆ EXP・進化ロジック
// ==========================================================================

let completedList = [];
let currentLayout = '2ldk';
let currentFloors = 1;
let customRoomNames = {};
let playerCount = 1;
let luckyChore = "";

// 相棒カジゴンの状態オブジェクト
let kajigonState = {
    totalExp: 0,
    firePoints: 0,
    waterPoints: 0,
    windPoints: 0,
    earthPoints: 0,
    artifactCount: 0,
    environmentTheme: 'classic',
    forceSpecial: null,
    lastLuckyDate: null,
    endingSeen: false,
    // v2.6 新規追加プロパティ
    companionName: 'カジゴン',      // ニックネーム
    materials: { wood: 0, cloth: 0, brick: 0, gear: 0 }, // クラフト素材
    unlockedFurniture: [],         // アンロック済み家具ID
    chosenRoute: null,             // おやつ進化系統 ('dragon' | 'golem' | 'fairy' | 'fluffy' | 'wafuu' | 'sweets')
    // v2.9 新規追加プロパティ
    lastGiftTime: 0,               // 🎁 2時間放置おみやげ最終受け取り時刻
    hallOfFame: [],                // 🏛️ 歴代殿堂入り精霊リスト
    achievements: {},              // 🏆 特別実績の解除記録 { [id]: timestamp }
    unlockedTitles: [],            // 🎖️ 獲得済み二つ名称号リスト
    selectedTitle: null,           // 🎖️ 現在セット中の二つ名称号
    // v3.0 Phase 3 新規追加プロパティ
    snackInventory: {              // 🍖 おやつ所持数（6系統）
        dragon_meat: 1,
        ancient_gear_snack: 1,
        fairy_honey: 1,
        star_milk: 1,
        tsukimi_dango: 1,
        rainbow_berry: 1
    },
    nextChoreExpBuff: 1.0,         // 💖 大好物おやつバフ（1.5 = 次の家事EXP 1.5倍）
    dailyShopPurchased: {},        // 🔨 日替わりピックアップ購入記録 { 'YYYY-MM-DD': [itemId, ...] }
    merchantPurchased: {}          // 🐪 週末行商人交換記録 { 'YYYY-MM-DD': [offerId, ...] }
};

// ==========================================================================
// 🍖 Phase 3 (v3.0.0): 全6系統のおやつアイテム定義（進化分岐 ＆ 大好物バフ連動）
// ==========================================================================
const SNACK_ITEMS = [
    {
        id: 'dragon_meat',
        route: 'dragon',
        name: 'ドラゴン肉',
        icon: '🍖',
        routeTitle: '🐉 王道ドラゴン系統',
        routeLabel: '🐉 王道ドラゴン系統',
        borderColor: '#ef4444',
        textColor: '#f87171',
        color: '#f87171',
        desc: '大空を舞い属性ブレスを吐く伝説の王道ドラゴン族の大好物！',
        feedDialogue: '「モグモグ…！ジューシーなドラゴン肉で力がみなぎるぞ〜！🔥」'
    },
    {
        id: 'ancient_gear_snack',
        route: 'golem',
        name: '古代のネジおやつ',
        icon: '⚙️',
        routeTitle: '🤖 機械魔ゴーレム系統',
        routeLabel: '🤖 機械魔ゴーレム系統',
        borderColor: '#a855f7',
        textColor: '#c084fc',
        color: '#c084fc',
        desc: '頑丈な機械躯体を持つ魔導ゴーレム族の大好物！特製オイル風味ビスケット。',
        feedDialogue: '「ガシャン、モグモグ…！古代のネジパワーで装甲と出力がアップしたぞ！⚙️」'
    },
    {
        id: 'fairy_honey',
        route: 'fairy',
        name: '妖精のハチミツ',
        icon: '🍯',
        routeTitle: '🧚 妖精・レリック系統',
        routeLabel: '🧚 妖精・レリック系統',
        borderColor: '#10b981',
        textColor: '#34d399',
        color: '#34d399',
        desc: '料理小人や魔導書など、暮らしに寄り添う妖精・レリック族の大好物！',
        feedDialogue: '「ぱくっ…あま〜い！妖精のハチミツで幸せの魔法が溢れてくるよ〜！🍯」'
    },
    {
        id: 'star_milk',
        route: 'fluffy',
        name: '星降るホットミルク',
        icon: '🥛',
        routeTitle: '🐾 もふもふ幻獣系統',
        routeLabel: '🐾 もふもふ幻獣系統',
        borderColor: '#38bdf8',
        textColor: '#7dd3fc',
        color: '#7dd3fc',
        desc: 'ポメラニアン・白くま・フクロウ・ひつじなど、もふもふ幻獣たちの大好物！',
        feedDialogue: '「ごくごく…ぽかぽか〜！星降るホットミルクで毛並みがツヤツヤもふもふだぞ！🐾」'
    },
    {
        id: 'tsukimi_dango',
        route: 'wafuu',
        name: '三色月見だんご',
        icon: '🍡',
        routeTitle: '🍵 和風・座敷わらし系統',
        routeLabel: '🍵 和風・座敷わらし系統',
        borderColor: '#f59e0b',
        textColor: '#fbbf24',
        color: '#fbbf24',
        desc: 'かまど狐・清流河童・お掃除天狗・福招き猫神など、和風守り神たちの大好物！',
        feedDialogue: '「もぐもぐ…もちもち美味でござる！三色月見だんごでおうちに福が舞い込むぞ！🍵」'
    },
    {
        id: 'rainbow_berry',
        route: 'sweets',
        name: '虹色シュガーベリー',
        icon: '🍓',
        routeTitle: '🍰 スイーツ精霊系統',
        routeLabel: '🍰 スイーツ精霊系統',
        borderColor: '#ec4899',
        textColor: '#f472b6',
        color: '#f472b6',
        desc: 'ブリュレ竜・ソーダゼリー・シフォン妖精・抹茶ティラミス亀たちの大好物！',
        feedDialogue: '「ぱくっ♪ キュンと甘酸っぱい虹色シュガーベリー！スイートな魔力が満タンだよ！🍰」'
    }
];

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

const BASE_TEMPLATES = {
    '1k': [
        { id: 'kitchen', defaultName: 'キッチン', chores: ['料理', '食器洗い', 'シンクの掃除', 'コンロの掃除'] },
        { id: 'room', defaultName: '居室', chores: ['掃除機がけ', '拭き掃除', 'ベッドメイキング'] },
        { id: 'bath', defaultName: 'お風呂', chores: ['浴槽・浴室の掃除'] },
        { id: 'toilet', defaultName: 'トイレ', chores: ['トイレ掃除', 'タオル交換'] },
        { id: 'laundry', defaultName: '洗濯', chores: ['洗濯', '洗濯物を干す', '洗濯物を畳む'] },
        { id: 'trash', defaultName: 'ゴミ捨て', chores: ['ごみ捨て'] }
    ],
    '1ldk': [
        { id: 'kitchen', defaultName: 'キッチン', chores: ['料理', '食器洗い', 'シンクの掃除', 'コンロの掃除'] },
        { id: 'living', defaultName: 'リビング', chores: ['掃除機がけ', '拭き掃除'] },
        { id: 'bedroom', defaultName: '寝室', chores: ['ベッドメイキング', '掃除機がけ'] },
        { id: 'bath', defaultName: 'お風呂', chores: ['浴槽・浴室の掃除'] },
        { id: 'toilet', defaultName: 'トイレ', chores: ['トイレ掃除', 'タオル交換'] },
        { id: 'washroom', defaultName: '洗面所', chores: ['洗面台の掃除', 'タオル交換'] },
        { id: 'laundry', defaultName: '洗濯', chores: ['洗濯', '洗濯物を干す', '洗濯物を畳む'] },
        { id: 'trash', defaultName: 'ゴミ捨て', chores: ['ごみ捨て'] }
    ],
    '2ldk': [
        { id: 'kitchen', defaultName: 'キッチン', chores: ['料理', '食器洗い', 'シンクの掃除', 'コンロの掃除'] },
        { id: 'living', defaultName: 'リビング', chores: ['掃除機がけ', '拭き掃除'] },
        { id: 'room1', defaultName: '部屋1', chores: ['掃除機がけ', 'ベッドメイキング'] },
        { id: 'room2', defaultName: '部屋2', chores: ['掃除機がけ', '拭き掃除'] },
        { id: 'bath', defaultName: 'お風呂', chores: ['浴槽・浴室の掃除'] },
        { id: 'toilet', defaultName: 'トイレ', chores: ['トイレ掃除', 'タオル交換'] },
        { id: 'washroom', defaultName: '洗面所', chores: ['洗面台の掃除', 'タオル交換'] },
        { id: 'laundry', defaultName: '洗濯', chores: ['洗濯', '洗濯物を干す', '洗濯物を畳む'] },
        { id: 'trash', defaultName: 'ゴミ捨て', chores: ['ごみ捨て'] }
    ],
    '3ldk': [
        { id: 'kitchen', defaultName: 'キッチン', chores: ['料理', '食器洗い', 'シンクの掃除', 'コンロの掃除'] },
        { id: 'living', defaultName: 'リビング', chores: ['掃除機がけ', '拭き掃除'] },
        { id: 'room1', defaultName: '部屋1', chores: ['掃除機がけ', 'ベッドメイキング'] },
        { id: 'room2', defaultName: '部屋2', chores: ['掃除機がけ', '拭き掃除'] },
        { id: 'room3', defaultName: '部屋3', chores: ['掃除機がけ', '拭き掃除'] },
        { id: 'bath', defaultName: 'お風呂', chores: ['浴槽・浴室の掃除'] },
        { id: 'toilet', defaultName: 'トイレ', chores: ['トイレ掃除', 'タオル交換'] },
        { id: 'washroom', defaultName: '洗面所', chores: ['洗面台の掃除', 'タオル交換'] },
        { id: 'laundry', defaultName: '洗濯', chores: ['洗濯', '洗濯物を干す', '洗濯物を畳む'] },
        { id: 'trash', defaultName: 'ゴミ捨て', chores: ['ごみ捨て'] }
    ]
};
BASE_TEMPLATES['1LDK'] = BASE_TEMPLATES['1ldk'];
BASE_TEMPLATES['2LDK'] = BASE_TEMPLATES['2ldk'];
BASE_TEMPLATES['3LDK+'] = BASE_TEMPLATES['3ldk'];
BASE_TEMPLATES['3LDK'] = BASE_TEMPLATES['3ldk'];

function getRoomIcon(roomId, roomName) {
    if (roomId === 'kitchen' || roomName.includes('キッチン')) return '🍳';
    if (roomId === 'living' || roomName.includes('リビング')) return '🛋️';
    if (roomId === 'bath' || roomName.includes('風呂')) return '🛁';
    if (roomId === 'toilet' || roomName.includes('トイレ')) return '🚽';
    if (roomId === 'washroom' || roomName.includes('洗面')) return '🪞';
    if (roomId === 'laundry' || roomName.includes('洗濯')) return '👕';
    if (roomId === 'trash' || roomName.includes('ゴミ')) return '🗑️';
    if (roomId === 'bedroom' || roomName.includes('寝室')) return '🛏️';
    if (roomId === 'stairs' || roomName.includes('階段')) return '🪜';
    return '🚪';
}

function getTodayDateString() {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}

function getDateKey(timestamp) {
    const d = new Date(timestamp);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}

function formatTime(timestamp) {
    try {
        const d = new Date(timestamp);
        const h = String(d.getHours()).padStart(2, '0');
        const m = String(d.getMinutes()).padStart(2, '0');
        return `${h}:${m}`;
    } catch (e) {
        return "";
    }
}

// LocalStorage 永続化
function saveToLocalStorage() {
    try {
        const appData = {
            completedList,
            currentLayout,
            currentFloors,
            customRoomNames,
            playerCount,
            kajigonState
        };
        localStorage.setItem('kajigon_app_data', JSON.stringify(appData));
    } catch (e) {
        console.error('Failed to save to localStorage:', e);
    }
}

function loadFromLocalStorage() {
    try {
        const raw = localStorage.getItem('kajigon_app_data');
        if (!raw) return false;
        const data = JSON.parse(raw);
        if (data) {
            completedList = data.completedList || [];
            currentLayout = data.currentLayout || '2ldk';
            currentFloors = data.currentFloors || 1;
            customRoomNames = data.customRoomNames || {};
            playerCount = data.playerCount || 1;
            if (data.kajigonState) {
                kajigonState = { ...kajigonState, ...data.kajigonState };
                if (!kajigonState.materials) kajigonState.materials = { wood: 0, cloth: 0, brick: 0, gear: 0 };
                if (!kajigonState.unlockedFurniture) kajigonState.unlockedFurniture = [];
                if (!kajigonState.companionName) kajigonState.companionName = 'カジゴン';
                if (!kajigonState.lastGiftTime) kajigonState.lastGiftTime = 0;
                if (!kajigonState.hallOfFame) kajigonState.hallOfFame = [];
                if (!kajigonState.achievements) kajigonState.achievements = {};
                if (!kajigonState.unlockedTitles) kajigonState.unlockedTitles = [];
                if (!kajigonState.snackInventory || typeof kajigonState.snackInventory !== 'object') {
                    kajigonState.snackInventory = {
                        dragon_meat: 1,
                        ancient_gear_snack: 1,
                        fairy_honey: 1,
                        star_milk: 1,
                        tsukimi_dango: 1,
                        rainbow_berry: 1
                    };
                } else {
                    ['dragon_meat', 'ancient_gear_snack', 'fairy_honey', 'star_milk', 'tsukimi_dango', 'rainbow_berry'].forEach(k => {
                        if (typeof kajigonState.snackInventory[k] !== 'number') {
                            kajigonState.snackInventory[k] = 1;
                        }
                    });
                }
                if (typeof kajigonState.nextChoreExpBuff !== 'number' || kajigonState.nextChoreExpBuff < 1) {
                    kajigonState.nextChoreExpBuff = 1.0;
                }
                if (!kajigonState.dailyShopPurchased || typeof kajigonState.dailyShopPurchased !== 'object') {
                    kajigonState.dailyShopPurchased = {};
                }
                if (!kajigonState.merchantPurchased || typeof kajigonState.merchantPurchased !== 'object') {
                    kajigonState.merchantPurchased = {};
                }
            }
            if (typeof migrateHallOfFameData === 'function') {
                migrateHallOfFameData();
            }
            return true;
        }
    } catch (e) {
        console.error('Failed to load from localStorage:', e);
    }
    return false;
}

// ==========================================================================
// 📦 Phase 2 (v2.9.5): 生活動線に沿った「セット家事（ワンタップ・パック）」4種
// ==========================================================================
const CHORE_SET_PACKS = [
    {
        id: 'pack_morning',
        name: '🌅 朝のバタバタ一掃パック',
        subDesc: '換気＋布団整え＋洗面台拭き＋ゴミまとめ',
        exp: 45,
        attrBreakdown: { fire: 0, water: 10, wind: 20, earth: 15 },
        badgeText: '+45 EXP（🍃風20 / 🪵土15 / 💧水10）',
        primaryAttr: 'wind',
        pt: 5
    },
    {
        id: 'pack_dinner_kitchen',
        name: '🍳 夕食＆キッチン完全制覇パック',
        subDesc: '献立＋調理＋食器洗い＋コンロ・シンク拭き',
        exp: 65,
        attrBreakdown: { fire: 35, water: 30, wind: 0, earth: 0 },
        badgeText: '+65 EXP（🔥火35 / 💧水30）',
        primaryAttr: 'fire',
        pt: 7
    },
    {
        id: 'pack_bath_laundry',
        name: '🛁 お風呂＆ランドリー完結パック',
        subDesc: '風呂掃除＋排水口ゴミ取り＋タオル交換＋洗濯',
        exp: 60,
        attrBreakdown: { fire: 0, water: 35, wind: 15, earth: 10 },
        badgeText: '+60 EXP（💧水35 / 🍃風15 / 🪵土10）',
        primaryAttr: 'water',
        pt: 6
    },
    {
        id: 'pack_supply_reset',
        name: '📦 名もなき補充＆リセットパック',
        subDesc: 'ペーパー補充＋芯捨て＋麦茶作り＋靴揃え＋郵便物整理',
        exp: 40,
        attrBreakdown: { fire: 0, water: 15, wind: 0, earth: 25 },
        badgeText: '+40 EXP（🪵土25 / 💧水15）',
        primaryAttr: 'earth',
        pt: 4
    }
];

// ==========================================================================
// 🌟 Phase 2 (v2.9.5): 項目を探すのすら疲れた日の「ざっくり頑張ったボタン（小・中・大）」
// ==========================================================================
const FUZZY_EFFORT_BUTTONS = [
    {
        id: 'fuzzy_small',
        name: '🌱 ちょこちょこ動いた！',
        subDesc: '全属性均等ボーナス（小）',
        exp: 25,
        attrBreakdown: { fire: 6, water: 6, wind: 6, earth: 6 },
        badgeText: '+25 EXP / 全属性均等',
        primaryAttr: 'all',
        pt: 3,
        guaranteedGear: false
    },
    {
        id: 'fuzzy_medium',
        name: '💪 けっこう頑張った！',
        subDesc: '全属性均等ボーナス（中）',
        exp: 50,
        attrBreakdown: { fire: 12, water: 12, wind: 12, earth: 12 },
        badgeText: '+50 EXP / 全属性均等',
        primaryAttr: 'all',
        pt: 5,
        guaranteedGear: false
    },
    {
        id: 'fuzzy_large',
        name: '👑 今日はめちゃくちゃ働いた！',
        subDesc: '全属性均等（大）＋ ⚙️古代のネジ1個確定！',
        exp: 80,
        attrBreakdown: { fire: 20, water: 20, wind: 20, earth: 20 },
        badgeText: '+80 EXP / 全属性均等 ＋ ⚙️古代のネジ確定',
        primaryAttr: 'all',
        pt: 8,
        guaranteedGear: true
    }
];

// 家事ステータス・属性判定
function getChoreStats(choreName) {
    if (!choreName) return { exp: 15, attr: 'other', pt: 1, isOther: true };

    // 1. セット家事パック（4種）判定
    const matchedPack = CHORE_SET_PACKS.find(p => p.name === choreName || p.id === choreName);
    if (matchedPack) {
        return {
            exp: matchedPack.exp,
            attr: matchedPack.primaryAttr,
            pt: matchedPack.pt,
            isOther: false,
            isSetPack: true,
            attrBreakdown: { ...matchedPack.attrBreakdown },
            guaranteedGear: false
        };
    }

    // 2. ざっくり頑張ったボタン（小・中・大）判定
    const matchedFuzzy = FUZZY_EFFORT_BUTTONS.find(f => f.name === choreName || f.id === choreName);
    if (matchedFuzzy) {
        return {
            exp: matchedFuzzy.exp,
            attr: 'other',
            pt: matchedFuzzy.pt,
            isOther: true,
            isFuzzy: true,
            attrBreakdown: { ...matchedFuzzy.attrBreakdown },
            guaranteedGear: Boolean(matchedFuzzy.guaranteedGear)
        };
    }

    if (choreName.startsWith('[物品補充]')) {
        return { exp: 20, attr: 'earth', pt: 2, isOther: false };
    }
    if (choreName.startsWith('[その他]')) {
        return { exp: 15, attr: 'other', pt: 1, isOther: true };
    }
    if (choreName.includes('掃き掃除')) {
        return { exp: 30, attr: 'wind', pt: 3, isOther: false };
    }
    if (choreName.includes('拭き掃除')) {
        return { exp: 30, attr: 'earth', pt: 3, isOther: false };
    }

    const cleanName = choreName.includes('：') ? choreName.split('：')[1] : choreName;

    // 火属性
    if (cleanName === 'シンクの掃除' || cleanName === 'コンロの掃除') {
        return { exp: 80, attr: 'fire', pt: 8, isOther: false };
    }
    if (cleanName === '料理' || cleanName === '洗濯物を干す') {
        return { exp: 30, attr: 'fire', pt: 3, isOther: false };
    }

    // 水属性
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
        return { exp: 10, attr: 'water', pt: 1, isOther: false };
    }

    // 風属性
    if (cleanName === '掃除機がけ') {
        return { exp: 30, attr: 'wind', pt: 3, isOther: false };
    }
    if (cleanName === 'タオル交換') {
        return { exp: 15, attr: 'wind', pt: 1, isOther: false };
    }

    // 土属性
    if (cleanName === 'ベッドメイキング') {
        return { exp: 80, attr: 'earth', pt: 8, isOther: false };
    }
    if (cleanName === '洗濯物を畳む') {
        return { exp: 30, attr: 'earth', pt: 3, isOther: false };
    }
    if (cleanName === 'ごみ捨て') {
        return { exp: 15, attr: 'earth', pt: 1, isOther: false };
    }

    return { exp: 15, attr: 'other', pt: 1, isOther: true };
}

// 🏛️ 歴代殿堂入り精霊のパッシブ加護ボーナス（1体につき +5%、最大 +50%）
function getHallOfFameBlessingBonus() {
    let hallList = [];
    if (typeof getHallOfFameList === 'function') {
        hallList = getHallOfFameList();
    } else if (Array.isArray(kajigonState.hallOfFame)) {
        hallList = kajigonState.hallOfFame;
    }
    const count = Array.isArray(hallList) ? hallList.length : 0;
    return Math.min(50, count * 5);
}

// まとめて選択モード等での獲得予定EXP試算ヘルパー
function estimateChoreExp(choreName) {
    const stats = getChoreStats(choreName);
    const scaleCount = playerCount || 1;
    const playerMultiplier = scaleCount === 2 ? 1.5 : (scaleCount >= 3 ? 2.0 : 1.0);
    let expToAdd = stats.exp * playerMultiplier;

    const blessingBonus = getHallOfFameBlessingBonus();
    if (blessingBonus > 0) {
        expToAdd *= (1 + blessingBonus / 100);
    }
    if (typeof getFurnitureExpMultiplier === 'function') {
        expToAdd *= getFurnitureExpMultiplier(choreName, stats);
    }
    if (typeof getTodayFortuneStatus === 'function') {
        const fortune = getTodayFortuneStatus();
        if (fortune.drawn && fortune.bonusMultiplier) {
            expToAdd *= fortune.bonusMultiplier;
        }
    }
    // 💖 大好物おやつバフ（次の家事EXP 1.5倍）
    if (kajigonState.nextChoreExpBuff && kajigonState.nextChoreExpBuff > 1.0) {
        expToAdd *= kajigonState.nextChoreExpBuff;
    }
    return Math.round(expToAdd);
}

// EXP加算ロジック
function addChoreExp(choreName, options = {}) {
    const stats = getChoreStats(choreName);
    const scaleCount = playerCount || 1;
    const playerMultiplier = scaleCount === 2 ? 1.5 : (scaleCount >= 3 ? 2.0 : 1.0);

    let expToAdd = stats.exp * playerMultiplier;
    let wasLucky = false;
    let usedSnackBuff = false;

    // 🏛️ 殿堂入りパッシブ加護（永続 +5%〜+50%）
    const blessingBonus = getHallOfFameBlessingBonus();
    if (blessingBonus > 0) {
        expToAdd *= (1 + blessingBonus / 100);
    }

    // 家具ボーナス
    if (typeof getFurnitureExpMultiplier === 'function') {
        expToAdd *= getFurnitureExpMultiplier(choreName, stats);
    }

    // 朝のデイリーおみくじボーナス
    if (typeof getTodayFortuneStatus === 'function') {
        const fortune = getTodayFortuneStatus();
        if (fortune.drawn && fortune.bonusMultiplier) {
            expToAdd *= fortune.bonusMultiplier;
        }
    }

    // 💖 大好物おやつバフ（次の家事EXP 1.5倍！）
    if (kajigonState.nextChoreExpBuff && kajigonState.nextChoreExpBuff > 1.0) {
        expToAdd *= kajigonState.nextChoreExpBuff;
        usedSnackBuff = true;
        if (!options.keepSnackBuff) {
            kajigonState.nextChoreExpBuff = 1.0;
        }
    }

    // ラッキー家事
    const todayStr = getTodayDateString();
    const cleanName = choreName.includes('：') ? choreName.split('：')[1] : choreName;
    if (cleanName === luckyChore) {
        if (kajigonState.lastLuckyDate !== todayStr) {
            expToAdd *= 1.2;
            kajigonState.lastLuckyDate = todayStr;
            wasLucky = true;
        }
    }

    const finalExp = Math.round(expToAdd);
    kajigonState.totalExp += finalExp;

    // 属性ポイント加算（環境ブースト反映 ＆ セット家事・ざっくりボタンの複数属性配分対応）
    const currentEnv = ENVIRONMENT_THEMES[kajigonState.environmentTheme || 'classic'];
    const boostAttr = currentEnv ? currentEnv.boostAttr : null;
    const gainedAttrPts = { fire: 0, water: 0, wind: 0, earth: 0 };

    if (stats.attrBreakdown) {
        ['fire', 'water', 'wind', 'earth'].forEach(attrKey => {
            const baseVal = stats.attrBreakdown[attrKey] || 0;
            if (baseVal > 0) {
                const bonus = (boostAttr === attrKey) ? Math.round(baseVal * 1.3) : baseVal;
                kajigonState[`${attrKey}Points`] += bonus;
                gainedAttrPts[attrKey] = bonus;
            }
        });
    } else if (stats.isOther) {
        kajigonState.firePoints += stats.pt;
        kajigonState.waterPoints += stats.pt;
        kajigonState.windPoints += stats.pt;
        kajigonState.earthPoints += stats.pt;
        gainedAttrPts.fire = stats.pt;
        gainedAttrPts.water = stats.pt;
        gainedAttrPts.wind = stats.pt;
        gainedAttrPts.earth = stats.pt;
    } else if (stats.attr === 'fire') {
        const bonus = (boostAttr === 'fire') ? Math.round(stats.pt * 1.3) : stats.pt;
        kajigonState.firePoints += bonus;
        gainedAttrPts.fire = bonus;
    } else if (stats.attr === 'water') {
        const bonus = (boostAttr === 'water') ? Math.round(stats.pt * 1.3) : stats.pt;
        kajigonState.waterPoints += bonus;
        gainedAttrPts.water = bonus;
    } else if (stats.attr === 'wind') {
        const bonus = (boostAttr === 'wind') ? Math.round(stats.pt * 1.3) : stats.pt;
        kajigonState.windPoints += bonus;
        gainedAttrPts.wind = bonus;
    } else if (stats.attr === 'earth') {
        const bonus = (boostAttr === 'earth') ? Math.round(stats.pt * 1.3) : stats.pt;
        kajigonState.earthPoints += bonus;
        gainedAttrPts.earth = bonus;
    }

    if (!options.deferRender) {
        saveToLocalStorage();
        if (typeof applyTheme === 'function') applyTheme();
        if (typeof updateCompanionWidget === 'function') updateCompanionWidget();
        if (typeof updateLuckyChore === 'function') updateLuckyChore();
        if (typeof checkAchievementsAndTitles === 'function') checkAchievementsAndTitles();
    }

    return { finalExp, wasLucky, gainedAttrPts, usedSnackBuff };
}

// EXPロールバック（Undo用）
function undoChoreExp(found) {
    if (!found) return;
    const gained = found.gainedExp || 10;
    kajigonState.totalExp = Math.max(0, kajigonState.totalExp - gained);

    if (found.gainedAttrPts) {
        kajigonState.firePoints = Math.max(0, kajigonState.firePoints - (found.gainedAttrPts.fire || 0));
        kajigonState.waterPoints = Math.max(0, kajigonState.waterPoints - (found.gainedAttrPts.water || 0));
        kajigonState.windPoints = Math.max(0, kajigonState.windPoints - (found.gainedAttrPts.wind || 0));
        kajigonState.earthPoints = Math.max(0, kajigonState.earthPoints - (found.gainedAttrPts.earth || 0));
    } else {
        const stats = getChoreStats(found.name);
        if (stats.attrBreakdown) {
            kajigonState.firePoints = Math.max(0, kajigonState.firePoints - (stats.attrBreakdown.fire || 0));
            kajigonState.waterPoints = Math.max(0, kajigonState.waterPoints - (stats.attrBreakdown.water || 0));
            kajigonState.windPoints = Math.max(0, kajigonState.windPoints - (stats.attrBreakdown.wind || 0));
            kajigonState.earthPoints = Math.max(0, kajigonState.earthPoints - (stats.attrBreakdown.earth || 0));
        } else if (stats.isOther) {
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
    }

    saveToLocalStorage();
    if (typeof applyTheme === 'function') applyTheme();
    if (typeof updateCompanionWidget === 'function') updateCompanionWidget();
    if (typeof updateLuckyChore === 'function') updateLuckyChore();
}

// レベル＆ステージ判定
function getLevel() {
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
    if (stage === 'egg') return '🥚';
    if (stage === 'baby') return '🐣';
    if (stage === 'teen') return '👾';
    return '🐉';
}

// 🔥💧🍃🪵 当時の主属性（火・水・風・土、不明なら火）を算出するヘルパー
function getDominantAttribute(stateObj) {
    const s = stateObj || kajigonState || {};
    const pts = [
        { attr: 'fire', val: Number(s.firePoints) || 0 },
        { attr: 'water', val: Number(s.waterPoints) || 0 },
        { attr: 'wind', val: Number(s.windPoints) || 0 },
        { attr: 'earth', val: Number(s.earthPoints) || 0 }
    ];
    const maxVal = Math.max(...pts.map(p => p.val));
    if (maxVal <= 0) {
        const envMap = { volcano: 'fire', abyss: 'water', sky: 'wind', earth: 'earth' };
        return envMap[s.environmentTheme] || 'fire';
    }
    const maxPtsList = pts.filter(p => p.val === maxVal);
    return maxPtsList[0] ? maxPtsList[0].attr : 'fire';
}

/**
 * 💖 現在のカジゴンの「大好物おやつ系統」を取得するヘルパー（図鑑データ連動）
 */
function getCurrentFavoriteSnackInfo() {
    const lv = getLevel();
    const stage = getCompanionStage(lv);
    let favRoute = kajigonState.chosenRoute || null;
    let spiritName = kajigonState.companionName || 'カジゴン';
    let favoriteDish = '';

    if (stage === 'final') {
        const evolved = getEvolvedForm();
        if (evolved) {
            spiritName = evolved.name;
            if (typeof SPIRIT_PROFILES !== 'undefined' && SPIRIT_PROFILES[evolved.id]) {
                const prof = SPIRIT_PROFILES[evolved.id];
                favRoute = prof.favoriteRoute || evolved.route || favRoute;
                favoriteDish = prof.favorite || '';
            } else if (evolved.route) {
                favRoute = evolved.route;
            }
        }
    }

    if (!favRoute) {
        const envTheme = kajigonState.environmentTheme || 'classic';
        const envRouteMap = {
            volcano: 'dragon',
            abyss: 'fairy',
            sky: 'fluffy',
            earth: 'golem',
            classic: 'sweets',
            gameboy: 'wafuu'
        };
        favRoute = envRouteMap[envTheme] || 'dragon';
    }

    const snackItem = SNACK_ITEMS.find(s => s.route === favRoute) || SNACK_ITEMS[0];
    return {
        route: favRoute,
        snackId: snackItem.id,
        snack: snackItem,
        snackItem: snackItem,
        spiritName: spiritName,
        favoriteDish: favoriteDish
    };
}

// 🌟 進化判定ロジック（全6系統おやつ分岐 ＆ 環境固有種対応）
function getEvolvedForm() {
    const spiritsList = (typeof ALL_SPIRITS !== 'undefined') ? ALL_SPIRITS : [];
    if (spiritsList.length === 0) {
        return { id: 'light_dragon', name: '🌟 創世輝龍アルティマ 🐉', file: 'images/spirits/dragon_all.png' };
    }

    const pts = [
        { attr: 'fire', val: kajigonState.firePoints },
        { attr: 'water', val: kajigonState.waterPoints },
        { attr: 'wind', val: kajigonState.windPoints },
        { attr: 'earth', val: kajigonState.earthPoints }
    ];

    const maxVal = Math.max(...pts.map(p => p.val));
    const maxPtsList = pts.filter(p => p.val === maxVal);
    const isLightCondition = maxPtsList.length >= 2;
    const seed = kajigonState.totalExp;
    const winnerAttr = maxPtsList[seed % maxPtsList.length].attr;
    const envTheme = kajigonState.environmentTheme || 'classic';
    const route = kajigonState.chosenRoute;

    // 1. 🐾 もふもふ幻獣系統（🥛 星降るホットミルク）
    if (route === 'fluffy') {
        const fluffyMap = {
            fire: 'fluffy_fire',
            water: 'fluffy_water',
            wind: 'fluffy_wind',
            earth: 'fluffy_earth'
        };
        return spiritsList.find(s => s.id === fluffyMap[winnerAttr]) || spiritsList.find(s => s.id === 'fluffy_fire') || spiritsList[0];
    }

    // 2. 🍵 和風・座敷わらし系統（🍡 三色月見だんご）
    if (route === 'wafuu') {
        const wafuuMap = {
            fire: 'wafuu_fire',
            water: 'wafuu_water',
            wind: 'wafuu_wind',
            earth: 'wafuu_earth'
        };
        return spiritsList.find(s => s.id === wafuuMap[winnerAttr]) || spiritsList.find(s => s.id === 'wafuu_fire') || spiritsList[0];
    }

    // 3. 🍰 スイーツ精霊系統（🍓 虹色シュガーベリー）
    if (route === 'sweets') {
        const sweetsMap = {
            fire: 'sweets_fire',
            water: 'sweets_water',
            wind: 'sweets_wind',
            earth: 'sweets_earth'
        };
        return spiritsList.find(s => s.id === sweetsMap[winnerAttr]) || spiritsList.find(s => s.id === 'sweets_fire') || spiritsList[0];
    }

    // 4. 🧚 妖精・レリック系統（🍯 妖精のハチミツ）
    if (route === 'fairy') {
        const fairyMap = {
            fire: 'fairy_cook',
            water: 'fairy_cat',
            wind: 'fairy_broom',
            earth: 'relic_book'
        };
        return spiritsList.find(s => s.id === fairyMap[winnerAttr]) || spiritsList.find(s => s.id === 'fairy_cook') || spiritsList[0];
    }

    // 5. 🤖 機械魔ゴーレム系統（⚙️ 古代のネジおやつ、または系統未選択で古代パーツ所持）
    if (route === 'golem' || (!route && kajigonState.artifactCount >= 1)) {
        if (kajigonState.artifactCount >= 3 || isLightCondition) {
            return spiritsList.find(s => s.id === 'dark_golem') || spiritsList[0];
        }
        const golemMap = {
            fire: 'fire_golem',
            water: 'water_golem',
            wind: 'wind_golem',
            earth: 'earth_golem'
        };
        return spiritsList.find(s => s.id === golemMap[winnerAttr]) || spiritsList.find(s => s.id === 'earth_golem') || spiritsList[0];
    }

    // 6. 🌍 環境固有種ルート（王道ドラゴンまたは未選択時）
    if (envTheme === 'gameboy') {
        return spiritsList.find(s => s.id === 'unique_retro') || spiritsList[0];
    }
    if (envTheme === 'classic' && isLightCondition) {
        return spiritsList.find(s => s.id === 'unique_temple') || spiritsList.find(s => s.id === 'light_dragon') || spiritsList[0];
    }
    if (envTheme === 'volcano' && winnerAttr === 'fire') {
        return spiritsList.find(s => s.id === 'unique_volcano') || spiritsList[0];
    }
    if (envTheme === 'abyss' && winnerAttr === 'water') {
        return spiritsList.find(s => s.id === 'unique_abyss') || spiritsList[0];
    }
    if (envTheme === 'sky' && winnerAttr === 'wind') {
        return spiritsList.find(s => s.id === 'unique_sky') || spiritsList[0];
    }
    if (envTheme === 'earth' && winnerAttr === 'earth') {
        return spiritsList.find(s => s.id === 'unique_earth') || spiritsList[0];
    }

    // 7. 🐉 王道ドラゴンルート
    const dragonMap = {
        fire: 'fire_dragon',
        water: 'water_dragon',
        wind: 'wind_dragon',
        earth: 'earth_dragon'
    };
    if (isLightCondition || maxVal === 0) {
        return spiritsList.find(s => s.id === 'light_dragon') || spiritsList[0];
    }
    return spiritsList.find(s => s.id === dragonMap[winnerAttr]) || spiritsList[0];
}

// ==========================================================================
// 🏆 フェーズ7: 二つ名称号 ＆ おうち特別実績システム
// ==========================================================================

const TITLES_DATA = [
    {
        id: 'title_water_knight',
        name: '水回りの聖騎士',
        icon: '💧',
        desc: 'お風呂やトイレなど水回りの家事を極め、水属性ポイントが100に到達した者',
        check: (s) => (s.waterPoints || 0) >= 100
    },
    {
        id: 'title_fire_alchemist',
        name: '台所の炎術士',
        icon: '🔥',
        desc: '料理やコンロの熱い家事を極め、火属性ポイントが100に到達した者',
        check: (s) => (s.firePoints || 0) >= 100
    },
    {
        id: 'title_wind_master',
        name: '換気の風来坊',
        icon: '🍃',
        desc: '丁寧な掃除機がけや掃き掃除で、風属性ポイントが100に到達した者',
        check: (s) => (s.windPoints || 0) >= 100
    },
    {
        id: 'title_earth_guardian',
        name: 'おうちの守護神',
        icon: '🪵',
        desc: '拭き掃除や整理整頓を極め、土属性ポイントが100に到達した者',
        check: (s) => (s.earthPoints || 0) >= 100
    },
    {
        id: 'title_night_guardian',
        name: '深夜の勤勉なる守護者',
        icon: '🌙',
        desc: '夜遅く（23:00〜4:59）に家族のため家事を5回以上記録した者',
        check: (s, list) => {
            const count = (list || []).filter(c => {
                const h = new Date(c.time).getHours();
                return h >= 23 || h < 5;
            }).length;
            return count >= 5;
        }
    },
    {
        id: 'title_early_bird',
        name: '朝露の早起きマスター',
        icon: '🌅',
        desc: '清々しい早朝（5:00〜7:59）に家事を5回以上記録した者',
        check: (s, list) => {
            const count = (list || []).filter(c => {
                const h = new Date(c.time).getHours();
                return h >= 5 && h < 8;
            }).length;
            return count >= 5;
        }
    },
    {
        id: 'title_chore_legend',
        name: '百戦錬磨の家事名人',
        icon: '👑',
        desc: 'おうちの家事記録が累計100回を突破した真の熟練者',
        check: (s, list) => (list || []).length >= 100
    },
    {
        id: 'title_divine_evolution',
        name: '神代の相棒マスター',
        icon: '🐉',
        desc: '相棒カジゴンを最高ランクLv.10まで育て上げた者',
        check: () => getLevel() >= 10
    }
];

const ACHIEVEMENTS_DATA = [
    {
        id: 'achieve_first_chore',
        name: '暮らしの第一歩',
        desc: '初めて家事を1回記録する',
        icon: '🧹',
        reward: '🎖️ 称号枠解放',
        check: (s, list) => (list || []).length >= 1
    },
    {
        id: 'achieve_50_chores',
        name: '頼れるおうちの支柱',
        desc: '家事の累計記録数が50回に到達',
        icon: '🛡️',
        reward: '📦 木材・布・レンガセット',
        check: (s, list) => (list || []).length >= 50
    },
    {
        id: 'achieve_100_chores',
        name: '百戦錬磨の家事大功績',
        desc: '家事の累計記録数が100回に到達',
        icon: '👑',
        reward: '📜 古代石板ゴールド特製スタンプ',
        check: (s, list) => (list || []).length >= 100
    },
    {
        id: 'achieve_early_morning',
        name: '爽やかな朝活マスター',
        desc: '早朝（5:00〜7:59）に家事を記録する',
        icon: '🌅',
        reward: '🎁 朝のクラフト素材セット',
        check: (s, list) => (list || []).some(c => {
            const h = new Date(c.time).getHours();
            return h >= 5 && h < 8;
        })
    },
    {
        id: 'achieve_night_patrol',
        name: '夜警の勤勉なる守り手',
        desc: '深夜（23:00〜4:59）に家事を記録する',
        icon: '🌙',
        reward: '🎁 夜のクラフト素材セット',
        check: (s, list) => (list || []).some(c => {
            const h = new Date(c.time).getHours();
            return h >= 23 || h < 5;
        })
    },
    {
        id: 'achieve_craft_master',
        name: 'お部屋のインテリア職人',
        desc: '工房で家具を3つ以上クラフトする',
        icon: '🪚',
        reward: '🏆 職人の金枠バッジ',
        check: (s) => (s.unlockedFurniture || []).length >= 3
    },
    {
        id: 'achieve_level_10',
        name: '神々しき最終進化',
        desc: '相棒カジゴンがLv.10（神龍・魔神）に到達',
        icon: '🐉',
        reward: '🏆 黄金のカジゴン記念トロフィー',
        check: () => getLevel() >= 10
    },
    {
        id: 'achieve_hall_of_fame',
        name: '世代を紡ぐ架け橋',
        desc: '歴代殿堂入り精霊が1体以上誕生',
        icon: '🏛️',
        reward: '✨ 永続パッシブ加護アンロック',
        check: (s) => {
            let hallList = [];
            if (typeof getHallOfFameList === 'function') hallList = getHallOfFameList();
            else if (Array.isArray(s.hallOfFame)) hallList = s.hallOfFame;
            return hallList.length >= 1;
        }
    }
];

/**
 * 称号および特別実績の自動判定・解除
 */
function checkAchievementsAndTitles() {
    let unlockedNewTitle = false;
    let unlockedNewAchieve = false;

    kajigonState.unlockedTitles = kajigonState.unlockedTitles || [];
    kajigonState.achievements = kajigonState.achievements || {};

    // 1. 称号チェック
    TITLES_DATA.forEach(t => {
        if (!kajigonState.unlockedTitles.includes(t.id)) {
            if (t.check(kajigonState, completedList)) {
                kajigonState.unlockedTitles.push(t.id);
                unlockedNewTitle = true;
                if (!kajigonState.selectedTitle) {
                    kajigonState.selectedTitle = t.id;
                }
                if (typeof showToast === 'function') {
                    showToast(`🎖️ 新しい二つ名称号【${t.name}】を獲得しました！`);
                }
            }
        }
    });

    // 2. 実績チェック
    ACHIEVEMENTS_DATA.forEach(a => {
        if (!kajigonState.achievements[a.id]) {
            if (a.check(kajigonState, completedList)) {
                kajigonState.achievements[a.id] = Date.now();
                unlockedNewAchieve = true;
                if (typeof showToast === 'function') {
                    showToast(`🏆 特別実績【${a.name}】を解除しました！（${a.reward}）`);
                }
                if (typeof SoundEngine !== 'undefined') {
                    SoundEngine.playSE('lucky');
                }
            }
        }
    });

    if (unlockedNewTitle || unlockedNewAchieve) {
        saveToLocalStorage();
    }
}
