import React from "react";
import styled from "styled-components";
import Navigation from "./Navigation";
import Footer from "./Footer";
import ServiceNotification from "./ServiceNotification";
import Title from "./Title";

interface Props {
  children: React.ReactNode;
}

const Main = styled.main`
  font-size: var(--fontsize-body-m);
  flex-grow: 1;
`;

const PageWrapper = (props: Props): JSX.Element => {
  return (
    <>
      <Title>Tilavarauspalvelu</Title>
      <Navigation />
      <ServiceNotification />
      <Main id="main">{props.children}</Main>
      <div
        style={{
          marginTop: "var(--spacing-layout-xl)",
        }}
      />
      <Footer />
      <div id="modal-root" />
    </>
  );
};

export default PageWrapper;
