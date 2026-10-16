// ==========================================================================
// 📰 週刊カジゴン号外ニュース：家事傾向に応じた動的見出し・デザイン生成
// ==========================================================================
function generateWeeklyNewsArticle(weeklyChores) {
    const totalCount = weeklyChores.length;
    let totalExp = 0;
    const choreCounts = {};
    let nightChoreCount = 0;
    let morningChoreCount = 0;

    // 属性ごとの集計
    let fireCount = 0;
    let waterCount = 0;
    let windCount = 0;
    let earthCount = 0;

    weeklyChores.forEach(c => {
        totalExp += (c.gainedExp || 10);
        choreCounts[c.name] = (choreCounts[c.name] || 0) + 1;
        const d = new Date((typeof c.time === 'number') ? c.time : c.time);
        const hour = d.getHours();
        if (hour >= 20 || hour < 4) nightChoreCount++;
        if (hour >= 5 && hour < 10) morningChoreCount++;

        const name = c.name || '';
        const stats = (typeof getChoreStats === 'function') ? getChoreStats(name) : null;
        if (stats && (stats.isSetPack || stats.isFuzzy) && stats.attrBreakdown) {
            if (stats.attrBreakdown.fire > 0) fireCount++;
            if (stats.attrBreakdown.water > 0) waterCount++;
            if (stats.attrBreakdown.wind > 0) windCount++;
            if (stats.attrBreakdown.earth > 0) earthCount++;
        } else if (name.includes('火') || name.includes('料理') || name.includes('ご飯') || name.includes('キッチン') || name.includes('コンロ') || name.includes('夕食')) {
            fireCount++;
        } else if (name.includes('水') || name.includes('皿洗い') || name.includes('風呂') || name.includes('洗面') || name.includes('洗濯') || name.includes('ランドリー')) {
            waterCount++;
        } else if (name.includes('風') || name.includes('換気') || name.includes('ゴミ') || name.includes('掃除機') || name.includes('朝のバタバタ')) {
            windCount++;
        } else {
            earthCount++;
        }
    });

    let topChoreName = "（まだ今週の記録はありません）";
    let topChoreMax = 0;
    Object.keys(choreCounts).forEach(name => {
        if (choreCounts[name] > topChoreMax) {
            topChoreMax = choreCounts[name];
            topChoreName = name;
        }
    });

    // 傾向分析に基づく見出しと社説の自動分岐！
    let bannerTitle = "★ 坂本家・特別号外速報 ★";
    let mainHeadline = "📰 週刊カジゴン通信";
    let editorial = "";
    let themeColor = "#b91c1c";

    if (totalCount === 0) {
        bannerTitle = "★ 坂本家・臨時休刊号 ★";
        mainHeadline = "🏖️ 今週は完全休養ウィーク！";
        editorial = "『たまには家事を忘れて羽を伸ばすのも家族円満の秘訣！カジゴンも巣穴でぬくぬくと充電中である。来週からのリスタートを楽しみに待とう！』";
        themeColor = "#64748b";
    } else if (nightChoreCount >= Math.max(3, totalCount * 0.4)) {
        bannerTitle = "★ 深夜の特命スクープ ★";
        mainHeadline = "🌙 静かなる深夜の勇者たち！ナイトオペレーション大成功";
        editorial = "『家族が寝静まった夜、静寂を切り裂いて行われた数々の見事な整頓！翌朝の家族を笑顔にする、優しき夜行部隊の活躍に全カジゴンが敬礼！』";
        themeColor = "#6366f1";
    } else if (fireCount >= Math.max(3, totalCount * 0.35)) {
        bannerTitle = "★ 美食とキッチンの大勝利 ★";
        mainHeadline = "🍳 食卓防衛戦！胃袋を支えた台所部隊の電撃快挙";
        editorial = "『日々の美味しいご飯と手際よいキッチン整備により、家庭内の士気は最高潮！温かい手料理の魔力が、家計と家族の健康をがっちり守り抜いた！』";
        themeColor = "#ea580c";
    } else if (waterCount >= Math.max(3, totalCount * 0.35)) {
        bannerTitle = "★ 驚異のピカピカ浄化宣言 ★";
        mainHeadline = "🌊 水回り完全平定！カビ＆水滴ゼロの奇跡を達成";
        editorial = "『シンク、風呂、洗面台の輝きがホテルの域に達した！水滴を残さぬ徹底的な浄化魔法により、家中の空気が清流のごとく澄み渡っている！』";
        themeColor = "#0284c7";
    } else if (windCount >= Math.max(3, totalCount * 0.35)) {
        bannerTitle = "★ おうちの治安完全回復 ★";
        mainHeadline = "🌪️ ホコリ帝国を完全鎮圧！疾風のスピード清掃";
        editorial = "『掃除機とゴミ出しの電光石火の連携により、チリひとつない開放空間が完成！窓から吹き込む風の爽快感は過去最高値を記録している！』";
        themeColor = "#16a34a";
    } else if (totalCount >= 20) {
        bannerTitle = "★ 殿堂入り級の超絶偉業 ★";
        mainHeadline = "👑 おうちはもはや神殿！2人の伝説級タッグマッチ";
        editorial = "『息の合った見事な役割分担により、おうちの清潔度と快適さは前人未到の領域へ！この家に住まうことの幸福度は全宇宙トップクラスである！』";
        themeColor = "#d97706";
    } else {
        bannerTitle = "★ 坂本家・特別号外速報 ★";
        mainHeadline = "✨ コツコツの勝利！確かな連携でおうちの平和を護持";
        editorial = "『無理せずマイペースに、お互いを思いやりながら紡いだ1週間。当たり前の日常を美しく保つふたりの優しさに、心からの拍手を贈りたい！』";
        themeColor = "#b91c1c";
    }

    return {
        totalCount,
        totalExp,
        topChoreName,
        topChoreMax,
        nightChoreCount,
        morningChoreCount,
        bannerTitle,
        mainHeadline,
        editorial,
        themeColor
    };
}
