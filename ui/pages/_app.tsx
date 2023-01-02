import React from "react";
import { ApolloProvider } from "@apollo/client";
import { appWithTranslation, UserConfig } from "next-i18next";
import { fi } from "date-fns/locale";
import { format, isValid } from "date-fns";
import PageWrapper from "../components/common/PageWrapper";
import SessionLost from "../components/common/SessionLost";
import ExternalScripts from "../components/ExternalScripts";
import { DataContextProvider } from "../context/DataContext";
import apolloClient from "../modules/apolloClient";
import oidcConfiguration from "../modules/auth/configuration";
import { authEnabled, isBrowser, mockRequests } from "../modules/const";
import { TrackingWrapper } from "../modules/tracking";
import nextI18NextConfig from "../next-i18next.config";
import "../styles/global.scss";

if (mockRequests) {
  require("../mocks");
}

// eslint-disable-next-line @typescript-eslint/naming-convention
function MyApp({ Component, pageProps }: AppProps) {
  if (!isBrowser) {
    return (
      <DataContextProvider>
        <ApolloProvider client={apolloClient}>
          <PageWrapper>
            <Component {...pageProps} />
          </PageWrapper>
        </ApolloProvider>
      </DataContextProvider>
    );
  }

  const AuthenticationProvider = dynamic(() =>
    // eslint-disable-next-line import/no-unresolved
    import("@axa-fr/react-oidc-context").then(
      (mod) => mod.AuthenticationProvider
    )
  );

  return (
    <>
      <DataContextProvider>
        <TrackingWrapper>
          <AuthenticationProvider
            authenticating={FullscreenSpinner}
            notAuthenticated={SessionLost}
            sessionLostComponent={SessionLost}
            configuration={oidcConfiguration}
            isEnabled={authEnabled}
            callbackComponentOverride={LoggingIn}
          >
            <ApolloProvider client={apolloClient}>
              <PageWrapper {...pageProps}>
                <Component {...pageProps} />
              </PageWrapper>
            </ApolloProvider>
          </AuthenticationProvider>
        </TrackingWrapper>
      </DataContextProvider>
      <ExternalScripts />
    </>
  );
}

export default appWithTranslation(MyApp, {
  ...(nextI18NextConfig as UserConfig),
  interpolation: {
    format: (value, fmt, lng) => {
      const locales = { fi };
      if (value instanceof Date && isValid(value))
        return format(value, fmt || "d.M.yyyy", { locale: locales[lng] });
      return value;
    },
    escapeValue: false,
  },
});
