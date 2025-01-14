import { useTranslation } from "react-i18next";
import { signIn, signOut } from "common/src/browserHelpers";
import { useSession } from "@/hooks/auth";
import {
  Header,
  IconSignout,
  IconStar,
  IconUser,
  LogoSize,
  TitleStyleType,
} from "hds-react";
import React from "react";
import styled from "styled-components";
import { useLocation, useNavigate } from "react-router-dom";
import useHandling from "@/hooks/useHandling";
import Logo from "common/src/components/Logo";
import { hasSomePermission } from "@/modules/permissionHelper";
import { env } from "@/env.mjs";
import {
  allReservationsUrl,
  applicationRoundsUrl,
  bannerNotificationsUrl,
  myUnitsUrl,
  requestedReservationsUrl,
  reservationUnitsUrl,
  reservationsUrl,
  unitsUrl,
  singleUnitUrl,
} from "@/common/urls";
import { CurrentUserQuery, UserPermissionChoice } from "@gql/gql-types";
import { filterNonNullable } from "common/src/helpers";
import { headerCss } from "common/src/components/Navigation";

type Props = {
  apiBaseUrl: string;
};

const StyledHeader = styled(Header)`
  ${headerCss}
`;

const NavigationMenuWrapper = styled.div`
  span:has(.active) {
    font-weight: bold !important;

    /* using box-shadow for a bottom border inside of the element, without affecting text positioning */
    box-shadow: 0 -4px 0 0 var(--color-black) inset;
  }
`;

interface IMenuChild {
  title: string;
  icon?: JSX.Element;
  routes?: string[];
  excludeRoutes?: string[];
  exact?: boolean;
}

function getFilteredMenu(
  hasOwnUnits: boolean,
  hasPermission: (perm: UserPermissionChoice, onlyGeneral?: boolean) => boolean
): IMenuChild[] {
  const menuItems: IMenuChild[] = [];
  if (hasOwnUnits) {
    menuItems.push({
      title: "MainMenu.myUnits",
      icon: <IconStar aria-hidden />,
      routes: [myUnitsUrl],
    });
  }
  if (
    hasPermission(UserPermissionChoice.CanViewReservations) ||
    hasPermission(UserPermissionChoice.CanCreateStaffReservations)
  ) {
    menuItems.push(
      {
        title: "MainMenu.requestedReservations",
        routes: [requestedReservationsUrl],
        exact: true,
      },
      {
        title: "MainMenu.allReservations",
        routes: [allReservationsUrl, reservationsUrl],
        excludeRoutes: [requestedReservationsUrl],
      }
    );
  }
  // NOTE: this is shown even if there are no application rounds accessible for this user
  // i.e. they have the permission to a unit that is not on any application round
  if (hasPermission(UserPermissionChoice.CanViewApplications)) {
    menuItems.push({
      title: "MainMenu.applicationRounds",
      routes: [applicationRoundsUrl],
    });
  }
  if (hasPermission(UserPermissionChoice.CanManageReservationUnits)) {
    menuItems.push(
      {
        title: "MainMenu.reservationUnits",
        routes: [reservationUnitsUrl],
      },
      {
        title: "MainMenu.units",
        routes: [unitsUrl, singleUnitUrl],
      }
    );
  }
  if (hasPermission(UserPermissionChoice.CanManageNotifications, true)) {
    menuItems.push({
      title: "MainMenu.notifications",
      routes: [bannerNotificationsUrl],
    });
  }
  return menuItems;
}

function checkActive(
  pathname: string,
  routes: string[],
  exact: boolean,
  exclude?: string[]
) {
  if (exclude?.includes(pathname)) {
    return false;
  }
  return routes.some((route) =>
    exact ? pathname === route : pathname.startsWith(route)
  );
}

type NavigationLinkProps = {
  title: string;
  // Active check requires multiple routes
  // TODO split the active check either to a callback function / separate prop /
  // provide both a single route and an array of routes
  routes: string[];
  exact?: boolean;
  exclude?: string[];
  count?: number;
};

