<template>
  <div>
    <NuxtPage />
    
    <!-- Loading Overlay -->
    <div 
      class="loader-blankspace"
      :class="{
        disappear: !isLoading,
        hide: hideLoader
      }"
    ></div>
    
    <!-- Loader Animation -->
    <div 
      class="loader"
      :class="{
        disappear: !isLoading,
        hide: hideLoader
      }"
    ></div>
  </div>
</template>

<script setup>
import { useMainStore } from './stores/main';
import { getActivities } from './services/stravaService';
import { onMounted, ref } from 'vue';

const store = useMainStore();
const isLoading = ref(true);
const hideLoader = ref(false);
const minLoadingTime = 300; // 0.3 seconds
const loadingStartTime = ref(Date.now());

const loadPosts = async () => {
  const data = await getActivities();
  if (data.length) {
    store.setActivities(data);
    console.log(data.length ? 'Received activities data from Strava API' : 'No activities data received from Strava API');
  }
  
  // Calculate elapsed time
  const elapsedTime = Date.now() - loadingStartTime.value;
  const remainingTime = Math.max(0, minLoadingTime - elapsedTime);
  
  // Wait for minimum loading time + 0.1s extra before hiding
  setTimeout(() => {
    isLoading.value = false;
    setTimeout(() => {
      hideLoader.value = true;
    }, 600);
  }, remainingTime + 100);
};

onMounted(() => {
  loadingStartTime.value = Date.now();
  store.initializeSelectionFromStorage();
  loadPosts();
})
</script>

<style scoped>
.loader-blankspace {
  position: fixed;
  width: 100vw;
  height: 100vh;
  left: 0;
  top: 0;
  z-index: 9998;
  background-color: rgba(5, 4, 22, 0.5);
  backdrop-filter: blur(6px);
  transition-duration: 600ms;
}

.loader {
  position: fixed;
  z-index: 9999;
  border-radius: 12px;
  flex: 0 0 auto;
  font-size: 20px;
  cursor: pointer;
  transition: 600ms;
  transition-property: all;
  user-select: none;
  overflow: hidden;
  height: 40px;
  width: 40px;
  left: calc(50vw - 20px);
  top: calc(50vh - 20px);
}

.loader::before {
  content: '';
  position: absolute;
  z-index: -2;
  left: -50%;
  top: -95%;
  width: 200%;
  height: 300%;
  background-color: #399953;
  background-repeat: no-repeat;
  background-size: 50% 50%, 50% 50%;
  background-position: 0 0, 100% 0, 100% 100%, 0 100%;
  background-image: linear-gradient(#399953, #399953), linear-gradient(#fbb300, #fbb300), linear-gradient(#d53e33, #d53e33), linear-gradient(#377af5, #377af5);
  animation: rotate 1s linear infinite;
}

.loader::after {
  content: '';
  position: absolute;
  z-index: -1;
  left: 6px;
  top: 6px;
  width: calc(100% - 12px);
  height: calc(100% - 12px);
  background: var(--dark-blue);
  border-radius: 5px;
}

.disappear {
  animation: disappear 600ms forwards;
}

.hide {
  display: none;
}

@keyframes disappear {
  100% {
    opacity: 0;
  }
}

@keyframes rotate {
  100% {
    transform: rotate(1turn);
  }
}
</style>
