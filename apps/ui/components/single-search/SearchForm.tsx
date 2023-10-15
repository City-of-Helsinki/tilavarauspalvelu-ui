import React, { ReactNode, useEffect } from "react";
import { useTranslation } from "next-i18next";
import { IconSearch, Select, Tag, TextInput } from "hds-react";
import { SubmitHandler, useForm } from "react-hook-form";
import styled, { css } from "styled-components";
import { DocumentNode, useQuery } from "@apollo/client";
import { sortBy } from "lodash";
import { OptionType } from "common/types/common";
import { breakpoints } from "common/src/common/style";
import { Query, QueryUnitsArgs } from "common/types/gql-types";
import { addYears } from "date-fns";
import { ShowAllContainer } from "common/src/components";
import TimeRangePicker from "common/src/components/form/TimeRangePicker";
import { toUIDate } from "common/src/common/util";
import {
  fromUIDate,
  getSelectedOption,
  getTranslation,
  mapOptions,
} from "@/modules/util";
import { emptyOption, participantCountOptions } from "@/modules/const";
import { MediumButton, truncatedText } from "@/styles/util";
import MultiSelectDropdown from "../form/MultiselectDropdown";
import {
  SEARCH_FORM_PARAMS_EQUIPMENT,
  SEARCH_FORM_PARAMS_PURPOSE,
  SEARCH_FORM_PARAMS_UNIT,
} from "@/modules/queries/params";
import { RESERVATION_UNIT_TYPES } from "@/modules/queries/reservationUnit";
import { JustForDesktop, JustForMobile } from "@/modules/style/layout";
import DateRangePicker from "@/components/form/DateRangePicker";

export interface FormValues {
  purposes: string | null;
  unit: string | null;
  equipments: string | null;
  begin: string | null;
  end: string | null;
  after: string | null;
  before: string | null;
  duration: number | null;
  minPersons: string | null;
  maxPersons: string | null;
  reservationUnitType: string;
}

type Props = {
  onSearch: (search: Record<string, string>) => void;
  formValues: { [key: string]: string | null };
  removeValue?: (key?: string[], subItemKey?: string) => void;
};

const desktopBreakpoint = "840px";

const TopContainer = styled.div`
  display: flex;
  flex-flow: column nowrap;
  gap: var(--spacing-m);

  @media (min-width: ${desktopBreakpoint}) {
    grid-template-columns: 1fr 154px;
  }
`;

const filterGrid = css`
  margin-top: 0;
  max-width: 100%;
  display: grid;
  grid-template-columns: auto;
  grid-template-rows: repeat(2, auto);
  grid-gap: var(--spacing-m);
  font-size: var(--fontsize-body-m);
  > div {
    grid-column: 1 / span 3;
  }

  label {
    font-family: var(--font-medium);
    font-weight: 500;
  }

  @media (min-width: ${breakpoints.m}) {
    margin-top: var(--spacing-s);
    grid-template-columns: repeat(2, 1fr);
    > div {
      grid-column: span 1;
    }
  }

  @media (min-width: ${breakpoints.l}) {
    grid-template-columns: repeat(3, 1fr);
  }
`;

const Filters = styled.div<{ children: ReactNode[] }>`
  ${filterGrid}
`;

const StyledSelect = styled(Select<OptionType>)<{ name?: string }>`
  button {
    display: grid;
    text-align: left;
  }

  span {
    ${truncatedText}
  }
`;

const TwInput = styled.div`
  display: grid;
  grid-template-columns: 50% 50%;
  .inputGroupStart {
    & > div {
      border-right-width: 0;
    }
  }
`;

