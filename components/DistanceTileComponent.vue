<template>
    <span>{{ activities.length }}</span>
    <span class="regular">km</span>
</template>

<script>
import { useMainStore } from '@/stores/main';
import { computed } from 'vue';

export default {
  setup() {
    const store = useMainStore();

    const activities = computed(() => store.activities);

    return {
      activities
    };
  }
}
</script>

<style>
.regular {
    display: inline-block;
    margin-left: 6px;
}
</style>
