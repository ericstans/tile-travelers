import { createApp } from 'vue';
import App from './App.vue';
import { drawGrass, grassBuffer, desertBuffer, drawShimmerWhite } from './utils/drawGrass.js';
import SoundEffects from './utils/soundEffects.js';
import './utils/background-mode-bar.css';
import './styles.css';
createApp(App).mount('#app');

import { boardRows, boardCols, boardTiles } from './gameState.js';

// Only create and append a canvas if one does not already exist in #app
const app = document.getElementById('app');
let canvas = app.querySelector('canvas');
// Larger canvas for 20x20 board
export const CANVAS_WIDTH = 1200;
export const CANVAS_HEIGHT = 800;
if (!canvas) {
    canvas = document.createElement('canvas');
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;
    canvas.style.display = 'block';
    canvas.style.margin = '40px auto';
    canvas.style.background = '#f9f9f9';
    canvas.style.border = '1px solid #bbb';
    app.insertBefore(canvas, app.firstChild);
} else {
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;
}

export const ctx = canvas.getContext('2d');

// --- Grass background optimization ---
export const grassPixel = 10;
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

// Oblique projection parameters
const skew = 0.5; // 0.5 = 45° cavalier, 0.25 = 26.6° cabinet
const tileSize = 96; // double the previous 48
const depth = 48;    // double the previous 24

// Calculate the projected width and height of the board
function obliqueProject(x, y) {
    return {
        x: x * tileSize + y * depth * skew,
        y: y * tileSize - y * depth
    };
}

// Center the board in the canvas
function obliqueProjectCentered(x, y) {
    const proj = obliqueProject(x, y);
    // Project the four corners of the board to get bounds
    const topLeft = obliqueProject(0, 0);
    const bottomRight = obliqueProject(boardCols, boardRows);
    const boardPixelWidth = bottomRight.x - topLeft.x;
    const boardPixelHeight = bottomRight.y - topLeft.y;
    return {
        x: proj.x + (CANVAS_WIDTH - boardPixelWidth) / 2 - topLeft.x,
        y: proj.y + (CANVAS_HEIGHT - boardPixelHeight) / 2 - topLeft.y
    };
}

// --- Bob's state ---
let bobPos = { x: 2, y: 2 };
let bobSelected = false;
let bobAnim = null; // {from: {x,y}, to: {x,y}, start: time, duration: ms}

// --- Bob AI state ---
let bobTarget = null; // {x, y} - Bob's current target
let bobMoving = false; // Whether Bob is currently moving toward a target
let bobPath = []; // Current path to target
let bobPathIndex = 0; // Current position in path

// --- Bob AI Functions ---
function findPath(start, target) {
    // Simple pathfinding for rook movement
    // First try to move horizontally, then vertically
    const path = [];
    let current = { ...start };
    
    // Move horizontally first
    while (current.x !== target.x) {
        const nextX = current.x + (target.x > current.x ? 1 : -1);
        if (boardTiles[current.y] && boardTiles[current.y][nextX]) {
            current.x = nextX;
            path.push({ ...current });
        } else {
            // Can't move horizontally, try vertical approach
            return findPathVertical(start, target);
        }
    }
    
    // Then move vertically
    while (current.y !== target.y) {
        const nextY = current.y + (target.y > current.y ? 1 : -1);
        if (boardTiles[nextY] && boardTiles[nextY][current.x]) {
            current.y = nextY;
            path.push({ ...current });
        } else {
            // Can't reach target
            return null;
        }
    }
    
    return path;
}

function findPathVertical(start, target) {
    // Alternative pathfinding: move vertically first, then horizontally
    const path = [];
    let current = { ...start };
    
    // Move vertically first
    while (current.y !== target.y) {
        const nextY = current.y + (target.y > current.y ? 1 : -1);
        if (boardTiles[nextY] && boardTiles[nextY][current.x]) {
            current.y = nextY;
            path.push({ ...current });
        } else {
            return null;
        }
    }
    
    // Then move horizontally
    while (current.x !== target.x) {
        const nextX = current.x + (target.x > current.x ? 1 : -1);
        if (boardTiles[current.y] && boardTiles[current.y][nextX]) {
            current.x = nextX;
            path.push({ ...current });
        } else {
            return null;
        }
    }
    
    return path;
}

