import { createApp } from 'vue';
import App from './App.vue';
import { drawGrass, grassBuffer, desertBuffer, drawShimmerWhite } from './isoboard/drawGrass.js';
import SoundEffects from './isoboard/soundEffects.js';
import './isoboard/background-mode-bar.css';
import './styles.css';
createApp(App).mount('#app');

// --- Animated Text Effect ---
function showAnimatedText(message, options = {}) {
    // Remove any existing animated text
    let existing = document.getElementById('animated-text-effect');
    if (existing) existing.remove();
    const div = document.createElement('div');
    div.id = 'animated-text-effect';
    div.textContent = message;
    div.style.position = 'fixed';
    div.style.left = '50%';
    div.style.top = options.top || '22%';
    div.style.transform = 'translate(-50%, 0) scale(1)';
    div.style.fontSize = options.fontSize || '2.6rem';
    div.style.fontWeight = 'bold';
    div.style.color = options.color || '#f7b300';
    div.style.textShadow = '0 2px 12px #000a, 0 0 2px #fff8';
    div.style.opacity = '0';
    div.style.pointerEvents = 'none';
    div.style.zIndex = 1000;
    div.style.transition = 'opacity 0.25s, transform 0.7s cubic-bezier(.2,1.2,.4,1)';
    document.body.appendChild(div);
    // Animate in
    setTimeout(() => {
        div.style.opacity = '1';
        div.style.transform = 'translate(-50%, 0) scale(1.12)';
    }, 10);
    // Animate out
    setTimeout(() => {
        div.style.opacity = '0';
        div.style.transform = 'translate(-50%, -40px) scale(0.92)';
    }, options.duration || 1400);
    // Remove after animation
    setTimeout(() => {
        if (div.parentNode) div.parentNode.removeChild(div);
    }, (options.duration || 1400) + 600);
}
// --- Turn system ---
let turnHasMoved = false;
let turnHasBuilt = false;

