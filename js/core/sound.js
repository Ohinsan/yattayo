// ==========================================================================
// --- 🎵 Cozy Acoustic Sound Engine (Web Audio API Synthesizer) ---
// ==========================================================================
// 耳に優しいアコースティック調（サイン波＋三角波）のサウンドエンジン
// おうち時間（朝・昼・夕・夜）に連動する穏やかな牧歌的オリジナルBGM＆家事コンボ音
// ==========================================================================

const SoundEngine = {
    ctx: null,
    bgmGain: null,
    seGain: null,
    reverbGain: null,
    filterNode: null,
    bgmVol: 0.3,
    seVol: 0.7,
    bgmPlaying: false,
    bgmTimer: null,
    bgmStep: 0,
    bgmTrack: 'kokoto_auto', // ⏰ デフォルト: おうち時間連動モード

    // 家事コンボ（15分以内の連続記録でド・レ・ミ・ファ・ソ・ラ・シ・ド）
    lastChoreTime: 0,
    choreComboCount: 0,

    /**
     * 現在時刻の時間帯スロットを取得
     * @returns {'morning' | 'noon' | 'evening' | 'night'}
     */
    getTimeSlot() {
        const h = new Date().getHours();
        if (h >= 5 && h < 11) return 'morning';  // 朝: 5:00 - 10:59
        if (h >= 11 && h < 17) return 'noon';     // 昼: 11:00 - 16:59
        if (h >= 17 && h < 20) return 'evening';  // 夕方: 17:00 - 19:59
        return 'night';                           // 夜: 20:00 - 4:59
    },

    init() {
        if (this.ctx) return;
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (!AudioContextClass) return;
        this.ctx = new AudioContextClass();

        // 1. マスター ローパスフィルター（耳に刺さる超高域をカットし、温かみのあるアコースティックな響きに）
        this.filterNode = this.ctx.createBiquadFilter();
        this.filterNode.type = 'lowpass';
        this.filterNode.frequency.setValueAtTime(2100, this.ctx.currentTime);
        this.filterNode.Q.setValueAtTime(0.7, this.ctx.currentTime);
        this.filterNode.connect(this.ctx.destination);

        // 2. 擬似アコースティック・リバーブ（優しい余韻のためのディレイ＆フィードバックループ）
        try {
            const delay = this.ctx.createDelay();
            delay.delayTime.setValueAtTime(0.065, this.ctx.currentTime); // 65msの微小反射

            const feedback = this.ctx.createGain();
            feedback.gain.setValueAtTime(0.24, this.ctx.currentTime); // 自然な残響減衰

            const delayFilter = this.ctx.createBiquadFilter();
            delayFilter.type = 'lowpass';
            delayFilter.frequency.setValueAtTime(1500, this.ctx.currentTime); // 残響はさらにマイルドに

            delay.connect(delayFilter);
            delayFilter.connect(feedback);
            feedback.connect(delay);

            this.reverbGain = this.ctx.createGain();
            this.reverbGain.gain.setValueAtTime(0.35, this.ctx.currentTime);
            delayFilter.connect(this.reverbGain);
            this.reverbGain.connect(this.filterNode);
        } catch (e) {
            console.warn('Reverb node init failed:', e);
        }

        // 3. BGM Gain ノード
        this.bgmGain = this.ctx.createGain();
        this.bgmGain.gain.setValueAtTime(this.bgmVol, this.ctx.currentTime);
        this.bgmGain.connect(this.filterNode);

        // 4. SE Gain ノード
        this.seGain = this.ctx.createGain();
        this.seGain.gain.setValueAtTime(this.seVol, this.ctx.currentTime);
        this.seGain.connect(this.filterNode);

        // ユーザー設定の読み込み
        const savedBgm = localStorage.getItem('kajigon_bgm_vol');
        const savedSe = localStorage.getItem('kajigon_se_vol');
        if (savedBgm !== null) this.setBGMVolume(parseFloat(savedBgm));
        if (savedSe !== null) this.setSEVolume(parseFloat(savedSe));

        const savedTrack = localStorage.getItem('kajigon_bgm_track');
        if (savedTrack) this.bgmTrack = savedTrack;

        const savedComboTime = localStorage.getItem('kajigon_last_chore_time');
        const savedComboCount = localStorage.getItem('kajigon_chore_combo_count');
        if (savedComboTime) this.lastChoreTime = parseInt(savedComboTime, 10) || 0;
        if (savedComboCount) this.choreComboCount = parseInt(savedComboCount, 10) || 0;
    },

    resume() {
        if (!this.ctx) this.init();
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    },

    setBGMVolume(val) {
        this.bgmVol = Math.max(0, Math.min(1, val));
        if (this.bgmGain && this.ctx) {
            this.bgmGain.gain.setValueAtTime(this.bgmVol, this.ctx.currentTime);
        }
        localStorage.setItem('kajigon_bgm_vol', this.bgmVol);
        const slider = document.getElementById('bgmVolumeSlider');
        const text = document.getElementById('bgm-vol-text');
        if (slider) slider.value = Math.round(this.bgmVol * 100);
        if (text) text.textContent = `${Math.round(this.bgmVol * 100)}%`;
        const toggleBtn = document.getElementById('btn-sound-toggle');
        if (toggleBtn) {
            toggleBtn.textContent = (this.bgmVol === 0 && this.seVol === 0) ? '🔇' : '🔊';
        }
    },

    setSEVolume(val) {
        this.seVol = Math.max(0, Math.min(1, val));
        if (this.seGain && this.ctx) {
            this.seGain.gain.setValueAtTime(this.seVol, this.ctx.currentTime);
        }
        localStorage.setItem('kajigon_se_vol', this.seVol);
        const slider = document.getElementById('seVolumeSlider');
        const text = document.getElementById('se-vol-text');
        if (slider) slider.value = Math.round(this.seVol * 100);
        if (text) text.textContent = `${Math.round(this.seVol * 100)}%`;
        const toggleBtn = document.getElementById('btn-sound-toggle');
        if (toggleBtn) {
            toggleBtn.textContent = (this.bgmVol === 0 && this.seVol === 0) ? '🔇' : '🔊';
        }
    },

    /**
     * オルゴール・マリンバ・アコースティック調の温かいトーン生成
     * @param {number} freq 周波数 (Hz)
     * @param {number} duration 減衰までの秒数
     * @param {number} startTime 開始遅延秒数
     * @param {AudioNode} gainTarget 出力先
     * @param {number} maxGain 音量
     * @param {string} instrument 'musicbox' | 'marimba' | 'flute' | 'guitar' | 'water'
     */
    playWarmTone(freq, duration = 0.35, startTime = 0, gainTarget = this.seGain, maxGain = 0.28, instrument = 'musicbox') {
        if (!this.ctx || !gainTarget || freq <= 0) return;
        const now = this.ctx.currentTime + startTime;

        try {
            // 基音（Sine波: ピュアでまろやかな芯）
            const osc1 = this.ctx.createOscillator();
            const gain1 = this.ctx.createGain();
            osc1.type = 'sine';
            osc1.frequency.setValueAtTime(freq, now);

            // 倍音（Triangle波: 木質・オルゴールの温かみ）
            const osc2 = this.ctx.createOscillator();
            const gain2 = this.ctx.createGain();
            osc2.type = 'triangle';
            osc2.frequency.setValueAtTime(freq, now);

            if (instrument === 'flute') {
                // フルート・オカリナ: 優しいアタックと持続、ほのかなビブラート
                const attackTime = 0.05;
                gain1.gain.setValueAtTime(0.0001, now);
                gain1.gain.linearRampToValueAtTime(maxGain * 0.72, now + attackTime);
                gain1.gain.exponentialRampToValueAtTime(0.0001, now + duration);

                gain2.gain.setValueAtTime(0.0001, now);
                gain2.gain.linearRampToValueAtTime(maxGain * 0.28, now + attackTime);
                gain2.gain.exponentialRampToValueAtTime(0.0001, now + duration);

                // 牧歌的なビブラート（LFO）
                const lfo = this.ctx.createOscillator();
                const lfoGain = this.ctx.createGain();
                lfo.frequency.setValueAtTime(5.4, now);
                lfoGain.gain.setValueAtTime(3.2, now);
                lfo.connect(osc1.frequency);
                lfo.start(now);
                lfo.stop(now + duration);
            } else if (instrument === 'water') {
                // 水滴・タップ音: ぽちゃん…と丸く跳ねる
                osc1.frequency.setValueAtTime(freq * 1.15, now);
                osc1.frequency.exponentialRampToValueAtTime(freq, now + 0.06);

                gain1.gain.setValueAtTime(0.0001, now);
                gain1.gain.linearRampToValueAtTime(maxGain * 0.85, now + 0.008);
                gain1.gain.exponentialRampToValueAtTime(0.0001, now + duration);

                gain2.gain.setValueAtTime(0.0001, now);
                gain2.gain.linearRampToValueAtTime(maxGain * 0.15, now + 0.008);
                gain2.gain.exponentialRampToValueAtTime(0.0001, now + duration * 0.6);
            } else if (instrument === 'marimba') {
                // マリンバ: ポクッとした木の打音
                const attackTime = 0.006;
                gain1.gain.setValueAtTime(0.0001, now);
                gain1.gain.linearRampToValueAtTime(maxGain * 0.8, now + attackTime);
                gain1.gain.exponentialRampToValueAtTime(0.0001, now + duration * 0.8);

                gain2.gain.setValueAtTime(0.0001, now);
                gain2.gain.linearRampToValueAtTime(maxGain * 0.35, now + attackTime);
                gain2.gain.exponentialRampToValueAtTime(0.0001, now + duration * 0.5);
            } else {
                // オルゴール / アコースティックギター: 優しいポロンという音と長い余韻
                const attackTime = 0.008;
                gain1.gain.setValueAtTime(0.0001, now);
                gain1.gain.linearRampToValueAtTime(maxGain * 0.75, now + attackTime);
                gain1.gain.exponentialRampToValueAtTime(0.0001, now + duration);

                gain2.gain.setValueAtTime(0.0001, now);
                gain2.gain.linearRampToValueAtTime(maxGain * 0.35, now + attackTime);
                gain2.gain.exponentialRampToValueAtTime(0.0001, now + duration * 0.85);

                // きらめき打音（微量なオクターブ倍音）
                if (instrument === 'musicbox') {
                    const oscSparkle = this.ctx.createOscillator();
                    const gainSparkle = this.ctx.createGain();
                    oscSparkle.type = 'sine';
                    oscSparkle.frequency.setValueAtTime(freq * 2, now);
                    gainSparkle.gain.setValueAtTime(0.0001, now);
                    gainSparkle.gain.linearRampToValueAtTime(maxGain * 0.16, now + 0.004);
                    gainSparkle.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);

                    oscSparkle.connect(gainSparkle);
                    gainSparkle.connect(gainTarget);
                    oscSparkle.start(now);
                    oscSparkle.stop(now + 0.13);
                }
            }

            osc1.connect(gain1);
            gain1.connect(gainTarget);
            osc2.connect(gain2);
            gain2.connect(gainTarget);

            osc1.start(now);
            osc2.start(now);
            osc1.stop(now + duration);
            osc2.stop(now + duration);
        } catch (e) {
            // Audio context suspended or closed
        }
    },

    // 互換用ラッパー
    playTone(freq, type, duration, startTime = 0, gainTarget = this.seGain, maxGain = 0.25) {
        this.playWarmTone(freq, duration, startTime, gainTarget, maxGain, 'musicbox');
    },

    /**
     * 🎵 家事コンボ音（15分以内の連続記録で「ド・レ・ミ・ファ・ソ・ラ・シ・ド」と上昇）
     * @returns {{ combo: number, noteName: string, isMax: boolean }}
     */
    playChoreCombo() {
        this.resume();
        if (this.seVol <= 0 || !this.ctx) {
            return { combo: 1, noteName: 'ド', isMax: false };
        }

        const now = Date.now();
        const comboLimit = 15 * 60 * 1000; // 15分（ミリ秒）

        if (this.lastChoreTime > 0 && (now - this.lastChoreTime) <= comboLimit) {
            this.choreComboCount = Math.min(8, (this.choreComboCount || 0) + 1);
        } else {
            this.choreComboCount = 1;
        }

        this.lastChoreTime = now;
        localStorage.setItem('kajigon_last_chore_time', this.lastChoreTime);
        localStorage.setItem('kajigon_chore_combo_count', this.choreComboCount);

        // 8段階のピッチ（C5〜C6 ド・レ・ミ・ファ・ソ・ラ・シ・ド）
        const scale = [
            { note: 'ド', freq: 523.25 },   // C5
            { note: 'レ', freq: 587.33 },   // D5
            { note: 'ミ', freq: 659.25 },   // E5
            { note: 'ファ', freq: 698.46 },  // F5
            { note: 'ソ', freq: 783.99 },   // G5
            { note: 'ラ', freq: 880.00 },   // A5
            { note: 'シ', freq: 987.77 },   // B5
            { note: '高いド', freq: 1046.50 } // C6 (MAX!)
        ];

        const idx = Math.max(0, Math.min(scale.length - 1, this.choreComboCount - 1));
        const current = scale[idx];
        const isMax = this.choreComboCount >= 8;

        if (isMax) {
            // 8コンボ達成！キラキラ輝くオルゴール・ファンファーレ（C-E-G-C-E）
            const arpeggio = [
                { f: 523.25, d: 0.00 },
                { f: 659.25, d: 0.08 },
                { f: 783.99, d: 0.16 },
                { f: 1046.50, d: 0.24 },
                { f: 1318.51, d: 0.34 },
                { f: 1567.98, d: 0.44 }
            ];
            arpeggio.forEach(item => {
                this.playWarmTone(item.f, 0.55, item.d, this.seGain, 0.35, 'musicbox');
            });
            // 優しいマリンバの低音添え
            this.playWarmTone(261.63, 0.65, 0.24, this.seGain, 0.28, 'marimba');
        } else {
            // 1〜7コンボ: 基音＋完全5度のポロ〜ンとした温かいマリンバ・オルゴール音
            this.playWarmTone(current.freq, 0.45, 0, this.seGain, 0.35, 'musicbox');
            // 5度上の和音で優しさを演出
            const fifthFreq = current.freq * 1.4983;
            this.playWarmTone(fifthFreq, 0.38, 0.03, this.seGain, 0.18, 'musicbox');
        }

        return {
            combo: this.choreComboCount,
            noteName: current.note,
            isMax: isMax
        };
    },

    /**
     * 🎵 まとめて奉納モード用：連続コンボ音階（ド・レ・ミ・ファ・ソ・ラ・シ・ド♪）＋最終ステップでコンボファンファーレ
     * @param {number} stepIndex 0始まりの現在インデックス
     * @param {number} totalSteps 選択された合計件数
     */
    playBatchComboStep(stepIndex, totalSteps) {
        this.resume();
        const scale = [
            { note: 'ド', freq: 523.25 },    // C5
            { note: 'レ', freq: 587.33 },    // D5
            { note: 'ミ', freq: 659.25 },    // E5
            { note: 'ファ', freq: 698.46 },   // F5
            { note: 'ソ', freq: 783.99 },    // G5
            { note: 'ラ', freq: 880.00 },    // A5
            { note: 'シ', freq: 987.77 },    // B5
            { note: '高いド', freq: 1046.50 } // C6
        ];

        const now = Date.now();
        this.lastChoreTime = now;
        this.choreComboCount = Math.min(8, stepIndex + 1);
        localStorage.setItem('kajigon_last_chore_time', this.lastChoreTime);
        localStorage.setItem('kajigon_chore_combo_count', this.choreComboCount);

        const idx = stepIndex % scale.length;
        const current = scale[idx];
        const isLastStep = (stepIndex >= totalSteps - 1);

        if (this.seVol <= 0 || !this.ctx) {
            return { step: stepIndex + 1, noteName: current.note, isLast: isLastStep };
        }

        // 駆け上がる音階ノートを鳴らす
        this.playWarmTone(current.freq, 0.36, 0, this.seGain, 0.36, 'musicbox');
        const fifthFreq = current.freq * 1.4983;
        this.playWarmTone(fifthFreq, 0.30, 0.02, this.seGain, 0.18, 'musicbox');

        // 最終オーブ射出時に爽快なコンボファンファーレを鳴らす！
        if (isLastStep) {
            const fanfareDelay = 0.10;
            const arpeggio = [
                { f: 523.25, d: fanfareDelay + 0.00 },
                { f: 659.25, d: fanfareDelay + 0.07 },
                { f: 783.99, d: fanfareDelay + 0.14 },
                { f: 1046.50, d: fanfareDelay + 0.21 },
                { f: 1318.51, d: fanfareDelay + 0.30 },
                { f: 1567.98, d: fanfareDelay + 0.40 }
            ];
            arpeggio.forEach(item => {
                this.playWarmTone(item.f, 0.55, item.d, this.seGain, 0.36, 'musicbox');
            });
            this.playWarmTone(261.63, 0.65, fanfareDelay + 0.21, this.seGain, 0.28, 'marimba');
        }

        return {
            step: stepIndex + 1,
            noteName: current.note,
            isLast: isLastStep
        };
    },

    playSE(type) {
        this.resume();
        if (this.seVol <= 0 || !this.ctx) return;

        // 🥚 Task 3: 卵ステージ（Lv.1〜2 / STAGE: EGG）の間はセリフ表示時の発話SEを鳴らさない（ミュート）
        if (type === 'talk' || type === 'speech' || type === 'voice') {
            if (typeof getCompanionStage === 'function' && typeof getLevel === 'function') {
                if (getCompanionStage(getLevel()) === 'egg') {
                    return;
                }
            }
            this.playWarmTone(750, 0.05, 0, this.seGain, 0.20, 'water');
            return;
        }

        if (type === 'done') {
            // 家事コンボ音を優先呼出
            this.playChoreCombo();
        } else if (type === 'undo') {
            // 水滴の取り消し音（ポチャン…）
            this.playWarmTone(392.00, 0.16, 0, this.seGain, 0.28, 'water');
            this.playWarmTone(293.66, 0.28, 0.06, this.seGain, 0.25, 'water');
        } else if (type === 'lucky') {
            // ラッキー家事: アコースティックギター＆オルゴールのアルペジオ
            const notes = [523.25, 659.25, 783.99, 1046.50];
            const delays = [0, 0.08, 0.16, 0.25];
            notes.forEach((f, i) => {
                this.playWarmTone(f, 0.45, delays[i], this.seGain, 0.32, 'musicbox');
            });
        } else if (type === 'karuta') {
            // かるた・おみくじ: 澄んだウィンドチャイム風アルペジオ
            const notes = [739.99, 880.00, 1108.73, 1318.51, 1760.00];
            const delays = [0, 0.06, 0.12, 0.18, 0.26];
            notes.forEach((f, i) => {
                this.playWarmTone(f, 0.48, delays[i], this.seGain, 0.28, 'musicbox');
            });
        } else if (type === 'bounty') {
            // ボス討伐: ウッドブロック調のパーカッション
            this.playWarmTone(330, 0.12, 0, this.seGain, 0.35, 'marimba');
            this.playWarmTone(220, 0.18, 0.05, this.seGain, 0.4, 'marimba');
            this.playWarmTone(110, 0.30, 0.10, this.seGain, 0.45, 'guitar');
        } else if (type === 'artifact') {
            // 古代遺物・家具: 神秘的なハープの爪弾き
            const notes = [880.00, 1174.66, 1479.98, 1760.00];
            const delays = [0, 0.07, 0.14, 0.22];
            notes.forEach((f, i) => {
                this.playWarmTone(f, 0.50, delays[i], this.seGain, 0.28, 'musicbox');
            });
        } else if (type === 'levelup' || type === 'level_up') {
            // レベルアップ / 同期成功: 温かみのあるアコースティック・ベルファンファーレ
            const notes = [523.25, 523.25, 659.25, 783.99, 1046.50, 1318.51];
            const delays = [0, 0.10, 0.20, 0.32, 0.46, 0.62];
            notes.forEach((f, i) => {
                this.playWarmTone(f, i === 5 ? 0.8 : 0.4, delays[i], this.seGain, 0.35, 'musicbox');
            });
            this.playWarmTone(261.63, 0.7, 0.46, this.seGain, 0.28, 'marimba');
        } else if (type === 'click') {
            // 水滴・ウッドノックのような耳に優しいクリック音
            this.playWarmTone(750, 0.05, 0, this.seGain, 0.20, 'water');
        }
    },

    setBGMTrack(trackName) {
        this.bgmTrack = trackName;
        localStorage.setItem('kajigon_bgm_track', trackName);
        if (this.bgmPlaying) {
            this.stopBGM();
            this.startBGM();
        }
    },

    startBGM() {
        this.resume();
        if (this.bgmPlaying || !this.ctx) return;
        this.bgmPlaying = true;
        this.bgmStep = 0;
        const text = document.getElementById('bgm-toggle-btn-text');
        if (text) text.textContent = 'BGM 一時停止';

        // ======================================================================
        // 🏡 オリジナル・アコースティック・コージーBGM（朝・昼・夕・夜）
        // ======================================================================
        let effectiveTrack = this.bgmTrack;
        if (effectiveTrack === 'kokoto_auto') {
            effectiveTrack = 'kokoto_' + this.getTimeSlot();
        }

        let arpeggios = [];
        let bassLine = [];
        let fluteMelody = [];
        let marimbaEcho = [];
        let tickInterval = 280; // 1ステップあたりのミリ秒
        let melodyInstrument = 'flute';

        if (effectiveTrack === 'kokoto_morning') {
            // 🌅 朝露と目覚めのフルート（軽快なフルート主旋律＋明るいリュートのアルペジオ）
            // C -> Fmaj7 -> G -> C
            arpeggios = [
                [261.63, 329.63, 392.00, 523.25], // C
                [174.61, 261.63, 329.63, 349.23], // Fmaj7
                [196.00, 246.94, 293.66, 392.00], // G
                [261.63, 329.63, 392.00, 523.25]  // C
            ];
            bassLine = [130.81, 130.81, 174.61, 174.61, 196.00, 196.00, 130.81, 130.81];
            fluteMelody = [
                523.25, 0, 659.25, 783.99, 880.00, 783.99, 659.25, 523.25,
                587.33, 0, 698.46, 880.00, 783.99, 698.46, 587.33, 0,
                783.99, 0, 880.00, 987.77, 1046.50, 987.77, 783.99, 659.25,
                523.25, 0, 659.25, 783.99, 523.25, 0, 0, 0
            ];
            marimbaEcho = [0, 523.25, 0, 659.25, 0, 783.99, 0, 0];
            tickInterval = 230; // 軽快な朝テンポ
            melodyInstrument = 'flute';

        } else if (effectiveTrack === 'kokoto_evening') {
            // 🌇 夕方: 茜色の家路（少しノスタルジックで温かいオカリナとリュート）
            // Am7 -> Fmaj7 -> G -> Em7
            arpeggios = [
                [220.00, 261.63, 329.63, 392.00], // Am7
                [174.61, 220.00, 261.63, 349.23], // Fmaj7
                [196.00, 246.94, 293.66, 392.00], // G
                [164.81, 196.00, 246.94, 329.63]  // Em7
            ];
            bassLine = [110.00, 0, 87.31, 0, 98.00, 0, 82.41, 0];
            fluteMelody = [
                440.00, 0, 523.25, 0, 659.25, 587.33, 523.25, 0,
                587.33, 0, 523.25, 440.00, 392.00, 440.00, 523.25, 0,
                659.25, 0, 587.33, 0, 523.25, 440.00, 392.00, 0,
                440.00, 0, 523.25, 0, 440.00, 0, 0, 0
            ];
            marimbaEcho = [0, 440.00, 0, 392.00, 0, 440.00, 0, 0];
            tickInterval = 290;
            melodyInstrument = 'flute';

        } else if (effectiveTrack === 'kokoto_night') {
            // 🌙 夜: 静寂の星空（静かなオルゴール＆リュートの優しい夜アレンジ）
            // Cmaj7 -> Fmaj7 -> Em7 -> Am7
            arpeggios = [
                [261.63, 329.63, 392.00, 493.88],
                [174.61, 220.00, 261.63, 329.63],
                [164.81, 196.00, 246.94, 329.63],
                [220.00, 261.63, 329.63, 440.00]
            ];
            bassLine = [130.81, 0, 87.31, 0, 82.41, 0, 110.00, 0];
            fluteMelody = [
                523.25, 0, 0, 659.25, 0, 0, 783.99, 0,
                659.25, 0, 523.25, 0, 440.00, 0, 0, 0,
                587.33, 0, 0, 523.25, 0, 0, 440.00, 0,
                392.00, 0, 493.88, 0, 523.25, 0, 0, 0
            ];
            marimbaEcho = [0, 523.25, 0, 0, 0, 659.25, 0, 0];
            tickInterval = 320; // ゆったり深い夜テンポ
            melodyInstrument = 'musicbox'; // 夜はオルゴール主旋律！

        } else if (this.bgmTrack === 'pop') {
            // 🌞 日だまりの朝カフェ（アコースティック・カントリーポップ）
            arpeggios = [
                [261.63, 329.63, 392.00, 523.25],
                [196.00, 246.94, 293.66, 392.00],
                [220.00, 261.63, 329.63, 440.00],
                [174.61, 220.00, 261.63, 349.23]
            ];
            bassLine = [130.81, 130.81, 98.00, 98.00, 110.00, 110.00, 87.31, 87.31];
            fluteMelody = [
                523.25, 0, 659.25, 783.99, 659.25, 523.25, 0, 0,
                587.33, 0, 493.88, 392.00, 493.88, 587.33, 0, 0,
                659.25, 0, 783.99, 880.00, 783.99, 659.25, 0, 0,
                523.25, 0, 659.25, 523.25, 440.00, 392.00, 0, 0
            ];
            marimbaEcho = [0, 523.25, 0, 659.25, 0, 783.99, 0, 0];
            tickInterval = 210;

        } else if (this.bgmTrack === 'battle') {
            // ⚔️ 勇者の旅立ち（アコースティック・ケルト風バトル）
            arpeggios = [
                [146.83, 220.00, 261.63, 293.66],
                [116.54, 146.83, 233.08, 293.66],
                [130.81, 164.81, 196.00, 261.63],
                [146.83, 220.00, 293.66, 349.23]
            ];
            bassLine = [146.83, 146.83, 116.54, 116.54, 130.81, 130.81, 146.83, 146.83];
            fluteMelody = [
                587.33, 0, 880.00, 783.99, 698.46, 587.33, 0, 698.46,
                783.99, 0, 880.00, 783.99, 698.46, 587.33, 0, 0,
                523.25, 0, 659.25, 783.99, 659.25, 523.25, 0, 0,
                587.33, 0, 880.00, 698.46, 587.33, 0, 0, 0
            ];
            marimbaEcho = [0, 0, 0, 587.33, 0, 0, 0, 698.46];
            tickInterval = 180;

        } else if (this.bgmTrack === 'ruins') {
            // 📜 古代の静寂（神秘的なハープ＆木管）
            arpeggios = [
                [220.00, 261.63, 329.63, 440.00],
                [146.83, 220.00, 261.63, 349.23],
                [174.61, 220.00, 261.63, 329.63],
                [164.81, 246.94, 329.63, 392.00]
            ];
            bassLine = [110.00, 0, 146.83, 0, 87.31, 0, 82.41, 0];
            fluteMelody = [
                440.00, 0, 523.25, 0, 659.25, 587.33, 523.25, 0,
                587.33, 0, 523.25, 0, 440.00, 392.00, 440.00, 0,
                523.25, 0, 659.25, 0, 783.99, 659.25, 523.25, 0,
                493.88, 0, 440.00, 0, 415.30, 0, 440.00, 0
            ];
            marimbaEcho = [0, 659.25, 0, 0, 0, 523.25, 0, 0];
            tickInterval = 290;

        } else if (this.bgmTrack === 'tavern') {
            // 🍻 酒場と収穫祭（陽気なアコースティック・フォークワルツ）
            arpeggios = [
                [174.61, 220.00, 261.63, 349.23],
                [196.00, 246.94, 293.66, 392.00],
                [164.81, 196.00, 246.94, 329.63],
                [220.00, 261.63, 329.63, 440.00]
            ];
            bassLine = [174.61, 174.61, 196.00, 196.00, 164.81, 164.81, 220.00, 220.00];
            fluteMelody = [
                523.25, 587.33, 659.25, 523.25, 587.33, 659.25, 783.99, 0,
                659.25, 783.99, 880.00, 659.25, 783.99, 880.00, 987.77, 0,
                783.99, 659.25, 587.33, 659.25, 523.25, 440.00, 392.00, 0,
                440.00, 523.25, 659.25, 523.25, 440.00, 0, 523.25, 0
            ];
            marimbaEcho = [0, 392.00, 0, 523.25, 0, 392.00, 0, 523.25];
            tickInterval = 220;

        } else {
            // 🏡 昼（または kokoto_noon / village）: 陽だまりの広場風ココット村
            // Cmaj7 -> Am7 -> Dm7 -> G7
            arpeggios = [
                [261.63, 329.63, 392.00, 493.88], // Cmaj7
                [220.00, 261.63, 329.63, 392.00], // Am7
                [146.83, 220.00, 261.63, 349.23], // Dm7
                [196.00, 246.94, 293.66, 349.23]  // G7
            ];
            bassLine = [
                130.81, 0, 196.00, 130.81,
                110.00, 0, 164.81, 110.00,
                146.83, 0, 220.00, 146.83,
                98.00,  0, 146.83, 196.00
            ];
            fluteMelody = [
                523.25, 0, 659.25, 0, 783.99, 0, 659.25, 523.25,
                440.00, 0, 523.25, 0, 659.25, 0, 523.25, 0,
                587.33, 0, 523.25, 0, 440.00, 0, 392.00, 440.00,
                392.00, 0, 493.88, 0, 523.25, 0, 0, 0,
                783.99, 0, 659.25, 0, 523.25, 659.25, 783.99, 0,
                880.00, 0, 783.99, 0, 659.25, 0, 523.25, 0,
                587.33, 659.25, 587.33, 523.25, 440.00, 0, 493.88, 0,
                523.25, 0, 392.00, 0, 523.25, 0, 0, 0
            ];
            marimbaEcho = [
                0, 523.25, 0, 659.25, 0, 0, 0, 523.25,
                0, 440.00, 0, 523.25, 0, 0, 0, 440.00,
                0, 587.33, 0, 523.25, 0, 0, 0, 392.00,
                0, 392.00, 0, 493.88, 0, 0, 0, 523.25
            ];
            tickInterval = 270;
            melodyInstrument = 'flute';
        }

        const totalSteps = fluteMelody.length;

        this.bgmTimer = setInterval(() => {
            if (!this.bgmPlaying || this.bgmVol <= 0) return;

            const step = this.bgmStep % totalSteps;

            // 1. アコースティックギターの分散和音（フィンガーピッキング調アルペジオ）
            const chordGroupIdx = Math.floor(step / 8) % arpeggios.length;
            const chordGroup = arpeggios[chordGroupIdx];
            if (chordGroup && chordGroup.length > 0) {
                const noteInChord = chordGroup[step % chordGroup.length];
                if (noteInChord) {
                    this.playWarmTone(noteInChord, 0.45, 0, this.bgmGain, 0.12, 'guitar');
                }
            }

            // 2. ウッドベース（ふくよかな低音でテンポを支える）
            const bass = bassLine[step % bassLine.length];
            if (bass && bass > 0) {
                this.playWarmTone(bass, 0.50, 0, this.bgmGain, 0.22, 'guitar');
            }

            // 3. 木管フルート/オカリナ/オルゴールの優しいメロディ
            const mel = fluteMelody[step];
            if (mel && mel > 0) {
                this.playWarmTone(mel, 0.58, 0, this.bgmGain, 0.19, melodyInstrument);
            }

            // 4. マリンバのポコポコした装飾打音
            const mar = marimbaEcho[step % marimbaEcho.length];
            if (mar && mar > 0) {
                this.playWarmTone(mar, 0.25, 0.05, this.bgmGain, 0.11, 'marimba');
            }

            this.bgmStep++;
        }, tickInterval);
    },

    stopBGM() {
        this.bgmPlaying = false;
        if (this.bgmTimer) {
            clearInterval(this.bgmTimer);
            this.bgmTimer = null;
        }
        const text = document.getElementById('bgm-toggle-btn-text');
        if (text) text.textContent = 'BGM 再生する';
    },

    toggleBGM() {
        if (this.bgmPlaying) {
            this.stopBGM();
        } else {
            this.startBGM();
        }
    }
};

