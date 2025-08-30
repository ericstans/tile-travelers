
// Add this method to the SoundEffects object

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
// --- Sound Effects Module ---
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
	// ...existing code...
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
