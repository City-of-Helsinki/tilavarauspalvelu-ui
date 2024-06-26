import React, { useMemo } from "react";
import { Card, Container, IconArrowRight } from "hds-react";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import styled from "styled-components";
import { parseISO } from "date-fns";
import { breakpoints } from "common/src/common/style";
import { H4 } from "common/src/common/typography";
import ClientOnly from "common/src/ClientOnly";
import {
  type ApplicationRoundFieldsFragment,
  ApplicationRoundStatusChoice,
} from "@gql/gql-types";
import { IconButton } from "common/src/components";
import { searchUrl } from "@/modules/util";
import { MediumButton } from "@/styles/util";
import { getApplicationRoundName } from "@/modules/applicationRound";

interface Props {
  applicationRound: ApplicationRoundFieldsFragment;
}

const StyledCard = styled(Card)`
  && {
    --background-color: var(--color-black-8);
    --border-color: var(--color-black-8);
    display: grid;
    grid-template-columns: 1fr;
    grid-gap: var(--spacing-m);
    align-items: start;
    padding: var(--spacing-s);
    margin-bottom: var(--spacing-m);

    @media (min-width: ${breakpoints.s}) {
      grid-template-columns: 1fr auto;
    }
  }
`;

const StyledContainer = styled(Container)`
  line-height: var(--lineheight-l);
  max-width: 100%;
`;

const Name = styled(H4).attrs({ as: "h3" })`
  && {
    margin-top: 0;
    margin-bottom: 0;
  }
`;

const ReservationPeriod = styled.div`
  margin-top: var(--spacing-xs);
  @media (min-width: ${breakpoints.s}) {
    margin-top: 0;
  }
`;

const StatusMessage = styled.div`
  margin-top: var(--spacing-s);
`;

const CardButton = styled(MediumButton)`
  width: 100%;
  align-self: flex-end;

  @media (min-width: ${breakpoints.s}) {
    justify-self: right;
    width: max-content;
  }
`;

const StyledLink = styled(IconButton)`
  color: var(--color-black);
`;

const ApplicationRoundCard = ({ applicationRound }: Props): JSX.Element => {
  const { t } = useTranslation();

  const history = useRouter();

  const state = applicationRound.status;
  if (state == null) {
    // eslint-disable-next-line no-console
    console.warn("Application round status is null");
  }

  const name = getApplicationRoundName(applicationRound);

  const reservationPeriod = useMemo(
    () =>
      t(`applicationRound:card.reservationPeriod`, {
        reservationPeriodBegin: new Date(
          applicationRound.reservationPeriodBegin
        ),
        reservationPeriodEnd: new Date(applicationRound.reservationPeriodEnd),
      }),
    [applicationRound, t]
  );

  return (
    <StyledCard aria-label={name} border>
      <StyledContainer>
        <Name>{name}</Name>
        {(state === ApplicationRoundStatusChoice.Open ||
          state === ApplicationRoundStatusChoice.Upcoming) && (
          <ReservationPeriod>{reservationPeriod}</ReservationPeriod>
        )}
        <StatusMessage>
          {state === ApplicationRoundStatusChoice.Upcoming
            ? t("applicationRound:card.pending", {
                openingDateTime: t("common:dateTime", {
                  date: parseISO(applicationRound.applicationPeriodBegin),
                }),
              })
            : state === ApplicationRoundStatusChoice.Open
              ? t("applicationRound:card.open", {
                  until: parseISO(applicationRound.applicationPeriodEnd),
                })
              : t("applicationRound:card.past", {
                  closingDate: parseISO(applicationRound.applicationPeriodEnd),
                })}
        </StatusMessage>
        <StyledLink
          href={`/criteria/${applicationRound.pk}`}
          label={t("applicationRound:card.criteria")}
          icon={<IconArrowRight aria-hidden />}
        />
      </StyledContainer>
      {state === ApplicationRoundStatusChoice.Open && (
        <CardButton
          onClick={() => {
            if (applicationRound.pk) {
              history.push(
                searchUrl({ applicationRound: applicationRound.pk })
              );
            }
          }}
        >
          {t("application:Intro.startNewApplication")}
        </CardButton>
      )}
    </StyledCard>
  );
};

// Hack to deal with hydration errors
export default ({ applicationRound }: Props): JSX.Element => (
  <ClientOnly>
    <ApplicationRoundCard applicationRound={applicationRound} />
  </ClientOnly>
);
