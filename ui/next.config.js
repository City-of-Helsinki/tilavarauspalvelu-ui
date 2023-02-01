const { i18n } = require("./next-i18next.config");
const { withSentryConfig } = require("@sentry/nextjs");
const withPlugins = require("next-compose-plugins");
const nextTranspiler = require("next-transpile-modules")(["common"]);
const { PHASE_PRODUCTION_SERVER } = require("next/constants");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  i18n,
  serverRuntimeConfig: {
    apiBaseUrl: process.env.TILAVARAUS_API_URL,
    authEnabled: process.env.DISABLE_AUTH !== "true",

    oidcClientId: process.env.NEXT_PUBLIC_OIDC_CLIENT_ID,
    oidcClientSecret: process.env.NEXT_PUBLIC_OIDC_AUTH_SECRET,
    oidcIssuer: process.env.NEXT_PUBLIC_OIDC_URL,
    oidcTokenUrl: process.env.NEXT_PUBLIC_OIDC_TOKEN_URL,
    oidcAccessTokenUrl: process.env.NEXT_PUBLIC_OIDC_ACCESS_TOKEN_URL,
    oidcProfileApiUrl: process.env.NEXT_PUBLIC_OIDC_PROFILE_API_URL,
    oidcTilavarausApiUrl: process.env.NEXT_PUBLIC_OIDC_TILAVARAUS_API_URL,
    oidcScope: process.env.NEXT_PUBLIC_OIDC_SCOPE,
    oidcCallbackUrl: process.env.NEXT_PUBLIC_OIDC_CALLBACK_URL,
  },
  publicRuntimeConfig: {
    baseUrl: process.env.NEXT_PUBLIC_BASE_URL,
    apiBaseUrl: process.env.TILAVARAUS_API_URL,
    authEnabled: process.env.DISABLE_AUTH !== "true",

    oidcEndSessionUrl: process.env.NEXT_PUBLIC_OIDC_END_SESSION,

    sentryDSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
    sentryEnvironment: process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT,

    cookiehubEnabled: process.env.NEXT_PUBLIC_COOKIEHUB_ENABLED === "true",
    matomoEnabled: process.env.NEXT_PUBLIC_MATOMO_ENABLED === "true",
    hotjarEnabled: process.env.NEXT_PUBLIC_HOTJAR_ENABLED === "true",
    mockRequests: process.env.NEXT_PUBLIC_MOCK_REQUESTS === "true",

    mapboxToken: process.env.NEXT_PUBLIC_MAPBOX_TOKEN,
  },
  transpilePackages: ["common"],
  compiler: {
    styledComponents: {
      ssr: true,
      displayName: true,
    },
  },
  sentry: {
    hideSourceMaps: true,
  },
};

const sentryWebpackPluginOptions = {
  // Additional config options for the Sentry Webpack plugin. Keep in mind that
  // the following options are set automatically, and overriding them is not
  // recommended:
  //   release, url, org, project, authToken, configFile, stripPrefix,
  //   urlPrefix, include, ignore

  dryRun: process.env.SENTRY_AUTH_TOKEN === undefined,
  silent: true, // Suppresses all logs
  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options.
};

// Make sure adding Sentry options is the last code to run before exporting, to
// ensure that your source maps include changes from all other Webpack plugins
module.exports = withSentryConfig(nextConfig, sentryWebpackPluginOptions);
