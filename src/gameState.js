// src/gameState.js

// Simple board configuration
export const boardRows = 20;
export const boardCols = 20;

// Create a 20x20 board with 100 random tiles removed
export let boardTiles = Array.from({ length: boardRows }, () => Array(boardCols).fill(true));

// Remove 100 random tiles
const totalTiles = boardRows * boardCols; // 400 tiles
const tilesToRemove = 100;
const removedTiles = new Set();

// Generate 100 unique random positions to remove
while (removedTiles.size < tilesToRemove) {
    const randomRow = Math.floor(Math.random() * boardRows);
    const randomCol = Math.floor(Math.random() * boardCols);
    const position = `${randomRow},${randomCol}`;
    removedTiles.add(position);
}

// Apply the removals to the board
removedTiles.forEach(position => {
    const [row, col] = position.split(',').map(Number);
    boardTiles[row][col] = false;
});

// Ensure Bob's starting position (2,2) is not removed
boardTiles[2][2] = true;
