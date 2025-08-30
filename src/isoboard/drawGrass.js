import { drawGrassClassic, drawGrassDemoscene, drawGrassDemoscene2, drawDesertOptimized, drawGrassOptimized } from './backgrounds';

// --- Background mode switching ---
// Background mode is now managed by Vue in BackgroundModeBar.vue
export let backgroundMode = 'optimized';
export function setBackgroundMode(mode) {
    backgroundMode = mode;
}
// Main drawGrass function switches based on mode
export function drawGrass(ctx, time) {
    switch (backgroundMode) {
        case 'classic':
            drawGrassClassic(ctx, time); break;
        case 'shimmerwhite':
            drawShimmerWhite(ctx, time); break;
        case 'demoscene':
            drawGrassDemoscene(ctx, time); break;
        case 'demoscene2':
            drawGrassDemoscene2(ctx, time); break;
        case 'desert':
            drawDesertOptimized(ctx, time); break;
        case 'optimized':
        default:
            drawGrassOptimized(ctx, time); break;
    }
}
