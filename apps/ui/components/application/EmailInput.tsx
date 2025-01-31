import React from "react";
import { useTranslation } from "next-i18next";
import { useFormContext } from "react-hook-form";
import { Notification, NotificationSize, TextInput } from "hds-react";
import { applicationErrorText } from "@/modules/util";
import type { ApplicationFormPage3Values } from "./Form";
import { SpanTwoColumns } from "./styled";

const EmailInput = () => {
  const { t } = useTranslation();

  const {
    register,
    formState: { errors },
  } = useFormContext<ApplicationFormPage3Values>();

  return (
    <>
      <SpanTwoColumns>
        <Notification
          size={NotificationSize.Small}
          label={t("application:Page3.emailNotification")}
        >
          {t("application:Page3.emailNotification")}
        </Notification>
      </SpanTwoColumns>
      <TextInput
        {...register("contactPerson.email", {
          required: true,
          maxLength: 254,
          pattern:
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        })}
        label={t("application:Page3.email")}
        id="contactPerson.email"
        name="contactPerson.email"
        type="email"
        required
        invalid={!!errors.contactPerson?.email?.type}
        errorText={applicationErrorText(t, errors.contactPerson?.email?.type, {
          count: 254,
        })}
      />
    </>
  );
};

export { EmailInput };
