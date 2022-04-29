import React from "react";
import { useAuthState } from "../context/AuthStateContext";

import Error403 from "./Error403";
import ErrorNotLoggedIn from "./ErrorNotAuthenticated";

type Props = {
  children: React.ReactChild[] | React.ReactChild;
};

const PrivateRoutes = ({ children }: Props): JSX.Element => {
  const { authState } = useAuthState();

  switch (authState().state) {
    case "Authenticated":
      return <span>initializing......</span>;
    case "Error":
      return <span>500</span>;
    case "NoPermissions":
      return <Error403 />;
    case "HasPermissions":
      return <>{children}</>;
    case "NotAutenticated":
      return <ErrorNotLoggedIn />;
    case "Unknown":
      return <span>initializing...</span>;
    default:
      throw new Error(`Illegal auth state :'${authState().state}'`);
  }
};

export default PrivateRoutes;
