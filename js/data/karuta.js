// ==========================================================================
// 🥠 家事かるた・おみくじ（全52種 ＋ レア「虹色ウルトラ大吉」）
// ==========================================================================
const EXPANDED_KARUTA_LIST = [
    // --- 🌈 超レアかるた（虹色・超大吉・特吉） ---
    { id: 'k_rainbow_1', rank: '🌈 虹色ウルトラ大吉', text: '「ふたりで暮らすこの家が、宇宙でいちばん心地いい！」最高の愛と調和！', rarity: 'ultra' },
    { id: 'k_rainbow_2', rank: '🌈 虹色ウルトラ大吉', text: '「名もなき家事の積み重ね、神仏も思わずスタンディングオベーション！」', rarity: 'ultra' },
    { id: 'k_rainbow_3', rank: '👑 超大吉', text: '「今日のあなたは家事の神！お風呂のお湯加減と室温が神域に達する！」', rarity: 'rare' },
    { id: 'k_rainbow_4', rank: '💖 特吉', text: '「パートナーが背中でそっと『いつもありがとう』と呟いた気がする！」', rarity: 'rare' },
    { id: 'k_rainbow_5', rank: '🌟 超大吉', text: '「すべてのタオルが柔軟剤の奇跡でホテルの雲のようにふわふわになった！」', rarity: 'rare' },

    // --- 🎉 大吉（日常の爽快・大成功） ---
    { id: 'k_daikichi_1', rank: '🎉 大吉', text: '「靴下の裏返しが1発で直った！指先の神業！」', rarity: 'common' },
    { id: 'k_daikichi_2', rank: '🔥 大吉', text: '「フライパンの焦げ付きがツルンと剥がれて大勝利！」', rarity: 'common' },
    { id: 'k_daikichi_3', rank: '🛁 大吉', text: '「お風呂掃除後の1番風呂、極上の整いが約束された！」', rarity: 'common' },
    { id: 'k_daikichi_4', rank: '✨ 大吉', text: '「ゴミ出しに出た瞬間、収集車が目の前に到着！完璧なタイミング！」', rarity: 'common' },
    { id: 'k_daikichi_5', rank: '🍖 大吉', text: '「夕飯の味付け、目分量なのにミシュラン級の黄金比が決まる！」', rarity: 'common' },
    { id: 'k_daikichi_6', rank: '🪟 大吉', text: '「窓を拭き終えた瞬間に澄んだ青空と太陽光が部屋を満たした！」', rarity: 'common' },
    { id: 'k_daikichi_7', rank: '🧺 大吉', text: '「干した洗濯物が夕方までにカラッと完璧に乾ききった！」', rarity: 'common' },
    { id: 'k_daikichi_8', rank: '🧽 大吉', text: '「シンクのくすみが鏡のように反射して顔が映った！」', rarity: 'common' },

    // --- 🌟 中吉（あるある・うれしい発見） ---
    { id: 'k_chukichi_1', rank: '✨ 中吉', text: '「冷蔵庫の奥から賞味期限内のお宝プリンを発見！」', rarity: 'common' },
    { id: 'k_chukichi_2', rank: '🌟 中吉', text: '「ラップの端っこが迷子にならず、1発で引き出せた！」', rarity: 'common' },
    { id: 'k_chukichi_3', rank: '🎯 中吉', text: '「スーパーの特売卵パックを割らずに無事生還！」', rarity: 'common' },
    { id: 'k_chukichi_4', rank: '🛋️ 中吉', text: '「ソファの下から無くしたと思っていたペンが見つかった！」', rarity: 'common' },
    { id: 'k_chukichi_5', rank: '🥢 中吉', text: '「洗った箸のペアが一発で揃って引き出しに収まった！」', rarity: 'common' },
    { id: 'k_chukichi_6', rank: '🧊 中吉', text: '「製氷機の氷がちょうど満タンで、冷たい麦茶がうまい！」', rarity: 'common' },
    { id: 'k_chukichi_7', rank: '🧴 中吉', text: '「ハンドソープの詰め替え、泡立たずにピッタリ全量入った！」', rarity: 'common' },
    { id: 'k_chukichi_8', rank: '🐈 中吉', text: '「片付けたあとのキレイな床でペット（または相棒）がゴロゴロくつろぐ！」', rarity: 'common' },

    // --- 🍃 吉（ほのぼの・快適な日常） ---
    { id: 'k_kichi_1', rank: '🍃 吉', text: '「洗濯物を干し終えた瞬間に心地よい南風が吹いた！」', rarity: 'common' },
    { id: 'k_kichi_2', rank: '🍀 吉', text: '「コロコロテープが綺麗にミシン目でスパッとちぎれた！」', rarity: 'common' },
    { id: 'k_kichi_3', rank: '🌈 吉', text: '「排水口がピカピカになり、カジゴンが背伸びして喜んでいる！」', rarity: 'common' },
    { id: 'k_kichi_4', rank: '🫖 吉', text: '「家事の一段落に淹れたコーヒーが今日いちばん香り高い！」', rarity: 'common' },
    { id: 'k_kichi_5', rank: '☀️ 吉', text: '「たたんだTシャツがタンスにシンデレラフィットした！」', rarity: 'common' },
    { id: 'k_kichi_6', rank: '🧼 吉', text: '「石鹸をおろしたての日の、あの爽やかな香りに癒やされる！」', rarity: 'common' },
    { id: 'k_kichi_7', rank: '🌱 吉', text: '「観葉植物に水をあげたら、小さな新芽がひょっこり顔を出していた！」', rarity: 'common' },
    { id: 'k_kichi_8', rank: '👟 吉', text: '「玄関の靴を揃えたら、運気がスッと通り抜けるのを感じた！」', rarity: 'common' },
    { id: 'k_kichi_9', rank: '🍙 吉', text: '「握ったおにぎりが驚くほど綺麗な三角に仕上がった！」', rarity: 'common' },

    // --- 💫 小吉（小さな幸せ・感謝） ---
    { id: 'k_shokichi_1', rank: '💫 小吉', text: '「シャンプーの詰め替え、最後の一滴まで出し切った！」', rarity: 'common' },
    { id: 'k_shokichi_2', rank: '🍞 小吉', text: '「食パンの最後の1枚、絶妙なキツネ色に焼き上がった！」', rarity: 'common' },
    { id: 'k_shokichi_3', rank: '🔑 小吉', text: '「出がけに鍵を探さず、定位置からサッと手に取れた！」', rarity: 'common' },
    { id: 'k_shokichi_4', rank: '🧦 小吉', text: '「洗濯ネットのチャックがちゃんと最後まで閉まっていた！」', rarity: 'common' },
    { id: 'k_shokichi_5', rank: '📦 小吉', text: '「届いた荷物のテープが端からペリペリ気持ちよく剥がれた！」', rarity: 'common' },
    { id: 'k_shokichi_6', rank: '🧹 小吉', text: '「クイックルワイパーの裏表を両方しっかり使い切った充実感！」', rarity: 'common' },
    { id: 'k_shokichi_7', rank: '🧅 小吉', text: '「玉ねぎのみじん切り、今日は一滴も涙が出なかった！」', rarity: 'common' },

    // --- 🍵 末吉（クスッと笑える日常あるある・知恵袋） ---
    { id: 'k_suekichi_1', rank: '🍵 末吉', text: '「ゴミ袋の口を縛った直後に丸めたティッシュを発見…あるある！」', rarity: 'common' },
    { id: 'k_suekichi_2', rank: '☕ 末吉', text: '「掃除機をかけたら、行方不明だった靴下の片方が出てきた！」', rarity: 'common' },
    { id: 'k_suekichi_3', rank: '🧻 末吉', text: '「トイレットペーパーの使い終わり、ギリギリ足りた奇跡！」', rarity: 'common' },
    { id: 'k_suekichi_4', rank: '🍲 末吉', text: '「おたまの置き場所に一瞬迷って小皿を出した。偉い！」', rarity: 'common' },
    { id: 'k_suekichi_5', rank: '👕 末吉', text: '「裏返しで干した服を着る時にそのまま表に戻るファインプレー！」', rarity: 'common' },
    { id: 'k_suekichi_6', rank: '🛒 末吉', text: '「買い出しメモを忘れたが、奇跡的に買い忘れゼロで帰還！」', rarity: 'common' },
    { id: 'k_suekichi_7', rank: '🧊 末吉', text: '「冷凍うどんは人類が生んだ最も偉大な家庭の味方である！」', rarity: 'common' },
    { id: 'k_suekichi_8', rank: '🧴 末吉', text: '「リンスとシャンプーを押し間違えそうになったが寸前で回避！」', rarity: 'common' },
    { id: 'k_suekichi_9', rank: '😴 末吉', text: '「家事を全部終えて倒れ込むベッド、全宇宙で一番気持ちいい！」', rarity: 'common' },
    { id: 'k_suekichi_10', rank: '🤝 末吉', text: '「『ありがとう』と声に出すと、おうちの空気がふわっと軽くなる！」', rarity: 'common' },
    { id: 'k_suekichi_11', rank: '🍵 末吉', text: '「今日できなかった家事は明日の自分に託す。それも勇気！」', rarity: 'common' }
];
