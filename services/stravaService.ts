import axios from 'axios';

export async function getActivities() {
  try {
    const { data } = await axios.get('/api/strava/getActivities');
    return data;
  } catch (error) {
    console.error("Error fetching posts from server:", error);
    throw error;
  }
}
