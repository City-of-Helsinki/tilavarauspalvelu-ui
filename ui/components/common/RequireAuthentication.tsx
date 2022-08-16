import React from "react";
import { OidcSecure } from "@axa-fr/react-oidc-context";
import { authEnabled, isBrowser } from "../../modules/const";

type Props = {
  children: React.ReactNode;
};

const RequireAuthentication = ({ children }: Props): JSX.Element => {
  if (!isBrowser) {
    return null;
  }

  return authEnabled ? <OidcSecure>{children}</OidcSecure> : <>{children}</>;
};

export default RequireAuthentication;
