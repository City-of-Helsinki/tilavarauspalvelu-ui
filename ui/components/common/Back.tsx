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
  font-family: var(--font-regular);
  font-weight: 300;
  margin-left: 0;
  padding-left: 0;
  color: black;

  && div {
    margin-left: 0;
    padding-left: 0;
  }
`;

type Props = {
  label?: string;
};

const Back = ({ label = "common:prev" }: Props): JSX.Element => {
  const { t } = useTranslation();
  const router = useRouter();

  return (
    <Button
      aria-label={t(label)}
      variant="supplementary"
      type="button"
      iconLeft={<IconArrowLeft />}
      onClick={() => router.back()}
    >
      {t(label)}
    </Button>
  );
};

export default Back;
