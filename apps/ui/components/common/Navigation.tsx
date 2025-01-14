import React from "react";
import {
  Header,
  IconKey,
  IconLinkExternal,
  IconSignout,
  IconUser,
  type LanguageOption,
  LogoSize,
  TitleStyleType,
} from "hds-react";
import { useTranslation } from "next-i18next";
import styled from "styled-components";
import { useSession } from "@/hooks/auth";
import { type CurrentUserQuery } from "@gql/gql-types";
import Logo from "common/src/components/Logo";
import { useRouter } from "next/router";
import { useLocation } from "react-use";
import { signIn, signOut } from "common/src/browserHelpers";
import { filterNonNullable, getLocalizationLang } from "common/src/helpers";
import { env } from "@/env.mjs";
import {
  applicationsPrefix,
  reservationsPrefix,
  reservationUnitPrefix,
  seasonalPrefix,
  singleSearchPrefix,
} from "@/modules/urls";
import { headerCss } from "common/src/components/Navigation";

const StyledHeader = styled(Header)`
  ${headerCss}
`;

const menuItems = [
  {
    label: "navigation:Item.home",
    routes: ["/"],
    exact: true,
  },
  {
    label: "navigation:Item.reservationUnitSearch",
    routes: [singleSearchPrefix, reservationUnitPrefix],
  },
  {
    label: "navigation:Item.spaceReservation",
    routes: [seasonalPrefix],
  },
  {
    label: "navigation:Item.reservations",
    routes: [reservationsPrefix],
    requireLogin: true,
  },
  {
    label: "navigation:Item.applications",
    routes: [applicationsPrefix],
    requireLogin: true,
  },
];

function constructName(firstName?: string, lastName?: string) {
  if (firstName && lastName) {
    return `${firstName} ${lastName}`;
  }
  if (firstName) {
    return firstName;
  }
  if (lastName) {
    return lastName;
  }
  return undefined;
}

function checkActive(pathname: string, routes: string[], exact?: boolean) {
  return routes.some((route) =>
    exact ? pathname === route : pathname.startsWith(route)
  );
}

function NavigationMenu({ user }: { user: CurrentUserQuery["currentUser"] }) {
  const { t, i18n } = useTranslation();
  const { pathname } = useLocation();
  const router = useRouter();

  const items = filterNonNullable( menuItems.filter((x) => !x.requireLogin || user).map((item) => {
        const route = item.routes.find(() => true);
        if (!route) {
          return null;
        }
        const lang = getLocalizationLang(i18n.language);
        const localisationString = lang === "fi" ? "" : lang;
        const href = getLocalizationLang(i18n.language) === "fi"
          ? route
          : `/${localisationString}${route}`
        const isActive = pathname != null ? checkActive(pathname, item.routes, item.exact) : false;
        const className=isActive ? "active" : ""
    return {
      href,
      className,
      label: t(item.label),
      key: item.label,
    };
  }));

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    router.push(e.currentTarget.href);
  };

  return (
    <Header.NavigationMenu>
      {items.map((item) => (
        <Header.Link
          key={item.key}
          label={item.label}
          href={item.href}
          onClick={handleClick}
          className={item.className}
        />
      ))}
    </Header.NavigationMenu>
  );
}

type HeaderProps = {
  apiBaseUrl: string;
  profileLink: string;
  languageOptions?: LanguageOption[];
  baseUrl: string | undefined;
  user: CurrentUserQuery["currentUser"];
};

function ActionBar({
  apiBaseUrl,
  profileLink,
  languageOptions,
  user,
  baseUrl,
}: HeaderProps) {
  const { t } = useTranslation();
  const { firstName, lastName } = user ?? {};

  const isAuthenticated = user != null;
  const userName = constructName(firstName, lastName) ?? t("navigation:userNoName");
  return (
    <Header.ActionBar
      title={t("common:applicationName")}
      titleAriaLabel={t("common:applicationName")}
      frontPageLabel={t("common:gotoFrontpage")}
      titleStyle={TitleStyleType.Bold}
      titleHref={baseUrl ?? "/"}
      openFrontPageLinksAriaLabel={t("common:applicationName")}
      logo={<Logo size={LogoSize.Large} />}
      logoAriaLabel={`${t("common:applicationName")} logo`}
      logoHref={baseUrl}
      menuButtonLabel="Menu"
    >
      <Header.LanguageSelector
        languages={languageOptions}
        ariaLabel={t("navigation:languageSelection")}
      />
      {isAuthenticated ? (
        <Header.ActionBarItem
          fixedRightPosition
          id="user-menu"
          label={userName}
          icon={<IconUser />}
        >
          {!user?.isAdAuthenticated && (
            <a href={profileLink} target="_blank" rel="noopener norreferrer">
              {t("navigation:profileLinkLabel")}
              <IconLinkExternal />
            </a>
          )}
          <Header.ActionBarButton
            label={
              <>
                <span>{t("common:logout")}</span>
                <IconSignout />
              </>
            }
            onClick={() => signOut(apiBaseUrl)}
          />
        </Header.ActionBarItem>
      ) : (
        <Header.ActionBarButton
          fixedRightPosition
          label={t("common:login")}
          onClick={(e) => {
            e.preventDefault();
            signIn(apiBaseUrl);
          }}
          id="login"
          icon={<IconKey />}
        />
      )}
    </Header.ActionBar>
  );
}

function Navigation({ apiBaseUrl, profileLink }: Pick<HeaderProps, "apiBaseUrl" | "profileLink">) {
  const { t, i18n } = useTranslation();
  const { user } = useSession();
  const router = useRouter();
  const baseUrl = env.NEXT_PUBLIC_BASE_URL;

  const languageOptions: LanguageOption[] = [
    { label: t("navigation:languages.fi"), value: getLocalizationLang("fi") },
    { label: t("navigation:languages.sv"), value: getLocalizationLang("sv") },
    { label: t("navigation:languages.en"), value: getLocalizationLang("en") },
  ];

  const languageChangeHandler = (language: string) => {
    i18n.changeLanguage(language);
    router.push(router.pathname, router.asPath, { locale: language });
  };

  return (
      <StyledHeader
        onDidChangeLanguage={languageChangeHandler}
        defaultLanguage={router.locale}
        languages={languageOptions}
      >
        <ActionBar
          apiBaseUrl={apiBaseUrl}
          profileLink={profileLink}
          languageOptions={languageOptions}
          user={user}
          baseUrl={baseUrl}
        />
        <NavigationMenu user={user} />
      </StyledHeader>
  );
}

export default Navigation;
