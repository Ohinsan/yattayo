// ==========================================================================
// 🧹 家事記録 ＆ クイックボタン ＆ まとめて奉納 ＆ スマートUndoシステム
// ==========================================================================

let lastChoreRecord = null; // { id, name, timestamp }
let choreRecordMode = 'instant'; // 'instant' (⚡1タップ即記録) | 'batch' (☑️まとめて選択)
let batchSelectedChores = []; // まとめて選択モードで選択中の家事名リスト

/**
 * 記録モードの切り替え（⚡ 1タップ即記録モード ⇔ ☑️ まとめて選択モード）
 */
function setChoreRecordMode(mode) {
    if (typeof SoundEngine !== 'undefined') {
        SoundEngine.playSE('click');
    }
    choreRecordMode = (mode === 'batch') ? 'batch' : 'instant';

    const btnInstant = document.getElementById('mode-btn-instant');
    const btnBatch = document.getElementById('mode-btn-batch');
    const modeDesc = document.getElementById('chore-mode-desc');

    if (btnInstant) {
        if (choreRecordMode === 'instant') btnInstant.classList.add('active');
        else btnInstant.classList.remove('active');
    }
    if (btnBatch) {
        if (choreRecordMode === 'batch') btnBatch.classList.add('active');
        else btnBatch.classList.remove('active');
    }
    if (modeDesc) {
        if (choreRecordMode === 'batch') {
            modeDesc.textContent = '☑️ 今日やった家事を複数チェックして、下のボタンで一気にまとめて奉納しよう！';
        } else {
            modeDesc.textContent = '⚡ 完了した家事をタップしよう！（1タップで即座に記録できます）';
        }
    }

    updateBatchSubmitBar();
    renderQuickAddButtons();
}

/**
 * 家事ボタンのタップ分岐（即記録モード or まとめて選択モード）
 */
function handleChoreItemTap(choreName, buttonElement) {
    if (choreRecordMode === 'batch') {
        toggleBatchChoreSelection(choreName, buttonElement);
    } else {
        addQuickChore(choreName, buttonElement);
    }
}

/**
 * ☑️ まとめて選択モードでの選択トグル
 */
function toggleBatchChoreSelection(choreName, buttonElement) {
    if (typeof SoundEngine !== 'undefined') {
        SoundEngine.playSE('click');
    }
    const idx = batchSelectedChores.indexOf(choreName);
    if (idx >= 0) {
        batchSelectedChores.splice(idx, 1);
    } else {
        batchSelectedChores.push(choreName);
    }
    updateBatchSubmitBar();
    renderQuickAddButtons();
}

/**
 * ☑️ まとめて選択モードの選択解除
 */
function clearBatchSelection() {
    if (typeof SoundEngine !== 'undefined') {
        SoundEngine.playSE('undo');
    }
    batchSelectedChores = [];
    updateBatchSubmitBar();
    renderQuickAddButtons();
}

/**
 * ☑️ モーダル下部の「✨ まとめて奉納する！」固定バーの表示更新
 */
function updateBatchSubmitBar() {
    const bar = document.getElementById('batch-submit-bar');
    const btn = document.getElementById('btn-batch-submit');
    if (!bar || !btn) return;

    if (choreRecordMode === 'batch') {
        bar.classList.remove('hidden');
    } else {
        bar.classList.add('hidden');
        return;
    }

    const count = batchSelectedChores.length;
    const totalExp = batchSelectedChores.reduce((sum, name) => {
        return sum + (typeof estimateChoreExp === 'function' ? estimateChoreExp(name) : 15);
    }, 0);

    btn.innerHTML = `✨ まとめて奉納する！（選択件数 ${count}件 / 合計 +${totalExp} EXP）`;
    if (count === 0) {
        btn.disabled = true;
        btn.classList.add('disabled');
    } else {
        btn.disabled = false;
        btn.classList.remove('disabled');
    }
}

