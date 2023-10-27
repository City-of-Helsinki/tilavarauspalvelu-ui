// TODO this file should be moved to application/ since the only user is Page1
// also remove default export
import React, { useRef } from "react";
import { Checkbox, DateInput, NumberInput, Select, TextInput } from "hds-react";
import { useTranslation } from "next-i18next";
import { Controller, useFormContext } from "react-hook-form";
import styled from "styled-components";
import { LocalizationLanguages, OptionType } from "common/types/common";
import type { ApplicationRoundNode } from "common/types/gql-types";
import { fontRegular, H5 } from "common/src/common/typography";
import { breakpoints } from "common/src/common/style";
import { CheckboxWrapper } from "common/src/reservation-form/components";
import { ReservationUnitList } from "./ReservationUnitList";
import {
  apiDateToUIDate,
  applicationErrorText,
  formatApiDate,
  formatDate,
  uiDateToApiDate,
} from "@/modules/util";
import { ApplicationEventSummary } from "./ApplicationEventSummary";
import ControlledSelect from "../common/ControlledSelect";
import Accordion from "../common/Accordion";
import { getDurationNumberOptions } from "@/modules/const";
import { after, before } from "@/modules/validation";
import ConfirmationModal, { ModalRef } from "../common/ConfirmationModal";
import { MediumButton } from "@/styles/util";
import { ApplicationFormValues } from "./Form";

type OptionTypes = {
  ageGroupOptions: OptionType[];
  purposeOptions: OptionType[];
  abilityGroupOptions: OptionType[];
  reservationUnitTypeOptions: OptionType[];
  participantCountOptions: OptionType[];
  unitOptions: OptionType[];
};

type Props = {
  index: number;
  applicationRound: ApplicationRoundNode;
  optionTypes: OptionTypes;
  isVisible: boolean;
  onToggleAccordian: () => void;
  onDeleteEvent: () => void;
};

const Wrapper = styled.div`
  margin-bottom: var(--spacing-s);
`;

const SubHeadLine = styled(H5).attrs({
  as: "h2",
})`
  margin-top: var(--spacing-layout-m);
`;

const TwoColumnContainer = styled.div`
  margin-top: var(--spacing-l);
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-l);

  label {
    ${fontRegular};
  }

  @media (max-width: ${breakpoints.m}) {
    grid-template-columns: 1fr;
  }
`;

const PeriodContainer = styled.div`
  margin-top: var(--spacing-m);
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-l);
  align-items: baseline;
  margin-bottom: var(--spacing-layout-s);

  label {
    ${fontRegular};
  }

  @media (max-width: ${breakpoints.m}) {
    grid-template-columns: 1fr;
  }
`;

const ActionContainer = styled.div`
  display: flex;
  flex-direction: column-reverse;
  margin-top: var(--spacing-layout-l);
  gap: var(--spacing-l);

  @media (min-width: ${breakpoints.m}) {
    flex-direction: row;
    justify-content: space-between;
    gap: var(--spacing-l);
  }
`;

const Button = styled(MediumButton)`
  width: 100%;

  @media (min-width: ${breakpoints.m}) {
    width: 250px;
  }
`;