function NavigationLink({
  title,
  routes,
  exact,
  exclude,
  count,
}: NavigationLinkProps) {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const route = routes.find(() => true);
  if (!route) {
    return null;
  }
  const shouldDisplayCount =
    title === "MainMenu.requestedReservations" && count && count > 0;

  const handleClick = (evt: React.MouseEvent<HTMLAnchorElement>) => {
    evt.preventDefault();
    if (!routes) return;
    // NOTE: this is a workaround for the HDS Header component not closing the mobile menu on navigation, if there isn't a page reload
    // TODO: remove this when HDS Header is fixed
    document.getElementById("Menu")?.querySelector("button")?.click();
    navigate(routes[0]);
  };

  const href = `/kasittely${route}`;
  const isActive = checkActive(pathname, routes, exact ?? false, exclude)
  const className = isActive ? "active" : ""

  // Bubble is only available for ActionBarSubMenu, but that is a <li> element
  // nesting multiple <li> elements without a parent <ul> is invalid HTML
  // so we have to create a fake <ul> for this
  // FIXME can't be done like this because it breaks the mobile menu
  // have to do some custom magic instead reusing the bubble doesn't seem reasonable
  if (shouldDisplayCount) {
    return (
      // <ul style={{ listStyle: "none", padding: 0 }}>
        <Header.ActionBarSubItem
          key={route}
          onClick={handleClick}
          href={href}
          label={t(title)}
          className={className}
          notificationBubbleAriaLabel={"Määrä"}
          notificationBubbleContent={count.toString()}
        />
      // </ul>
    );
  }

  return (
    <Header.Link
      key={route}
      onClick={handleClick}
      href={href}
      label={t(title)}
      className={className}
    />
  );
}

export function Navigation({ apiBaseUrl }: Props) {
  const { user } = useSession();
  const { handlingCount, hasOwnUnits } = useHandling();

  const hasPerms = (perm: UserPermissionChoice, onlyGeneral?: boolean) => {
    return hasSomePermission(user, perm, onlyGeneral);
  };
  const menuItemList = filterNonNullable(getFilteredMenu(hasOwnUnits, hasPerms))

  if (!user) {
    return null;
  }

  return (
    <StyledHeader $isAdmin>
      <ActionBar apiBaseUrl={apiBaseUrl} user={user} />
      <NavigationMenuWrapper>
        <Header.NavigationMenu>
          {menuItemList.map((item) => (
            <NavigationLink
              key={item.routes && item.routes[0]}
              title={item.title}
              routes={item.routes ?? []}
              exact={item.exact}
              exclude={item.excludeRoutes}
              count={handlingCount}
            />
          ))}
        </Header.NavigationMenu>
      </NavigationMenuWrapper>
    </StyledHeader>
  );
}

// TODO move this to base navigation component
function ActionBar({
  apiBaseUrl,
  user,
}: {
  apiBaseUrl: string;
    // TODO narrow down the type
  user: CurrentUserQuery["currentUser"];
}) {
  const { t } = useTranslation();
  const firstName = user?.firstName?.trim() ?? "";
  const lastName = user?.lastName?.trim() ?? "";
  const name = `${firstName} ${lastName}`.trim() || t("Navigation.noName");

  const baseUrl = env.NEXT_PUBLIC_BASE_URL;
  return (
      <Header.ActionBar
        title={t("common:applicationName")}
        titleAriaLabel={t("common:applicationName")}
        frontPageLabel={t("common:gotoFrontpage")}
        titleStyle={TitleStyleType.Bold}
        titleHref={baseUrl ?? "/"}
        openFrontPageLinksAriaLabel={t("common:applicationName")}
        logo={<Logo size={LogoSize.Large} style={{ filter: "invert(1)" }} />}
        logoAriaLabel={`${t("common:applicationName")} logo`}
        logoHref={baseUrl}
      >
        {user ? (
          <Header.ActionBarItem
            id="user-menu"
            label={name}
            icon={<IconUser />}
            fixedRightPosition
          >
            <Header.ActionBarButton
              label={
                <>
                  <span>{t("Navigation.logout")}</span>
                  <IconSignout />
                </>
              }
              onClick={() => signOut(apiBaseUrl, baseUrl)}
            />
          </Header.ActionBarItem>
        ) : (
          <Header.ActionBarButton
            label={t("Navigation.login")}
            onClick={() => signIn(apiBaseUrl)}
          />
        )}
      </Header.ActionBar>
  );
}
