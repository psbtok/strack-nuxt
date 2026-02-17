<template>
  <div class="panel">
    <TileTemplateComponent 
      v-for="(tile, area) in tileInfo"
      :key="area"
      :style="{
        gridArea: area,
        color: tile.fontColor,
        backgroundColor: tile.backgroundColor,
      }"
    >
      <component :is="tile.component" v-bind="tile.componentProps || {}" />
    </TileTemplateComponent>
  </div>
</template>

<script>
import { defineComponent, shallowRef } from 'vue';
import TileTemplateComponent from './TileTemplateComponent.vue';
import DinstanceTileComponent from './DistanceTileComponent.vue';
import CountTileComponent from './CountTileComponent.vue';
import SportModeSelectorComponent from './SportModeSelectorComponent.vue';
import { TILE_COLORS } from '~/utils/tileColors';

export default defineComponent({
  components: {
    TileTemplateComponent,
    DinstanceTileComponent,
    CountTileComponent,
    SportModeSelectorComponent,
  },
  setup() {
    const tileInfo = shallowRef({
      distance: {
        backgroundColor: TILE_COLORS.default.backgroundColor,
        fontColor: TILE_COLORS.default.fontColor,
        component: DinstanceTileComponent,
        componentProps: {
          fontColor: TILE_COLORS.default.fontColor,
        },
      },
      time: {
        backgroundColor: TILE_COLORS.default.backgroundColor,
        fontColor: TILE_COLORS.default.fontColor,
        component: 'span',
      },
      speed: {
        backgroundColor: TILE_COLORS.default.backgroundColor,
        fontColor: TILE_COLORS.default.fontColor,
        component: 'span',
      },
      sportsSelector: {
        backgroundColor: TILE_COLORS.default.backgroundColor,
        fontColor: TILE_COLORS.default.fontColor,
        component: SportModeSelectorComponent,
      },
      sessionCount: {
        backgroundColor: TILE_COLORS.count.backgroundColor,
        fontColor: TILE_COLORS.count.fontColor,
        component: CountTileComponent,
        componentProps: {
          fontColor: TILE_COLORS.count.fontColor,
        },
      },
      map: {
        backgroundColor: TILE_COLORS.default.backgroundColor,
        fontColor: TILE_COLORS.default.fontColor,
        component: 'span',
      },
      charts: {
        backgroundColor: TILE_COLORS.default.backgroundColor,
        fontColor: TILE_COLORS.default.fontColor,
        component: 'span',
      },
      topDistance: {
        backgroundColor: TILE_COLORS.default.backgroundColor,
        fontColor: TILE_COLORS.default.fontColor,
        component: 'span',
      },
      topSpeed: {
        backgroundColor: TILE_COLORS.default.backgroundColor,
        fontColor: TILE_COLORS.default.fontColor,
        component: 'span',
      },
    });
    
    return {
      tileInfo,
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
    "sessionCount sessionCount speed speed speed sportsSelector"
    "time time speed speed speed sportsSelector"
    "distance distance distance map map map"
    "charts charts charts map map map"
    "charts charts charts topSpeed topSpeed topSpeed"
    "charts charts charts topDistance topDistance topDistance";
}
</style>
