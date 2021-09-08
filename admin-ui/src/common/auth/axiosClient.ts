import axios, { AxiosRequestConfig } from "axios";
import createAuthRefreshInterceptor from "axios-auth-refresh";
import applyCaseMiddleware from "axios-case-converter";
import { authEnabled, oidcUrl, oidcClientId } from "../const";
import { getApiAccessToken, updateApiAccessToken } from "./util";

const axiosOptions = {
  timeout: 20000,
  headers: {
    "Content-Type": "application/json",
  },
};

const getAccessToken = () => {
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
};

const axiosClient = applyCaseMiddleware(axios.create(axiosOptions));

axiosClient.interceptors.request.use((req: AxiosRequestConfig) => {
  const apiAccessToken = getApiAccessToken();

  if (apiAccessToken) {
    req.headers.Authorization = `Bearer ${apiAccessToken}`;
  }
  return req;
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const refreshAuthLogic = (failedRequest: any) => {
  const accessToken = getAccessToken();
  return updateApiAccessToken(accessToken).then((apiAccessToken) => {
    // eslint-disable-next-line no-param-reassign
    failedRequest.response.config.headers.Authorization = `Bearer ${apiAccessToken}`;
    return Promise.resolve();
  });
};

if (authEnabled) {
  createAuthRefreshInterceptor(axiosClient, refreshAuthLogic);
}

export default axiosClient;
