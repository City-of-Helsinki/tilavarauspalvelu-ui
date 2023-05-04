import React from "react";
import { isEmpty } from "lodash";
import { useTranslation } from "react-i18next";
import { TextInput } from "hds-react";
import { Action } from "./lists/Tags";

function NumberFilter<T>({
  id,
  value,
  dispatch,
}: {
  id: keyof T;
  value?: string;
  dispatch: React.Dispatch<Action<T>>;
}) {
  const { t } = useTranslation();

  return (
    <TextInput
      id={String(id)}
      label=" "
      onChange={(e) => {
        if (e.target.value.length > 0) {
          dispatch({
            type: "set",
            // FIXME typescript
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            value: { [id]: e.target.value },
          });
        } else {
          dispatch({
            type: "deleteTag",
            field: id,
          });
        }
      }}
      value={value || ""}
      placeholder={t(`ReservationUnitsSearch.${String(id)}PlaceHolder`)}
      errorText={
        !isEmpty(value) && Number.isNaN(Number(value))
          ? t("ReservationUnitsSearch.notANumber")
          : undefined
      }
    />
  );
}

export default NumberFilter;
