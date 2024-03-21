import React from "react";
import { Select } from "hds-react";
import { useTranslation } from "next-i18next";
import { Controller, useForm } from "react-hook-form";
import { OptionType } from "common/types/common";
import { getSelectedOption } from "@/modules/util";
import styled from "styled-components";

const StyledSelect = styled(Select)`
  button:disabled span {
    color: var(--color-black-40);
  }
`;

type Props = {
  name: string;
  label: string;
  control: ReturnType<typeof useForm>["control"];
  options: OptionType[];
  required?: boolean;
  disabled?: boolean;
  error?: string;
  validate?: { [key: string]: (val: string) => boolean };
  placeholder?: string;
};
const ControlledSelect = ({
  name,
  label,
  control,
  required,
  options,
  error,
  disabled,
  validate,
  placeholder,
}: Props): JSX.Element => {
  const { t } = useTranslation();
  return (
    <Controller
      control={control}
      name={name}
      rules={{ required, validate }}
      render={({ field }) => {
        const currentValue = getSelectedOption(field.value, options) ?? {
          label: "",
          value: "",
        };
        return (
          <StyledSelect
            id={name}
            value={currentValue}
            placeholder={placeholder ?? t("common:select")}
            options={options}
            label={label}
            required={required ?? false}
            disabled={disabled ?? false}
            onChange={(selected: OptionType | unknown): void =>
              field.onChange((selected as OptionType).value)
            }
            invalid={Boolean(error)}
            error={error}
          />
        );
      }}
    />
  );
};

export default ControlledSelect;
