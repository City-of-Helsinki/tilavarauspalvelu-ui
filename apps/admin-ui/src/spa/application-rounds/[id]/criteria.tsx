import React from "react";
import { gql } from "@apollo/client";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import styled from "styled-components";
import { H2, H3, SemiBold, Strong } from "common/src/common/typography";
import { breakpoints } from "common/src/common/style";
import { useApplicationRoundCriteriaQuery } from "@gql/gql-types";
import { base64encode, filterNonNullable } from "common/src/helpers";
import { Container } from "@/styles/layout";
import { formatDate } from "@/common/util";
import { errorToast } from "common/src/common/toast";
import Loader from "@/component/Loader";
import { Accordion } from "@/component/Accordion";
import TimeframeStatus from "../TimeframeStatus";

interface IRouteParams {
  [key: string]: string;
  applicationRoundId: string;
}

const HeadContainer = styled.div`
  display: flex;
  gap: var(--spacing-s);
  flex-direction: column;
  justify-content: space-between;

  @media (min-width: ${breakpoints.s}) {
    flex-direction: row;
  }
`;

const ReservationUnits = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  font-size: var(--fontsize-heading-xs);

  @media (min-width: ${breakpoints.m}) {
    grid-template-columns: 1fr 1fr;
    gap: var(--spacing-l);
  }
`;

const ReservationUnit = styled.div`
  margin-bottom: var(--spacing-3-xl);

  div {
    margin-bottom: var(--spacing-2-xs);
  }
`;

// export so it doesn't get removed (codegen makes a copy of it)
export const APPLICATION_ROUND_QUERY = gql`
  query ApplicationRoundCriteria($id: ID!) {
    applicationRound(id: $id) {
      id
      pk
      nameFi
      reservationUnitCount
      applicationPeriodBegin
      applicationPeriodEnd
      reservationPeriodBegin
      reservationPeriodEnd
      reservationUnits {
        id
        pk
        nameFi
        spaces {
          id
          nameFi
        }
        unit {
          id
          nameFi
        }
      }
    }
  }
`;

function Criteria({
  applicationRoundPk,
}: {
  applicationRoundPk: number;
}): JSX.Element {
  const { t } = useTranslation();

  const id = base64encode(`ApplicationRoundNode:${applicationRoundPk}`);
  const { data, loading } = useApplicationRoundCriteriaQuery({
    variables: { id },
    skip: !applicationRoundPk,
    onError: () => {
      errorToast({ text: t("errors.errorFetchingData") });
    },
  });
  const { applicationRound } = data ?? {};
  const reservationUnits = filterNonNullable(
    applicationRound?.reservationUnits
  );

  if (loading) {
    return <Loader />;
  }
  if (applicationRound == null) {
    return <div>Error: failed to load application round</div>;
  }

  return (
    <Container>
      <H2 as="h1" $legacy>
        {applicationRound.nameFi}
      </H2>
      <HeadContainer>
        <TimeframeStatus
          applicationPeriodBegin={applicationRound.applicationPeriodBegin}
          applicationPeriodEnd={applicationRound.applicationPeriodEnd}
        />
        <span>
          <SemiBold>{applicationRound.reservationUnitCount}</SemiBold>{" "}
          <span>{t("ApplicationRound.attachedReservationUnits")}</span>
        </span>
      </HeadContainer>
      <Accordion
        heading={t("ApplicationRound.searchAndUsageTimeRanges")}
        initiallyOpen
      >
        <div>
          <H3 $legacy>{t("ApplicationRound.applicationPeriodTitle")}</H3>
          <div>
            {t("common.begins")}{" "}
            {formatDate(applicationRound.applicationPeriodBegin)}
          </div>
          <div>
            {t("common.ends")}{" "}
            {formatDate(applicationRound.applicationPeriodEnd)}
          </div>
        </div>
        <div>
          <H3>{t("ApplicationRound.reservationPeriodTitle")}</H3>
          <div>
            {t("common.begins")}{" "}
            {formatDate(applicationRound.reservationPeriodBegin)}
          </div>
          <div>
            {t("common.ends")}{" "}
            {formatDate(applicationRound.reservationPeriodEnd)}
          </div>
        </div>
      </Accordion>
      <Accordion
        heading={t("ApplicationRound.usedReservationUnits")}
        initiallyOpen
      >
        <ReservationUnits>
          {/* TODO this should be a reduce where the unique key is the unit pk and under that is all the reservationUnits that belong to it */}
          {reservationUnits?.map((reservationUnit) => (
            <ReservationUnit key={reservationUnit.pk}>
              <div>
                <Strong>{reservationUnit.unit?.nameFi ?? "-"}</Strong>
              </div>
              <div>{reservationUnit.nameFi}</div>
            </ReservationUnit>
          ))}
        </ReservationUnits>
      </Accordion>
    </Container>
  );
}

function CriteriaRouted(): JSX.Element {
  const { applicationRoundId } = useParams<IRouteParams>();
  const { t } = useTranslation();

  const applicationRoundPk = Number(applicationRoundId);
  if (!applicationRoundId || Number.isNaN(applicationRoundPk)) {
    return <div>{t("errors.router.invalidApplicationRoundNumber")}</div>;
  }
  return <Criteria applicationRoundPk={applicationRoundPk} />;
}

export default CriteriaRouted;
