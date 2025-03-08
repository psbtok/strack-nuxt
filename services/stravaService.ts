import axios from 'axios';
import { useMainStore } from '../stores/main';

export async function getPostsService(access_token, page, per_page) {
  const activitiesEndpoint = `https://www.strava.com/api/v3/athlete/activities`;

  try {
    const response = await axios.get(activitiesEndpoint, {
      params: {
        access_token: access_token,
        per_page: per_page,
        page: page,
      }
    });
    console.log(response.data);
  } catch (error) {
    console.error("Error fetching activities:", error);
  }
}

export async function reAuthorize(client_id, client_secret, refresh_token) {
    const auth_link = "https://www.strava.com/oauth/token";
  
    try {
      const response = await axios.post(auth_link, {
        client_id: client_id,
        client_secret: client_secret,
        refresh_token: refresh_token,
        grant_type: 'refresh_token'
      }, {
        headers: {
          'Accept': 'application/json, text/plain, */*',
          'Content-Type': 'application/json',
        }
      });

      if (response.data) {
        const expirationDate = response.data.expires_at * 1000;
        const store = useMainStore();
        store.setTokenExpirationDate(expirationDate);
      }
      return response.data;
    } catch (error) {
      console.error("Strava API request failed:", error);
      throw error;
    }
  }