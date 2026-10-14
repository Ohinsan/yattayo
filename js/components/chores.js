// ==========================================================================
// 🧹 家事記録 ＆ クイックボタン ＆ スマートUndo（即時取消）システム
// ==========================================================================

let lastChoreRecord = null; // { id, name, timestamp }

/**
 * クイック家事の追加＆スマートUndo
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

    if (typeof SoundEngine !== 'undefined') {
        SoundEngine.playSE('done');
    }

    const id = now;
    const stats = getChoreStats(choreName);
    const { finalExp, wasLucky } = addChoreExp(choreName);
    completedList.unshift({ id, name: choreName, time: id, gainedExp: finalExp, isLucky: wasLucky });

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

    // トースト通知（取り消すボタン付き）
    let toastMsg = `🧹「${choreName}」を記録！（+${finalExp} EXP）`;
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
        // 次の家具おねだりがあるか確認
        let wishText = null;
        if (typeof getNextFurnitureWish === 'function') {
            const wish = getNextFurnitureWish();
            if (wish && Math.random() < 0.4) {
                wishText = wish.dialogue;
            }
        }

        if (wishText) {
            showCompanionDialogue(wishText);
        } else {
            const dragonName = kajigonState.companionName || 'カジゴン';
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
        triggerFortuneToast(wasLucky || Math.random() < 0.4);
    }
}

function addFreeSupply() {
    const input = document.getElementById('freeSupplyInput');
    const text = input.value.trim();
    if (text) {
        const choreName = `[物品補充] ${text}`;
        const id = Date.now();
        const stats = getChoreStats(choreName);
        const { finalExp, wasLucky } = addChoreExp(choreName);
        completedList.unshift({ id, name: choreName, time: id, gainedExp: finalExp, isLucky: wasLucky });

        if (typeof dropChoreMaterials === 'function') {
            dropChoreMaterials(choreName, stats);
        }

        input.value = '';
        saveToLocalStorage();
        renderCompleted();
        if (typeof showToast === 'function') {
            showToast(`📦「${choreName}」を補充記録しました！（+${finalExp} EXP）`, {
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
        const id = Date.now();
        const stats = getChoreStats(choreName);
        const { finalExp, wasLucky } = addChoreExp(choreName);
        completedList.unshift({ id, name: choreName, time: id, gainedExp: finalExp, isLucky: wasLucky });

        if (typeof dropChoreMaterials === 'function') {
            dropChoreMaterials(choreName, stats);
        }

        input.value = '';
        saveToLocalStorage();
        renderCompleted();
        if (typeof showToast === 'function') {
            showToast(`📝「${choreName}」を記録しました！（+${finalExp} EXP）`, {
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

/**
 * クイック追加ボタンのレンダリング
 */
function renderQuickAddButtons() {
    const container = document.getElementById('quick-add-container');
    if (!container) return;
    const base = BASE_TEMPLATES[currentLayout];
    if (!base) return;

    const todayStr = getTodayDateString();
    const todayCounts = {};
    completedList
        .filter(c => getDateKey(c.time) === todayStr)
        .forEach(c => {
            todayCounts[c.name] = (todayCounts[c.name] || 0) + 1;
        });

    // よく使う家事
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
                    const isLast = (lastChoreRecord && lastChoreRecord.name === choreName);
                    const checkLabel = doneCount > 0 ? `<span class="done-check-badge">✔ 済(${doneCount})</span>` : '';
                    const undoHint = isLast ? ' (再タップで取消)' : '';
                    return `<button class="quick-add-btn ${attrClass} ${doneCount > 0 ? 'done' : ''} ${isLast ? 'undo-ready' : ''}" onclick="addQuickChore('${choreName}', this)" title="${isLast ? '短時間の再タップで取り消せます' : ''}">${choreName}${undoHint} ${checkLabel}</button>`;
                }).join('')}
            </div>
        </div>
    `;

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
                        const isLast = (lastChoreRecord && lastChoreRecord.name === fullName);
                        const checkLabel = doneCount > 0 ? `<span class="done-check-badge">✔ 済(${doneCount})</span>` : '';
                        const undoHint = isLast ? ' (再タップで取消)' : '';

                        return `<button class="quick-add-btn ${attrClass} ${doneCount > 0 ? 'done' : ''} ${isLast ? 'undo-ready' : ''}" onclick="addQuickChore('${fullName}', this)" title="${isLast ? '短時間の再タップで取り消せます' : ''}">${chore}${undoHint} ${checkLabel}</button>`;
                    }).join('')}
                </div>
            </div>
        `;
    }).join('');

    container.innerHTML = favHtml + sectionsHtml;
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
