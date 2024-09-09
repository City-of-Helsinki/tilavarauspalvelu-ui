import React, { useMemo } from "react";
import { Button } from "hds-react";
import { useTranslation } from "next-i18next";
import styled from "styled-components";
import { chunkArray, fromUIDate, toUIDate } from "common/src/common/util";
import { fontBold, H4 } from "common/src/common/typography";
import type { ReservationUnitPageQuery } from "@gql/gql-types";
import { breakpoints } from "common";
import {
  getReservationUnitPrice,
  isReservationUnitFreeOfCharge,
} from "@/modules/reservationUnit";
import Carousel from "../Carousel";
import { getLastPossibleReservationDate } from "@/components/reservation-unit/utils";
import {
  Control,
  FieldValues,
  type SubmitHandler,
  type UseFormReturn,
} from "react-hook-form";
import { ControlledDateInput } from "common/src/components/form";
import { type PendingReservationFormType } from "@/components/reservation-unit/schema";
import { ControlledSelect } from "@/components/common/ControlledSelect";
import { getSelectedOption } from "@/modules/util";
import { type FocusTimeSlot } from "@/modules/reservation";

type QueryT = NonNullable<ReservationUnitPageQuery["reservationUnit"]>;
type Props = {
  reservationUnit: QueryT;
  subventionSuffix: JSX.Element | undefined;
  reservationForm: UseFormReturn<PendingReservationFormType>;
  durationOptions: { label: string; value: number }[];
  startingTimeOptions: { label: string; value: string }[];
  focusSlot: FocusTimeSlot | null;
  nextAvailableTime: Date | null;
  submitReservation: SubmitHandler<PendingReservationFormType>;
  LoginAndSubmit: JSX.Element;
  className?: string;
  style?: React.CSSProperties;
};

const Form = styled.form`
  background-color: var(--color-gold-light);
  padding: var(--spacing-m);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-m);
  justify-content: space-between;

  @media (min-width: ${breakpoints.m}) {
    /* hack for page jumping when the size of the component changes */
    height: 391.797px;
    /* grid resize causes issues, so use fixed width */
    width: calc(390px - var(--spacing-m) * 2);
  }
`;

const Heading = styled(H4).attrs({ as: "h3" })`
  margin: 0;
`;

const Price = styled.div`
  & > * {
    display: inline-block;
  }
  padding-bottom: var(--spacing-m);
  height: var(--spacing-m);
  &:empty {
    display: none;
  }
`;

const Selects = styled.div`
  display: grid;
  gap: var(--spacing-m);
  grid-template-columns: 1fr;

  @media (min-width: ${breakpoints.s}) {
    grid-template-columns: 1fr 1fr;
  }
`;

const PriceValue = styled.div`
  ${fontBold}
`;

const Subheading = styled.div`
  font-size: var(--fontsize-heading-xs);
`;

const SlotGroup = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(4, 50px);
  gap: var(--spacing-s) var(--spacing-2-xs);
  justify-content: center;

  @media (min-width: ${breakpoints.s}) {
    gap: var(--spacing-s) var(--spacing-s);
  }
`;

const Slot = styled.li<{ $active: boolean }>`
  box-sizing: border-box;
  background-color: var(--color-white);
  font-size: var(--fontsize-body-s);
  display: flex;
  justify-content: center;
  align-items: center;
  height: 32px;
  border-width: 2px;
  border-style: solid;
  border-color: ${({ $active }) =>
    $active ? "var(--color-black-80)" : "var(--color-white)"};
`;

const SlotButton = styled.button`
  background-color: transparent;
  cursor: pointer;
  border: none;
  white-space: nowrap;
  user-select: none;
`;

const StyledSelect = styled(ControlledSelect)`
  li[role="option"] {
    white-space: nowrap;
  }
`;

const NoTimes = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: var(--spacing-m);
  margin: var(--spacing-s) 0 calc(var(--spacing-s) * -1) 0;
`;

const ActionWrapper = styled.div`
  display: flex;
  justify-content: space-between;
`;

