<template>
  <div id="building-bar"></div>
  <div id="level-bar" style="margin: 0 auto 16px auto; text-align: center;">
    <label for="level-select">Level:</label>
    <select id="level-select">
      <option value="1">Level 1</option>
      <option value="2">Level 2</option>
    </select>
  </div>
  <div id="background-mode-bar">
    <label for="background-mode-select">Background:</label>
    <select id="background-mode-select">
      <option value="optimized">Optimized (fast)</option>
      <option value="classic">Classic (per-frame)</option>
    </select>
  </div>

  <link rel="stylesheet" href="../src/background-mode-bar.css">
</template>

<script>
export default {
  name: 'App',
  mounted() {
    // Import isoboard logic after DOM is ready
    import('./index.js');
  }
};
</script>

<style scoped>
#app {
  width: 100vw;
  min-height: 100vh;
}
</style>
