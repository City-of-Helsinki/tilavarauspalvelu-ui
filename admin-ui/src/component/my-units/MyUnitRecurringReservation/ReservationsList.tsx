import { toUIDate } from "common/src/common/util";
import { eachDayOfInterval, getDay } from "date-fns";
import React from "react";
import styled from "styled-components";
import { z } from "zod";
import { RecurringReservationFormSchema } from "./RecurringReservationSchema";

type NewReservationListItem = {
  date: Date;
  startTime: string;
  endTime: string;
};

type Props = {
  items: NewReservationListItem[];
};

// TODO the 22rem for max-height is defined with the label, but scroll doesn't work unless it's defined here
// check what the real measurement is
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

const tenYearsInMs = 10 * 365 * 24 * 60 * 60 * 1000;

// TODO duplicated code for refinements because of innerType
// TODO these aren't shown to the user (since they are here and not in the form validation)
// after removing the dupes check that this is shown to the user also
const validator = RecurringReservationFormSchema.innerType()
  .pick({
    startingDate: true,
    endingDate: true,
    startingTime: true,
    endingTime: true,
    repeatOnDays: true,
    repeatPattern: true,
  })
  // TODO should we add startDate >= today? or near at least
  .refine((schema) => schema.startingDate < schema.endingDate, {
    message: "start date can't be after end date",
  })
  // Need to have a year limit otherwise a single backspace can crash the application (due to computing).
  // 1.1.2023 -> press backspace => 1.1.203 calculates the interval of 1820 years.
  // distance(startDate, endDate) < 10 years
  .refine(
    (schema) =>
      Math.abs(schema.endingDate.getTime() - schema.startingDate.getTime()) <
      tenYearsInMs,
    {
      message: "start and end time needs to be within a decade",
    }
  )
  // start time < end time (weird time format)
  .refine(
    (schema) =>
      Number(schema.startingTime.value.replace(":", ".")) <
      Number(schema.endingTime.value.replace(":", ".")),
    { message: "start time can't be after end time" }
  );

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
    // TODO implement repeatPattern
    // repeatPattern,
    repeatOnDays,
  } = vals.data;

  const newReservations = eachDayOfInterval({
    start: startingDate,
    end: endingDate,
  })
    .filter((day) => repeatOnDays.includes(toMondayFirst(getDay(day))))
    .map((day) => ({
      date: day,
      startTime: startingTime.value,
      endTime: endingTime.value,
    }));

  return newReservations;
};

export { ReservationList, generateReservations };
export type { NewReservationListItem };
