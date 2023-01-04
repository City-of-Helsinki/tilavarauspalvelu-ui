import { setContext } from "@apollo/client/link/context";
import { ApolloClient, HttpLink, InMemoryCache, from } from "@apollo/client";
import { relayStylePagination } from "@apollo/client/utilities";
import { onError } from "@apollo/client/link/error";
import { getSession } from "next-auth/react";
import { apiBaseUrl, isBrowser, PROFILE_TOKEN_HEADER } from "./const";
import { ExtendedSession } from "../pages/api/auth/[...nextauth]";

const authLink = setContext(
  async (notUsed, { headers }: { headers: Headers }) => {
    const session = (await getSession()) as ExtendedSession;

    const modifiedHeader = {
      headers: {
        ...headers,
        authorization: session?.apiTokens?.tilavaraus
          ? `Bearer ${session.apiTokens.tilavaraus}`
          : "",
        [PROFILE_TOKEN_HEADER]: session?.apiTokens?.profile ?? "",
      },
    };
    return modifiedHeader;
  }
);

// eslint-disable-next-line consistent-return
const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message }) => console.error(message));
  }

  if (networkError) {
    console.error(networkError);
  }
});

const httpLink = new HttpLink({ uri: `${apiBaseUrl}/graphql/` });

const client = new ApolloClient({
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          reservationUnits: relayStylePagination(),
        },
      },
    },
  }),
  link: isBrowser ? from([errorLink, authLink, httpLink]) : from([httpLink]),
  ssrMode: typeof window === undefined,
  defaultOptions: {
    watchQuery: {
      errorPolicy: "ignore",
    },
    query: {
      errorPolicy: "ignore",
      fetchPolicy: typeof window === undefined ? "no-cache" : "cache-first",
    },
  },
});

export default client;
