import { toUIDate } from "common/src/common/util";
import { addDays, eachDayOfInterval, getDay, max, min } from "date-fns";
import React from "react";
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

  // TODO write a test for this
  //  - (biweekly vs. weekly)
  //  - edge cases (first day / last day inclusion)
  //  - empty / invalid ranges (start > end; start === end etc.)
  try {
    const sDay = max([startingDate, new Date()]);
    const firstWeek = eachDayOfInterval({
      start: sDay,
      end: min([addDays(sDay, 6), endingDate]),
    });

    return firstWeek
      .filter((day) => repeatOnDays.includes(toMondayFirst(getDay(day))))
      .map((x) =>
        eachDayOfInterval(
          {
            start: x,
            end: endingDate,
          },
          {
            step: repeatPattern.value === "weekly" ? 7 : 14,
          }
        )
      )
      .reduce((acc, x) => [...acc, ...x], [])
      .map((day) => ({
        date: day,
        startTime: startingTime.value,
        endTime: endingTime.value,
      }))
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  } catch (e) {
    // date-fns throws => don't crash
    console.warn("date-fns exception:", e);
  }

  return [];
};

export { ReservationList, generateReservations };
export type { NewReservationListItem };
