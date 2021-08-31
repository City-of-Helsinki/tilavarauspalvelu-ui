import { Button } from "hds-react";
import { useRouter } from "next/router";
import React from "react";
import { useTranslation } from "next-i18next";
import styled from "styled-components";
import { parseISO } from "date-fns";
import { breakpoint } from "../../modules/style";

type Props = {
  reservationUnitId: number;
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

const TimeRange = styled.span`
  text-transform: capitalize;
`;

const ReservationInfo = ({
  reservationUnitId,
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

  return (
    <Wrapper>
      <div>
        <Button
          onClick={() => {
            router.push(
              `/reservation-unit/${reservationUnitId}/reservation?begin=${begin}&end=${end}`
            );
          }}
          disabled={!begin || !end}
        >
          {t("reservationCalendar:makeReservation")}
        </Button>
      </div>
      <div>
        <h3>{t("reservationCalendar:selectedTime")}:</h3>
        {begin && end ? (
          <TimeRange>
            {beginDate} {beginTime} - {endDate !== beginDate && endDate}{" "}
            {endTime}
          </TimeRange>
        ) : (
          "–"
        )}
      </div>
    </Wrapper>
  );
};

export default ReservationInfo;
