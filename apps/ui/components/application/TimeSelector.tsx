import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useTranslation } from "next-i18next";
import { Button, ButtonVariant, IconCross, Select } from "hds-react";
import type { ApplicationEventSchedulePriority } from "common/types/common";
import { fontRegular } from "common/src/common/typography";
import { breakpoints } from "common/src/common/style";
import {
  convertOptionToHDS,
  fromMondayFirstUnsafe,
  toNumber,
} from "common/src/helpers";
import { WEEKDAYS } from "common/src/const";
import { arrowDown, arrowUp, MediumButton } from "@/styles/util";
import { TimePreview } from "./TimePreview";
import { type ApplicationEventScheduleFormType } from "./Form";
import { useController, UseFormReturn } from "react-hook-form";
import { ControlledSelect } from "common/src/components/form";
import { Flex } from "common/styles/util";
import { convertLanguageCode } from "common/src/common/util";

type Cell = {
  hour: number;
  label: string;
  state: ApplicationEventSchedulePriority;
  key: string;
};

export type TimeSelectorFormValues = {
  reservationUnitPks: number[];
  priority: ApplicationEventSchedulePriority;
};

type Props = {
  index: number;
  cells: Cell[][];
  updateCells: (i: number, cells: Cell[][]) => void;
  copyCells: ((i: number) => void) | null;
  resetCells: () => void;
  summaryData: [
    ApplicationEventScheduleFormType[],
    ApplicationEventScheduleFormType[],
  ];
  reservationUnitOptions: { label: string; value: number }[];
  form: UseFormReturn<TimeSelectorFormValues>;
};

const CalendarHead = styled.div`
  font-family: var(--font-bold);
  font-size: var(--fontsize-body-l);
  text-align: center;
  padding: var(--spacing-2-xs) 0;
`;

const TimeSelectionButton = styled.button<{
  state: ApplicationEventSchedulePriority | boolean;
  firstRow: boolean;
}>`
  --border-color: var(--color-black-50);

  display: block;
  width: 100%;
  font-size: var(--fontsize-heading-m);
  color: ${(props) =>
    props.state ? "var(--color-white)" : "var(--color-black)"};
  padding: 0.24em 0.5em;
  border: 1px solid var(--border-color);
  border-top: ${(props) =>
    props.firstRow ? "1px solid var(--border-color)" : "none"};
  ${(props) =>
    props.state === 300
      ? `
    &:after {
      ${arrowUp}
      left: 4px;
      top: 6px;
      border-bottom-color: var(--color-white);
    }
    background: var(--tilavaraus-calendar-selected);
    color: var(--color-white);
    border-bottom-color: var(--color-black-60);
  `
      : props.state === 200
        ? `
    &:after {
      ${arrowDown}
      left: 4px;
      top: 6px;
      border-top-color: var(--color-black);
    }
    background: var(--tilavaraus-calendar-selected-secondary);
    color: var(--color-black);
  `
        : `
    background: ${
      props.state === 100 ? "var(--color-white)" : "var(--color-black-10)"
    };
    font-weight: ${props.state === 100 ? "bold" : "normal"};
    color: var(--color-black);
  `};
  white-space: nowrap;
  position: relative;
  cursor: pointer;
`;

const Day = ({
  head,
  labelHead,
  cells,
  setCellValue,
  paintState,
  setPaintState,
  painting,
  setPainting,
  priority,
}: {
  head: string;
  labelHead: string;
  cells: Cell[];
  setCellValue: (
    selection: Cell,
    mode: ApplicationEventSchedulePriority | false
  ) => void;
  setPaintState: (state: ApplicationEventSchedulePriority | false) => void;
  paintState: ApplicationEventSchedulePriority | false;
  painting: boolean;
  setPainting: (state: boolean) => void;
  priority: ApplicationEventSchedulePriority;
}): JSX.Element => {
  const { t } = useTranslation();

  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    if ("ontouchstart" in window) setIsTouchDevice(true);
  }, []);

  return (
    <div>
      <CalendarHead>{head}</CalendarHead>
      {cells.map((cell, cellIndex) => {
        let ariaLabel = "";
        switch (cell.state) {
          case 300:
            ariaLabel = t("application:Page2.legend.selected-1");
            break;
          case 200:
            ariaLabel = t("application:Page2.legend.selected-2");
            break;
          case 100:
            ariaLabel = t("application:Page2.legend.within-opening-hours");
            break;
          case 50:
            ariaLabel = t("application:Page2.legend.outside-opening-hours");
            break;
          default:
        }

        return (
          <TimeSelectionButton
            key={cell.key}
            state={cell.state}
            firstRow={cellIndex === 0}
            type="button"
            onMouseDown={() => {
              const state = priority === cell.state ? false : priority;

              if (isTouchDevice) {
                setCellValue(cell, state);
                return;
              }

              setPaintState(state);
              setCellValue(cell, state);
              setPainting(true);
            }}
            onMouseUp={() => {
              setPainting(false);
            }}
            onKeyPress={() => {
              const state = priority === cell.state ? false : priority;
              setCellValue(cell, state);
            }}
            onMouseEnter={() => {
              if (painting) {
                setCellValue(cell, paintState);
              }
            }}
            role="option"
            aria-label={`${ariaLabel ? `${ariaLabel}: ` : ""}${labelHead} ${
              cell.label
            }`}
            aria-selected={cell.state > 100}
            data-testid={`time-selector__button--${cell.key}`}
          >
            {cell.label}
          </TimeSelectionButton>
        );
      })}
    </div>
  );
};

