<template>
  <div class="charts-tile">
    <div class="chart-wrapper">
      <div class="chart-container" style="position: relative;">
        <canvas id="distance-chart"></canvas>
      </div>
    </div>
    <div class="chart-wrapper">
      <div class="chart-container" style="position: relative;">
        <canvas id="speed-chart"></canvas>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
import Chart from 'chart.js/auto';
import { useMainStore } from '~/stores/main';

const store = useMainStore();
const chartInstances = ref({});
const lastChartUpdateTime = ref(0);
const animationTimer = ref(null);
const isAnimating = ref(false);
const pendingChartRefresh = ref(false);

const CHART_FADE_STEP_MS = 150;

const RUN_TYPES = new Set(['run', 'walk', 'hike', 'trailrun']);
const BIKE_TYPES = new Set(['ride', 'mountainbikeride']);

const getSportKey = (activity) => {
  const normalizedSportType = String(activity.sport_type || '').toLowerCase();
  const normalizedType = String(activity.type || '').toLowerCase();
  return normalizedSportType || normalizedType;
};

const isModeMatch = (activity) => {
  const sportKey = getSportKey(activity);

  if (store.sportMode === 'all') {
    return RUN_TYPES.has(sportKey) || BIKE_TYPES.has(sportKey);
  }

  if (store.sportMode === 'run') {
    return RUN_TYPES.has(sportKey);
  }

  return BIKE_TYPES.has(sportKey);
};

const isYearMatch = (activity) => {
  if (store.yearSelected === 'all') {
    return true;
  }

  const dateValue = activity.start_date_local || activity.start_date;
  if (!dateValue) {
    return false;
  }

  const year = new Date(dateValue).getFullYear();
  if (Number.isNaN(year)) {
    return false;
  }

  return String(year) === store.yearSelected;
};

const getProcessedActivities = () => {
  const sessions = (store.activities || []).filter((activity) => {
    return isModeMatch(activity) && isYearMatch(activity);
  });

  return sessions.map((activity) => {
    const distanceKm = (activity.distance || 0) / 1000;
    const timeSeconds = activity.moving_time || activity.elapsed_time || 0;
    let speedKmh = 0;

    if (timeSeconds > 0 && distanceKm > 0) {
      speedKmh = distanceKm / (timeSeconds / 3600);
    } else if (activity.average_speed) {
      speedKmh = Number(activity.average_speed) * 3.6;
    }

    return {
      distance: distanceKm,
      speed: speedKmh,
      date: activity.start_date_local || activity.start_date || new Date().toISOString(),
    };
  });
};

const triggerCanvasFade = (yLabel, animationClass) => {
  const canvas = document.getElementById(`${yLabel}-chart`);
  if (!canvas || !(canvas instanceof HTMLCanvasElement)) {
    return;
  }

  canvas.classList.remove('chart-fade-enter');
  canvas.classList.remove('chart-fade-exit');
  canvas.classList.remove('chart-fade-enter');
  void canvas.offsetWidth;
  canvas.classList.add(animationClass);
};

const finalizeAnimationWindow = () => {
  isAnimating.value = false;

  if (pendingChartRefresh.value) {
    pendingChartRefresh.value = false;
    requestChartRefresh();
  }
};

const renderCharts = () => {
  isAnimating.value = true;

  triggerCanvasFade('distance', 'chart-fade-exit');
  triggerCanvasFade('speed', 'chart-fade-exit');

  if (animationTimer.value) {
    clearTimeout(animationTimer.value);
  }

  animationTimer.value = setTimeout(() => {
    lastChartUpdateTime.value = Date.now();
    const processedActivities = getProcessedActivities();
    createChart('distance', processedActivities);
    createChart('speed', processedActivities);

    triggerCanvasFade('distance', 'chart-fade-enter');
    triggerCanvasFade('speed', 'chart-fade-enter');

    animationTimer.value = setTimeout(() => {
      animationTimer.value = null;
      finalizeAnimationWindow();
    }, CHART_FADE_STEP_MS);
  }, CHART_FADE_STEP_MS);
};

const requestChartRefresh = () => {
  if (isAnimating.value) {
    pendingChartRefresh.value = true;
    return;
  }

  pendingChartRefresh.value = false;
  renderCharts();
};

