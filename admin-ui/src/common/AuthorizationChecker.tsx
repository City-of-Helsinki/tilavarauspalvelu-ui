import React from "react";
import { MainMenuWrapper } from "app/component/withMainMenu";
import { useAuthState } from "../context/AuthStateContext";
import { AuthState, Permission } from "../context/authStateReducer";

import Error403 from "./Error403";
import Error5xx from "./Error5xx";
import ErrorNotLoggedIn from "./ErrorNotAuthenticated";

const AuthStateError = (state: AuthState) => {
  switch (state) {
    case "HasPermissions":
      return null;
    case "NoPermissions":
      return <Error403 showLogoutSection />;
    case "NotAutenticated":
      return <ErrorNotLoggedIn />;
    case "ApiKeyAvailable":
    case "Unknown":
    case "Authenticated":
      return <span />;
    case "Error":
      return <Error5xx />;
  }
  return <Error5xx />;
};

const AuthorisationChecker = ({
  children,
  permission,
}: {
  children: React.ReactNode;
  permission?: Permission;
}) => {
  const { authState } = useAuthState();
  const { hasPermission } = authState;
  const error = AuthStateError(authState.state);
  if (error) return error;

  if (permission && !hasPermission(permission)) {
    return (
      <MainMenuWrapper>
        <Error403 />
      </MainMenuWrapper>
    );
  }
  return <>{children}</>;
};

export default AuthorisationChecker;
