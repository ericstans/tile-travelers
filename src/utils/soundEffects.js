const SoundEffects = (() => {
    let audioCtx = null;
    let kickInterval = null;
    let isKickPlaying = false;
    
    function getCtx() {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        return audioCtx;
    }
    
    // Master tempo: 150 BPM
    const MASTER_BPM = 150;
    const BEAT_DURATION_MS = 60000 / MASTER_BPM; // 400ms per beat
    const EIGHTH_NOTE_MS = BEAT_DURATION_MS / 2; // 200ms per eighth note
    const EIGHTH_NOTE_SECONDS = EIGHTH_NOTE_MS / 1000;
    
    function playKick() {
        const ctx = getCtx();
        const now = ctx.currentTime;
        
        // Create kick drum sound
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        const filter = ctx.createBiquadFilter();
        
        o.type = 'sine';
        o.frequency.setValueAtTime(60, now); // Low frequency for kick
        o.frequency.exponentialRampToValueAtTime(30, now + 0.1); // Pitch drop
        
        filter.type = 'lowpass';
        filter.frequency.value = 120;
        
        g.gain.setValueAtTime(0.8, now);
        g.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        
        o.connect(filter).connect(g).connect(ctx.destination);
        o.start(now);
        o.stop(now + 0.2);
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
        if (!isKickPlaying) return 0;
        const now = Date.now();
        const timeSinceStart = now % BEAT_DURATION_MS;
        const timeToNextBeat = BEAT_DURATION_MS - timeSinceStart;
        return timeToNextBeat;
    }
    
    function getNextEighthNoteTime() {
        if (!isKickPlaying) return 0;
        const now = Date.now();
        const timeSinceStart = now % EIGHTH_NOTE_MS;
        const timeToNextEighth = EIGHTH_NOTE_MS - timeSinceStart;
        return timeToNextEighth;
    }
    
    function getTimeToNextBeatFromTime(startTime) {
        if (!isKickPlaying) return 0;
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

    return {
        playFootstep,
        playTargetDesignated,
        playTargetReached,
        startKickDrum,
        stopKickDrum,
        getNextBeatTime,
        getNextEighthNoteTime,
        getTimeToNextBeatFromTime,
        MASTER_BPM,
        BEAT_DURATION_MS,
        EIGHTH_NOTE_MS
    };
})();

export default SoundEffects;