// モーダル制御
function openSoundModal() {
    SoundEngine.resume();
    SoundEngine.playSE('click');
    const modal = document.getElementById('sound-modal');
    if (modal) modal.classList.remove('hidden');

    const sliderBgm = document.getElementById('bgmVolumeSlider');
    const sliderSe = document.getElementById('seVolumeSlider');
    const trackSelect = document.getElementById('bgmTrackSelect');
    if (sliderBgm) sliderBgm.value = Math.round(SoundEngine.bgmVol * 100);
    if (sliderSe) sliderSe.value = Math.round(SoundEngine.seVol * 100);
    if (trackSelect) trackSelect.value = SoundEngine.bgmTrack;
}

function closeSoundModal() {
    SoundEngine.playSE('click');
    const modal = document.getElementById('sound-modal');
    if (modal) modal.classList.add('hidden');
}

function onBgmVolumeChange(val) {
    const num = parseInt(val, 10) / 100;
    SoundEngine.setBGMVolume(num);
    if (num > 0 && !SoundEngine.bgmPlaying) {
        SoundEngine.startBGM();
    } else if (num === 0 && SoundEngine.bgmPlaying) {
        SoundEngine.stopBGM();
    }
}

function onSeVolumeChange(val) {
    const num = parseInt(val, 10) / 100;
    SoundEngine.setSEVolume(num);
}

// ユーザー操作によるオーディオ着火
window.addEventListener('click', function() {
    SoundEngine.resume();
}, { once: true });
window.addEventListener('touchstart', function() {
    SoundEngine.resume();
}, { once: true });

// グローバルヘルパー関数
function playSE(type) {
    if (typeof SoundEngine !== 'undefined') SoundEngine.playSE(type);
}
function toggleBGM() {
    if (typeof SoundEngine !== 'undefined') SoundEngine.toggleBGM();
}
function setBGMTrack(track) {
    if (typeof SoundEngine !== 'undefined') SoundEngine.setBGMTrack(track);
}
