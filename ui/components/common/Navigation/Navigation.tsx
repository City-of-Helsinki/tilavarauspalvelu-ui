import React from "react";
import styled from "styled-components";
import { Navigation as HDSNavigation } from "hds-react";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import { MenuItem, NavigationMenu } from "./NavigationMenu";
import { NavigationUserMenu } from "./NavigationUserMenu/NavigationUserMenu";
import { NavigationLanguageSelection } from "./NavigationLanguageSelection";

const StyledNavigation = styled(HDSNavigation)`
  color: ${(props) => props.theme.colors.black.medium};
  min-width: ${(props) => props.theme.breakpoints.xs};

  /* .btn-logout {
    display: flex;
    margin-top: var(--spacing-m);
    cursor: pointer;
  }*/

  #languageSelector-menu {
    right: 0;
    left: unset;
  }

  @media (max-width: ${(props) => props.theme.breakpoints.xs}) {
    position: fixed !important;
    z-index: ${(props) => props.theme.zIndex.navigation} !important;
  }

  /* @media (max-width:${(props) => props.theme.breakpoints.m}) {
    .navigation__language-selector--button {
      position: absolute;
      right: var(--spacing-layout-l);
    }
  } */
`;

const menuItems: MenuItem[] = [
  {
    title: "reservationUnitSearch",
    path: "/search/single",
  },
  {
    title: "spaceReservation",
    path: "/recurring",
  },
];

const Navigation = () => {
  const { t } = useTranslation();
  const router = useRouter();

  const handleNavigationTitleClick = () => router.push("/");

  return (
    <StyledNavigation
      title={t("common:applicationName")}
      onTitleClick={handleNavigationTitleClick}
      menuToggleAriaLabel="Menu"
      skipTo="main"
      skipToContentLabel="Siirry sivun pääsisältöön"
    >
      <NavigationMenu menuItems={menuItems} />
      <HDSNavigation.Actions>
        <NavigationUserMenu />
        <NavigationLanguageSelection />
      </HDSNavigation.Actions>
    </StyledNavigation>
  );
};
export { Navigation };