// Add End Turn button
let endTurnBtn = document.getElementById('end-turn-btn');
if (!endTurnBtn) {
    endTurnBtn = document.createElement('button');
    endTurnBtn.id = 'end-turn-btn';
    endTurnBtn.textContent = 'End Turn';
    endTurnBtn.style.position = 'absolute';
    endTurnBtn.style.top = '24px';
    endTurnBtn.style.right = '36px';
    endTurnBtn.style.zIndex = 10;
    endTurnBtn.style.fontSize = '1.2rem';
    endTurnBtn.style.padding = '8px 18px';
    endTurnBtn.style.background = '#eee';
    endTurnBtn.style.border = '2px solid #bbb';
    endTurnBtn.style.borderRadius = '8px';
    endTurnBtn.style.boxShadow = '0 2px 8px #0001';
    endTurnBtn.style.cursor = 'pointer';
    endTurnBtn.style.fontWeight = 'bold';
    endTurnBtn.style.opacity = '0.97';
    document.body.appendChild(endTurnBtn);
}
endTurnBtn.onclick = () => {
    turnHasMoved = false;
    turnHasBuilt = false;
    selectedBuilding = null;
    // Deselect all building bar buttons
    const bar = document.getElementById('building-bar');
    if (bar) {
        Array.from(bar.children).forEach(el => el.classList.remove('selected'));
    }
    // --- Per-turn resource effects ---
    let perTurnEffects = [];
    let perTurnBuildingAnims = [];
    for (let y = 0; y < boardRows; y++) {
        for (let x = 0; x < boardCols; x++) {
            const b = buildings[y][x];
            if (b && b.resourceEffect && /\/t$/.test(b.resourceEffect)) {
                // Generalize for any per-turn effect
                const match = b.resourceEffect.match(/(POP|GLD|FUD|HPY|WIS)([+-]\d+)\/t/i);
                if (match) {
                    const key = match[1].toLowerCase();
                    const delta = parseInt(match[2], 10);
                    if (resources.hasOwnProperty(key)) {
                        perTurnEffects.push({ key, delta });
                        perTurnBuildingAnims.push({ x, y, delta, key, icon: b.icon });
                    }
                }
            }
        }
    }
    // Animate per-turn effect above each building
    perTurnBuildingAnims.forEach(({ x, y, delta, key, icon }) => {
        animateBuildingPerTurnEffect(x, y, delta, key, icon);
    });
    // Sum all effects by resource type
    const effectTotals = {};
    perTurnEffects.forEach(e => {
        effectTotals[e.key] = (effectTotals[e.key] || 0) + e.delta;
    });
    // Apply and animate if any
    let perTurnMsg = [];
    for (const key in effectTotals) {
        resources[key] += effectTotals[key];
        perTurnMsg.push(`${key.toUpperCase()} ${effectTotals[key] > 0 ? '+' : ''}${effectTotals[key]}`);
    }
    if (perTurnMsg.length > 0) {
        showAnimatedText(perTurnMsg.join('  '), { color: '#2a2', fontSize: '2.1rem', top: '32%' });
    }
    updateResourceDisplay();
// Animate per-turn resource effect above a building at board (x, y)
function animateBuildingPerTurnEffect(x, y, delta, key, icon) {
    // Map resource key to emoji
    const resourceEmojis = {
        pop: '👥',
        gld: '💰',
        fud: '🍔',
        hpy: '😊',
        wis: '📜'
    };
    const emoji = resourceEmojis[key] || '';
    // Project the building's center to canvas coordinates
    const center = obliqueProjectCentered(x + 0.5, y + 0.1); // slightly above the building
    // Convert canvas coordinates to page coordinates
    const canvasRect = canvas.getBoundingClientRect();
    const pageX = canvasRect.left + window.scrollX + center.x;
    const pageY = canvasRect.top + window.scrollY + center.y;
    const div = document.createElement('div');
    div.textContent = `${delta > 0 ? '+' : ''}${emoji}${Math.abs(delta)}`;
    div.style.position = 'absolute';
    div.style.left = `${pageX}px`;
    div.style.top = `${pageY}px`;
    div.style.transform = 'translate(-50%, 0) scale(1)';
    div.style.fontSize = '1.25rem';
    div.style.fontWeight = 'bold';
    div.style.color = delta < 0 ? '#d22' : '#2a2';
    div.style.textShadow = '0 2px 8px #fff, 0 0 2px #0008';
    div.style.opacity = '0';
    div.style.pointerEvents = 'none';
    div.style.zIndex = 1001;
    div.style.transition = 'opacity 0.18s, transform 0.7s cubic-bezier(.2,1.2,.4,1)';
    document.body.appendChild(div);
    // Animate in
    setTimeout(() => {
        div.style.opacity = '1';
        div.style.transform = 'translate(-50%, -18px) scale(1.18)';
    }, 10);
    // Animate out
    setTimeout(() => {
        div.style.opacity = '0';
        div.style.transform = 'translate(-50%, -48px) scale(0.92)';
    }, 900);
    // Remove after animation
    setTimeout(() => {
        if (div.parentNode) div.parentNode.removeChild(div);
    }, 1500);
}
    enableBuildingBar();
    showAnimatedText('Turn Ended');
    draw();
};

function enableBuildingBar() {
    const bar = document.getElementById('building-bar');
    if (bar) {
        Array.from(bar.children).forEach((btn, i) => {
            // Find the corresponding building type
            const b = buildingTypes[i];
            if (!freeBuild && b.price > resources.gld) {
                btn.disabled = true;
                btn.style.opacity = '0.5';
                btn.style.pointerEvents = 'none';
            } else {
                btn.disabled = false;
                btn.style.opacity = '';
                btn.style.pointerEvents = '';
            }
        });
    }
}
function disableBuildingBar() {
    if (freeBuild) return;
    const bar = document.getElementById('building-bar');
    if (bar) {
        Array.from(bar.children).forEach(btn => {
            btn.disabled = true;
            btn.style.opacity = '0.5';
            btn.style.pointerEvents = 'none';
        });
    }
}
// --- Resource system ---
let resources = {
    pop: 0,
    fud: 0,
    gld: 5,
    hpy: 0,
    wis: 0
};

