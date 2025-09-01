const SoundEffects = (() => {
    let audioCtx = null;
    let kickInterval = null;
    let isKickPlaying = false;
    let audioReady = false;
    
    function getCtx() {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        return audioCtx;
    }
    
    function ensureAudioReady() {
        if (!audioReady) {
            const ctx = getCtx();
            if (ctx.state === 'suspended') {
                return false; // Audio not ready yet
            }
            audioReady = true;
        }
        return true;
    }
    
    // Master tempo: 150 BPM
    const MASTER_BPM = 150;
    const BEAT_DURATION_MS = 60000 / MASTER_BPM; // 400ms per beat
    const EIGHTH_NOTE_MS = BEAT_DURATION_MS / 2; // 200ms per eighth note
    const EIGHTH_NOTE_SECONDS = EIGHTH_NOTE_MS / 1000;
    
    function playKick() {
        if (!ensureAudioReady()) return;
        
        const ctx = getCtx();
        const now = ctx.currentTime;
        
        // Create kick drum sound
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        const filter = ctx.createBiquadFilter();
        const saturator = ctx.createWaveShaper();
        
        // Saturation curve for warm distortion
        const saturationCurve = new Float32Array(65536);
        for (let i = 0; i < 65536; i++) {
            const x = (i - 32768) / 32768;
            saturationCurve[i] = Math.tanh(x * 2) * 0.7; // Soft saturation
        }
        saturator.curve = saturationCurve;
        
        o.type = 'sine';
        o.frequency.setValueAtTime(60, now); // Low frequency for kick
        o.frequency.exponentialRampToValueAtTime(30, now + 0.1); // Pitch drop
        
        filter.type = 'lowpass';
        filter.frequency.value = 120;
        
        g.gain.setValueAtTime(0.8, now);
        g.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        
        o.connect(filter).connect(saturator).connect(g).connect(ctx.destination);
        o.start(now);
        o.stop(now + 0.2);
    }
    
    // Standalone kick drum function for empty tiles
    function playKickDrum() {
        playKick();
    }
    
    function startKickDrum() {
        if (isKickPlaying) return;
        isKickPlaying = true;
        
        // Play initial kick
        playKick();
        
        // Set up interval for regular kicks
        kickInterval = setInterval(() => {
            playKick();
        }, BEAT_DURATION_MS);
    }
    
    function getNextBeatTime() {
        const now = performance.now();
        const timeSinceStart = now % BEAT_DURATION_MS;
        const timeToNextBeat = BEAT_DURATION_MS - timeSinceStart;
        return timeToNextBeat;
    }
    
    function getNextEighthNoteTime() {
        const now = performance.now();
        const timeSinceStart = now % EIGHTH_NOTE_MS;
        const timeToNextEighth = EIGHTH_NOTE_MS - timeSinceStart;
        return timeToNextEighth;
    }
    
    function getTimeToNextBeatFromTime(startTime) {
        const timeSinceStart = startTime % BEAT_DURATION_MS;
        const timeToNextBeat = BEAT_DURATION_MS - timeSinceStart;
        return timeToNextBeat;
    }
    
    function stopKickDrum() {
        if (!isKickPlaying) return;
        isKickPlaying = false;
        
        if (kickInterval) {
            clearInterval(kickInterval);
            kickInterval = null;
        }
    }
    
    function playFootstep() {
        if (!ensureAudioReady()) return;
        
        const ctx = getCtx();
        const duration = 0.06;
        const bufferSize = ctx.sampleRate * duration;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * 0.22 * (1 - i / bufferSize);
        }
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 470 + Math.random() * 60;
        source.connect(filter).connect(ctx.destination);
        source.start();
        source.stop(ctx.currentTime + duration);
    }

    function playTargetDesignated() {
        if (!ensureAudioReady()) return;
        
        const ctx = getCtx();
        const now = ctx.currentTime;
        
        // Pleasant chime sound for target designation
        const notes = [523.25, 659.25, 783.99]; // C5, E5, G5 (C major chord)
        notes.forEach((freq, i) => {
            const o = ctx.createOscillator();
            const g = ctx.createGain();
            o.type = 'sine';
            o.frequency.value = freq;
            const startTime = now + i * EIGHTH_NOTE_SECONDS;
            g.gain.setValueAtTime(0, startTime);
            g.gain.linearRampToValueAtTime(0.15, startTime + 0.01);
            g.gain.linearRampToValueAtTime(0, startTime + EIGHTH_NOTE_SECONDS * 0.8);
            o.connect(g).connect(ctx.destination);
            o.start(startTime);
            o.stop(startTime + EIGHTH_NOTE_SECONDS * 0.8);
        });
    }

    function playTargetReached() {
        if (!ensureAudioReady()) return;
        
        const ctx = getCtx();
        const now = ctx.currentTime;
        
        // Pleasant chime sound for target designation
        const notes = [349.23, 440.00, 523.25]; // F4, A4, C5 (F major chord)
        notes.forEach((freq, i) => {
            const o = ctx.createOscillator();
            const g = ctx.createGain();
            o.type = 'sine';
            o.frequency.value = freq;
            const startTime = now + i * EIGHTH_NOTE_SECONDS;
            g.gain.setValueAtTime(0, startTime);
            g.gain.linearRampToValueAtTime(0.15, startTime + 0.01);
            g.gain.linearRampToValueAtTime(0, startTime + EIGHTH_NOTE_SECONDS * 0.8);
            o.connect(g).connect(ctx.destination);
            o.start(startTime);
            o.stop(startTime + EIGHTH_NOTE_SECONDS * 0.8);
        });
    }

    // Generic character sound effects
    function playCharacterFootstep(charId, charConfig) {
        if (!ensureAudioReady()) return;
        
        const ctx = getCtx();
        const duration = charConfig.footstepDuration;
        const bufferSize = ctx.sampleRate * duration;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * charConfig.footstepVolume * (1 - i / bufferSize);
        }
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = charConfig.footstepFreq.min + Math.random() * (charConfig.footstepFreq.max - charConfig.footstepFreq.min);
        source.connect(filter).connect(ctx.destination);
        source.start();
        source.stop(ctx.currentTime + duration);
    }

    function playCharacterTargetDesignated(charId, charConfig) {
        if (!ensureAudioReady()) return;
        
        const ctx = getCtx();
        const now = ctx.currentTime;
        
        const notes = charConfig.chordDesignated;
        notes.forEach((freq, i) => {
                const o = ctx.createOscillator();
                const g = ctx.createGain();
            o.type = charConfig.waveType;
                o.frequency.value = freq;
            const startTime = now + i * EIGHTH_NOTE_SECONDS;
            g.gain.setValueAtTime(0, startTime);
            g.gain.linearRampToValueAtTime(0.12, startTime + 0.01);
            g.gain.linearRampToValueAtTime(0, startTime + EIGHTH_NOTE_SECONDS * 0.8);
                o.connect(g).connect(ctx.destination);
            o.start(startTime);
            o.stop(startTime + EIGHTH_NOTE_SECONDS * 0.8);
        });
    }

    function playCharacterTargetReached(charId, charConfig) {
        if (!ensureAudioReady()) return;
        
        const ctx = getCtx();
        const now = ctx.currentTime;
        
        const notes = charConfig.chordReached;
        notes.forEach((freq, i) => {
            const o = ctx.createOscillator();
            const g = ctx.createGain();
            o.type = charConfig.waveType;
            o.frequency.value = freq;
            const startTime = now + i * EIGHTH_NOTE_SECONDS;
            g.gain.setValueAtTime(0, startTime);
            g.gain.linearRampToValueAtTime(0.12, startTime + 0.01);
            g.gain.linearRampToValueAtTime(0, startTime + EIGHTH_NOTE_SECONDS * 0.8);
            o.connect(g).connect(ctx.destination);
            o.start(startTime);
            o.stop(startTime + EIGHTH_NOTE_SECONDS * 0.8);
        });
    }

    // Percussion sound effects for tile objects
    function playPercussionSound(objectType, charId) {
        if (!ensureAudioReady()) return;
        
        const ctx = getCtx();
        const now = ctx.currentTime;
        
        switch (objectType) {
            case 'hihat':
                // Hi hat - short, crisp sound
                const hihatOsc = ctx.createOscillator();
                const hihatGain = ctx.createGain();
                const hihatFilter = ctx.createBiquadFilter();
                
                hihatOsc.type = 'square';
                hihatOsc.frequency.value = 8000 + Math.random() * 2000;
                hihatFilter.type = 'highpass';
                hihatFilter.frequency.value = 5000;
                hihatGain.gain.setValueAtTime(0.3, now);
                hihatGain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
                
                hihatOsc.connect(hihatFilter).connect(hihatGain).connect(ctx.destination);
                hihatOsc.start(now);
                hihatOsc.stop(now + 0.1);
                break;
                
            case 'shaker':
                // Shaker - more realistic maraca/shaker sound
                const shakerBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.3, ctx.sampleRate);
                const shakerData = shakerBuffer.getChannelData(0);
                for (let i = 0; i < shakerData.length; i++) {
            const t = i / ctx.sampleRate;
                    // Create multiple frequency components for realistic shaker sound
                    const noise = (Math.random() * 2 - 1) * 0.3;
                    const envelope = Math.exp(-t * 8); // Quick decay
                    const highFreq = Math.sin(t * 2 * Math.PI * 8000) * 0.1;
                    const midFreq = Math.sin(t * 2 * Math.PI * 4000) * 0.15;
                    shakerData[i] = (noise + highFreq + midFreq) * envelope;
                }
                const shakerSource = ctx.createBufferSource();
                shakerSource.buffer = shakerBuffer;
                const shakerGain = ctx.createGain();
                const shakerFilter = ctx.createBiquadFilter();
                shakerFilter.type = 'highpass';
                shakerFilter.frequency.value = 2000;
                shakerGain.gain.setValueAtTime(0.5, now);
                shakerGain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
                shakerSource.connect(shakerFilter).connect(shakerGain).connect(ctx.destination);
                shakerSource.start(now);
                shakerSource.stop(now + 0.3);
                break;
                
            case 'clap':
                // Clap - more realistic hand clap with multiple layers and saturation
                const clapBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.25, ctx.sampleRate);
                const clapData = clapBuffer.getChannelData(0);
                for (let i = 0; i < clapData.length; i++) {
                    const t = i / ctx.sampleRate;
                    // Create multiple clap layers with slight timing differences
                    const clap1 = (Math.random() * 2 - 1) * 0.4 * Math.exp(-t * 20);
                    const clap2 = (Math.random() * 2 - 1) * 0.3 * Math.exp(-(t - 0.002) * 25);
                    const clap3 = (Math.random() * 2 - 1) * 0.2 * Math.exp(-(t - 0.004) * 30);
                    // Add some tonal content for realism
                    const tone = Math.sin(t * 2 * Math.PI * 200) * 0.1 * Math.exp(-t * 15);
                    clapData[i] = (clap1 + clap2 + clap3 + tone) * 0.8;
                }
                const clapSource = ctx.createBufferSource();
                clapSource.buffer = clapBuffer;
                const clapGain = ctx.createGain();
                const clapFilter = ctx.createBiquadFilter();
                const clapSaturator = ctx.createWaveShaper();
                
                // Saturation curve for clap
                const clapSaturationCurve = new Float32Array(65536);
                for (let i = 0; i < 65536; i++) {
                    const x = (i - 32768) / 32768;
                    clapSaturationCurve[i] = Math.tanh(x * 1.5) * 0.8; // Moderate saturation
                }
                clapSaturator.curve = clapSaturationCurve;
                
                clapFilter.type = 'bandpass';
                clapFilter.frequency.value = 1000;
                clapFilter.Q.value = 2;
                clapGain.gain.setValueAtTime(0.7, now);
                clapGain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
                clapSource.connect(clapFilter).connect(clapSaturator).connect(clapGain).connect(ctx.destination);
                clapSource.start(now);
                clapSource.stop(now + 0.25);
                break;
                
            case 'snare':
                // Snare - more realistic snare drum with body, snare wire, and saturation
                const snareBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.4, ctx.sampleRate);
                const snareData = snareBuffer.getChannelData(0);
                for (let i = 0; i < snareData.length; i++) {
                    const t = i / ctx.sampleRate;
                    // Snare body (drum shell resonance)
                    const bodyFreq = 150 + Math.random() * 50;
                    const body = Math.sin(t * 2 * Math.PI * bodyFreq) * 0.3 * Math.exp(-t * 8);
                    // Snare wire rattle (high frequency noise)
                    const snareWire = (Math.random() * 2 - 1) * 0.4 * Math.exp(-t * 12);
                    // Initial attack transient
                    const attack = (Math.random() * 2 - 1) * 0.6 * Math.exp(-t * 25);
                    // Combine all elements
                    snareData[i] = (body + snareWire + attack) * 0.7;
                }
                const snareSource = ctx.createBufferSource();
                snareSource.buffer = snareBuffer;
                const snareGain = ctx.createGain();
                const snareFilter = ctx.createBiquadFilter();
                const snareSaturator = ctx.createWaveShaper();
                
                // Saturation curve for snare
                const snareSaturationCurve = new Float32Array(65536);
                for (let i = 0; i < 65536; i++) {
                    const x = (i - 32768) / 32768;
                    snareSaturationCurve[i] = Math.tanh(x * 1.8) * 0.75; // Strong saturation for punch
                }
                snareSaturator.curve = snareSaturationCurve;
                
                snareFilter.type = 'bandpass';
                snareFilter.frequency.value = 800;
                snareFilter.Q.value = 1.5;
                snareGain.gain.setValueAtTime(0.6, now);
                snareGain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
                snareSource.connect(snareFilter).connect(snareSaturator).connect(snareGain).connect(ctx.destination);
                snareSource.start(now);
                snareSource.stop(now + 0.4);
                break;
        }
    }

    function initializeAudio() {
        const ctx = getCtx();
        if (ctx.state === 'suspended') {
            return ctx.resume().then(() => {
                audioReady = true;
                return true;
            });
        }
        audioReady = true;
        return Promise.resolve(true);
    }
    
    function isAudioReady() {
        return audioReady;
    }

    // Wrapper functions that will be called from the main game
    function playFootstep(charId) {
        // For backward compatibility, if no charId provided, use Bob's config
        if (!charId) {
            return playFootstep('bob');
        }
        // This will be called with character config from main game
        return playCharacterFootstep(charId, arguments[1]);
    }

    function playTargetDesignated(charId) {
        if (!charId) {
            return playTargetDesignated('bob');
        }
        return playCharacterTargetDesignated(charId, arguments[1]);
    }

    function playTargetReached(charId) {
        if (!charId) {
            return playTargetReached('bob');
        }
        return playCharacterTargetReached(charId, arguments[1]);
    }

    // Bass note management for Bassline Bob
    let currentBassOscillator = null;
    let currentBassGain = null;

    function startBassNote(frequency, volume) {
        if (!ensureAudioReady()) return;
        
        // Stop any existing bass note
        stopBassNote();
        
        const ctx = getCtx();
        const now = ctx.currentTime;
        
        // Create bass oscillator
        currentBassOscillator = ctx.createOscillator();
        currentBassGain = ctx.createGain();
        
        currentBassOscillator.type = 'sine';
        currentBassOscillator.frequency.setValueAtTime(frequency, now);
        
        // Smooth fade in
        currentBassGain.gain.setValueAtTime(0, now);
        currentBassGain.gain.linearRampToValueAtTime(volume, now + 0.1); // 100ms fade in
        
        currentBassOscillator.connect(currentBassGain).connect(ctx.destination);
        currentBassOscillator.start(now);
    }

    function stopBassNote() {
        if (currentBassOscillator && currentBassGain) {
            const ctx = getCtx();
            const now = ctx.currentTime;
            
            // Smooth fade out
            currentBassGain.gain.linearRampToValueAtTime(0, now + 0.1); // 100ms fade out
            
            // Stop oscillator after fade out
            currentBassOscillator.stop(now + 0.1);
            
            currentBassOscillator = null;
            currentBassGain = null;
        }
    }

    function isBassNotePlaying() {
        return currentBassOscillator !== null;
    }

    return {
        playFootstep,
        playTargetDesignated,
        playTargetReached,
        playPercussionSound,
        playKickDrum,
        startKickDrum,
        stopKickDrum,
        getNextBeatTime,
        getNextEighthNoteTime,
        getTimeToNextBeatFromTime,
        initializeAudio,
        isAudioReady,
        MASTER_BPM,
        BEAT_DURATION_MS,
        EIGHTH_NOTE_MS,
        startBassNote,
        stopBassNote,
        isBassNotePlaying
    };
})();

export default SoundEffects;
