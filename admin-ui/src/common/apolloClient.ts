import {
  ApolloClient,
  ApolloLink,
  fromPromise,
  InMemoryCache,
} from "@apollo/client";
import { createUploadLink } from "apollo-upload-client";
import { setContext } from "@apollo/client/link/context";
import { onError } from "@apollo/client/link/error";
import { set, uniqBy } from "lodash";
import { ReservationTypeConnection } from "common/types/gql-types";

import { getApiAccessToken, updateApiAccessToken } from "./auth/util";
import { apiBaseUrl } from "./const";
import { CustomFormData } from "./CustomFormData";

const getNewToken = () => updateApiAccessToken();

const uploadLinkOptions = {
  uri: `${apiBaseUrl}/graphql/`,
};

set(uploadLinkOptions, "FormData", CustomFormData);

const terminatingLink = createUploadLink(uploadLinkOptions);

const authLink = setContext((ignore, { headers }) => {
  const token = getApiAccessToken();
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    },
  };
});

// eslint-disable-next-line consistent-return
const errorLink = onError(({ graphQLErrors, operation, forward }) => {
  if (graphQLErrors) {
    const autherror = graphQLErrors.find((e) => {
      return (
        e.message !== null &&
        (e.message.indexOf("AnonymousUser") !== -1 ||
          e.message.indexOf("has expired") !== -1 ||
          e.message.indexOf("too old") !== -1 ||
          e.message.indexOf("No permission to mutate") !== -1)
      );
    });

    const hasAuthError = Boolean(autherror !== undefined);

    if (hasAuthError) {
      return fromPromise(
        getNewToken().catch(() => {
          // TODO Handle token refresh error
          return null;
        })
      )
        .filter((value) => Boolean(value))
        .flatMap((accessToken) => {
          const oldHeaders = operation.getContext().headers;
          operation.setContext({
            headers: {
              ...oldHeaders,
              authorization: `Bearer ${accessToken}`,
            },
          });

          return forward(operation);
        });
    }
  }
});

const client = new ApolloClient({
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          reservations: {
            // key to create separate caches
            // recurring (with recurring pk as key)
            // other options are filter arguments given to the GQL request
            // TODO search options should not use separate caches
            keyArgs: [
              "recurringReservation",
              "unit",
              "reservationUnitType",
              "reservationUnit",
              "textSearch",
              "begin",
              "end",
              "priceGte",
              "priceLte",
              "orderStatus",
            ],
            read(
              existing: ReservationTypeConnection,
              options: {
                args: {
                  state?: string[] | null;
                } | null;
              }
            ) {
              const { args } = options;

              const state = args?.state;
              return {
                ...existing,
                edges: existing?.edges.filter(
                  (x) =>
                    !state || (x?.node?.state && state.includes(x.node.state))
                ),
              };
            },
            merge(
              existing: ReservationTypeConnection,
              incoming: ReservationTypeConnection
            ) {
              const dateCmp = (a?: string, b?: string) => {
                if (!a) {
                  return -1;
                }
                if (!b) {
                  return 1;
                }
                return new Date(a).getTime() - new Date(b).getTime();
              };
              // TODO this should be optimized using both spread and uniqBy creates a lot of copies
              // TODO how does this work when invalidating? e.g. if we get only a single pk that already exists
              // which one will uniqBy select? probably the first
              // FIXME the date sort breaks reservations query for non-recurring reservations
              // it's required for recurring because we need them in date order
              // but non requiring (i.e. the massive table) should use the backend sorted results
              return {
                ...incoming,
                edges: uniqBy(
                  [...(existing?.edges ?? []), ...incoming.edges],
                  (x) => x?.node?.pk
                ).sort((a, b) =>
                  dateCmp(
                    a?.node?.begin ?? undefined,
                    b?.node?.begin ?? undefined
                  )
                ),
              };
            },
          },
        },
      },
    },
  }),
  link: ApolloLink.from([errorLink, authLink, terminatingLink]),
});

export default client;