/**
 * ✨ まとめて奉納する！（一括確定＆モーダル自動クローズ＆連続EXPオーブ＋音階コンボファンファーレ）
 */
function submitBatchChores() {
    if (!batchSelectedChores || batchSelectedChores.length === 0) {
        if (typeof showToast === 'function') {
            showToast('☑️ 奉納する家事を1つ以上チェックしてください！');
        }
        return;
    }

    const selectedNames = [...batchSelectedChores];
    batchSelectedChores = [];
    updateBatchSubmitBar();

    // 1. モーダルを自動的に閉じる
    if (typeof closeChoreSelectModal === 'function') {
        const modal = document.getElementById('chore-select-modal');
        if (modal) modal.classList.add('hidden');
    }

    // 2. 選択された全件の家事データ・EXP・素材ドロップを一括計算＆保存（画面描画はオーブ着弾時に連動）
    const baseTime = Date.now();
    const batchIds = [];
    let totalGainedExp = 0;
    let anyLucky = false;
    let anySnackBuff = false;
    const droppedMap = {};

    selectedNames.forEach((choreName, idx) => {
        const id = baseTime + idx;
        batchIds.push(id);
        const stats = getChoreStats(choreName);
        const isLastItem = (idx === selectedNames.length - 1);
        const { finalExp, wasLucky, gainedAttrPts, usedSnackBuff } = addChoreExp(choreName, {
            deferRender: true,
            keepSnackBuff: !isLastItem
        });
        totalGainedExp += finalExp;
        if (wasLucky) anyLucky = true;
        if (usedSnackBuff) anySnackBuff = true;

        completedList.unshift({
            id,
            name: choreName,
            time: id,
            gainedExp: finalExp,
            isLucky: wasLucky,
            gainedAttrPts
        });

        if (typeof dropChoreMaterials === 'function') {
            const mats = dropChoreMaterials(choreName, stats);
            mats.forEach(m => {
                droppedMap[m.name] = (droppedMap[m.name] || 0) + m.count;
            });
        }
    });

    lastChoreRecord = null;
    saveToLocalStorage();
    renderCompleted();
    renderQuickAddButtons();

    // 3. カジゴンルーム画面で N個のEXPオーブを 0.135秒（135ms）間隔で連続射出＆コンボ音階上昇！
    const totalCount = selectedNames.length;
    const intervalMs = 135; // 0.12s〜0.15s間隔

    selectedNames.forEach((choreName, idx) => {
        setTimeout(() => {
            // Web Audio コンボ音階（ド・レ・ミ・ファ・ソ・ラ・シ・ド♪ ➔ 最終ステップでファンファーレ）
            if (typeof SoundEngine !== 'undefined' && typeof SoundEngine.playBatchComboStep === 'function') {
                SoundEngine.playBatchComboStep(idx, totalCount);
            }

            const isFinalOrb = (idx === totalCount - 1);
            if (typeof spawnSingleBatchOrb === 'function') {
                spawnSingleBatchOrb(idx, totalCount, () => {
                    if (isFinalOrb) {
                        onBatchOrbsComplete(selectedNames, batchIds, totalGainedExp, droppedMap, anyLucky, anySnackBuff);
                    }
                });
            } else if (isFinalOrb) {
                onBatchOrbsComplete(selectedNames, batchIds, totalGainedExp, droppedMap, anyLucky, anySnackBuff);
            }
        }, idx * intervalMs);
    });
}

/**
 * まとめて奉納の全オーブ着弾完了時のフィナーレ演出
 */
