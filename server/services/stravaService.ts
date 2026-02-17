import axios from 'axios';
import { setStravaToken, getStravaToken, isTokenExpired, getActivities, setActivities } from '~/server/utils/cache';

function logAxiosError(context: string, error: unknown) {
  if (axios.isAxiosError(error)) {
    const errors = Array.isArray(error.response?.data?.errors) ? error.response?.data?.errors : [];
    const missingActivityScope = errors.some((item: { resource?: string; field?: string; code?: string }) => {
      return item.resource === 'AccessToken' && item.code === 'missing' && item.field === 'activity:read_permission';
    });

    if (missingActivityScope) {
      console.error('Strava token is missing activity read scope. Re-authorize with scope including activity:read_all.');
    }

    console.error(`${context} (status ${error.response?.status ?? 'unknown'}):`, error.response?.data ?? error.message);
    return;
  }

  console.error(context, error);
}

function combineActivities(newActivities: any[]) {
  const existingActivities = getActivities();
  
  const uniqueActivities = [
    ...existingActivities,
    ...newActivities.filter((newActivity: { id: number }) => {
      return !existingActivities.some((existingActivity: { id: number }) => 
        existingActivity.id === newActivity.id
      );
    })
  ];

  setActivities(uniqueActivities);
}

export async function reauthorize() {
  try {
    if (!isTokenExpired()) {
      const { access_token } = getStravaToken();
      return { access_token };
    }

    const config = useRuntimeConfig();
    const authLink = 'https://www.strava.com/oauth/token';
    const refreshToken = getStravaToken().refresh_token || config.stravaRefreshToken;

    if (!config.public.stravaClientId || !config.stravaClientSecret || !refreshToken) {
      throw new Error('Missing Strava OAuth configuration. Set STRAVA_CLIENT_ID, STRAVA_CLIENT_SECRET, and STRAVA_REFRESH_TOKEN.');
    }
    
    const { data } = await axios.post(authLink, {
      client_id: config.public.stravaClientId,
      client_secret: config.stravaClientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    });

    setStravaToken(data.access_token, data.expires_at * 1000, data.refresh_token || refreshToken);

    return {
      access_token: data.access_token,
      expires_at: data.expires_at * 1000,
    };
  } catch (error) {
    logAxiosError('Error during reauthorization', error);
    throw new Error('Failed to refresh Strava token');
  }
}

export async function fetchPosts(page = 1, per_page = 1) {
  try {
    const { access_token } = getStravaToken();

    if (!access_token) {
      throw new Error('Access token is missing.');
    }

    const activitiesEndpoint = 'https://www.strava.com/api/v3/athlete/activities';

    const { data } = await axios.get(activitiesEndpoint, {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
      params: {
        page: Number(page),
        per_page: Number(per_page),
      },
    });

    return data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      try {
        const { access_token } = await reauthorize();
        const activitiesEndpoint = 'https://www.strava.com/api/v3/athlete/activities';
        const { data } = await axios.get(activitiesEndpoint, {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
          params: {
            page: Number(page),
            per_page: Number(per_page),
          },
        });

        return data;
      } catch (reauthError) {
        logAxiosError('Error reauthorizing after 401', reauthError);
      }
    }

    logAxiosError('Error fetching Strava activities', error);
    return [];
  }
}

export async function initializePostList() {
  let page = 1;
  let data = [];

  do {
    data = await fetchPosts(page, 100);

    if (data.length > 0) {
      combineActivities(data);
      page++;
    }
  } while (data.length > 0);
}

export async function addRecentPosts() {
  const access_token = getStravaToken().access_token;

  if (access_token && getActivities().length) {
    const newActivities = await fetchPosts(1, 100);

    combineActivities(newActivities);
  }
}
