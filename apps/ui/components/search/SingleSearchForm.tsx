import React, { ReactNode } from "react";
import { useTranslation } from "next-i18next";
import { Checkbox, IconSearch, TextInput } from "hds-react";
import { type SubmitHandler, useForm, Controller } from "react-hook-form";
import styled from "styled-components";
import { addYears, startOfDay } from "date-fns";
import { TimeRangePicker } from "common/src/components/form";
import { toUIDate } from "common/src/common/util";
import { fromUIDate } from "@/modules/util";
import { getDurationOptions, participantCountOptions } from "@/modules/const";
import { DateRangePicker } from "@/components/form";
import { FilterTagList } from "./FilterTagList";
import SingleLabelInputGroup from "@/components/common/SingleLabelInputGroup";
import { useSearchModify, useSearchValues } from "@/hooks/useSearchValues";
import { type ParsedUrlQuery } from "node:querystring";
import { ControlledMultiSelect } from "./ControlledMultiSelect";
import { ControlledSelect } from "common/src/components/form/ControlledSelect";
import {
  mapQueryParamToNumber,
  mapQueryParamToNumberArray,
  mapSingleBooleanParamToFormValue,
  mapSingleParamToFormValue,
} from "@/modules/search";
import {
  BottomContainer,
  Filters,
  OptionalFilters,
  StyledSubmitButton,
} from "./styled";

const StyledCheckBox = styled(Checkbox)`
  margin: 0 !important;
  grid-column: -2 / span 1;
`;

const SingleLabelRangeWrapper = styled(SingleLabelInputGroup)<{
  label: string;
  children: ReactNode;
}>`
  & > div:not(:first-child) {
    margin-top: var(--spacing-s);
  }
`;

type FormValues = {
  // TODO there is some confusion on the types of these
  // they are actually an array of pks (number) but they are encoded as val1,val2,val3 string
  purposes: number[];
  unit: number[];
  equipments: number[];
  reservationUnitTypes: number[];
  timeBegin: string | null;
  timeEnd: string | null;
  startDate: string | null;
  endDate: string | null;
  duration: number | null;
  minPersons: number | null;
  maxPersons: number | null;
  showOnlyReservable?: boolean;
  textSearch: string;
};

function mapQueryToForm(query: ParsedUrlQuery): FormValues {
  const dur = mapQueryParamToNumber(query.duration);
  const duration = dur != null && dur > 0 ? dur : null;
  const showOnlyReservable =
    mapSingleBooleanParamToFormValue(query.showOnlyReservable) ?? true;
  return {
    purposes: mapQueryParamToNumberArray(query.purposes),
    unit: mapQueryParamToNumberArray(query.unit),
    equipments: mapQueryParamToNumberArray(query.equipments),
    reservationUnitTypes: mapQueryParamToNumberArray(
      query.reservationUnitTypes
    ),
    // ?
    timeBegin: mapSingleParamToFormValue(query.timeBegin) ?? null,
    timeEnd: mapSingleParamToFormValue(query.timeEnd) ?? null,
    startDate: mapSingleParamToFormValue(query.startDate) ?? null,
    endDate: mapSingleParamToFormValue(query.endDate) ?? null,
    // number params
    duration,
    minPersons: mapQueryParamToNumber(query.minPersons) ?? null,
    maxPersons: mapQueryParamToNumber(query.maxPersons) ?? null,
    showOnlyReservable,
    textSearch: mapSingleParamToFormValue(query.textSearch) ?? "",
  };
}

// TODO is this the full list? can we filter out all the rest? (i.e. remove the hideList)
const filterOrder = [
  "textSearch",
  "timeBegin",
  "timeEnd",
  "startDate",
  "endDate",
  "duration",
  "minPersons",
  "maxPersons",
  "reservationUnitTypes",
  "unit",
  "purposes",
  "equipments",
];
const multiSelectFilters = [
  "unit",
  "reservationUnitTypes",
  "purposes",
  "equipments",
];
// we don't want to show "showOnlyReservable" as a FilterTag, as it has its own checkbox in the form
const hideTagList = ["showOnlyReservable", "order", "sort", "ref"];

