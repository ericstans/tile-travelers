
<template>
  <div id="background-mode-bar">
    <label for="background-mode-select">Background:</label>
    <select id="background-mode-select" v-model="selected" @change="onChange">
      <option v-for="opt in options" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
    </select>
  </div>
</template>

<script>
import { setBackgroundMode } from '../isoboard/drawGrass.js';
export default {
  name: 'BackgroundModeBar',
  data() {
    return {
      selected: 'optimized',
      options: [
        { value: 'optimized', label: 'Optimized (Grass Green)' },
        { value: 'desert', label: 'Desert' },
        { value: 'shimmerwhite', label: 'Shimmer on White' },
        { value: 'demoscene', label: 'Demo Scene' },
        { value: 'demoscene2', label: 'Demo Scene 2' },
        { value: 'classic', label: 'Classic (per-frame)' },
      ]
    };
  },
  mounted() {
    setBackgroundMode(this.selected);
  },
  methods: {
    onChange() {
      setBackgroundMode(this.selected);
    }
  }
};
</script>
