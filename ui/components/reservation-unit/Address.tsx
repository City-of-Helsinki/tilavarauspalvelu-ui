import React from "react";
import { useTranslation } from "next-i18next";
import styled from "styled-components";
import { localizedValue } from "../../modules/util";
import ExternalLink from "./ExternalLink";
import { LocationType, ReservationUnitByPkType } from "../../modules/gql-types";

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
    `${location.addressStreet},${location.addressCity}`
  )}`;
};

const googleUrl = (location: LocationType): string | null => {
  if (!location) {
    return null;
  }
  return `https://www.google.com/maps/dir/?api=1&destination=${location.addressStreet},${location.addressCity}`;
};

const mapUrl = (location: LocationType): string | null => {
  if (!location) {
    return null;
  }

  return `https://maps.google.com/?q=${location.addressStreet},${location.addressCity}`;
};

const Address = ({ reservationUnit }: Props): JSX.Element => {
  const { t, i18n } = useTranslation();

  if (!reservationUnit?.location) {
    return <div />;
  }
  return (
    <Container>
      <Name>{localizedValue(reservationUnit.name, i18n.language)}</Name>
      {reservationUnit.location?.addressStreet ? (
        <AddressLine>{reservationUnit.location?.addressStreet}</AddressLine>
      ) : null}
      {reservationUnit.location?.addressZip &&
      reservationUnit.location?.addressCity ? (
        <AddressLine>
          {`${reservationUnit.location?.addressZip} ${reservationUnit.location?.addressCity}`}
        </AddressLine>
      ) : null}
      <Links>
        <ExternalLink
          href={mapUrl(reservationUnit.location)}
          name={t("reservationUnit:linkMap")}
        />
        <ExternalLink
          href={googleUrl(reservationUnit.location)}
          name={t("reservationUnit:linkGoogle")}
        />{" "}
        <ExternalLink
          href={hslUrl(i18n.language, reservationUnit.location)}
          name={t("reservationUnit:linkHSL")}
        />
      </Links>
    </Container>
  );
};

export default Address;
