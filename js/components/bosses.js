// ==========================================================================
// ⚔️ 突発討伐ボスシステム（★1〜★3 難易度3択 ＆ 1日1回チェンジ機能）
// ==========================================================================

const BOSS_DIFFICULTY_MAP = {
    // ★1 初級（1〜3分の名もなきプチ家事）
    toilet_core: 1,
    shampoo: 1,
    sponge: 1,
    washer_lint: 1,
    toaster_crumb: 1,

    // ★2 中級（5〜10分のしっかり家事）
    cardboard: 2,
    drain: 2,
    icebox_check: 2,
    faucet_shine: 2,
    microwave_stain: 2,
    shoe_damp: 2,
    bath_pink: 2,
    mirror_scale: 2,
    fan_dust: 2,

    // ★3 上級（15分以上の大掃除・休日向け家事）
    vent_dust: 3,
    laundry_specter: 3,
    ac_filter: 3,
    trash_can_wash: 3,
    closet_wyvern: 3,
    curtain_dust: 3,
    fish_grill: 3,
    freezer_mammoth: 3,
    kettle_scale: 3,
    mat_wash: 3
};

/**
 * 今日の3大ボス（★1, ★2, ★3）を取得
 */
function getTodayBountyOptions() {
    const todayStr = getTodayDateString();
    let bountyData = null;
    try {
        const raw = localStorage.getItem('kajigon_bounty_quest_v2');
        bountyData = raw ? JSON.parse(raw) : null;
    } catch (e) {
        bountyData = null;
    }

    const bossList = (typeof EXPANDED_BOUNTY_BOSSES !== 'undefined') ? EXPANDED_BOUNTY_BOSSES : [];

    // 分類
    const tier1 = bossList.filter(b => (BOSS_DIFFICULTY_MAP[b.id] || 2) === 1);
    const tier2 = bossList.filter(b => (BOSS_DIFFICULTY_MAP[b.id] || 2) === 2);
    const tier3 = bossList.filter(b => (BOSS_DIFFICULTY_MAP[b.id] || 2) === 3);

    const changeCount = (bountyData && bountyData.date === todayStr) ? (bountyData.changeCount || 0) : 0;
    const seedOffset = changeCount * 13;

    if (!bountyData || bountyData.date !== todayStr) {
        let seed = 0;
        for (let i = 0; i < todayStr.length; i++) {
            seed = (seed * 31 + todayStr.charCodeAt(i)) >>> 0;
        }

        const b1 = tier1[(seed + seedOffset) % tier1.length];
        const b2 = tier2[(seed + 7 + seedOffset) % tier2.length];
        const b3 = tier3[(seed + 17 + seedOffset) % tier3.length];

        bountyData = {
            date: todayStr,
            bossIds: [b1.id, b2.id, b3.id],
            defeated: false,
            defeatedBossId: null,
            changeCount: 0
        };
        localStorage.setItem('kajigon_bounty_quest_v2', JSON.stringify(bountyData));
    }

    const currentBosses = bountyData.bossIds.map(id => bossList.find(b => b.id === id) || bossList[0]);
    return {
        date: bountyData.date,
        bosses: currentBosses,
        defeated: bountyData.defeated,
        defeatedBossId: bountyData.defeatedBossId,
        changeCount: bountyData.changeCount || 0
    };
}

/**
 * 1日1回のボスチェンジ（再抽選）
 */
