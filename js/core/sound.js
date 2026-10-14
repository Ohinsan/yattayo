// ==========================================================================
// --- 🎵 8-bit Retro Sound Engine (Web Audio API Synthesizer) ---
// ==========================================================================
const SoundEngine = {
    ctx: null,
    bgmGain: null,
    seGain: null,
    bgmVol: 0.3,
    seVol: 0.7,
    bgmPlaying: false,
    filterNode: null,

    init() {
        if (this.ctx) return;
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (!AudioContextClass) return;
        this.ctx = new AudioContextClass();

        // Master Low-pass filter for cozy warm retro warmth (cuts harsh shrill frequencies)
        this.filterNode = this.ctx.createBiquadFilter();
        this.filterNode.type = 'lowpass';
        this.filterNode.frequency.setValueAtTime(2200, this.ctx.currentTime);
        this.filterNode.connect(this.ctx.destination);

        // BGM Gain node
        this.bgmGain = this.ctx.createGain();
        this.bgmGain.gain.setValueAtTime(this.bgmVol, this.ctx.currentTime);
        this.bgmGain.connect(this.filterNode);

        // SE Gain node
        this.seGain = this.ctx.createGain();
        this.seGain.gain.setValueAtTime(this.seVol, this.ctx.currentTime);
        this.seGain.connect(this.ctx.destination);

        // Load saved preferences
        const savedBgm = localStorage.getItem('kajigon_bgm_vol');
        const savedSe = localStorage.getItem('kajigon_se_vol');
        if (savedBgm !== null) {
            this.setBGMVolume(parseFloat(savedBgm));
        }
        if (savedSe !== null) {
            this.setSEVolume(parseFloat(savedSe));
        }
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

    playTone(freq, type, duration, startTime = 0, gainTarget = this.seGain, maxGain = 0.25) {
        if (!this.ctx || !gainTarget || freq <= 0) return;
        try {
            const osc = this.ctx.createOscillator();
            const noteGain = this.ctx.createGain();

            osc.type = type;
            osc.frequency.setValueAtTime(freq, this.ctx.currentTime + startTime);

            noteGain.gain.setValueAtTime(maxGain, this.ctx.currentTime + startTime);
            noteGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + startTime + duration);

            osc.connect(noteGain);
            noteGain.connect(gainTarget);

            osc.start(this.ctx.currentTime + startTime);
            osc.stop(this.ctx.currentTime + startTime + duration);
        } catch (e) {
            // Audio context might be suspended or closed
        }
    },

    playSE(type) {
        this.resume();
        if (this.seVol <= 0 || !this.ctx) return;

        if (type === 'done') {
            // Cheerful mellow 8-bit blip (E5 -> B5 -> E6)
            this.playTone(659.25, 'triangle', 0.09, 0, this.seGain, 0.35);
            this.playTone(987.77, 'square', 0.12, 0.05, this.seGain, 0.3);
            this.playTone(1318.51, 'triangle', 0.22, 0.11, this.seGain, 0.3);
        } else if (type === 'undo') {
            // Cancel sound (G3 -> E3)
            this.playTone(196.00, 'triangle', 0.09, 0, this.seGain, 0.3);
            this.playTone(164.81, 'triangle', 0.14, 0.07, this.seGain, 0.3);
        } else if (type === 'lucky') {
            // Lucky chore fanfare (C5 -> E5 -> G5 -> C6)
            this.playTone(523.25, 'triangle', 0.09, 0, this.seGain, 0.35);
            this.playTone(659.25, 'triangle', 0.09, 0.07, this.seGain, 0.35);
            this.playTone(783.99, 'square', 0.10, 0.14, this.seGain, 0.3);
            this.playTone(1046.50, 'square', 0.28, 0.21, this.seGain, 0.35);
        } else if (type === 'karuta') {
            // Sparkly mystic fortune chimes (F#5 -> A5 -> C#6 -> E6 -> A6)
            this.playTone(739.99, 'triangle', 0.08, 0, this.seGain, 0.3);
            this.playTone(880.00, 'sine', 0.09, 0.06, this.seGain, 0.35);
            this.playTone(1108.73, 'triangle', 0.10, 0.12, this.seGain, 0.35);
            this.playTone(1318.51, 'square', 0.12, 0.18, this.seGain, 0.25);
            this.playTone(1760.00, 'triangle', 0.35, 0.25, this.seGain, 0.3);
        } else if (type === 'bounty') {
            // Sword slash / boss hit impact
            this.playTone(220, 'square', 0.05, 0, this.seGain, 0.4);
            this.playTone(110, 'sawtooth', 0.15, 0.04, this.seGain, 0.45);
            this.playTone(55, 'triangle', 0.25, 0.08, this.seGain, 0.5);
        } else if (type === 'artifact') {
            // Ancient relic sparkle (A5 -> D6 -> F#6 -> A6)
            this.playTone(880.00, 'triangle', 0.08, 0, this.seGain, 0.3);
            this.playTone(1174.66, 'triangle', 0.08, 0.06, this.seGain, 0.3);
            this.playTone(1479.98, 'square', 0.09, 0.12, this.seGain, 0.25);
            this.playTone(1760.00, 'triangle', 0.28, 0.18, this.seGain, 0.3);
        } else if (type === 'levelup') {
            // Victorious fanfare
            const notes = [523.25, 523.25, 523.25, 659.25, 783.99, 1046.50];
            const delays = [0, 0.1, 0.2, 0.3, 0.45, 0.6];
            notes.forEach((n, idx) => {
                this.playTone(n, 'square', idx === 5 ? 0.45 : 0.1, delays[idx], this.seGain, 0.35);
            });
        } else if (type === 'click') {
            // Short soft click
            this.playTone(750, 'triangle', 0.04, 0, this.seGain, 0.2);
        }
    },

    bgmTrack: 'village',

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

        // 5 Distinct Chiptune compositions with chords, walking bass, and mellow melodies
        let chordProgression = [];
        let bassLine = [];
        let melodyLine = [];
        let tickInterval = 280;

        if (this.bgmTrack === 'pop') {
            // --- 🌞 PokoPoko Daily Pop (Lighthearted Uplifting 8-bit Pop) ---
            // C -> G -> Am -> F (Catchy energetic tempo)
            chordProgression = [
                [261.63, 329.63, 392.00], // C
                [196.00, 246.94, 293.66], // G
                [220.00, 261.63, 329.63], // Am
                [174.61, 220.00, 261.63]  // F
            ];
            bassLine = [
                130.81, 130.81, 196.00, 130.81,
                98.00, 98.00, 146.83, 98.00,
                110.00, 110.00, 164.81, 110.00,
                87.31, 87.31, 130.81, 87.31
            ];
            melodyLine = [
                523.25, 659.25, 783.99, 1046.50, 783.99, 659.25, 523.25, 0,
                587.33, 783.99, 587.33, 493.88, 392.00, 493.88, 587.33, 0,
                659.25, 783.99, 880.00, 783.99, 659.25, 523.25, 440.00, 0,
                523.25, 659.25, 783.99, 659.25, 523.25, 440.00, 392.00, 0
            ];
            tickInterval = 190;
        } else if (this.bgmTrack === 'battle') {
            // --- ⚔️ Quest Battle Chiptune (Heroic RPG Battle Track) ---
            // Dm -> Bb -> C -> Dm (Fast, intense, heroic)
            chordProgression = [
                [146.83, 220.00, 261.63], // Dm
                [116.54, 146.83, 233.08], // Bb
                [130.81, 164.81, 196.00], // C
                [146.83, 220.00, 293.66]  // Dm
            ];
            bassLine = [
                146.83, 146.83, 146.83, 220.00,
                116.54, 116.54, 116.54, 174.61,
                130.81, 130.81, 130.81, 196.00,
                146.83, 146.83, 220.00, 293.66
            ];
            melodyLine = [
                587.33, 587.33, 880.00, 783.99, 698.46, 587.33, 698.46, 783.99,
                932.33, 932.33, 880.00, 783.99, 698.46, 587.33, 466.16, 587.33,
                523.25, 659.25, 783.99, 1046.50, 987.77, 783.99, 659.25, 523.25,
                587.33, 698.46, 880.00, 1174.66, 880.00, 698.46, 587.33, 0
            ];
            tickInterval = 160;
        } else if (this.bgmTrack === 'ruins') {
            // --- 📜 Ruins of Time (Ancient Mystic Chill / Lofi) ---
            // Am7 -> Dm7 -> Fmaj7 -> E7
            chordProgression = [
                [220.00, 261.63, 329.63],
                [220.00, 261.63, 329.63],
                [146.83, 220.00, 261.63],
                [146.83, 220.00, 261.63],
                [174.61, 261.63, 329.63],
                [174.61, 261.63, 329.63],
                [164.81, 246.94, 329.63],
                [164.81, 246.94, 329.63]
            ];
            bassLine = [
                110.00, 110.00, 164.81, 110.00,
                146.83, 146.83, 220.00, 146.83,
                87.31, 87.31, 130.81, 87.31,
                82.41, 82.41, 123.47, 82.41,
                110.00, 130.81, 164.81, 220.00,
                146.83, 174.61, 220.00, 261.63,
                174.61, 164.81, 146.83, 130.81,
                82.41, 98.00, 110.00, 123.47
            ];
            melodyLine = [
                440.00, 0, 523.25, 0, 659.25, 587.33, 523.25, 0,
                587.33, 0, 523.25, 0, 440.00, 392.00, 440.00, 0,
                523.25, 0, 659.25, 0, 783.99, 659.25, 523.25, 0,
                659.25, 0, 587.33, 0, 493.88, 440.00, 493.88, 0,
                440.00, 523.25, 659.25, 783.99, 880.00, 0, 783.99, 0,
                659.25, 587.33, 523.25, 440.00, 523.25, 0, 0, 0,
                392.00, 440.00, 523.25, 659.25, 587.33, 0, 523.25, 0,
                493.88, 0, 440.00, 0, 415.30, 0, 440.00, 0
            ];
            tickInterval = 270;
        } else if (this.bgmTrack === 'tavern') {
            // --- 🍻 Cozy Tavern & Fest (Upbeat Folk Chiptune) ---
            // F -> G -> Em -> Am
            chordProgression = [
                [174.61, 220.00, 261.63],
                [174.61, 220.00, 261.63],
                [196.00, 246.94, 293.66],
                [196.00, 246.94, 293.66],
                [164.81, 196.00, 246.94],
                [164.81, 196.00, 246.94],
                [220.00, 261.63, 329.63],
                [220.00, 261.63, 329.63]
            ];
            bassLine = [
                174.61, 174.61, 261.63, 174.61,
                196.00, 196.00, 293.66, 196.00,
                164.81, 164.81, 246.94, 164.81,
                220.00, 220.00, 329.63, 220.00,
                174.61, 220.00, 261.63, 174.61,
                196.00, 246.94, 293.66, 196.00,
                164.81, 196.00, 246.94, 164.81,
                220.00, 196.00, 174.61, 164.81
            ];
            melodyLine = [
                523.25, 587.33, 659.25, 523.25, 587.33, 659.25, 783.99, 0,
                659.25, 783.99, 880.00, 659.25, 783.99, 880.00, 987.77, 0,
                783.99, 659.25, 587.33, 659.25, 523.25, 440.00, 392.00, 0,
                440.00, 523.25, 659.25, 523.25, 440.00, 0, 523.25, 0,
                659.25, 0, 783.99, 0, 880.00, 783.99, 659.25, 0,
                587.33, 659.25, 783.99, 659.25, 587.33, 523.25, 440.00, 0,
                523.25, 659.25, 783.99, 880.00, 783.99, 659.25, 587.33, 0,
                523.25, 0, 440.00, 0, 523.25, 0, 0, 0
            ];
            tickInterval = 210;
        } else {
            // --- 🏡 Default: Pokésleep & Cozy Tamagotchi Room (Lo-Fi Warm 8-bit) ---
            // Cmaj7 -> Am7 -> Dm7 -> G7 (Classic mellow loop)
            chordProgression = [
                [261.63, 329.63, 392.00, 493.88],
                [261.63, 329.63, 392.00, 493.88],
                [220.00, 261.63, 329.63, 392.00],
                [220.00, 261.63, 329.63, 392.00],
                [146.83, 220.00, 261.63, 349.23],
                [146.83, 220.00, 261.63, 349.23],
                [196.00, 246.94, 293.66, 349.23],
                [196.00, 246.94, 293.66, 349.23]
            ];
            bassLine = [
                130.81, 0, 196.00, 130.81,
                110.00, 0, 164.81, 110.00,
                146.83, 0, 220.00, 146.83,
                98.00, 0, 146.83, 196.00,
                130.81, 164.81, 196.00, 246.94,
                220.00, 196.00, 164.81, 130.81,
                146.83, 174.61, 220.00, 261.63,
                196.00, 174.61, 146.83, 123.47
            ];
            melodyLine = [
                523.25, 0, 659.25, 0, 783.99, 0, 659.25, 523.25,
                440.00, 0, 523.25, 0, 659.25, 0, 523.25, 0,
                587.33, 0, 523.25, 0, 440.00, 0, 392.00, 440.00,
                392.00, 0, 493.88, 0, 523.25, 0, 0, 0,
                783.99, 0, 659.25, 0, 523.25, 659.25, 783.99, 0,
                880.00, 0, 783.99, 0, 659.25, 0, 523.25, 0,
                587.33, 659.25, 587.33, 523.25, 440.00, 0, 493.88, 0,
                523.25, 0, 392.00, 0, 523.25, 0, 0, 0
            ];
            tickInterval = 290;
        }

        const totalSteps = melodyLine.length;

        this.bgmTimer = setInterval(() => {
            if (!this.bgmPlaying || this.bgmVol <= 0) return;

            const step = this.bgmStep % totalSteps;

            // 1. Warm Chord Pad (Soft triangle wave every 4 steps / measure start)
            if (step % 4 === 0) {
                const chordIdx = Math.floor(step / 4) % chordProgression.length;
                const chord = chordProgression[chordIdx];
                if (chord) {
                    chord.forEach((freq) => {
                        this.playTone(freq, 'triangle', 1.05, 0, this.bgmGain, 0.08);
                    });
                }
            }

            // 2. Soft Bassline (Round low sine/triangle)
            const bass = bassLine[step % bassLine.length];
            if (bass && bass > 0) {
                this.playTone(bass, 'triangle', 0.22, 0, this.bgmGain, 0.22);
            }

            // 3. Relaxing Melodic Lead (Gentle chime / soft square with decay)
            const mel = melodyLine[step];
            if (mel && mel > 0) {
                this.playTone(mel, 'sine', 0.24, 0, this.bgmGain, 0.20);
                // Subtle shimmer octave up
                if (step % 8 === 0) {
                    this.playTone(mel * 2, 'triangle', 0.15, 0.02, this.bgmGain, 0.05);
                }
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

// Open and Close Sound Modal
function openSoundModal() {
    SoundEngine.resume();
    SoundEngine.playSE('click');
    const modal = document.getElementById('sound-modal');
    if (modal) modal.classList.remove('hidden');

    // Sync sliders & track select
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

// User-interaction sound ignition
window.addEventListener('click', function() {
    SoundEngine.resume();
}, { once: true });
window.addEventListener('touchstart', function() {
    SoundEngine.resume();
}, { once: true });

