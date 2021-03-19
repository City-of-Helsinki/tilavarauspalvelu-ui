import React from 'react';
import { Application, ApplicationRound } from '../common/types';
import ApplicationCard from './ApplicationCard';

type Props = {
  name: string;
  rounds: { [key: number]: ApplicationRound };
  applications: Application[];
};

const ApplicationsGroup = ({
  name,
  applications,
  rounds,
}: Props): JSX.Element | null => {
  if (!applications.length) {
    return null;
  }

  return (
    <>
      <h2>{name}</h2>
      {applications.map((application) => (
        <ApplicationCard
          key={application.id}
          application={application}
          applicationRound={rounds[application.applicationRoundId]}
        />
      ))}
    </>
  );
};

export default ApplicationsGroup;
