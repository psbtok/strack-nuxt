<template>
  <div
    class="cell"
    :class="{
      'cell--fill': props.disableAutoWidth,
      'cell--overflow': props.allowOverflow,
      'cell--no-padding': props.disablePadding,
    }"
    ref="cellRef"
    :style="cellStyle"
  >
    <div class="cell__content" :class="{ 'cell__content--fill': props.disableAutoWidth }" ref="contentRef">
      <slot></slot>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue';

const props = defineProps({
  disableAutoWidth: {
    type: Boolean,
    default: false,
  },
  allowOverflow: {
    type: Boolean,
    default: false,
  },
  disablePadding: {
    type: Boolean,
    default: false,
  },
});

const cellRef = ref(null);
const contentRef = ref(null);
const trackedWidthPx = ref(null);
let resizeObserver = null;

const cellStyle = computed(() => {
  if (props.disableAutoWidth) {
    return {
      width: '100%',
      minWidth: '100%',
      minHeight: 0,
      height: '100%',
    };
  }

  if (trackedWidthPx.value === null) {
    return {
      width: '100%',
      minWidth: 0,
    };
  }

  return {
    width: `${trackedWidthPx.value}px`,
    minWidth: `${trackedWidthPx.value}px`,
  };
});

const updateTrackedWidth = () => {
  if (props.disableAutoWidth) {
    trackedWidthPx.value = null;
    return;
  }

  if (!cellRef.value || !contentRef.value) {
    return;
  }

  const contentWidth = contentRef.value.getBoundingClientRect().width;
  const cellStyles = window.getComputedStyle(cellRef.value);
  const paddingLeft = parseFloat(cellStyles.paddingLeft || '0');
  const paddingRight = parseFloat(cellStyles.paddingRight || '0');

  const nextWidth = Math.ceil(contentWidth + paddingLeft + paddingRight);

  if (trackedWidthPx.value === null || Math.abs(trackedWidthPx.value - nextWidth) >= 1) {
    trackedWidthPx.value = nextWidth;
  }
};

onMounted(async () => {
  await nextTick();

  if (props.disableAutoWidth) {
    return;
  }

  updateTrackedWidth();

  if (contentRef.value) {
    resizeObserver = new ResizeObserver(() => {
      updateTrackedWidth();
    });

    resizeObserver.observe(contentRef.value);
  }

  window.addEventListener('resize', updateTrackedWidth);
});

onBeforeUnmount(() => {
  if (resizeObserver) {
    resizeObserver.disconnect();
  }

  window.removeEventListener('resize', updateTrackedWidth);
});
</script>

<style scoped>
.cell {
    box-sizing: border-box;
    border-radius: 16px;
    display: flex;
    padding: 12px;
    justify-content: center;
    align-items: center;
    font-size: 1.25em;
    width: 100%;
    min-width: 100%;
    transition: width .3s ease;
    overflow: hidden;
    min-height: 0;
    user-select: none;
    -webkit-user-select: none;
}

.cell--overflow {
  overflow: visible;
}

.cell--fill {
  justify-content: stretch;
  align-items: stretch;
}

.cell--no-padding {
  padding: 0;
}

.cell__content {
  display: inline-flex;
  align-items: center;
  white-space: nowrap;
}

.cell__content--fill {
  display: flex;
  width: 100%;
  height: 100%;
  min-width: 0;
  min-height: 0;
  align-items: stretch;
  white-space: normal;
}
</style>
