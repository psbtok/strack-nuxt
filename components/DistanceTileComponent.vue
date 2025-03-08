<template>
    <span>{{ tokenExpirationDate }}</span>
    <span class="regular">km</span>
</template>

<script>
import { useMainStore } from '@/stores/main';
import { computed } from 'vue';

export default {
  setup() {
    const store = useMainStore();

    const tokenExpirationDate = computed(() => store.tokenExpirationDate);

    return {
      tokenExpirationDate
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
