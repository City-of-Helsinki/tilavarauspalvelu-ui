// @ts-check
// This file configures the initialization of Sentry on the browser.
// The config you add here will be used whenever a page is visited.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/
import * as Sentry from "@sentry/nextjs";
import { env } from "./env.mjs";

const SENTRY_ENVIRONMENT = env.SENTRY_ENVIRONMENT;
// VERSION should be set during build time so it's always available
// TODO replace with git generated version (similar to what's in Django)
// TODO use an utility function
const VERSION = "unknown"

Sentry.init({
  dsn: "",
  debug: true,
  environment: SENTRY_ENVIRONMENT,
  release: `tilavarauspalvelu-ui@${VERSION}`,
});

/**
 * Initialize Sentry client
 * @param {string} dsn
 * @param {string} environment
 */
export function updateSentryConfig(dsn, environment) {
  console.log("update sentry config with ", dsn, " and ", environment);
  Sentry.init({
    dsn,
    debug: true,
    environment,
    release: `tilavarauspalvelu-ui@${VERSION}`,
  });
}
