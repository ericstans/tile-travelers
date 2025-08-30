import { drawShimmerWhite } from '.';
import { drawGrassClassic, drawGrassDemoscene, drawGrassDemoscene2, drawDesertOptimized, drawGrassOptimized } from './backgrounds';

// --- Background mode switching ---
let backgroundMode = 'optimized';
const bgModeSelect = document.getElementById('background-mode-select');
if (bgModeSelect) {
	// Add new options to the menu
	const options = [
		{ value: 'optimized', label: 'Optimized (Grass Green)' },
		{ value: 'desert', label: 'Desert' },
		{ value: 'shimmerwhite', label: 'Shimmer on White' },
		{ value: 'demoscene', label: 'Demo Scene' },
		{ value: 'demoscene2', label: 'Demo Scene 2' },
		{ value: 'classic', label: 'Classic (per-frame)' },
	];

	// Remove all children
	while (bgModeSelect.firstChild) bgModeSelect.removeChild(bgModeSelect.firstChild);
	for (const opt of options) {
		const o = document.createElement('option');
		o.value = opt.value;
		o.textContent = opt.label;
		bgModeSelect.appendChild(o);
	}
	bgModeSelect.value = backgroundMode;
	bgModeSelect.addEventListener('change', (e) => {
		backgroundMode = e.target.value;
	});
}
// Main drawGrass function switches based on mode
export function drawGrass(time) {
	switch (backgroundMode) {
		case 'classic':
			drawGrassClassic(time); break;
		case 'shimmerwhite':
			drawShimmerWhite(time); break;
		case 'demoscene':
			drawGrassDemoscene(time); break;
		case 'demoscene2':
			drawGrassDemoscene2(time); break;
		case 'desert':
			drawDesertOptimized(time); break;
		case 'optimized':
		default:
			drawGrassOptimized(time); break;
	}
}
