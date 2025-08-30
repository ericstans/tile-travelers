import { ctx, desertBuffer, CANVAS_HEIGHT, grassPixel, CANVAS_WIDTH, grassBuffer } from '.';

// Optimized desert background (sandy look)
export function drawDesertOptimized(time) {
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
export function drawGrassClassic(time) {
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
export function drawGrassOptimized(time) {
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
export function drawGrassDemoscene(time) {
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
export function drawGrassDemoscene2(time) {
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
