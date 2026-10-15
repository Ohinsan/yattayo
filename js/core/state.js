// ==========================================================================
// 笞呻ｸ・繧ｳ繧｢繧ｹ繝・・繝育ｮ｡逅・・・謌宣聞蛻､螳・・・EXP繝ｻ騾ｲ蛹悶Ο繧ｸ繝・け
// ==========================================================================

let completedList = [];
let currentLayout = '2ldk';
let currentFloors = 1;
let customRoomNames = {};
let playerCount = 1;
let luckyChore = "";

// 逶ｸ譽偵き繧ｸ繧ｴ繝ｳ縺ｮ迥ｶ諷九が繝悶ず繧ｧ繧ｯ繝・
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
    // v2.6 譁ｰ隕剰ｿｽ蜉繝励Ο繝代ユ繧｣
    companionName: '繧ｫ繧ｸ繧ｴ繝ｳ',      // 繝九ャ繧ｯ繝阪・繝
    materials: { wood: 0, cloth: 0, brick: 0, gear: 0 }, // 繧ｯ繝ｩ繝輔ヨ邏譚・
    unlockedFurniture: [],         // 繧｢繝ｳ繝ｭ繝・け貂医∩螳ｶ蜈ｷID
    chosenRoute: null,             // 繝吶ン繝ｼ譛溘・縺翫ｄ縺､蛻・ｲ・('golem' | 'dragon' | 'fairy')
    // v2.8 繝輔ぉ繝ｼ繧ｺ5縲・ 譁ｰ隕上・繝ｭ繝代ユ繧｣
    lastGiftTime: 0,               // 氏 2譎る俣謾ｾ鄂ｮ縺翫∩繧・￡譛邨ょ女縺大叙繧頑凾蛻ｻ
    hallOfFame: [],                // 鋤・・豁ｴ莉｣谿ｿ蝣ょ・繧顔ｲｾ髴翫Μ繧ｹ繝・
    achievements: {},              // 醇 迚ｹ蛻･螳溽ｸｾ縺ｮ隗｣髯､險倬鹸 { [id]: timestamp }
    unlockedTitles: [],            // 事・・迯ｲ蠕玲ｸ医∩莠後▽蜷咲ｧｰ蜿ｷ繝ｪ繧ｹ繝・
    selectedTitle: null            // 事・・迴ｾ蝨ｨ繧ｻ繝・ヨ荳ｭ縺ｮ莠後▽蜷咲ｧｰ蜿ｷ
};