const OptionalFilters = styled(ShowAllContainer)<{
  children: ReactNode[];
}>`
  && {
    grid-column: span 3;
  }
  > [class="ShowAllContainer__Content"] {
    grid-template-columns: 1fr;
    display: grid;
    &:not:empty {
      gap: var(--spacing-m);
    }
  }
  @media (min-width: ${breakpoints.m}) {
    grid-column: 1 / span 2;
    grid-row: 3 / span 1;
    margin-bottom: var(--spacing-m);
    > [class="ShowAllContainer__Content"] {
      grid-template-columns: repeat(2, 1fr);
      gap: var(--spacing-m);
      &:empty {
        row-gap: 0;
        ~ [class*="ShowAllContainer__ToggleButtonContainer"] {
          margin-top: 0;
        }
      }
    }
    > [class*="ShowAllContainer__ToggleButtonContainer"] {
      margin-top: var(--spacing-s);
    }

    > div {
      grid-column: span 1;
    }
  }
  @media (min-width: ${breakpoints.l}) {
    > [class*="ShowAllContainer__Content"] {
      grid-template-columns: repeat(3, 1fr);
      grid-column: 1 / span 3;
    }
  }
`;

const BottomContainer = styled.div`
  margin: var(--spacing-m) 0;
  display: flex;
  width: 100%;
  flex-flow: row nowrap;
  align-items: flex-end;
  justify-content: space-between;
  gap: var(--spacing-m);
`;

const DateRangeWrapper = styled.div`
  > div {
    display: flex;
    > div {
      width: 50%;
    }
    label {
      height: 24px;
    }
    // Starting date picker
    > div:first-child {
      input {
        border-right: 0;
      }
    }
    // Ending date picker
    > div:last-child {
      margin-top: 0;
    }
  }
`;

const TimeRangeWrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: auto auto;
  gap: 0;
  .error-message {
    grid-column: span 2;
  }
  // Starting date picker
  > div:first-child > div {
    border-right: 0;
  }
  // Hide the label text (but keep its height) for the end time select, since HDS adds a "*" to required field labels
  // TODO: Make the displaying of the label text component conditional on having an empty text as before label, as it could possibly often be empty. Especially if the component to be is re-used.
  > div:nth-child(2) label {
    height: 24px;
    span {
      display: none;
    }
  }
`;

const TagControls = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--spacing-s);
`;

const StyledTag = styled(Tag)`
  font-size: var(--fontsize-body-m);
`;

const FilterTags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-s);
  margin-right: var(--spacing-m);
`;

const ResetButton = styled(StyledTag).attrs({
  theme: {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    "--tag-background": "transparent",
  },
})``;

const SubmitButton = styled(MediumButton)`
  width: 100%;

  @media (min-width: ${breakpoints.s}) {
    width: auto;
    white-space: nowrap;
  }