const CalendarContainer = styled.div`
  margin-top: var(--spacing-layout-s);
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  column-gap: 6px;
  overflow-x: scroll;
  width: 90vw;
  user-select: none;

  @media (min-width: ${breakpoints.l}) {
    overflow-x: auto;
    width: 100%;
  }
`;

const LegendContainer = styled.div`
  display: block;
  margin-top: var(--spacing-m);
  margin-bottom: var(--spacing-m);

  @media (min-width: ${breakpoints.m}) {
    & > div {
      display: flex;
    }

    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-template-rows: repeat(2, 1fr);
  }
`;

const Legend = styled.div<{ $idx: number }>`
  display: flex;
  align-items: center;
  margin-right: 3em;
  margin-bottom: var(--spacing-xs);
  /* position the legend items correctly (in relation to the reset button):
  the first two are on the first row, and even ones are in the first column */
  ${(props) => props.$idx < 2 && "grid-row: 1;"}
  ${(props) => props.$idx % 2 === 0 && "grid-column: 1;"}
  @media (min-width: ${breakpoints.m}) {
    margin-bottom: 0;
  }
`;

const LegendBox = styled.div<{ type: string }>`
  ${(props) =>
    props.type === "unavailable" &&
    `
    background-image: repeating-linear-gradient(135deg, currentColor 0, currentColor 1px, transparent 0, transparent 10%);
  `}
  ${(props) =>
    props.type === "selected-1" &&
    `
    &:after {
      ${arrowUp}
      left: 4px;
      top: 6px;
      border-bottom-color: var(--color-white);
    }
    background-color: var(--tilavaraus-calendar-selected);
  `}
  ${(props) =>
    props.type === "selected-2" &&
    `
    &:after {
      ${arrowDown}
      left: 4px;
      top: 6px;
      border-top-color: var(--color-black);
    }

    background-color: var(--tilavaraus-calendar-selected-secondary);
  `}
  ${(props) =>
    props.type === "within-opening-hours" &&
    `
    background-color: var(--color-white);
    border: 1px solid var(--color-black-50);
   `}
  ${(props) =>
    props.type === "outside-opening-hours" &&
    `
    background-color: var(--color-black-10);
    border: 1px solid var(--color-black-50);
   `}
  margin-right: 1em;
  width: 37px;
  height: 37px;
  position: relative;

  @media (max-width: ${breakpoints.s}) {
    margin-right: var(spacing-xs);
  }
`;

const LegendLabel = styled.div`
  white-space: nowrap;
`;

const TimePreviewContainer = styled.div`
  margin: var(--spacing-xl) 0;
`;

const ButtonContainer = styled(Flex).attrs({
  $direction: "row",
  $gap: "none",
})`
  margin-top: var(--spacing-layout-l);
  margin-bottom: var(--spacing-layout-s);
`;

const ResetButton = styled(Button)`
  --color-bus: var(--color-black);
  grid-row: 1;
  grid-column: 3;
  & > span {
    display: flex;
    gap: var(--spacing-2-xs);
    padding-left: 0;
    align-items: center;
  }
  &:hover {
    --background-color-hover-focus: var(--color-black-15);
    --background-color-hover: var(--color-black-5);
    --color-hover: var(--color-black-90);
    --color-hover-focus: var(--color-hover);
  }

  ${fontRegular};
`;

