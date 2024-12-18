import React from "react";
import { useTranslation } from "next-i18next";
import styled from "styled-components";
import { fontMedium, H4 } from "common/src/common/typography";
import type {
  Maybe,
  UnitNode,
  LocationFieldsI18nFragment,
  ReservationUnitPageQuery,
} from "@gql/gql-types";
import { IconLinkExternal } from "hds-react";
import { IconButton } from "common/src/components";
import { mapUrlPrefix } from "@/modules/const";
import { getTranslation } from "@/modules/util";
import { Flex } from "common/styles/util";

type QueryT = NonNullable<ReservationUnitPageQuery["reservationUnit"]>;
type NodeT = Pick<QueryT, "unit">;
type Props = {
  reservationUnit: NodeT;
};

const AddressSpan = styled.span`
  font-size: var(--fontsize-body-l);
`;

const Links = styled(Flex).attrs({
  $gap: "xs",
  $marginTop: "m",
})`
  ${fontMedium}

  /* IconButton includes too much padding */
  && > * > * {
    margin: 0;
  }
`;

/// Common type for url constructors
/// Always returns a string, but can be empty => empty url is rendered as a disabled link
type UrlReturn = string;

function createHslUrl(
  locale: string,
  location?: Maybe<LocationFieldsI18nFragment>
): UrlReturn {
  if (!location) {
    return "";
  }

  const addressStreet =
    getTranslation(location, "addressStreet") || location.addressStreetFi;
  const addressCity =
    getTranslation(location, "addressCity") || location.addressCityFi;

  const destination = addressStreet
    ? encodeURI(`${addressStreet},${addressCity}`)
    : "-";

  return `https://reittiopas.hsl.fi/reitti/-/${destination}/?locale=${locale}`;
}

function createGoogleUrl(
  locale: string,
  location?: Maybe<LocationFieldsI18nFragment>
): UrlReturn {
  if (!location) {
    return "";
  }

  const addressStreet =
    getTranslation(location, "addressStreet") || location.addressStreetFi;
  const addressCity =
    getTranslation(location, "addressCity") || location.addressCityFi;

  const destination = addressStreet
    ? encodeURI(`${addressStreet},${addressCity}`)
    : "";

  return `https://www.google.com/maps/dir/?api=1&hl=${locale}&destination=${destination}`;
}

function createMapUrl(
  locale: string,
  unit?: Maybe<Pick<UnitNode, "tprekId">>
): string {
  if (!unit?.tprekId) {
    return "";
  }

  return `${mapUrlPrefix}${locale}/unit/${unit.tprekId}`;
}

function createAccessibilityUrl(
  locale: string,
  unit?: Maybe<Pick<UnitNode, "tprekId">>
): UrlReturn {
  if (!unit?.tprekId) {
    return "";
  }

  return `https://palvelukartta.hel.fi/${locale}/unit/${unit.tprekId}?p=1&t=accessibilityDetails`;
}

export function AddressSection({ reservationUnit }: Props): JSX.Element {
  const { t, i18n } = useTranslation();

  const { location } = reservationUnit.unit ?? {};
  const addressStreet =
    (location && getTranslation(location, "addressStreet")) ||
    location?.addressStreetFi;
  const addressCity =
    (location && getTranslation(location, "addressCity")) ||
    location?.addressCityFi;

  const unitMapUrl = createMapUrl(i18n.language, reservationUnit?.unit);
  const googleUrl = createGoogleUrl(i18n.language, location);
  const hslUrl = createHslUrl(i18n.language, location);
  const accessibilityUrl = createAccessibilityUrl(
    i18n.language,
    reservationUnit.unit
  );

  return (
    <div data-testid="reservation-unit__address--container">
      <H4 as="h2">{getTranslation(reservationUnit, "name")}</H4>
      {addressStreet && <AddressSpan>{addressStreet}</AddressSpan>}
      {location?.addressZip && addressCity && (
        <AddressSpan>{`, ${location?.addressZip} ${addressCity}`}</AddressSpan>
      )}
      <Links>
        <IconButton
          href={unitMapUrl}
          label={t("reservationUnit:linkMap")}
          icon={<IconLinkExternal aria-hidden />}
        />
        <IconButton
          href={googleUrl}
          label={t("reservationUnit:linkGoogle")}
          icon={<IconLinkExternal aria-hidden />}
        />
        <IconButton
          href={hslUrl}
          label={t("reservationUnit:linkHSL")}
          icon={<IconLinkExternal aria-hidden />}
        />
        <IconButton
          href={accessibilityUrl}
          label={t("reservationUnit:linkAccessibility")}
          icon={<IconLinkExternal aria-hidden />}
        />
      </Links>
    </div>
  );
}
