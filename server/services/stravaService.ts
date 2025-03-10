import axios from 'axios';
import { setStravaToken, getStravaToken, isTokenExpired } from '~/server/utils/cache';

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
    
    const { data } = await axios.post(authLink, {
      client_id: config.public.stravaClientId,
      client_secret: config.private.stravaClientSecret,
      refresh_token: config.private.stravaRefreshToken,
      grant_type: 'refresh_token',
    });

    setStravaToken(data.access_token, data.expires_at * 1000);

    return {
      access_token: data.access_token,
      expires_at: data.expires_at * 1000,
    };
  } catch (error) {
    console.error('Error during reauthorization:', error);
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
    console.error('Error fetching Strava activities:', error);
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
