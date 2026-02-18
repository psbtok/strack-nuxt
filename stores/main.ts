import { defineStore } from "pinia";
import { preCalculateAllStats, type SportMode, type PreCalculatedStats, type ActivityStats } from "~/utils/activityStats";

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

const emptyStats: ActivityStats = {
  count: 0,
  timeSeconds: 0,
  distanceKm: 0,
  speedKmh: 0,
  fastest: null,
  longest: null,
};

interface MainState {
  yearSelected: string;
  sportMode: SportMode;
  activities: any[];
  preCalculatedStats: PreCalculatedStats;
}

export const useMainStore = defineStore('main', {
  state: (): MainState => ({
    yearSelected: getInitialYear(),
    sportMode: getInitialSportMode(),
    activities: [],
    preCalculatedStats: {},
  }),
  getters: {
    selectedStats(state): ActivityStats {
      const yearStats = state.preCalculatedStats[state.yearSelected];
      if (!yearStats) {
        return emptyStats;
      }
      return yearStats[state.sportMode] || emptyStats;
    },
    fallbackStats(): ActivityStats {
      return emptyStats;
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
      // Pre-calculate all year/sport combinations when activities are set
      this.preCalculatedStats = preCalculateAllStats(activities);
    },
  },
  persist: true,
});
