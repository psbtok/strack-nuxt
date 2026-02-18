<template>
  <div class="activity-tile" :style="blockStyle">
    <div class="activity-value">{{ longestDistance }} km</div>
    <div class="activity-label">at {{ longestSpeed }} km/h</div>
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

    const longestDistance = computed(() => {
      let stats = store.fallbackStats;
      if (store.activities && store.activities.length > 0) {
        stats = store.selectedStats;
      }
      const distance = stats?.longest?.distanceKm || 0;
      return distance.toFixed(1);
    });

    const longestSpeed = computed(() => {
      let stats = store.fallbackStats;
      if (store.activities && store.activities.length > 0) {
        stats = store.selectedStats;
      }
      const speed = stats?.longest?.speedKmh || 0;
      return speed.toFixed(1);
    });

    const valueText = computed(() => `${longestDistance.value} km`);
    const labelText = computed(() => `at ${longestSpeed.value} km/h`);

    const blockStyle = computed(() => {
      const longestTextLength = Math.max(valueText.value.length, labelText.value.length);
      return {
        color: props.fontColor || 'inherit',
        width: `${Math.max(longestTextLength * WIDTH_PER_CHAR, MIN_WIDTH)}px`,
      };
    });

    return {
      longestDistance,
      longestSpeed,
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
