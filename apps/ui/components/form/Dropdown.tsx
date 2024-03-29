import React from "react";
import { useTranslation } from "next-i18next";
import styled from "styled-components";
import { breakpoints } from "common/src/common/style";

interface Props {
  children: React.ReactNode;
  isOpen: boolean;
  onClear: () => void;
}

const Wrapper = styled.div`
  position: absolute;
  width: 100%;
  background: var(--color-white);
  color: var(--color-black);
  box-shadow: 0 0 8px 0 rgba(0, 0, 0, 0.2);
  z-index: 1;

  input {
    box-sizing: border-box;
  }

  @media (min-width: ${breakpoints.m}) {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    z-index: 2;
  }
`;

const Menu = styled.div`
  max-height: 18.35rem;
  overflow: auto;
`;

const ClearButton = styled.button`
  &:focus {
    outline: 2px solid var(--color-black);
    outline-offset: 0;
  }

  cursor: pointer;
  background: transparent;
  border: none;
  border-top: 1px solid var(--color-silver);
  width: 100%;
  padding: 1rem;
  color: var(--color-black-90);
`;

const Dropdown: React.FC<Props> = ({ children, isOpen, onClear }) => {
  const { t } = useTranslation("forms");

  if (!isOpen) return null;

  return (
    <Wrapper>
      <Menu>{children}</Menu>
      <ClearButton onClick={onClear} type="button">
        {t("clearSelection")}
      </ClearButton>
    </Wrapper>
  );
};

export default Dropdown;
