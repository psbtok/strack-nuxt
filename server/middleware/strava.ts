import { defineEventHandler } from 'h3';
import { isTokenExpired, getActivities, getStravaToken } from '~/server/utils/cache';
import { addRecentPosts, reauthorize, initializePostList } from '../services/stravaService';

export default defineEventHandler(async () => {
  if (isTokenExpired() || !getStravaToken().expires_at) {
    try {
      await reauthorize();
      await addRecentPosts()      
    } catch (error) {
      console.error('Error:', error);
      return;
    }
  }

  if (!getActivities().length) {
    try {
      await initializePostList()
    } catch (error) {
      console.error('Error initializing Strava activities:', error);
    }
  }
});