const ApplicationEventInner = ({
  index,
  applicationRound,
  optionTypes,
  del,
}: Omit<Props, "onToggleAccordian" | "onDeleteEvent"> & {
  del: () => void;
}): JSX.Element => {
  const { t, i18n } = useTranslation();
  const form = useFormContext<ApplicationFormValues>();
  const {
    register,
    formState: { errors },
    setValue,
    watch,
  } = form;

  const periodStartDate = formatApiDate(
    applicationRound.reservationPeriodBegin
  );
  const periodEndDate = formatApiDate(applicationRound.reservationPeriodEnd);

  const {
    ageGroupOptions,
    purposeOptions,
    reservationUnitTypeOptions,
    participantCountOptions,
    unitOptions,
  } = optionTypes;

  const applicationPeriodBegin = form.watch(`applicationEvents.${index}.begin`);
  const applicationPeriodEnd = form.watch(`applicationEvents.${index}.end`);
  const numPersons = form.watch(`applicationEvents.${index}.numPersons`);
  const modalRef = useRef<ModalRef>();

  const selectDefaultPeriod = (): void => {
    const begin = periodStartDate ? apiDateToUIDate(periodStartDate) : "";
    const end = periodEndDate ? apiDateToUIDate(periodEndDate) : "";
    setValue(`applicationEvents.${index}.begin`, begin);
    setValue(`applicationEvents.${index}.end`, end);
  };

  const selectionIsDefaultPeriod =
    applicationPeriodEnd != null &&
    applicationPeriodBegin != null &&
    uiDateToApiDate(applicationPeriodBegin) === periodStartDate &&
    uiDateToApiDate(applicationPeriodEnd) === periodEndDate;

  return (
    <>
      <SubHeadLine>
        {t("application:Page1.basicInformationSubHeading")}
      </SubHeadLine>
      <TwoColumnContainer>
        <div>
          <TextInput
            {...register(`applicationEvents.${index}.name`, {
              required: true,
              maxLength: 255,
            })}
            label={t("application:Page1.name")}
            id={`applicationEvents.${index}.name`}
            required
            invalid={!!errors.applicationEvents?.[index]?.name?.type}
            errorText={applicationErrorText(
              t,
              errors.applicationEvents?.[index]?.name?.type,
              { count: 255 }
            )}
          />
        </div>
        <div>
          <NumberInput
            id={`applicationEvents.${index}.numPersons`}
            required
            {...register(`applicationEvents.${index}.numPersons`, {
              validate: {
                required: (val) => Boolean(val),
                numPersonsMin: (val) => Number(val) > 0,
              },
              valueAsNumber: true,
            })}
            label={t("application:Page1.groupSize")}
            min={0}
            max={undefined}
            minusStepButtonAriaLabel={t("common:subtract")}
            plusStepButtonAriaLabel={t("common:add")}
            step={1}
            errorText={applicationErrorText(
              t,
              errors.applicationEvents?.[index]?.numPersons?.type
            )}
            invalid={!!errors.applicationEvents?.[index]?.numPersons?.type}
          />
        </div>
        <ControlledSelect
          // TODO remove the controlled select (it's not type safe)
          name={`applicationEvents.${index}.ageGroup`}
          required
          label={t("application:Page1.ageGroup")}
          // @ts-expect-error -- Remove the ControlledSelect to fix the types
          control={form.control}
          options={ageGroupOptions}
          error={applicationErrorText(
            t,
            errors.applicationEvents?.[index]?.ageGroup?.type
          )}
        />
        <ControlledSelect
          name={`applicationEvents.${index}.purpose`}
          required
          label={t("application:Page1.purpose")}
          // @ts-expect-error -- Remove the ControlledSelect to fix the types
          control={form.control}
          options={purposeOptions}
          error={applicationErrorText(
            t,
            errors.applicationEvents?.[index]?.purpose?.type
          )}
        />
      </TwoColumnContainer>
      <SubHeadLine>{t("application:Page1.spacesSubHeading")}</SubHeadLine>
      <ReservationUnitList
        applicationRound={applicationRound}
        index={index}
        minSize={numPersons ?? undefined}
        options={{
          purposeOptions,
          reservationUnitTypeOptions,
          participantCountOptions,
          unitOptions,
        }}
      />
      <SubHeadLine>
        {t("application:Page1.applicationRoundSubHeading")}
      </SubHeadLine>
      <CheckboxWrapper>
        <Checkbox
          id={`applicationEvents.${index}.defaultPeriod`}
          checked={selectionIsDefaultPeriod}
          label={`${t("application:Page1.defaultPeriodPrefix")} ${formatDate(
            applicationRound.reservationPeriodBegin
          )} - ${formatDate(applicationRound.reservationPeriodEnd)}`}
          onChange={() => {
            form.clearErrors([
              `applicationEvents.${index}.begin`,
              `applicationEvents.${index}.end`,
            ]);
            selectDefaultPeriod();
          }}
          disabled={selectionIsDefaultPeriod}
        />
      </CheckboxWrapper>
      <PeriodContainer>
        <DateInput
          disableConfirmation
          language={i18n.language as LocalizationLanguages}
          {...register(`applicationEvents.${index}.begin`, {
            validate: {
              required: (val) => Boolean(val),
              beginAfterEnd: (val) => {
                const end = form.getValues().applicationEvents?.[index]?.end;
                return (
                  end != null &&
                  val != null &&
                  !after(uiDateToApiDate(end), uiDateToApiDate(val))
                );
              },
              beginBeforePeriodBegin: (val) =>
                val != null &&
                !before(
                  applicationRound.reservationPeriodBegin,
                  uiDateToApiDate(val)
                ),
              beginAfterPeriodEnd: (val) =>
                val != null &&
                !after(
                  applicationRound.reservationPeriodEnd,
                  uiDateToApiDate(val)
                ),
            },
          })}
          onChange={(v) => {
            form.clearErrors([
              `applicationEvents.${index}.begin`,
              `applicationEvents.${index}.end`,
            ]);
            form.setValue(`applicationEvents.${index}.begin`, v);
            form.trigger([
              `applicationEvents.${index}.begin`,
              `applicationEvents.${index}.end`,
            ]);
          }}
          label={t("application:Page1.periodStartDate")}
          id={`applicationEvents.${index}.begin`}
          value={
            form.getValues(`applicationEvents.${index}.begin`) ?? undefined
          }
          required
          minDate={new Date(applicationRound.reservationPeriodBegin)}
          maxDate={new Date(applicationRound.reservationPeriodEnd)}
          invalid={!!errors?.applicationEvents?.[index]?.begin?.type}
          errorText={applicationErrorText(
            t,
            errors?.applicationEvents?.[index]?.begin?.type
          )}
        />
        <DateInput
          {...register(`applicationEvents.${index}.end`, {
            validate: {
              required: (val) => {
                return Boolean(val);
              },
              endBeforeBegin: (val) => {
                const begin = form.getValues(
                  `applicationEvents.${index}.begin`
                );
                return (
                  begin != null &&
                  val != null &&
                  !before(uiDateToApiDate(begin), uiDateToApiDate(val))
                );
              },
              endBeforePeriodBegin: (val) =>
                val != null &&
                !before(
                  applicationRound.reservationPeriodBegin,
                  uiDateToApiDate(val)
                ),
              endAfterPeriodEnd: (val) =>
                val != null &&
                !after(
                  applicationRound.reservationPeriodEnd,
                  uiDateToApiDate(val)
                ),
            },
          })}
          disableConfirmation
          language={i18n.language as LocalizationLanguages}
          onChange={(v) => {
            form.clearErrors([
              `applicationEvents.${index}.begin`,
              `applicationEvents.${index}.end`,
            ]);
            form.setValue(`applicationEvents.${index}.end`, v);
            form.trigger([
              `applicationEvents.${index}.begin`,
              `applicationEvents.${index}.end`,
            ]);
          }}
          value={form.getValues(`applicationEvents.${index}.end`) ?? undefined}
          label={t("application:Page1.periodEndDate")}
          id={`applicationEvents.${index}.end`}
          required
          minDate={new Date(applicationRound.reservationPeriodBegin)}
          maxDate={new Date(applicationRound.reservationPeriodEnd)}
          // @ts-expect-error: TODO refactor
          invalid={errors.applicationEvents?.[index]?.end?.type}
          errorText={applicationErrorText(
            t,
            errors.applicationEvents?.[index]?.end?.type
          )}
        />
        <Controller
          control={form.control}
          name={`applicationEvents.${index}.minDuration`}
          rules={{
            required: true,
            validate: {
              /* FIXME
            required: (val: string) => {
              form.clearErrors([
                `applicationEvents.${index}.minDuration`,
                `applicationEvents.${index}.maxDuration`,
              ]);
              return val !== "00:00:00";
            },
            minDurationBiggerThanMaxDuration: (val: string) =>
              apiDurationToMinutes(val) <= form.getValues(`applicationEvents.${index}.maxDuration`)
              ),
            */
            },
          }}
          render={({ field }) => (
            <Select
              id={field.name}
              value={
                getDurationNumberOptions().find(
                  (x) => x.value === field.value
                ) ?? { label: "", value: "" }
              }
              placeholder={t("common:select")}
              options={getDurationNumberOptions()}
              label={t("application:Page1.minDuration")}
              required
              onChange={(selection: OptionType): void => {
                field.onChange(selection.value);
              }}
              invalid={
                errors.applicationEvents?.[index]?.minDuration?.type != null
              }
              error={applicationErrorText(
                t,
                errors.applicationEvents?.[index]?.minDuration?.type
              )}
            />
          )}
        />
        <Controller
          control={form.control}
          name={`applicationEvents.${index}.maxDuration`}
          rules={{
            required: true,
            validate: {
              /* FIXME
            required: (val: string) => {
              form.clearErrors([
                `applicationEvents.${index}.minDuration`,
                `applicationEvents.${index}.maxDuration`,
              ]);
              return val !== "00:00:00";
            },
            maxDurationSmallerThanMinDuration: (val: string) =>
              apiDurationToMinutes(val) >=
              apiDurationToMinutes(
                form.getValues().applicationEvents?.[index]
                  ?.minDuration ?? "00:00:00"
              ),
            }
            */
            },
          }}
          render={({ field }) => (
            <Select
              id={field.name}
              value={
                getDurationNumberOptions().find(
                  (x) => x.value === field.value
                ) ?? { label: "", value: "" }
              }
              placeholder={t("common:select")}
              options={getDurationNumberOptions()}
              label={t("application:Page1.maxDuration")}
              required
              onChange={(selection: OptionType): void => {
                field.onChange(selection.value);
              }}
              invalid={
                errors.applicationEvents?.[index]?.minDuration?.type != null
              }
              error={applicationErrorText(
                t,
                errors.applicationEvents?.[index]?.maxDuration?.type
              )}
            />
          )}
        />
        <NumberInput
          id={`applicationEvents.${index}.eventsPerWeek`}
          required
          {...register(`applicationEvents.${index}.eventsPerWeek`, {
            validate: {
              eventsPerWeekMin: (val) => Number(val) > 0,
            },
            valueAsNumber: true,
          })}
          label={t("application:Page1.eventsPerWeek")}
          min={1}
          max={undefined}
          minusStepButtonAriaLabel={t("common:subtract")}
          plusStepButtonAriaLabel={t("common:add")}
          step={1}
          invalid={!!errors.applicationEvents?.[index]?.eventsPerWeek?.type}
          errorText={applicationErrorText(
            t,
            errors.applicationEvents?.[index]?.eventsPerWeek?.type
          )}
        />
        <Controller
          control={form.control}
          name={`applicationEvents.${index}.biweekly`}
          render={({ field }) => {
            return (
              <input type="hidden" id={field.name} name={field.name} value="" />
            );
          }}
        />
      </PeriodContainer>
      <ApplicationEventSummary
        applicationEvent={form.getValues(`applicationEvents.${index}`)}
        name={watch(`applicationEvents.${index}.name`) ?? ""}
      />
      <ActionContainer>
        <Button
          type="button"
          variant="secondary"
          id={`applicationEvents[${index}].delete`}
          onClick={() => {
            modalRef?.current?.open();
          }}
        >
          {t("application:Page1.deleteEvent")}
        </Button>
        {/*
        <Button
          type="submit"
          id={`applicationEvents[${index}].save`}
          disabled={!saveEnabled}
          onClick={onSave}
        >
          {t("application:Page1.saveEvent")}
        </Button>
        */}
        <ConfirmationModal
          id="application-event-confirmation"
          okLabel="application:Page1.deleteEvent"
          cancelLabel="application:Page1.deleteEventCancel"
          heading={t("application:Page1.deleteEventHeading")}
          content={t("application:Page1.deleteEventContent")}
          onOk={del}
          ref={modalRef}
          type="confirm"
        />
      </ActionContainer>
    </>
  );
};

