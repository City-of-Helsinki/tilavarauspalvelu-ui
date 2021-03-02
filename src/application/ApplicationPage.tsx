import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { breakpoint } from '../common/style';
import Container from '../component/Container';
import Head from './Head';
import Stepper from './Stepper';

type ApplicationPageProps = {
  translationKeyPrefix: string;
  match: { url: string };
  breadCrumbText: string;
  overrideText?: string;
  children?: React.ReactNode;
};

const InnerContainer = styled.div`
  display: grid;
  gap: 6em;
  grid-template-columns: 2fr 5fr;
  @media (max-width: ${breakpoint.l}) {
    grid-template-columns: 1fr;
    gap: 0;
  }
`;

const ApplicationPage = ({
  translationKeyPrefix,
  breadCrumbText,
  overrideText,
  children,
  match,
}: ApplicationPageProps): JSX.Element => {
  const { t } = useTranslation();

  return (
    <>
      <Head
        korosType="storm"
        heading={t(`${translationKeyPrefix}.heading`)}
        text={overrideText || t(`${translationKeyPrefix}.text`)}
        breadCrumbText={breadCrumbText}
      />
      <Container main>
        <InnerContainer>
          <Stepper match={match} />
          <div>{children}</div>
        </InnerContainer>
      </Container>
    </>
  );
};

export default ApplicationPage;
