<template>
  <div class="panel">
    <TileTemplateComponent 
      v-for="(tile, area) in tileInfo"
      :key="area"
      :style="{
        gridArea: area,
        color: tile.color,
        backgroundColor: tile.backgroundColor,
      }"
    >
      <component :is="tile.component" />
    </TileTemplateComponent>
  </div>
</template>

<script>
import { defineComponent, shallowRef } from 'vue';
import TileTemplateComponent from './TileTemplateComponent.vue';
import DinstanceTileComponent from './DistanceTileComponent.vue';
import { useMainStore } from '../stores/main';

export default defineComponent({
  components: {
    TileTemplateComponent,
    DinstanceTileComponent,
  },
  async setup() {
    const store = useMainStore()
    const posts = ref(store.activities)

    const tileInfo = shallowRef({
      distance: {
        backgroundColor: '#D34E24',
        color: '#f6e2dd',
        component: DinstanceTileComponent,
      },
      time: {
        backgroundColor: '#D34E24',
        color: '#f6e2dd',
        component: 'span',
      },
      speed: {
        backgroundColor: '#D34E24',
        color: '#f6e2dd',
        component: 'span',
      },
      sportsSelector: {
        backgroundColor: '#D34E24',
        color: '#f6e2dd',
        component: 'span',
      },
      sessionCount: {
        backgroundColor: '#D34E24',
        color: '#f6e2dd',
        component: 'span',
      },
      map: {
        backgroundColor: '#D34E24',
        color: '#f6e2dd',
        component: 'span',
      },
      charts: {
        backgroundColor: '#D34E24',
        color: '#f6e2dd',
        component: 'span',
      },
      topDistance: {
        backgroundColor: '#D34E24',
        color: '#f6e2dd',
        component: 'span',
      },
      topSpeed: {
        backgroundColor: '#D34E24',
        color: '#f6e2dd',
        component: 'span',
      },
    });
    
    return {
      tileInfo,
      posts
    };
  },
});
</script>

<style scoped>
.panel {
  padding: 12px;
  height: calc(100vh - 120px);
  gap: 12px;
  display: grid;
  grid-template-columns: auto auto auto auto auto 80px;
  grid-template-rows: 80px 80px 80px 1fr 100px 100px;
  grid-auto-columns: 1fr;
  grid-auto-flow: row;
  grid-template-areas:
    "distance distance speed speed speed sportsSelector"
    "time time speed speed speed sportsSelector"
    "sessionCount sessionCount sessionCount map map map"
    "charts charts charts map map map"
    "charts charts charts topSpeed topSpeed topSpeed"
    "charts charts charts topDistance topDistance topDistance";
}
</style>