function rerollTodayBounties() {
    const data = getTodayBountyOptions();
    if (data.defeated) {
        alert('本日はすでに討伐完了しています！');
        return;
    }
    if (data.changeCount >= 1) {
        alert('ボスのチェンジは1日1回までです！');
        return;
    }

    const todayStr = getTodayDateString();
    const bossList = (typeof EXPANDED_BOUNTY_BOSSES !== 'undefined') ? EXPANDED_BOUNTY_BOSSES : [];
    const tier1 = bossList.filter(b => (BOSS_DIFFICULTY_MAP[b.id] || 2) === 1);
    const tier2 = bossList.filter(b => (BOSS_DIFFICULTY_MAP[b.id] || 2) === 2);
    const tier3 = bossList.filter(b => (BOSS_DIFFICULTY_MAP[b.id] || 2) === 3);

    // 新しいシードで再抽選
    const b1 = tier1[Math.floor(Math.random() * tier1.length)];
    const b2 = tier2[Math.floor(Math.random() * tier2.length)];
    const b3 = tier3[Math.floor(Math.random() * tier3.length)];

    const updated = {
        date: todayStr,
        bossIds: [b1.id, b2.id, b3.id],
        defeated: false,
        defeatedBossId: null,
        changeCount: 1
    };
    localStorage.setItem('kajigon_bounty_quest_v2', JSON.stringify(updated));

    if (typeof SoundEngine !== 'undefined') {
        SoundEngine.playSE('click');
    }

    renderBountyWidget();
    if (typeof showToast === 'function') {
        showToast('🔄 新たな討伐依頼が掲示板に届きました！');
    }
}

/**
 * 討伐達成処理
 */
function defeatSpecificBoss(bossId) {
    const bountyInfo = getTodayBountyOptions();
    if (bountyInfo.defeated) return;

    const bossList = (typeof EXPANDED_BOUNTY_BOSSES !== 'undefined') ? EXPANDED_BOUNTY_BOSSES : [];
    const boss = bossList.find(b => b.id === bossId);
    if (!boss) return;

    const todayStr = getTodayDateString();
    localStorage.setItem('kajigon_bounty_quest_v2', JSON.stringify({
        date: todayStr,
        bossIds: bountyInfo.bosses.map(b => b.id),
        defeated: true,
        defeatedBossId: boss.id,
        changeCount: bountyInfo.changeCount
    }));

    // EXP加算 ＆ 素材ドロップ
    const choreName = `⚔️ 討伐：${boss.name}（${boss.target}）`;
    const id = Date.now();
    let baseExp = boss.exp || 50;

    // 季節家具バフ判定（季節家具があればボスEXP +30%）
    if (kajigonState.unlockedFurniture && kajigonState.unlockedFurniture.some(id => ['sakura', 'furin', 'pumpkin', 'kotatsu'].includes(id))) {
        baseExp = Math.round(baseExp * 1.3);
    }

    const { finalExp } = addChoreExp(choreName);
    completedList.unshift({ id, name: choreName, time: id, gainedExp: finalExp, isLucky: true });

    // 素材ボーナス（★3なら追加でネジとレンガ）
    const tier = BOSS_DIFFICULTY_MAP[boss.id] || 2;
    if (tier === 3) {
        if (!kajigonState.materials) kajigonState.materials = { wood: 0, cloth: 0, brick: 0, gear: 0 };
        kajigonState.materials.gear = (kajigonState.materials.gear || 0) + 1;
        kajigonState.materials.brick = (kajigonState.materials.brick || 0) + 2;
    }

    if (typeof SoundEngine !== 'undefined') {
        SoundEngine.playSE('level_up');
    }

    saveToLocalStorage();
    renderCompleted();
    renderBountyWidget();

    if (typeof showToast === 'function') {
        showToast(`⚔️『${boss.name}』を見事討伐しました！（+${finalExp} EXP）`);
    }

    if (typeof showCompanionDialogue === 'function') {
        showCompanionDialogue(`「大勝利だぞ総監督！『${boss.name}』を退治しておうちの平和が守られたぞー！」`);
    }
}

/**
 * 互換用：getTodayBounty（単体チェック用）
 */
function getTodayBounty() {
    const info = getTodayBountyOptions();
    const boss = (info.defeated && info.defeatedBossId)
        ? (info.bosses.find(b => b.id === info.defeatedBossId) || info.bosses[0])
        : info.bosses[0];
    return { boss, defeated: info.defeated };
}

