import { createApp } from 'vue';
import App from './App.vue';
import { drawGrass, grassBuffer, desertBuffer, drawShimmerWhite } from './utils/drawGrass.js';
import SoundEffects from './utils/soundEffects.js';
import './utils/background-mode-bar.css';
import './styles.css';
createApp(App).mount('#app');

import { boardRows, boardCols, boardTiles } from './gameState.js';

// --- Tile Objects System ---
const TILE_OBJECT_PROBABILITY = 0.25; // 25% chance per tile

const OBJECT_TYPES = {
    hihat: { emoji: '👒', name: 'Hi Hat' },
    shaker: { emoji:'🥢', name: 'Shaker' },
    clap: { emoji: '👏', name: 'Clap' },
    snare: { emoji: '🥁', name: 'Snare' }
};

// Generate random objects for each tile
const tileObjects = Array.from({ length: boardRows }, () => Array(boardCols).fill(null));
const objectActivation = Array.from({ length: boardRows }, () => Array(boardCols).fill(false));
const objectActivationTime = Array.from({ length: boardRows }, () => Array(boardCols).fill(0));

// Populate tiles with random objects
    for (let y = 0; y < boardRows; y++) {
        for (let x = 0; x < boardCols; x++) {
        // Only place objects on existing tiles
        if (boardTiles[y][x] && Math.random() < TILE_OBJECT_PROBABILITY) {
            const objectTypes = Object.keys(OBJECT_TYPES);
            const randomType = objectTypes[Math.floor(Math.random() * objectTypes.length)];
            tileObjects[y][x] = randomType;
        }
    }
}

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

    // --- Character System ---
const CHARACTERS = {
    bob: {
        name: 'Bassline Bob',
        startPos: { x: 2, y: 2 },
        color: '#f66',
        outlineColor: '#a33',
        targetColor: 'rgba(255,100,100,0.6)',
        soundPrefix: '',
        chordDesignated: [523.25, 659.25, 783.99], // C major
        chordReached: [349.23, 440.00, 523.25], // F major
        waveType: 'sine',
        footstepFreq: { min: 470, max: 530 },
        footstepDuration: 0.06,
        footstepVolume: 0.22,
        // Bassline Bob specific properties
        isBassline: true,
        bassFreq: 55, // Low A note
        bassVolume: 0.15,
        noKickOnBlank: true
    },
    larry: {
        name: 'Larry',
        startPos: { x: 18, y: 18 },
        color: '#66f',
        outlineColor: '#336',
        targetColor: 'rgba(100,100,255,0.6)',
        soundPrefix: 'Larry',
        chordDesignated: [293.66, 349.23, 440.00], // D minor
        chordReached: [233.08, 293.66, 349.23], // Bb major
        waveType: 'triangle',
        footstepFreq: { min: 320, max: 360 },
        footstepDuration: 0.08,
        footstepVolume: 0.18
    },
    charlie: {
        name: 'Charlie Kicks',
        startPos: { x: 2, y: 18 },
        color: '#6f6',
        outlineColor: '#363',
        targetColor: 'rgba(100,255,100,0.6)',
        soundPrefix: 'Charlie',
        chordDesignated: [392.00, 493.88, 587.33], // G major
        chordReached: [261.63, 329.63, 392.00], // C major (lower)
        waveType: 'sawtooth',
        footstepFreq: { min: 400, max: 450 },
        footstepDuration: 0.07,
        footstepVolume: 0.20,
        noKickOnBlank: true
    },
    diana: {
        name: 'Diana',
        startPos: { x: 18, y: 2 },
        color: '#f6f',
        outlineColor: '#a3a',
        targetColor: 'rgba(255,100,255,0.6)',
        soundPrefix: 'Diana',
        chordDesignated: [311.13, 392.00, 466.16], // Eb major
        chordReached: [277.18, 349.23, 415.30], // C# minor
        waveType: 'square',
        footstepFreq: { min: 380, max: 420 },
        footstepDuration: 0.065,
        footstepVolume: 0.19,
        // Diana moves at twice the speed (300 BPM equivalent)
        speedMultiplier: 2.0,
        noKickOnBlank: true
    }
};

