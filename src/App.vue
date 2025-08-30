<template>
  <div id="app">
    <CanvasArea />
    <BuildingBar />
    <LevelBar />
    <BackgroundModeBar />
    <link rel="stylesheet" href="../src/background-mode-bar.css">
  </div>
</template>

<script>
import CanvasArea from './components/CanvasArea.vue';
import BuildingBar from './components/BuildingBar.vue';
import LevelBar from './components/LevelBar.vue';
import BackgroundModeBar from './components/BackgroundModeBar.vue';

export default {
  name: 'App',
  components: {
    CanvasArea,
    BuildingBar,
    LevelBar,
    BackgroundModeBar
  },
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
