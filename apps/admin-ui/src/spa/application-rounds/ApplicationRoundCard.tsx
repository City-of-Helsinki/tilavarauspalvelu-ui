import React from "react";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import { Card, IconArrowRight, IconCalendar } from "hds-react";
import { type ApplicationRoundsQuery } from "@gql/gql-types";
import { breakpoints } from "common/src/common/style";
import { formatDate } from "@/common/util";
import { ApplicationRoundStatusLabel } from "./ApplicationRoundStatusLabel";
import { getApplicationRoundUrl } from "@/common/urls";
import TimeframeStatus from "./TimeframeStatus";
import { ButtonLikeLink } from "@/component/ButtonLikeLink";

type ApplicationRoundListType = NonNullable<
  ApplicationRoundsQuery["applicationRounds"]
>;
type ApplicationRoundType = NonNullable<
  NonNullable<ApplicationRoundListType["edges"]>[0]
>["node"];

interface IProps {
  applicationRound: NonNullable<ApplicationRoundType>;
}

const Layout = styled.div`
  display: flex;
  justify-content: space-between;
  flex-flow: row wrap;
  position: relative;
  gap: var(--spacing-2-xs);
`;

const StatusTagContainer = styled.div`
  order: 4;
  @media (width > ${breakpoints.s}) {
    order: 1;
  }
`;

const TitleContainer = styled.div`
  width: 100%;
  @media (width > ${breakpoints.s}) {
    width: 80%;
  }
`;

const Name = styled.span`
  font-size: var(--fontsize-heading-s);
  font-family: var(--font-medium), serif;
  margin-bottom: var(--spacing-2-xs);
  order: 1;
`;
const Times = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2-xs);
  font-size: var(--fontsize-body-s);
  padding-bottom: var(--spacing-s);
  order: 3;
  width: 100%;
  @media (width > ${breakpoints.s}) {
    flex-direction: row;
    gap: var(--spacing-l);
  }
`;

const ButtonLink = styled(ButtonLikeLink)`
  font-weight: bold;
  span {
    margin-right: var(--spacing-xs);
  }
`;

const BottomContainer = styled.div`
  display: flex;
  order: 5;
  width: 100%;
  align-items: center;
`;
const Stats = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2-xs);
  width: 100%;
  @media (width > ${breakpoints.s}) {
    flex-direction: row;
    gap: var(--spacing-m);
  }
`;

const Number = styled.span`
  font-size: var(--fontsize-body-xl);
  font-weight: bold;
`;

const Label = styled.span`
  font-size: var(--fontsize-body-s);
`;

// HDS and styled-components have incorrect load order
const StyledCard = styled(Card)`
  && {
    padding: var(--spacing-m);
    background: var(--color-black-5);
  }
`;

const ReservationPeriodContainer = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-3-xs);
`;

function ReservationPeriod({
  reservationPeriodBegin,
  reservationPeriodEnd,
}: {
  reservationPeriodBegin: string;
  reservationPeriodEnd: string;
}): JSX.Element {
  return (
    <ReservationPeriodContainer>
      <IconCalendar size="xs" />
      {formatDate(reservationPeriodBegin)}-{formatDate(reservationPeriodEnd)}
    </ReservationPeriodContainer>
  );
}

function Stat({ value, label }: { value: number; label: string }): JSX.Element {
  return (
    <div>
      <Number>{value}</Number>
      <Label> {label}</Label>
    </div>
  );
}

export function ApplicationRoundCard({
  applicationRound,
}: IProps): JSX.Element {
  const { t } = useTranslation();

  return (
    <StyledCard>
      <Layout>
        <TitleContainer>
          <Name>{applicationRound.nameFi}</Name>
        </TitleContainer>
        <Times>
          <TimeframeStatus
            applicationPeriodBegin={applicationRound.applicationPeriodBegin}
            applicationPeriodEnd={applicationRound.applicationPeriodEnd}
          />
          <ReservationPeriod
            reservationPeriodBegin={applicationRound.reservationPeriodBegin}
            reservationPeriodEnd={applicationRound.reservationPeriodEnd}
          />
        </Times>
        <StatusTagContainer>
          {applicationRound.status != null && (
            <ApplicationRoundStatusLabel status={applicationRound.status} />
          )}
        </StatusTagContainer>
        <BottomContainer>
          <Stats>
            <Stat
              value={applicationRound.reservationUnitCount ?? 0}
              label={t("ApplicationRound.reservationUnitCount", {
                count: applicationRound.reservationUnitCount ?? 0,
              })}
            />
            <Stat
              value={applicationRound.applicationsCount ?? 0}
              label={t("ApplicationRound.applicationCount", {
                count: applicationRound.applicationsCount ?? 0,
              })}
            />
          </Stats>
          <ButtonLink to={getApplicationRoundUrl(applicationRound.pk)}>
            <span>{t("common.view")}</span>
            <IconArrowRight size="l" />
          </ButtonLink>
        </BottomContainer>
      </Layout>
    </StyledCard>
  );
}