function chooseRandomTarget() {
    // Find Bob's current projected position for camera calculations
    const bobProj = obliqueProjectCentered(bobPos.x + 0.5, bobPos.y + 0.5);
    
    // Calculate camera offset (same logic as in draw function)
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (let y = 0; y < boardRows; y++) {
        for (let x = 0; x < boardCols; x++) {
            if (boardTiles[y][x] && ((x === bobPos.x && y !== bobPos.y) || (y === bobPos.y && x !== bobPos.x))) {
                const proj = obliqueProjectCentered(x + 0.5, y + 0.5);
                minX = Math.min(minX, proj.x);
                minY = Math.min(minY, proj.y);
                maxX = Math.max(maxX, proj.x);
                maxY = Math.max(maxY, proj.y);
            }
        }
    }
    
    let needsScroll = false;
    if (minX < 0 || maxX > CANVAS_WIDTH || minY < 0 || maxY > CANVAS_HEIGHT) {
        needsScroll = true;
    }
    
    let camOffsetX = 0, camOffsetY = 0;
    if (needsScroll) {
        const targetX = CANVAS_WIDTH / 2;
        const targetY = CANVAS_HEIGHT / 2;
        camOffsetX = targetX - bobProj.x;
        camOffsetY = targetY - bobProj.y;
    }
    
    // Find all reachable tiles, separating on-screen and off-screen
    const onScreenTiles = [];
    const offScreenTiles = [];
    
    for (let y = 0; y < boardRows; y++) {
        for (let x = 0; x < boardCols; x++) {
            if (boardTiles[y][x] && (x !== bobPos.x || y !== bobPos.y)) {
                // Check if this tile is reachable via rook movement
                const path = findPath(bobPos, { x, y });
                if (path && path.length > 0) {
                    // Check if tile is on-screen or off-screen
                    const tileProj = obliqueProjectCentered(x + 0.5, y + 0.5);
                    const screenX = tileProj.x + camOffsetX;
                    const screenY = tileProj.y + camOffsetY;
                    
                    const isOnScreen = screenX >= 0 && screenX <= CANVAS_WIDTH && 
                                     screenY >= 0 && screenY <= CANVAS_HEIGHT;
                    
                    if (isOnScreen) {
                        onScreenTiles.push({ x, y });
                    } else {
                        offScreenTiles.push({ x, y });
                    }
                }
            }
        }
    }
    
    // Prefer off-screen tiles, fall back to on-screen if none available
    const targetTiles = offScreenTiles.length > 0 ? offScreenTiles : onScreenTiles;
    
    if (targetTiles.length === 0) {
        return null; // No reachable targets
    }
    
    // Choose a random tile from the preferred set
    const randomIndex = Math.floor(Math.random() * targetTiles.length);
    return targetTiles[randomIndex];
}

function startBobAI() {
    if (bobMoving || bobAnim) return; // Already moving
    
    const target = chooseRandomTarget();
    if (!target) {
        // No reachable targets, try again later
        setTimeout(startBobAI, 1000);
        return;
    }
    
    bobTarget = target;
    const path = findPath(bobPos, target);
    if (!path || path.length === 0) {
        // Can't reach target, try again
        setTimeout(startBobAI, 1000);
        return;
    }
    
    // Sync target designation sound to next beat
    const delayToNextBeat = SoundEffects.getNextBeatTime();
    setTimeout(() => {
        SoundEffects.playTargetDesignated();
    }, delayToNextBeat);
    
    bobPath = path;
    bobPathIndex = 0;
    bobMoving = true;
    
    // Start movement on the next eighth note after the sound
    const delayToNextEighth = SoundEffects.getNextEighthNoteTime();
    setTimeout(() => {
        moveBobToNext();
    }, delayToNextEighth + SoundEffects.EIGHTH_NOTE_MS);
}

