import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TFunction } from 'i18next';
import { useAsync } from 'react-use';
import styled from 'styled-components';
import groupBy from 'lodash/groupBy';
import { getApplications, getApplicationRounds } from '../common/api';
import {
  Application,
  ApplicationRound,
  ReducedApplicationStatus,
} from '../common/types';
import Head from './Head';
import { CenterSpinner } from '../component/common';
import ApplicationsGroup from './ApplicationsGroup';
import { getReducedApplicationStatus } from '../common/util';

const Container = styled.div`
  padding: var(--spacing-l) var(--spacing-m) var(--spacing-m);
  max-width: var(--container-width-xl);
  margin: 0 auto var(--spacing-2-xl) auto;
  font-size: var(--fontsize-body-xl);
  height: 100%;
`;

const statusGroupOrder: ReducedApplicationStatus[] = [
  'draft',
  'processing',
  'handled',
  'declined',
  'cancelled',
];

function ApplicationGroups({
  rounds,
  applications,
  t,
}: {
  rounds: { [key: number]: ApplicationRound };
  applications: { [key: string]: Application[] };
  t: TFunction;
}): JSX.Element {
  if (Object.keys(applications).length === 0) {
    return <span>{t('Applications.noApplications')}</span>;
  }
  return (
    <>
      {statusGroupOrder.map((gr) => (
        <ApplicationsGroup
          key={gr}
          name={t(`Applications.group.${gr}`)}
          rounds={rounds}
          applications={applications[gr] || []}
        />
      ))}
    </>
  );
}

const Applications = (): JSX.Element | null => {
  const { t } = useTranslation();

  const [applications, setApplications] = useState(
    {} as { [key: string]: Application[] }
  );
  const [rounds, setRounds] = useState(
    {} as { [key: number]: ApplicationRound }
  );

  const status = useAsync(async () => {
    const loadedApplications = (await getApplications()).filter(
      (a) => a.status !== 'cancelled'
    );
    const groupedApplications = groupBy(loadedApplications, (a) =>
      getReducedApplicationStatus(a.status)
    );
    setApplications(groupedApplications);
    const loadedRounds = await getApplicationRounds();
    setRounds(
      loadedRounds.reduce((prev, current) => {
        return { ...prev, [current.id]: current };
      }, {} as { [key: number]: ApplicationRound })
    );
  }, []);

  return (
    <>
      <Head heading={t('Applications.heading')} />
      <Container>
        {status.loading ? (
          <CenterSpinner />
        ) : (
          <ApplicationGroups
            t={t}
            rounds={rounds}
            applications={applications}
          />
        )}
      </Container>
    </>
  );
};

export default Applications;
