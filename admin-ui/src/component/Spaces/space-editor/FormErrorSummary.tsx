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
    <ErrorSummary label={t("FormErrorSummary.label")} autofocus>
      <ul>
        {validationErrors.error?.details.map((error, index) => (
          <li key={String(error.path)}>
            <a href={`#${error.path}`}>
              {t(`FormErrorSummary.errorLabel`, { index: index + 1 })}
            </a>
            {": "}
            {t(`validation.${error.type}`, {
              ...error.context,
              fieldName: t(`SpaceEditor.label.${error.path}`),
            })}
          </li>
        ))}
      </ul>
    </ErrorSummary>
  );
};

export default FormErrorSummary;
