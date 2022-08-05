import React from "react";
import { OidcSecure } from "@axa-fr/react-oidc-context";
import { isBrowser } from "../../modules/const";

type Props = {
  children: React.ReactNode;
};

const RequireAuthentication = ({ children }: Props): JSX.Element => {
  if (!isBrowser) {
    return null;
  }

  return <OidcSecure>{children}</OidcSecure>;
};

export default RequireAuthentication;
