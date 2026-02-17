<template>
  <div class="sports-selector">
    <div
      class="option"
      :class="{
        'active': selectedOption === 0 || selectedOption === 2
      }"
      @click="selectOption(0)"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 640 512"><path d="M400 96a48 48 0 1 0 0-96 48 48 0 1 0 0 96zm27.2 64l-61.8-48.8c-17.3-13.6-41.7-13.8-59.1-.3l-83.1 64.2c-30.7 23.8-28.5 70.8 4.3 91.6L288 305.1V416c0 17.7 14.3 32 32 32s32-14.3 32-32V288c0-10.7-5.3-20.7-14.2-26.6L295 232.9l60.3-48.5L396 217c5.7 4.5 12.7 7 20 7h64c17.7 0 32-14.3 32-32s-14.3-32-32-32H427.2zM56 384a72 72 0 1 1 144 0A72 72 0 1 1 56 384zm200 0A128 128 0 1 0 0 384a128 128 0 1 0 256 0zm184 0a72 72 0 1 1 144 0 72 72 0 1 1 -144 0zm200 0a128 128 0 1 0 -256 0 128 128 0 1 0 256 0z"/>
      </svg>
    </div>
    <div class="separator"><span></span></div>
    <div
      class="option"
      :class="{
        'active': selectedOption === 1 || selectedOption === 2
      }"
      @click="selectOption(1)"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 448 512"><path d="M320 48a48 48 0 1 0 -96 0 48 48 0 1 0 96 0zM125.7 175.5c9.9-9.9 23.4-15.5 37.5-15.5c1.9 0 3.8 .1 5.6 .3L137.6 254c-9.3 28 1.7 58.8 26.8 74.5l86.2 53.9-25.4 88.8c-4.9 17 5 34.7 22 39.6s34.7-5 39.6-22l28.7-100.4c5.9-20.6-2.6-42.6-20.7-53.9L238 299l30.9-82.4 5.1 12.3C289 264.7 323.9 288 362.7 288H384c17.7 0 32-14.3 32-32s-14.3-32-32-32H362.7c-12.9 0-24.6-7.8-29.5-19.7l-6.3-15c-14.6-35.1-44.1-61.9-80.5-73.1l-48.7-15c-11.1-3.4-22.7-5.2-34.4-5.2c-31 0-60.8 12.3-82.7 34.3L57.4 153.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l23.1-23.1zM91.2 352H32c-17.7 0-32 14.3-32 32s14.3 32 32 32h69.6c19 0 36.2-11.2 43.9-28.5L157 361.6l-9.5-6c-17.5-10.9-30.5-26.8-37.9-44.9L91.2 352z"/></svg>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useMainStore } from '~/stores/main';

const store = useMainStore();
const selectedOption = ref(0);

const selectOption = (index) => {
  if (selectedOption.value === index) {
    selectedOption.value = 2;
    store.setSportMode('all');
  } else {
    selectedOption.value = index;
    store.setSportMode(index === 0 ? 'bike' : 'run');
  }
};
</script>

<style scoped>
.sports-selector {
  height: 156px;
  width: 64px;
  min-width: 32px;
  max-width: 32px;
  flex: 0 0 64px;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
}

.sports-selector .option {
  text-transform: uppercase;
  background-color: #332c71;
  width: 64px;
  height: 64px;
  display: flex;
  border-radius: 12px;
  justify-content: center;
  align-items: center;
  transition-duration: 0.3s;
  cursor: pointer;
}

.separator {
  text-transform: uppercase;
  padding: 6px 4px;
  width: 64px;
  letter-spacing: -0.5px;
  display: flex;
  justify-content: center;
  flex: 0;
}

.separator span {
  display: block;
  width: 60%;
  border-radius: 2px;
  background-color: white;
  height: 2px;
}

.sports-selector .icon {
  height: 24px;
}

.active svg {
  fill: #b5ff7e !important;
}

.separator span {
  transition-duration: 0.15s;
}

.sports-selector .active {
  background-color: #1f1a48 !important;
}

svg {
  fill: white;
  transition-duration: 0.6s;
}
</style>
