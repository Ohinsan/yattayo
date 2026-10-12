// ==========================================================================
// ⚔️ 突発討伐ボス 20種以上（季節・天候・シチュエーション・名もなき家事）
// ==========================================================================
const EXPANDED_BOUNTY_BOSSES = [
    // --- 📦 日常・名もなき定番ボス ---
    { id: 'cardboard', name: '📦 ダンボールゴーレム', target: '玄関や廊下のダンボール解体・まとめ', exp: 50, attr: 'earth', desc: '通販の箱が溜まりつつある！一気に畳んで撃破せよ！', season: 'all' },
    { id: 'drain', name: '🫧 排水口ヘドロサタン', target: 'キッチンか風呂の排水口ネット交換＆掃除', exp: 45, attr: 'water', desc: 'ヌメリの魔王が潜んでいる！新しいネットを張って清めよ！', season: 'all' },
    { id: 'shampoo', name: '🧴 詰め替えキメラ', target: 'シャンプー・ハンドソープの補充', exp: 35, attr: 'water', desc: 'ボトルが軽くなっている！最後の一滴が出る前に満タンにせよ！', season: 'all' },
    { id: 'toilet_core', name: '🧻 芯ファントム', target: 'トイレットペーパーの芯回収＆新しいペーパー装着', exp: 30, attr: 'wind', desc: 'ホルダーの上に置き去りにされた芯を成仏させよ！', season: 'all' },
    { id: 'vent_dust', name: '🌪️ 換気扇ホコリバード', target: '換気扇や通気口のホコリ取り・拭き掃除', exp: 60, attr: 'wind', desc: '見えざるホコリの怪鳥！サッと拭き取って爽やかな風を呼べ！', season: 'all' },
    { id: 'sponge', name: '🧽 スポンジ老朽ナイト', target: 'キッチンスポンジの交換または熱湯消毒', exp: 35, attr: 'fire', desc: '使い古したスポンジを新調して、シンクの魔力を高めよ！', season: 'all' },
    { id: 'icebox_check', name: '🧊 賞味期限シャドウ', target: '冷蔵庫のドレッシングや奥の食材チェック', exp: 40, attr: 'fire', desc: '奥に眠る怪しい調味料を点検し、安全な庫内を取り戻せ！', season: 'all' },

    // --- ☔ 雨天・湿気・梅雨ボス ---
    { id: 'laundry_specter', name: '☔ 部屋干し生乾きスペクター', target: 'サーキュレーター起動・風通し・部屋干し間隔の確保', exp: 50, attr: 'wind', desc: '湿気と生乾き臭をまき散らす亡霊！風の魔法で吹き飛ばせ！', season: 'rain' },
    { id: 'shoe_damp', name: '👞 靴箱モイスチャーデーモン', target: '下駄箱の換気・乾燥剤チェック・靴底の汚れ落とし', exp: 45, attr: 'earth', desc: '湿気を吸った靴箱の奥に潜む悪魔！扉を開けて空気を入れ替えよ！', season: 'rain' },
    { id: 'bath_pink', name: '🧼 風呂床ピンクバイオレット', target: '浴室の床や四隅のブラシ洗い・水切りワイパーがけ', exp: 45, attr: 'water', desc: 'うっすら現れるピンクの兆候！スポンジとシャワーで先手必勝！', season: 'rain' },

    // --- 🌞 夏・換気・油・灼熱ボス ---
    { id: 'ac_filter', name: '🌞 エアコンフィルターの砂塵魔神', target: 'エアコンフィルターの掃除機がけ＆水洗い乾燥', exp: 65, attr: 'wind', desc: '目詰まりしたホコリが冷暖房効率を奪う！爽快エアを取り戻せ！', season: 'summer' },
    { id: 'trash_can_wash', name: '🗑️ 生ゴミペール異臭タイラント', target: 'ゴミ箱の丸洗い・除菌アルコール拭き・消臭シート交換', exp: 55, attr: 'fire', desc: '夏の熱気で目覚める腐臭の暴君！アルコールスプレーで封印せよ！', season: 'summer' },
    { id: 'fan_dust', name: '🌀 扇風機・サーキュレーターの羽根亡霊', target: 'ファンのカバー外しと羽根の拭き掃除', exp: 45, attr: 'wind', desc: '羽根の縁にびっしり張り付いた埃の鎧を剥ぎ取れ！', season: 'summer' },

    // --- 🍂 季節の変わり目・収納・秋ボス ---
    { id: 'closet_wyvern', name: '🍂 衣替えカオスワイバーン', target: 'クローゼットの不要服整理・季節服の入れ替え', exp: 70, attr: 'earth', desc: '着ない服の山から生まれる巨竜！ハンガーを整えて空間を解放せよ！', season: 'autumn' },
    { id: 'curtain_dust', name: '🪟 カーテンレール微粉末スライム', target: '高いところのカーテンレール＆ブラインドの拭き掃除', exp: 50, attr: 'wind', desc: '普段見えない頭上に積もる粉塵スライムをクイックルで一網打尽！', season: 'autumn' },

    // --- 🧽 水回り・鏡・洗面・水ボス ---
    { id: 'mirror_scale', name: '🪞 鏡のウロコナイト', target: '洗面所・お風呂の鏡のクエン酸パック・ウロコ磨き', exp: 50, attr: 'water', desc: '白く曇った水垢の甲冑を着た騎士！クエン酸の輝きで鏡面を取り戻せ！', season: 'all' },
    { id: 'faucet_shine', name: '🚰 蛇口くもりガーゴイル', target: '蛇口の根元・カルキの結晶削り・ピカピカ乾拭き', exp: 40, attr: 'water', desc: '水栓の輝きを奪うガーゴイル！クロスで磨いてダイヤモンドの光を！', season: 'all' },
    { id: 'washer_lint', name: '🧺 洗濯機くず取りポケットインプ', target: '洗濯槽のゴミ取りネット掃除・フチの埃拭き', exp: 35, attr: 'water', desc: '毎日の洗濯で溜まった繊維の小悪魔をサッと取り除け！', season: 'all' },

    // --- 🍳 キッチン・家電・火ボス ---
    { id: 'fish_grill', name: '🍳 魚焼きグリル焦げドラゴン', target: '魚焼きグリル・受け皿の重曹つけ置き＆焦げ落とし', exp: 60, attr: 'fire', desc: '頑固な油と焦げの鱗をまとった黒竜！温水と重曹の海に沈めよ！', season: 'all' },
    { id: 'microwave_stain', name: '📡 電子レンジ油膜ベヒモス', target: 'レンジ庫内の重曹水スチームチン＆拭き掃除', exp: 45, attr: 'fire', desc: '温め破裂の跡がこびりついた庫内をピカピカにリフレッシュ！', season: 'all' },
    { id: 'toaster_crumb', name: '🍞 トースターパンくずグレムリン', target: 'トースターの底皿引き出し・パンくず掃き出し', exp: 35, attr: 'fire', desc: '底に溜まった焦げくずを捨てて、火災予防と朝の美味しさを守れ！', season: 'all' },

    // --- 📦 定期・冷凍庫・冬ボス ---
    { id: 'freezer_mammoth', name: '🧊 冷凍庫の化石マンモス', target: '奥底に眠る冷凍食材・いつ開けたか不明な保冷剤の整理', exp: 50, attr: 'water', desc: '霜柱に閉ざされた古代の冷凍食品を救出し、庫内スペースを蘇生せよ！', season: 'winter' },
    { id: 'kettle_scale', name: '🫖 電気ケトル白斑リヴァイアサン', target: 'ケトルのクエン酸煮沸洗浄＆すすぎ', exp: 40, attr: 'fire', desc: '底にこびりついた白い結晶をクエン酸一撃でピカピカ透明に！', season: 'winter' },
    { id: 'mat_wash', name: '🚪 玄関＆バスマット一斉ウォッシュ', target: '玄関マット・キッチンマット・トイレマットの一掃洗濯', exp: 55, attr: 'earth', desc: '日々の足元を支えてくれた布防具たちを太陽の元で洗濯せよ！', season: 'all' }
];
