import { Dialog, Navigation } from "hds-react";
import styled from "styled-components";
import { Link } from "react-router-dom";

export const Seranwrap = styled.div`
  height: 200%;
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: var(--tilavaraus-admin-stack-seranwrap);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  background-color: black;
  opacity: 0.2;
`;

export const BasicLink = styled(Link)`
  color: var(--tilavaraus-admin-content-text-color);
  text-decoration: none;
  user-select: none;
  display: inline-flex;
  align-content: center;
  align-items: center;
  gap: var(--spacing-xs);
`;

export const StyledHDSNavigation = styled(Navigation)`
  --breakpoint-xl: 9000px;
  z-index: var(--tilavaraus-admin-stack-main-menu);
  .btn-logout {
    span {
      margin: 0;
    }
  }
`;

export const DialogActionsButtons = styled(Dialog.ActionButtons)`
  justify-content: space-between;
`;
