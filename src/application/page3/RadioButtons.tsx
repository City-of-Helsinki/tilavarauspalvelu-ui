import { RadioButton } from 'hds-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

type Props = {
  activeForm: undefined | 'individual' | 'organisation' | 'company';
  children: React.ReactNode;
  setActiveForm: (
    id: undefined | 'individual' | 'organisation' | 'company'
  ) => void;
};

const RadioButtons = ({
  activeForm,
  children,
  setActiveForm,
}: Props): JSX.Element | null => {
  const { t } = useTranslation();

  return (
    <>
      <RadioButton
        id="individual"
        label={t('Application.Page3.asIndividual')}
        onClick={() => {
          setActiveForm('individual');
        }}
        checked={activeForm === 'individual'}
      />
      {activeForm === 'individual' ? children : null}
      <RadioButton
        id="organisation"
        label={t('Application.Page3.asOrganisation')}
        onClick={() => {
          setActiveForm('organisation');
        }}
        checked={activeForm === 'organisation'}
      />
      {activeForm === 'organisation' ? children : null}
      <RadioButton
        id="company"
        label={t('Application.Page3.asCompany')}
        onClick={() => {
          setActiveForm('company');
        }}
        checked={activeForm === 'company'}
      />
      {activeForm === 'company' ? children : null}
    </>
  );
};

export default RadioButtons;
