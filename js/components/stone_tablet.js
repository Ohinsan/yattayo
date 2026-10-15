// ==========================================================================
// 📜 古代の石板画像生成（Canvas Generator）＆ 共有システム
// ==========================================================================

let currentAncientBlob = null;

function openAncientScrollModal() {
    if (typeof SoundEngine !== 'undefined') SoundEngine.playSE('click');
    const modal = document.getElementById('ancient-scroll-modal');
    const loading = document.getElementById('ancient-loading');
    const previewImg = document.getElementById('ancient-preview-img');

    if (!modal) return;
    modal.classList.remove('hidden');
    if (loading) loading.style.display = 'block';
    if (previewImg) previewImg.style.display = 'none';

    setTimeout(() => {
        generateAncientCardCanvas().then(blob => {
            currentAncientBlob = blob;
            const url = URL.createObjectURL(blob);
            if (previewImg) {
                previewImg.src = url;
                previewImg.style.display = 'block';
            }
            if (loading) loading.style.display = 'none';
        }).catch(err => {
            console.error("Canvas generation failed:", err);
            if (loading) loading.textContent = "石板の生成に失敗しました。";
        });
    }, 100);
}

function closeAncientScrollModal() {
    if (typeof SoundEngine !== 'undefined') SoundEngine.playSE('click');
    const modal = document.getElementById('ancient-scroll-modal');
    if (modal) modal.classList.add('hidden');
}

