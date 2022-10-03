import React, { useEffect, useMemo, useState } from "react";
import { GetServerSideProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { isAfter } from "date-fns";
import { useLazyQuery, useQuery } from "@apollo/client";
import { Tabs, TabList, Tab, TabPanel, Notification } from "hds-react";
import styled from "styled-components";
import { useTranslation } from "react-i18next";
import Container from "../../components/common/Container";
import {
  Query,
  QueryReservationsArgs,
  ReservationType,
} from "../../modules/gql-types";
import { LIST_RESERVATIONS } from "../../modules/queries/reservation";
import ReservationCard from "../../components/reservation/ReservationCard";
import { fontMedium } from "../../modules/style/typography";
import { breakpoint } from "../../modules/style";
import Head from "../../components/reservations/Head";
import { CenterSpinner } from "../../components/common/common";
import { CURRENT_USER } from "../../modules/queries/user";

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  return {
    props: {
      overrideBackgroundColor: "var(--tilavaraus-gray)",
      ...(await serverSideTranslations(locale)),
    },
  };
};

const Wrapper = styled(Container)``;

const Heading = styled.div`
  margin-bottom: var(--spacing-layout-l);
`;

const StyledTabList = styled(TabList)`
  ul {
    &:after {
      content: "";
      display: block;
      border-bottom: 1px solid var(--color-black-20);
      position: absolute;
      bottom: 2px;
      width: 100%;
    }

    width: 100% !important;
    position: relative;
  }
`;

const StyledTab = styled(Tab)`
  color: greenyellow;
  ${fontMedium};

  span {
    padding: 0 var(--spacing-xs) !important;

    @media (min-width: ${breakpoint.s}) {
      padding: 0 var(--spacing-xl) !important;
    }
  }
`;

const StyledTabPanel = styled(TabPanel)`
  margin-top: var(--spacing-layout-l);
`;

const EmptyMessage = styled.div`
  margin-left: var(--spacing-xl);
`;

const Reservations = (): JSX.Element => {
  const [error, setError] = useState(false);
  const { t } = useTranslation();

  const [upcomingReservations, setUpcomingReservations] = useState<
    ReservationType[]
  >([]);
  const [pastReservations, setPastReservations] = useState<ReservationType[]>(
    []
  );
  const [isLoadingReservations, setIsLoadingReservations] =
    useState<boolean>(true);

  const { data: userData, error: queryError } = useQuery<Query>(CURRENT_USER, {
    fetchPolicy: "no-cache",
  });

  const currentUser = useMemo(() => userData?.currentUser, [userData]);

  const [
    fetchReservations,
    { data: reservationData, error: reservationError },
  ] = useLazyQuery<Query, QueryReservationsArgs>(LIST_RESERVATIONS, {
    fetchPolicy: "no-cache",
  });

  useEffect(() => {
    if (currentUser?.pk) {
      fetchReservations({
        variables: {
          state: ["CONFIRMED", "REQUIRES_HANDLING"],
          user: currentUser?.pk.toString(),
        },
      });
    }
  }, [currentUser, fetchReservations]);

  useEffect(() => {
    const reservations = reservationData?.reservations?.edges
      ?.map((edge) => edge?.node)
      .reduce(
        (acc, reservation) => {
          if (isAfter(new Date(reservation?.begin), new Date())) {
            acc[0].push(reservation);
          } else {
            acc[1].push(reservation);
          }
          return acc;
        },
        [[], []] as ReservationType[][]
      );
    if (reservations?.length > 0) {
      setUpcomingReservations(reservations[0]);
      setPastReservations(reservations[1]);
    }
    setIsLoadingReservations(false);
  }, [reservationData]);

  useEffect(() => {
    if (queryError || reservationError) {
      setError(true);
    }
  }, [queryError, reservationError]);

  return (
    <>
      <Head />
      <Wrapper>
        <Heading>
          <Tabs>
            <StyledTabList>
              <StyledTab>
                {t("reservations:upcomingReservations")}
                {isLoadingReservations
                  ? ""
                  : ` (${upcomingReservations.length})`}
              </StyledTab>
              <StyledTab>
                {t("reservations:pastReservations")}
                {isLoadingReservations ? "" : ` (${pastReservations.length})`}
              </StyledTab>
            </StyledTabList>
            <StyledTabPanel>
              {error ? null : isLoadingReservations && <CenterSpinner />}
              {upcomingReservations.length > 0
                ? upcomingReservations?.map((reservation) => (
                    <ReservationCard
                      key={reservation.pk}
                      reservation={reservation}
                      type={
                        reservation.state === "REQUIRES_HANDLING"
                          ? "requiresHandling"
                          : "upcoming"
                      }
                    />
                  ))
                : !isLoadingReservations && (
                    <EmptyMessage>
                      {t("reservations:noUpcomingReservations")}
                    </EmptyMessage>
                  )}
            </StyledTabPanel>
            <StyledTabPanel>
              {isLoadingReservations && <CenterSpinner />}
              {pastReservations.length > 0
                ? pastReservations?.map((reservation) => (
                    <ReservationCard
                      key={reservation.pk}
                      reservation={reservation}
                      type="past"
                    />
                  ))
                : !isLoadingReservations && (
                    <EmptyMessage>
                      {t("reservations:noPastReservations")}
                    </EmptyMessage>
                  )}
            </StyledTabPanel>
          </Tabs>
        </Heading>
        {error && (
          <Notification
            type="error"
            label={t("common:error.error")}
            position="top-center"
          >
            {t("common:error.dataError")}
          </Notification>
        )}
      </Wrapper>
    </>
  );
};

export default Reservations;