function moveBobToNext() {
    if (bobPathIndex >= bobPath.length) {
        // Reached target - sync sound to next beat
        const delayToNextBeat = SoundEffects.getNextBeatTime();
        setTimeout(() => {
            SoundEffects.playTargetReached();
        }, delayToNextBeat);
        
        bobMoving = false;
        bobTarget = null;
        bobPath = [];
        bobPathIndex = 0;
        
        // Wait for next beat, then choose a new target
        setTimeout(startBobAI, delayToNextBeat + SoundEffects.BEAT_DURATION_MS * 2);
        return;
    }
    
    const nextPos = bobPath[bobPathIndex];
    const distance = Math.abs(nextPos.x - bobPos.x) + Math.abs(nextPos.y - bobPos.y);
    
    // Calculate timing to sync movement with beat
    const currentTime = Date.now();
    const delayToNextBeat = SoundEffects.getTimeToNextBeatFromTime(currentTime);
    
    // Start movement animation to complete on the next beat
    const movementStartTime = performance.now();
    const movementDuration = delayToNextBeat;
    
    bobAnim = {
        from: { ...bobPos },
        to: { ...nextPos },
        start: movementStartTime,
        duration: movementDuration
    };
    
    // Play footstep exactly when movement completes (on the beat)
    // Use a more precise timing approach
    const footstepTime = currentTime + delayToNextBeat;
    const footstepDelay = footstepTime - Date.now();
    
    setTimeout(() => {
        SoundEffects.playFootstep();
        // Update Bob's position when footstep plays
        bobPos = { ...nextPos };
        bobPathIndex++;
        
        // Schedule next move to start on the next eighth note
        const nextMoveTime = footstepTime + SoundEffects.EIGHTH_NOTE_MS;
        const nextMoveDelay = nextMoveTime - Date.now();
        setTimeout(moveBobToNext, Math.max(0, nextMoveDelay));
    }, Math.max(0, footstepDelay));
}

