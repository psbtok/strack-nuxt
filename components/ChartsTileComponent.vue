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
const debounceTimer = ref(null);

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

const createChart = (yLabel) => {
  try {
    const sessions = (store.activities || []).filter((activity) => {
      return isModeMatch(activity) && isYearMatch(activity);
    });
  
  const processedActivities = sessions.map(activity => {
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
    return;
  }

  const canvasCtx = ctx.getContext('2d');
  if (!canvasCtx) {
    console.warn(`Failed to get 2D context for ${yLabel}-chart`);
    return;
  }

  // Destroy existing chart if it exists
  if (chartInstances.value[yLabel]) {
    try {
      chartInstances.value[yLabel].destroy();
    } catch (e) {
      console.warn(`Failed to destroy previous ${yLabel} chart:`, e);
    }
  }

  let chart = null;
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
        animation: {
          duration: 200,
        },
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
    return;
  }

  if (!chart) {
    console.warn(`Chart instance is null for ${yLabel}`);
    return;
  }

  chartInstances.value[yLabel] = chart;
  } catch (error) {
    console.error(`Error creating ${yLabel} chart:`, error);
    if (chart) {
      try {
        chart.destroy();
      } catch (e) {
        // silent fail
      }
    }
  }
};

onMounted(async () => {
  // Wait for next frame to ensure DOM is fully ready
  await new Promise(resolve => setTimeout(resolve, 0));
  lastChartUpdateTime.value = Date.now();
  createChart('distance');
  createChart('speed');
});

watch(
  () => [store.activities, store.yearSelected, store.sportMode],
  async () => {
    // Debounce: don't recreate charts more frequently than every 600ms (animation duration)
    // This prevents updating charts while they're animating
    const now = Date.now();
    const timeSinceLastUpdate = now - lastChartUpdateTime.value;
    
    if (timeSinceLastUpdate < 400) {
      console.log('Charts updated recently, scheduling retry after debounce period');
      
      // Clear existing timer if any
      if (debounceTimer.value) {
        clearTimeout(debounceTimer.value);
      }
      
      // Schedule retry after remaining debounce time
      const remainingTime = 600 - timeSinceLastUpdate;
      debounceTimer.value = setTimeout(() => {
        console.log('Debounce period finished, recreating charts');
        lastChartUpdateTime.value = Date.now();
        createChart('distance');
        createChart('speed');
        debounceTimer.value = null;
      }, remainingTime);
      
      return;
    }
    
    lastChartUpdateTime.value = now;
    
    // Clear any pending debounce timer
    if (debounceTimer.value) {
      clearTimeout(debounceTimer.value);
      debounceTimer.value = null;
    }
    
    // Defer chart creation to next tick to allow DOM updates
    await new Promise(resolve => setTimeout(resolve, 0));
    createChart('distance');
    createChart('speed');
  },
  { deep: true }
);

onBeforeUnmount(() => {
  // Clear debounce timer
  if (debounceTimer.value) {
    clearTimeout(debounceTimer.value);
    debounceTimer.value = null;
  }
  
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
</style>
