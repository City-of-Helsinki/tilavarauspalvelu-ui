import React from "react";
import { useSearchParams } from "react-router-dom";
import { Select } from "hds-react";
import { memoize } from "lodash";

type SelectFilterProps = {
  name: string;
  label: string;
  options: { label: string; value: unknown }[];
  sort?: boolean;
  clearable?: boolean;
};

export function SelectFilter({
  name,
  options,
  label,
  sort,
  clearable,
}: SelectFilterProps) {
  const [searchParams, setParams] = useSearchParams();

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
    <Select
      label={label}
      id="isRecurring"
      options={sortedOpts}
      onChange={(val: string | number) => {
        const params = new URLSearchParams(searchParams);
        if (val != null) {
          params.set(name, val.toString());
        } else params.delete(name);
        setParams(params, { replace: true });
      }}
      value={new URLSearchParams(searchParams).get(name) ?? ""}
      clearable={clearable}
    />
  );
}
