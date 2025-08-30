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

export const buildingTypes = [
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

export let selectedBuilding = null;
export let freeBuild = false;

export function setSelectedBuilding(b) {
  selectedBuilding = b;
}

export function setFreeBuild(val) {
  freeBuild = val;
}
