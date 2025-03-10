import { defineStore } from "pinia";

interface MainState {
  yearSelected: string;
  activities: any[];
}

export const useMainStore = defineStore('main', {
  state: (): MainState => ({
    yearSelected: 'all',
    activities: [],
  }),
  actions: {
    setYear(year: string) {
      this.yearSelected = year;
    },
    setActivities(activities: any[]) {
      this.activities = activities;
    },
  },
  persist: true,
});
