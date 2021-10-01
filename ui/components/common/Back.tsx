import { Button as HDSButton, IconArrowLeft } from "hds-react";
import React from "react";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import styled from "styled-components";

const Button = styled(HDSButton).attrs({
  style: {
    "--color-bus": "var(--color-black)",
  } as React.CSSProperties,
})`
  font-size: var(--fontsize-body-l);
  margin-left: 0;
  padding-left: 0;
  color: black;

  && div {
    margin-left: 0;
    padding-left: 0;
  }
`;

type Props = {
  link?: string;
  label?: string;
};

const Back = ({ link, label = "common:prev" }: Props): JSX.Element => {
  const { t } = useTranslation();
  const { back, push } = useRouter();

  return (
    <Button
      aria-label={t(label)}
      variant="supplementary"
      type="button"
      iconLeft={<IconArrowLeft />}
      onClick={
        link
          ? () => {
              push(link);
            }
          : () => {
              back();
            }
      }
    >
      {t(label)}
    </Button>
  );
};

export default Back;