const ApplicationEvent = (props: Props): JSX.Element => {
  const { index, isVisible, onDeleteEvent, onToggleAccordian } = props;

  const { t } = useTranslation();

  const form = useFormContext<ApplicationFormValues>();
  const { watch, getValues } = form;

  const eventName = watch(`applicationEvents.${index}.name`);
  watch(`applicationEvents.${index}.eventsPerWeek`);
  watch(`applicationEvents.${index}.biweekly`);

  // TODO for some reason there is an applicationEvent with all fields undefined on the first render
  // this might be because we register the fields and their values are reset in the parent
  // it might also be because form values are async
  // (the values are not available on the first render because the query is still in progress)
  // but why is there a single element in the array then (should be empty)?
  // TODO can this be removed? i.e. first render logic changed so we don't need it?
  const shouldRenderInner =
    isVisible && getValues(`applicationEvents.${index}`)?.name != null;

  return (
    <Wrapper>
      <Accordion
        onToggle={onToggleAccordian}
        open={isVisible}
        heading={`${eventName}` || t("application:Page1.applicationEventName")}
        theme="thin"
      >
        {/* Accordion doesn't remove from DOM on hide, but this is too slow if it's visible */}
        {shouldRenderInner && (
          <ApplicationEventInner {...props} del={onDeleteEvent} />
        )}
      </Accordion>
      {/* FIXME this is wrong place for this
        applicationEventSaved ? (
        <Notification
          size="small"
          type="success"
          label={t("application:applicationEventSaved")}
          autoClose
        >
          {t("application:applicationEventSaved")}
        </Notification>
      ) : null */}
    </Wrapper>
  );
};

export { ApplicationEvent };