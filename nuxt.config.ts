// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  modules: [
    '@pinia/nuxt',
    'pinia-plugin-persistedstate/nuxt'
  ],
  css: [
    '@/assets/styles/global.css',
  ],
  runtimeConfig: {
    public: {
      stravaClientId: process.env.STRAVA_CLIENT_ID,
    },
    private: {
      stravaClientSecret: process.env.STRAVA_CLIENT_SECRET,
      stravaRefreshToken: process.env.STRAVA_REFRESH_TOKEN,
    },
  },
  serverMiddleware: [
    '~/server/middleware/strava.ts',
  ],
})
