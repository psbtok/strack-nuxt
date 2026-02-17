<template>
  <YearSliderComponent 
    :years="years" 
    :selectedYearIndex="middleIndex"
    @year-selected="onYearSelected"
  />
</template>

<script>
import { ref, onMounted } from 'vue';
import { useMainStore } from '~/stores/main'
import YearSliderComponent from './YearSliderComponent.vue'

export default {
  name: 'YearSelectorComponent',
  components: {
    YearSliderComponent
  },
  
  setup() {
    const store = useMainStore()
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
    });

    const onYearSelected = (index) => {
      middleIndex.value = index;
    };

    return {
      years,
      middleIndex,
      onYearSelected
    };
  }
};
</script>
