export type SportMode = 'run' | 'bike' | 'all';

type ActivityLike = {
  type?: string;
  sport_type?: string;
  start_date?: string;
  start_date_local?: string;
  moving_time?: number;
  elapsed_time?: number;
  distance?: number;
  average_speed?: number;
};

export interface ActivityStats {
  count: number;
  timeSeconds: number;
  distanceKm: number;
  speedKmh: number;
  fastest: {
    speedKmh: number;
    timeSeconds: number;
  } | null;
  longest: {
    speedKmh: number;
    timeSeconds: number;
  } | null;
}

const RUN_TYPES = new Set(['run', 'walk', 'hike', 'trailrun']);
const BIKE_TYPES = new Set(['ride', 'mountainbikeride']);

function getSportKey(activity: ActivityLike) {
  const normalizedSportType = String(activity.sport_type || '').toLowerCase();
  const normalizedType = String(activity.type || '').toLowerCase();
  return normalizedSportType || normalizedType;
}

function isModeMatch(activity: ActivityLike, mode: SportMode) {
  const sportKey = getSportKey(activity);

  if (mode === 'all') {
    return RUN_TYPES.has(sportKey) || BIKE_TYPES.has(sportKey);
  }

  if (mode === 'run') {
    return RUN_TYPES.has(sportKey);
  }

  return BIKE_TYPES.has(sportKey);
}

function isYearMatch(activity: ActivityLike, yearSelected: string) {
  if (yearSelected === 'all') {
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

  return String(year) === yearSelected;
}

function getTimeSeconds(activity: ActivityLike) {
  return Number(activity.moving_time || activity.elapsed_time || 0);
}

function getDistanceKm(activity: ActivityLike) {
  return Number(activity.distance || 0) / 1000;
}

function getSpeedKmh(activity: ActivityLike) {
  const timeSeconds = getTimeSeconds(activity);
  const distanceKm = getDistanceKm(activity);

  if (timeSeconds > 0 && distanceKm > 0) {
    return distanceKm / (timeSeconds / 3600);
  }

  if (activity.average_speed) {
    return Number(activity.average_speed) * 3.6;
  }

  return 0;
}

export function calculateStatsForSelection(
  activities: ActivityLike[],
  yearSelected: string,
  mode: SportMode,
): ActivityStats {
  const filtered = activities.filter((activity) => {
    return isModeMatch(activity, mode) && isYearMatch(activity, yearSelected);
  });

  const count = filtered.length;
  const timeSeconds = filtered.reduce((sum, activity) => sum + getTimeSeconds(activity), 0);
  const distanceKm = filtered.reduce((sum, activity) => sum + getDistanceKm(activity), 0);
  const speedKmh = timeSeconds > 0 ? distanceKm / (timeSeconds / 3600) : 0;

  let fastest: ActivityStats['fastest'] = null;
  let longest: ActivityStats['longest'] = null;
  let topSpeed = -1;
  let topDistance = -1;

  for (const activity of filtered) {
    const activitySpeed = getSpeedKmh(activity);
    const activityTime = getTimeSeconds(activity);
    const activityDistance = getDistanceKm(activity);

    if (activitySpeed > topSpeed) {
      topSpeed = activitySpeed;
      fastest = {
        speedKmh: activitySpeed,
        timeSeconds: activityTime,
      };
    }

    if (activityDistance > topDistance) {
      topDistance = activityDistance;
      longest = {
        speedKmh: activitySpeed,
        timeSeconds: activityTime,
      };
    }
  }

  return {
    count,
    timeSeconds,
    distanceKm,
    speedKmh,
    fastest,
    longest,
  };
}