function draw(time = performance.now()) {
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    drawGrass(ctx, time);

    // Animate Bob if needed
    let drawBobX = bobPos.x;
    let drawBobY = bobPos.y;
    if (bobAnim) {
        const elapsed = Math.min(time - bobAnim.start, bobAnim.duration);
        const t = Math.min(1, elapsed / bobAnim.duration);
        // Ease out cubic for snappy feel
        const ease = 1 - Math.pow(1 - t, 3);
        drawBobX = bobAnim.from.x + (bobAnim.to.x - bobAnim.from.x) * ease;
        drawBobY = bobAnim.from.y + (bobAnim.to.y - bobAnim.from.y) * ease;
        // Footsteps are now played when reaching squares, not during animation
        if (t >= 1) {
            bobAnim = null;
        }
    }

    // --- Camera scroll logic ---
    // Find Bob's projected center
    const bobProj = obliqueProjectCentered(drawBobX + 0.5, drawBobY + 0.5);
    // Find all navigable squares from Bob's position (rook moves)
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (let y = 0; y < boardRows; y++) {
        for (let x = 0; x < boardCols; x++) {
            // Only consider existing tiles that are in the same row or column as Bob
            if (boardTiles[y][x] && ((x === Math.round(drawBobX) && y !== Math.round(drawBobY)) || (y === Math.round(drawBobY) && x !== Math.round(drawBobX)))) {
                const proj = obliqueProjectCentered(x + 0.5, y + 0.5);
                minX = Math.min(minX, proj.x);
                minY = Math.min(minY, proj.y);
                maxX = Math.max(maxX, proj.x);
                maxY = Math.max(maxY, proj.y);
            }
        }
    }
    // Check if any navigable square is outside the canvas
    let needsScroll = false;
    if (minX < 0 || maxX > CANVAS_WIDTH || minY < 0 || maxY > CANVAS_HEIGHT) {
        needsScroll = true;
    }
    let camOffsetX = 0, camOffsetY = 0;
    if (needsScroll) {
        // Target center (canvas center)
        const targetX = CANVAS_WIDTH / 2;
        const targetY = CANVAS_HEIGHT / 2;
        camOffsetX = targetX - bobProj.x;
        camOffsetY = targetY - bobProj.y;
    }
    ctx.save();
    ctx.translate(camOffsetX, camOffsetY);

    // Draw the board as a grid of parallelogram tiles
    for (let y = 0; y < boardRows; y++) {
        for (let x = 0; x < boardCols; x++) {
            // Only draw tiles that exist
            if (!boardTiles[y][x]) continue;
            
            // Four corners of the tile
            const p0 = obliqueProjectCentered(x, y);
            const p1 = obliqueProjectCentered(x + 1, y);
            const p2 = obliqueProjectCentered(x + 1, y + 1);
            const p3 = obliqueProjectCentered(x, y + 1);
            ctx.beginPath();
            ctx.moveTo(p0.x, p0.y);
            ctx.lineTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.lineTo(p3.x, p3.y);
            ctx.closePath();
            // Highlight valid rook moves if Bob is selected
            let isRookMove = false;
            if (bobSelected && ((x === bobPos.x && y !== bobPos.y) || (y === bobPos.y && x !== bobPos.x))) {
                isRookMove = true;
                ctx.fillStyle = 'rgba(100,200,255,0.35)';
                ctx.fill();
            }
            
            // Highlight target square in red
            let isTarget = false;
            if (bobTarget && x === bobTarget.x && y === bobTarget.y) {
                isTarget = true;
                ctx.fillStyle = 'rgba(255,100,100,0.6)';
                ctx.fill();
            }
            
            ctx.strokeStyle = '#333';
            ctx.stroke();
            ctx.fillStyle = (x + y) % 2 === 0 ? '#eaeaea' : '#d0d0d0';
            if (!isRookMove && !isTarget) ctx.fill();

            // Draw Bob if he's on this tile (rounded to nearest int for animation)
            if (Math.round(drawBobX) === x && Math.round(drawBobY) === y) {
                const bob0 = obliqueProjectCentered(drawBobX, drawBobY);
                const bob1 = obliqueProjectCentered(drawBobX + 1, drawBobY);
                const bob2 = obliqueProjectCentered(drawBobX + 1, drawBobY + 1);
                const bob3 = obliqueProjectCentered(drawBobX, drawBobY + 1);
                const bobCenterX = (bob0.x + bob1.x + bob2.x + bob3.x) / 4;
                const bobCenterY = (bob0.y + bob1.y + bob2.y + bob3.y) / 4;
                const bobYOffset = -tileSize * 0.25 - 8; // Move Bob up 8px
                ctx.fillStyle = '#f66';
                ctx.beginPath();
                ctx.arc(bobCenterX, bobCenterY + bobYOffset, 32, 0, 2 * Math.PI);
                ctx.fill();
                ctx.strokeStyle = '#a33';
                ctx.lineWidth = 6;
                ctx.beginPath();
                ctx.moveTo(bobCenterX - 12, bobCenterY + bobYOffset + 28);
                ctx.lineTo(bobCenterX - 12, bobCenterY + bobYOffset + 48);
                ctx.moveTo(bobCenterX + 12, bobCenterY + bobYOffset + 28);
                ctx.lineTo(bobCenterX + 12, bobCenterY + bobYOffset + 48);
                ctx.stroke();
                ctx.lineWidth = 1;
                ctx.fillStyle = '#fff';
                ctx.beginPath();
                ctx.arc(bobCenterX - 10, bobCenterY + bobYOffset - 6, 6, 0, 2 * Math.PI);
                ctx.fill();
                ctx.beginPath();
                ctx.arc(bobCenterX + 10, bobCenterY + bobYOffset - 6, 6, 0, 2 * Math.PI);
                ctx.fill();
                ctx.fillStyle = '#222';
                ctx.beginPath();
                ctx.arc(bobCenterX - 10, bobCenterY + bobYOffset - 6, 2, 0, 2 * Math.PI);
                ctx.fill();
                ctx.beginPath();
                ctx.arc(bobCenterX + 10, bobCenterY + bobYOffset - 6, 2, 0, 2 * Math.PI);
                ctx.fill();
                if (bobSelected) {
                    ctx.strokeStyle = '#33f';
                    ctx.lineWidth = 4;
                    ctx.beginPath();
                    ctx.arc(bobCenterX, bobCenterY + bobYOffset, 38, 0, 2 * Math.PI);
                    ctx.stroke();
                    ctx.lineWidth = 1;
                }
            }
        }
    }
    ctx.restore();

    requestAnimationFrame(draw);
}

draw();

// Start the kick drum and Bob's AI
SoundEffects.startKickDrum();
setTimeout(startBobAI, 1000);

