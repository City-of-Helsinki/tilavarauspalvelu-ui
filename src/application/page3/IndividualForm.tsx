import React from 'react';
import { Button, TextInput, IconArrowRight, IconArrowLeft } from 'hds-react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import {
  Address,
  Application,
  ContactPerson,
  FormType,
} from '../../common/types';
import { ButtonContainer, TwoColumnContainer } from '../../component/common';
import RadioButtons from './RadioButtons';
import EmailInput from './EmailField';

type Props = {
  activeForm: FormType;
  setActiveForm: (id: FormType) => void;
  application: Application;
  onNext: () => void;
};

const IndividualForm = ({
  activeForm,
  setActiveForm,
  application,
  onNext,
}: Props): JSX.Element | null => {
  const { t } = useTranslation();

  const { register, handleSubmit } = useForm({
    defaultValues: {
      contactPerson: { ...application.contactPerson },
      billingAddress: { ...application.billingAddress },
    },
  });

  const onSubmit = (data: Application): void => {
    // todo create copy and edit that
    // eslint-disable-next-line
    application.applicantType = 'individual';
    if (!application.contactPerson) {
      // eslint-disable-next-line
      application.contactPerson = {} as ContactPerson;
    }
    Object.assign(application.contactPerson, data.contactPerson);

    if (!application.billingAddress) {
      // eslint-disable-next-line
      application.billingAddress = {} as Address;
    }

    // eslint-disable-next-line
    application.organisation = null;
    Object.assign(application.billingAddress, data.billingAddress);
    onNext();
  };

  return (
    <form>
      <RadioButtons activeForm={activeForm} setActiveForm={setActiveForm}>
        <TwoColumnContainer>
          <TextInput
            ref={register({ required: true })}
            label={t('Application.Page3.firstName')}
            id="contactPerson.firstName"
            name="contactPerson.firstName"
            required
          />
          <TextInput
            ref={register({ required: true })}
            label={t('Application.Page3.lastName')}
            id="contactPerson.lastName"
            name="contactPerson.lastName"
            required
          />
          <TextInput
            ref={register({ required: true })}
            label={t('Application.Page3.billingAddress.streetAddress')}
            id="billingAddress.streetAddress"
            name="billingAddress.streetAddress"
            required
          />
          <TextInput
            ref={register({ required: true })}
            label={t('Application.Page3.billingAddress.postCode')}
            id="billingAddress.postCode"
            name="billingAddress.postCode"
            required
          />
          <TextInput
            ref={register({ required: true })}
            label={t('Application.Page3.billingAddress.city')}
            id="billingAddress.city"
            name="billingAddress.city"
            required
          />
          <TextInput
            ref={register({ required: true })}
            label={t('Application.Page3.contactPerson.phoneNumber')}
            id="contactPerson.phoneNumber"
            name="contactPerson.phoneNumber"
            required
          />
          <EmailInput register={register} />
        </TwoColumnContainer>
      </RadioButtons>
      <ButtonContainer>
        <Button variant="secondary" iconLeft={<IconArrowLeft />} disabled>
          {t('common.prev')}
        </Button>
        <Button
          id="next"
          iconRight={<IconArrowRight />}
          onClick={handleSubmit(onSubmit)}>
          {t('common.next')}
        </Button>
      </ButtonContainer>
    </form>
  );
};

export default IndividualForm;