function updateResourceDisplay() {
    const popEl = document.getElementById('resource-pop');
    const gldEl = document.getElementById('resource-gld');
    const hpyEl = document.getElementById('resource-hpy');
    const wisEl = document.getElementById('resource-wis');
    if (popEl) popEl.textContent = `POP: ${resources.pop}`;
    if (gldEl) gldEl.textContent = `GLD: ${resources.gld}`;
    if (hpyEl) hpyEl.textContent = `HPY: ${resources.hpy}`;
    if (wisEl) wisEl.textContent = `WIS: ${resources.wis}`;
}

// Initialize resource display on load
updateResourceDisplay();
// Only create and append a canvas if one does not already exist in #app
const app = document.getElementById('app');
let canvas = app.querySelector('canvas');
// 25% larger canvas (same aspect ratio as 600x400)
export const CANVAS_WIDTH = 750;
export const CANVAS_HEIGHT = 500;
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
    // Level definitions (can expand later)
    const levels = [
        { rows: 5, cols: 5 }, // Level 1
        { rows: 5, cols: 10 }, // Level 2 (10x5)
    ];
    let currentLevel = 0;
    let boardRows = levels[currentLevel].rows;
    let boardCols = levels[currentLevel].cols;


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


    // --- Building types ---
    const buildingTypes = [
    { id: 'house', name: 'House', icon: '🏠', resourceEffect: 'POP+1;FUD-1/t', desc: 'Lorem ipsum dolor sit amet.', price: 3 },
    { id: 'tree', name: 'Tree', icon: '🌳', resourceEffect: 'HPY+1', desc: 'Lorem ipsum dolor sit amet.', price: 2 },
    { id: 'well', name: 'Well', icon: '⛲', resourceEffect: 'HPY+1', desc: 'Lorem ipsum dolor sit amet.', price: 4 },
    { id: 'windmill', name: 'Windmill', icon: '🌬️', resourceEffect: 'FUD+1/t', desc: 'Lorem ipsum dolor sit amet.', price: 2 },
    { id: 'farm', name: 'Farm', icon: '🏚️', resourceEffect: 'FUD+3/t', desc: 'Lorem ipsum dolor sit amet.', price: 5 },
    { id: 'castle', name: 'Castle', icon: '🏰', resourceEffect: 'POP+2', desc: 'Lorem ipsum dolor sit amet.', price: 30 },
    { id: 'shop', name: 'Shop', icon: '🏪', resourceEffect: 'GLD+2', desc: 'Lorem ipsum dolor sit amet.', price: 8 },
    { id: 'factory', name: 'Factory', icon: '🏭', resourceEffect: 'GLD+2;HPY-1/t', desc: 'Lorem ipsum dolor sit amet.', price: 12 },
    { id: 'lighthouse', name: 'Lighthouse', icon: '🗼', resourceEffect: 'WIS+1', desc: 'Lorem ipsum dolor sit amet.', price: 7 },
    { id: 'hotspring', name: 'Hot Spring', icon: '♨️', resourceEffect: 'HPY+2', desc: 'Lorem ipsum dolor sit amet.', price: 10 },
    { id: 'library', name: 'Library', icon: '📚', resourceEffect: 'WIS+2', desc: 'Lorem ipsum dolor sit amet.', price: 15 },
    { id: 'portal', name: 'Portal', icon: '🌀', resourceEffect: 'WIS+1', desc: 'Lorem ipsum dolor sit amet.', price: 18 },
    { id: 'volcano', name: 'Volcano', icon: '🌋', resourceEffect: 'HPY-1', desc: 'Lorem ipsum dolor sit amet.', price: 25 },
    { id: 'aquarium', name: 'Aquarium', icon: '🐠', resourceEffect: 'HPY+1', desc: 'Lorem ipsum dolor sit amet.', price: 9 },
    { id: 'zengarden', name: 'Zen Garden', icon: '🪴', resourceEffect: 'HPY+2', desc: 'Lorem ipsum dolor sit amet.', price: 11 },
    { id: 'ferriswheel', name: 'Ferris Wheel', icon: '🎡', resourceEffect: 'HPY+2', desc: 'Lorem ipsum dolor sit amet.', price: 50 },
    { id: 'hauntedhouse', name: 'Haunted House', icon: '👻', resourceEffect: 'HPY-2', desc: 'Lorem ipsum dolor sit amet.', price: 20 },
    ];
    let selectedBuilding = null;
    let buildings = Array.from({ length: boardRows }, () => Array(boardCols).fill(null));

    // --- Bob's state ---
    let bobPos = { x: 2, y: 2 };