function onBatchOrbsComplete(selectedNames, batchIds, totalGainedExp, droppedMap, anyLucky, anySnackBuff) {
    if (typeof updateCompanionWidget === 'function') {
        updateCompanionWidget();
    }
    if (typeof checkAchievementsAndTitles === 'function') {
        checkAchievementsAndTitles();
    }

    const count = selectedNames.length;
    const matEntries = Object.keys(droppedMap).map(k => `${k}×${droppedMap[k]}`);
    let toastMsg = `✨ ${count}件の家事をまとめて奉納！（合計 +${totalGainedExp} EXP）🎵${count}連コンボ達成!!`;
    if (anySnackBuff) {
        toastMsg += ` 💖大好物バフ1.5倍発動！`;
    }
    if (matEntries.length > 0) {
        toastMsg += ` 📦 素材GET: ${matEntries.join(' ')}`;
    }

    if (typeof showToast === 'function') {
        const idsStr = batchIds.join(',');
        showToast(toastMsg, {
            undoCallback: () => {
                undoGroup(idsStr);
                showToast(`↩️ まとめて奉納（${count}件）を取り消しました`, { isUndo: true });
            },
            duration: 12000
        });
    }

    if (typeof showCompanionDialogue === 'function') {
        const cheerLines = [
            `「うおおおっ！！${count}件まとめて大奉納（+${totalGainedExp} EXP）！！今日1日の頑張りが一気に溢れてくるぞ〜！！」`,
            `「すごすぎるぞ総監督！！${count}連続コンボでおうちもオイラもパワー満タンだ〜！！」`,
            `「今日もお疲れさま！！${count}件もの家事をやり遂げるなんて、まさに伝説の家事勇者だぞ！」`
        ];
        showCompanionDialogue(cheerLines[Math.floor(Math.random() * cheerLines.length)]);
    }

    if (typeof triggerFortuneToast === 'function') {
        triggerFortuneToast(anyLucky || count >= 3 || Math.random() < 0.6);
    }
}

/**
 * クイック家事の追加＆スマートUndo（⚡ 1タップ即記録モード）
 */
function addQuickChore(choreName, buttonElement) {
    const now = Date.now();

    // 🌟 短時間（15秒以内）に同じボタンを再度押した場合はスマートUndo（取り消し）
    if (lastChoreRecord && lastChoreRecord.name === choreName && (now - lastChoreRecord.timestamp) <= 15000) {
        const undoId = lastChoreRecord.id;
        lastChoreRecord = null;
        undoDone(undoId);
        if (typeof showToast === 'function') {
            showToast(`↩️「${choreName}」の記録を取り消しました`, { isUndo: true });
        }
        if (typeof showCompanionDialogue === 'function') {
            showCompanionDialogue(`「了解だぞ！『${choreName}』を取り消したぞ！押し間違いでも安心だな！」`);
        }
        return;
    }

    let comboInfo = null;
    if (typeof SoundEngine !== 'undefined') {
        comboInfo = SoundEngine.playChoreCombo();
    }

    const id = now;
    const stats = getChoreStats(choreName);
    const { finalExp, wasLucky, gainedAttrPts, usedSnackBuff } = addChoreExp(choreName);
    completedList.unshift({ id, name: choreName, time: id, gainedExp: finalExp, isLucky: wasLucky, gainedAttrPts });

    // 素材ドロップ（新・家具システム連携）
    let droppedMaterials = [];
    if (typeof dropChoreMaterials === 'function') {
        droppedMaterials = dropChoreMaterials(choreName, stats);
    }

    // スマートUndo用記録
    lastChoreRecord = { id, name: choreName, timestamp: now };

    saveToLocalStorage();
    renderCompleted();
    renderQuickAddButtons();
    if (typeof updateCompanionWidget === 'function') {
        updateCompanionWidget();
    }

    // 🌟 キラキラEXPオーブ演出（ボタンからカジゴンへ放物線飛翔）
    if (typeof spawnExpOrbs === 'function') {
        spawnExpOrbs(buttonElement, () => {
            if (typeof updateCompanionWidget === 'function') {
                updateCompanionWidget();
            }
        });
    }

    // トースト通知（コンボ表示＆取り消すボタン付き）
    let toastMsg = `🧹「${choreName}」を記録！（+${finalExp} EXP）`;
    if (usedSnackBuff) {
        toastMsg += ` 💖大好物バフ1.5倍発動！`;
    }
    if (comboInfo && comboInfo.combo > 1) {
        toastMsg += ` 🎵 ${comboInfo.combo}連続コンボ（♪${comboInfo.noteName}）${comboInfo.isMax ? '🎉MAX!!' : ''}`;
    }
    if (droppedMaterials.length > 0) {
        const matText = droppedMaterials.map(m => `${m.name}×${m.count}`).join(' ');
        toastMsg += ` 📦 素材GET: ${matText}`;
    }

    if (typeof showToast === 'function') {
        showToast(toastMsg, {
            undoCallback: () => {
                undoDone(id);
                lastChoreRecord = null;
                showToast(`↩️「${choreName}」を取り消しました`, { isUndo: true });
            },
            duration: 10000
        });
    }

    // カジゴンのセリフ
    if (typeof showCompanionDialogue === 'function') {
        let wishText = null;
        if (typeof getNextFurnitureWish === 'function') {
            const wish = getNextFurnitureWish();
            if (wish && Math.random() < 0.35) {
                wishText = wish.dialogue;
            }
        }

        if (wishText) {
            showCompanionDialogue(wishText);
        } else {
            const cheerLines = [
                `「お疲れさま！『${choreName}』完了だな！おうちピカピカだぞ〜！」`,
                `「わーい！『${choreName}』やってくれた！ありがとう！」`,
                `「さすが総監督！家事スキルがどんどん上がってるぞ！」`,
                `「いい調子だぞ！おうちが喜んでるのが伝わってくる！」`
            ];
            showCompanionDialogue(cheerLines[Math.floor(Math.random() * cheerLines.length)]);
        }
    }

    if (typeof triggerFortuneToast === 'function') {
        triggerFortuneToast(wasLucky || stats.isSetPack || stats.isFuzzy || Math.random() < 0.4);
    }
}

