import { Navigation as HDSNavigation } from "hds-react";
import Link from "next/link";
import styled from "styled-components";

const NavigationMenuItem = styled(HDSNavigation.Item)`
  white-space: nowrap !important;
  font-family: "HelsinkiGrotesk-Medium" !important;
  font-weight: 500 !important;

  &.active {
    border-bottom-color: ${(props) =>
      props.theme.colors.blue.medium} !important;
    border-bottom-width: 4px !important;
    border-bottom-style: solid !important;
  }
`;

export { NavigationMenuItem };
