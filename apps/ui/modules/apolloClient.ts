import { ApolloClient, HttpLink, InMemoryCache, from } from "@apollo/client";
import { getCookie } from "typescript-cookie";
import { relayStylePagination } from "@apollo/client/utilities";
import { onError } from "@apollo/client/link/error";
import { GraphQLError } from "graphql";
// eslint-disable-next-line unicorn/prefer-node-protocol -- node:querystring breaks the app
import qs, { ParsedUrlQuery } from "querystring";
import { GetServerSidePropsContext, PreviewData } from "next";
import { IncomingHttpHeaders } from "node:http";
import { buildGraphQLUrl } from "common/src/urlBuilder";
import { env } from "@/env.mjs";
import { isBrowser } from "./const";

const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(async (error: GraphQLError) => {
      // eslint-disable-next-line no-console
      console.error(`GQL_ERROR: ${JSON.stringify(error, null, 2)}`);
    });
  }

  if (networkError) {
    // eslint-disable-next-line no-console
    console.error(`NETWORK_ERROR: ${JSON.stringify(networkError, null, 2)}`);
  }
});

function getServerCookie(
  headers: IncomingHttpHeaders | undefined,
  name: string
) {
  const cookie = headers?.cookie;
  if (cookie == null) {
    // eslint-disable-next-line no-console
    console.warn("cookie not found in headers", headers);
    return null;
  }
  const decoded = qs.decode(cookie, "; ");
  const token = decoded[name];
  if (token == null) {
    // eslint-disable-next-line no-console
    console.warn(`${name} not found in cookie`, decoded);
    return null;
  }
  if (Array.isArray(token)) {
    // eslint-disable-next-line no-console
    console.warn(`multiple ${name} in cookies`, decoded);
    return token[0];
  }
  return token;
}

// POST requests require a CSRF token, if it's missing this can be used to set get it.
async function fetchCsrfToken(apiUrl: string) {
  const url = `${apiUrl}/csrf/`;
  return fetch(url, {
    method: "GET",
    credentials: "include",
  }).then((response) => {
    if (response.ok) {
      const csrfCookie = response.headers
        .getSetCookie()
        .find((cookie) => cookie.startsWith("csrftoken="));
      const csrfToken = csrfCookie?.split(";")[0].split("=")[1];
      return csrfToken;
    }

    throw new Error("Failed to fetch CSRF token");
  });
}

export async function getCsrfToken(
  apiUrl: string,
  ctx?: GetServerSidePropsContext<ParsedUrlQuery, PreviewData>
) {
  const isServer = typeof window === "undefined";
  const csrfToken = isServer
    ? getServerCookie(ctx?.req?.headers, "csrftoken")
    : getCookie("csrftoken");
  if (csrfToken != null) {
    return csrfToken;
  }

  return fetchCsrfToken(apiUrl);
}

/// Has to be async because we might need to fetch the CSRF token.
/// Can't make any graphql requests without the CSRF token.
/// Only needs to fetch the CSRF token if it's the first request (otherwise it's included in the site cookies already).
/// Not sure if this is required on the client (it doesn't actually set the cookie, and requires another fetch to set the cookie in the browser).
export async function createApolloClient(
  hostUrl: string,
  ctx?: GetServerSidePropsContext<ParsedUrlQuery, PreviewData>
) {
  const isServer = typeof window === "undefined";
  const csrfToken = await getCsrfToken(hostUrl, ctx);

  const sessionCookie = isServer
    ? getServerCookie(ctx?.req?.headers, "sessionid")
    : getCookie("sessionid");

  const uri = buildGraphQLUrl(hostUrl, env.ENABLE_FETCH_HACK);

  // TODO on client side we might not need this (only on SSR)
  const enchancedFetch = (url: RequestInfo | URL, init?: RequestInit) => {
    const headers = new Headers({
      ...(init?.headers != null ? init.headers : {}),
      ...(csrfToken != null ? { "X-Csrftoken": csrfToken } : {}),
      // NOTE server requests don't include cookies by default
      // TODO include session cookie here also when we use SSR for user specific requests
      ...(csrfToken != null ? { Cookie: `csrftoken=${csrfToken}` } : {}),
    });

    if (sessionCookie != null) {
      headers.append("Cookie", `sessionid=${sessionCookie}`);
    }

    return fetch(url, {
      ...init,
      headers,
    });
  };

  const httpLink = new HttpLink({
    uri,
    // TODO this might be useless
    credentials: "include",
    // @ts-expect-error: TODO undici (node fetch) is a mess
    fetch: enchancedFetch,
  });

  return new ApolloClient({
    ssrMode: isServer,
    link: from([errorLink, httpLink]),
    defaultOptions: {
      watchQuery: {
        errorPolicy: "ignore",
      },
      query: {
        errorPolicy: "ignore",
        fetchPolicy: isBrowser ? "cache-first" : "no-cache",
      },
    },
    cache: new InMemoryCache({
      typePolicies: {
        Query: {
          fields: {
            reservationUnits: relayStylePagination(),
          },
        },
      },
    }),
  });
}
