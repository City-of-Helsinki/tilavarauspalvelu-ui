import React from "react";
import { TextInput } from "hds-react";
import { useTranslation } from "next-i18next";
import { useFormContext } from "react-hook-form";
import { applicationErrorText } from "@/modules/util";
import {
  FormSubHeading,
  SpanTwoColumns,
  TwoColumnContainer,
} from "../common/common";
import { EmailInput } from "./EmailInput";
import { BillingAddress } from "./BillingAddress";
import type { ApplicationFormValues } from "./Form";

const IndividualForm = (): JSX.Element => {
  const { t } = useTranslation();

  const {
    register,
    formState: { errors },
  } = useFormContext<ApplicationFormValues>();

  return (
    <TwoColumnContainer>
      <FormSubHeading as="h2">
        {t("application:Page3.subHeading.basicInfo")}
      </FormSubHeading>
      <TextInput
        {...register("contactPerson.firstName", {
          required: true,
          maxLength: 255,
        })}
        label={t("application:Page3.firstName")}
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
        label={t("application:Page3.lastName")}
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
      <BillingAddress />
      <FormSubHeading as="h2">
        {t("application:Page3.subHeading.contactInfo")}
      </FormSubHeading>
      <TextInput
        {...register("contactPerson.phoneNumber", {
          required: true,
          maxLength: 255,
        })}
        label={t("application:Page3.phoneNumber")}
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
      <SpanTwoColumns>
        <TextInput
          {...register("additionalInformation", {
            required: false,
            maxLength: 255,
          })}
          label={t("application:Page3.additionalInformation")}
          id="additionalInformation"
          errorText={applicationErrorText(
            t,
            errors.additionalInformation?.type,
            {
              count: 255,
            }
          )}
        />
      </SpanTwoColumns>
      <EmailInput />
    </TwoColumnContainer>
  );
};

export { IndividualForm };