// --- Level dropdown UI ---
const levelSelect = document.getElementById('level-select');
if (levelSelect) {
    levelSelect.addEventListener('change', (e) => {
        const idx = parseInt(e.target.value, 10) - 1;
        if (idx >= 0 && idx < levels.length) {
            currentLevel = idx;
            boardRows = levels[currentLevel].rows;
            boardCols = levels[currentLevel].cols;
            buildings = Array.from({ length: boardRows }, () => Array(boardCols).fill(null));
            // Place Bob at the center of the board for any level
            bobPos = {
                x: Math.floor(boardCols / 2),
                y: Math.floor(boardRows / 2)
            };
            // Reset resources to 0 on level change
            resources = { pop: 0, fud: 0, gld: 5, hpy: 0, wis: 0 };
            updateResourceDisplay();
            draw();
        }
    });
}
    let bobSelected = false;
    let bobAnim = null; // {from: {x,y}, to: {x,y}, start: time, duration: ms}

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
            // Play 3 much slower footstep sounds per move
            const steps = 3;
            const stepTimes = [0.28, 0.58, 0.88]; // even more spaced out
            if (!bobAnim.playedSteps) bobAnim.playedSteps = Array(steps).fill(false);
            for (let i = 0; i < steps; ++i) {
                if (!bobAnim.playedSteps[i] && t >= stepTimes[i]) {
                    SoundEffects.playFootstep();
                    bobAnim.playedSteps[i] = true;
                }
            }
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
                if ((x === Math.round(drawBobX) && y !== Math.round(drawBobY)) || (y === Math.round(drawBobY) && x !== Math.round(drawBobX))) {
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
                let isBuildable = false;
                if (bobSelected && ((x === bobPos.x && y !== bobPos.y) || (y === bobPos.y && x !== bobPos.x))) {
                    isRookMove = true;
                    ctx.fillStyle = 'rgba(100,200,255,0.35)';
                    ctx.fill();
                }
                // Highlight buildable tiles if a building is selected
                if (
                    selectedBuilding &&
                    !buildings[y][x] &&
                    (
                        (freeBuild && !(bobPos.x === x && bobPos.y === y)) ||
                        (!freeBuild && (Math.abs(x - bobPos.x) + Math.abs(y - bobPos.y) === 1) && !(bobPos.x === x && bobPos.y === y))
                    )
                ) {
                    isBuildable = true;
                    ctx.fillStyle = 'rgba(255, 200, 80, 0.38)';
                    ctx.fill();
                }
                ctx.strokeStyle = '#333';
                ctx.stroke();
                ctx.fillStyle = (x + y) % 2 === 0 ? '#eaeaea' : '#d0d0d0';
                if (!isRookMove && !isBuildable) ctx.fill();

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

                // Draw building if present (drawn after Bob)
                const b = buildings[y][x];
                if (b) {
                    const center = obliqueProjectCentered(x + 0.5, y + 0.5);
                    ctx.font = '32px sans-serif';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.globalAlpha = 0.95;
                    ctx.fillText(b.icon, center.x, center.y); // Remove +8, move building up
                    ctx.globalAlpha = 1.0;
                }
            }
        }
        ctx.restore();

        // Draw resource bar along the bottom edge of the canvas
        ctx.save();
        ctx.font = 'bold 1.2rem sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillStyle = 'rgba(244,244,244,0.95)';
        ctx.strokeStyle = '#ccc';
        ctx.lineWidth = 2;
        if (ctx.roundRect) {
            ctx.beginPath();
            ctx.roundRect(20, CANVAS_HEIGHT - 44, CANVAS_WIDTH - 40, 36, 10);
            ctx.fill();
            ctx.stroke();
        } else {
            ctx.fillRect(20, CANVAS_HEIGHT - 44, CANVAS_WIDTH - 40, 36);
            ctx.strokeRect(20, CANVAS_HEIGHT - 44, CANVAS_WIDTH - 40, 36);
        }
        ctx.fillStyle = '#333';
        const labels = [
            `👥 POP: ${resources.pop}`,
            `💰 GLD: ${resources.gld}`,
            `🍔 FUD: ${resources.fud}`,
            `😊 HPY: ${resources.hpy}`,
            `📜 WIS: ${resources.wis}`
        ];
        const n = labels.length;
        for (let i = 0; i < n; ++i) {
            ctx.fillText(labels[i], 100 + i * ((CANVAS_WIDTH - 200) / (n - 1)), CANVAS_HEIGHT - 16);
        }
        ctx.restore();
        requestAnimationFrame(draw);
    }

