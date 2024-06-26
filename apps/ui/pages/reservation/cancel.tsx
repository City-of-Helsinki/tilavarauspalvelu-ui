import type { GetServerSidePropsContext } from "next";
import { useRouter } from "next/router";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import React, { useEffect } from "react";
import { breakpoints } from "common/src/common/style";
import { LoadingSpinner } from "hds-react";
import styled from "styled-components";
import { Container } from "common";
import { useDeleteReservation, useOrder } from "@/hooks/reservation";
import DeleteCancelled from "@/components/reservation/DeleteCancelled";
import ReservationFail from "@/components/reservation/ReservationFail";
import { getCommonServerSideProps } from "@/modules/serverUtils";

type Props = Awaited<ReturnType<typeof getServerSideProps>>["props"];

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const { locale } = ctx;

  return {
    props: {
      ...getCommonServerSideProps(),
      ...(await serverSideTranslations(locale ?? "fi")),
    },
  };
};

const StyledContainer = styled(Container)`
  display: flex;
  padding: var(--spacing-m) var(--spacing-m) var(--spacing-layout-m);
  justify-content: center;

  @media (min-width: ${breakpoints.m}) {
    max-width: 1000px;
    margin-bottom: var(--spacing-layout-l);
  }
`;

const Cancel = ({ apiBaseUrl }: Props): JSX.Element => {
  const router = useRouter();
  const { orderId } = router.query;

  const uuid = Array.isArray(orderId) ? orderId[0] : orderId;
  const { order, isLoading, called } = useOrder({ orderUuid: uuid });

  const {
    mutation: deleteReservation,
    error: deleteError,
    isLoading: isDeleteLoading,
    deleted,
  } = useDeleteReservation();

  useEffect(() => {
    const { reservationPk } = order || {};
    if (reservationPk) {
      deleteReservation({
        variables: { input: { pk: reservationPk } },
      });
    }
  }, [deleteReservation, order]);

  if (isLoading || isDeleteLoading || !called) {
    return (
      <StyledContainer>
        <LoadingSpinner />
      </StyledContainer>
    );
  }

  // return invalid order id error
  if (!order || !order.reservationPk) {
    return <ReservationFail apiBaseUrl={apiBaseUrl} type="order" />;
  }

  // return general error
  if (
    !deleted &&
    (!deleteError ||
      deleteError?.message !== "No Reservation matches the given query.")
  ) {
    return (
      <DeleteCancelled
        reservationPk={order?.reservationPk}
        error
        apiBaseUrl={apiBaseUrl}
      />
    );
  }

  // return success report - even if deletion failed
  return (
    <StyledContainer>
      <DeleteCancelled
        reservationPk={order?.reservationPk}
        error={false}
        apiBaseUrl={apiBaseUrl}
      />
    </StyledContainer>
  );
};

export default Cancel;
