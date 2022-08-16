import React from "react";
import { OidcProvider } from "@axa-fr/react-oidc-context";
// eslint-disable-next-line import/no-extraneous-dependencies
import { CustomHistory } from "@axa-fr/react-oidc/dist/core/routes/withRouter";
import { TransparentFullscreenSpinner } from "../common/FullscreenSpinner";
import SessionLost from "../common/SessionLost";
import oidcConfiguration from "../../modules/auth/configuration";

type Props = {
  isEnabled: boolean;
  withCustomHistory: () => CustomHistory;
  children: React.ReactChild;
};

const OidcProviderWrapper = ({
  isEnabled,
  withCustomHistory,
  children,
}: Props): JSX.Element => {
  return isEnabled ? (
    <OidcProvider
      callbackSuccessComponent={TransparentFullscreenSpinner}
      authenticatingComponent={TransparentFullscreenSpinner}
      loadingComponent={TransparentFullscreenSpinner}
      authenticatingErrorComponent={SessionLost}
      sessionLostComponent={SessionLost}
      configuration={oidcConfiguration}
      withCustomHistory={withCustomHistory}
    >
      {children}
    </OidcProvider>
  ) : (
    <>{children}</>
  );
};

export default OidcProviderWrapper;
