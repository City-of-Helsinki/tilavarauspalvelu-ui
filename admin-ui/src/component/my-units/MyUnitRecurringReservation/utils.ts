import { parse } from "date-fns";

// TODO move the utility code somewhere else (we could use it in the calendar also)
export type DateRange = {
  begin: Date;
  end: Date;
};

// TODO equality check or no? does 08:00 - 09:00 and 09:00 - 10:00 overlap or no?
const isDateInRange = (a: Date, range: DateRange) => {
  if (a > range.begin && a < range.end) {
    return true;
  }
  return false;
};

// TODO write tests for this (there are some fail cases on full overlaps)
// e.g. 9:00 - 10:00 and 9 - 10 overlap but this fails
export const isOverllaping = (a: DateRange, b: DateRange) => {
  if (isDateInRange(a.begin, b) || isDateInRange(a.end, b)) {
    return true;
  }
  if (isDateInRange(b.begin, a) || isDateInRange(b.end, a)) {
    return true;
  }
  return false;
};

// no exception wrapping because parse only throws on invalid format strings (not on invalid inputs)
export const convertToDate = (d: Date, time: string) => {
  if (!d || Number.isNaN(d.getTime())) {
    return undefined;
  }
  const res = parse(time, "HH:mm", d);
  return !Number.isNaN(res.getTime()) ? res : undefined;
};
