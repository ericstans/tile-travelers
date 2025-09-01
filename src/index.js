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
    // Find all reachable tiles
    const reachableTiles = [];
    
    for (let y = 0; y < boardRows; y++) {
        for (let x = 0; x < boardCols; x++) {
            if (boardTiles[y][x] && (x !== bobPos.x || y !== bobPos.y)) {
                const path = findPath(bobPos, { x, y });
                if (path && path.length > 0) {
                    reachableTiles.push({ x, y });
                }
            }
        }
    }
    
    if (reachableTiles.length === 0) {
        return null; // No reachable targets
    }
    
    // Choose a random reachable tile
    const randomIndex = Math.floor(Math.random() * reachableTiles.length);
    return reachableTiles[randomIndex];
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

         // --- Fixed camera centered on board ---
     // Calculate board center offset to center the entire board on canvas
     const boardCenterX = boardCols / 2;
     const boardCenterY = boardRows / 2;
     const boardCenterProj = obliqueProjectCentered(boardCenterX, boardCenterY);
     const canvasCenterX = CANVAS_WIDTH / 2;
     const canvasCenterY = CANVAS_HEIGHT / 2;
     
     const camOffsetX = canvasCenterX - boardCenterProj.x;
     const camOffsetY = canvasCenterY - boardCenterProj.y;
     
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
                         // No more rook move highlighting since Bob is not interactive
            
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
             if (!isTarget) ctx.fill();

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

// Bob is now fully autonomous - no mouse interaction