import React from "react";
import { toUIDate } from "common/src/common/util";
import styled from "styled-components";
import { z } from "zod";
import { timeSelectionSchema } from "./RecurringReservationSchema";

type NewReservationListItem = {
  date: Date;
  startTime: string;
  endTime: string;
};

type Props = {
  items: NewReservationListItem[];
};

// In the UI spec parent container max height is 22rem, but overflow forces us to define child max-height
const ListWrapper = styled.div`
  max-height: 18.5rem;
  overflow-y: auto;
  overflow-x: hidden;
`;

const StyledList = styled.ul`
  list-style-type: none;
  border: none;
  padding: 0 var(--spacing-s);
`;

const StyledListItem = styled.li`
  padding: var(--spacing-s) 0;
  border-bottom: 1px solid var(--color-black-20);
`;

const Wrapper = styled.div`
  display: flex;
  justify-content: space-between;
  text-transform: capitalize;
`;

const ReservationList = ({ items }: Props) => {
  if (!items.length) return null;

  return (
    <ListWrapper>
      <StyledList>
        {items.map((item) => (
          <StyledListItem
            key={`${item.date}-${item.startTime}-${item.endTime}`}
          >
            <Wrapper>{`${toUIDate(item.date, "cccccc d.M.yyyy")}, ${
              item.startTime
            }-${item.endTime}`}</Wrapper>
          </StyledListItem>
        ))}
      </StyledList>
    </ListWrapper>
  );
};

const toMondayFirst = (day: 0 | 1 | 2 | 3 | 4 | 5 | 6) =>
  day === 0 ? 6 : day - 1;

const validator = timeSelectionSchema;

type GenInputType = z.infer<typeof validator>;

// NOTE Custom UTC date code because taking only the date part of Date results
// in the previous date in UTC+2 timezone
const MS_IN_DAY = 24 * 60 * 60 * 1000;
const eachDayOfInterval = (start: number, end: number, stepDays = 1) => {
  if (end < start || stepDays < 1) {
    return [];
  }
  const daysWithoutCeil = (end - start) / (MS_IN_DAY * stepDays);
  const days = Math.ceil(daysWithoutCeil);
  return Array.from(Array(days)).map(
    (_, i) => i * (MS_IN_DAY * stepDays) + start
  );
};

// epoch is Thue (4)
// TODO this could be combined with monday first
const dayOfWeek: (t: number) => 0 | 1 | 2 | 3 | 4 | 5 | 6 = (
  time: number
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
) => ((Math.floor(time / MS_IN_DAY) + 4) % 7) as any;

const generateReservations = (
  props: GenInputType
): NewReservationListItem[] => {
  const vals = validator.safeParse(props);

  if (!vals.success) {
    return [];
  }

  const {
    startingDate,
    startingTime,
    endingDate,
    endingTime,
    repeatPattern,
    repeatOnDays,
  } = vals.data;

  const utcDate = (d: Date) =>
    Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
  try {
    const min = (a: number, b: number) => (a < b ? a : b);
    const max = (a: number, b: number) => (a > b ? a : b);
    const sDay = max(utcDate(new Date()), utcDate(startingDate));

    const eDay = min(sDay + MS_IN_DAY * 7, utcDate(endingDate));
    const firstWeek = eachDayOfInterval(sDay, eDay);

    return firstWeek
      .filter((time) => repeatOnDays.includes(toMondayFirst(dayOfWeek(time))))
      .map((x) =>
        eachDayOfInterval(
          x,
          // end date with time 23:59:59
          utcDate(endingDate) + (MS_IN_DAY - 1),
          repeatPattern.value === "weekly" ? 7 : 14
        )
      )
      .reduce((acc, x) => [...acc, ...x], [])
      .map((day) => ({
        date: new Date(day),
        startTime: startingTime.value,
        endTime: endingTime.value,
      }))
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn("exception: ", e);
    // Date throws => don't crash
  }

  return [];
};

export { ReservationList, generateReservations };
export type { NewReservationListItem };
