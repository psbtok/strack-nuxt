<template>
  <div class="panel">
    <TileTemplateComponent 
      v-for="(tile, area) in tileInfo"
      :key="area"
      :disableAutoWidth="area === 'charts' || area === 'map'"
      :allowOverflow="area === 'map'"
      :disablePadding="area === 'map'"
      :style="{
        gridArea: area,
        color: tile.fontColor,
        backgroundColor: tile.backgroundColor,
        width: area === 'sportsSelector' ? '80px' : undefined,
        minWidth: area === 'sportsSelector' ? '80px' : undefined,
        maxWidth: area === 'sportsSelector' ? '80px' : undefined,
        justifySelf: area === 'sportsSelector' ? 'end' : undefined,
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
import TimeTileComponent from './TimeTileComponent.vue';
import SpeedTileComponent from './SpeedTileComponent.vue';
import FastestTileComponent from './FastestTileComponent.vue';
import LongestTileComponent from './LongestTileComponent.vue';
import CountTileComponent from './CountTileComponent.vue';
import SportModeSelectorComponent from './SportModeSelectorComponent.vue';
import ChartsTileComponent from './ChartsTileComponent.vue';
import MapTileComponent from './MapTileComponent.vue';
import { TILE_COLORS } from '~/utils/tileColors';

export default defineComponent({
  components: {
    TileTemplateComponent,
    DinstanceTileComponent,
    TimeTileComponent,
    SpeedTileComponent,
    FastestTileComponent,
    LongestTileComponent,
    CountTileComponent,
    SportModeSelectorComponent,
    ChartsTileComponent,
    MapTileComponent,
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
        backgroundColor: TILE_COLORS.time.backgroundColor,
        fontColor: TILE_COLORS.time.fontColor,
        component: TimeTileComponent,
        componentProps: {
          fontColor: TILE_COLORS.time.fontColor,
        },
      },
      speed: {
        backgroundColor: TILE_COLORS.speed.backgroundColor,
        fontColor: TILE_COLORS.speed.fontColor,
        component: SpeedTileComponent,
        componentProps: {
          fontColor: TILE_COLORS.speed.fontColor,
        },
      },
      sportsSelector: {
        backgroundColor: TILE_COLORS.sportsSelector.backgroundColor,
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
        component: MapTileComponent,
      },
      charts: {
        backgroundColor: TILE_COLORS.charts.backgroundColor,
        fontColor: TILE_COLORS.default.fontColor,
        component: ChartsTileComponent,
      },
      topDistance: {
        backgroundColor: TILE_COLORS.longest.backgroundColor,
        fontColor: TILE_COLORS.longest.fontColor,
        component: LongestTileComponent,
        componentProps: {
          fontColor: TILE_COLORS.longest.fontColor,
        },
      },
      topSpeed: {
        backgroundColor: TILE_COLORS.fastest.backgroundColor,
        fontColor: TILE_COLORS.fastest.fontColor,
        component: FastestTileComponent,
        componentProps: {
          fontColor: TILE_COLORS.fastest.fontColor,
        },
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
  --selector-width: 80px;
  --panel-gap: 12px;
  --content-width: calc(100% - (5 * var(--panel-gap)));
  --half-width: calc(var(--content-width) / 2);
  --left-col-width: calc(var(--half-width) / 3);
  --map-flex-col-width: calc((var(--half-width) - var(--selector-width)) / 2);
  padding: 12px;
  height: calc(100vh - 120px);
  gap: var(--panel-gap);
  display: grid;
  position: relative;
  grid-template-columns:
    minmax(0, var(--left-col-width))
    minmax(0, var(--left-col-width))
    minmax(0, var(--left-col-width))
    minmax(0, var(--map-flex-col-width))
    minmax(0, var(--map-flex-col-width))
    var(--selector-width);
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
