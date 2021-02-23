const configuration = {
  client_id: 'tilanvaraus-ui-dev',
  redirect_uri: 'http://localhost:3000/login/helsinki/return',
  response_type: 'id_token token',
  post_logout_redirect_uri: 'http://localhost:3000/',
  scope: 'openid profile email',
  authority: 'https://api.hel.fi/sso/',
  silent_redirect_uri: 'http://localhost:3000/login/helsinki/return',
  automaticSilentRenew: false,
  loadUserInfo: false,
};

export default configuration;
