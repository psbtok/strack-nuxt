import { defineEventHandler } from 'h3';
import { isTokenExpired, getActivities } from '~/server/utils/cache';
import { addRecentPosts, reauthorize, initializePostList } from '../services/stravaService';

export default defineEventHandler(async () => {
  if (isTokenExpired() || !getStravaToken().expires_at) {
    try {
      await reauthorize();
      await addRecentPosts()      
    } catch (error) {
      console.error('Error:', error);
    }
  }

  if (!getActivities().length) {
    initializePostList()
  }
});
