<template>
  <div class="activity-tile">
    <div class="activity-value" :style="valueStyle">{{ fastestSpeed }}</div>
    <div class="activity-label" :style="labelStyle">for {{ fastestDistance }} km</div>
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

    const valueStyle = computed(() => ({ color: props.fontColor || 'inherit', fontWeight: 700, fontSize: '1.25em' }));
    const labelStyle = computed(() => ({ color: props.fontColor || 'inherit' }));

    return {
      fastestSpeed,
      fastestDistance,
      valueStyle,
      labelStyle,
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
}

.activity-value {
  font-size: 1.25em;
}

.activity-label {
    margin-top: -4px;
    font-size: 0.85em;
}
</style>
