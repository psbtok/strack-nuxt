<template>
  <div class="sport-mode">
    <button
      type="button"
      class="sport-mode__button"
      :class="{ 'sport-mode__button--active': sportMode === 'run' || sportMode === 'all' }"
      @click="toggleSportMode('run')"
    >
      run
    </button>

    <button
      type="button"
      class="sport-mode__button"
      :class="{ 'sport-mode__button--active': sportMode === 'bike' || sportMode === 'all' }"
      @click="toggleSportMode('bike')"
    >
      bike
    </button>
  </div>
</template>

<script>
import { storeToRefs } from 'pinia';
import { useMainStore } from '~/stores/main';

export default {
  name: 'SportModeSelectorComponent',
  setup() {
    const store = useMainStore();
    const { sportMode } = storeToRefs(store);

    const toggleSportMode = (mode) => {
      if (sportMode.value === mode) {
        store.setSportMode('all');
        return;
      }

      store.setSportMode(mode);
    };

    return {
      sportMode,
      toggleSportMode,
    };
  },
};
</script>

<style scoped>
.sport-mode {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.sport-mode__button {
  border: 1px solid currentColor;
  border-radius: 10px;
  background: transparent;
  color: inherit;
  font-size: 14px;
  text-transform: uppercase;
  padding: 6px 4px;
}

.sport-mode__button--active {
  font-weight: 700;
}
</style>
