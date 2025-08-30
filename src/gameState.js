// src/gameState.js

export const levels = [
  { rows: 5, cols: 5 },
  { rows: 5, cols: 10 },
];

export let currentLevel = 0;
export let boardRows = levels[currentLevel].rows;
export let boardCols = levels[currentLevel].cols;
export let buildings = Array.from({ length: boardRows }, () => Array(boardCols).fill(null));

export function setLevel(idx) {
  if (idx >= 0 && idx < levels.length) {
    currentLevel = idx;
    boardRows = levels[currentLevel].rows;
    boardCols = levels[currentLevel].cols;
    buildings = Array.from({ length: boardRows }, () => Array(boardCols).fill(null));
  }
}
