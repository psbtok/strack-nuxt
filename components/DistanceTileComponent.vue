<template>
  <span :style="textStyle"><span :style="valueStyle">{{ distanceKm }}</span> <span class="regular" :style="textStyle">km</span></span>
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

    const distanceKm = computed(() => store.selectedStats.distanceKm.toFixed(1));
    const textStyle = computed(() => ({ color: props.fontColor || 'inherit' }));
    const valueStyle = computed(() => ({ color: props.fontColor || 'inherit', fontWeight: 700 }));

    return {
      distanceKm,
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
