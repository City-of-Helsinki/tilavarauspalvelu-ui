import React from "react";
import ReactDOM from "react-dom";
import {
  oidcLog,
  AuthenticationProvider,
  // eslint-disable-next-line import/no-unresolved
} from "@axa-fr/react-oidc-context";
import * as Sentry from "@sentry/react";
import oidcConfiguration from "./common/auth/configuration";
import "./index.scss";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import Authenticating from "./component/Authentication/Authenticating";
import AuthorizationNeeded from "./component/Authentication/AuthorizationNeeded";
import { authEnabled } from "./common/const";
import MainLander from "./component/MainLander";
import CustomUserStore from "./common/auth/CustomUserStore";

const dsn = process.env.REACT_APP_SENTRY_DSN;
const environment = process.env.REACT_APP_SENTRY_ENVIRONMENT;
const release = process.env.REACT_APP_SENTRY_RELEASE;

if (dsn) {
  Sentry.init({
    dsn,
    environment,
    release,
  });
}

ReactDOM.render(
  <React.StrictMode>
    <AuthenticationProvider
      notAuthenticated={() => <MainLander withSiteWrapper />}
      notAuthorized={() => <AuthorizationNeeded />}
      authenticating={() => <Authenticating noNavigation />}
      configuration={oidcConfiguration}
      loggerLevel={oidcLog.DEBUG}
      isEnabled={authEnabled}
      callbackComponentOverride={() => <Authenticating />}
      sessionLostComponent={() => <MainLander withSiteWrapper />}
      UserStore={CustomUserStore}
      customEvents={{
        onUserLoaded: (u) =>
          console.log("user loaded ***********************", u),
        onUserUnloaded: () =>
          console.log("on user unloaded ***************************"),
        onSilentRenewError: (a) =>
          console.log("on silent renew error ***************************", a),
        onUserSignedOut: () =>
          console.log("on user signed out ***************************"),
        onUserSessionChanged: () =>
          console.log("on user session changed ***************************"),
        onAccessTokenExpired: (a) =>
          console.log("on access token expired ***************************", a),
        onAccessTokenExpiring: (a) => {
          console.log("on access token expired ***************************", a);
        },
      }}
    >
      <App />
    </AuthenticationProvider>
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
