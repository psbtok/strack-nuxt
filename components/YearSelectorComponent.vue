<template>
  <div class="year-slider" :class="{ 'year-slider--hidden': mapExpanded }">
    <div
      class="year-slider__track"
      :style="{ left: offsetLeft }"
      :class="{ 'year-slider__track--animated': animationOn }"
      @touchstart="onTouchStart"
      @touchmove.prevent="onTouchMove"
      @touchend="onTouchEnd"
      @mousedown="onMouseDown"
      @mousemove="onMouseMove"
      @mouseup="onMouseUp"
      @mouseleave="onMouseUp"
    >
      <div
        v-for="(year, index) in years"
        :key="year"
        class="year-slider__item"
        :class="{
          'year-slider__item--active': index === middleIndex,
          'year-slider__item--active-search': index === middleIndex && !isTouching
        }"
        @click="onYearClick(index)"
      >
        <span>{{ year }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useMainStore } from '~/stores/main';

export default {
  name: 'YearSelectorComponent',
  setup() {
    const store = useMainStore();
    const { mapExpanded } = storeToRefs(store);
    const animationOn = ref(false);
    const offsetStep = -79.6;
    const offsetLeft = ref('0px');
    const isTouching = ref(false);
    const isMouseDown = ref(false);
    const touchStartX = ref(0);
    const touchCurrentX = ref(0);
    const touchStartOffset = ref(0);
    const didDrag = ref(false);
    const suppressClickUntil = ref(0);
    const middleIndex = ref(1);
    const years = ref(['all']);
    const endYear = 2019;

    onMounted(() => {
      const currentYear = new Date().getFullYear();
      for (let year = currentYear; year >= endYear; year--) {
        years.value.push(year.toString());
      }

      const selectedYearIndex = years.value.findIndex((year) => year === store.yearSelected);
      if (selectedYearIndex >= 0) {
        middleIndex.value = selectedYearIndex;
      } else {
        store.setYear(years.value[1] || years.value[0]);
        middleIndex.value = years.value[1] ? 1 : 0;
      }

      offsetLeft.value = `calc(${middleIndex.value * offsetStep}px)`;
    });

    const getConstrainedOffset = (proposedOffset) => {
      const maxLeft = 24;
      const minRight = offsetStep * (years.value.length - 1) - 16;
      return Math.max(minRight, Math.min(maxLeft, proposedOffset));
    };

    const selectYear = (index) => {
      animationOn.value = true;
      middleIndex.value = index;
      offsetLeft.value = `calc(${index * offsetStep}px)`;
      store.setYear(years.value[index]);

      setTimeout(() => {
        animationOn.value = false;
      }, 300);
    };

    const onTouchStart = (event) => {
      if (animationOn.value) return;
      isTouching.value = true;
      didDrag.value = false;
      touchStartX.value = event.touches[0].clientX;
      touchCurrentX.value = touchStartX.value;
      touchStartOffset.value = extractNumericValue(offsetLeft.value);
    };

    const onTouchMove = (event) => {
      if (!isTouching.value) return;

      touchCurrentX.value = event.touches[0].clientX;
      const deltaX = touchCurrentX.value - touchStartX.value;
      if (Math.abs(deltaX) > 4) {
        didDrag.value = true;
      }
      let newOffset = touchStartOffset.value + deltaX;
      newOffset = getConstrainedOffset(newOffset);
      offsetLeft.value = `calc(${newOffset}px)`;

      updateMiddleIndex(newOffset);
    };

    const onTouchEnd = () => {
      if (isTouching.value) {
        if (didDrag.value) {
          suppressClickUntil.value = Date.now() + 250;
        }
        selectYear(middleIndex.value);
      }
      isTouching.value = false;
    };

    const onMouseDown = (event) => {
      if (animationOn.value) return;
      isMouseDown.value = true;
      didDrag.value = false;
      touchStartX.value = event.clientX;
      touchCurrentX.value = touchStartX.value;
      touchStartOffset.value = extractNumericValue(offsetLeft.value);
    };

    const onMouseMove = (event) => {
      if (!isMouseDown.value) return;
      isTouching.value = true;

      touchCurrentX.value = event.clientX;
      const deltaX = touchCurrentX.value - touchStartX.value;
      if (Math.abs(deltaX) > 4) {
        didDrag.value = true;
      }
      let newOffset = touchStartOffset.value + deltaX;
      newOffset = getConstrainedOffset(newOffset);
      offsetLeft.value = `calc(${newOffset}px)`;

      updateMiddleIndex(newOffset);
    };

    const onMouseUp = () => {
      if (isMouseDown.value && isTouching.value) {
        if (didDrag.value) {
          suppressClickUntil.value = Date.now() + 250;
        }
        selectYear(middleIndex.value);
      }
      isMouseDown.value = false;
      isTouching.value = false;
    };

    const onYearClick = (index) => {
      if (Date.now() < suppressClickUntil.value) {
        return;
      }

      selectYear(index);
    };

    const updateMiddleIndex = (newOffset) => {
      const middlePos = window.innerWidth / 2;
      let minDistance = 9999;
      let closestYearIndex = 0;

      years.value.forEach((_, index) => {
        const sliderItemPos = index * offsetStep + middlePos - newOffset;
        const distance = Math.abs(sliderItemPos - middlePos);

        if (distance < minDistance) {
          minDistance = distance;
          closestYearIndex = index;
        }
      });

      middleIndex.value = closestYearIndex;
    };

    const extractNumericValue = (str) => {
      const match = /([+-]?\d+(\.\d+)?)px/.exec(str);
      return match ? parseFloat(match[1]) : 0;
    };

    return {
      mapExpanded,
      animationOn,
      offsetLeft,
      middleIndex,
      years,
      isTouching,
      onYearClick,
      selectYear,
      onTouchStart,
      onTouchMove,
      onTouchEnd,
      onMouseDown,
      onMouseMove,
      onMouseUp,
    };
  },
};
</script>

<style scoped>
.year-slider {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  overflow: hidden;
  transition: opacity 300ms;
  -webkit-tap-highlight-color: transparent;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  user-select: none;
}

.year-slider--hidden {
  opacity: 0;
  pointer-events: none;
}

.year-slider__track {
  position: fixed;
  height: 60px;
  bottom: 0px;
  padding-left: calc(50% - 55.8px);
  padding-right: 2000px;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  overflow: hidden;
  background: var(--dark-blue);
  cursor: grab;
  touch-action: pan-x;
  -webkit-user-drag: none;
  -webkit-user-select: none;
  user-select: none;
}

.year-slider__track:active {
  cursor: grabbing;
}

.year-slider__item {
  min-width: 72px;
  border: 1px solid white;
  border-radius: 12px;
  flex: 0 0 auto;
  padding: 4px 12px;
  margin: 4px;
  font-size: 20px;
  cursor: pointer;
  transition: 600ms;
  transition-property: all;
  -webkit-user-select: none;
  user-select: none;
  text-align: center;
}

.year-slider__item--active {
  background-color: rgb(0, 153, 255);
  border-color: rgb(0, 153, 255);
}

.year-slider__item--active-search {
  font-size: 24px;
  min-width: 104px;
  padding: 4.8px 24px;
  border-radius: 16px;
}

.year-slider__item span {
  text-transform: capitalize;
  -webkit-user-select: none;
  user-select: none;
}

.year-slider__track--animated {
  transition-duration: 300ms;
}
</style>
