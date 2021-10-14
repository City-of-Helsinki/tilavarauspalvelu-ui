import React from "react";
import { GetServerSideProps } from "next";
import { useTranslation } from "next-i18next";
import styled from "styled-components";
import { gql } from "@apollo/client";
import { Koros } from "hds-react";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import Container from "../../components/common/Container";
import Head from "../../components/reservation-unit/Head";
import Address from "../../components/reservation-unit/Address";
import Sanitize from "../../components/common/Sanitize";
import { breakpoint } from "../../modules/style";
import RelatedUnits from "../../components/reservation-unit/RelatedUnits";
import useReservationUnitsList from "../../hooks/useReservationUnitList";
import StartApplicationBar from "../../components/common/StartApplicationBar";
import { AccordionWithState as Accordion } from "../../components/common/Accordion";
import apolloClient from "../../modules/apolloClient";
import Map from "../../components/Map";
import { H2 } from "../../modules/style/typography";
import { getActiveOpeningTimes } from "../../modules/openingHours";
import {
  Query,
  QueryReservationUnitByPkArgs,
  QueryReservationUnitsArgs,
  ReservationUnitByPkType,
  ReservationUnitType,
  ReservationUnitTypeEdge,
} from "../../modules/gql-types";
import { getTranslation } from "../../modules/util";
import { Language } from "../../modules/types";

type Props = {
  reservationUnit: ReservationUnitByPkType | null;
  relatedReservationUnits: ReservationUnitType[];
};

const RESERVATION_UNIT = gql`
  query SelectedReservationUnit($pk: Int!) {
    reservationUnitByPk(pk: $pk) {
      id
      pk
      nameFi
      nameEn
      nameSv
      images {
        imageUrl
        mediumUrl
        smallUrl
        imageType
      }
      descriptionFi
      descriptionEn
      descriptionSv
      termsOfUseFi
      termsOfUseEn
      termsOfUseSv
      reservationUnitType {
        nameFi
        nameEn
        nameSv
      }
      maxPersons
      unit {
        id
        pk
        nameFi
        nameEn
        nameSv
      }
      location {
        latitude
        longitude
        addressStreetFi
        addressStreetEn
        addressStreetSv
        addressZip
        addressCityFi
        addressCityEn
        addressCitySv
      }
      spaces {
        pk
        nameFi
        nameEn
        nameSv
        termsOfUseFi
        termsOfUseEn
        termsOfUseSv
      }
      openingHours(openingTimes: false, periods: true) {
        openingTimePeriods {
          periodId
          startDate
          endDate
          resourceState
          timeSpans {
            startTime
            endTime
            resourceState
            weekdays
          }
        }
      }
    }
  }
`;

const RELATED_RESERVATION_UNITS = gql`
  query RelatedReservationUnits($unit: ID!) {
    reservationUnits(unit: $unit) {
      edges {
        node {
          pk
          nameFi
          nameEn
          nameSv
          images {
            imageUrl
            smallUrl
            imageType
          }
          unit {
            pk
            nameFi
            nameEn
            nameSv
          }
          reservationUnitType {
            nameFi
            nameEn
            nameSv
          }
          maxPersons
          location {
            addressStreetFi
            addressStreetEn
            addressStreetSv
          }
        }
      }
    }
  }
`;

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const getServerSideProps: GetServerSideProps = async ({
  locale,
  params,
}) => {
  const id = Number(params.id);
  let relatedReservationUnits = [] as ReservationUnitType[];

  if (id) {
    const { data: reservationUnitData } = await apolloClient.query<
      Query,
      QueryReservationUnitByPkArgs
    >({
      query: RESERVATION_UNIT,
      variables: {
        pk: id,
      },
    });

    if (reservationUnitData.reservationUnitByPk?.unit?.pk) {
      const { data: relatedReservationUnitsData } = await apolloClient.query<
        Query,
        QueryReservationUnitsArgs
      >({
        query: RELATED_RESERVATION_UNITS,
        variables: {
          unit: String(reservationUnitData.reservationUnitByPk.unit.pk),
        },
      });

      relatedReservationUnits =
        relatedReservationUnitsData?.reservationUnits?.edges
          .map((n: ReservationUnitTypeEdge) => n.node)
          .filter(
            (n: ReservationUnitType) =>
              n.pk !== reservationUnitData.reservationUnitByPk.pk
          );
    }

    if (!reservationUnitData.reservationUnitByPk?.pk) {
      return {
        notFound: true,
      };
    }

    return {
      props: {
        ...(await serverSideTranslations(locale)),
        reservationUnit: reservationUnitData.reservationUnitByPk,
        relatedReservationUnits,
      },
    };
  }

  return { props: { ...(await serverSideTranslations(locale)), paramsId: id } };
};

