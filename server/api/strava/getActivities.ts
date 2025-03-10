import axios from 'axios';
import { getActivities } from '~/server/utils/cache';

export default defineEventHandler(async (event) => {
  return getActivities()
});
