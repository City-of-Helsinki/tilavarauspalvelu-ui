import React, { useEffect } from "react";
import { TextInput, Checkbox } from "hds-react";
import { useTranslation } from "next-i18next";
import { useFormContext } from "react-hook-form";
import styled from "styled-components";
import { breakpoints } from "common/src/common/style";
import { CheckboxWrapper } from "common/src/reservation-form/components";
import { ApplicantTypeChoice } from "@gql/gql-types";
import { applicationErrorText } from "@/modules/util";
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

export const OrganisationForm = ({
  homeCityOptions,
}: Props): JSX.Element | null => {
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

  return (
    <AutoGrid>
      <FormSubHeading>
        {t("application:Page3.subHeading.basicInfo")}
      </FormSubHeading>
      <TextInput
        {...register("organisation.name", { required: true, maxLength: 255 })}
        label={t("application:Page3.organisation.name")}
        id="organisation.name"
        required
        invalid={!!errors.organisation?.name?.type}
        errorText={applicationErrorText(t, errors.organisation?.name?.type, {
          count: 255,
        })}
      />
      <TextInput
        {...register("organisation.coreBusiness", {
          required: true,
          maxLength: 255,
        })}
        label={t("application:Page3.organisation.coreBusiness")}
        id="organisation.coreBusiness"
        required
        invalid={!!errors.organisation?.coreBusiness?.type}
        errorText={applicationErrorText(
          t,
          errors.organisation?.coreBusiness?.type,
          {
            count: 255,
          }
        )}
      />
      <ControlledSelect
        control={control}
        required
        name="homeCity"
        label={t("application:Page3.homeCity")}
        options={homeCityOptions}
        error={applicationErrorText(t, errors.homeCity?.type)}
      />
      <Placeholder />
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
        {...register("organisation.identifier", {
          required: hasRegistration,
          maxLength: 255,
        })}
        label={t("application:Page3.organisation.registrationNumber")}
        id="organisation.identifier"
        required={hasRegistration}
        disabled={!hasRegistration}
        invalid={!!errors.organisation?.identifier?.type}
        errorText={applicationErrorText(
          t,
          errors.organisation?.identifier?.type,
          {
            count: 255,
          }
        )}
      />
      <Placeholder />
      <FormSubHeading>
        {t("application:Page3.subHeading.postalAddress")}
      </FormSubHeading>
      <TextInput
        {...register("organisation.address.streetAddress", {
          required: true,
          maxLength: 80,
        })}
        label={t("application:Page3.organisation.streetAddress")}
        id="organisation.address.streetAddress"
        name="organisation.address.streetAddress"
        required
        invalid={!!errors.organisation?.address?.streetAddress?.type}
        errorText={applicationErrorText(
          t,
          errors.organisation?.address?.streetAddress?.type,
          {
            count: 80,
          }
        )}
      />
      <TextInput
        {...register("organisation.address.postCode", {
          required: true,
          maxLength: 32,
        })}
        label={t("application:Page3.organisation.postCode")}
        id="organisation.address.postCode"
        required
        invalid={!!errors.organisation?.address?.postCode?.type}
        errorText={applicationErrorText(
          t,
          errors.organisation?.address?.postCode?.type,
          { count: 32 }
        )}
      />
      <TextInput
        {...register("organisation.address.city", {
          required: true,
          maxLength: 80,
        })}
        label={t("application:Page3.organisation.city")}
        id="organisation.address.city"
        required
        invalid={!!errors.organisation?.address?.city?.type}
        errorText={applicationErrorText(
          t,
          errors.organisation?.address?.city?.type,
          {
            count: 80,
          }
        )}
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
        {...register("contactPerson.firstName", {
          required: true,
          maxLength: 255,
        })}
        label={t("application:Page3.contactPerson.firstName")}
        id="contactPerson.firstName"
        required
        invalid={!!errors.contactPerson?.firstName?.type}
        errorText={applicationErrorText(
          t,
          errors.contactPerson?.firstName?.type,
          {
            count: 255,
          }
        )}
      />
      <TextInput
        {...register("contactPerson.lastName", {
          required: true,
          maxLength: 255,
        })}
        label={t("application:Page3.contactPerson.lastName")}
        id="contactPerson.lastName"
        required
        invalid={!!errors.contactPerson?.lastName?.type}
        errorText={applicationErrorText(
          t,
          errors.contactPerson?.lastName?.type,
          {
            count: 255,
          }
        )}
      />
      <TextInput
        {...register("contactPerson.phoneNumber", {
          required: true,
          maxLength: 255,
        })}
        label={t("application:Page3.contactPerson.phoneNumber")}
        id="contactPerson.phoneNumber"
        required
        invalid={!!errors.contactPerson?.phoneNumber?.type}
        errorText={applicationErrorText(
          t,
          errors.contactPerson?.phoneNumber?.type,
          {
            count: 255,
          }
        )}
      />
      <EmailInput />
    </AutoGrid>
  );
};
