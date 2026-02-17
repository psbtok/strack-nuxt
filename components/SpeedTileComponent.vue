<template>
  <div class="speed-tile">
    <div class="speed-value" :style="valueStyle">{{ speedFormatted }}</div>
    <div class="speed-label" :style="textStyle">avg speed</div>
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

    const speedFormatted = computed(() => {
      let stats = store.fallbackStats;
      if (store.activities && store.activities.length > 0) {
        stats = store.selectedStats;
      }
      const speed = stats?.speedKmh || 0;
      return `${speed.toFixed(1)} km/h`;
    });

    const textStyle = computed(() => ({ color: props.fontColor || 'inherit' }));
    const valueStyle = computed(() => ({ color: props.fontColor || 'inherit', fontWeight: 700, fontSize: '1.25em' }));

    return {
      speedFormatted,
      textStyle,
      valueStyle,
    };
  }
}
</script>

<style scoped>
.speed-tile {
  width: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.speed-value {
  font-size: 1.25em;
}

.speed-label {
  font-size: 0.85em;
}
</style>
