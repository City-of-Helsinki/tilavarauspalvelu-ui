import { useQuery } from "@apollo/client";
import { User } from "oidc-client";
import React, { useContext, useEffect } from "react";

import {
  assertApiAccessTokenIsAvailableAndFresh,
  clearApiAccessToken,
  localLogout,
} from "../common/auth/util";
import { Query } from "../common/gql-types";

import {
  Auth,
  authStateReducer,
  getInitialState,
  YesItsAFunction,
} from "./authStateReducer";
import OIDCLibIntegration from "./OIDCLibIntegration";
import { CURRENT_USER } from "./queries";

export type AuthStateProps = {
  authState: Auth;
};

export const AuthStateContext = React.createContext<AuthStateProps>({
  authState: { state: "Unknown", hasPermission: () => false },
});

export const useAuthState = (): AuthStateProps => useContext(AuthStateContext);

export const AuthStateContextProvider: React.FC = ({ children }) => {
  const [authState, dispatch] = React.useReducer(
    authStateReducer,
    getInitialState()
  );

  const skip = authState.state !== "ApiKeyAvailable";
  const checkApiToken = authState.state === "Authenticated";

  useQuery<Query>(CURRENT_USER, {
    skip,
    onCompleted: ({ currentUser }) => {
      if (currentUser) {
        dispatch({ type: "currentUserLoaded", currentUser });
      } else {
        dispatch({ type: "error", message: "Current User Not Available" });
      }
    },
    onError: () => {
      dispatch({ type: "error", message: "Current User Not Available" });
    },
  });

  useEffect(() => {
    const check = async () => {
      const status = await assertApiAccessTokenIsAvailableAndFresh();
      if (status === "Available") {
        dispatch({ type: "apiTokenAvailable" });
      }
      if (status !== "Available") {
        // token is not available and we failed to get one
        clearApiAccessToken();
        localLogout(true);
        window.location.reload();
      }
    };
    if (checkApiToken) {
      check();
    }
  }, [checkApiToken]);

  return (
    <AuthStateContext.Provider
      value={{
        authState,
      }}
    >
      {children}
      <OIDCLibIntegration
        setUser={(
          user: User,
          login: YesItsAFunction,
          logout: YesItsAFunction
        ) => {
          dispatch({
            type: "setUser",
            user,
            login,
            logout,
          });
        }}
      />
    </AuthStateContext.Provider>
  );
};
