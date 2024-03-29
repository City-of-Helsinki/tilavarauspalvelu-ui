import React from "react";
import { memoize } from "lodash";
import { Select as HDSSelect } from "hds-react";
import { OptionType } from "@/common/types";

type NullableStringOrNumber = string | number | null;

const getSelectedOption = (
  options: OptionType[],
  value: NullableStringOrNumber
): OptionType => {
  return options.find((o) => o.value === value) || ({} as OptionType);
};

/// @derprecated Use HDS select directly
const Select = ({
  id,
  label,
  onChange,
  required = false,
  value,
  options,
  placeholder,
  helper,
  errorText,
  sort = false,
  tooltipText,
  clearable = false,
}: {
  id: string;
  label: string;
  required?: boolean;
  value: NullableStringOrNumber;
  onChange: (value: NullableStringOrNumber) => void;
  options: OptionType[];
  placeholder?: string;
  helper?: string;
  errorText?: string;
  sort?: boolean;
  tooltipText?: string;
  clearable?: boolean;
}): JSX.Element => {
  const sortedOpts = memoize((originalOptions) => {
    const opts = [...originalOptions];
    if (sort) {
      opts.sort((a, b) =>
        a.label.toLowerCase().localeCompare(b.label.toLowerCase())
      );
    }
    return opts;
  })(options);

  return (
    <>
      <div id={id} style={{ display: "none" }} />
      <HDSSelect
        id={id}
        clearable={clearable}
        label={label}
        placeholder={placeholder}
        options={sortedOpts}
        required={required}
        onChange={(e: OptionType) => {
          if (e == null) {
            onChange(null);
            return;
          }
          onChange(e.value);
        }}
        disabled={options.length === 0}
        helper={helper}
        value={getSelectedOption(options, value)}
        error={errorText}
        invalid={!!errorText}
        tooltipText={tooltipText}
      />
    </>
  );
};

export { Select };
