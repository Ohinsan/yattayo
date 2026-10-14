// ==========================================================================
// --- 📰 週刊カジゴン号外ニュース (案5) ---
// ==========================================================================
function openWeeklyNewsModal() {
    SoundEngine.playSE('click');
    const container = document.getElementById('weekly-news-content');
    if (!container) return;

    const now = Date.now();
    const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
    const weeklyChores = completedList.filter(c => {
        const time = (typeof c.time === 'number') ? c.time : new Date(c.time).getTime();
        return time >= sevenDaysAgo;
    });

    const article = (typeof generateWeeklyNewsArticle === 'function') 
        ? generateWeeklyNewsArticle(weeklyChores)
        : {
            totalCount: weeklyChores.length,
            totalExp: weeklyChores.reduce((s, c) => s + (c.gainedExp || 10), 0),
            topChoreName: "（記録なし）",
            topChoreMax: 0,
            nightChoreCount: 0,
            bannerTitle: "★ 坂本家・特別号外速報 ★",
            mainHeadline: "📰 週刊カジゴン通信",
            editorial: "『コツコツと確かな歩み！おうちの平和は守られた！』",
            themeColor: "#b91c1c"
        };

    const todayDate = new Date().toLocaleDateString('ja-JP');

    container.innerHTML = `
        <div class="weekly-news-paper" id="weekly-news-paper-element">
            <div class="weekly-news-header" style="border-bottom: 3px double ${article.themeColor};">
                <div>
                    <div style="font-size: 11px; color: ${article.themeColor}; font-weight: 900; letter-spacing: 1px;">${article.bannerTitle}</div>
                    <div class="weekly-news-maintitle">${article.mainHeadline}</div>
                </div>
                <div class="weekly-news-date">発行日: ${todayDate}</div>
            </div>

            <div class="weekly-news-stats-grid">
                <div class="weekly-stat-box">
                    <div class="weekly-stat-val">${article.totalCount} <span style="font-size:12px;">回</span></div>
                    <div class="weekly-stat-lbl">今週の家事達成数</div>
                </div>
                <div class="weekly-stat-box">
                    <div class="weekly-stat-val">+${article.totalExp} <span style="font-size:12px;">EXP</span></div>
                    <div class="weekly-stat-lbl">家庭内総獲得EXP</div>
                </div>
            </div>

            <div class="weekly-highlight-section">
                <div class="weekly-highlight-title" style="color: ${article.themeColor};">👑 今週の最多討伐王（MVP家事）</div>
                <div class="weekly-highlight-item">${article.topChoreName} ${article.topChoreMax > 0 ? `（計 ${article.topChoreMax} 回達成！）` : ''}</div>
            </div>

            ${article.nightChoreCount > 0 ? `
            <div class="weekly-highlight-section" style="border-left: 3px solid #8b5cf6;">
                <div class="weekly-highlight-title" style="color:#6d28d9;">🌙 電撃ナイトファインプレー</div>
                <div class="weekly-highlight-item">夜遅くの家事：計 ${article.nightChoreCount} 回 （寝る前のリセット大感謝！）</div>
            </div>
            ` : ''}

            <div class="weekly-editorial" style="border-left-color: ${article.themeColor};">
                <strong>🐉 カジゴン記者の一言社説：</strong><br>
                ${article.editorial}
            </div>
        </div>
    `;

    document.getElementById('weekly-news-modal').classList.remove('hidden');
}

function closeWeeklyNewsModal() {
    SoundEngine.playSE('click');
    document.getElementById('weekly-news-modal').classList.add('hidden');
}

