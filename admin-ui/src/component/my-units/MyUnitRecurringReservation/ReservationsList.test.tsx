import React from "react";
import "@testing-library/jest-dom";
import { render } from "@testing-library/react";

import { addDays } from "date-fns";
import { toUIDate } from "common/src/common/util";
import { generateReservations, ReservationList } from "./ReservationsList";

const today = new Date();
const dtoday = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
const twoWeeksOnceAWeek = {
  startingDate: today,
  endingDate: addDays(dtoday, 14),
  startingTime: {
    label: "",
    value: "00:00",
  },
  endingTime: {
    label: "",
    value: "01:00",
  },
  repeatOnDays: [1],
  repeatPattern: {
    label: "",
    value: "weekly" as const, // | "biweekly";
  },
};

describe("generate reservations", () => {
  test("can generate reservations with valid data", () => {
    const res = generateReservations(twoWeeksOnceAWeek);
    expect(res).toHaveLength(2);
  });

  test("two weeks twice a week", () => {
    const res = generateReservations({
      ...twoWeeksOnceAWeek,
      repeatOnDays: [1, 3],
    });
    expect(res).toHaveLength(4);
  });

  // inclusive of both start and end
  test("two weeks every day a week => 14 elements", () => {
    const res = generateReservations({
      ...twoWeeksOnceAWeek,
      repeatOnDays: [0, 1, 2, 3, 4, 5, 6],
    });
    expect(res).toHaveLength(14);
  });

  /* TODO this test requires us to find next monday based on today
  test("repeat on moday with no monday on range => empty result", () => {
    const res = generateReservations({
      ...twoWeeksOnceAWeek,
      startingDate: new Date("2023-03-07"),
      endingDate: new Date("2023-03-13"),
      repeatOnDays: [0],
    });
    expect(res).toHaveLength(0);
  });
  */

  //  - (biweekly vs. weekly)
  test("four weeks once a week weekly", () => {
    const res = generateReservations({
      ...twoWeeksOnceAWeek,
      endingDate: addDays(dtoday, 28),
      repeatOnDays: [0],
    });
    expect(res).toHaveLength(4);
  });

  test("four weeks once a week biweekly", () => {
    const res = generateReservations({
      ...twoWeeksOnceAWeek,
      endingDate: addDays(dtoday, 28),
      repeatOnDays: [0],
      repeatPattern: {
        label: "",
        value: "biweekly",
      },
    });
    expect(res).toHaveLength(2);
  });

  test("start date > end date => empty array", () => {
    const res = generateReservations({
      ...twoWeeksOnceAWeek,
      startingDate: addDays(dtoday, 28),
      endingDate: addDays(dtoday, 20),
      repeatOnDays: [0],
    });
    expect(res).toHaveLength(0);
  });

  test.only("start date === end date => empty array", () => {
    const res = generateReservations({
      ...twoWeeksOnceAWeek,
      endingDate: addDays(dtoday, 28),
      startingDate: addDays(dtoday, 28),
      repeatOnDays: [0, 1, 2, 3, 4, 5, 6],
    });
    expect(res).toHaveLength(0);
  });
});

describe("ReservationsList", () => {
  test("Render reservations list", async () => {
    const items = [
      {
        date: new Date(),
        startTime: "19:00",
        endTime: "20:00",
      },
    ];

    const screen = render(<ReservationList items={items} />);

    const dstring = `${toUIDate(today)}`;
    expect(await screen.findByText("19:00")).toBeInTheDocument();
    expect(await screen.findByText("20:00")).toBeInTheDocument();
    expect(await screen.findByText(dstring)).toBeInTheDocument();
  });

  test("Render reservations list", async () => {
    const N_DAYS = 5;
    const items = Array.from(Array(N_DAYS)).map((_, i) => ({
      date: addDays(new Date(), i),
      startTime: "19:00",
      endTime: "20:00",
    }));

    const screen = render(<ReservationList items={items} />);

    const dstring = `${toUIDate(today)}`;
    expect(await screen.findAllByText("19:00")).toHaveLength(N_DAYS);
    expect(await screen.findAllByText("20:00")).toHaveLength(N_DAYS);
    expect(await screen.findByText(dstring)).toBeInTheDocument();
  });
});
