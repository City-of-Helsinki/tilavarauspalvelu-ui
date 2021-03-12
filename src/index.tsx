import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import { oidcLog, AuthenticationProvider } from '@axa-fr/react-oidc-context';
import * as Sentry from '@sentry/react';
import { LoadingSpinner } from 'hds-react';
import oidcConfiguration from './common/auth/configuration';
import App from './App';

import reportWebVitals from './reportWebVitals';
import { authEnabled, sentryDSN, sentryEnvironment } from './common/const';
import LoggingIn from './common/auth/LoggingIn';

if (sentryDSN) {
  Sentry.init({
    dsn: sentryDSN,
    environment: sentryEnvironment,
    release: `tilavarauspalvelu-ui@${process.env.npm_package_version}`,
    integrations: [
      new Sentry.Integrations.GlobalHandlers({
        onunhandledrejection: true,
        onerror: true,
      }),
    ],
  });
}

const boot =
  process.env.NODE_ENV === 'development' ? ReactDOM.render : ReactDOM.hydrate;

boot(
  <React.StrictMode>
    <BrowserRouter>
      <AuthenticationProvider
        authenticating={LoadingSpinner}
        configuration={oidcConfiguration}
        loggerLevel={oidcLog.ERROR}
        isEnabled={authEnabled}
        callbackComponentOverride={LoggingIn}>
        <App />
      </AuthenticationProvider>
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
