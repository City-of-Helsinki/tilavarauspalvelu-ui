import React from "react";
import { ErrorSummary } from "hds-react";
import Joi from "joi";
import { useTranslation } from "react-i18next";

type Props = {
  validationErrors: Joi.ValidationResult | null;
};

const FormErrorSummary = ({ validationErrors }: Props): JSX.Element | null => {
  const { t } = useTranslation();

  if (!validationErrors) {
    return null;
  }

  return (
    <ErrorSummary label={t("SpaceEditor.errorSummary")} autofocus>
      <ul>
        {validationErrors.error?.details.map((error) => (
          <li key={String(error.path)}>
            <a href="#surfaceArea">{t(`SpaceEditor.label.${error.path}`)}</a>
            {": "}
            {t(`validation.${error.type}`, { ...error.context })}
          </li>
        ))}
      </ul>
    </ErrorSummary>
  );
};

export default FormErrorSummary;
