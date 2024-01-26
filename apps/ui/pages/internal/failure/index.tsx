/// Page that will throw an error without catching it
/// just for testing sentry config, can be removed after
/// or if not remove it from sitemap and crawlers
import React from "react";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { getCommonServerSideProps } from "@/modules/serverUtils";
import type { GetServerSidePropsContext } from "next";
import { Button } from "hds-react";

type Props = Awaited<ReturnType<typeof getServerSideProps>>["props"];

// TODO make a similar for SSR failure also i.e. using a query param ?fail=true
function FailurePage({ sentryDsn }: Props) {
  console.log("sentryDns", sentryDsn);
  return <div>
    <h1>Failure page</h1>
    <p>This is a test page, ment to fail</p>
    <div>
      <Button onClick={() => { throw new Error("This is a test error"); }}>
        Throw error
      </Button>
    </div>
  </div>;
}

export async function getServerSideProps({ locale }: GetServerSidePropsContext) {
  return {
    props: {
      ...getCommonServerSideProps(),
      ...(await serverSideTranslations(locale ?? "fi"))
    },
  };
}

export default FailurePage;