`;

const filterOrder = [
  "textSearch",
  "begin",
  "end",
  "after",
  "before",
  "duration",
  "minPersons",
  "maxPersons",
  "reservationUnitType",
  "unit",
  "purposes",
  "equipments",
];

// Custom hook for fetching options from the backend and mapping them to the format used by the Select component
const useMappedOptions = (
  queryName: DocumentNode,
  queryNodeName: string,
  queryOptions?: { publishedReservationUnits: boolean }
): { options: OptionType[]; isLoading: boolean } => {
  const { data, loading } = useQuery<Query, QueryUnitsArgs>(queryName, {
    variables: { ...queryOptions },
  });
  if (data != null && queryNodeName in data) {
    const options =
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      data[queryNodeName]?.edges
        ?.map((e: { node: unknown }) => e?.node)
        .filter((n: null): n is NonNullable<typeof n> => n != null)
        .map((node: { pk: unknown }) => ({
          id: String(node.pk),
          name: getTranslation(node, "name"),
        })) ?? [];
    return {
      options: mapOptions(sortBy(options, "name")),
      isLoading: loading,
    };
  }
  return { options: [], isLoading: loading };
};

const SearchForm = ({
  onSearch,
  formValues,
  removeValue,
}: Props): JSX.Element | null => {
  const { t } = useTranslation();
  const todayDate = new Date();
  const { options: unitOptions, isLoading: unitsLoading } = useMappedOptions(
    SEARCH_FORM_PARAMS_UNIT,
    "units",
    { publishedReservationUnits: true }
  );
  const { options: purposeOptions, isLoading: purposesLoading } =
    useMappedOptions(SEARCH_FORM_PARAMS_PURPOSE, "purposes");
  const { options: unitTypeOptions, isLoading: typesLoading } =
    useMappedOptions(RESERVATION_UNIT_TYPES, "reservationUnitTypes");
  const { options: equipmentsOptions, isLoading: equipmentsLoading } =
    useMappedOptions(SEARCH_FORM_PARAMS_EQUIPMENT, "equipments");

  const inHours = (minutes: number): number =>
    Math.round((minutes / 60) * 100) / 100; // two decimal places
  const durationMinuteOptions = () => {
    const durations: OptionType[] = [];
    let minute = 15; // no zero duration option, as all available reservations have a positive/non-zero duration
    while (minute <= 90) {
      durations.push({
        label: t("common:minute_other", { count: minute }),
        value: minute,
      });
      minute += 15;
    }
    return durations;
  };

  const populateDurationOptions = (): OptionType[] => {
    const times: OptionType[] = [];
    let hour = 2;
    let minute = 0;

    while (hour < 24) {
      times.push({
        label: t("common:hour_other", { count: hour + minute / 60 }),
        value: hour * 60 + minute,
      });
      minute += 30;
      // Reset the minute counter, and increment the hour counter if necessary
      if (minute === 60) {
        minute = 0;
        hour++;
      }
    }
    // we need to add the minute times to the beginning of the duration options
    return durationMinuteOptions().concat(...times) as OptionType[];
  };
  const durationOptions = populateDurationOptions();

  const initialValues = {
    unit: "",
    equipments: "",
    begin: fromUIDate(todayDate),
    end: "",
    after: null,
    before: null,
    duration: null,
    minPersons: "1",
    maxPersons: "",
    reservationUnitType: formValues.reservationUnitType ?? "",
  };

  const { register, watch, handleSubmit, setValue, getValues, control } =
    useForm<FormValues>({
      defaultValues: {
        ...initialValues,
        ...formValues,
      },
    });

  const getFormSubValueLabel = (
    key: string,
    value: string
  ): string | undefined => {
    switch (key) {
      case "unit":
        return unitOptions.find((n) => n.value === value)?.label;
      case "reservationUnitType":
        return unitTypeOptions.find((n) => n.value === value)?.label;
      case "purposes":
        return purposeOptions.find((n) => n.value === value)?.label;
      case "equipments":
        return equipmentsOptions.find((n) => n.value === value)?.label;
      case "duration":
        return durationOptions.find((n) => n.value === value)?.label;
      case "begin":
      case "end":
      case "before":
      case "after":
        return value;
      default:
        return "";
    }
  };

  const multiSelectFilters = [
    "unit",
    "reservationUnitType",
    "purposes",
    "equipments",
  ];

  useEffect(() => {
    register("purposes");
    register("unit");
    register("equipments");
    register("begin");
    register("end");
    register("after");
    register("before");
    register("duration");
    register("minPersons");
    register("maxPersons");
    register("reservationUnitType");
  }, [register]);

  // TODO this is awful, don't set a random KeyValue map, use form.reset with a typed JS object
  useEffect(() => {
    Object.keys(formValues).forEach((p) =>
      setValue(p as keyof FormValues, formValues[p as keyof FormValues])
    );
  }, [formValues, setValue]);

  const search: SubmitHandler<FormValues> = (criteria: FormValues) => {
    // Remove empty (null & "") values from the criteria
    const searchCriteria = Object.entries(criteria).reduce((c, cv) => {
      if (cv[1] == null || cv[1] === "") return c;
      return { ...c, [cv[0]]: cv[1] };
    }, {});
    onSearch(searchCriteria);
  };

  const areOptionsLoaded =
    !unitsLoading && !purposesLoading && !typesLoading && !equipmentsLoading;
  const formValueKeys = Object.keys(formValues);
  const durationTranslation = (duration: number): string => {
    let unit = t("common:abbreviations.hour", { count: inHours(duration) });
    if (duration <= 90) {
      unit = t("common:abbreviations.minute", { count: duration });
    }
    return t("searchForm:filters.duration", { unit });
  };
  return (
    <>
      <TopContainer>
        <Filters>
          <MultiSelectDropdown
            id="purposeFilter"
            checkboxName="purposeFilter"
            name="purposes"
            onChange={(selection: string[]): void => {
              setValue("purposes", selection.filter((n) => n !== "").join(","));
            }}
            options={purposeOptions}
            showSearch
            title={t("searchForm:purposesFilter")}
            value={watch("purposes")?.split(",") || [""]}
          />
          <MultiSelectDropdown
            id="unitFilter"
            checkboxName="unitFilter"
            name="unit"
            onChange={(selection: string[]): void => {
              setValue("unit", selection.filter((n) => n !== "").join(","));
            }}
            options={unitOptions}
            showSearch
            title={t("searchForm:unitFilter")}
            value={watch("unit")?.split(",") || [""]}
          />
          <MultiSelectDropdown
            id="reservationUnitEquipmentsFilter"
            checkboxName="reservationUnitEquipmentsFilter"
            name="equipments"
            onChange={(selection: string[]): void => {
              setValue(
                "equipments",
                selection.filter((n) => n !== "").join(",")
              );
            }}
            options={equipmentsOptions}
            showSearch
            title={t("searchForm:equipmentsFilter")}
            value={watch("equipments")?.split(",") || [""]}
          />
          <DateRangeWrapper>
            <DateRangePicker
              startDate={
                formValues.begin != null
                  ? new Date(fromUIDate(String(formValues.begin)))
                  : new Date()
              }
              end={
                formValues.end != null
                  ? new Date(fromUIDate(String(formValues.end)))
                  : null
              }
              onChangeStartDate={(date: Date | null) =>
                setValue("begin", date != null ? toUIDate(date) : "")
              }
              onChangeEndDate={(date: Date | null) =>
                setValue("end", date != null ? toUIDate(date) : "")
              }
              labels={{
                begin: t("searchForm:dateFilter"),
                end: t(" "),
              }}
              required={{ begin: false, end: false }}
              limits={{
                startMinDate: new Date(),
                startMaxDate: getValues("end")
                  ? fromUIDate(String(getValues("end")))
                  : undefined,
                endMinDate: getValues("begin")
                  ? fromUIDate(String(getValues("begin")))
                  : undefined,
                endMaxDate: addYears(new Date(), 2),
              }}
            />
          </DateRangeWrapper>

          <TimeRangeWrapper>
            <TimeRangePicker
              control={control}
              name={{ begin: "after", end: "before" }}
              label={{ begin: t("searchForm:timeFilter"), end: " " }}
              placeholder={{
                begin: t("common:beginLabel"),
                end: t("common:endLabel"),
              }}
              clearable={{ begin: true, end: true }}
            />
          </TimeRangeWrapper>

          <StyledSelect
            id="durationFilter"
            name="duration"
            placeholder={t("common:minimum")}
            options={[emptyOption(t("common:select"))].concat(durationOptions)}
            label={t("searchForm:durationFilter", { duration: "" })}
            onChange={(selection: OptionType): void => {
              setValue(
                "duration",
                !Number.isNaN(Number(selection.value))
                  ? Math.round(Number(selection.value) * 10) / 10
                  : null
              );
            }}
            defaultValue={getSelectedOption(
              getValues("duration"),
              durationOptions
            )}
            key={`duration${getValues("duration")}`}
          />

          <OptionalFilters
            showAllLabel={t("searchForm:showMoreFilters")}
            showLessLabel={t("searchForm:showLessFilters")}
            maximumNumber={0}
          >
            <TwInput>
              <StyledSelect
                id="participantMinCountFilter"
                placeholder={t("common:minimum")}
                options={[emptyOption(t("common:select"))].concat(
                  participantCountOptions
                )}
                label={t("searchForm:participantCountCombined")}
                onChange={(selection: OptionType): void => {
                  setValue("minPersons", String(selection.value));
                }}
                defaultValue={getSelectedOption(
                  getValues("minPersons"),
                  participantCountOptions
                )}
                className="inputSm inputGroupStart"
              />

              <StyledSelect
                id="participantMaxCountFilter"
                placeholder={t("common:maximum")}
                options={[emptyOption(t("common:select"))].concat(
                  participantCountOptions
                )}
                label="&nbsp;"
                onChange={(selection: OptionType): void => {
                  setValue("maxPersons", String(selection.value));
                }}
                defaultValue={getSelectedOption(
                  getValues("maxPersons"),
                  participantCountOptions
                )}
                key={`maxPersons${getValues("maxPersons")}`}
                className="inputSm inputGroupEnd"
              />
            </TwInput>
            <MultiSelectDropdown
              id="reservationUnitTypeFilter"
              checkboxName="reservationUnitTypeFilter"
              name="reservationType"
              onChange={(selection: string[]): void => {
                setValue(
                  "reservationUnitType",
                  selection.filter((n) => n !== "").join(",")
                );
              }}
              options={unitTypeOptions}
              showSearch
              title={t("searchForm:typeLabel")}
              value={watch("reservationUnitType")?.split(",") || [""]}
              key={`minPersons${getValues("minPersons")}`}
            />
            <TextInput
              id="search"
              name="textSearch"
              label={t("searchForm:textSearchLabel")}
              placeholder={t("searchForm:searchTermPlaceholder")}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSubmit(search)();
                }
              }}
              defaultValue={
                formValues.textSearch != null
                  ? formValues.textSearch
                  : undefined
              }
            />
          </OptionalFilters>
        </Filters>
        <JustForDesktop
          style={{
            display: "flex",
            width: "100%",
            flexFlow: "row nowrap",
            justifyContent: "space-between",
          }}
          customBreakpoint={desktopBreakpoint}
        >
          <SubmitButton
            id="searchButton-desktop"
            onClick={handleSubmit(search)}
            iconLeft={<IconSearch />}
            style={{ marginLeft: "auto" }}
          >
            {t("searchForm:searchButton")}
          </SubmitButton>
        </JustForDesktop>
      </TopContainer>

      <BottomContainer>
        {areOptionsLoaded && formValueKeys.length > 0 && (
          <TagControls>
            <FilterTags data-test-id="search-form__filter--tags">
              {formValueKeys
                .sort((a, b) => filterOrder.indexOf(a) - filterOrder.indexOf(b))
                .map((formValueKey) => {
                  const label = t(`searchForm:filters.${formValueKey}`, {
                    label: formValueKey,
                    value: formValues[formValueKey],
                    count: Number(formValues[formValueKey]),
                  });
                  return multiSelectFilters.includes(formValueKey) ? (
                    (formValues[formValueKey] ?? "")
                      .split(",")
                      .map((subValue) => (
                        <StyledTag
                          id={`filter-tag__${formValueKey}-${subValue}`}
                          onClick={() =>
                            removeValue && removeValue([subValue], formValueKey)
                          }
                          onDelete={() =>
                            removeValue && removeValue([subValue], formValueKey)
                          }
                          key={`${formValueKey}-${subValue}`}
                          deleteButtonAriaLabel={t(`searchForm:removeFilter`, {
                            value: getFormSubValueLabel(formValueKey, subValue),
                          })}
                        >
                          {getFormSubValueLabel(formValueKey, subValue)}
                        </StyledTag>
                      ))
                  ) : (
                    <StyledTag
                      id={`filter-tag__${formValueKey}`}
                      onDelete={() =>
                        removeValue && removeValue([formValueKey])
                      }
                      key={formValueKey}
                      deleteButtonAriaLabel={t(`searchForm:removeFilter`, {
                        value: label,
                      })}
                    >
                      {formValueKey === "duration" &&
                      !Number.isNaN(Number(formValues.duration))
                        ? durationTranslation(Number(formValues.duration))
                        : label}
                    </StyledTag>
                  );
                })}
            </FilterTags>
            {formValueKeys.length > 0 && (
              <ResetButton
                aria-label={t("searchForm:resetForm")}
                onClick={() => removeValue && removeValue()}
                onDelete={() => removeValue && removeValue()}
                data-test-id="search-form__reset-button"
              >
                {t("searchForm:resetForm")}
              </ResetButton>
            )}
          </TagControls>
        )}
        <JustForMobile
          style={{ width: "100%" }}
          customBreakpoint={desktopBreakpoint}
        >
          <SubmitButton
            id="searchButton"
            onClick={handleSubmit(search)}
            iconLeft={<IconSearch />}
          >
            {t("searchForm:searchButton")}
          </SubmitButton>
        </JustForMobile>
      </BottomContainer>
    </>
  );
};

export default SearchForm;
