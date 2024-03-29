import React, { Dispatch, SetStateAction } from "react";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import { Button as HDSButton } from "hds-react";
import { breakpoints } from "common/src/common/style";

interface ButtonT {
  key: string;
  text: string;
  callback?: () => void;
  disabled?: boolean;
}

interface IProps {
  buttons: ButtonT[];
  activeKey?: string;
  setActiveKey: Dispatch<SetStateAction<string>>;
  className?: string;
}

const Wrapper = styled.div`
  @media (min-width: ${breakpoints.m}) {
    white-space: nowrap;
  }
`;

const StyledButton = styled(HDSButton)<{ $active: boolean }>`
  --border-color: var(--color-black);
  --color-bus: ${({ $active }) =>
    $active ? "var(--color-black)" : "var(--color-white)"};
  --color: ${({ $active }) =>
    $active ? "var(--color-white)" : "var(--color-black)"};
  --color-focus: ${({ $active }) =>
    $active ? "var(--color-white)" : "var(--color-black)"};

  display: block;
  width: 100%;

  span {
    padding: var(--spacing-xs);
    margin: 0;
  }

  @media (min-width: ${breakpoints.s}) {
    display: inline-flex;
    width: auto;
  }
`;

function BigRadio({
  buttons,
  activeKey,
  setActiveKey,
  className,
}: IProps): JSX.Element {
  const activeButton = activeKey
    ? buttons.find((n) => n.key === activeKey)
    : buttons[0];

  const { t } = useTranslation();

  return (
    <Wrapper className={className}>
      {buttons.map((button) => (
        <StyledButton
          $active={activeButton?.key === button.key}
          key={button.key}
          onClick={() => {
            if (button.callback) button.callback();
            setActiveKey(button.key);
          }}
          disabled={button.disabled}
        >
          {t(button.text)}
        </StyledButton>
      ))}
    </Wrapper>
  );
}

export default BigRadio;
