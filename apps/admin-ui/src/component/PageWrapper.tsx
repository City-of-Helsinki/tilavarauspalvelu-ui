import React, { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import * as Sentry from "@sentry/nextjs";
import styled from "styled-components";
import ClientOnly from "common/src/ClientOnly";
import { BannerNotificationsList } from "common/src/components";
import { CommonBannerNotificationTargetChoices } from "common/types/gql-types";
import { ScrollToTop } from "@/component/ScrollToTop";
import { Error5xx } from "@/component/error";
import usePermission from "@/hooks/usePermission";
import GlobalElements from "./GlobalElements";
import Navigation from "./Navigation";
import MainMenu from "./MainMenu";
import Loader from "./Loader";
import MainLander from "./MainLander";

type Props = {
  children: React.ReactNode;
};

const Content = styled.main`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const Wrapper = styled.div`
  display: flex;
  flex-direction: row;
  flex-grow: 1;
`;

const FallbackComponent = (err: unknown) => {
  // eslint-disable-next-line no-console
  console.error(err);
  Sentry.captureException(err);
  return <Error5xx />;
};

// NOTE client only because Navigation requires react-router-dom
export default function PageWrapper({ children }: Props): JSX.Element {
  const { hasAnyPermission, user } = usePermission();
  const hasAccess = user && hasAnyPermission();
  return (
    <ErrorBoundary FallbackComponent={FallbackComponent}>
      <ClientOnly>
        <Navigation />
        <Wrapper>
          {hasAccess && <MainMenu placement="default" />}
          <Suspense fallback={<Loader />}>
            <Content>
              {hasAccess && (
                <BannerNotificationsList
                  target={CommonBannerNotificationTargetChoices.Staff}
                />
              )}
              {user ? children : <MainLander />}
            </Content>
          </Suspense>
          <ScrollToTop />
        </Wrapper>
        <GlobalElements />
      </ClientOnly>
    </ErrorBoundary>
  );
}
