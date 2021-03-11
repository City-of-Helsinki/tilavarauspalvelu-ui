import axios, { AxiosRequestConfig } from 'axios';
import createAuthRefreshInterceptor from 'axios-auth-refresh';
import applyCaseMiddleware from 'axios-case-converter';
import { oidcUrl, oidcClientId } from '../const';

const axiosOptions = {
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
};

function getApiAccessToken(apiScope: string) {
  return sessionStorage.getItem(`oidc.apiToken.${apiScope}`);
}

function setApiAccessToken(accessToken: string, apiScope: string) {
  return sessionStorage.setItem(`oidc.apiToken.${apiScope}`, accessToken);
}

function getAccessToken() {
  const key = `oidc.user:${oidcUrl}/:${oidcClientId}`;
  const data = sessionStorage.getItem(key);

  if (data) {
    try {
      const parsed = JSON.parse(data);
      return parsed.access_token;
    } catch (Exception) {
      return undefined;
    }
  }
  return undefined;
}

const getNewApiAccessToken = async (accessToken: string, apiScope: string) => {
  const response = await axios.request({
    responseType: 'json',
    method: 'POST',
    url: `${oidcUrl}/api-tokens/`,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });

  const { data } = response;

  const apiAccessToken = data[apiScope];
  setApiAccessToken(apiAccessToken, 'https://api.hel.fi/auth/tilavarausapidev');

  return apiAccessToken;
};

const axiosClient = applyCaseMiddleware(axios.create(axiosOptions));

axiosClient.interceptors.request.use((req: AxiosRequestConfig) => {
  const apiAccessToken = getApiAccessToken(
    'https://api.hel.fi/auth/tilavarausapidev'
  );

  if (apiAccessToken) {
    req.headers.Authorization = `Bearer ${getApiAccessToken(
      'https://api.hel.fi/auth/tilavarausapidev'
    )}`;
  }
  return req;
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const refreshAuthLogic = (failedRequest: any) => {
  const accessToken = getAccessToken();
  return getNewApiAccessToken(
    accessToken,
    'https://api.hel.fi/auth/tilavarausapidev'
  ).then((apiAccessToken) => {
    // eslint-disable-next-line no-param-reassign
    failedRequest.response.config.headers.Authorization = `Bearer ${apiAccessToken}`;
    return Promise.resolve();
  });
};

// interceptor that fetches new api access keys
createAuthRefreshInterceptor(axiosClient, refreshAuthLogic);

export default axiosClient;