const createChart = (yLabel, processedActivities = []) => {
  let chart = null;

  try {
  const sortedSessions = [...processedActivities].sort((a, b) => {
    const aVal = yLabel === 'distance' ? a.distance : a.speed;
    const bVal = yLabel === 'distance' ? b.distance : b.speed;
    return aVal - bVal;
  });

  const dataArray = sortedSessions.map(item => yLabel === 'distance' ? item.distance : item.speed);
  const valueArray = sortedSessions.map((item, index) => {
    const activityLabel = store.sportMode === 'all' ? 'Activity' : store.sportMode === 'run' ? 'Run' : 'Ride';
    return `${activityLabel} ${index + 1}`;
  });

  const ctx = document.getElementById(`${yLabel}-chart`);
  if (!ctx || !(ctx instanceof HTMLCanvasElement)) {
    console.warn(`Canvas element not found or invalid for ${yLabel}-chart`);
    return false;
  }

  const canvasCtx = ctx.getContext('2d');
  if (!canvasCtx) {
    console.warn(`Failed to get 2D context for ${yLabel}-chart`);
    return false;
  }

  // Destroy existing chart if it exists
  if (chartInstances.value[yLabel]) {
    try {
      chartInstances.value[yLabel].destroy();
    } catch (e) {
      console.warn(`Failed to destroy previous ${yLabel} chart:`, e);
    }
  }

  try {
    chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: valueArray,
        datasets: [
          {
            label: yLabel === 'distance' ? 'Distance (km)' : 'Speed (km/h)',
            data: dataArray,
            fill: false,
            borderColor: '#586F6B',
            cubicInterpolationMode: 'monotone',
            tension: 0.4,
          },
        ],
      },
      options: {
        maintainAspectRatio: false,
        responsive: true,
        animation: false,
        scales: {
          x: {
            display: false,
          },
          y: {
            ticks: {
              color: '#586F6B',
              fontWeight: 'bold',
            },
          },
        },
        elements: {
          point: {
            borderWidth: 0,
            radius: 10,
            backgroundColor: 'rgba(0,0,0,0)',
          },
        },
      },
      plugins: [
        {
          id: 'contextLossHandler',
          afterDatasetsDraw(chart) {
            const ctx = chart.ctx;
            if (!ctx || !ctx.canvas || !ctx.canvas.getContext('2d')) {
              console.warn(`Context lost during ${yLabel} chart draw, destroying chart`);
              chart.destroy();
            }
          },
        },
      ],
    });
  } catch (chartError) {
    console.error(`Failed to create Chart.js instance for ${yLabel}:`, chartError);
    return false;
  }

  if (!chart) {
    console.warn(`Chart instance is null for ${yLabel}`);
    return false;
  }

  chartInstances.value[yLabel] = chart;
  return true;
  } catch (error) {
    console.error(`Error creating ${yLabel} chart:`, error);
    if (chart) {
      try {
        chart.destroy();
      } catch (e) {
        // silent fail
      }
    }
    return false;
  }
};

onMounted(async () => {
  // Wait for next frame to ensure DOM is fully ready
  await new Promise(resolve => setTimeout(resolve, 0));
  requestChartRefresh();
});

watch(
  () => [store.activities, store.yearSelected, store.sportMode],
  () => {
    requestChartRefresh();
  },
  { deep: false }
);

onBeforeUnmount(() => {
  if (animationTimer.value) {
    clearTimeout(animationTimer.value);
    animationTimer.value = null;
  }

  isAnimating.value = false;
  pendingChartRefresh.value = false;
  
  try {
    if (chartInstances.value.distance) {
      if (chartInstances.value.distance.ctx && chartInstances.value.distance.ctx.canvas) {
        chartInstances.value.distance.destroy();
      }
    }
  } catch (e) {
    console.warn('Failed to destroy distance chart:', e);
  }
  try {
    if (chartInstances.value.speed) {
      if (chartInstances.value.speed.ctx && chartInstances.value.speed.ctx.canvas) {
        chartInstances.value.speed.destroy();
      }
    }
  } catch (e) {
    console.warn('Failed to destroy speed chart:', e);
  }
});
</script>

<style scoped>
.charts-tile {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 0;
  background-color: rgb(184, 184, 170);
  min-height: 0;
  min-width: 0;
}

.chart-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  min-width: 0;
}

.chart-container {
  width: 100%;
  height: 100%;
  min-height: 0;
  position: relative;
  padding: 8px;
}

.chart-container canvas {
  width: 100% !important;
  height: 100% !important;
  display: block;
}

.chart-container canvas.chart-fade-enter {
  animation: chart-canvas-fade-in 150ms ease-out;
}

.chart-container canvas.chart-fade-exit {
  animation: chart-canvas-fade-out 150ms ease-out;
  animation-fill-mode: forwards;
}

@keyframes chart-canvas-fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes chart-canvas-fade-out {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}
</style>
