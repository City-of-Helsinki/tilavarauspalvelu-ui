import { useRouter } from "next/router";
import React from "react";
import { useTranslation } from "next-i18next";
import styled from "styled-components";
import { differenceInMinutes, parseISO } from "date-fns";
import { breakpoint } from "../../modules/style";
import { isReservationLongEnough } from "../../modules/calendar";
import { formatDurationMinutes } from "../../modules/util";
import { MediumButton } from "../../styles/util";
import { ReservationUnitByPkType } from "../../modules/gql-types";

type Props = {
  reservationUnit: ReservationUnitByPkType;
  begin?: string;
  end?: string;
};

const Wrapper = styled.div`
  display: grid;
  gap: var(--spacing-s);
  align-items: flex-start;

  button {
    order: 2;
  }

  h3 {
    margin-top: 0;
  }

  @media (min-width: ${breakpoint.s}) {
    grid-template-columns: auto 1fr;
    gap: var(--spacing-xl);

    button {
      order: 1;
      max-width: 10rem;
    }
  }

  @media (min-width: ${breakpoint.l}) {
    button {
      max-width: unset;
    }
  }
`;

const DurationWrapper = styled.span`
  text-transform: lowercase;
`;

const TimeRange = styled.span`
  text-transform: capitalize;
`;

const ReservationInfo = ({
  reservationUnit,
  begin,
  end,
}: Props): JSX.Element => {
  const { t } = useTranslation();
  const router = useRouter();

  const beginDate = t("common:dateWithWeekday", {
    date: begin && parseISO(begin),
  });

  const beginTime = t("common:timeWithPrefix", {
    date: begin && parseISO(begin),
  });
  const endDate = t("common:dateWithWeekday", {
    date: end && parseISO(end),
  });
  const endTime = t("common:time", {
    date: end && parseISO(end),
  });

  const duration = differenceInMinutes(new Date(end), new Date(begin));

  return (
    <Wrapper>
      <MediumButton
        onClick={() => {
          router.push(
            `/reservation-unit/${reservationUnit.id}/reservation?begin=${begin}&end=${end}`
          );
        }}
        disabled={
          !begin ||
          !end ||
          !isReservationLongEnough(
            new Date(begin),
            new Date(end),
            reservationUnit.minReservationDuration
          )
        }
      >
        {t("reservationCalendar:makeReservation")}
      </MediumButton>
      <div>
        <h3>{t("reservationCalendar:selectedTime")}:</h3>
        {begin && end ? (
          <TimeRange>
            {beginDate} {beginTime} - {endDate !== beginDate && endDate}{" "}
            {endTime}{" "}
            <DurationWrapper>
              ({formatDurationMinutes(duration)})
            </DurationWrapper>
          </TimeRange>
        ) : (
          "–"
        )}
      </div>
    </Wrapper>
  );
};

export default ReservationInfo;
