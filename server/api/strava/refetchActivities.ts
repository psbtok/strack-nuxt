import { getActivities, getStravaToken, isTokenExpired, setActivities } from '../../utils/cache';
import { initializePostList, reauthorize } from '../../services/stravaService';

export default defineEventHandler(async (event) => {
  assertMethod(event, 'POST');

  try {
    setActivities([]);

    const token = getStravaToken();

    if (isTokenExpired() || !token.access_token || !token.expires_at) {
      await reauthorize();
    }

    await initializePostList();

    return {
      success: true,
      totalActivities: getActivities().length,
      message: 'Activities cache cleared and fully refetched.',
    };
  } catch (error) {
    console.error('Error resetting and refetching Strava activities:', error);

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to clear and refetch Strava activities',
    });
  }
});