async function shareWeeklyNewsCard() {
    SoundEngine.playSE('click');
    const width = 640;
    const height = 760;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    // Newspaper background
    ctx.fillStyle = '#fbf0d9';
    ctx.fillRect(0, 0, width, height);

    // Double borders
    ctx.strokeStyle = '#2b2b2b';
    ctx.lineWidth = 6;
    ctx.strokeRect(15, 15, width - 30, height - 30);
    ctx.lineWidth = 2;
    ctx.strokeRect(23, 23, width - 46, height - 46);

    // Header
    ctx.textAlign = 'center';
    ctx.fillStyle = '#b91c1c';
    ctx.font = 'bold 16px "DotGothic16", sans-serif';
    ctx.fillText('★ 坂本家・家庭内特別号外速報 ★', width / 2, 60);

    ctx.fillStyle = '#1a1a24';
    ctx.font = '900 32px "DotGothic16", sans-serif';
    ctx.fillText('📰 週刊カジゴン通信', width / 2, 105);

    ctx.strokeStyle = '#2b2b2b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(35, 125);
    ctx.lineTo(width - 35, 125);
    ctx.stroke();

    // Date
    ctx.textAlign = 'right';
    ctx.fillStyle = '#555';
    ctx.font = '14px "DotGothic16", sans-serif';
    ctx.fillText(`発行日: ${new Date().toLocaleDateString('ja-JP')}`, width - 40, 150);

    // Weekly Stats Box
    const now = Date.now();
    const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
    const weeklyChores = completedList.filter(c => {
        const time = (typeof c.time === 'number') ? c.time : new Date(c.time).getTime();
        return time >= sevenDaysAgo;
    });

    const totalCount = weeklyChores.length;
    let totalExp = 0;
    const choreCounts = {};
    weeklyChores.forEach(c => {
        totalExp += (c.gainedExp || 10);
        choreCounts[c.name] = (choreCounts[c.name] || 0) + 1;
    });
    let topChoreName = "（まだ今週の記録はありません）";
    let topChoreMax = 0;
    Object.keys(choreCounts).forEach(name => {
        if (choreCounts[name] > topChoreMax) {
            topChoreMax = choreCounts[name];
            topChoreName = name;
        }
    });

    // Draw Stats
    ctx.fillStyle = '#fff';
    ctx.fillRect(40, 175, width - 80, 95);
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.strokeRect(40, 175, width - 80, 95);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#777';
    ctx.font = '14px "DotGothic16", sans-serif';
    ctx.fillText('今週の家事総達成数', 180, 205);
    ctx.fillText('家庭内総獲得EXP', width - 180, 205);

    ctx.fillStyle = '#b91c1c';
    ctx.font = 'bold 36px "DotGothic16", sans-serif';
    ctx.fillText(`${totalCount} 回`, 180, 250);
    ctx.fillText(`+${totalExp} EXP`, width - 180, 250);

    // MVP Chore
    ctx.fillStyle = '#fff';
    ctx.fillRect(40, 295, width - 80, 90);
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.strokeRect(40, 295, width - 80, 90);

    ctx.textAlign = 'left';
    ctx.fillStyle = '#1e3a8a';
    ctx.font = 'bold 17px "DotGothic16", sans-serif';
    ctx.fillText('👑 今週の最多討伐王（MVP家事）', 60, 325);

    ctx.fillStyle = '#111';
    ctx.font = 'bold 20px "DotGothic16", sans-serif';
    ctx.fillText(`${topChoreName} ${topChoreMax > 0 ? `(計 ${topChoreMax} 回)` : ''}`, 60, 360);

    // Companion Avatar Box
    const companionY = 415;
    ctx.fillStyle = '#f4e5c8';
    ctx.fillRect(40, companionY, width - 80, 155);
    ctx.strokeStyle = '#8b5a2b';
    ctx.lineWidth = 2;
    ctx.strokeRect(40, companionY, width - 80, 155);

    ctx.textAlign = 'center';
    ctx.font = '54px sans-serif';
    ctx.fillText(getCompanionEmoji(), 110, companionY + 90);

    ctx.textAlign = 'left';
    ctx.fillStyle = '#8b5a2b';
    ctx.font = 'bold 16px "DotGothic16", sans-serif';
    ctx.fillText('🐉 カジゴン記者の一言社説：', 180, companionY + 40);

    let editorial = "『今週もおうちを支えてくれて本当にありがとう！素晴らしい連携に最大の敬意を！今夜は乾杯だ！』";
    if (totalCount >= 20) {
        editorial = "『今週は伝説級の神殿！2人の奮闘であらゆる汚れが一掃された！文句なしの大殊勲である！』";
    } else if (totalCount === 0) {
        editorial = "『今週はのんびり休息ウィーク！たまには家事を忘れて羽を伸ばすのも大切だぞ！』";
    }

    ctx.fillStyle = '#222';
    ctx.font = '16px "DotGothic16", sans-serif';
    ctx.fillText(editorial.slice(0, 24), 180, companionY + 75);
    if (editorial.length > 24) {
        ctx.fillText(editorial.slice(24), 180, companionY + 105);
    }

    // Footer
    ctx.textAlign = 'center';
    ctx.fillStyle = '#555';
    ctx.font = '14px "DotGothic16", sans-serif';
    ctx.fillText('✨ 坂本家 家事分担プロジェクト - 週刊カジゴン号外 ✨', width / 2, height - 50);

    canvas.toBlob(blob => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `kajigon_weekly_news_${new Date().toISOString().slice(0, 10)}.png`;
        a.click();
        URL.revokeObjectURL(url);
    }, 'image/png');
}

