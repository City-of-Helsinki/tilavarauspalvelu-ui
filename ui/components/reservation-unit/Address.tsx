import React from "react";
import { useTranslation } from "next-i18next";
import styled from "styled-components";
import { getTranslation } from "../../modules/util";
import ExternalLink from "./ExternalLink";
import { LocationType, ReservationUnitByPkType } from "../../modules/gql-types";
import { Language } from "../../modules/types";

type Props = {
  reservationUnit: ReservationUnitByPkType;
};

const Container = styled.div`
  margin-top: var(--spacing-2-xs);
  margin-bottom: var(--spacing-layout-l);
`;

const Name = styled.div`
  font-size: var(--fontsize-heading-m);
  font-family: var(--font-bold);
  margin-bottom: var(--spacing-m);
`;

const AddressLine = styled.div`
  font-family: var(--font-medium);
  font-weight: 500;
  font-size: var(--fontsize-body-m);
  margin-top: var(--spacing-2-xs);
`;

const Links = styled.div`
  margin-top: var(--spacing-m);
  font-family: var(--font-medium);
  font-weight: 500;

  a {
    color: var(--color-bus);
  }
`;

const hslUrl = (locale: string, location: LocationType): string | null => {
  if (!location) {
    return null;
  }

  return `https://www.reittiopas.fi/${locale}/?to=${encodeURI(
    `${getTranslation(location, "addressStreet", locale)},${getTranslation(
      location,
      "addressCity",
      locale
    )}`
  )}`;
};

const googleUrl = (location: LocationType, locale: Language): string | null => {
  if (!location) {
    return null;
  }
  return `https://www.google.com/maps/dir/?api=1&destination=${getTranslation(
    location,
    "addressStreet",
    locale
  )},${getTranslation(location, "addressCity", locale)}`;
};

const mapUrl = (location: LocationType, locale: Language): string | null => {
  if (!location) {
    return null;
  }

  return `https://maps.google.com/?q=${getTranslation(
    location,
    "addressStreet",
    locale
  )},${getTranslation(location, "addressCity", locale)}`;
};

const Address = ({ reservationUnit }: Props): JSX.Element => {
  const { t, i18n } = useTranslation();

  const addressStreet = getTranslation(
    reservationUnit.location,
    "addressStreet",
    i18n.language
  );
  const addressCity = getTranslation(
    reservationUnit.location,
    "addressCity",
    i18n.language
  );

  if (!reservationUnit?.location || !addressStreet || !addressCity) {
    return <div />;
  }

  return (
    <Container>
      <Name>{getTranslation(reservationUnit, "name", i18n.language)}</Name>
      {addressStreet && <AddressLine>{addressStreet}</AddressLine>}
      {reservationUnit.location?.addressZip && addressCity && (
        <AddressLine>
          {`${reservationUnit.location?.addressZip} ${addressCity}`}
        </AddressLine>
      )}
      <Links>
        <ExternalLink
          href={mapUrl(reservationUnit.location, i18n.language as Language)}
          name={t("reservationUnit:linkMap")}
        />
        <ExternalLink
          href={googleUrl(reservationUnit.location, i18n.language as Language)}
          name={t("reservationUnit:linkGoogle")}
        />
        <ExternalLink
          href={hslUrl(i18n.language, reservationUnit.location)}
          name={t("reservationUnit:linkHSL")}
        />
      </Links>
    </Container>
  );
};

export default Address;