function addFreeSupply() {
    const input = document.getElementById('freeSupplyInput');
    const text = input.value.trim();
    if (text) {
        const choreName = `[物品補充] ${text}`;
        input.value = '';

        if (choreRecordMode === 'batch') {
            if (!batchSelectedChores.includes(choreName)) {
                batchSelectedChores.push(choreName);
            }
            if (typeof SoundEngine !== 'undefined') SoundEngine.playSE('click');
            updateBatchSubmitBar();
            renderQuickAddButtons();
            if (typeof showToast === 'function') {
                showToast(`☑️「${choreName}」をまとめて奉納リストに追加しました！`);
            }
            return;
        }

        const id = Date.now();
        const stats = getChoreStats(choreName);
        const { finalExp, wasLucky, gainedAttrPts } = addChoreExp(choreName);
        completedList.unshift({ id, name: choreName, time: id, gainedExp: finalExp, isLucky: wasLucky, gainedAttrPts });

        if (typeof dropChoreMaterials === 'function') {
            dropChoreMaterials(choreName, stats);
        }

        if (typeof spawnExpOrbs === 'function') {
            const btn = document.querySelector('.btn-add-supply') || input;
            spawnExpOrbs(btn, () => {
                if (typeof updateCompanionWidget === 'function') {
                    updateCompanionWidget();
                }
            });
        }

        let comboInfo = null;
        if (typeof SoundEngine !== 'undefined') {
            comboInfo = SoundEngine.playChoreCombo();
        }

        saveToLocalStorage();
        renderCompleted();
        let toastMsg = `📦「${choreName}」を補充記録しました！（+${finalExp} EXP）`;
        if (comboInfo && comboInfo.combo > 1) {
            toastMsg += ` 🎵 ${comboInfo.combo}連続コンボ（♪${comboInfo.noteName}）${comboInfo.isMax ? '🎉MAX!!' : ''}`;
        }
        if (typeof showToast === 'function') {
            showToast(toastMsg, {
                undoCallback: () => undoDone(id)
            });
        }
    }
}