// --- Interactivity ---
canvas.addEventListener('click', function (e) {
    const rect = canvas.getBoundingClientRect();
    let mx = e.clientX - rect.left;
    let my = e.clientY - rect.top;

    // Camera offset logic (must match draw)
    let drawBobX = bobPos.x;
    let drawBobY = bobPos.y;
    if (bobAnim) {
        const elapsed = Math.min(performance.now() - bobAnim.start, bobAnim.duration);
        const t = Math.min(1, elapsed / bobAnim.duration);
        const ease = 1 - Math.pow(1 - t, 3);
        drawBobX = bobAnim.from.x + (bobAnim.to.x - bobAnim.from.x) * ease;
        drawBobY = bobAnim.from.y + (bobAnim.to.y - bobAnim.from.y) * ease;
    }
    // Find all navigable squares from Bob's position (rook moves)
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (let y = 0; y < boardRows; y++) {
        for (let x = 0; x < boardCols; x++) {
            // Only consider existing tiles that are in the same row or column as Bob
            if (boardTiles[y][x] && ((x === Math.round(drawBobX) && y !== Math.round(drawBobY)) || (y === Math.round(drawBobY) && x !== Math.round(drawBobX)))) {
                const proj = obliqueProjectCentered(x + 0.5, y + 0.5);
                minX = Math.min(minX, proj.x);
                minY = Math.min(minY, proj.y);
                maxX = Math.max(maxX, proj.x);
                maxY = Math.max(maxY, proj.y);
            }
        }
    }
    // Check if any navigable square is outside the canvas
    let needsScroll = false;
    if (minX < 0 || maxX > CANVAS_WIDTH || minY < 0 || maxY > CANVAS_HEIGHT) {
        needsScroll = true;
    }
    let camOffsetX = 0, camOffsetY = 0;
    if (needsScroll) {
        const bobProj = obliqueProjectCentered(drawBobX + 0.5, drawBobY + 0.5);
        const targetX = CANVAS_WIDTH / 2;
        const targetY = CANVAS_HEIGHT / 2;
        camOffsetX = targetX - bobProj.x;
        camOffsetY = targetY - bobProj.y;
    }
    // Adjust mouse coordinates for camera offset
    mx -= camOffsetX;
    my -= camOffsetY;

    function pointInTile(x, y, px, py) {
        const p0 = obliqueProjectCentered(x, y);
        const p1 = obliqueProjectCentered(x + 1, y);
        const p2 = obliqueProjectCentered(x + 1, y + 1);
        const p3 = obliqueProjectCentered(x, y + 1);
        function sign(ax, ay, bx, by, cx, cy) {
            return (ax - cx) * (by - cy) - (bx - cx) * (ay - cy);
        }
        const b1 = sign(px, py, p0.x, p0.y, p1.x, p1.y) < 0;
        const b2 = sign(px, py, p1.x, p1.y, p2.x, p2.y) < 0;
        const b3 = sign(px, py, p2.x, p2.y, p3.x, p3.y) < 0;
        const b4 = sign(px, py, p3.x, p3.y, p0.x, p0.y) < 0;
        return ((b1 === b2) && (b2 === b3) && (b3 === b4));
    }

    // Handle Bob selection/movement
    if (!bobSelected) {
        if (pointInTile(bobPos.x, bobPos.y, mx, my)) {
            bobSelected = true;
            draw();
        }
    } else {
        let moved = false;
        for (let y = 0; y < boardRows; y++) {
            for (let x = 0; x < boardCols; x++) {
                // Only consider existing tiles that are in the same row or column as Bob
                if (boardTiles[y][x] && ((x === bobPos.x && y !== bobPos.y) || (y === bobPos.y && x !== bobPos.x))) {
                    if (pointInTile(x, y, mx, my)) {
                        // Calculate distance for proportional movement speed
                        const distance = Math.abs(x - bobPos.x) + Math.abs(y - bobPos.y);
                        const baseDuration = 200; // Base duration per tile
                        const duration = baseDuration * distance;
                        
                        bobAnim = {
                            from: { ...bobPos },
                            to: { x, y },
                            start: performance.now(),
                            duration: duration
                        };
                        bobPos = { x, y };
                        moved = true;
                        break;
                    }
                }
            }
            if (moved) break;
        }
        bobSelected = false;
        draw();
    }
});