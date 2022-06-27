import React from "react";
import { useTranslation } from "react-i18next";
import SortedSelect from "./SortedSelect";

type OptionType = {
  label: string;
  value: string;
};

function selectedOptions(
  value: string | string[],
  options: OptionType[]
): OptionType | OptionType[] | "" {
  if (Array.isArray(value)) {
    return options.filter((o) => value.includes(o.value));
  }
  return options.find((o) => o.value === value) || "";
}

const EnumSelect = ({
  id,
  label,
  onChange,
  required = false,
  disabled = false,
  placeholder,
  value,
  type,
  errorText,
  sort = false,
  multiselect = false,
}: {
  id: string;
  label: string;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  value: string | string[];
  onChange: (value: string | string[]) => void;
  type: { [key: string]: string };
  errorText?: string;
  sort?: boolean;
  multiselect?: boolean;
}): JSX.Element => {
  const { t } = useTranslation();
  console.log("multiselect", multiselect);

  const options: OptionType[] = Object.keys(type).map((key) => ({
    value: type[key],
    label: t(`${id}.${type[key]}`),
  }));

  return (
    <SortedSelect
      label={label}
      required={required}
      options={options}
      placeholder={placeholder}
      disabled={disabled}
      value={selectedOptions(value, options)}
      id={id}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      onChange={(e: any) => {
        onChange(e.value);
      }}
      error={errorText}
      invalid={!!errorText}
      sort={sort}
    />
  );
};

export default EnumSelect;
