import { isBrowser, oidcClientId, oidcScope, oidcUrl } from "../const";

let base = "";
if (isBrowser) {
  base = `${document.location.protocol}//${document.location.host}`;
}

const configuration = {
  client_id: oidcClientId,
  redirect_uri: `${base}/login/helsinki/return`,
  silent_redirect_uri: `${base}/login/helsinki/silent`,
  response_type: "code",
  post_logout_redirect_uri: `${base}/?logout`,
  scope: oidcScope,
  authority: oidcUrl,
  automaticSilentRenew: true,
  loadUserInfo: false,
  service_worker_only: false,
};

export default configuration;
