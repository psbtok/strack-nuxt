<template>
  <NuxtPage />
</template>

<script setup>
import { useMainStore } from './stores/main';
import { getActivities } from './services/stravaService';
import { onMounted } from 'vue';

const store = useMainStore();

const loadPosts = async () => {
  const data = await getActivities();
  if (data.length) {
    store.setActivities(data);
    console.log(data[0])
  }
};

onMounted(() => {
  store.initializeSelectionFromStorage();
  loadPosts();
})
</script>
