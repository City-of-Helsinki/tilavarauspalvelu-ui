import React from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import { getApplication, getApplicationRound } from '../common/api';
import Loader from '../component/Loader';
import { useApiData } from '../common/hook/useApiData';
import Back from '../component/Back';

const Container = styled.div`
  padding: var(--spacing-l) var(--spacing-m) var(--spacing-m);
  max-width: var(--container-width-xl);
  margin: 0 auto var(--spacing-2-xl) auto;
  font-size: var(--fontsize-body-xl);
  height: 100%;
`;

type ParamTypes = {
  applicationId: string;
};

const Resolution = (): JSX.Element | null => {
  const { applicationId } = useParams<ParamTypes>();

  const application = useApiData(getApplication, Number(applicationId));

  const applicationRound = useApiData(
    getApplicationRound,
    application.data ? { id: application.data.applicationRoundId } : undefined
  );

  const { t } = useTranslation();

  return (
    <Container>
      <Back />
      <Loader datas={[application, applicationRound]}>{t('Hello!')}</Loader>
    </Container>
  );
};

export default Resolution;
