
export function playTurnEnded() {
    // Soft C minor 11 chord (C Eb G Bb D F) that fades in
    const ctx = getCtx();
    const now = ctx.currentTime;
    // Frequencies for C3, Eb3, G3, Bb3, D4, F4
    const freqs = [130.81, 155.56, 196.00, 233.08, 293.66, 349.23];
    for (let i = 0; i < freqs.length; ++i) {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = i < 3 ? 'triangle' : 'sine'; // lower notes triangle, upper sine for air
        o.frequency.value = freqs[i];
        g.gain.setValueAtTime(0, now);
        g.gain.linearRampToValueAtTime(0.13, now + 0.22 + i * 0.03); // fade in, staggered for shimmer
        g.gain.linearRampToValueAtTime(0.11, now + 0.7);
        g.gain.linearRampToValueAtTime(0, now + 1.5);
        o.connect(g).connect(ctx.destination);
        o.start(now);
        o.stop(now + 1.5);
    }
}
const SoundEffects = (() => {
    let audioCtx = null;
    function getCtx() {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        return audioCtx;
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
    // 1. House: short Japanese subway-style melody with sustained C-E chord
    function playHouse() {
        const ctx = getCtx();
        const now = ctx.currentTime;
    const notes = [392.00, 523.25, 587.33]; // G4, C5, D5
        notes.forEach((freq, i) => {
            const o = ctx.createOscillator();
            const g = ctx.createGain();
            o.type = 'triangle';
            o.frequency.value = freq;
            g.gain.value = 0.18;
            o.connect(g).connect(ctx.destination);
            o.start(now + i * 0.18);
            o.stop(now + i * 0.18 + 0.16);
            g.gain.setValueAtTime(0.18, now + i * 0.18);
            g.gain.linearRampToValueAtTime(0, now + i * 0.18 + 0.16);
        });
        // Sustained C-E chord (C5, E5)
        const chordFreqs = [523.25, 659.25];
        chordFreqs.forEach((freq) => {
            const o = ctx.createOscillator();
            const g = ctx.createGain();
            o.type = 'sine';
            o.frequency.value = freq;
            g.gain.setValueAtTime(0.09, now);
            g.gain.linearRampToValueAtTime(0, now + 0.7);
            o.connect(g).connect(ctx.destination);
            o.start(now);
            o.stop(now + 0.7);
        });
    }
    // 2. Tree: chime melody with a sustained sus chord (D-G-A)
    function playTree() {
        const ctx = getCtx();
        const now = ctx.currentTime;
        // Chime melody
        const notes = [440, 587, 784]; // A4, D5, G5
        notes.forEach((freq, i) => {
            const o = ctx.createOscillator();
            const g = ctx.createGain();
            o.type = 'triangle';
            o.frequency.value = freq;
            g.gain.value = 0.16;
            o.connect(g).connect(ctx.destination);
            o.start(now + i * 0.16);
            o.stop(now + i * 0.16 + 0.13);
            g.gain.setValueAtTime(0.16, now + i * 0.16);
            g.gain.linearRampToValueAtTime(0, now + i * 0.16 + 0.13);
        });
        // Sustained sus chord (D-G-A, D4 G4 A4)
        const chordFreqs = [293.66, 392.00, 440.00];
        chordFreqs.forEach((freq) => {
            const o = ctx.createOscillator();
            const g = ctx.createGain();
            o.type = 'sine';
            o.frequency.value = freq;
            g.gain.setValueAtTime(0.09, now);
            g.gain.linearRampToValueAtTime(0, now + 0.7);
            o.connect(g).connect(ctx.destination);
            o.start(now);
            o.stop(now + 0.7);
        });
    }
    // 3. Well: bubbling water (modulated white noise bursts) with muffled constant noise layer
    function playWell() {
        const ctx = getCtx();
        const now = ctx.currentTime;
        // Muffled, constant noise layer (lowpass filtered, more present)
        const noiseDur = 1.1;
        const noiseBufferSize = ctx.sampleRate * noiseDur;
        const noiseBuffer = ctx.createBuffer(1, noiseBufferSize, ctx.sampleRate);
        const noiseData = noiseBuffer.getChannelData(0);
        for (let i = 0; i < noiseBufferSize; i++) {
            noiseData[i] = (Math.random() * 2 - 1) * 0.13 * (1 - i / noiseBufferSize);
        }
        const noiseSource = ctx.createBufferSource();
        noiseSource.buffer = noiseBuffer;
        const noiseFilter = ctx.createBiquadFilter();
        noiseFilter.type = 'lowpass';
        noiseFilter.frequency.value = 220;
        const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.33, now);
        noiseGain.gain.linearRampToValueAtTime(0, now + noiseDur);
        noiseSource.connect(noiseFilter).connect(noiseGain).connect(ctx.destination);
        noiseSource.start(now);
        noiseSource.stop(now + noiseDur);

        // Bubbling bursts (as before)
        for (let i = 0; i < 4; ++i) {
            const dur = 0.12 + Math.random() * 0.07;
            const bufferSize = ctx.sampleRate * dur;
            const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let j = 0; j < bufferSize; j++) {
                data[j] = (Math.random() * 2 - 1) * 0.18 * Math.exp(-j / bufferSize * 4);
            }
            const source = ctx.createBufferSource();
            source.buffer = buffer;
            const filter = ctx.createBiquadFilter();
            filter.type = 'bandpass';
            filter.frequency.value = 600 + Math.random() * 200;
            source.connect(filter).connect(ctx.destination);
            source.start(now + i * 0.13);
            source.stop(now + i * 0.13 + dur);
        }
    }
    // 4. Windmill: gentle filtered white noise (wind)
    function playWindmill() {
        const ctx = getCtx();
        const now = ctx.currentTime;
        const dur = 1.2;
        const bufferSize = ctx.sampleRate * dur;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * 0.13 * (1 - i / bufferSize);
        }
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 700 + Math.random() * 200;
        source.connect(filter).connect(ctx.destination);
        source.start(now);
        source.stop(now + dur);
    }
    // 5. Farm: chicken "Ba-gawk" (synthesized)
    function playFarm() {
        const ctx = getCtx();
        const now = ctx.currentTime;
        // "Ba-" part: short, higher, percussive burst
        const o1 = ctx.createOscillator();
        const g1 = ctx.createGain();
        o1.type = 'square';
        o1.frequency.setValueAtTime(420, now);
        o1.frequency.linearRampToValueAtTime(340, now + 0.09);
        g1.gain.setValueAtTime(0.22, now);
        g1.gain.linearRampToValueAtTime(0, now + 0.09);
        o1.connect(g1).connect(ctx.destination);
        o1.start(now);
        o1.stop(now + 0.09);
        // "gawk" part: glissando up, then down, with a bit of noise
        const o2 = ctx.createOscillator();
        const g2 = ctx.createGain();
        o2.type = 'triangle';
        o2.frequency.setValueAtTime(660, now + 0.09);
        o2.frequency.linearRampToValueAtTime(1100, now + 0.22);
        o2.frequency.linearRampToValueAtTime(570, now + 0.38);
        g2.gain.setValueAtTime(0.19, now + 0.09);
        g2.gain.linearRampToValueAtTime(0.13, now + 0.22);
        g2.gain.linearRampToValueAtTime(0, now + 0.38);
        o2.connect(g2).connect(ctx.destination);
        o2.start(now + 0.09);
        o2.stop(now + 0.38);
        // Add a short burst of filtered noise for "k" sound
        const noiseDur = 0.07;
        const bufferSize = ctx.sampleRate * noiseDur;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * 0.18 * (1 - i / bufferSize);
        }
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        const filter = ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = 1200;
        const g3 = ctx.createGain();
        g3.gain.setValueAtTime(0.13, now + 0.18);
        g3.gain.linearRampToValueAtTime(0, now + 0.18 + noiseDur);
        noise.connect(filter).connect(g3).connect(ctx.destination);
        noise.start(now + 0.18);
        noise.stop(now + 0.18 + noiseDur);
    }
    // 6. Castle: regal, bell-like chord progression with a touch of reverb
    function playCastle() {
        const ctx = getCtx();
        const now = ctx.currentTime;
        // Chord progression: C major -> G major
        const chords = [
            [523.25, 659.25, 783.99], // C5, E5, G5
            [392.00, 493.88, 783.99], // G4, B4, G5
        ];
        chords.forEach((chord, cIdx) => {
            chord.forEach((freq, i) => {
                const o = ctx.createOscillator();
                const g = ctx.createGain();
                o.type = 'sine';
                o.frequency.value = freq;
                // Bell-like effect: add quick attack, slow decay
                g.gain.setValueAtTime(0, now + cIdx * 0.45);
                g.gain.linearRampToValueAtTime(0.23, now + cIdx * 0.45 + 0.04 + i * 0.01);
                g.gain.linearRampToValueAtTime(0.07, now + cIdx * 0.45 + 0.22 + i * 0.01);
                g.gain.linearRampToValueAtTime(0, now + cIdx * 0.45 + 0.44 + i * 0.01);
                o.connect(g).connect(ctx.destination);
                o.start(now + cIdx * 0.45);
                o.stop(now + cIdx * 0.45 + 0.44 + i * 0.01);
            });
        });
        // Optional: add a soft white noise "reverb tail"
        const dur = 0.7;
        const bufferSize = ctx.sampleRate * dur;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * 0.04 * (1 - i / bufferSize);
        }
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 1200;
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.08, now + 0.7);
        g.gain.linearRampToValueAtTime(0, now + 1.2);
        noise.connect(filter).connect(g).connect(ctx.destination);
        noise.start(now + 0.7);
        noise.stop(now + 1.2);
    }
    // 7. Shop: cash register chime
    function playShop() {
        const ctx = getCtx();
        const now = ctx.currentTime;
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = 'triangle';
        o.frequency.setValueAtTime(880, now);
        o.frequency.linearRampToValueAtTime(1320, now + 0.13);
        g.gain.setValueAtTime(0.18, now);
        g.gain.linearRampToValueAtTime(0, now + 0.18);
        o.connect(g).connect(ctx.destination);
        o.start(now);
        o.stop(now + 0.18);
        // Add a quick "ding"
        const o2 = ctx.createOscillator();
        const g2 = ctx.createGain();
        o2.type = 'sine';
        o2.frequency.value = 1760;
        g2.gain.setValueAtTime(0.13, now + 0.09);
        g2.gain.linearRampToValueAtTime(0, now + 0.18);
        o2.connect(g2).connect(ctx.destination);
        o2.start(now + 0.09);
        o2.stop(now + 0.18);
    }

    // 8. Factory: longer, rumbly machine running sound
    function playFactory() {
        const ctx = getCtx();
        const now = ctx.currentTime;
        // Rhythmic, industrial machine rumble
    const dur = 2.9; // shorter overall
    const chugCount = 10;
    const chugInterval = (dur / chugCount) * 0.8; // a hair faster (shorter interval)
        // Global output gain for fade-out
        const globalGain = ctx.createGain();
        globalGain.gain.setValueAtTime(1, now);
        globalGain.gain.linearRampToValueAtTime(0, now + dur);

        // First chug layer (original)
        for (let i = 0; i < chugCount; i++) {
            const chugDur = 0.32 + Math.random() * 0.07;
            const bufferSize = ctx.sampleRate * chugDur;
            const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let j = 0; j < bufferSize; j++) {
                const t = j / ctx.sampleRate;
                const mod = 0.7 + 0.3 * Math.sin(2 * Math.PI * (2.2 + Math.random()*0.5) * t);
                data[j] = (Math.random() * 2 - 1) * 0.19 * mod * (1 - j / bufferSize);
            }
            const noise = ctx.createBufferSource();
            noise.buffer = buffer;
            const filter = ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.value = 120 + Math.random() * 30;
            const g = ctx.createGain();
            g.gain.setValueAtTime(0.22, now + i * chugInterval);
            g.gain.linearRampToValueAtTime(0, now + i * chugInterval + chugDur);
            noise.connect(filter).connect(g).connect(globalGain);
            noise.start(now + i * chugInterval);
            noise.stop(now + i * chugInterval + chugDur);
        }

        // Second chug layer: similar pitch and filter to first chug layer, but polyrhythmic
    const chug2Count = 5;
    const chug2Interval = (dur / chug2Count) * 1.7; // much slower for contrast
        // Offset the second chug layer so its first hit is between the first chug hits, and make it louder for clarity
        const chug2Offset = chug2Interval / 2;
        for (let i = 0; i < chug2Count; i++) {
            const chugDur = 0.13 + Math.random() * 0.06;
            const bufferSize = ctx.sampleRate * chugDur;
            const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let j = 0; j < bufferSize; j++) {
                const t = j / ctx.sampleRate;
                // Very close pitch to first chug layer (2.2-2.7 Hz mod)
                const mod = 0.7 + 0.3 * Math.sin(2 * Math.PI * (2.2 + Math.random()*0.5) * t);
                data[j] = (Math.random() * 2 - 1) * 0.33 * mod * (1 - j / bufferSize); // louder
            }
            const noise = ctx.createBufferSource();
            noise.buffer = buffer;
            const filter = ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.value = 120 + Math.random() * 30;
            const g = ctx.createGain();
            g.gain.setValueAtTime(0.44, now + i * chug2Interval + chug2Offset);
            g.gain.linearRampToValueAtTime(0, now + i * chug2Interval + chug2Offset + chugDur);
            noise.connect(filter).connect(g).connect(globalGain);
            noise.start(now + i * chug2Interval + chug2Offset);
            noise.stop(now + i * chug2Interval + chug2Offset + chugDur);
        }

        // Deep sub-bass oscillator for industrial weight
    const sub = ctx.createOscillator();
    sub.type = 'sine';
    sub.frequency.setValueAtTime(38, now);
    sub.frequency.linearRampToValueAtTime(32, now + dur);
    const subGain = ctx.createGain();
    subGain.gain.setValueAtTime(0.19, now);
    subGain.gain.linearRampToValueAtTime(0, now + dur);
    sub.connect(subGain).connect(globalGain);
    sub.start(now);
    sub.stop(now + dur);

        // Rhythmic metallic clanks
        const clankInterval = 0.47; // a bit faster
        const clankCount = Math.floor(dur / clankInterval);
        for (let i = 0; i < clankCount; i++) {
            const o = ctx.createOscillator();
            o.type = 'triangle';
            o.frequency.setValueAtTime(420 + Math.random()*60, now + i * clankInterval);
            o.frequency.linearRampToValueAtTime(180, now + i * clankInterval + 0.13);
            const g = ctx.createGain();
            g.gain.setValueAtTime(0.13, now + i * clankInterval);
            g.gain.linearRampToValueAtTime(0, now + i * clankInterval + 0.13);
            o.connect(g).connect(globalGain);
            o.start(now + i * clankInterval);
            o.stop(now + i * clankInterval + 0.13);
        }

        // Connect global gain to output
        globalGain.connect(ctx.destination);
    // ...existing code...
    }

    // 9. Lighthouse: bright shimmer
    function playLighthouse() {
        const ctx = getCtx();
        const now = ctx.currentTime;
        // Shimmer: fast arpeggio
        const notes = [1046, 1318, 1568, 2093]; // C6, E6, G6, C7
        notes.forEach((freq, i) => {
            const o = ctx.createOscillator();
            const g = ctx.createGain();
            o.type = 'triangle';
            o.frequency.value = freq;
            g.gain.value = 0.13;
            o.connect(g).connect(ctx.destination);
            o.start(now + i * 0.06);
            o.stop(now + i * 0.06 + 0.09);
            g.gain.setValueAtTime(0.13, now + i * 0.06);
            g.gain.linearRampToValueAtTime(0, now + i * 0.06 + 0.09);
        });
    }

    // 10. Hot Spring: sizzling/steam effect
    function playHotspring() {
        const ctx = getCtx();
        const now = ctx.currentTime;
        // Sizzle/steam: filtered white noise, highpass for hiss, quick decay
        const dur = 1.1;
        const bufferSize = ctx.sampleRate * dur;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            // Slight amplitude modulation for a "flickering" sizzle
            const t = i / ctx.sampleRate;
            const mod = 0.7 + 0.3 * Math.sin(2 * Math.PI * 7 * t + Math.sin(2 * Math.PI * 2 * t));
            data[i] = (Math.random() * 2 - 1) * 0.13 * mod * (1 - i / bufferSize);
        }
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        const filter = ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = 1200;
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.17, now);
        g.gain.linearRampToValueAtTime(0, now + dur);
        source.connect(filter).connect(g).connect(ctx.destination);
        source.start(now);
        source.stop(now + dur);
    }

    // 11. Library: soft page flip and chime (with page-flip noise)
    function playLibrary() {
        const ctx = getCtx();
        const now = ctx.currentTime;
        // Page flip: filtered noise burst
        const dur = 0.28;
        const bufferSize = ctx.sampleRate * dur;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * 0.09 * (1 - i / bufferSize);
        }
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        const filter = ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = 1800;
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.11, now);
        g.gain.linearRampToValueAtTime(0, now + dur);
        noise.connect(filter).connect(g).connect(ctx.destination);
        noise.start(now);
        noise.stop(now + dur);
        // Chime melody transposed down a perfect 5th (soft sine wave, lower gain, longer decay)
        // Original: [1175, 784] (D6, G5)
        // Down a 5th: [880, 659.25] (A5, E5)
        const chimeNotes = [880, 659.25]; // A5, E5
        chimeNotes.forEach(freq => {
            const o = ctx.createOscillator();
            const g2 = ctx.createGain();
            o.type = 'sine';
            o.frequency.value = freq;
            g2.gain.setValueAtTime(0.09, now + 0.09);
            g2.gain.linearRampToValueAtTime(0, now + 0.09 + 0.7);
            o.connect(g2).connect(ctx.destination);
            o.start(now + 0.09);
            o.stop(now + 0.09 + 0.7);
        });
    }

    // 12. Portal: swirling whoosh
    function playPortal() {
        const ctx = getCtx();
        const now = ctx.currentTime;
        // Swirl: frequency sweep
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = 'sine';
        o.frequency.setValueAtTime(220, now);
        o.frequency.linearRampToValueAtTime(880, now + 0.5);
        o.frequency.linearRampToValueAtTime(330, now + 1.1);
        g.gain.setValueAtTime(0.15, now);
        g.gain.linearRampToValueAtTime(0.09, now + 0.5);
        g.gain.linearRampToValueAtTime(0, now + 1.1);
        o.connect(g).connect(ctx.destination);
        o.start(now);
        o.stop(now + 1.1);
    }

    // 13. Volcano: rumble and pop (with deeper low rumble)
    function playVolcano() {
        const ctx = getCtx();
        const now = ctx.currentTime;
        // Main rumble: low filtered noise
        const dur = 0.7;
        const bufferSize = ctx.sampleRate * dur;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * 0.11 * (1 - i / bufferSize);
        }
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 300;
        const g = ctx.createGain();
    g.gain.setValueAtTime(1.0, now); // maximum loudness
    g.gain.linearRampToValueAtTime(0, now + dur);
        noise.connect(filter).connect(g).connect(ctx.destination);
        noise.start(now);
        noise.stop(now + dur);

        // Add a deeper, longer, more audible low rumble
        const deepDur = 2.2;
        const deepBufferSize = ctx.sampleRate * deepDur;
        const deepBuffer = ctx.createBuffer(1, deepBufferSize, ctx.sampleRate);
        const deepData = deepBuffer.getChannelData(0);
        for (let i = 0; i < deepBufferSize; i++) {
            // Lower amplitude and frequency for sub-bass rumble
            deepData[i] = (Math.random() * 2 - 1) * 0.16 * (1 - i / deepBufferSize);
        }
        const deepNoise = ctx.createBufferSource();
        deepNoise.buffer = deepBuffer;
        const deepFilter = ctx.createBiquadFilter();
        deepFilter.type = 'lowpass';
        deepFilter.frequency.value = 160;
        const deepGain = ctx.createGain();
    deepGain.gain.setValueAtTime(2.0, now); // extremely loud, may clip
    deepGain.gain.linearRampToValueAtTime(0, now + deepDur);
        deepNoise.connect(deepFilter).connect(deepGain).connect(ctx.destination);
    // Start the deep rumble at 'now' to avoid negative start time
    deepNoise.start(now);
    deepNoise.stop(now + deepDur);

        // Pop: quick high blip
        const o = ctx.createOscillator();
        const g2 = ctx.createGain();
        o.type = 'triangle';
        o.frequency.setValueAtTime(1760, now + 0.5);
        o.frequency.linearRampToValueAtTime(2200, now + 0.58);
        g2.gain.setValueAtTime(0.14, now + 0.5);
        g2.gain.linearRampToValueAtTime(0, now + 0.58);
        o.connect(g2).connect(ctx.destination);
        o.start(now + 0.5);
        o.stop(now + 0.58);
    }

    // 14. Aquarium: "bloop bloop bloop" fish-like sound
    function playAquarium() {
        const ctx = getCtx();
        const now = ctx.currentTime;
            // Three "bloop" notes, each a short, low-pitched percussive sine burst with heavy reverb
        const bloopFreqs = [180, 160, 140];
        // Create convolver node for reverb
        const convolver = ctx.createConvolver();
        // Generate a long, soft impulse response for heavy reverb
        const rate = ctx.sampleRate;
        const length = rate * 2.2; // 2.2 seconds
        const impulse = ctx.createBuffer(2, length, rate);
        for (let c = 0; c < 2; c++) {
            const channel = impulse.getChannelData(c);
            for (let i = 0; i < length; i++) {
                // Exponential decay, randomize for diffusion
                channel[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 2.8) * 0.6;
            }
        }
        convolver.buffer = impulse;
        convolver.connect(ctx.destination);
        for (let i = 0; i < 3; ++i) {
            const o = ctx.createOscillator();
            const g = ctx.createGain();
            const dryGain = ctx.createGain();
            o.type = 'sine';
            o.frequency.setValueAtTime(bloopFreqs[i], now + i * 0.18);
            o.frequency.linearRampToValueAtTime(bloopFreqs[i] * 0.7, now + i * 0.18 + 0.11);
            g.gain.setValueAtTime(0.19, now + i * 0.18);
            g.gain.linearRampToValueAtTime(0, now + i * 0.18 + 0.13);
            dryGain.gain.value = 0.38; // Louder dry signal
            o.connect(g);
            g.connect(convolver);
            g.connect(dryGain);
            dryGain.connect(ctx.destination);
            o.start(now + i * 0.18);
            o.stop(now + i * 0.18 + 0.13);
        }
        // Add a soft, high-pitched "bubble" at the end
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = 'sine';
        o.frequency.setValueAtTime(900, now + 0.54);
        o.frequency.linearRampToValueAtTime(1200, now + 0.62);
        g.gain.setValueAtTime(0.11, now + 0.54);
        g.gain.linearRampToValueAtTime(0, now + 0.62);
        o.connect(g).connect(ctx.destination);
        o.start(now + 0.54);
        o.stop(now + 0.62);
    }

    // 15. Zen Garden: soft wind chimes
    function playZengarden() {
        const ctx = getCtx();
        const now = ctx.currentTime;
        // FM synthesis for bell/wind chime sound
        const chimes = [1318, 1568, 2093, 2637]; // E6, G6, C7, E7
        // Rallentando: start with a base interval, increase it for each chime
        let interval = 0.32; // slower initial interval
        let time = now;
        chimes.forEach((freq, i) => {
            // Carrier oscillator (sine for bell timbre)
            const carrier = ctx.createOscillator();
            carrier.type = 'sine';
            carrier.frequency.value = freq;

            // Modulator oscillator
            const modulator = ctx.createOscillator();
            modulator.type = 'sine';
            // Modulator frequency: 2-4x carrier for bell-like FM
            modulator.frequency.value = freq * (2.1 + Math.random() * 1.2);

            // Modulation depth
            const modGain = ctx.createGain();
            modGain.gain.value = 90 + Math.random() * 30; // Hz deviation

            // Connect modulator to carrier frequency
            modulator.connect(modGain);
            modGain.connect(carrier.frequency);

            // Output gain envelope
            const outGain = ctx.createGain();
            outGain.gain.value = 0.11;
            carrier.connect(outGain).connect(ctx.destination);

            // Envelope for bell: quick attack, long decay
            const start = time;
            const dur = 0.7 + Math.random() * 0.18;
            outGain.gain.setValueAtTime(0.11, start);
            outGain.gain.linearRampToValueAtTime(0, start + dur);
            modGain.gain.setValueAtTime(modGain.gain.value, start);
            modGain.gain.linearRampToValueAtTime(0, start + dur);

            carrier.start(start);
            modulator.start(start);
            carrier.stop(start + dur);
            modulator.stop(start + dur);

            // Rallentando: increase interval for next chime
            time += interval;
            interval *= 1.33; // each interval is 33% longer than the last
        });
    }

    // 16. Ferris Wheel: fast, cycling arpeggio with octave-up flourish
    function playFerriswheel() {
        const ctx = getCtx();
        const now = ctx.currentTime;
            // Play a whimsical, alternating arpeggio (up and down)
            const arps = [
                [523.25, 659.25, 784.00, 1046.50], // C E G C'
                [784.00, 659.25, 523.25, 659.25]   // G E C E
            ];
            for (let j = 0; j < 2; ++j) {
                const notes = arps[j];
                for (let i = 0; i < notes.length; ++i) {
                    const o = ctx.createOscillator();
                    const g = ctx.createGain();
                    o.type = 'triangle';
                    o.frequency.value = notes[i];
                    o.connect(g).connect(ctx.destination);
                    // Envelope
                    const t0 = now + (j * 0.44) + i * 0.11;
                    const t1 = t0 + 0.18;
                    g.gain.setValueAtTime(0, t0);
                    g.gain.linearRampToValueAtTime(0.13, t0 + 0.015); // 15ms fade-in
                    g.gain.setValueAtTime(0.13, t1 - 0.025); // hold
                    g.gain.linearRampToValueAtTime(0, t1); // 25ms fade-out
                    o.start(t0);
                    o.stop(t1);
                }
            }
    }

    // 17. Haunted House: spooky tremolo
    function playHauntedhouse() {
        const ctx = getCtx();
        const now = ctx.currentTime;
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = 'triangle';
        o.frequency.setValueAtTime(220, now);
        o.frequency.linearRampToValueAtTime(110, now + 0.7);
        g.gain.setValueAtTime(0.13, now);
        for (let i = 0; i < 7; ++i) {
            g.gain.linearRampToValueAtTime(i % 2 === 0 ? 0.13 : 0.03, now + i * 0.1);
        }
        g.gain.linearRampToValueAtTime(0, now + 0.7);
        o.connect(g).connect(ctx.destination);
        o.start(now);
        o.stop(now + 0.7);
    }

    return {
        playFootstep,
        playHouse,
        playTree,
        playWell,
        playWindmill,
    playFarm,
        playCastle,
        playShop,
        playFactory,
        playLighthouse,
        playHotspring,
        playLibrary,
        playPortal,
        playVolcano,
        playAquarium,
        playZengarden,
        playFerriswheel,
        playHauntedhouse,
    };
})();

export default SoundEffects;
