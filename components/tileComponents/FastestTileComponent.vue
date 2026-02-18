<template>
  <div class="activity-tile" :style="blockStyle">
    <div class="activity-value">{{ fastestSpeed }}</div>
    <div class="activity-label">for {{ fastestDistance }} km</div>
  </div>
</template>

<script>
import { useMainStore } from '@/stores/main';
import { computed } from 'vue';

export default {
  props: {
    fontColor: {
      type: String,
      default: 'inherit',
    },
  },
  setup(props) {
    const store = useMainStore();
    const WIDTH_PER_CHAR = 12.6;
    const MIN_WIDTH = 50;

    const fastestSpeed = computed(() => {
      let stats = store.fallbackStats;
      if (store.activities && store.activities.length > 0) {
        stats = store.selectedStats;
      }
      const speed = stats?.fastest?.speedKmh || 0;
      return `${speed.toFixed(1)} km/h`;
    });

    const fastestDistance = computed(() => {
      let stats = store.fallbackStats;
      if (store.activities && store.activities.length > 0) {
        stats = store.selectedStats;
      }
      const distance = stats?.fastest?.distanceKm || 0;
      return distance.toFixed(1);
    });

    const labelText = computed(() => `for ${fastestDistance.value} km`);

    const blockStyle = computed(() => {
      const longestTextLength = Math.max(fastestSpeed.value.length, labelText.value.length);
      return {
        color: props.fontColor || 'inherit',
        width: `${Math.max(longestTextLength * WIDTH_PER_CHAR, MIN_WIDTH)}px`,
      };
    });

    return {
      fastestSpeed,
      fastestDistance,
      blockStyle,
    };
  }
}
</script>

<style scoped>
.activity-tile {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  text-align: center;
  transition: width .3s ease;
}

.activity-value {
  font-size: 1.25em;
  font-weight: 700;
}

.activity-label {
    margin-top: -4px;
    font-size: 0.85em;
    font-weight: 400;
}
</style>
