import { defineStore } from 'pinia';

export const useMainStore = defineStore('main', {
  state: () => ({
    yearSelected: 'all',
    tokenExpirationDate: 0,
  }),
  actions: {
    setYear(year: string) {
      this.yearSelected = year;
    },
    setTokenExpirationDate(date: number) {
      this.tokenExpirationDate = date;
    },
  },
  persist: true,
});