/// TODO what is the responsibility of this component?
/// Why does it take a bucket full of props?
/// Why is it used in only two different places?
/// TODO why does it require some Cell functions in the props? what are these?
/// TODO why is the summaryData type so weird?
/// TODO why is the summaryData coupled with the Selector? instead of passing JSX child element or a JSX component?
/// TODO why does summaryData include priority but is split by priority also? one of these is redundant
export function TimeSelector({
  cells,
  updateCells,
  copyCells,
  resetCells,
  index,
  summaryData,
  reservationUnitOptions,
  form,
}: Props): JSX.Element | null {
  const { t } = useTranslation();
  const [paintState, setPaintState] = useState<
    ApplicationEventSchedulePriority | false
  >(false); // toggle value true = set, false = clear: ;
  const [painting, setPainting] = useState(false); // is painting 'on'

  const cellTypes = [
    {
      type: "within-opening-hours",
      label: t("application:Page2.legend.within-opening-hours"),
    },
    {
      type: "outside-opening-hours",
      label: t("application:Page2.legend.outside-opening-hours"),
    },
    {
      type: "selected-1",
      label: t("application:Page2.legend.selected-1"),
    },
    {
      type: "selected-2",
      label: t("application:Page2.legend.selected-2"),
    },
  ];

  const { watch } = form;
  const priority = watch("priority");

  if (!cells) {
    return null;
  }

  const setCellValue = (
    selection: Cell,
    value: ApplicationEventSchedulePriority | false
  ): void => {
    updateCells(
      index,
      cells.map((day) => [
        ...day.map((h) =>
          h.key === selection.key
            ? { ...h, state: value === false ? 100 : value }
            : h
        ),
      ])
    );
  };

  return (
    <>
      <OptionSelector
        reservationUnitOptions={reservationUnitOptions}
        form={form}
        index={index}
      />
      <CalendarContainer
        onMouseLeave={() => setPainting(false)}
        aria-multiselectable
        aria-labelledby={`timeSelector-${index}`}
        role="listbox"
      >
        {WEEKDAYS.map((day) => (
          <Day
            paintState={paintState}
            setPaintState={setPaintState}
            painting={painting}
            setPainting={setPainting}
            key={`day-${day}`}
            head={t(`common:weekDayLong.${fromMondayFirstUnsafe(day)}`)}
            labelHead={t(`common:weekDay.${fromMondayFirstUnsafe(day)}`)}
            cells={cells[day]}
            setCellValue={setCellValue}
            priority={priority}
          />
        ))}
      </CalendarContainer>
      <LegendContainer>
        {cellTypes.map((cell, idx) => (
          <Legend key={cell.label} $idx={idx}>
            <LegendBox type={cell.type} />
            <LegendLabel>{cell.label}</LegendLabel>
          </Legend>
        ))}
        <ResetButton
          id={`time-selector__button--reset-${index}`}
          variant={ButtonVariant.Supplementary}
          onClick={() => resetCells()}
          iconStart={<IconCross />}
          disabled={!cells.some((day) => day.some((cell) => cell.state > 100))}
        >
          {t("application:Page2.resetTimes")}
        </ResetButton>
      </LegendContainer>
      <TimePreviewContainer data-testid={`time-selector__preview-${index}`}>
        <TimePreview primary={summaryData[0]} secondary={summaryData[1]} />
      </TimePreviewContainer>
      {copyCells && (
        <ButtonContainer>
          <MediumButton
            id={`time-selector__button--copy-cells-${index}`}
            variant={ButtonVariant.Secondary}
            onClick={() => copyCells(index)}
          >
            {t("application:Page2.copyTimes")}
          </MediumButton>
        </ButtonContainer>
      )}
    </>
  );
}

const OptionWrapper = styled.div`
  margin-top: var(--spacing-m);
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--spacing-s);
  @media (min-width: ${breakpoints.s}) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

function OptionSelector({
  reservationUnitOptions,
  form,
  index,
}: Pick<Props, "reservationUnitOptions" | "form" | "index">) {
  const { t, i18n } = useTranslation();
  const { control } = form;

  const priorityOptions = [300, 200].map((n) => ({
    label: t(`application:Page2.priorityLabels.${n}`),
    value: n,
  }));

  const language = convertLanguageCode(i18n.language);

  const {
    field: { value, onChange },
  } = useController({ name: "reservationUnitPks", control });
  const hdsValue = reservationUnitOptions
    .filter((o) => o.value === value[index])
    .map(convertOptionToHDS);
  return (
    <OptionWrapper>
      <ControlledSelect
        name="priority"
        label={t("application:Page2.prioritySelectLabel")}
        control={control}
        options={priorityOptions}
      />
      <Select
        options={reservationUnitOptions.map(convertOptionToHDS)}
        clearable={false}
        noTags
        texts={{
          label: t("application:Page2.reservationUnitSelectLabel"),
          placeholder: t("common:select"),
          language,
        }}
        value={hdsValue}
        onChange={(v) => {
          const val = toNumber(v[0].value);
          if (val != null) {
            const arr = [...value];
            arr[index] = val;
            onChange(arr);
          }
        }}
      />
    </OptionWrapper>
  );
}
