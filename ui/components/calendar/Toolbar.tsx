import React from "react";
import { IconAngleLeft, IconAngleRight } from "hds-react";
import { i18n } from "next-i18next";
import classNames from "classnames";
import { format, startOfWeek, endOfWeek } from "date-fns";
import fi from "date-fns/locale/fi";
import styled from "styled-components";

export type ToolbarProps = {
  onNavigate: (n: string) => void;
  onView: (n: string) => void;
  view: string;
  date: Date;
};

const locales = {
  fi,
};

const Wrapper = styled.div`
  &:before {
    content: "";
    display: block;
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: -5px;
    z-index: 21;
  }

  & > * {
    z-index: 22;
  }
  display: flex;
  position: relative;
  justify-content: space-between;
  margin-top: var(--spacing-m);
  margin-bottom: 0;
  padding-bottom: var(--spacing-xs);

  .rbc-toolbar-label {
    &:first-letter {
      text-transform: capitalize;
    }
    font-family: var(--font-medium);
    font-weight: 500;
    font-size: var(--fontsize-body-l);
  }

  .rbc-toolbar-navigation-hz {
    display: flex;
    align-items: center;
    justify-content: space-between;
    order: 3;
    width: 100%;
    height: 50px;

    @media (min-width: 810px) {
      order: unset;
      width: 40%;
      height: unset;
    }
  }

  button {
    &.rbc-toolbar-button--borderless {
      border: none;
      color: var(--color-gray-dark);
      margin-bottom: 0;
    }

    &[disabled] {
      border-color: var(--color-black-30);
      color: var(--color-black-30);
    }

    cursor: pointer;
    border-radius: 0;
    border: 2px solid var(--color-black);
    font-family: var(--font-medium) !important;
    font-weight: 500;
    color: var(--color-black);
    font-size: var(--fontsize-body-m);
    height: 44px;
    user-select: none;
    margin-bottom: var(--spacing-xs);
  }

  .rbc-btn-group {
    width: 100%;

    button {
      &.rbc-active {
        &:first-of-type,
        &:last-of-type {
          &:hover {
            border-color: var(--color-bus);
          }

          border-color: var(--color-bus);
        }

        cursor: default;
        background-color: var(--color-bus);
        color: var(--color-white);
        border-color: var(--color-bus);
      }

      &:first-of-type,
      &:last-of-type {
        &:hover {
          border-color: var(--color-black-30);
        }

        border-right: 2px solid var(--color-black);
        border-left: 2px solid var(--color-black);
      }

      cursor: pointer;
      border-right: 1px solid var(--color-black);
      border-left: 1px solid var(--color-black);
      font-family: var(--font-bold);
      width: 33.333%;
    }

    @media (min-width: 400px) {
      width: unset;

      button {
        width: unset;
      }
    }
  }
`;

const ButtonWrapper = styled.div`
  display: flex;
  gap: var(--spacing-s);
  order: 2;

  @media (min-width: 400px) {
    order: unset;
  }
`;

const Toolbar = ({ onNavigate, onView, view, date }: ToolbarProps) => {
  const culture = { locale: locales[i18n.language] };

  let title = "";
  switch (view) {
    case "day": {
      const year = format(date, "yyyy", culture);
      const currentYear = format(new Date(), "yyyy");
      const dateStr = currentYear !== year ? "EEEEEE d.M yyyy" : "EEEEEE d.M";

      title = format(date, dateStr, culture);
      break;
    }
    case "week":
    default: {
      const start = startOfWeek(date, culture);
      const end = endOfWeek(date, culture);
      const startDay = format(start, "d", culture);
      const endDay = format(end, "d", culture);
      const startMonth = format(start, "M", culture);
      const endMonth = format(end, "M", culture);
      const startYear = format(start, "yyyy", culture);
      const endYear = format(end, "yyyy", culture);
      const currentYear = format(new Date(), "yyyy", culture);
      title = `${startDay}.${startMonth !== endMonth ? `${startMonth}.` : ""}${
        startYear !== endYear ? `${startYear}` : ""
      } – ${endDay}.${endMonth}.${
        startYear !== endYear || endYear !== currentYear ? `${endYear}` : ""
      }`;
    }
  }

  return (
    <Wrapper className="rbc-toolbar">
      <ButtonWrapper>
        <button
          type="button"
          onClick={() => {
            onNavigate("TODAY");
          }}
          aria-label={i18n.t("reservationCalendar:showCurrentDay")}
        >
          {i18n.t("common:today")}
        </button>
      </ButtonWrapper>
      <div className="rbc-toolbar-navigation-hz">
        <button
          className="rbc-toolbar-button--borderless"
          type="button"
          onClick={() => onNavigate("PREV")}
          aria-label={i18n.t("reservationCalendar:showPrevious", {
            view: String(i18n.t(`common:${view}`)).toLowerCase(),
          })}
        >
          <IconAngleLeft />
        </button>
        <div className="rbc-toolbar-label">{title}</div>
        <button
          className="rbc-toolbar-button--borderless"
          type="button"
          onClick={() => onNavigate("NEXT")}
          aria-label={i18n.t("reservationCalendar:showNext", {
            view: String(i18n.t(`common:${view}`)).toLowerCase(),
          })}
        >
          <IconAngleRight />
        </button>
      </div>
      <div className="rbc-btn-group">
        <button
          className={classNames("", {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            "rbc-active": view === "day",
          })}
          type="button"
          onClick={() => onView("day")}
          aria-label={i18n.t("reservationCalendar:showView", {
            view: String(i18n.t("common:day")).toLowerCase(),
          })}
        >
          {i18n.t("common:day")}
        </button>
        <button
          className={classNames("", {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            "rbc-active": view === "week",
          })}
          type="button"
          onClick={() => onView("week")}
          aria-label={i18n.t("reservationCalendar:showView", {
            view: String(i18n.t("common:week")).toLowerCase(),
          })}
        >
          {i18n.t("common:week")}
        </button>
      </div>
    </Wrapper>
  );
};

export { Toolbar };
