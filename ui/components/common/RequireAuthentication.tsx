import React from "react";
import dynamic from "next/dynamic";
import { authEnabled } from "../../modules/const";

type Props = {
  children: React.ReactNode;
};

const RequireAuthentication = ({ children }: Props): JSX.Element => {
  if (!authEnabled) {
    return null;
  }

  const OidcSecure = dynamic(() =>
    // eslint-disable-next-line import/no-unresolved
    import("@axa-fr/react-oidc-context").then((mod) => mod.OidcSecure)
  );

  return <OidcSecure>{children}</OidcSecure>;
};

export default RequireAuthentication;
