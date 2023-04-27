import { signIn, useSession } from "next-auth/react";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import React, { useEffect, useState } from "react";
import { breakpoints } from "common/src/common/style";
import { LoadingSpinner } from "hds-react";
import styled from "styled-components";
import { authEnabled, authenticationIssuer } from "../../modules/const";
import { useOrder } from "../../hooks/reservation";
import Container from "../../components/common/Container";
import DeleteConfirmation from "../../components/reservation/DeleteConfirmation";
import ReservationFail from "../../components/reservation/ReservationFail";

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale)),
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
const Cancel = () => {
  const session = useSession();
  const router = useRouter();
  const { orderId } = router.query as { orderId: string };

  const [error, setError] = useState(false);

  const isCheckingAuth = session?.status === "loading";
  const isLoggedOut = authEnabled && session?.status === "unauthenticated";

  useEffect(() => {
    if (isLoggedOut) {
      signIn(authenticationIssuer, {
        callbackUrl: window.location.href,
      });
    }
  }, [isLoggedOut]);

  const {
    order,
    loading,
    deleteReservation,
    deleteError,
    deleteLoading,
    deleted,
  } = useOrder(orderId);

  useEffect(() => {
    const { reservationPk } = order || {};
    if (reservationPk) {
      deleteReservation({
        variables: { input: { pk: parseInt(reservationPk, 10) } },
      });
    }
  }, [deleteReservation, order]);

  useEffect(() => {
    if (deleteLoading) return;
    if (deleteError) {
      setError(true);
    }
  }, [deleteError, deleteLoading]);

  if (loading || deleteLoading || isCheckingAuth) {
    return (
      <StyledContainer>
        <LoadingSpinner />
      </StyledContainer>
    );
  }

  const content = deleted ? (
    <DeleteConfirmation reservationPk={order?.reservationPk} error={error} />
  ) : (
    <ReservationFail type="order" />
  );

  return <StyledContainer>{content}</StyledContainer>;
};

export default Cancel;