function addOtherChore() {
    const input = document.getElementById('otherChoreInput');
    const text = input.value.trim();
    if (text) {
        const choreName = `[その他] ${text}`;
        input.value = '';

        if (choreRecordMode === 'batch') {
            if (!batchSelectedChores.includes(choreName)) {
                batchSelectedChores.push(choreName);
            }
            if (typeof SoundEngine !== 'undefined') SoundEngine.playSE('click');
            updateBatchSubmitBar();
            renderQuickAddButtons();
            if (typeof showToast === 'function') {
                showToast(`☑️「${choreName}」をまとめて奉納リストに追加しました！`);
            }
            return;
        }

        const id = Date.now();
        const stats = getChoreStats(choreName);
        const { finalExp, wasLucky, gainedAttrPts } = addChoreExp(choreName);
        completedList.unshift({ id, name: choreName, time: id, gainedExp: finalExp, isLucky: wasLucky, gainedAttrPts });

        if (typeof dropChoreMaterials === 'function') {
            dropChoreMaterials(choreName, stats);
        }

        if (typeof spawnExpOrbs === 'function') {
            const btn = document.querySelector('.btn-add-other') || input;
            spawnExpOrbs(btn, () => {
                if (typeof updateCompanionWidget === 'function') {
                    updateCompanionWidget();
                }
            });
        }

        let comboInfo = null;
        if (typeof SoundEngine !== 'undefined') {
            comboInfo = SoundEngine.playChoreCombo();
        }

        saveToLocalStorage();
        renderCompleted();
        let toastMsg = `📝「${choreName}」を記録しました！（+${finalExp} EXP）`;
        if (comboInfo && comboInfo.combo > 1) {
            toastMsg += ` 🎵 ${comboInfo.combo}連続コンボ（♪${comboInfo.noteName}）${comboInfo.isMax ? '🎉MAX!!' : ''}`;
        }
        if (typeof showToast === 'function') {
            showToast(toastMsg, {
                undoCallback: () => undoDone(id)
            });
        }
    }
}

function undoDone(id) {
    if (typeof SoundEngine !== 'undefined') {
        SoundEngine.playSE('undo');
    }
    const found = completedList.find(c => c.id === id);
    if (found) {
        undoChoreExp(found);
    }
    completedList = completedList.filter(c => c.id !== id);
    if (lastChoreRecord && lastChoreRecord.id === id) {
        lastChoreRecord = null;
    }
    saveToLocalStorage();
    renderCompleted();
    renderQuickAddButtons();
}

function undoGroup(idsStr) {
    if (typeof SoundEngine !== 'undefined') {
        SoundEngine.playSE('undo');
    }
    const ids = idsStr.split(',').map(Number);
    ids.forEach(id => {
        const found = completedList.find(c => c.id === id);
        if (found) {
            undoChoreExp(found);
        }
    });
    completedList = completedList.filter(c => !ids.includes(c.id));
    lastChoreRecord = null;
    saveToLocalStorage();
    renderCompleted();
    renderQuickAddButtons();
}

function resetDayOnly() {
    if (window.confirm('本日の家事の記録を整理（クリア）しますか？\n※これまでの成長データや家具は失われません。')) {
        if (typeof SoundEngine !== 'undefined') {
            SoundEngine.playSE('undo');
        }
        completedList = [];
        lastChoreRecord = null;
        saveToLocalStorage();
        renderCompleted();
        renderQuickAddButtons();
    }
}

function resetAppFully() {
    if (window.confirm('本当にアプリのすべての設定とデータを完全初期化しますか？\n家事履歴、相棒の成長、集めた素材や家具などのすべてのデータがリセットされます。')) {
        try {
            localStorage.clear();
        } catch (e) {
            console.error(e);
        }
        window.location.reload();
    }
}

/**
 * セット家事パックの属性内訳バッジ文字列を生成
 */
