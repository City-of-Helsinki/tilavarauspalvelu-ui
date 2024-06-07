import React from "react";
import type { GetServerSidePropsContext } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import {
  ReservationCancelReasonsDocument,
  type ReservationCancelReasonsQuery,
  type ReservationCancelReasonsQueryVariables,
  ReservationDocument,
  type ReservationQuery,
  type ReservationQueryVariables,
} from "@gql/gql-types";
import { ReservationCancellation } from "@/components/reservation/ReservationCancellation";
import { getCommonServerSideProps } from "@/modules/serverUtils";
import { createApolloClient } from "@/modules/apolloClient";
import { base64encode, filterNonNullable } from "common/src/helpers";
import { canUserCancelReservation } from "@/modules/reservation";

type Props = Awaited<ReturnType<typeof getServerSideProps>>["props"];
type PropsNarrowed = Exclude<Props, { notFound: boolean }>;

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  const { locale, params } = ctx;
  const pk = params?.id;

  const commonProps = getCommonServerSideProps();
  const client = createApolloClient(commonProps.apiBaseUrl, ctx);

  if (Number.isFinite(Number(pk))) {
    const typename = "ReservationNode";
    const id = base64encode(`${typename}:${pk}`);
    const { data: reservationData } = await client.query<
      ReservationQuery,
      ReservationQueryVariables
    >({
      query: ReservationDocument,
      fetchPolicy: "no-cache",
      variables: { id },
    });
    const { reservation } = reservationData || {};

    const { data: cancelReasonsData } = await client.query<
      ReservationCancelReasonsQuery,
      ReservationCancelReasonsQueryVariables
    >({
      query: ReservationCancelReasonsDocument,
      fetchPolicy: "no-cache",
    });

    const reasons = filterNonNullable(
      cancelReasonsData?.reservationCancelReasons?.edges.map(
        (edge) => edge?.node
      )
    );

    const canCancel =
      reservation != null && canUserCancelReservation(reservation);
    if (canCancel) {
      return {
        props: {
          ...commonProps,
          ...(await serverSideTranslations(locale ?? "fi")),
          reservation: reservation ?? null,
          reasons,
        },
      };
    }
  }

  return {
    notFound: true,
    props: {
      notFound: true,
      ...commonProps,
      ...(await serverSideTranslations(locale ?? "fi")),
    },
  };
}

function ReservationCancelPage(props: PropsNarrowed): JSX.Element {
  const { reservation } = props;
  return <ReservationCancellation {...props} reservation={reservation} />;
}

export default ReservationCancelPage;
