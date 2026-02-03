// Audio Manager - Retro sound effects using Web Audio API
const Audio = {
    context: null,
    enabled: true,
    masterVolume: 0.3,

    /**
     * Initialize audio context (must be called after user interaction)
     */
    init() {
        if (this.context) return;

        try {
            this.context = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.warn('Web Audio API not supported');
            this.enabled = false;
        }
    },

    /**
     * Resume audio context if suspended (browsers require user interaction)
     */
    resume() {
        if (this.context && this.context.state === 'suspended') {
            this.context.resume();
        }
    },

    /**
     * Toggle sound on/off
     */
    toggle() {
        this.enabled = !this.enabled;
        return this.enabled;
    },

    /**
     * Set master volume (0-1)
     */
    setVolume(vol) {
        this.masterVolume = Math.max(0, Math.min(1, vol));
    },

    /**
     * Play a tone with given parameters
     */
    playTone(frequency, duration, type = 'square', volume = 1) {
        if (!this.enabled || !this.context) return;

        const oscillator = this.context.createOscillator();
        const gainNode = this.context.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.context.destination);

        oscillator.type = type;
        oscillator.frequency.setValueAtTime(frequency, this.context.currentTime);

        const vol = volume * this.masterVolume;
        gainNode.gain.setValueAtTime(vol, this.context.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + duration);

        oscillator.start(this.context.currentTime);
        oscillator.stop(this.context.currentTime + duration);
    },

    /**
     * Play frequency sweep
     */
    playSweep(startFreq, endFreq, duration, type = 'square', volume = 1) {
        if (!this.enabled || !this.context) return;

        const oscillator = this.context.createOscillator();
        const gainNode = this.context.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.context.destination);

        oscillator.type = type;
        oscillator.frequency.setValueAtTime(startFreq, this.context.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(endFreq, this.context.currentTime + duration);

        const vol = volume * this.masterVolume;
        gainNode.gain.setValueAtTime(vol, this.context.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + duration);

        oscillator.start(this.context.currentTime);
        oscillator.stop(this.context.currentTime + duration);
    },

    /**
     * Play noise burst
     */
    playNoise(duration, volume = 1) {
        if (!this.enabled || !this.context) return;

        const bufferSize = this.context.sampleRate * duration;
        const buffer = this.context.createBuffer(1, bufferSize, this.context.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = this.context.createBufferSource();
        const gainNode = this.context.createGain();

        noise.buffer = buffer;
        noise.connect(gainNode);
        gainNode.connect(this.context.destination);

        const vol = volume * this.masterVolume;
        gainNode.gain.setValueAtTime(vol, this.context.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + duration);

        noise.start(this.context.currentTime);
    },

    // === GAME SOUND EFFECTS ===

    /**
     * Snake turns - short blip
     */
    turn() {
        this.playTone(220, 0.05, 'square', 0.3);
    },

    /**
     * Snake eats node - rising tone
     */
    eat() {
        this.playSweep(200, 600, 0.15, 'square', 0.5);
        // Add a second harmonic for richness
        setTimeout(() => {
            this.playTone(800, 0.1, 'sine', 0.2);
        }, 50);
    },

    /**
     * Snake hits wall - thud/impact
     */
    wallHit() {
        this.playNoise(0.1, 0.4);
        this.playSweep(150, 50, 0.2, 'square', 0.5);
    },

    /**
     * Game over - dramatic descending tones
     */
    gameOver() {
        const notes = [400, 350, 300, 200];
        notes.forEach((freq, i) => {
            setTimeout(() => {
                this.playTone(freq, 0.3, 'square', 0.4);
            }, i * 150);
        });
        // Add noise burst at the end
        setTimeout(() => {
            this.playNoise(0.3, 0.3);
        }, 500);
    },

    /**
     * Game start - ascending tones
     */
    gameStart() {
        const notes = [200, 300, 400, 500];
        notes.forEach((freq, i) => {
            setTimeout(() => {
                this.playTone(freq, 0.1, 'square', 0.3);
            }, i * 80);
        });
    },

    /**
     * Menu select - confirmation beep
     */
    menuSelect() {
        this.playTone(440, 0.08, 'square', 0.3);
        setTimeout(() => {
            this.playTone(660, 0.12, 'square', 0.3);
        }, 80);
    },

    /**
     * Ambient hum - plays continuously in background
     */
    ambientHum: null,
    ambientGain: null,

    startAmbient() {
        if (!this.enabled || !this.context || this.ambientHum) return;

        this.ambientHum = this.context.createOscillator();
        this.ambientGain = this.context.createGain();

        // Very low frequency hum
        this.ambientHum.type = 'sine';
        this.ambientHum.frequency.setValueAtTime(60, this.context.currentTime);

        this.ambientHum.connect(this.ambientGain);
        this.ambientGain.connect(this.context.destination);

        // Very quiet
        this.ambientGain.gain.setValueAtTime(0.02 * this.masterVolume, this.context.currentTime);

        this.ambientHum.start();
    },

    stopAmbient() {
        if (this.ambientHum) {
            this.ambientHum.stop();
            this.ambientHum = null;
            this.ambientGain = null;
        }
    },

    // === PROCEDURAL MUSIC SYSTEM ===

    music: {
        playing: false,
        bpm: 120,
        currentBeat: 0,
        intervalId: null,
        oscillators: [],
        gainNodes: []
    },

    musicEnabled: true,

    /**
     * Toggle music on/off
     */
    toggleMusic() {
        this.musicEnabled = !this.musicEnabled;
        if (this.musicEnabled && this.music.playing) {
            // Music was playing, restart it
            this.startMusic();
        } else if (!this.musicEnabled) {
            this.stopMusic();
        }
        return this.musicEnabled;
    },

    /**
     * Start the procedural chiptune music
     */
    startMusic() {
        if (!this.context || !this.musicEnabled) return;
        if (this.music.playing) return;

        this.music.playing = true;
        this.music.currentBeat = 0;

        // Dark, tense melody in minor key (fits the "classified files" theme)
        // Notes in Hz - A minor / E minor progression
        const bassLine = [
            110, 110, 82.4, 82.4, 98, 98, 110, 110,  // A2, A2, E2, E2, G2, G2, A2, A2
            110, 110, 82.4, 82.4, 73.4, 73.4, 82.4, 82.4  // A2, A2, E2, E2, D2, D2, E2, E2
        ];

        const melody = [
            440, 0, 392, 0, 330, 0, 392, 440,  // A4, rest, G4, rest, E4, rest, G4, A4
            440, 494, 440, 0, 330, 0, 294, 330,  // A4, B4, A4, rest, E4, rest, D4, E4
            0, 392, 0, 330, 294, 0, 330, 0,  // rest, G4, rest, E4, D4, rest, E4, rest
            440, 0, 392, 330, 0, 294, 330, 0   // A4, rest, G4, E4, rest, D4, E4, rest
        ];

        const arpeggio = [
            220, 330, 440, 330, 220, 330, 440, 330,
            165, 247, 330, 247, 165, 247, 330, 247,
            196, 294, 392, 294, 196, 294, 392, 294,
            220, 330, 440, 330, 220, 330, 440, 330
        ];

        const beatDuration = 60000 / this.music.bpm / 2; // Eighth notes

        const playBeat = () => {
            if (!this.music.playing || !this.musicEnabled) {
                this.stopMusic();
                return;
            }

            const beatIndex = this.music.currentBeat % bassLine.length;
            const melodyIndex = this.music.currentBeat % melody.length;
            const arpIndex = this.music.currentBeat % arpeggio.length;

            // Play bass (square wave, low volume)
            if (bassLine[beatIndex] > 0) {
                this.playMusicNote(bassLine[beatIndex], beatDuration / 1000 * 0.8, 'square', 0.15);
            }

            // Play melody (square wave) - only on certain beats for sparseness
            if (melody[melodyIndex] > 0 && this.music.currentBeat % 2 === 0) {
                this.playMusicNote(melody[melodyIndex], beatDuration / 1000 * 0.6, 'square', 0.1);
            }

            // Play arpeggio (triangle wave for softer sound)
            if (arpeggio[arpIndex] > 0) {
                this.playMusicNote(arpeggio[arpIndex], beatDuration / 1000 * 0.3, 'triangle', 0.08);
            }

            this.music.currentBeat++;
        };

        // Start immediately and then loop
        playBeat();
        this.music.intervalId = setInterval(playBeat, beatDuration);
    },

    /**
     * Play a single music note
     */
    playMusicNote(frequency, duration, type, volume) {
        if (!this.context) return;

        const oscillator = this.context.createOscillator();
        const gainNode = this.context.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.context.destination);

        oscillator.type = type;
        oscillator.frequency.setValueAtTime(frequency, this.context.currentTime);

        const vol = volume * this.masterVolume;
        gainNode.gain.setValueAtTime(vol, this.context.currentTime);
        // Quick decay for chiptune feel
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.context.currentTime + duration);

        oscillator.start(this.context.currentTime);
        oscillator.stop(this.context.currentTime + duration + 0.05);
    },

    /**
     * Stop the music
     */
    stopMusic() {
        if (this.music.intervalId) {
            clearInterval(this.music.intervalId);
            this.music.intervalId = null;
        }
        this.music.playing = false;
        this.music.currentBeat = 0;
    },

    /**
     * Pause music (for game over, etc.)
     */
    pauseMusic() {
        if (this.music.intervalId) {
            clearInterval(this.music.intervalId);
            this.music.intervalId = null;
        }
        this.music.playing = false;
    },

    /**
     * Resume music from where it left off
     */
    resumeMusic() {
        if (!this.musicEnabled || !this.enabled) return;
        this.music.playing = false; // Reset so startMusic works
        this.startMusic();
    }
};
