import { defineStore } from "pinia";
import { calculateStatsForSelection, type SportMode } from '~/utils/activityStats';

const YEAR_STORAGE_KEY = 'selectedYear';
const SPORT_MODE_STORAGE_KEY = 'selectedSportMode';

function getCurrentYearString() {
  return new Date().getFullYear().toString();
}

function getInitialYear() {
  if (import.meta.client) {
    const storedYear = localStorage.getItem(YEAR_STORAGE_KEY);
    if (storedYear) {
      return storedYear;
    }
  }

  return getCurrentYearString();
}

function getInitialSportMode(): SportMode {
  if (import.meta.client) {
    const storedMode = localStorage.getItem(SPORT_MODE_STORAGE_KEY);
    if (storedMode === 'run' || storedMode === 'bike' || storedMode === 'all') {
      return storedMode;
    }
  }

  return 'bike';
}

function isValidSportMode(value: string | null): value is SportMode {
  return value === 'run' || value === 'bike' || value === 'all';
}

interface MainState {
  yearSelected: string;
  sportMode: SportMode;
  activities: any[];
}

export const useMainStore = defineStore('main', {
  state: (): MainState => ({
    yearSelected: getInitialYear(),
    sportMode: getInitialSportMode(),
    activities: [],
  }),
  getters: {
    selectedStats(state) {
      return calculateStatsForSelection(state.activities, state.yearSelected, state.sportMode);
    },
  },
  actions: {
    initializeSelectionFromStorage() {
      if (!import.meta.client) {
        return;
      }

      const storedYear = localStorage.getItem(YEAR_STORAGE_KEY);
      const storedMode = localStorage.getItem(SPORT_MODE_STORAGE_KEY);

      const resolvedYear = storedYear || getCurrentYearString();
      const resolvedMode: SportMode = isValidSportMode(storedMode) ? storedMode : 'bike';

      this.yearSelected = resolvedYear;
      this.sportMode = resolvedMode;

      localStorage.setItem(YEAR_STORAGE_KEY, resolvedYear);
      localStorage.setItem(SPORT_MODE_STORAGE_KEY, resolvedMode);
    },
    setYear(year: string) {
      this.yearSelected = year;
      if (import.meta.client) {
        localStorage.setItem(YEAR_STORAGE_KEY, year);
      }
    },
    setSportMode(mode: SportMode) {
      this.sportMode = mode;
      if (import.meta.client) {
        localStorage.setItem(SPORT_MODE_STORAGE_KEY, mode);
      }
    },
    setActivities(activities: any[]) {
      this.activities = activities;
    },
  },
  persist: true,
});