// TODO rewrite this witout the form state (use query params directly, but don't refresh the page)
export function SingleSearchForm({
  reservationUnitTypeOptions,
  purposeOptions,
  unitOptions,
  equipmentsOptions,
  isLoading,
}: {
  reservationUnitTypeOptions: Array<{ value: number; label: string }>;
  purposeOptions: Array<{ value: number; label: string }>;
  unitOptions: Array<{ value: number; label: string }>;
  equipmentsOptions: Array<{ value: number; label: string }>;
  isLoading: boolean;
}): JSX.Element | null {
  const { handleSearch } = useSearchModify();

  const { t } = useTranslation();
  const unitTypeOptions = reservationUnitTypeOptions;
  const durationOptions = getDurationOptions(t);

  const searchValues = useSearchValues();
  // TODO the users of this should be using watch
  const formValues = mapQueryToForm(searchValues);
  const { handleSubmit, setValue, getValues, control, register } =
    useForm<FormValues>({
      values: formValues,
    });

  const translateTag = (key: string, value: string): string | undefined => {
    // Handle possible number / string comparison
    const compFn = (a: { value: unknown }, b: string) =>
      a != null && String(a.value) === b;
    // TODO should rework the find matcher (typing issues) (it works but it's confusing)
    switch (key) {
      case "unit":
        return unitOptions.find((n) => compFn(n, value))?.label;
      case "reservationUnitTypes":
        return unitTypeOptions.find((n) => compFn(n, value))?.label;
      case "purposes":
        return purposeOptions.find((n) => compFn(n, value))?.label;
      case "equipments":
        return equipmentsOptions.find((n) => compFn(n, value))?.label;
      case "duration":
        return durationOptions.find((n) => compFn(n, value))?.label;
      case "startDate":
      case "endDate":
      case "timeBegin":
      case "timeEnd":
        return value;
      default:
        return "";
    }
  };

  const onSearch: SubmitHandler<FormValues> = (criteria: FormValues) => {
    handleSearch(criteria, true);
  };

  const showOptionalFilters =
    formValues.reservationUnitTypes.length !== 0 ||
    formValues.minPersons != null ||
    formValues.maxPersons != null ||
    formValues.textSearch !== "";

  return (
    <form noValidate onSubmit={handleSubmit(onSearch)}>
      <Filters>
        <ControlledMultiSelect
          name="purposes"
          control={control}
          options={purposeOptions}
          label={t("searchForm:purposesFilter")}
        />
        <ControlledMultiSelect
          name="unit"
          control={control}
          options={unitOptions}
          label={t("searchForm:unitFilter")}
        />
        <ControlledMultiSelect
          name="equipments"
          control={control}
          options={equipmentsOptions}
          label={t("searchForm:equipmentsFilter")}
        />
        <SingleLabelRangeWrapper label={t("common:dateLabel")}>
          <DateRangePicker
            startDate={fromUIDate(String(getValues("startDate")))}
            endDate={fromUIDate(String(getValues("endDate")))}
            onChangeStartDate={(date: Date | null) =>
              setValue("startDate", date != null ? toUIDate(date) : null)
            }
            onChangeEndDate={(date: Date | null) =>
              setValue("endDate", date != null ? toUIDate(date) : null)
            }
            labels={{
              begin: t("dateSelector:labelStartDate"),
              end: t("dateSelector:labelEndDate"),
            }}
            placeholder={{
              begin: t("common:beginLabel"),
              end: t("common:endLabel"),
            }}
            limits={{
              startMinDate: startOfDay(new Date()),
              startMaxDate: addYears(new Date(), 2),
              endMinDate: startOfDay(new Date()),
              endMaxDate: addYears(new Date(), 2),
            }}
          />
        </SingleLabelRangeWrapper>
        <SingleLabelRangeWrapper label={t("common:timeLabel")}>
          <TimeRangePicker
            control={control}
            names={{ begin: "timeBegin", end: "timeEnd" }}
            labels={{
              begin: `${t("common:time")}: ${t("common:beginLabel")}`,
              end: `${t("common:time")}: ${t("common:endLabel")}`,
            }}
            placeholders={{
              begin: t("common:beginLabel"),
              end: t("common:endLabel"),
            }}
            clearable={{ begin: true, end: true }}
          />
        </SingleLabelRangeWrapper>
        <ControlledSelect
          name="duration"
          control={control}
          clearable
          options={durationOptions}
          label={t("searchForm:durationFilter", { duration: "" })}
        />
        <OptionalFilters
          showAllLabel={t("searchForm:showMoreFilters")}
          showLessLabel={t("searchForm:showLessFilters")}
          maximumNumber={0}
          data-testid="search-form__filters--optional"
          initiallyOpen={showOptionalFilters}
        >
          <SingleLabelInputGroup
            label={t("searchForm:participantCountCombined")}
          >
            <ControlledSelect
              name="minPersons"
              control={control}
              options={participantCountOptions}
              clearable
              label={`${t("searchForm:participantCountCombined")} ${t("common:minimum")}`}
              placeholder={t("common:minimum")}
              className="inputSm inputGroupStart"
            />
            <ControlledSelect
              name="maxPersons"
              control={control}
              options={participantCountOptions}
              clearable
              label={`${t("searchForm:participantCountCombined")} ${t("common:maximum")}`}
              placeholder={t("common:maximum")}
              className="inputSm inputGroupEnd"
            />
          </SingleLabelInputGroup>
          <ControlledMultiSelect
            name="reservationUnitTypes"
            control={control}
            options={unitTypeOptions}
            label={t("searchForm:typeLabel")}
          />
          <TextInput
            id="search"
            label={t("searchForm:textSearchLabel")}
            {...register("textSearch")}
            placeholder={t("searchForm:searchTermPlaceholder")}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSubmit(onSearch)();
              }
            }}
          />
        </OptionalFilters>
        <Controller
          name="showOnlyReservable"
          control={control}
          render={({ field: { value, onChange } }) => (
            <StyledCheckBox
              id="showOnlyReservable"
              name="showOnlyReservable"
              label={t("searchForm:showOnlyReservableLabel")}
              onChange={onChange}
              checked={value}
            />
          )}
        />
      </Filters>
      <BottomContainer>
        <FilterTagList
          translateTag={translateTag}
          filters={filterOrder}
          multiSelectFilters={multiSelectFilters}
          hideList={hideTagList}
        />
        <StyledSubmitButton
          id="searchButton"
          type="submit"
          iconLeft={<IconSearch />}
          isLoading={isLoading}
        >
          {t("searchForm:searchButton")}
        </StyledSubmitButton>
      </BottomContainer>
    </form>
  );
}
