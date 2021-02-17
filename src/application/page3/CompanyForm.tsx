import React, { useState } from 'react';
import {
  Button,
  TextInput,
  IconArrowRight,
  IconArrowLeft,
  Checkbox,
} from 'hds-react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import {
  Address,
  Application,
  ContactPerson,
  FormType,
  Organisation,
} from '../../common/types';
import {
  ButtonContainer,
  Notification,
  SpanTwoColumns,
  TwoColumnContainer,
} from '../../component/common';
import RadioButtons from './RadioButtons';

type Props = {
  activeForm: FormType;
  setActiveForm: (id: FormType) => void;
  application: Application;
  onNext: () => void;
};

const CompanyForm = ({
  activeForm,
  setActiveForm,
  application,
  onNext,
}: Props): JSX.Element | null => {
  const { t } = useTranslation();

  const [hasRegistration, setHasRegistration] = useState(true);
  const [hasBillingAddress, setHasBillingAddress] = useState(
    application.billingAddress !== null
  );

  const { register, handleSubmit } = useForm({
    defaultValues: {
      organisation: { ...application.organisation },
      contactPerson: { ...application.contactPerson },
      billingAddress: { ...application.billingAddress },
    },
  });

  const onSubmit = (data: Application): void => {
    // todo create copy and edit that

    // eslint-disable-next-line
    application.applicantType = 'company';

    if (!application.contactPerson) {
      // eslint-disable-next-line
      application.contactPerson = {} as ContactPerson;
    }
    Object.assign(application.contactPerson, data.contactPerson);

    if (!application.organisation) {
      // eslint-disable-next-line
      application.organisation = {} as Organisation;
    }
    Object.assign(application.organisation, data.organisation);

    if (hasBillingAddress) {
      if (!application.billingAddress) {
        // eslint-disable-next-line
        application.billingAddress = {} as Address;
      }
      Object.assign(application.billingAddress, data.billingAddress);
    } else {
      // eslint-disable-next-line
      application.billingAddress = null;
    }
    onNext();
  };

  return (
    <form>
      <RadioButtons activeForm={activeForm} setActiveForm={setActiveForm}>
        <TwoColumnContainer>
          <SpanTwoColumns>
            <TextInput
              ref={register({ required: true })}
              label={t('Application.Page3.organisation.name')}
              id="organisation.name"
              name="organisation.name"
              required
            />
            <TextInput
              ref={register({ required: true })}
              label={t('Application.Page3.organisation.coreBusiness')}
              id="organisation.coreBusiness"
              name="organisation.coreBusiness"
              required
            />
          </SpanTwoColumns>
          <TextInput
            ref={register({ required: true })}
            label={t('Application.Page3.organisation.registrationNumber')}
            id="organisation.identifier"
            name="organisation.identifier"
            required={hasRegistration}
            disabled={!hasRegistration}
          />
          <Checkbox
            label={t('Application.Page3.organisation.notRegistered')}
            id="organisation.notRegistered"
            name="organisation.notRegistered"
            checked={!hasRegistration}
            onClick={() => setHasRegistration(!hasRegistration)}
          />
          <TextInput
            ref={register({ required: true })}
            label={t('Application.Page3.organisation.streetAddress')}
            id="organisation.address.streetAddress"
            name="organisation.address.streetAddress"
            required
          />
          <TextInput
            ref={register({ required: true })}
            label={t('Application.Page3.organisation.postCode')}
            id="organisation.address.postCode"
            name="organisation.address.postCode"
            required
          />
          <TextInput
            ref={register({ required: true })}
            label={t('Application.Page3.organisation.city')}
            id="organisation.address.city"
            name="organisation.address.city"
            required
          />
          <Checkbox
            label={t('Application.Page3.organisation.separateInvoicingAddress')}
            id="organisation.hasInvoicingAddress"
            name="organisation.hasInvoicingAddress"
            checked={hasBillingAddress}
            onClick={() => setHasBillingAddress(!hasBillingAddress)}
          />
          {hasBillingAddress ? (
            <>
              <TextInput
                ref={register({ required: true })}
                label={t('Application.Page3.organisation.streetAddress')}
                id="billingAddress.streetAddress"
                name="billingAddress.streetAddress"
                required
              />
              <TextInput
                ref={register({ required: true })}
                label={t('Application.Page3.organisation.postCode')}
                id="billingAddress.postCode"
                name="billingAddress.postCode"
                required
              />
              <TextInput
                ref={register({ required: true })}
                label={t('Application.Page3.organisation.city')}
                id="billingAddress.city"
                name="billingAddress.city"
                required
              />
            </>
          ) : null}
          <TextInput
            ref={register({ required: true })}
            label={t('Application.Page3.contactPerson.phoneNumber')}
            id="contactPerson.phoneNumber"
            name="contactPerson.phoneNumber"
            required
          />
          <TextInput
            ref={register({ required: true })}
            label={t('Application.Page3.contactPerson.firstName')}
            id="contactPerson.firstName"
            name="contactPerson.firstName"
            required
          />
          <TextInput
            ref={register({ required: true })}
            label={t('Application.Page3.contactPerson.lastName')}
            id="contactPerson.lastName"
            name="contactPerson.lastName"
            required
          />
          <SpanTwoColumns>
            <Notification size="small" label="">
              {t('Application.Page3.emailNotification')}
            </Notification>
            <SpanTwoColumns>
              <TextInput
                ref={register({ required: true })}
                label={t('Application.Page3.email')}
                id="email"
                name="contactPerson.email"
                type="contactPerson.email"
                required
              />
            </SpanTwoColumns>
          </SpanTwoColumns>
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

export default CompanyForm;
