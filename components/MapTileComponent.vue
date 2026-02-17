<template>
  <div :class="['map-container', isMinimized ? '' : 'expanded']">
    <div ref="mapContainer" id="map" class="map"></div>
  </div>
  <button :class="['toggle-button', isMinimized ? '' : 'active']" @click="toggleMinimized">
    <span>
      <font-awesome-icon :icon="['fas', 'plus']" />
    </span>
  </button>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { storeToRefs } from 'pinia';
import { useMainStore } from '~/stores/main';
import { decodePolyline } from '~/utils/polylineDecoder';

const store = useMainStore();
const { activities } = storeToRefs(store);

const isMinimized = ref(true);
const mapContainer = ref(null);
const mapInstance = ref(null);
const hasInitialized = ref(false);

const mapboxToken =
  'pk.eyJ1IjoicGV0b3NicmF0b2siLCJhIjoiY2wxdWtnNjM5MDB2ZzNkbDNzNzV2MThnbCJ9.--UWf-pthCKugxhxF4kmbQ';
const mapboxStyle = 'mapbox://styles/petosbratok/cl1ukjde8000514ltcfj80eto';

const toggleMinimized = () => {
  isMinimized.value = !isMinimized.value;
};

const handleWindowResize = () => {
  if (mapInstance.value && hasInitialized.value) {
    mapInstance.value.resize();
  }
};

const collectPolylines = () => {
  return (activities.value || [])
    .map((activity) => activity?.map?.summary_polyline || activity?.summary_polyline)
    .filter(Boolean);
};

const addPolylinesToMap = (map, polylines) => {
  const polylineOptions = {
    color: '#BDD9BF',
    weight: 3,
    opacity: 0.35,
  };

  let dataIndex = 0;

  const addNextGroupedSource = () => {
    const groupedFeatures = [];

    for (let i = 0; i < 50 && dataIndex < polylines.length; i += 1) {
      const encodedPolyline = polylines[dataIndex];
      const coordinates = decodePolyline(encodedPolyline).map((coord) => [coord[1], coord[0]]);

      groupedFeatures.push({
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates,
        },
        properties: {
          id: dataIndex,
        },
      });

      dataIndex += 1;
    }

    if (!groupedFeatures.length) {
      return;
    }

    const sourceId = `polyline-source-${dataIndex}`;
    const layerId = `polyline-layer-${dataIndex}`;

    map.addSource(sourceId, {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: groupedFeatures,
      },
    });

    map.addLayer({
      id: layerId,
      type: 'line',
      source: sourceId,
      paint: {
        'line-color': polylineOptions.color,
        'line-width': polylineOptions.weight,
        'line-opacity': polylineOptions.opacity,
      },
    });

    if (dataIndex < polylines.length) {
      addNextGroupedSource();
    }
  };

  addNextGroupedSource();
};

const initMapOnce = (polylines) => {
  if (hasInitialized.value || !import.meta.client || !mapContainer.value) {
    return;
  }

  hasInitialized.value = true;
  mapboxgl.accessToken = mapboxToken;

  const map = new mapboxgl.Map({
    container: mapContainer.value,
    style: mapboxStyle,
    center: [30.41, 59.88],
    pitch: 35,
    bearing: -15,
    zoom: 10.5,
    antialias: true,
  });

  mapInstance.value = map;

  map.on('load', () => {
    if (polylines.length) {
      addPolylinesToMap(map, polylines);
    }

    map.addLayer({
      id: 'add-3d-buildings',
      source: 'composite',
      'source-layer': 'building',
      filter: ['==', 'extrude', 'true'],
      type: 'fill-extrusion',
      minzoom: 12,
      paint: {
        'fill-extrusion-color': '#aaa',
        'fill-extrusion-height': [
          'interpolate',
          ['linear'],
          ['zoom'],
          12,
          0,
          12.05,
          ['get', 'height'],
        ],
        'fill-extrusion-base': [
          'interpolate',
          ['linear'],
          ['zoom'],
          12,
          0,
          12.05,
          ['get', 'min_height'],
        ],
        'fill-extrusion-opacity': 0.6,
      },
    });
  });
};

onMounted(() => {
  // Add resize listener
  window.addEventListener('resize', handleWindowResize);

  const existingPolylines = collectPolylines();
  if (existingPolylines.length) {
    initMapOnce(existingPolylines);
    return;
  }

  const stop = watch(
    () => activities.value?.length || 0,
    () => {
      const polylines = collectPolylines();
      if (!polylines.length) {
        return;
      }
      initMapOnce(polylines);
      stop();
    },
  );
});

onBeforeUnmount(() => {
  // Remove resize listener
  window.removeEventListener('resize', handleWindowResize);
  
  mapInstance.value?.remove();
  mapInstance.value = null;
});
</script>

<style scoped>
.mapboxgl-control-container {
  display: none !important;
}

.map-container {
  width: 100%;
  height: 100%;
  transition-duration: 450ms;
  overflow: hidden;
  border-radius: 16px;
  z-index: 3;
  background: var(--dark-blue);
}

.expanded {
  position: relative;
  margin-left: calc(-50vw + 5px);
  margin-top: -190px;
  width: 100vw;
  height: calc(100vh - 120px);
  transition-duration: 450ms;
}

.map {
  width: 100vw;
  height: 100vh;
  transition-duration: 0.1s;
}

.toggle-button {
  font-size: 1em;
  position: absolute;
  top: 204px;
  right: 20px;
  background: none;
  background: var(--dark-blue);
  display: flex;
  justify-content: center;
  align-items: center;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  z-index: 4;
  transition-duration: 450ms;
  padding-top: 2px;
  border: none;
  color: inherit;
  cursor: pointer;
}

.toggle-button span {
  transition-duration: 450ms;
}

.toggle-button svg {
  opacity: 0.8;
  color: rgb(207, 207, 207) !important;
  fill: rgb(207, 207, 207) !important;
}

.active span {
  padding: 0px 2px 0px 1px;
  transform: rotate(45deg);
}

.active {
  top: 15px;
  right: 22px;
}
</style>
