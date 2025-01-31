import React, { useEffect } from "react";
import { TextInput, Checkbox } from "hds-react";
import { useTranslation } from "next-i18next";
import { useFormContext } from "react-hook-form";
import styled from "styled-components";
import { breakpoints } from "common/src/common/style";
import { CheckboxWrapper } from "common/src/reservation-form/components";
import { ApplicantTypeChoice } from "@gql/gql-types";
import { EmailInput } from "./EmailInput";
import { BillingAddress } from "./BillingAddress";
import type { ApplicationFormPage3Values } from "./Form";
import { AutoGrid } from "common/styles/util";
import { FormSubHeading } from "./styled";
import { ControlledSelect } from "common/src/components/form";

const Placeholder = styled.span`
  @media (max-width: ${breakpoints.m}) {
    display: none;
  }
`;

type OptionType = {
  label: string;
  value: number;
};
type Props = {
  homeCityOptions: OptionType[];
};

export function OrganisationForm({
  homeCityOptions,
}: Props): JSX.Element | null {
  const { t } = useTranslation();

  const {
    register,
    unregister,
    control,
    formState: { errors },
    watch,
    setValue,
  } = useFormContext<ApplicationFormPage3Values>();

  const applicantType = watch("applicantType");
  const hasRegistration = applicantType === ApplicantTypeChoice.Association;
  const hasBillingAddress = watch("hasBillingAddress");

  useEffect(() => {
    if (hasRegistration) {
      register("organisation.identifier", { required: true });
    } else {
      unregister("organisation.identifier");
    }
  }, [hasRegistration, register, unregister]);

  useEffect(() => {
    if (hasBillingAddress) {
      register("billingAddress", { required: true });
      register("billingAddress.postCode", { required: true });
      register("billingAddress.city", { required: true });
    } else {
      unregister("billingAddress");
      unregister("billingAddress.postCode");
      unregister("billingAddress.city");
    }
  }, [hasBillingAddress, register, unregister]);

  const translateError = (errorMsg?: string) =>
    errorMsg ? t(`application:validation.${errorMsg}`) : "";

  return (
    <AutoGrid>
      <FormSubHeading>
        {t("application:Page3.subHeading.basicInfo")}
      </FormSubHeading>
      <TextInput
        {...register("organisation.name")}
        label={t("application:Page3.organisation.name")}
        id="organisation.name"
        required
        invalid={!!errors.organisation?.name?.message}
        errorText={translateError(errors.organisation?.name?.message)}
      />
      <TextInput
        {...register("organisation.coreBusiness")}
        label={t("application:Page3.organisation.coreBusiness")}
        id="organisation.coreBusiness"
        required
        invalid={!!errors.organisation?.coreBusiness?.message}
        errorText={translateError(errors.organisation?.coreBusiness?.message)}
      />
      <ControlledSelect
        control={control}
        required
        name="homeCity"
        label={t("application:Page3.homeCity")}
        options={homeCityOptions}
        error={translateError(errors.homeCity?.message)}
      />
      <CheckboxWrapper style={{ margin: "var(--spacing-xs) 0" }}>
        <Checkbox
          label={t("application:Page3.organisation.notRegistered")}
          id="organisation.notRegistered"
          name="organisation.notRegistered"
          checked={!hasRegistration}
          onClick={() => {
            if (!hasRegistration) {
              setValue("applicantType", ApplicantTypeChoice.Association);
            } else {
              setValue("applicantType", ApplicantTypeChoice.Community);
            }
          }}
        />
      </CheckboxWrapper>
      <Placeholder />
      <TextInput
        {...register("organisation.identifier")}
        label={t("application:Page3.organisation.registrationNumber")}
        id="organisation.identifier"
        required={hasRegistration}
        disabled={!hasRegistration}
        invalid={!!errors.organisation?.identifier?.message}
        errorText={translateError(errors.organisation?.identifier?.message)}
      />
      <Placeholder />
      <FormSubHeading>
        {t("application:Page3.subHeading.postalAddress")}
      </FormSubHeading>
      <TextInput
        {...register("organisation.address.streetAddress")}
        label={t("application:Page3.organisation.streetAddress")}
        id="organisation.address.streetAddress"
        name="organisation.address.streetAddress"
        required
        invalid={!!errors.organisation?.address?.streetAddress?.message}
        errorText={translateError(
          errors.organisation?.address?.streetAddress?.message
        )}
      />
      <TextInput
        {...register("organisation.address.postCode")}
        label={t("application:Page3.organisation.postCode")}
        id="organisation.address.postCode"
        required
        invalid={!!errors.organisation?.address?.postCode?.message}
        errorText={translateError(
          errors.organisation?.address?.postCode?.message
        )}
      />
      <TextInput
        {...register("organisation.address.city")}
        label={t("application:Page3.organisation.city")}
        id="organisation.address.city"
        required
        invalid={!!errors.organisation?.address?.city?.message}
        errorText={translateError(errors.organisation?.address?.city?.message)}
      />
      <CheckboxWrapper>
        <Checkbox
          label={t("application:Page3.organisation.separateInvoicingAddress")}
          id="organisation.hasInvoicingAddress"
          name="organisation.hasInvoicingAddress"
          checked={hasBillingAddress}
          onClick={() => {
            if (!hasBillingAddress) {
              setValue("hasBillingAddress", true);
            } else {
              setValue("hasBillingAddress", false);
            }
          }}
        />
      </CheckboxWrapper>
      {hasBillingAddress ? <BillingAddress /> : null}
      <FormSubHeading>
        {t("application:Page3.subHeading.contactInfo")}
      </FormSubHeading>
      <TextInput
        {...register("contactPerson.firstName")}
        label={t("application:Page3.contactPerson.firstName")}
        id="contactPerson.firstName"
        required
        invalid={!!errors.contactPerson?.firstName?.message}
        errorText={translateError(errors.contactPerson?.firstName?.message)}
      />
      <TextInput
        {...register("contactPerson.lastName")}
        label={t("application:Page3.contactPerson.lastName")}
        id="contactPerson.lastName"
        required
        invalid={!!errors.contactPerson?.lastName?.message}
        errorText={translateError(errors.contactPerson?.lastName?.message)}
      />
      <TextInput
        {...register("contactPerson.phoneNumber")}
        label={t("application:Page3.contactPerson.phoneNumber")}
        id="contactPerson.phoneNumber"
        required
        invalid={!!errors.contactPerson?.phoneNumber?.message}
        errorText={translateError(errors.contactPerson?.phoneNumber?.message)}
      />
      <EmailInput />
    </AutoGrid>
  );
}
