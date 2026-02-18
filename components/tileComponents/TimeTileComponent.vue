<template>
  <div class="time-tile" :style="blockStyle">
    <span class="value">{{ timeFormatted }}</span>
    <span class="regular">hours</span>
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
    const WIDTH_PER_CHAR = 32;
    const MIN_WIDTH = 30;

    const formatTimeFromSeconds = (totalSeconds) => {
      const hours = totalSeconds / 3600;
      return hours.toFixed(1);
    };

    const timeFormatted = computed(() => {
      let stats = store.fallbackStats;
      if (store.activities && store.activities.length > 0) {
        stats = store.selectedStats;
      }
      const seconds = stats?.timeSeconds || 0;
      return formatTimeFromSeconds(seconds);
    });

    const blockStyle = computed(() => {
      const valueText = `${timeFormatted.value || '-'} hours`;
      return {
        color: props.fontColor || 'inherit',
        fontSize: '1.25em',
        width: `${Math.max(valueText.length * WIDTH_PER_CHAR, MIN_WIDTH)}px`,
      };
    });

    return {
      timeFormatted,
      blockStyle,
    };
  }
}
</script>

<style scoped>
.time-tile {
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