function saveAncientScrollImage() {
    if (typeof SoundEngine !== 'undefined') SoundEngine.playSE('click');
    if (!currentAncientBlob) return;
    const todayStr = getTodayDateString();
    const a = document.createElement('a');
    a.href = URL.createObjectURL(currentAncientBlob);
    a.download = `kajigon_ancient_scroll_${todayStr}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    alert('古代の石板画像を保存しました！');
}

function shareAncientScrollImage() {
    if (typeof SoundEngine !== 'undefined') SoundEngine.playSE('click');
    if (!currentAncientBlob) return;
    const todayStr = getTodayDateString();
    const file = new File([currentAncientBlob], `kajigon_ancient_scroll_${todayStr}.png`, { type: 'image/png' });

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
        navigator.share({
            title: '古代の家事碑文 - カジゴン',
            text: '今日のおうちの家事記録（古代の碑文）です！',
            files: [file]
        }).catch(err => {
            if (err.name !== 'AbortError') {
                saveAncientScrollImage();
            }
        });
    } else {
        saveAncientScrollImage();
    }
}

async function generateAncientCardCanvas() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    const width = 800;
    const todayStr = getTodayDateString();
    const doneNames = Array.from(new Set(
        completedList
            .filter(c => getDateKey(c.time) === todayStr)
            .map(c => c.name)
    ));

    const shareIncludeUndoneEl = document.getElementById('shareIncludeUndone');
    const includeUndone = shareIncludeUndoneEl ? shareIncludeUndoneEl.checked : true;

    const base = BASE_TEMPLATES[currentLayout] || [];
    const allTemplateChores = [];
    base.forEach(section => {
        const customName = customRoomNames[section.id] || section.defaultName;
        section.chores.forEach(chore => {
            const fullName = section.id === 'trash' ? chore : `${customName}：${chore}`;
            allTemplateChores.push(fullName);
        });
    });

    const undoneNames = includeUndone ? allTemplateChores.filter(n => !doneNames.includes(n)) : [];
    const message = document.getElementById('shareMessage') ? document.getElementById('shareMessage').value.trim() : '';
    const spell = generateSpellText();
    const currentLv = getLevel();
    const evolved = getEvolvedForm();

    let calculatedHeight = 440;
    calculatedHeight += Math.max(1, doneNames.length) * 32 + 50;
    if (includeUndone && undoneNames.length > 0) {
        calculatedHeight += undoneNames.length * 28 + 50;
    }
    if (message) {
        calculatedHeight += 80;
    }
    calculatedHeight += 120;
    calculatedHeight = Math.max(760, calculatedHeight);

    const envKey = kajigonState.environmentTheme || 'classic';
    const envTheme = ENVIRONMENT_THEMES[envKey] || ENVIRONMENT_THEMES['classic'];
    const cvColors = envTheme.canvas;

    canvas.width = width;
    canvas.height = calculatedHeight;

    // 1. 背景石板描画
    ctx.fillStyle = cvColors.base;
    ctx.fillRect(0, 0, width, calculatedHeight);

    // テクスチャ
    ctx.fillStyle = cvColors.grain;
    for (let i = 0; i < 400; i++) {
        const rx = (i * 97) % width;
        const ry = (i * 137) % calculatedHeight;
        const rw = (i % 5) + 2;
        const rh = (i % 3) + 2;
        ctx.fillRect(rx, ry, rw, rh);
    }

    // 枠線
    ctx.strokeStyle = cvColors.borderOuter;
    ctx.lineWidth = 14;
    ctx.strokeRect(7, 7, width - 14, calculatedHeight - 14);

    ctx.strokeStyle = cvColors.borderInner;
    ctx.lineWidth = 4;
    ctx.strokeRect(20, 20, width - 40, calculatedHeight - 40);

    const cornerSize = 24;
    ctx.fillStyle = cvColors.corner;
    ctx.fillRect(20, 20, cornerSize, cornerSize);
    ctx.fillRect(width - 20 - cornerSize, 20, cornerSize, cornerSize);
    ctx.fillRect(20, calculatedHeight - 20 - cornerSize, cornerSize, cornerSize);
    ctx.fillRect(width - 20 - cornerSize, calculatedHeight - 20 - cornerSize, cornerSize, cornerSize);

    // 2. ヘッダー
    ctx.fillStyle = cvColors.titleText;
    ctx.font = 'bold 30px "DotGothic16", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`◆ 古代の家事碑文 [${envTheme.name}] ◆`, width / 2, 65);

    ctx.fillStyle = '#a0a0b0';
    ctx.font = '16px "DotGothic16", monospace';
    ctx.fillText(`- KAJIGON CHRONICLE -  ${todayStr}  (${envTheme.icon} ${envTheme.boostLabel})`, width / 2, 95);

    ctx.strokeStyle = '#3a3a4c';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(40, 115);
    ctx.lineTo(width - 40, 115);
    ctx.stroke();

    // 3. カジゴン相棒表示
    const avatarBoxX = 50;
    const avatarBoxY = 135;
    const avatarBoxSize = 130;

    ctx.fillStyle = '#12121c';
    ctx.fillRect(avatarBoxX, avatarBoxY, avatarBoxSize, avatarBoxSize);
    ctx.strokeStyle = '#8b5a2b';
    ctx.lineWidth = 3;
    ctx.strokeRect(avatarBoxX, avatarBoxY, avatarBoxSize, avatarBoxSize);

    let avatarDrawn = false;
    let avatarImgSrc = "";
    if (currentLv <= 2) {
        avatarImgSrc = "";
    } else if (currentLv <= 5) {
        avatarImgSrc = "images/spirits/kajigon_baby.png";
    } else if (currentLv <= 9) {
        const teenMap = {
            volcano: 'images/spirits/teen_fire.png',
            abyss: 'images/spirits/teen_water.png',
            sky: 'images/spirits/teen_wind.png',
            earth: 'images/spirits/teen_earth.png',
            classic: 'images/spirits/teen_light.png',
            gameboy: 'images/spirits/teen_retro.png'
        };
        avatarImgSrc = teenMap[envKey] || 'images/spirits/teen_light.png';
    } else {
        avatarImgSrc = evolved.file;
    }

    if (avatarImgSrc) {
        try {
            const img = new Image();
            img.src = avatarImgSrc;
            await new Promise((resolve) => {
                img.onload = () => {
                    ctx.drawImage(img, avatarBoxX + 10, avatarBoxY + 10, avatarBoxSize - 20, avatarBoxSize - 20);
                    avatarDrawn = true;
                    resolve();
                };
                img.onerror = () => resolve();
            });
        } catch (e) {
            avatarDrawn = false;
        }
    }

    if (!avatarDrawn) {
        ctx.font = '60px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(getCompanionEmoji(), avatarBoxX + avatarBoxSize / 2, avatarBoxY + avatarBoxSize / 2 + 22);
    }

    // ステータス詳細
    const infoX = 205;
    ctx.textAlign = 'left';

    // 🏆 二つ名称号
    let titleStr = '';
    if (kajigonState.selectedTitle && typeof TITLES_DATA !== 'undefined' && TITLES_DATA[kajigonState.selectedTitle]) {
        const tObj = TITLES_DATA[kajigonState.selectedTitle];
        titleStr = `【${tObj.icon}${tObj.name}】`;
    }

    const companionDisplayName = kajigonState.companionName || 'カジゴン';
    const companionName = currentLv >= 10 ? `${evolved.name} (${companionDisplayName})` : `${companionDisplayName} (Lv.${currentLv})`;

    if (titleStr) {
        ctx.fillStyle = '#fbbf24';
        ctx.font = 'bold 15px "DotGothic16", sans-serif';
        ctx.fillText(titleStr, infoX, 160);

        ctx.fillStyle = '#f4ede2';
        ctx.font = 'bold 22px "DotGothic16", sans-serif';
        ctx.fillText(companionName, infoX, 186);
    } else {
        ctx.fillStyle = '#f4ede2';
        ctx.font = 'bold 24px "DotGothic16", sans-serif';
        ctx.fillText(companionName, infoX, 172);
    }

    ctx.font = '16px "DotGothic16", sans-serif';
    ctx.fillStyle = '#f59e0b';
    ctx.fillText(`経験値: ${kajigonState.totalExp} EXP  |  古代パーツ: ⚙️×${kajigonState.artifactCount}`, infoX, 212);

    ctx.fillStyle = '#a0a0b0';
    ctx.font = '14px "DotGothic16", sans-serif';
    ctx.fillText(`🔥火:${kajigonState.firePoints}  💧水:${kajigonState.waterPoints}  🍃風:${kajigonState.windPoints}  🪵土:${kajigonState.earthPoints}`, infoX, 240);

    let curY = 300;

    // 4. 達成家事セクション
    ctx.fillStyle = '#10b981';
    ctx.font = 'bold 20px "DotGothic16", sans-serif';
    ctx.fillText('📜 本日の奉納（達成した家事）', 50, curY);
    curY += 15;

    ctx.strokeStyle = '#2d4a3e';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(50, curY);
    ctx.lineTo(width - 50, curY);
    ctx.stroke();
    curY += 26;

    let mvpChoreName = "";
    let maxPt = 0;
    doneNames.forEach(name => {
        const stats = getChoreStats(name);
        if (stats.pt > maxPt) {
            maxPt = stats.pt;
            mvpChoreName = name;
        }
    });

    if (doneNames.length === 0) {
        ctx.fillStyle = '#a0a0b0';
        ctx.font = '16px "DotGothic16", sans-serif';
        ctx.fillText('・（まだ家事の記録はありません）', 60, curY);
        curY += 30;
    } else {
        ctx.font = '17px "DotGothic16", sans-serif';
        doneNames.forEach(name => {
            const isMvp = (name === mvpChoreName && maxPt >= 3);
            ctx.fillStyle = isMvp ? '#ffd700' : '#34d399';
            ctx.fillText(isMvp ? '👑' : '✔', 60, curY);
            ctx.fillStyle = '#f4ede2';
            ctx.fillText(isMvp ? `${name} (本日の大功績！)` : name, 85, curY);
            curY += 30;
        });
    }

    // 5. 未完了家事
    if (includeUndone && undoneNames.length > 0) {
        curY += 15;
        ctx.fillStyle = '#e2e8f0';
        ctx.font = 'bold 18px "DotGothic16", sans-serif';
        ctx.fillText('⬜ これからやること', 50, curY);
        curY += 15;

        ctx.strokeStyle = '#3a3a4c';
        ctx.beginPath();
        ctx.moveTo(50, curY);
        ctx.lineTo(width - 50, curY);
        ctx.stroke();
        curY += 24;

        ctx.font = '15px "DotGothic16", sans-serif';
        ctx.fillStyle = '#94a3b8';
        undoneNames.forEach(name => {
            ctx.fillText(`・${name}`, 65, curY);
            curY += 26;
        });
    }

    // 献立
    const dinnerMenuEl = document.getElementById('shareDinnerMenu');
    const dinnerMenu = dinnerMenuEl ? dinnerMenuEl.value.trim() : '';
    if (dinnerMenu) {
        curY += 15;
        ctx.fillStyle = '#1c1712';
        ctx.fillRect(50, curY, width - 100, 56);
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2;
        ctx.strokeRect(50, curY, width - 100, 56);

        ctx.fillStyle = '#fbbf24';
        ctx.font = 'bold 15px "DotGothic16", sans-serif';
        ctx.fillText('🍳 本日の献立・ごはん:', 65, curY + 22);

        ctx.fillStyle = '#fde68a';
        ctx.font = '16px "DotGothic16", sans-serif';
        ctx.fillText(dinnerMenu, 65, curY + 44);
        curY += 66;
    }

    // 伝言
    if (message) {
        curY += 15;
        ctx.fillStyle = '#1a1926';
        ctx.fillRect(50, curY, width - 100, 65);
        ctx.strokeStyle = cvColors.borderInner;
        ctx.lineWidth = 2;
        ctx.strokeRect(50, curY, width - 100, 65);

        ctx.fillStyle = '#fbbf24';
        ctx.font = 'bold 15px "DotGothic16", sans-serif';
        ctx.fillText('💬 家族への伝言:', 65, curY + 24);

        ctx.fillStyle = '#f4ede2';
        ctx.font = '16px "DotGothic16", sans-serif';
        ctx.fillText(message, 65, curY + 48);
        curY += 75;
    }

    // フッター
    curY += 25;
    ctx.strokeStyle = '#3a3a4c';
    ctx.beginPath();
    ctx.moveTo(40, curY);
    ctx.lineTo(width - 40, curY);
    ctx.stroke();
    curY += 30;

    ctx.textAlign = 'center';
    ctx.fillStyle = '#a0a0b0';
    ctx.font = '14px "DotGothic16", monospace';
    ctx.fillText(`古代の封印キー [同期]: ${spell}`, width / 2, curY);

    curY += 22;
    ctx.fillStyle = '#71717a';
    ctx.font = '12px "DotGothic16", sans-serif';
    ctx.fillText('✨ カジゴン - RPG家事分担システム ✨', width / 2, curY);

    // 🌟 古代石板特製ゴールドスタンプ（印章）描画
    const completedAchieveCount = kajigonState.achievements ? Object.values(kajigonState.achievements).filter(a => a && a.completed).length : 0;
    const hasHallOfFame = Array.isArray(kajigonState.hallOfFame) && kajigonState.hallOfFame.length > 0;
    const hasStamp = completedAchieveCount > 0 || hasHallOfFame || currentLv >= 10;

    if (hasStamp) {
        ctx.save();
        const stampX = width - 100;
        const stampY = calculatedHeight - 85;
        ctx.translate(stampX, stampY);
        ctx.rotate(-10 * Math.PI / 180);

        // 外枠の円（ゴールド二重枠）
        ctx.strokeStyle = 'rgba(245, 158, 11, 0.85)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 0, 42, 0, Math.PI * 2);
        ctx.stroke();

        // 内側の点線円
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = 'rgba(251, 191, 36, 0.8)';
        ctx.setLineDash([4, 3]);
        ctx.beginPath();
        ctx.arc(0, 0, 36, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);

        // スタンプ印字
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = 'rgba(251, 191, 36, 0.95)';
        ctx.font = 'bold 10px "DotGothic16", sans-serif';
        ctx.fillText('★ HOUSE MASTER ★', 0, -20);

        ctx.fillStyle = '#ffd700';
        ctx.font = 'bold 15px "DotGothic16", sans-serif';
        ctx.fillText('【認定之印】', 0, -1);

        ctx.fillStyle = 'rgba(251, 191, 36, 0.9)';
        ctx.font = 'bold 10px "DotGothic16", sans-serif';
        const stampSub = hasHallOfFame ? '殿堂名家' : `功績: ${completedAchieveCount}冠`;
        ctx.fillText(stampSub, 0, 18);

        ctx.restore();
    }

    return new Promise(resolve => {
        canvas.toBlob(blob => resolve(blob), 'image/png');
    });
}