// Character state management
const characterStates = {};
Object.keys(CHARACTERS).forEach(charId => {
    const char = CHARACTERS[charId];
    characterStates[charId] = {
        pos: { ...char.startPos },
        anim: null,
        target: null,
        moving: false,
        path: [],
        pathIndex: 0
    };
});

// --- Camera state ---
let cameraOffsetX = 0;
let cameraOffsetY = 0;
let cameraZoom = 1.0;
let isDragging = false;
let lastMouseX = 0;
let lastMouseY = 0;

// Character states are now managed in characterStates object above

// --- Sound Deduplication System ---
const soundDeduplication = new Map(); // Track sounds by beat time and type
const BEAT_TOLERANCE_MS = 50; // Sounds within 50ms are considered the same beat

function shouldPlaySound(soundType, currentTime) {
    const beatTime = Math.floor(currentTime / SoundEffects.BEAT_DURATION_MS) * SoundEffects.BEAT_DURATION_MS;
    const key = `${soundType}_${beatTime}`;
    
    if (soundDeduplication.has(key)) {
        return false; // Sound already played this beat
    }
    
    soundDeduplication.set(key, true);
    
    // Clean up old entries (keep only last 10 beats)
    if (soundDeduplication.size > 10) {
        const oldestKey = soundDeduplication.keys().next().value;
        soundDeduplication.delete(oldestKey);
    }
    
    return true;
}

// --- Object Activation System ---
function activateObject(x, y, charId) {
    const currentTime = performance.now();
    
    if (tileObjects[y] && tileObjects[y][x]) {
        // Tile has an object - play percussion sound
        const objectType = tileObjects[y][x];
        
        // Activate the object
        objectActivation[y][x] = true;
        objectActivationTime[y][x] = currentTime;
        
        // Play percussion sound with deduplication
        if (shouldPlaySound(`percussion_${objectType}`, currentTime)) {
            SoundEffects.playPercussionSound(objectType, charId);
        }
        
        // Deactivate after glow duration (500ms)
        setTimeout(() => {
            objectActivation[y][x] = false;
        }, 500);
    } else {
        // Empty tile - play kick drum (unless character has noKickOnBlank)
        const char = CHARACTERS[charId];
        if (!char.noKickOnBlank && shouldPlaySound('kick', currentTime)) {
            SoundEffects.playKickDrum();
        }
    }
}

// --- Generic Character AI Functions ---
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

function getRandomBassFrequency() {
    // Collect all chord notes from non-bassline characters
    const allChordNotes = [];
    
    Object.values(CHARACTERS).forEach(char => {
        if (!char.isBassline) {
            // Add notes from chordDesignated and chordReached
            allChordNotes.push(...char.chordDesignated);
            allChordNotes.push(...char.chordReached);
        }
    });
    
    if (allChordNotes.length === 0) {
        return 55; // Fallback to low A if no chords available
    }
    
    // Select a random note and transpose it down to bass range
    const randomNote = allChordNotes[Math.floor(Math.random() * allChordNotes.length)];
    
    // Transpose down by 2-3 octaves to get into bass range (55-220 Hz)
    const bassFreq = randomNote / 4; // Divide by 4 to go down 2 octaves
    
    return bassFreq;
}

