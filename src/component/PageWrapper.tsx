import React from 'react';
import styled from 'styled-components';
import Navigation from './Navigation';
import Footer from './Footer';

interface Props {
  children: React.ReactNode;
}
const Main = styled.main`
  font-size: var(--fontsize-body-xl);
  flex-grow: 1;
`;

const PageWrapper = (props: Props): JSX.Element => {
  return (
    <>
      <Navigation />
      <Main>{props.children}</Main>
      <div
        style={{
          marginTop: 'var(--spacing-layout-xl)',
        }}
      />
      <Footer />
    </>
  );
};

export default PageWrapper;
