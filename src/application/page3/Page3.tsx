import { RadioButton } from 'hds-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Application as ApplicationType } from '../../common/types';
import PrivatePersonForm from './IndividualForm';
import OrganisationForm from './OrganisationForm';
import CompanyForm from './CompanyForm';

type Props = {
  application: ApplicationType;
  // dispatch: React.Dispatch<Action>;
  onNext: () => void;
};

const Page3 = ({
  // dispatch,
  onNext,
  application,
}: Props): JSX.Element | null => {
  const { t } = useTranslation();
  const [activeForm, setActiveForm] = useState(
    undefined as undefined | 'individual' | 'organisation' | 'company'
  );

  return (
    <>
      <RadioButton
        id="privatePerson"
        label={t('Application.Page3.asIndividual')}
        onClick={() => {
          setActiveForm('individual');
        }}
        checked={activeForm === 'individual'}
      />
      {activeForm === 'individual' ? (
        <PrivatePersonForm application={application} onNext={onNext} />
      ) : null}
      <RadioButton
        id="organisation"
        label={t('Application.Page3.asOrganisation')}
        onClick={() => {
          setActiveForm('organisation');
        }}
        checked={activeForm === 'organisation'}
      />
      {activeForm === 'organisation' ? (
        <OrganisationForm application={application} onNext={onNext} />
      ) : null}
      <RadioButton
        id="company"
        label={t('Application.Page3.asCompany')}
        onClick={() => {
          setActiveForm('company');
        }}
        checked={activeForm === 'company'}
      />
      {activeForm === 'company' ? (
        <CompanyForm application={application} onNext={onNext} />
      ) : null}
    </>
  );
};

export default Page3;
