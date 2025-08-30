export const grassPixel = 10;
const CANVAS_WIDTH = 750;
const CANVAS_HEIGHT = 500;
// Optimized desert background (sandy look)
export function drawDesertOptimized(ctx, time) {
    ctx.drawImage(desertBuffer, 0, 0);
    ctx.save();
    ctx.globalAlpha = 0.14;
    // Shimmer bands: pale yellow/white
    for (let y = 0; y < CANVAS_HEIGHT; y += grassPixel * 3) {
        const shimmer = 0.10 + 0.10 * Math.sin(time * 0.004 + y * 0.12);
        ctx.fillStyle = `rgba(255,245,200,${shimmer})`;
        ctx.fillRect(0, y, CANVAS_WIDTH, grassPixel * 2);
    }
    for (let x = 0; x < CANVAS_WIDTH; x += grassPixel * 6) {
        const shimmer = 0.07 + 0.07 * Math.sin(time * 0.005 + x * 0.1);
        ctx.fillStyle = `rgba(255,255,220,${shimmer})`;
        ctx.fillRect(x, 0, grassPixel * 2, CANVAS_HEIGHT);
    }
    ctx.restore();
}
// Classic (unoptimized) grass background
export function drawGrassClassic(ctx, time) {
    const pixel = 10;
    for (let y = 0; y < CANVAS_HEIGHT; y += pixel) {
        for (let x = 0; x < CANVAS_WIDTH; x += pixel) {
            // More subtle simmering, avoid dark streaks
            const base = 140 + Math.floor(18 * Math.sin((x + y) * 0.08 + time * 0.002 + x * 0.01));
            const green = base + Math.floor(12 * Math.sin(time * 0.003 + y * 0.03 + x * 0.02));
            ctx.fillStyle = `rgb(${80 + base / 10},${green},${80 + base / 12})`;
            ctx.fillRect(x, y, pixel, pixel);
        }
    }
}
// Optimized grass background (single style)
export function drawGrassOptimized(ctx, time) {
    ctx.drawImage(grassBuffer, 0, 0);
    ctx.save();
    ctx.globalAlpha = 0.18;
    for (let y = 0; y < CANVAS_HEIGHT; y += grassPixel * 3) {
        const shimmer = 0.12 + 0.10 * Math.sin(time * 0.004 + y * 0.12);
        ctx.fillStyle = `rgba(255,255,255,${shimmer})`;
        ctx.fillRect(0, y, CANVAS_WIDTH, grassPixel * 2);
    }
    for (let x = 0; x < CANVAS_WIDTH; x += grassPixel * 6) {
        const shimmer = 0.08 + 0.08 * Math.sin(time * 0.005 + x * 0.1);
        ctx.fillStyle = `rgba(255,255,255,${shimmer})`;
        ctx.fillRect(x, 0, grassPixel * 2, CANVAS_HEIGHT);
    }
    ctx.restore();
}
// Demo scene: animated plasma
export function drawGrassDemoscene(ctx, time) {
    const imageData = ctx.createImageData(CANVAS_WIDTH, CANVAS_HEIGHT);
    const data = imageData.data;
    for (let y = 0; y < CANVAS_HEIGHT; y++) {
        for (let x = 0; x < CANVAS_WIDTH; x++) {
            const idx = (y * CANVAS_WIDTH + x) * 4;
            // Plasma effect
            const v = Math.sin(x * 0.04 + time * 0.002)
                + Math.sin(y * 0.07 + time * 0.003)
                + Math.sin((x + y) * 0.03 + time * 0.004)
                + Math.sin(Math.sqrt((x - 375) * (x - 375) + (y - 250) * (y - 250)) * 0.06 - time * 0.002);
            const c = Math.floor(128 + 64 * v);
            data[idx] = c; // R
            data[idx + 1] = 80 + (c >> 1); // G
            data[idx + 2] = 200 - (c >> 2); // B
            data[idx + 3] = 255;
        }
    }
    ctx.putImageData(imageData, 0, 0);
}
// Demo scene 2: different animated plasma
export function drawGrassDemoscene2(ctx, time) {
    const imageData = ctx.createImageData(CANVAS_WIDTH, CANVAS_HEIGHT);
    const data = imageData.data;
    for (let y = 0; y < CANVAS_HEIGHT; y++) {
        for (let x = 0; x < CANVAS_WIDTH; x++) {
            const idx = (y * CANVAS_WIDTH + x) * 4;
            // Different plasma effect: more color cycling, more circular
            const v = Math.sin(x * 0.03 + time * 0.003)
                + Math.cos(y * 0.05 + time * 0.004)
                + Math.sin((x - y) * 0.04 + time * 0.005)
                + Math.cos(Math.sqrt((x - 375) * (x - 375) + (y - 250) * (y - 250)) * 0.09 + time * 0.003);
            const c = Math.floor(128 + 64 * v);
            data[idx] = 180 - (c >> 2); // R
            data[idx + 1] = 120 + (c >> 1); // G
            data[idx + 2] = 220 + (c >> 1); // B
            data[idx + 3] = 255;
        }
    }
    ctx.putImageData(imageData, 0, 0);
}