function formatAttrBreakdownBadge(attrBreakdown) {
    if (!attrBreakdown) return '';
    const parts = [];
    if (attrBreakdown.fire) parts.push(`🔥火${attrBreakdown.fire}`);
    if (attrBreakdown.water) parts.push(`💧水${attrBreakdown.water}`);
    if (attrBreakdown.wind) parts.push(`🍃風${attrBreakdown.wind}`);
    if (attrBreakdown.earth) parts.push(`🪨土${attrBreakdown.earth}`);
    return parts.join(' / ');
}

/**
 * クイック追加ボタンのレンダリング（セット家事パック・ざっくり頑張ったボタン・よく使う家事・部屋別）
 */
function renderQuickAddButtons() {
    const container = document.getElementById('quick-add-container');
    if (!container) return;
    const base = BASE_TEMPLATES[currentLayout] || (currentLayout && BASE_TEMPLATES[currentLayout.toLowerCase()]) || BASE_TEMPLATES['2ldk'] || BASE_TEMPLATES['2LDK'];
    if (!base) return;

    const isBatch = (choreRecordMode === 'batch');
    const todayStr = getTodayDateString();
    const todayCounts = {};
    completedList
        .filter(c => getDateKey(c.time) === todayStr)
        .forEach(c => {
            todayCounts[c.name] = (todayCounts[c.name] || 0) + 1;
        });

    // =========================================================================
    // 📦 Task 2: 生活動線に沿った「セット家事（ワンタップ・パック）」4種
    // =========================================================================
    const setPacks = (typeof CHORE_SET_PACKS !== 'undefined') ? CHORE_SET_PACKS : [];
    const setPacksHtml = `
        <div class="quick-add-section set-pack-section">
            <div class="special-section-header">
                <span class="group-label" style="color: #fbbf24; margin-bottom: 0.15rem;">
                    <span>📦</span> <span>セット家事パック（生活動線まとめ）</span>
                </span>
                <span class="special-section-sub">細かい名もなき家事を1タップでまとめて記録！</span>
            </div>
            <div class="set-pack-grid">
                ${setPacks.map(pack => {
                    const doneCount = todayCounts[pack.name] || 0;
                    const isSelected = isBatch && batchSelectedChores.includes(pack.name);
                    const isLast = (!isBatch && lastChoreRecord && lastChoreRecord.name === pack.name);
                    const attrText = formatAttrBreakdownBadge(pack.attrBreakdown);
                    const checkLabel = doneCount > 0 ? `<span class="done-check-badge">✔ 済(${doneCount})</span>` : '';
                    const batchCheck = isBatch
                        ? `<span class="batch-check-indicator ${isSelected ? 'checked' : ''}">${isSelected ? '☑️ 選択中' : '⬜ 選択'}</span>`
                        : '';
                    const undoHint = isLast ? ' <span class="undo-inline-hint">(再タップで取消)</span>' : '';
                    const safeName = pack.name.replace(/'/g, "\\'");

                    const subDescText = pack.subDesc || pack.subText || '';
                    const packAttr = pack.primaryAttr || pack.attr || 'wind';

                    return `
                        <button type="button"
                            class="quick-add-btn set-pack-card attr-${packAttr} ${doneCount > 0 ? 'done' : ''} ${isLast ? 'undo-ready' : ''} ${isSelected ? 'batch-selected' : ''}"
                            onclick="handleChoreItemTap('${safeName}', this)">
                            <div class="set-pack-top">
                                <span class="set-pack-title">${pack.name}${undoHint}</span>
                                <div class="set-pack-badges">
                                    ${batchCheck}
                                    <span class="set-pack-exp-badge">+${pack.exp} EXP</span>
                                    ${checkLabel}
                                </div>
                            </div>
                            <div class="set-pack-desc">（${subDescText}）</div>
                            <div class="set-pack-attrs">${attrText}</div>
                        </button>
                    `;
                }).join('')}
            </div>
        </div>
    `;

    // =========================================================================
    // 🌟 Task 3: 項目を探すのすら疲れた日の「ざっくり頑張ったボタン（小・中・大）」
    // =========================================================================
    const fuzzyBtns = (typeof FUZZY_EFFORT_BUTTONS !== 'undefined') ? FUZZY_EFFORT_BUTTONS : [];
    const fuzzyHtml = `
        <div class="quick-add-section fuzzy-effort-section">
            <div class="special-section-header">
                <span class="group-label" style="color: #34d399; margin-bottom: 0.15rem;">
                    <span>🌟</span> <span>ざっくり頑張ったボタン（選ぶのも疲れた日に！）</span>
                </span>
                <span class="special-section-sub">何をしたか選ぶ余裕がない日も、1タップで全属性にバランスよくEXP奉納！</span>
            </div>
            <div class="fuzzy-effort-grid">
                ${fuzzyBtns.map(fBtn => {
                    const doneCount = todayCounts[fBtn.name] || 0;
                    const isSelected = isBatch && batchSelectedChores.includes(fBtn.name);
                    const isLast = (!isBatch && lastChoreRecord && lastChoreRecord.name === fBtn.name);
                    const checkLabel = doneCount > 0 ? `<span class="done-check-badge">✔ 済(${doneCount})</span>` : '';
                    const batchCheck = isBatch
                        ? `<span class="batch-check-indicator ${isSelected ? 'checked' : ''}">${isSelected ? '☑️' : '⬜'}</span>`
                        : '';
                    const gearBadge = fBtn.guaranteedGear
                        ? `<span class="fuzzy-gear-badge">⚙️ 古代のネジ×1確定！</span>`
                        : `<span class="fuzzy-attr-badge">🌈 全属性バランス</span>`;
                    const undoHint = isLast ? ' (再タップで取消)' : '';
                    const safeName = fBtn.name.replace(/'/g, "\\'");

                    return `
                        <button type="button"
                            class="quick-add-btn fuzzy-effort-btn fuzzy-${fBtn.id} ${doneCount > 0 ? 'done' : ''} ${isLast ? 'undo-ready' : ''} ${isSelected ? 'batch-selected' : ''}"
                            onclick="handleChoreItemTap('${safeName}', this)">
                            <div class="fuzzy-btn-main">
                                <span class="fuzzy-btn-title">${batchCheck} ${fBtn.name}${undoHint}</span>
                                <span class="fuzzy-btn-exp">+${fBtn.exp} EXP</span>
                            </div>
                            <div class="fuzzy-btn-sub">
                                ${gearBadge}
                                ${checkLabel}
                            </div>
                        </button>
                    `;
                }).join('')}
            </div>
        </div>
    `;

    // =========================================================================
    // ⭐ よく使う家事
    // =========================================================================
    const counts = {};
    completedList.forEach(c => {
        counts[c.name] = (counts[c.name] || 0) + 1;
    });
    let topChores = Object.keys(counts).sort((a, b) => counts[b] - counts[a]).slice(0, 3);
    if (topChores.length === 0) {
        topChores = ['キッチン：食器洗い', '洗面・洗濯：洗濯機を回す', 'リビング：掃除機がけ'];
    }

    const favHtml = `
        <div class="quick-add-section favorites-section" style="border-radius: 8px;">
            <span class="group-label" style="color: #ffd700;"><span>⭐</span> <span>よく使う家事</span></span>
            <div class="quick-add-buttons">
                ${topChores.map(choreName => {
                    const doneCount = todayCounts[choreName] || 0;
                    const stats = getChoreStats(choreName);
                    const attrClass = stats.attr ? `attr-${stats.attr}` : '';
                    const isSelected = isBatch && batchSelectedChores.includes(choreName);
                    const isLast = (!isBatch && lastChoreRecord && lastChoreRecord.name === choreName);
                    const checkLabel = doneCount > 0 ? `<span class="done-check-badge">✔ 済(${doneCount})</span>` : '';
                    const batchPrefix = isBatch ? `<span class="batch-check-inline">${isSelected ? '☑️ ' : '⬜ '}</span>` : '';
                    const undoHint = isLast ? ' (再タップで取消)' : '';
                    const safeName = choreName.replace(/'/g, "\\'");
                    return `<button type="button" class="quick-add-btn ${attrClass} ${doneCount > 0 ? 'done' : ''} ${isLast ? 'undo-ready' : ''} ${isSelected ? 'batch-selected' : ''}" onclick="handleChoreItemTap('${safeName}', this)" title="${isLast ? '短時間の再タップで取り消せます' : ''}">${batchPrefix}${choreName}${undoHint} ${checkLabel}</button>`;
                }).join('')}
            </div>
        </div>
    `;

    // =========================================================================
    // 🏠 各部屋の個別家事ボタン
    // =========================================================================
    let sectionsHtml = base.map(section => {
        const customName = customRoomNames[section.id] || section.defaultName;
        const icon = getRoomIcon(section.id, customName);

        return `
            <div class="quick-add-section">
                <span class="group-label"><span>${icon}</span> <span>${customName}</span></span>
                <div class="quick-add-buttons">
                    ${section.chores.map(chore => {
                        const fullName = section.id === 'trash' ? chore : `${customName}：${chore}`;
                        const doneCount = todayCounts[fullName] || 0;
                        const stats = getChoreStats(fullName);
                        const attrClass = stats.attr ? `attr-${stats.attr}` : '';
                        const isSelected = isBatch && batchSelectedChores.includes(fullName);
                        const isLast = (!isBatch && lastChoreRecord && lastChoreRecord.name === fullName);
                        const checkLabel = doneCount > 0 ? `<span class="done-check-badge">✔ 済(${doneCount})</span>` : '';
                        const batchPrefix = isBatch ? `<span class="batch-check-inline">${isSelected ? '☑️ ' : '⬜ '}</span>` : '';
                        const undoHint = isLast ? ' (再タップで取消)' : '';
                        const safeName = fullName.replace(/'/g, "\\'");

                        return `<button type="button" class="quick-add-btn ${attrClass} ${doneCount > 0 ? 'done' : ''} ${isLast ? 'undo-ready' : ''} ${isSelected ? 'batch-selected' : ''}" onclick="handleChoreItemTap('${safeName}', this)" title="${isLast ? '短時間の再タップで取り消せます' : ''}">${batchPrefix}${chore}${undoHint} ${checkLabel}</button>`;
                    }).join('')}
                </div>
            </div>
        `;
    }).join('');

    container.innerHTML = setPacksHtml + fuzzyHtml + favHtml + sectionsHtml;
}

