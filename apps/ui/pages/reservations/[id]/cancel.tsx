import React from "react";
import type { GetServerSidePropsContext } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import {
  CurrentUserQuery,
  ReservationCancelReasonsDocument,
  type ReservationCancelReasonsQuery,
  type ReservationCancelReasonsQueryVariables,
  ReservationDocument,
  type ReservationQuery,
  type ReservationQueryVariables,
} from "@gql/gql-types";
import Error from "next/error";
import ReservationCancellation from "@/components/reservation/ReservationCancellation";
import { getCommonServerSideProps } from "@/modules/serverUtils";
import { createApolloClient } from "@/modules/apolloClient";
import { base64encode, filterNonNullable } from "common/src/helpers";
import { CURRENT_USER } from "@/modules/queries/user";

type PropsNarrowed = Exclude<Props, { notFound: boolean }>;

function ReservationCancelPage(props: PropsNarrowed): JSX.Element {
  // TODO can be removed if SSR returns notFound for nulls
  const { reservation } = props;

  if (reservation == null) {
    return <Error statusCode={404} />;
  }

  return <ReservationCancellation {...props} reservation={reservation} />;
}

type Props = Awaited<ReturnType<typeof getServerSideProps>>["props"];

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

    const { data: userData } = await client.query<CurrentUserQuery>({
      query: CURRENT_USER,
      fetchPolicy: "no-cache",
    });
    const user = userData?.currentUser;

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

    if (
      reservation != null &&
      user?.pk != null &&
      reservation.user?.pk === user?.pk
    ) {
      return {
        props: {
          ...commonProps,
          ...(await serverSideTranslations(locale ?? "fi")),
          key: `${pk}-cancel-{locale}`,
          reservation,
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
      key: `${pk}-cancel-${locale}`,
    },
  };
}

export default ReservationCancelPage;
