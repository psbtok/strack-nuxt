<template>
  <div class="panel">
    <TileTemplateComponent 
      v-for="(tile, area) in tileInfo"
      :key="area"
      :style="{
        gridArea: area,
        text: tile.color,
        backgroundColor: tile.backgroundColor,
      }"
    >
      <component :is="tile.component">
      </component>
    </TileTemplateComponent>
  </div>
</template>

<script>
import { defineComponent, ref } from 'vue';
import TileTemplateComponent from './TileTemplateComponent.vue';
import DinstanceTileComponent from './DistanceTileComponent.vue';
import { reAuthorize } from '../services/stravaService';

export default defineComponent({
  components: {
    TileTemplateComponent,
    DinstanceTileComponent,
  },
  setup() {
    const client_id = '80748';
    const client_secret = 'dd7bfd8626e77e41d351f7a76a85be61531a5ceb';
    const refresh_token = '33d2cf7c17d96d25428a3190515a237c4e19f84b';
    reAuthorize(
      client_id,
      client_secret,
      refresh_token
    )
    const tileInfo = ref({
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
