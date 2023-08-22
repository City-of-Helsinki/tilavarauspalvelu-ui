import React from "react";
import Head from "next/head";
import styled from "styled-components";

import Navigation from "app/component/Navigation";
import ClientOnly from "common/src/ClientOnly";
import GlobalElements from "app/component/GlobalElements";
import ScrollToTop from "app/common/ScrollToTop";
import MainMenu from "app/component/MainMenu";

const Wrapper = styled.div`
  display: flex;
  flex-direction: row;
  flex-grow: 1;
`;

const Content = styled.main`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
`;

// NOTE for now this is just the header for now
// should include html layout but it's all client routed so can't include in next page
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Head>
        <title>Tilavarauskäsittely</title>
        <meta name="theme-color" content="#000000" />
        <meta name="description" content="Tilavarauskäsittely" />
        <meta name="keywords" content="" />
        <meta
          property="og:image"
          content="https://www.hel.fi/static/public/helsinki_tunnus_musta.png"
        />
      </Head>
      <ClientOnly>
        <Navigation />
      </ClientOnly>
      <Wrapper>
        <MainMenu placement="default" />
        <Content>{children}</Content>
        <ScrollToTop />
      </Wrapper>
      <GlobalElements />
    </>
  );
}
