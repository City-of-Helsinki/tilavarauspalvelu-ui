import React from "react";
import { isEmpty } from "lodash";
import { useTranslation } from "react-i18next";
import { TextInput } from "hds-react";

function NumberFilter({
  id,
  value,
  onReset,
  onValueChange,
}: {
  id: string;
  value?: string;
  onReset: () => void;
  onValueChange: (val: string) => void;
}) {
  const { t } = useTranslation();

  return (
    <TextInput
      id={id}
      label=" "
      onChange={(e) => {
        if (e.target.value.length > 0) {
          onValueChange(e.target.value);
        } else {
          onReset();
        }
      }}
      value={value || ""}
      placeholder={t(`ReservationUnitsSearch.${id}PlaceHolder`)}
      errorText={
        !isEmpty(value) && Number.isNaN(Number(value))
          ? t("ReservationUnitsSearch.notANumber")
          : undefined
      }
    />
  );
}

export default NumberFilter;