/**
 * 互換用：defeatBountyQuest（旧ボタン対応）
 */
function defeatBountyQuest() {
    const info = getTodayBountyOptions();
    if (info.bosses && info.bosses[0]) {
        defeatSpecificBoss(info.bosses[0].id);
    }
}

/**
 * 討伐ボスUI描画（3択カード ＆ チェンジボタン）
 */
function renderBountyWidget() {
    const container = document.getElementById('bounty-quest-modal-container');
    const badge = document.getElementById('side-quest-badge');

    const info = getTodayBountyOptions();

    if (badge) {
        if (info.defeated) badge.classList.add('hidden');
        else badge.classList.remove('hidden');
    }

    if (!container) return;

    if (info.defeated) {
        const defeatedBoss = info.bosses.find(b => b.id === info.defeatedBossId) || info.bosses[0];
        container.innerHTML = `
            <div style="background:#064e3b; border:2px solid #10b981; border-radius:8px; padding:1.2rem; text-align:center;">
                <div style="font-size:24px; margin-bottom:0.4rem;">🎉</div>
                <div style="font-size:16px; font-weight:bold; color:#34d399; margin-bottom:0.4rem;">本日の討伐成功！</div>
                <div style="font-size:13px; color:#a7f3d0;">『${defeatedBoss.name}』を撃破し、今日もおうちの平和が守られました！</div>
            </div>
        `;
        return;
    }

    let html = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.8rem;">
            <span style="font-size:13px; color:#a1a1aa;">本日の依頼（いずれか1体選択して討伐）：</span>
            ${info.changeCount < 1 ? `
                <button onclick="rerollTodayBounties()" style="font-size:11px; background:#27273a; color:#fbbf24; border:1px solid #fbbf24; border-radius:4px; padding:0.25rem 0.5rem; cursor:pointer;">🔄 依頼を変更 (1日1回)</button>
            ` : `
                <span style="font-size:11px; color:#71717a;">チェンジ使用済み</span>
            `}
        </div>

        <div style="display:flex; flex-direction:column; gap:0.8rem;">
            ${info.bosses.map(boss => {
                const tier = BOSS_DIFFICULTY_MAP[boss.id] || 2;
                const stars = '★'.repeat(tier) + '☆'.repeat(3 - tier);
                const tierLabel = tier === 1 ? '初級 (1〜3分)' : tier === 2 ? '中級 (5〜10分)' : '上級 (大掃除)';
                const borderColor = tier === 1 ? '#3b82f6' : tier === 2 ? '#f59e0b' : '#ef4444';

                return `
                    <div class="bounty-choice-card" style="background:#181824; border:2px solid ${borderColor}; border-radius:8px; padding:0.8rem;">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.3rem;">
                            <span style="font-size:12px; font-weight:bold; color:${borderColor};">${stars} ${tierLabel}</span>
                            <span style="font-size:11px; background:${borderColor}; color:#fff; padding:0.15rem 0.4rem; border-radius:4px; font-weight:bold;">+${boss.exp} EXP</span>
                        </div>
                        <div style="font-size:14px; font-weight:bold; color:#fff; margin-bottom:0.3rem;">${boss.name}</div>
                        <div style="font-size:12px; color:#fbbf24; margin-bottom:0.3rem;">🎯 討伐任務：${boss.target}</div>
                        <div style="font-size:11px; color:#a1a1aa; margin-bottom:0.6rem;">${boss.desc}</div>
                        <button onclick="defeatSpecificBoss('${boss.id}')" style="width:100%; padding:0.5rem; background:${borderColor}; color:#fff; font-weight:bold; font-size:13px; border:none; border-radius:6px; cursor:pointer;">⚔️ このボスを討伐完了！</button>
                    </div>
                `;
            }).join('')}
        </div>
    `;

    container.innerHTML = html;
}