const TwoColumnLayout = styled.div`
  display: grid;
  gap: var(--spacing-layout-s);
  grid-template-columns: 7fr 390px;
  margin-top: var(--spacing-m);
  margin-bottom: var(--spacing-xl);

  @media (max-width: ${breakpoint.l}) {
    grid-template-columns: 1fr;
    margin-bottom: var(--spacing-m);
  }
`;

const Content = styled.div`
  font-family: var(--font-regular);
`;

const BottomWrapper = styled.div`
  margin: 0;
  padding: 0;
  background-color: var(--color-silver-medium-light);
`;

const BottomContainer = styled(Container)`
  background-color: var(--color-silver-medium-light);
  margin-top: var(--spacing-layout-l);
  margin-bottom: calc(var(--spacing-s) * -1 + var(--spacing-layout-xl) * -1);
  padding-bottom: var(--spacing-layout-xl);
`;

const StyledKoros = styled(Koros).attrs({
  type: "basic",
})`
  fill: var(--tilavaraus-gray);
`;

const StyledH2 = styled(H2)`
  && {
    margin-bottom: var(--spacing-xl);
  }
`;

const MapWrapper = styled.div`
  margin-bottom: var(--spacing-xl);
`;

const ReservationUnit = ({
  reservationUnit,
  relatedReservationUnits,
}: Props): JSX.Element | null => {
  const { t, i18n } = useTranslation();

  const activeOpeningTimes = getActiveOpeningTimes(
    reservationUnit.openingHours.openingTimePeriods
  );

  const reservationUnitList = useReservationUnitsList();

  const shouldDisplayBottomWrapper = relatedReservationUnits?.length > 0;

  return reservationUnit ? (
    <>
      <Head
        reservationUnit={reservationUnit}
        activeOpeningTimes={activeOpeningTimes}
        reservationUnitList={reservationUnitList}
        viewType="recurring"
      />
      <Container>
        <TwoColumnLayout>
          <div>
            <Accordion open heading={t("reservationUnit:description")}>
              <Content>
                <Sanitize
                  html={getTranslation(
                    reservationUnit,
                    "description",
                    i18n.language as Language
                  )}
                />
              </Content>
            </Accordion>
          </div>
          <div>
            <Address reservationUnit={reservationUnit} />
          </div>
        </TwoColumnLayout>
        <MapWrapper>
          <StyledH2>{t("common:location")}</StyledH2>
          <Map
            title={getTranslation(
              reservationUnit.unit,
              "name",
              i18n.language as Language
            )}
            latitude={Number(reservationUnit.location?.latitude)}
            longitude={Number(reservationUnit.location?.longitude)}
          />
        </MapWrapper>
        <TwoColumnLayout>
          <Address reservationUnit={reservationUnit} />
          <div />
          <Accordion heading={t("reservationUnit:termsOfUse")}>
            <Content>
              <Sanitize
                html={getTranslation(
                  reservationUnit,
                  "termsOfUse",
                  i18n.language as Language
                )}
              />
            </Content>
          </Accordion>
          <div />
          <Accordion heading={t("reservationUnit:termsOfUseSpaces")}>
            <Content>
              {reservationUnit.spaces?.map((space) => (
                <React.Fragment key={space.pk}>
                  {reservationUnit.spaces.length > 1 && (
                    <h3>
                      {getTranslation(space, "name", i18n.language as Language)}
                    </h3>
                  )}
                  <p>
                    <Sanitize
                      html={getTranslation(
                        space,
                        "termsOfUse",
                        i18n.language as Language
                      )}
                    />
                  </p>
                </React.Fragment>
              ))}
            </Content>
          </Accordion>
          <div />
        </TwoColumnLayout>
      </Container>
      <BottomWrapper>
        {shouldDisplayBottomWrapper && (
          <>
            <StyledKoros flipHorizontal />
            <BottomContainer>
              <RelatedUnits
                reservationUnitList={reservationUnitList}
                units={relatedReservationUnits}
                viewType="recurring"
              />
            </BottomContainer>
          </>
        )}
      </BottomWrapper>
      <StartApplicationBar
        count={reservationUnitList.reservationUnits.length}
      />
    </>
  ) : null;
};

export default ReservationUnit;
