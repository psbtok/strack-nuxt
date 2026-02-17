<template>
  <span :style="textStyle"><span :style="valueStyle">{{ timeFormatted }}</span> <span class="regular" :style="textStyle">hours</span></span>
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

    const textStyle = computed(() => ({ color: props.fontColor || 'inherit' }));
    const valueStyle = computed(() => ({ color: props.fontColor || 'inherit', fontWeight: 700, fontSize: '1.25em' }));

    return {
      timeFormatted,
      textStyle,
      valueStyle,
    };
  }
}
</script>

<style>
.regular {
  display: inline-block;
}
</style>
