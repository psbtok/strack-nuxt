export default defineEventHandler((event) => {
  const config = useRuntimeConfig();
  const query = getQuery(event);

  if (!config.public.stravaClientId) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Missing STRAVA_CLIENT_ID',
    });
  }

  const redirectUri = typeof query.redirect_uri === 'string'
    ? query.redirect_uri
    : 'http://localhost/exchange_token';

  const state = typeof query.state === 'string' ? query.state : undefined;

  const params = new URLSearchParams({
    client_id: config.public.stravaClientId,
    response_type: 'code',
    redirect_uri: redirectUri,
    approval_prompt: 'force',
    scope: 'read,activity:read_all',
  });

  if (state) {
    params.set('state', state);
  }

  return {
    authorizeUrl: `https://www.strava.com/oauth/authorize?${params.toString()}`,
  };
});