export function QuickReservation({
  reservationUnit,
  subventionSuffix,
  reservationForm,
  focusSlot,
  durationOptions,
  startingTimeOptions,
  nextAvailableTime,
  submitReservation,
  LoginAndSubmit,
  className,
  style,
}: Props): JSX.Element | null {
  const { t } = useTranslation();
  const { control, watch, handleSubmit } = reservationForm;
  const formDate = watch("date");
  const dateValue = useMemo(() => fromUIDate(formDate ?? ""), [formDate]);
  const duration = watch("duration");

  const isFreeOfCharge = isReservationUnitFreeOfCharge(
    reservationUnit?.pricings ?? [],
    dateValue ?? new Date()
  );

  const price = getReservationUnitPrice({
    reservationUnit,
    pricingDate: dateValue ?? new Date(),
    minutes: duration,
  });

  const lastPossibleDate = getLastPossibleReservationDate(
    reservationUnit ?? undefined
  );

  return (
    <Form
      id="quick-reservation"
      noValidate
      onSubmit={handleSubmit(submitReservation)}
      className={className}
      style={style}
    >
      <Heading>{t("reservationCalendar:quickReservation.heading")}</Heading>
      <Selects>
        <ControlledDateInput
          id="quick-reservation-date"
          name="date"
          control={control}
          label={t("reservationCalendar:startDate")}
          initialMonth={dateValue ?? new Date()}
          minDate={new Date()}
          maxDate={lastPossibleDate ?? undefined}
          disableConfirmation={false}
        />
        <StyledSelect
          name="duration"
          // react-hook-form has issues with typing generic Select
          control={control as unknown as Control<FieldValues>}
          label={t("reservationCalendar:duration")}
          options={durationOptions}
        />
      </Selects>

      <Subheading>
        {t("reservationCalendar:quickReservation.subheading")}
      </Subheading>
      <div>
        <TimeChunkSection
          startingTimeOptions={startingTimeOptions}
          reservationForm={reservationForm}
          nextAvailableTime={nextAvailableTime}
          durationString={
            getSelectedOption(duration, durationOptions)?.label.trim() ?? ""
          }
        />
      </div>
      <ActionWrapper>
        <Price data-testid="quick-reservation-price">
          {focusSlot?.isReservable && (
            <>
              {t("reservationUnit:price")}: <PriceValue>{price}</PriceValue>
              {!isFreeOfCharge && subventionSuffix}
            </>
          )}
        </Price>
        {focusSlot?.isReservable && LoginAndSubmit}
      </ActionWrapper>
    </Form>
  );
}

function TimeChunkSection({
  startingTimeOptions,
  reservationForm: form,
  nextAvailableTime,
  durationString,
}: Pick<
  Props,
  "startingTimeOptions" | "reservationForm" | "nextAvailableTime"
> & {
  durationString: string;
}) {
  const { t } = useTranslation();
  const { setValue, watch } = form;

  // A map of all available times for the day, chunked into groups of 8
  const timeChunks: string[][] = useMemo(() => {
    const itemsPerChunk = 8;

    return chunkArray(
      startingTimeOptions.map((opt) => opt.label),
      itemsPerChunk
    );
  }, [startingTimeOptions]);

  // Find out which slide has the slot that reflects the selected focusSlot
  let activeChunk = 0;
  for (let i = 0; i < timeChunks.length; i++) {
    if (
      timeChunks[i].some((item) => {
        return item === watch("time");
      })
    ) {
      activeChunk = i;
    }
  }

  if (startingTimeOptions.length === 0) {
    return (
      <NoTimes>
        <span>
          {t("reservationCalendar:quickReservation.noTimes", {
            duration: durationString,
          })}
        </span>
        {nextAvailableTime != null && (
          <Button
            data-testid="quick-reservation-next-available-time"
            type="button"
            onClick={(e) => {
              e.preventDefault();
              setValue("date", toUIDate(nextAvailableTime), {
                shouldDirty: true,
              });
            }}
          >
            {t("reservationCalendar:quickReservation.nextAvailableTime")}
          </Button>
        )}
      </NoTimes>
    );
  }

  return (
    <Carousel hideCenterControls wrapAround={false} slideIndex={activeChunk}>
      {timeChunks.map((chunk: string[]) => (
        <SlotGroup key={chunk[0]}>
          {chunk.map((value: string) => (
            <Slot $active={watch("time") === value} key={value}>
              <SlotButton
                data-testid="quick-reservation-slot"
                onClick={() => setValue("time", value, { shouldDirty: true })}
                type="button"
              >
                {value}
              </SlotButton>
            </Slot>
          ))}
        </SlotGroup>
      ))}
    </Carousel>
  );
}
