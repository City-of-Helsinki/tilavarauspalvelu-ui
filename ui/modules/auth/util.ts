import axios from "axios";
import { apiScope, isBrowser, oidcUrl } from "../const";

export const getApiAccessToken = (): string | null => {
  const key = `oidc.apiToken.${apiScope}`;
  const data = isBrowser && sessionStorage.getItem(key);

  if (data) {
    try {
      const parsed = JSON.parse(data);
      return parsed?.apiAccessToken;
    } catch (Exception) {
      return undefined;
    }
  }
  return undefined;
};

const setApiAccessToken = (accessToken: string): void => {
  return (
    isBrowser &&
    sessionStorage.setItem(
      `oidc.apiToken.${apiScope}`,
      JSON.stringify({ apiAccessToken: accessToken })
    )
  );
};

export const clearApiAccessToken = (): void => {
  return isBrowser && sessionStorage.removeItem(`oidc.apiToken.${apiScope}`);
};

export const getAccessToken = (): string | null => {
  const key = "oidc.default";
  const data = isBrowser && sessionStorage.getItem(key);

  if (data) {
    try {
      const parsed = JSON.parse(data);
      return parsed?.tokens?.accessToken;
    } catch (Exception) {
      return undefined;
    }
  }
  return undefined;
};

export const updateApiAccessToken = async (
  accessToken: string | undefined
): Promise<string> => {
  if (!accessToken) {
    throw new Error("Api access token not available. Cannot update");
  }
  if (!apiScope) {
    throw new Error("Application configuration error, illegal api scope.");
  }
  const response = await axios.request({
    responseType: "json",
    method: "POST",
    url: `${oidcUrl.replace("/openid", "")}/api-tokens/`,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });

  const { data } = response;

  const apiAccessToken = data[apiScope];
  setApiAccessToken(apiAccessToken);

  return apiAccessToken;
};
