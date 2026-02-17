export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const query = getQuery(event);

  const code = typeof query.code === 'string' ? query.code : '';
  const redirectUri = typeof query.redirect_uri === 'string'
    ? query.redirect_uri
    : 'http://localhost/exchange_token';

  if (!code) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing query parameter: code',
    });
  }

  if (!config.public.stravaClientId || !config.stravaClientSecret) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Missing STRAVA_CLIENT_ID or STRAVA_CLIENT_SECRET',
    });
  }

  try {
    const data = await $fetch<{
      scope: string;
      access_token: string;
      expires_at: number;
      refresh_token: string;
    }>('https://www.strava.com/oauth/token', {
      method: 'POST',
      body: {
      client_id: config.public.stravaClientId,
      client_secret: config.stravaClientSecret,
      code,
      grant_type: 'authorization_code',
      redirect_uri: redirectUri,
      },
    });

    return {
      scope: data.scope,
      access_token: data.access_token,
      expires_at: data.expires_at,
      refresh_token: data.refresh_token,
      message: 'Set STRAVA_REFRESH_TOKEN to refresh_token and restart dev server.',
    };
  } catch (error) {
    if (error && typeof error === 'object') {
      const err = error as { statusCode?: number; data?: unknown; message?: string };
      throw createError({
        statusCode: err.statusCode || 500,
        statusMessage: 'Failed to exchange Strava auth code',
        data: err.data || err.message,
      });
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Unknown error exchanging Strava auth code',
    });
  }
});
