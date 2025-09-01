<template>
  <div id="app">
    <CanvasArea />
    <BackgroundModeBar />
    <link rel="stylesheet" href="../src/background-mode-bar.css">
  </div>
</template>

<script>
import CanvasArea from './components/CanvasArea.vue';
import BackgroundModeBar from './components/BackgroundModeBar.vue';

export default {
  name: 'App',
  components: {
    CanvasArea,
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