draw();


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
            if ((x === Math.round(drawBobX) && y !== Math.round(drawBobY)) || (y === Math.round(drawBobY) && x !== Math.round(drawBobX))) {
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

    // If a building is selected, allow placement on gold-highlighted (adjacent) tiles
    // Only restrict to one build per turn if not in Free Building mode
    if (selectedBuilding && (!turnHasBuilt || freeBuild)) {
        let triedToBuild = false;
        let built = false;
        for (let y = 0; y < boardRows; y++) {
            for (let x = 0; x < boardCols; x++) {
                const isAdjacent = (Math.abs(x - bobPos.x) + Math.abs(y - bobPos.y) === 1);
                const canBuildHere = freeBuild ? (!buildings[y][x] && !(bobPos.x === x && bobPos.y === y)) : (isAdjacent && !buildings[y][x] && !(bobPos.x === x && bobPos.y === y));
                if (pointInTile(x, y, mx, my)) {
                    triedToBuild = true;
                    if (canBuildHere) {
                        // Subtract gold if not in Free Building mode
                        if (!freeBuild) {
                            if (resources.gld < selectedBuilding.price) {
                                // Not enough gold, do nothing
                                return;
                            }
                            resources.gld -= selectedBuilding.price;
                            updateResourceDisplay();
                        }
                        buildings[y][x] = selectedBuilding;
                        // Play sound effect for building type
                        switch (selectedBuilding.id) {
                            case 'house': SoundEffects.playHouse(); break;
                            case 'tree': SoundEffects.playTree(); break;
                            case 'well': SoundEffects.playWell(); break;
                            case 'windmill': SoundEffects.playWindmill(); break;
                            case 'farm': SoundEffects.playFarm(); break;
                            case 'castle': SoundEffects.playCastle(); break;
                            case 'shop': SoundEffects.playShop(); break;
                            case 'factory': SoundEffects.playFactory(); break;
                            case 'lighthouse': SoundEffects.playLighthouse(); break;
                            case 'hotspring': SoundEffects.playHotspring(); break;
                            case 'library': SoundEffects.playLibrary(); break;
                            case 'portal': SoundEffects.playPortal(); break;
                            case 'volcano': SoundEffects.playVolcano(); break;
                            case 'aquarium': SoundEffects.playAquarium(); break;
                            case 'zengarden': SoundEffects.playZengarden(); break;
                            case 'ferriswheel': SoundEffects.playFerriswheel(); break;
                            case 'hauntedhouse': SoundEffects.playHauntedhouse(); break;
                        }
                        // Enact resource effect only if not a per-turn effect
                        if (selectedBuilding.resourceEffect && !/\/t$/.test(selectedBuilding.resourceEffect)) {
                            // Support multiple effects separated by ';', only apply non-per-turn effects
                            const effects = selectedBuilding.resourceEffect.split(';');
                            let applied = false;
                            effects.forEach(eff => {
                                if (!/\/t$/.test(eff.trim())) {
                                    const match = eff.match(/(POP|GLD|FUD|HPY|WIS)([+-]\d+)/i);
                                    if (match) {
                                        const key = match[1].toLowerCase();
                                        const delta = parseInt(match[2], 10);
                                        if (resources.hasOwnProperty(key)) {
                                            resources[key] += delta;
                                            applied = true;
                                        }
                                    }
                                }
                            });
                            if (applied) updateResourceDisplay();
                        }
                        // If resourceEffect contains any ";", the above block is skipped due to the old logic's !/\/t$/.test(selectedBuilding.resourceEffect) check. To fix, always check all effects for non-per-turn effects:
                        else if (selectedBuilding.resourceEffect && selectedBuilding.resourceEffect.includes(';')) {
                            const effects = selectedBuilding.resourceEffect.split(';');
                            let applied = false;
                            effects.forEach(eff => {
                                if (!/\/t$/.test(eff.trim())) {
                                    const match = eff.match(/(POP|GLD|FUD|HPY|WIS)([+-]\d+)/i);
                                    if (match) {
                                        const key = match[1].toLowerCase();
                                        const delta = parseInt(match[2], 10);
                                        if (resources.hasOwnProperty(key)) {
                                            resources[key] += delta;
                                            applied = true;
                                        }
                                    }
                                }
                            });
                            if (applied) updateResourceDisplay();
                        }
                        if (!freeBuild) {
                            selectedBuilding = null;
                            turnHasBuilt = true;
                            disableBuildingBar();
                            // Deselect all building bar buttons
                            const bar = document.getElementById('building-bar');
                            if (bar) {
                                Array.from(bar.children).forEach(el => el.classList.remove('selected'));
                            }
                        }
                        draw();
                        built = true;
                        return;
                    }
                }
            }
        }
        if (triedToBuild && !built) {
            showAnimatedText("Can't Build There", { color: '#e44', fontSize: '2.1rem' });
        }
    }

    // Otherwise, handle Bob selection/movement (only if not already moved this turn)
    if (!bobSelected && !turnHasMoved) {
        if (pointInTile(bobPos.x, bobPos.y, mx, my)) {
            bobSelected = true;
            draw();
        }
    } else if (bobSelected) {
        let moved = false;
        for (let y = 0; y < boardRows; y++) {
            for (let x = 0; x < boardCols; x++) {
                if ((x === bobPos.x && y !== bobPos.y) || (y === bobPos.y && x !== bobPos.x)) {
                    if (pointInTile(x, y, mx, my)) {
                        bobAnim = {
                            from: { ...bobPos },
                            to: { x, y },
                            start: performance.now(),
                            duration: 300
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
        if (moved) turnHasMoved = true;
        draw();
    }
});

// --- Building bar UI ---
const bar = document.getElementById('building-bar');
if (bar) {
    bar.innerHTML = "";
    buildingTypes.forEach((b, i) => {
        const btn = document.createElement('button');
        // Make the card wider for effect line
    btn.style.minWidth = '172px';
    btn.style.maxWidth = '260px';
    btn.style.whiteSpace = 'normal';
        const isLongName = b.name.length > 12;
        // Support multiple effects separated by ';' and show on one line
        let effectHtml = '';
        if (b.resourceEffect) {
            const effects = b.resourceEffect.split(';');
            // Dynamically shrink font size if effects are long
            let totalLen = effects.reduce((sum, eff) => sum + eff.length, 0);
            let fontSize = '1.08em';
            if (totalLen > 16) fontSize = '0.98em';
            if (totalLen > 22) fontSize = '0.89em';
            // Emoji map
            const emojiMap = {
                POP: '👥',
                GLD: '💰',
                FUD: '🍔',
                HPY: '😊',
                WIS: '📜'
            };
            effectHtml = `<div style="display:flex;gap:8px;align-items:center;justify-content:center;margin:2px 0 2px 0;flex-wrap:nowrap;">` +
                effects.map(eff => {
                    // Replace resource label with emoji
                    let effEmoji = eff.replace(/(POP|GLD|FUD|HPY|WIS)/g, m => emojiMap[m] || m);
                    const isPerTurn = /\/t$/.test(eff);
                    const isNegative = /-[0-9]/.test(eff);
                    const isPositive = /\+[0-9]/.test(eff);
                    let color = '#b88';
                    if (isNegative) color = '#d22';
                    else if (isPositive && isPerTurn) color = '#3bb34a'; // lighter green for per-turn positive
                    else if (isPositive) color = '#188c2c'; // darker green for on-placement positive
                    else if (isPerTurn) color = '#2a2';
                    return `<span class=\"resource-effect\" style=\"color:${color};font-size:${fontSize};white-space:nowrap;\">${effEmoji}</span>`;
                }).join('') + `</div>`;
        }
        btn.innerHTML = `
            <span class=\"label\" style=\"display:block;font-size:${isLongName ? '0.98em' : '1.12em'};line-height:${isLongName ? '1.05' : '1.18'};font-weight:bold;\">${b.name}</span>
            <span class=\"icon\">${b.icon}</span>
            ${effectHtml}
            <span class=\"desc\">${b.desc ? b.desc : ''}</span>
            <div class=\"price\" style=\"margin-top:6px;font-weight:bold;color:#b88;font-size:1.1em;display:flex;align-items:center;justify-content:center;gap:2px;\">
                <span style=\"font-size:1.2em;vertical-align:middle;\">💰</span> ${b.price}
            </div>
        `;
        // Disable and grey out if not enough gold and not in Free Building mode
        if (!freeBuild && b.price > resources.gld) {
            btn.disabled = true;
            btn.style.opacity = '0.5';
            btn.style.pointerEvents = 'none';
        }
        btn.addEventListener('click', () => {
            if (turnHasBuilt && !freeBuild) return; // Disable if already built this turn, unless freeBuild
            // If already selected, de-select
            if (selectedBuilding === b) {
                selectedBuilding = null;
                Array.from(bar.children).forEach(el => el.classList.remove('selected'));
                return;
            }
            selectedBuilding = b;
            // Highlight selected
            Array.from(bar.children).forEach((el, idx) => {
                if (idx === i) {
                    el.classList.add('selected');
                } else {
                    el.classList.remove('selected');
                }
            });
        });
        bar.appendChild(btn);
    });
}

// --- Free Building UI ---
let freeBuild = false;
let freeBuildCheckbox = document.getElementById('free-build-checkbox');
if (!freeBuildCheckbox) {
    freeBuildCheckbox = document.createElement('input');
    freeBuildCheckbox.type = 'checkbox';
    freeBuildCheckbox.id = 'free-build-checkbox';
    freeBuildCheckbox.style.marginLeft = '18px';
    freeBuildCheckbox.style.marginTop = '12px';
    freeBuildCheckbox.style.transform = 'scale(1.2)';
}
let freeBuildLabel = document.getElementById('free-build-label');
if (!freeBuildLabel) {
    freeBuildLabel = document.createElement('label');
    freeBuildLabel.htmlFor = 'free-build-checkbox';
    freeBuildLabel.id = 'free-build-label';
    freeBuildLabel.textContent = ' Free Building';
    freeBuildLabel.style.fontSize = '1.08rem';
    freeBuildLabel.style.color = '#333';
    freeBuildLabel.style.marginLeft = '4px';
}
// Place under background options
const bgBar = document.getElementById('background-bar') || document.getElementById('level-select')?.parentElement;
if (bgBar && !document.getElementById('free-build-checkbox')) {
    const container = document.createElement('div');
    container.style.display = 'flex';
    container.style.alignItems = 'center';
    container.style.justifyContent = 'center';
    container.style.marginTop = '10px';
    container.appendChild(freeBuildCheckbox);
    container.appendChild(freeBuildLabel);
    bgBar.parentElement.appendChild(container);
}
freeBuildCheckbox.onchange = () => {
    freeBuild = freeBuildCheckbox.checked;
    enableBuildingBar();
};





