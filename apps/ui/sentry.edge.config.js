// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/
// TODO this file can be deleted right? we don't run on the edge but on k8
import * as Sentry from "@sentry/nextjs";
import { env } from "./env.mjs";

const SENTRY_DSN = env.SENTRY_DSN;
const SENTRY_ENVIRONMENT = env.SENTRY_ENVIRONMENT;
const VERSION = "TEMP"

if (SENTRY_DSN) {
  console.log("Initializing server Sentry for environment", SENTRY_ENVIRONMENT);
  Sentry.init({
    dsn: SENTRY_DSN,
    environment: SENTRY_ENVIRONMENT,
    release: `tilavarauspalvelu-ui@${VERSION}`,
  });
}
