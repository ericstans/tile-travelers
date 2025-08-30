
<template>
  <div id="level-bar" style="margin: 0 auto 16px auto; text-align: center;">
    <label for="level-select">Level:</label>
    <select id="level-select" v-model="selected" @change="onChange">
      <option v-for="(level, idx) in levels" :key="idx" :value="idx">Level {{ idx + 1 }}</option>
    </select>
  </div>
</template>

<script>
import { levels, setLevel } from '../gameState.js';
export default {
  name: 'LevelBar',
  data() {
    return {
      selected: 0,
      levels
    };
  },
  mounted() {
    setLevel(this.selected);
  },
  methods: {
    onChange() {
      setLevel(Number(this.selected));
    }
  }
};
</script>
