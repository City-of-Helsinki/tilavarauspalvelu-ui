/// Page that will throw an error without catching it
/// just for testing sentry config, can be removed after
/// or if not remove it from sitemap and crawlers
import React, { useEffect } from "react";

function ErrorPage() {
  useEffect(() => {
    throw new Error("This page is ment to fail");
  }, []);

  return <div>ERROR: this page is ment to fail</div>;
}

export default ErrorPage;
