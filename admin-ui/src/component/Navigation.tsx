import React, { useState } from "react";
import { Navigation as HDSNavigation } from "hds-react";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import { useHistory } from "react-router-dom";
import MainMenu from "./MainMenu";
import { useAuthState } from "../context/AuthStateContext";
import { breakpoints, StyledHDSNavigation } from "../styles/util";

const MobileNavigation = styled.div`
  @media (min-width: ${breakpoints.m}) {
    display: none;
  }
`;

const StyledNavigationItem = styled(HDSNavigation.Item)`
  :hover {
    cursor: default;
    background: var(--color-white);
    color: var(--color-black);
  }
  border: 0;
  span {
    padding: 0 0 var(--spacing-s) var(--spacing-m) !important;
    color: black;
    display: block;
    width: 100%;
  }

  @media (min-width: ${breakpoints.m}) {
    span {
      padding: 0 !important;
    }
  }
`;

const Name = styled.div`
  word-break: break-all;
  display: none;
  @media (min-width: ${breakpoints.m}) {
    display: block;
  }
`;
const Email = styled.div`
  font-size: var(--fontsize-body-s);
  word-break: break-all;
  display: block;
  width: 100%;
  @media (min-width: ${breakpoints.m}) {
    padding-bottom: var(--spacing-xs);
    border-bottom: 1px solid var(--color-black-20);
  }
`;

const UserMenu = styled(HDSNavigation.User)`
  svg {
    &:first-of-type {
      margin-right: var(--spacing-3-xs);
    }
  }

  a {
    cursor: pointer;
  }

  #userDropdown-menu {
    right: 0;
    left: auto;
  }
`;

const Navigation = (): JSX.Element => {
  const { t } = useTranslation();
  const { authState } = useAuthState();

  const [loggingIn, setLoggingIn] = useState(false);

  const [isMenuOpen, setMenuState] = useState(false);
  const history = useHistory();

  const { state, user, login, logout } = authState;

  return (
    <StyledHDSNavigation
      theme={{
        "--header-background-color":
          "var(--tilavaraus-admin-header-background-color)",
        "--header-color": "var(--tilavaraus-admin-header-color)",
      }}
      title={t("common.applicationName")}
      menuToggleAriaLabel="Menu"
      skipTo="#main"
      skipToContentLabel={t("Navigation.skipToMainContent")}
      onTitleClick={() => history.push("/")}
      onMenuToggle={() => setMenuState(!isMenuOpen)}
      menuOpen={isMenuOpen}
    >
      <HDSNavigation.Actions>
        <MobileNavigation>
          <MainMenu
            placement="navigation"
            onItemSelection={() => setMenuState(false)}
          />
        </MobileNavigation>
        {state !== "Unknown" && (
          <UserMenu
            userName={`${user?.firstName || ""} ${user?.lastName || ""}`.trim()}
            authenticated={state === "HasPermissions"}
            label={t(loggingIn ? "Navigation.logging" : "Navigation.login")}
            onSignIn={() => {
              setLoggingIn(true);
              if (login) {
                setLoggingIn(true);
                login();
              } else {
                throw Error("cannot log in");
              }
            }}
          >
            {user && (
              <StyledNavigationItem variant="secondary">
                <Name>
                  {`${user.firstName} ${user.lastName}`.trim() ||
                    t("Navigation.noName")}
                </Name>
                <Email>{user?.email}</Email>
              </StyledNavigationItem>
            )}

            <HDSNavigation.Item
              label={t("Navigation.logout")}
              onClick={() => logout && logout()}
              variant="primary"
            />
          </UserMenu>
        )}
      </HDSNavigation.Actions>
    </StyledHDSNavigation>
  );
};

export default Navigation;
