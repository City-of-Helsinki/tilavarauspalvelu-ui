import { addHours, format, subDays } from "date-fns";
import { formatDate } from "../../../common/util";
import { reservationSchema } from "./validator";

describe("with schema", () => {
  const futureStartTime = format(addHours(new Date(), 1), "HH:mm");
  const futureEndTime = format(addHours(new Date(), 2), "HH:mm");

  const today = formatDate(new Date().toISOString(), "d.M.yyyy");

  test(`todays date ${today} is valid`, () => {
    const validationResult = reservationSchema.validate({
      type: "BLOCKED",
      date: today,
      startTime: futureStartTime,
      endTime: futureEndTime,
    });

    expect(validationResult.error).toBeUndefined();
  });

  const yesterday = formatDate(
    subDays(new Date(), 1).toISOString(),
    "d.M.yyyy"
  );

  test(`yesterdays date ${yesterday} is not valid`, () => {
    const validationResult = reservationSchema.validate({
      type: "BLOCKED",
      date: yesterday,
      startTime: futureStartTime,
      endTime: futureEndTime,
    });
    expect(validationResult.error?.details[0].path[0]).toEqual("date");
  });
});