/**
 * 達成履歴リストのレンダリング
 */
function renderCompleted() {
    const container = document.getElementById('completedList');
    if (!container) return;

    if (completedList.length === 0) {
        container.innerHTML = `<li style="text-align:center; color:#888; font-size:12px; padding:1rem 0;">まだ本日の記録はありません</li>`;
        return;
    }

    const todayStr = getTodayDateString();
    const todayChores = completedList.filter(c => getDateKey(c.time) === todayStr);

    if (todayChores.length === 0) {
        container.innerHTML = `<li style="text-align:center; color:#888; font-size:12px; padding:1rem 0;">まだ本日の記録はありません</li>`;
        return;
    }

    container.innerHTML = todayChores.map(chore => {
        return `
            <li class="completed-item" style="display:flex; justify-content:space-between; align-items:center; padding:0.4rem 0.6rem; border-bottom:1px solid rgba(255,255,255,0.08);">
                <div style="display:flex; align-items:center; gap:0.4rem;">
                    <span style="color:#10b981; font-weight:bold;">✔</span>
                    <span style="font-size:13px; color:#fff;">${chore.name}</span>
                    <span style="font-size:10px; color:#ffd700;">(+${chore.gainedExp} EXP)</span>
                </div>
                <button onclick="undoDone(${chore.id})" style="font-size:11px; background:#221818; color:#f87171; border:1px solid #ef4444; border-radius:4px; padding:0.2rem 0.4rem; cursor:pointer;">取消</button>
            </li>
        `;
    }).join('');
}

