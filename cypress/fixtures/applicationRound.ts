import { ApplicationRound } from '../../src/common/types';

const nowPlusMinutes = (minutes) => {
  const d = new Date();
  d.setTime(Date.now() + minutes * 1000 * 60);
  return d;
};

export const applicationRound = {
  name: 'Hakukierros 1',
  applicationPeriodBegin: nowPlusMinutes(-60).toISOString(),
  applicationPeriodEnd: nowPlusMinutes(5).toISOString(),
} as ApplicationRound;

export const interceptApplicationRounds = (r: ApplicationRound[]): void =>
  cy.intercept(
    {
      method: 'GET',
      url: '/v1/application_round/*',
    },
    r as ApplicationRound[]
  );
