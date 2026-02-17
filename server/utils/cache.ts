const stravaTokenCache = {
  access_token: '',
  expires_at: 0,
  refresh_token: '',
};

const activitiesCache = {
  activities: <any>[],
}

export function setStravaToken(token: string, expiresAt: number, refreshToken?: string) {
  stravaTokenCache.access_token = token;
  stravaTokenCache.expires_at = expiresAt;
  if (refreshToken) {
    stravaTokenCache.refresh_token = refreshToken;
  }
}

export function getStravaToken() {
  return stravaTokenCache;
}

export function isTokenExpired() {
  return Date.now() >= stravaTokenCache.expires_at;
}

export function setActivities(activities: any[]) {
  activitiesCache.activities = activities
}

export function getActivities() {
  return activitiesCache.activities
}