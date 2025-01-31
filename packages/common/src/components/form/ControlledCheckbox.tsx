import React from "react";
import { Checkbox } from "hds-react";
import styled from "styled-components";
import { fontRegular } from "../../common/typography";
import { Control, FieldValues, useController } from "react-hook-form";

const StyledCheckbox = styled(Checkbox)`
  && label {
    ${fontRegular};
    line-height: var(--lineheight-l);

    a {
      text-decoration: underline;
      color: var(--color-black);
    }
  }
`;

type Props = {
  id?: string;
  name: string;
  label: string;
  control: Control<FieldValues, boolean>;
  required?: boolean;
  defaultValue?: boolean;
  error?: string;
};

export function ControlledCheckbox({
  id,
  control,
  name,
  required,
  defaultValue,
  ...props
}: Props) {
  const {
    field: { value, onChange },
  } = useController({ control, name, defaultValue, rules: { required } });

  return (
    <StyledCheckbox
      id={id ?? name}
      onChange={(e) => onChange(e.target.checked)}
      checked={value}
      defaultChecked={defaultValue}
      label={props.label}
      errorText={props.error}
    />
  );
}