const ENVIRONMENT_THEMES = {
    'volcano': {
        id: 'volcano',
        name: '轣ｼ辭ｱ縺ｮ轣ｫ螻ｱ',
        icon: '結',
        boostAttr: 'fire',
        boostLabel: '櫨轣ｫ縺瑚ご縺｡繧・☆縺・(ﾃ・.3蛟・',
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
        name: '豺ｱ豬ｷ縺ｮ逾樊ｮｿ',
        icon: '穴',
        boostAttr: 'water',
        boostLabel: '挑豌ｴ縺瑚ご縺｡繧・☆縺・(ﾃ・.3蛟・',
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
        name: '螟ｩ遨ｺ縺ｮ讓ｹ豬ｷ',
        icon: '鴻',
        boostAttr: 'wind',
        boostLabel: '鴻鬚ｨ縺瑚ご縺｡繧・☆縺・(ﾃ・.3蛟・',
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
        name: '遐よｼ縺ｮ蟾ｨ遏ｳ驕ｺ霍｡',
        icon: '除・・,
        boostAttr: 'earth',
        boostLabel: 'ｪｵ蝨溘′閧ｲ縺｡繧・☆縺・(ﾃ・.3蛟・',
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
        name: '譏滄剄繧狗･樊ｮｿ・磯壼ｸｸ・・,
        icon: '糖',
        boostAttr: null,
        boostLabel: '検蜈ｨ螻樊ｧ繝舌Λ繝ｳ繧ｹ閧ｲ謌・,
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
        name: '蛻昜ｻ｣繝ｬ繝医Ο・・B隱ｿ・・,
        icon: '董',
        boostAttr: null,
        boostLabel: '式繝弱せ繧ｿ繝ｫ繧ｸ繝ｼ4髫手ｪｿ',
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
        { id: 'kitchen', defaultName: '繧ｭ繝・メ繝ｳ', chores: ['譁咏炊', '鬟溷勣豢励＞', '繧ｷ繝ｳ繧ｯ縺ｮ謗・勁', '繧ｳ繝ｳ繝ｭ縺ｮ謗・勁'] },
        { id: 'room', defaultName: '螻・ｮ､', chores: ['謗・勁讖溘′縺・, '諡ｭ縺肴祉髯､', '繝吶ャ繝峨Γ繧､繧ｭ繝ｳ繧ｰ'] },
        { id: 'bath', defaultName: '縺企｢ｨ蜻・, chores: ['豬ｴ讒ｽ繝ｻ豬ｴ螳､縺ｮ謗・勁'] },
        { id: 'toilet', defaultName: '繝医う繝ｬ', chores: ['繝医う繝ｬ謗・勁', '繧ｿ繧ｪ繝ｫ莠､謠・] },
        { id: 'laundry', defaultName: '豢玲ｿｯ', chores: ['豢玲ｿｯ', '豢玲ｿｯ迚ｩ繧貞ｹｲ縺・, '豢玲ｿｯ迚ｩ繧堤糞繧'] },
        { id: 'trash', defaultName: '繧ｴ繝滓昏縺ｦ', chores: ['縺斐∩謐ｨ縺ｦ'] }
    ],
    '1ldk': [
        { id: 'kitchen', defaultName: '繧ｭ繝・メ繝ｳ', chores: ['譁咏炊', '鬟溷勣豢励＞', '繧ｷ繝ｳ繧ｯ縺ｮ謗・勁', '繧ｳ繝ｳ繝ｭ縺ｮ謗・勁'] },
        { id: 'living', defaultName: '繝ｪ繝薙Φ繧ｰ', chores: ['謗・勁讖溘′縺・, '諡ｭ縺肴祉髯､'] },
        { id: 'bedroom', defaultName: '蟇晏ｮ､', chores: ['繝吶ャ繝峨Γ繧､繧ｭ繝ｳ繧ｰ', '謗・勁讖溘′縺・] },
        { id: 'bath', defaultName: '縺企｢ｨ蜻・, chores: ['豬ｴ讒ｽ繝ｻ豬ｴ螳､縺ｮ謗・勁'] },
        { id: 'toilet', defaultName: '繝医う繝ｬ', chores: ['繝医う繝ｬ謗・勁', '繧ｿ繧ｪ繝ｫ莠､謠・] },
        { id: 'washroom', defaultName: '豢鈴擇謇', chores: ['豢鈴擇蜿ｰ縺ｮ謗・勁', '繧ｿ繧ｪ繝ｫ莠､謠・] },
        { id: 'laundry', defaultName: '豢玲ｿｯ', chores: ['豢玲ｿｯ', '豢玲ｿｯ迚ｩ繧貞ｹｲ縺・, '豢玲ｿｯ迚ｩ繧堤糞繧'] },
        { id: 'trash', defaultName: '繧ｴ繝滓昏縺ｦ', chores: ['縺斐∩謐ｨ縺ｦ'] }
    ],
    '2ldk': [
        { id: 'kitchen', defaultName: '繧ｭ繝・メ繝ｳ', chores: ['譁咏炊', '鬟溷勣豢励＞', '繧ｷ繝ｳ繧ｯ縺ｮ謗・勁', '繧ｳ繝ｳ繝ｭ縺ｮ謗・勁'] },
        { id: 'living', defaultName: '繝ｪ繝薙Φ繧ｰ', chores: ['謗・勁讖溘′縺・, '諡ｭ縺肴祉髯､'] },
        { id: 'room1', defaultName: '驛ｨ螻・', chores: ['謗・勁讖溘′縺・, '繝吶ャ繝峨Γ繧､繧ｭ繝ｳ繧ｰ'] },
        { id: 'room2', defaultName: '驛ｨ螻・', chores: ['謗・勁讖溘′縺・, '諡ｭ縺肴祉髯､'] },
        { id: 'bath', defaultName: '縺企｢ｨ蜻・, chores: ['豬ｴ讒ｽ繝ｻ豬ｴ螳､縺ｮ謗・勁'] },
        { id: 'toilet', defaultName: '繝医う繝ｬ', chores: ['繝医う繝ｬ謗・勁', '繧ｿ繧ｪ繝ｫ莠､謠・] },
        { id: 'washroom', defaultName: '豢鈴擇謇', chores: ['豢鈴擇蜿ｰ縺ｮ謗・勁', '繧ｿ繧ｪ繝ｫ莠､謠・] },
        { id: 'laundry', defaultName: '豢玲ｿｯ', chores: ['豢玲ｿｯ', '豢玲ｿｯ迚ｩ繧貞ｹｲ縺・, '豢玲ｿｯ迚ｩ繧堤糞繧'] },
        { id: 'trash', defaultName: '繧ｴ繝滓昏縺ｦ', chores: ['縺斐∩謐ｨ縺ｦ'] }
    ],
    '3ldk': [
        { id: 'kitchen', defaultName: '繧ｭ繝・メ繝ｳ', chores: ['譁咏炊', '鬟溷勣豢励＞', '繧ｷ繝ｳ繧ｯ縺ｮ謗・勁', '繧ｳ繝ｳ繝ｭ縺ｮ謗・勁'] },
        { id: 'living', defaultName: '繝ｪ繝薙Φ繧ｰ', chores: ['謗・勁讖溘′縺・, '諡ｭ縺肴祉髯､'] },
        { id: 'room1', defaultName: '驛ｨ螻・', chores: ['謗・勁讖溘′縺・, '繝吶ャ繝峨Γ繧､繧ｭ繝ｳ繧ｰ'] },
        { id: 'room2', defaultName: '驛ｨ螻・', chores: ['謗・勁讖溘′縺・, '諡ｭ縺肴祉髯､'] },
        { id: 'room3', defaultName: '驛ｨ螻・', chores: ['謗・勁讖溘′縺・, '諡ｭ縺肴祉髯､'] },
        { id: 'bath', defaultName: '縺企｢ｨ蜻・, chores: ['豬ｴ讒ｽ繝ｻ豬ｴ螳､縺ｮ謗・勁'] },
        { id: 'toilet', defaultName: '繝医う繝ｬ', chores: ['繝医う繝ｬ謗・勁', '繧ｿ繧ｪ繝ｫ莠､謠・] },
        { id: 'washroom', defaultName: '豢鈴擇謇', chores: ['豢鈴擇蜿ｰ縺ｮ謗・勁', '繧ｿ繧ｪ繝ｫ莠､謠・] },
        { id: 'laundry', defaultName: '豢玲ｿｯ', chores: ['豢玲ｿｯ', '豢玲ｿｯ迚ｩ繧貞ｹｲ縺・, '豢玲ｿｯ迚ｩ繧堤糞繧'] },
        { id: 'trash', defaultName: '繧ｴ繝滓昏縺ｦ', chores: ['縺斐∩謐ｨ縺ｦ'] }
    ]
};
BASE_TEMPLATES['1LDK'] = BASE_TEMPLATES['1ldk'];
BASE_TEMPLATES['2LDK'] = BASE_TEMPLATES['2ldk'];
BASE_TEMPLATES['3LDK+'] = BASE_TEMPLATES['3ldk'];
BASE_TEMPLATES['3LDK'] = BASE_TEMPLATES['3ldk'];

function getRoomIcon(roomId, roomName) {
    if (roomId === 'kitchen' || roomName.includes('繧ｭ繝・メ繝ｳ')) return '叉';
    if (roomId === 'living' || roomName.includes('繝ｪ繝薙Φ繧ｰ')) return '寞・・;
    if (roomId === 'bath' || roomName.includes('鬚ｨ蜻・)) return '宦';
    if (roomId === 'toilet' || roomName.includes('繝医う繝ｬ')) return '埒';
    if (roomId === 'washroom' || roomName.includes('豢鈴擇')) return 'ｪ・;
    if (roomId === 'laundry' || roomName.includes('豢玲ｿｯ')) return '装';
    if (roomId === 'trash' || roomName.includes('繧ｴ繝・)) return '卵・・;
    if (roomId === 'bedroom' || roomName.includes('蟇晏ｮ､')) return '寶・・;
    if (roomId === 'stairs' || roomName.includes('髫取ｮｵ')) return 'ｪ・;
    return '坎';
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

// LocalStorage 豌ｸ邯壼喧
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
                if (!kajigonState.companionName) kajigonState.companionName = '繧ｫ繧ｸ繧ｴ繝ｳ';
                // 孱・・繝輔ぉ繝ｼ繧ｺ5縲・ 莠呈鋤諤ｧ繝輔か繝ｼ繝ｫ繝舌ャ繧ｯ繧ｬ繝ｼ繝・
                kajigonState.lastGiftTime = kajigonState.lastGiftTime || 0;
                kajigonState.hallOfFame = Array.isArray(kajigonState.hallOfFame) ? kajigonState.hallOfFame : [];
                kajigonState.achievements = (kajigonState.achievements && typeof kajigonState.achievements === 'object') ? kajigonState.achievements : {};
                kajigonState.unlockedTitles = Array.isArray(kajigonState.unlockedTitles) ? kajigonState.unlockedTitles : [];
                kajigonState.selectedTitle = kajigonState.selectedTitle || null;
            }
            return true;
        }
    } catch (e) {
        console.error('Failed to load from localStorage:', e);
    }
    return false;
}

// 螳ｶ莠九せ繝・・繧ｿ繧ｹ繝ｻ螻樊ｧ蛻､螳・
function getChoreStats(choreName) {
    if (choreName.startsWith('[迚ｩ蜩∬｣懷・]')) {
        return { exp: 20, attr: 'earth', pt: 2, isOther: false };
    }
    if (choreName.startsWith('[縺昴・莉望')) {
        return { exp: 15, attr: 'other', pt: 1, isOther: true };
    }
    if (choreName.includes('謗・″謗・勁')) {
        return { exp: 30, attr: 'wind', pt: 3, isOther: false };
    }
    if (choreName.includes('諡ｭ縺肴祉髯､')) {
        return { exp: 30, attr: 'earth', pt: 3, isOther: false };
    }

    const cleanName = choreName.includes('・・) ? choreName.split('・・)[1] : choreName;

    // 轣ｫ螻樊ｧ
    if (cleanName === '繧ｷ繝ｳ繧ｯ縺ｮ謗・勁' || cleanName === '繧ｳ繝ｳ繝ｭ縺ｮ謗・勁') {
        return { exp: 80, attr: 'fire', pt: 8, isOther: false };
    }
    if (cleanName === '譁咏炊' || cleanName === '豢玲ｿｯ迚ｩ繧貞ｹｲ縺・) {
        return { exp: 30, attr: 'fire', pt: 3, isOther: false };
    }

    // 豌ｴ螻樊ｧ
    if (cleanName === '豬ｴ讒ｽ繝ｻ豬ｴ螳､縺ｮ謗・勁') {
        return { exp: 80, attr: 'water', pt: 8, isOther: false };
    }
    if (cleanName === '繝医う繝ｬ謗・勁') {
        return { exp: 40, attr: 'water', pt: 4, isOther: false };
    }
    if (cleanName === '豢玲ｿｯ' || cleanName === '豢鈴擇蜿ｰ縺ｮ謗・勁') {
        return { exp: 30, attr: 'water', pt: 3, isOther: false };
    }
    if (cleanName === '鬟溷勣豢励＞') {
        return { exp: 10, attr: 'water', pt: 1, isOther: false };
    }

    // 鬚ｨ螻樊ｧ
    if (cleanName === '謗・勁讖溘′縺・) {
        return { exp: 30, attr: 'wind', pt: 3, isOther: false };
    }
    if (cleanName === '繧ｿ繧ｪ繝ｫ莠､謠・) {
        return { exp: 15, attr: 'wind', pt: 1, isOther: false };
    }

    // 蝨溷ｱ樊ｧ
    if (cleanName === '繝吶ャ繝峨Γ繧､繧ｭ繝ｳ繧ｰ') {
        return { exp: 80, attr: 'earth', pt: 8, isOther: false };
    }
    if (cleanName === '豢玲ｿｯ迚ｩ繧堤糞繧') {
        return { exp: 30, attr: 'earth', pt: 3, isOther: false };
    }
    if (cleanName === '縺斐∩謐ｨ縺ｦ') {
        return { exp: 15, attr: 'earth', pt: 1, isOther: false };
    }

    return { exp: 15, attr: 'other', pt: 1, isOther: true };
}

/**
 * 鋤・・縲舌ヵ繧ｧ繝ｼ繧ｺ6縲第ｭｴ莉｣谿ｿ蝣ゅヱ繝・す繝門刈隴ｷ繝懊・繝翫せ・・菴薙＃縺ｨ縺ｫ豌ｸ邯・5%縲∵怙螟ｧ+50%・・
 * @returns {number} 繝懊・繝翫せ% (0 縲・50)
 */
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

// EXP蜉邂励Ο繧ｸ繝・け
function addChoreExp(choreName) {
    const stats = getChoreStats(choreName);
    const scaleCount = playerCount || 1;
    const playerMultiplier = scaleCount === 2 ? 1.5 : (scaleCount >= 3 ? 2.0 : 1.0);

    let expToAdd = stats.exp * playerMultiplier;
    let wasLucky = false;

    // 鋤・・谿ｿ蝣ょ・繧翫ヱ繝・す繝門刈隴ｷ・域ｰｸ邯・+5%縲・50%・・
    const blessingBonus = getHallOfFameBlessingBonus();
    if (blessingBonus > 0) {
        expToAdd *= (1 + blessingBonus / 100);
    }

    // 螳ｶ蜈ｷ繝懊・繝翫せ
    if (typeof getFurnitureExpMultiplier === 'function') {
        expToAdd *= getFurnitureExpMultiplier(choreName, stats);
    }

    // 譛昴・繝・う繝ｪ繝ｼ縺翫∩縺上§繝懊・繝翫せ
    if (typeof getTodayFortuneStatus === 'function') {
        const fortune = getTodayFortuneStatus();
        if (fortune.drawn && fortune.bonusMultiplier) {
            expToAdd *= fortune.bonusMultiplier;
        }
    }

    // 繝ｩ繝・く繝ｼ螳ｶ莠・
    const todayStr = getTodayDateString();
    const cleanName = choreName.includes('・・) ? choreName.split('・・)[1] : choreName;
    if (cleanName === luckyChore) {
        if (kajigonState.lastLuckyDate !== todayStr) {
            expToAdd *= 1.2;
            kajigonState.lastLuckyDate = todayStr;
            wasLucky = true;
        }
    }

    const finalExp = Math.round(expToAdd);
    kajigonState.totalExp += finalExp;

    // 螻樊ｧ繝昴う繝ｳ繝亥刈邂暦ｼ育腸蠅・ヶ繝ｼ繧ｹ繝亥渚譏・・
    const currentEnv = ENVIRONMENT_THEMES[kajigonState.environmentTheme || 'classic'];
    const boostAttr = currentEnv ? currentEnv.boostAttr : null;

    if (stats.isOther) {
        kajigonState.firePoints += stats.pt;
        kajigonState.waterPoints += stats.pt;
        kajigonState.windPoints += stats.pt;
        kajigonState.earthPoints += stats.pt;
    } else if (stats.attr === 'fire') {
        const bonus = (boostAttr === 'fire') ? Math.round(stats.pt * 1.3) : stats.pt;
        kajigonState.firePoints += bonus;
    } else if (stats.attr === 'water') {
        const bonus = (boostAttr === 'water') ? Math.round(stats.pt * 1.3) : stats.pt;
        kajigonState.waterPoints += bonus;
    } else if (stats.attr === 'wind') {
        const bonus = (boostAttr === 'wind') ? Math.round(stats.pt * 1.3) : stats.pt;
        kajigonState.windPoints += bonus;
    } else if (stats.attr === 'earth') {
        const bonus = (boostAttr === 'earth') ? Math.round(stats.pt * 1.3) : stats.pt;
        kajigonState.earthPoints += bonus;
    }

    saveToLocalStorage();
    if (typeof applyTheme === 'function') applyTheme();
    if (typeof updateCompanionWidget === 'function') updateCompanionWidget();
    if (typeof updateLuckyChore === 'function') updateLuckyChore();
    if (typeof checkAchievementsAndTitles === 'function') checkAchievementsAndTitles();

    return { finalExp, wasLucky };
}

// EXP繝ｭ繝ｼ繝ｫ繝舌ャ繧ｯ・・ndo逕ｨ・・
function undoChoreExp(found) {
    if (!found) return;
    const gained = found.gainedExp || 10;
    kajigonState.totalExp = Math.max(0, kajigonState.totalExp - gained);

    const stats = getChoreStats(found.name);
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
    if (typeof applyTheme === 'function') applyTheme();
    if (typeof updateCompanionWidget === 'function') updateCompanionWidget();
    if (typeof updateLuckyChore === 'function') updateLuckyChore();
}

// 繝ｬ繝吶Ν・・せ繝・・繧ｸ蛻､螳・
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
    if (stage === 'egg') return '･・;
    if (stage === 'baby') return '瀬';
    if (stage === 'teen') return '太';
    return '翠';
}

// 検 騾ｲ蛹門愛螳壹Ο繧ｸ繝・け・医・繝薙・譛溘♀繧・▽蛻・ｲ・・・繧ｴ繝ｼ繝ｬ繝騾ｲ蛹門ｯｾ蠢懶ｼ・
function getEvolvedForm() {
    const spiritsList = (typeof ALL_SPIRITS !== 'undefined') ? ALL_SPIRITS : [];
    if (spiritsList.length === 0) {
        return { id: 'light_dragon', name: '検 蜑ｵ荳冶ｼ晞ｾ阪い繝ｫ繝・ぅ繝・翠', file: 'images/spirits/dragon_all.png' };
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

    // 検 繝吶ン繝ｼ譛溘・縺翫ｄ縺､蛻・ｲ撰ｼ域э蝗ｳ逧・↑驕ｸ謚橸ｼ峨・蜿肴丐
    if (kajigonState.chosenRoute === 'golem' || kajigonState.artifactCount >= 1) {
        if (kajigonState.artifactCount >= 3 || isLightCondition) {
            return spiritsList.find(s => s.id === 'dark_golem') || spiritsList[0];
        }
        const golemMap = {
            fire: 'fire_golem',
            water: 'water_golem',
            wind: 'wind_golem',
            earth: 'earth_golem'
        };
        return spiritsList.find(s => s.id === golemMap[winnerAttr]) || spiritsList.find(s => s.id === 'earth_golem');
    }

    if (kajigonState.chosenRoute === 'fairy') {
        const fairyMap = {
            fire: 'fairy_cook',
            water: 'fairy_cat',
            wind: 'fairy_broom',
            earth: 'relic_book'
        };
        return spiritsList.find(s => s.id === fairyMap[winnerAttr]) || spiritsList.find(s => s.id === 'fairy_cook');
    }

    // 迺ｰ蠅・崋譛臥ｨｮ繝ｫ繝ｼ繝・
    if (envTheme === 'gameboy') {
        return spiritsList.find(s => s.id === 'unique_retro');
    }
    if (envTheme === 'classic' && isLightCondition) {
        return spiritsList.find(s => s.id === 'unique_temple') || spiritsList.find(s => s.id === 'light_dragon');
    }
    if (envTheme === 'volcano' && winnerAttr === 'fire') {
        return spiritsList.find(s => s.id === 'unique_volcano');
    }
    if (envTheme === 'abyss' && winnerAttr === 'water') {
        return spiritsList.find(s => s.id === 'unique_abyss');
    }
    if (envTheme === 'sky' && winnerAttr === 'wind') {
        return spiritsList.find(s => s.id === 'unique_sky');
    }
    if (envTheme === 'earth' && winnerAttr === 'earth') {
        return spiritsList.find(s => s.id === 'unique_earth');
    }

    // 邇矩％繝峨Λ繧ｴ繝ｳ繝ｫ繝ｼ繝・
    const dragonMap = {
        fire: 'fire_dragon',
        water: 'water_dragon',
        wind: 'wind_dragon',
        earth: 'earth_dragon'
    };
    if (isLightCondition || maxVal === 0) {
        return spiritsList.find(s => s.id === 'light_dragon');
    }
    return spiritsList.find(s => s.id === dragonMap[winnerAttr]) || spiritsList[0];
}

// ==========================================================================
// 事・・縲舌ヵ繧ｧ繝ｼ繧ｺ7縲台ｺ後▽蜷咲ｧｰ蜿ｷ ・・縺翫≧縺｡迚ｹ蛻･螳溽ｸｾ・医い繝√・繝悶Γ繝ｳ繝茨ｼ峨す繧ｹ繝・Β
// ==========================================================================

const TITLES_DATA = [
    {
        id: 'title_water_paladin',
        name: '豌ｴ蝗槭ｊ縺ｮ閨夜ｨ主｣ｫ',
        icon: '挑',
        desc: '縺企｢ｨ蜻ゅｄ豌ｴ蝗槭ｊ繧呈ｸ・ａ邯壹￠縲∵ｰｴ螻樊ｧ繝昴う繝ｳ繝医′100縺ｫ蛻ｰ驕斐＠縺溯・,
        check: (s) => (s.waterPoints || 0) >= 100
    },
    {
        id: 'title_fire_alchemist',
        name: '繧ｳ繝ｳ繝ｭ逎ｨ縺阪・骭ｬ驥題｡灘ｸｫ',
        icon: '櫨',
        desc: '譁咏炊繧・さ繝ｳ繝ｭ縺ｮ辭ｱ縺・ｮｶ莠九ｒ讌ｵ繧√∫↓螻樊ｧ繝昴う繝ｳ繝医′100縺ｫ蛻ｰ驕斐＠縺溯・,
        check: (s) => (s.firePoints || 0) >= 100
    },
    {
        id: 'title_wind_master',
        name: '鬚ｨ繧偵∪縺ｨ縺・祉髯､髟ｷ',
        icon: '鴻',
        desc: '荳∝ｯｧ縺ｪ謗・勁讖溘′縺代ｄ謗・″謗・勁縺ｧ縲・｢ｨ螻樊ｧ繝昴う繝ｳ繝医′100縺ｫ蛻ｰ驕斐＠縺溯・,
        check: (s) => (s.windPoints || 0) >= 100
    },
    {
        id: 'title_earth_guardian',
        name: '螟ｧ蝨ｰ縺ｮ螳牙ｮ壼ｮ郁ｭｷ譽滓｢・,
        icon: 'ｪｵ',
        desc: '諡ｭ縺肴祉髯､繧・紛逅・紛鬆薙ｒ讌ｵ繧√∝悄螻樊ｧ繝昴う繝ｳ繝医′100縺ｫ蛻ｰ驕斐＠縺溯・,
        check: (s) => (s.earthPoints || 0) >= 100
    },
    {
        id: 'title_night_guardian',
        name: '豺ｱ螟懊・蜍､蜍峨↑螳郁ｭｷ閠・,
        icon: '嫌',
        desc: '螟憺≦縺擾ｼ・3:00縲・:59・峨↓螳ｶ譌上・縺溘ａ螳ｶ莠九ｒ5蝗樔ｻ･荳願ｨ倬鹸縺励◆閠・,
        check: (s, list) => {
            const count = list.filter(c => {
                const h = new Date(c.time).getHours();
                return h >= 23 || h < 5;
            }).length;
            return count >= 5;
        }
    },
    {
        id: 'title_early_bird',
        name: '譛晞愆縺ｮ譌ｩ襍ｷ縺阪・繧ｹ繧ｿ繝ｼ',
        icon: '桁',
        desc: '貂・・＠縺・掠譛晢ｼ・:00縲・:59・峨↓螳ｶ莠九ｒ5蝗樔ｻ･荳願ｨ倬鹸縺励◆閠・,
        check: (s, list) => {
            const count = list.filter(c => {
                const h = new Date(c.time).getHours();
                return h >= 5 && h < 8;
            }).length;
            return count >= 5;
        }
    },
    {
        id: 'title_chore_legend',
        name: '逋ｾ謌ｦ骭ｬ逎ｨ縺ｮ螳ｶ莠倶ｻ吩ｺｺ',
        icon: '荘',
        desc: '縺翫≧縺｡縺ｮ螳ｶ莠玖ｨ倬鹸縺檎ｴｯ險・00蝗槭ｒ遯∫ｴ縺励◆逵溘・辭溽ｷｴ閠・,
        check: (s, list) => list.length >= 100
    },
    {
        id: 'title_divine_evolution',
        name: '逾樔ｻ｣縺ｮ逶ｸ譽偵・繧ｹ繧ｿ繝ｼ',
        icon: '翠',
        desc: '逶ｸ譽偵き繧ｸ繧ｴ繝ｳ繧呈怙鬮倥Λ繝ｳ繧ｯLv.10縺ｾ縺ｧ閧ｲ縺ｦ荳翫￡縺溯・,
        check: () => getLevel() >= 10
    }
];

const ACHIEVEMENTS_DATA = [
    {
        id: 'achieve_first_chore',
        name: '證ｮ繧峨＠縺ｮ隨ｬ荳豁ｩ',
        desc: '蛻昴ａ縺ｦ螳ｶ莠九ｒ1蝗櫁ｨ倬鹸縺吶ｋ',
        icon: '験',
        reward: '事・・遘ｰ蜿ｷ譫隗｣謾ｾ',
        check: (s, list) => list.length >= 1
    },
    {
        id: 'achieve_50_chores',
        name: '鬆ｼ繧後ｋ縺翫≧縺｡縺ｮ謾ｯ譟ｱ',
        desc: '螳ｶ莠九・邏ｯ險郁ｨ倬鹸謨ｰ縺・0蝗槭↓蛻ｰ驕・,
        icon: '箝・,
        reward: '笨ｨ 譛ｨ譚舌・蟶・蜷・・',
        check: (s, list) => list.length >= 50
    },
    {
        id: 'achieve_100_chores',
        name: '逋ｾ謌ｦ骭ｬ逎ｨ縺ｮ螳ｶ莠句､ｧ蜉溽ｸｾ',
        desc: '螳ｶ莠九・邏ｯ險郁ｨ倬鹸謨ｰ縺・00蝗槭↓蛻ｰ驕・,
        icon: '荘',
        reward: '糖 蜿､莉｣遏ｳ譚ｿ繧ｴ繝ｼ繝ｫ繝臥音陬ｽ繧ｹ繧ｿ繝ｳ繝・,
        check: (s, list) => list.length >= 100
    },
    {
        id: 'achieve_early_morning',
        name: '辷ｽ繧・°縺ｪ譛晄ｴｻ繝槭せ繧ｿ繝ｼ',
        desc: '譌ｩ譛晢ｼ・:00縲・:59・峨↓螳ｶ莠九ｒ險倬鹸縺吶ｋ',
        icon: '桁',
        reward: '氏 譛昴・繧ｯ繝ｩ繝輔ヨ邏譚舌そ繝・ヨ',
        check: (s, list) => list.some(c => {
            const h = new Date(c.time).getHours();
            return h >= 5 && h < 8;
        })
    },
    {
        id: 'achieve_night_patrol',
        name: '螟懆ｭｦ縺ｮ蜍､蜍峨↑繧句ｮ医ｊ謇・,
        desc: '豺ｱ螟懶ｼ・3:00縲・:59・峨↓螳ｶ莠九ｒ險倬鹸縺吶ｋ',
        icon: '嫌',
        reward: '氏 螟懊・繧ｯ繝ｩ繝輔ヨ邏譚舌そ繝・ヨ',
        check: (s, list) => list.some(c => {
            const h = new Date(c.time).getHours();
            return h >= 23 || h < 5;
        })
    },
    {
        id: 'achieve_craft_master',
        name: '縺企Κ螻九・繧､繝ｳ繝・Μ繧｢閨ｷ莠ｺ',
        desc: '蟾･謌ｿ縺ｧ螳ｶ蜈ｷ繧・縺､莉･荳翫け繝ｩ繝輔ヨ縺吶ｋ',
        icon: 'ｪ・,
        reward: '醇 閨ｷ莠ｺ縺ｮ驥第ｧ後ヰ繝・ず',
        check: (s) => (s.unlockedFurniture || []).length >= 3
    },
    {
        id: 'achieve_level_10',
        name: '逾槭・＠縺肴怙邨るｲ蛹・,
        desc: '逶ｸ譽偵き繧ｸ繧ｴ繝ｳ縺鍬v.10・育･樒ｫ懊・鬲皮･橸ｼ峨↓蛻ｰ驕・,
        icon: '翠',
        reward: '醇 鮟・≡縺ｮ繧ｫ繧ｸ繧ｴ繝ｳ險伜ｿｵ繝医Ο繝輔ぅ繝ｼ',
        check: () => getLevel() >= 10
    },
    {
        id: 'achieve_hall_of_fame',
        name: '荳紋ｻ｣繧堤ｴ｡縺先楔縺第ｩ・,
        desc: '豁ｴ莉｣谿ｿ蝣ょ・繧顔ｲｾ髴翫′1菴謎ｻ･荳願ｪ慕函',
        icon: '鋤・・,
        reward: '検 豌ｸ邯壹ヱ繝・す繝門刈隴ｷ繧｢繝ｳ繝ｭ繝・け',
        check: (s) => {
            let hallList = [];
            if (typeof getHallOfFameList === 'function') hallList = getHallOfFameList();
            else if (Array.isArray(s.hallOfFame)) hallList = s.hallOfFame;
            return hallList.length >= 1;
        }
    }
];

/**
 * 遘ｰ蜿ｷ縺翫ｈ縺ｳ迚ｹ蛻･螳溽ｸｾ縺ｮ閾ｪ蜍募愛螳夲ｼ・ｧ｣髯､
 */
function checkAchievementsAndTitles() {
    let unlockedNewTitle = false;
    let unlockedNewAchieve = false;

    kajigonState.unlockedTitles = kajigonState.unlockedTitles || [];
    kajigonState.achievements = kajigonState.achievements || {};

    // 1. 遘ｰ蜿ｷ繝√ぉ繝・け
    TITLES_DATA.forEach(t => {
        if (!kajigonState.unlockedTitles.includes(t.id)) {
            if (t.check(kajigonState, completedList)) {
                kajigonState.unlockedTitles.push(t.id);
                unlockedNewTitle = true;
                if (!kajigonState.selectedTitle) {
                    kajigonState.selectedTitle = t.id;
                }
                if (typeof showToast === 'function') {
                    showToast(`事・・譁ｰ縺励＞莠後▽蜷咲ｧｰ蜿ｷ縲・{t.name}縲代ｒ迯ｲ蠕励＠縺ｾ縺励◆・～);
                }
            }
        }
    });

    // 2. 螳溽ｸｾ繝√ぉ繝・け
    ACHIEVEMENTS_DATA.forEach(a => {
        if (!kajigonState.achievements[a.id]) {
            if (a.check(kajigonState, completedList)) {
                kajigonState.achievements[a.id] = Date.now();
                unlockedNewAchieve = true;
                if (typeof showToast === 'function') {
                    showToast(`醇 迚ｹ蛻･螳溽ｸｾ縲・{a.name}縲代ｒ隗｣髯､縺励∪縺励◆・・${a.reward})`);
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
