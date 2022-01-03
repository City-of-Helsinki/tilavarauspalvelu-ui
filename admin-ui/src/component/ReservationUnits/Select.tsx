import React from "react";
import { Select as HDSSelect } from "hds-react";
import styled from "styled-components";
import { OptionType } from "../../common/types";

const StyledSelect = styled(HDSSelect)`
  padding-bottom: var(--spacing-m);
`;
const getSelectedOption = (options: OptionType[], value: string | number) =>
  options.find((o) => o.value === value) || {};

const Select = ({
  id,
  label,
  onChange,
  required = false,
  value,
  options,
  placeholder,
  helper,
}: {
  id: string;
  label: string;
  required?: boolean;
  value: string | number;
  onChange: (value: string) => void;
  options: OptionType[];
  placeholder?: string;
  helper?: string;
}): JSX.Element => {
  return (
    <StyledSelect
      id={id}
      label={label}
      placeholder={placeholder}
      options={options}
      required={required}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      onChange={(e: any) => onChange(e.value)}
      disabled={options.length === 0}
      helper={helper}
      value={getSelectedOption(options, value)}
    />
  );
};

export default Select;