// Shimmer effect over a white background
export function drawShimmerWhite(ctx, time) {
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.save();
    ctx.globalAlpha = 0.55;
    // Dramatic blue shimmer bands
    for (let y = 0; y < CANVAS_HEIGHT; y += grassPixel * 2) {
        const shimmer = 0.35 + 0.35 * Math.sin(time * 0.008 + y * 0.18);
        ctx.fillStyle = `rgba(${120 + 80 * Math.sin(time * 0.01 + y * 0.08)},${180 + 40 * Math.cos(time * 0.012 + y * 0.11)},255,${shimmer})`;
        ctx.fillRect(0, y, CANVAS_WIDTH, grassPixel * 2);
    }
    // Dramatic white shimmer columns
    for (let x = 0; x < CANVAS_WIDTH; x += grassPixel * 3) {
        const shimmer = 0.22 + 0.22 * Math.sin(time * 0.009 + x * 0.13);
        ctx.fillStyle = `rgba(255,255,255,${shimmer})`;
        ctx.fillRect(x, 0, grassPixel * 2, CANVAS_HEIGHT);
    }
    ctx.restore();
}


// HSL to RGB helper
function hslToRgb(h, s, l) {
    s /= 100; l /= 100;
    const k = n => (n + h/30) % 12;
    const a = s * Math.min(l, 1 - l);
    const f = n => l - a * Math.max(-1, Math.min(Math.min(k(n) - 3, 9 - k(n)), 1));
    return [Math.round(255 * f(0)), Math.round(255 * f(8)), Math.round(255 * f(4))];
}

function makeGrassBuffer(bgType) {
    const buffer = document.createElement('canvas');
    buffer.width = CANVAS_WIDTH;
    buffer.height = CANVAS_HEIGHT;
    const ctx2 = buffer.getContext('2d');
    for (let y = 0; y < CANVAS_HEIGHT; y += grassPixel) {
        for (let x = 0; x < CANVAS_WIDTH; x += grassPixel) {
            let h, s, l;
            if (bgType === 'green') {
                h = 110 + 10 * Math.sin((x + y) * 0.08 + x * 0.01);
                s = 60 + 10 * Math.sin(y * 0.03 + x * 0.02);
                l = 32 + 8 * Math.sin(x * 0.02 + y * 0.01);
            } else if (bgType === 'blue') {
                h = 210 + 10 * Math.sin((x + y) * 0.08 + x * 0.01);
                s = 70 + 10 * Math.sin(y * 0.03 + x * 0.02);
                l = 50 + 10 * Math.sin(x * 0.02 + y * 0.01);
            } else if (bgType === 'gold') {
                h = 45 + 10 * Math.sin((x + y) * 0.08 + x * 0.01);
                s = 90 + 5 * Math.sin(y * 0.03 + x * 0.02);
                l = 55 + 10 * Math.sin(x * 0.02 + y * 0.01);
            } else if (bgType === 'purple') {
                h = 285 + 10 * Math.sin((x + y) * 0.08 + x * 0.01);
                s = 60 + 10 * Math.sin(y * 0.03 + x * 0.02);
                l = 45 + 10 * Math.sin(x * 0.02 + y * 0.01);
            } else {
                h = 110; s = 60; l = 32;
            }
            const [r, g, b] = hslToRgb(h, s, l);
            ctx2.fillStyle = `rgb(${r},${g},${b})`;
            ctx2.fillRect(x, y, grassPixel, grassPixel);
        }
    }
    return buffer;
}

// Precompute buffers for each background
const grassBuffer = makeGrassBuffer('green');
const desertBuffer = (() => {
    // Use HSL for sandy/yellow tones
    const buffer = document.createElement('canvas');
    buffer.width = CANVAS_WIDTH;
    buffer.height = CANVAS_HEIGHT;
    const ctx2 = buffer.getContext('2d');
    for (let y = 0; y < CANVAS_HEIGHT; y += grassPixel) {
        for (let x = 0; x < CANVAS_WIDTH; x += grassPixel) {
            // Vary hue and lightness for a sandy look
            let h = 45 + 8 * Math.sin((x + y) * 0.07 + x * 0.01);
            let s = 60 + 10 * Math.sin(y * 0.03 + x * 0.02);
            let l = 70 + 10 * Math.sin(x * 0.02 + y * 0.01);
            const [r, g, b] = hslToRgb(h, s, l);
            ctx2.fillStyle = `rgb(${r},${g},${b})`;
            ctx2.fillRect(x, y, grassPixel, grassPixel);
        }
    }
    return buffer;
})();
