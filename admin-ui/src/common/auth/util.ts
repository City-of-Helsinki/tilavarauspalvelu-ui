import axios from "axios";
import CustomUserStore from "./CustomUserStore";
import { oidcUrl, apiScope } from "../const";

const apiAccessTokenStorage = localStorage;
const customUserStore = new CustomUserStore();

const storageKey = `oidc.apiToken.${apiScope}`;

export const getApiAccessToken = (): string | null =>
  apiAccessTokenStorage.getItem(storageKey);

const setApiAccessToken = (accessToken: string): void =>
  apiAccessTokenStorage.setItem(storageKey, accessToken);

export const clearApiAccessToken = (): void =>
  apiAccessTokenStorage.removeItem(storageKey);

export const getAccessToken = (): string | undefined => {
  return customUserStore.getAccessToken();
};

/**
 *
 * @param accessToken
 * @returns
 */
export const updateApiAccessToken = async (): Promise<string | undefined> => {
  console.log("->update apoi access token");
  const accessToken = getAccessToken();
  if (!accessToken) {
    throw new Error("Access token not available. Cannot update");
  }
  if (!apiScope) {
    throw new Error("Application configuration error, illegal api scope.");
  }
  try {
    const response = await axios.request({
      responseType: "json",
      method: "POST",
      url: `${oidcUrl}/api-tokens/`,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    const { data } = response;

    const apiAccessToken = data[apiScope];
    console.log("setting api access token");
    setApiAccessToken(apiAccessToken);
    console.log("returning api access token");
    return apiAccessToken;
  } catch (ex) {
    throw new Error("No Token");
  }
};

export const localLogout = (clearAll = false): void => {
  Object.keys(apiAccessTokenStorage).forEach((key) => {
    if (key != null && key.startsWith(clearAll ? "oidc." : "oidc.api")) {
      apiAccessTokenStorage.removeItem(key);
    }
  });
};

export type ApiAccessTokenAvailable = "Available" | "Error";

export const assertApiAccessTokenIsAvailableAndFresh =
  async (): Promise<ApiAccessTokenAvailable> => {
    console.log("asserting api access token is available");

    try {
      await updateApiAccessToken();
      console.log("api access token is available");
      return "Available";
    } catch (e) {
      console.log("api access token is not available", e);
      return "Error";
    }
  };
