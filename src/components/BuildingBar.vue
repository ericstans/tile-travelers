
<template>
  <div id="building-bar" class="building-bar">
    <button
      v-for="(b, i) in buildingTypes"
      :key="b.id"
      :class="['building-btn', { selected: selectedBuilding && selectedBuilding.id === b.id }]"
      :disabled="!freeBuild && b.price > resources.gld"
      @click="selectBuilding(b)"
      :title="b.desc + ' (Cost: ' + b.price + ' gold)'"
    >
      <span class="icon">{{ b.icon }}</span>
      <span class="name">{{ b.name }}</span>
      <span class="price">{{ b.price }}</span>
    </button>
    <label class="free-build-label">
      <input type="checkbox" v-model="freeBuild" @change="toggleFreeBuild" /> Free Building
    </label>
  </div>
</template>

<script>

import { buildingTypes, selectedBuilding, setSelectedBuilding, freeBuild, setFreeBuild } from '../gameState.js';
import { reactive, toRefs, computed } from 'vue';

export default {
  name: 'BuildingBar',
  setup() {
    // For demo, resources are hardcoded. Replace with actual shared state if needed.
    // Use computed to ensure reactivity for imported state
    const buildingTypesRef = computed(() => buildingTypes);
    const selectedBuildingRef = computed(() => selectedBuilding);
    const freeBuildRef = computed({
      get: () => freeBuild,
      set: val => setFreeBuild(val)
    });
    // For demo, resources are hardcoded. Replace with actual shared state if needed.
    const resources = reactive({ gld: 100 }); // TODO: Replace with actual resource state

    function selectBuilding(b) {
      if (selectedBuilding && selectedBuilding.id === b.id) {
        setSelectedBuilding(null);
      } else {
        setSelectedBuilding(b);
      }
    }
    function toggleFreeBuild(e) {
      setFreeBuild(e.target.checked);
    }

    return {
      buildingTypes: buildingTypesRef,
      selectedBuilding: selectedBuildingRef,
      freeBuild: freeBuildRef,
      resources,
      selectBuilding,
      toggleFreeBuild
    };
  }
};
</script>

<style scoped>
.building-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 10px;
  align-items: center;
}
.building-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 6px 10px;
  border: 1px solid #aaa;
  border-radius: 6px;
  background: #fff;
  cursor: pointer;
  min-width: 60px;
  min-height: 60px;
  font-size: 1.2rem;
  transition: box-shadow 0.2s, border 0.2s;
}
.building-btn.selected {
  border: 2px solid #f7b300;
  box-shadow: 0 0 8px #f7b30055;
}
.building-btn:disabled {
  opacity: 0.5;
  pointer-events: none;
}
.icon {
  font-size: 1.6rem;
}
.name {
  font-size: 0.95rem;
}
.price {
  font-size: 0.85rem;
  color: #888;
}
.free-build-label {
  margin-left: 18px;
  font-size: 1.08rem;
  color: #333;
  display: flex;
  align-items: center;
}
.free-build-label input[type="checkbox"] {
  margin-right: 4px;
  transform: scale(1.2);
}
</style>
