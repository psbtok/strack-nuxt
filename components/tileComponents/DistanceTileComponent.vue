<template>
  <div class="distance-tile" :style="blockStyle">
    <span class="value">{{ distanceKm }}</span>
    <span class="regular">km</span>
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
    const MIN_WIDTH = 30;

    const distanceKm = computed(() => store.selectedStats.distanceKm.toFixed(1));
    const blockStyle = computed(() => {
      const valueText = `${distanceKm.value || '-'} km`;
      return {
        color: props.fontColor || 'inherit',
        fontSize: '1.25em',
        width: `${Math.max(valueText.length * WIDTH_PER_CHAR, MIN_WIDTH)}px`,
      };
    });

    return {
      distanceKm,
      blockStyle,
    };
  }
}
</script>

<style scoped>
.distance-tile {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  text-align: center;
  transition: width .3s ease;
}

.value {
  display: inline-block;
  text-align: center;
  font-weight: 700;
}

.regular {
  display: inline-block;
  text-align: center;
  font-weight: 400;
}
</style>
