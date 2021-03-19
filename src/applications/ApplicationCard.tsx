import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { useHistory } from 'react-router-dom';
import { Button, Card as HdsCard, Tag as HdsTag } from 'hds-react';
import { Application, ApplicationRound } from '../common/types';
import { isActive, applicationUrl } from '../common/util';
import { breakpoint } from '../common/style';

const Card = styled(HdsCard)`
  margin-bottom: var(--spacing-m);
  @media (max-width: ${breakpoint.l}) {
    grid-template-columns: 1fr;
  }
  width: auto;
`;

const Tag = styled(HdsTag)`
  margin-top: var(--spacing-s);
  color: var(--color-white);
  background-color: #0062b9;
`;

const Buttons = styled.div`
  font-family: var(--font-medium);
  font-size: var(--fontsize-body-m);
  display: grid;
  @media (max-width: ${breakpoint.l}) {
    margin-top: var(--spacing-m);
    display: block;
  }
`;

const Applicant = styled.div`
  margin-top: var(--spacing-xs);
  margin-bottom: var(--spacing-s);
`;

const RoundName = styled.div`
  margin-top: var(--spacing-xs);
  font-size: var(--fontsize-heading-m);
  font-family: var(--font-bold);
  margin-bottom: 0;
  @media (max-width: ${breakpoint.l}) {
    font-size: var(--fontsize-body-m);
  }
`;

const StyledButton = styled(Button)`
  margin-right: var(--spacing-xs);
  @media (max-width: ${breakpoint.s}) {
    font-size: var(--fontsize-body-m);
    margin-top: var(--spacing-xs);
    width: 100%;
  }
`;
type Props = {
  application: Application;
  applicationRound: ApplicationRound;
};

const getApplicant = (application: Application): string => {
  const prefix = 'Hakemus luotu';
  if (application.organisation) {
    return prefix + application.organisation?.name || 'Nimetön organisaatio';
  }
  if (application.contactPerson) {
    return `${prefix} yksityishenkilönä`;
  }

  return '';
};

const ApplicationCard = ({
  application,
  applicationRound,
}: Props): JSX.Element | null => {
  const { t } = useTranslation();
  const history = useHistory();
  const editable = isActive(
    applicationRound.applicationPeriodBegin,
    applicationRound.applicationPeriodEnd
  );
  return (
    <Card border key={application.id}>
      <div>
        <Tag>{t(`ApplicationCard.status.${application.status}`)}</Tag>
        <RoundName>{applicationRound.name}</RoundName>
        {application.applicantType !== null ? (
          <Applicant>{getApplicant(application)}</Applicant>
        ) : null}
      </div>
      <Buttons>
        <StyledButton
          disabled={!editable}
          onClick={() => {
            history.push(`${applicationUrl(application.id as number)}/page1`);
          }}>
          {t('ApplicationCard.edit')}
        </StyledButton>
        <StyledButton disabled={!editable} variant="danger">
          {t('ApplicationCard.cancel')}
        </StyledButton>
      </Buttons>
    </Card>
  );
};

export default ApplicationCard;
