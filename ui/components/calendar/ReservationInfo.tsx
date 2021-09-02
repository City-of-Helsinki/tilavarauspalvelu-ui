import { Button } from "hds-react";
import { useRouter } from "next/router";
import React from "react";
import { useTranslation } from "next-i18next";
import styled from "styled-components";
import { differenceInMinutes, parseISO } from "date-fns";
import { breakpoint } from "../../modules/style";
import { ReservationUnit } from "../../modules/types";
import { isReservationLongEnough } from "../../modules/calendar";
import { formatDurationMinutes } from "../../modules/util";

type Props = {
  reservationUnit: ReservationUnit;
  begin?: string;
  end?: string;
};

const Wrapper = styled.div`
  display: grid;
  gap: var(--spacing-s);
  align-items: baseline;

  @media (min-width: ${breakpoint.m}) {
    grid-template-columns: auto 1fr;
    gap: var(--spacing-xl);
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
      <div>
        <Button
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
        </Button>
      </div>
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