function chooseRandomTarget(currentPos) {
    // Find all reachable tiles
    const reachableTiles = [];
    
    for (let y = 0; y < boardRows; y++) {
        for (let x = 0; x < boardCols; x++) {
            if (boardTiles[y][x] && (x !== currentPos.x || y !== currentPos.y)) {
                const path = findPath(currentPos, { x, y });
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

function startCharacterAI(charId) {
    const state = characterStates[charId];
    const char = CHARACTERS[charId];
    
    if (state.moving || state.anim) return; // Already moving
    
    const target = chooseRandomTarget(state.pos);
    if (!target) {
        // No reachable targets, try again later
        setTimeout(() => startCharacterAI(charId), 1000);
        return;
    }
    
    state.target = target;
    const path = findPath(state.pos, target);
    if (!path || path.length === 0) {
        // Can't reach target, try again
        setTimeout(() => startCharacterAI(charId), 1000);
        return;
    }
    
    // Sync target designation sound to next beat
    const delayToNextBeat = SoundEffects.getNextBeatTime();
    setTimeout(() => {
        SoundEffects.playTargetDesignated(charId, char);
    }, delayToNextBeat);
    
    state.path = path;
    state.pathIndex = 0;
    state.moving = true;
    
    // Start movement on the next eighth note after the sound
    const delayToNextEighth = SoundEffects.getNextEighthNoteTime();
    setTimeout(() => {
        moveCharacterToNext(charId);
    }, delayToNextEighth + SoundEffects.EIGHTH_NOTE_MS);
}

function moveCharacterToNext(charId) {
    const state = characterStates[charId];
    const char = CHARACTERS[charId];
    
    if (state.pathIndex >= state.path.length) {
        // Reached target - sync sound to next beat
        const delayToNextBeat = SoundEffects.getNextBeatTime();
        setTimeout(() => {
            if (char.isBassline) {
                // Bassline Bob: Stop current bass note and start new one when reaching target
                SoundEffects.stopBassNote();
                // Start new bass note with random frequency from other characters' chords
                const randomFreq = getRandomBassFrequency();
                SoundEffects.startBassNote(randomFreq, char.bassVolume);
            } else {
                // Other characters: Play target reached sound
                SoundEffects.playTargetReached(charId, char);
            }
        }, delayToNextBeat);
        
        state.moving = false;
        state.target = null;
        state.path = [];
        state.pathIndex = 0;
        
        // Wait for next beat, then choose a new target
        setTimeout(() => startCharacterAI(charId), delayToNextBeat + SoundEffects.BEAT_DURATION_MS * 2);
        return;
    }
    
    const nextPos = state.path[state.pathIndex];
    const distance = Math.abs(nextPos.x - state.pos.x) + Math.abs(nextPos.y - state.pos.y);
    
    // Calculate timing to sync movement with beat
    const currentTime = performance.now();
    const delayToNextBeat = SoundEffects.getTimeToNextBeatFromTime(currentTime);
    
    // Apply speed multiplier for faster characters
    const speedMultiplier = char.speedMultiplier || 1.0;
    const adjustedDelay = delayToNextBeat / speedMultiplier;
    
    // Start movement animation to complete on the next beat (adjusted for speed)
    const movementStartTime = performance.now();
    const movementDuration = adjustedDelay;
    
    state.anim = {
        from: { ...state.pos },
        to: { ...nextPos },
        start: movementStartTime,
        duration: movementDuration
    };
    
    // Play footstep exactly when movement completes (on the beat, adjusted for speed)
    // Use a more precise timing approach
    const footstepTime = currentTime + adjustedDelay;
    const footstepDelay = footstepTime - performance.now();
    
    setTimeout(() => {
        // Only play footstep for non-bassline characters
        if (!char.isBassline) {
            SoundEffects.playFootstep(charId, char);
        }
        
        // Update character's position when footstep plays
        state.pos = { ...nextPos };
        state.pathIndex++;
        
        // Activate object if character stepped on one
        activateObject(nextPos.x, nextPos.y, charId);
        
        // Schedule next move to start on the next eighth note (adjusted for speed)
        const eighthNoteDelay = SoundEffects.EIGHTH_NOTE_MS / speedMultiplier;
        const nextMoveTime = footstepTime + eighthNoteDelay;
        const nextMoveDelay = nextMoveTime - performance.now();
        setTimeout(() => moveCharacterToNext(charId), Math.max(0, nextMoveDelay));
    }, Math.max(0, footstepDelay));
}

// Old individual character functions removed - now using generic system above

    function draw(time = performance.now()) {
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    drawGrass(ctx, time);

             // Animate all characters
     const characterDrawPositions = {};
     Object.keys(CHARACTERS).forEach(charId => {
         const state = characterStates[charId];
         let drawX = state.pos.x;
         let drawY = state.pos.y;
         
         if (state.anim) {
             const elapsed = Math.min(time - state.anim.start, state.anim.duration);
             const t = Math.min(1, elapsed / state.anim.duration);
            // Ease out cubic for snappy feel
            const ease = 1 - Math.pow(1 - t, 3);
             drawX = state.anim.from.x + (state.anim.to.x - state.anim.from.x) * ease;
             drawY = state.anim.from.y + (state.anim.to.y - state.anim.from.y) * ease;
             // Footsteps are now played when reaching squares, not during animation
            if (t >= 1) {
                 state.anim = null;
             }
         }
         
         characterDrawPositions[charId] = { x: drawX, y: drawY };
     });

              // --- Manual camera controls ---
        ctx.save();
     ctx.translate(cameraOffsetX, cameraOffsetY);
     ctx.scale(cameraZoom, cameraZoom);

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
            
                         // Highlight target squares for all characters
             let isAnyTarget = false;
             Object.keys(CHARACTERS).forEach(charId => {
                 const state = characterStates[charId];
                 const char = CHARACTERS[charId];
                 if (state.target && x === state.target.x && y === state.target.y) {
                     isAnyTarget = true;
                     ctx.fillStyle = char.targetColor;
                    ctx.fill();
                }
             });
            
                ctx.strokeStyle = '#333';
                ctx.stroke();
                ctx.fillStyle = (x + y) % 2 === 0 ? '#eaeaea' : '#d0d0d0';
             if (!isAnyTarget) ctx.fill();

             // Draw tile object (behind characters)
             const objectType = tileObjects[y][x];
             if (objectType) {
                 const object = OBJECT_TYPES[objectType];
                 const p0 = obliqueProjectCentered(x, y);
                 const p1 = obliqueProjectCentered(x + 1, y);
                 const p2 = obliqueProjectCentered(x + 1, y + 1);
                 const p3 = obliqueProjectCentered(x, y + 1);
                 const centerX = (p0.x + p1.x + p2.x + p3.x) / 4;
                 const centerY = (p0.y + p1.y + p2.y + p3.y) / 4;
                 
                 // Draw glow effect if activated
                 if (objectActivation[y][x]) {
                     const glowIntensity = Math.sin((time - objectActivationTime[y][x]) * 0.01) * 0.5 + 0.5;
                     ctx.shadowColor = '#ffff00';
                     ctx.shadowBlur = 20 * glowIntensity;
                 } else {
                     ctx.shadowBlur = 0;
                 }
                 
                 // Draw emoji
                 ctx.font = '24px Arial';
                 ctx.textAlign = 'center';
                 ctx.textBaseline = 'middle';
                 ctx.fillText(object.emoji, centerX, centerY);
                 
                 // Reset shadow
                 ctx.shadowBlur = 0;
             }

             // Draw all characters if they're on this tile
             Object.keys(CHARACTERS).forEach(charId => {
                 const char = CHARACTERS[charId];
                 const drawPos = characterDrawPositions[charId];
                 
                 if (Math.round(drawPos.x) === x && Math.round(drawPos.y) === y) {
                     const char0 = obliqueProjectCentered(drawPos.x, drawPos.y);
                     const char1 = obliqueProjectCentered(drawPos.x + 1, drawPos.y);
                     const char2 = obliqueProjectCentered(drawPos.x + 1, drawPos.y + 1);
                     const char3 = obliqueProjectCentered(drawPos.x, drawPos.y + 1);
                     const charCenterX = (char0.x + char1.x + char2.x + char3.x) / 4;
                     const charCenterY = (char0.y + char1.y + char2.y + char3.y) / 4;
                     const charYOffset = -tileSize * 0.25 - 8; // Move character up 8px
                     
                     // Draw character body
                     ctx.fillStyle = char.color;
                    ctx.beginPath();
                     ctx.arc(charCenterX, charCenterY + charYOffset, 32, 0, 2 * Math.PI);
                    ctx.fill();
                     
                     // Draw character legs
                     ctx.strokeStyle = char.outlineColor;
                    ctx.lineWidth = 6;
                    ctx.beginPath();
                     ctx.moveTo(charCenterX - 12, charCenterY + charYOffset + 28);
                     ctx.lineTo(charCenterX - 12, charCenterY + charYOffset + 48);
                     ctx.moveTo(charCenterX + 12, charCenterY + charYOffset + 28);
                     ctx.lineTo(charCenterX + 12, charCenterY + charYOffset + 48);
                    ctx.stroke();
                     
                     // Draw character eyes
                    ctx.lineWidth = 1;
                    ctx.fillStyle = '#fff';
                    ctx.beginPath();
                     ctx.arc(charCenterX - 10, charCenterY + charYOffset - 6, 6, 0, 2 * Math.PI);
                    ctx.fill();
                    ctx.beginPath();
                     ctx.arc(charCenterX + 10, charCenterY + charYOffset - 6, 6, 0, 2 * Math.PI);
                    ctx.fill();
                     
                     // Draw character pupils
                    ctx.fillStyle = '#222';
                    ctx.beginPath();
                     ctx.arc(charCenterX - 10, charCenterY + charYOffset - 6, 2, 0, 2 * Math.PI);
                    ctx.fill();
                    ctx.beginPath();
                     ctx.arc(charCenterX + 10, charCenterY + charYOffset - 6, 2, 0, 2 * Math.PI);
                    ctx.fill();
                 }
             });
            }
        }
        ctx.restore();

        requestAnimationFrame(draw);
    }

draw();

// Initialize audio and start the game
let gameStarted = false;

function startGame() {
    if (gameStarted) return;
    gameStarted = true;
    
    // Start all characters with slight delays for variety
    const characterIds = Object.keys(CHARACTERS);
    characterIds.forEach((charId, index) => {
        setTimeout(() => {
            const char = CHARACTERS[charId];
            if (char.isBassline) {
                // Bassline Bob: Start with initial bass note
                const initialFreq = getRandomBassFrequency();
                SoundEffects.startBassNote(initialFreq, char.bassVolume);
            }
            startCharacterAI(charId);
        }, 1000 + (index * 500));
    });
}

// Wait for user interaction to start audio and game
document.addEventListener('click', function() {
    if (!gameStarted) {
        SoundEffects.initializeAudio().then(() => {
            startGame();
        });
    }
}, { once: true });

document.addEventListener('keydown', function() {
    if (!gameStarted) {
        SoundEffects.initializeAudio().then(() => {
            startGame();
        });
    }
}, { once: true });

// --- Camera Controls ---
canvas.addEventListener('mousedown', function (e) {
    isDragging = true;
    lastMouseX = e.clientX;
    lastMouseY = e.clientY;
    canvas.style.cursor = 'grabbing';
});

canvas.addEventListener('mousemove', function (e) {
    if (isDragging) {
        const deltaX = e.clientX - lastMouseX;
        const deltaY = e.clientY - lastMouseY;
        
        cameraOffsetX += deltaX;
        cameraOffsetY += deltaY;
        
        lastMouseX = e.clientX;
        lastMouseY = e.clientY;
    }
});

canvas.addEventListener('mouseup', function (e) {
    isDragging = false;
    canvas.style.cursor = 'grab';
});

canvas.addEventListener('mouseleave', function (e) {
    isDragging = false;
    canvas.style.cursor = 'grab';
});

canvas.addEventListener('wheel', function (e) {
    e.preventDefault();
    
    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.max(0.1, Math.min(3.0, cameraZoom * zoomFactor));
    
    // Zoom towards mouse position
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    // Calculate zoom center relative to canvas
    const zoomCenterX = (mouseX - cameraOffsetX) / cameraZoom;
    const zoomCenterY = (mouseY - cameraOffsetY) / cameraZoom;
    
    // Adjust camera offset to zoom towards mouse
    cameraOffsetX = mouseX - zoomCenterX * newZoom;
    cameraOffsetY = mouseY - zoomCenterY * newZoom;
    
    cameraZoom = newZoom;
});

// Set initial cursor style
canvas.style.cursor = 'grab';