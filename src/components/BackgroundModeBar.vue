<template>
  <div id="background-mode-bar">
    <label for="background-mode-select">Background:</label>
    <select id="background-mode-select">
      <option value="optimized">Optimized (fast)</option>
      <option value="classic">Classic (per-frame)</option>
    </select>
  </div>
</template>

<script>
export default {
  name: 'BackgroundModeBar'
};
</script>
