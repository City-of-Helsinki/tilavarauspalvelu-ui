import React, { useEffect, useReducer } from "react";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import { Select, TextInput } from "hds-react";
import { TFunction } from "i18next";
import {
  ApplicationStatus,
  ApplicationsApplicationApplicantTypeChoices,
} from "common/types/gql-types";
import { OptionType } from "../../../common/types";
import Tags, { getReducer, toTags } from "../../lists/Tags";
import { AutoGrid, FullRow } from "../../../styles/layout";
import SortedSelect from "../../ReservationUnits/ReservationUnitEditor/SortedSelect";
import NumberFilter from "../../NumberFilter";

type StringOptionType = { value: string; label: string };
export type FilterArguments = {
  unit: OptionType[];
  name?: string;
  applicantType: StringOptionType[];
  // For applications this is the number of hours (seconds in the api)
  // FIXME what is the count for events? it filters something but what?
  applicationCountGte?: string;
  applicationCountLte?: string;
  applicationStatus: StringOptionType[];
};

export const emptyFilterState = {
  unit: [],
  applicantType: [],
  applicationStatus: [],
};

export const STATUS_BUCKETS: Record<string, ApplicationStatus[]> = {
  received: [ApplicationStatus.Received],
  in_review: [ApplicationStatus.InReview, ApplicationStatus.ReviewDone],
  handled: [ApplicationStatus.Allocated, ApplicationStatus.Handled],
  sent: [ApplicationStatus.Sent],
};

const multivaledFields = ["unit", "applicationStatus", "applicantType"];

// Never show in the UI
const POSSIBLE_APPLICATION_STATES = Object.values(ApplicationStatus).filter(
  (x) =>
    x !== ApplicationStatus.Cancelled &&
    x !== ApplicationStatus.Draft &&
    x !== ApplicationStatus.Expired
);

export const mapFilterParams = (params: FilterArguments) => ({
  applicationStatus: POSSIBLE_APPLICATION_STATES,
  unit: params.unit
    ?.map((u) => u.value)
    ?.filter((x): x is number | string => x != null)
    ?.map((x) => String(x)),
  applicantType: params.applicantType.map(({ value }) =>
    value.toLocaleLowerCase()
  ),
  applicationCountLte: params.applicationCountLte
    ? Number(params.applicationCountLte) * 3600
    : undefined,
  applicationCountGte: params.applicationCountGte
    ? Number(params.applicationCountGte) * 3600
    : undefined,
});

const getApplicationStateOptions = (t: TFunction) =>
  POSSIBLE_APPLICATION_STATES.map((x) => ({
    label: t(`ApplicationStatus.${x.toString()}`),
    value: x.toString(),
  }));

// Backend doesn't support multiple states for application event queries
// so don't allow user to select more than one state at a time.
const ReviewStateFilter = ({
  isApplicationEvent,
  ...props
}: {
  onChange: (status: StringOptionType[]) => void;
  value: StringOptionType[];
  isApplicationEvent?: boolean;
}) => {
  const { t } = useTranslation();

  const stateOptions = isApplicationEvent
    ? getApplicationStateOptions(t)
    : Object.keys(STATUS_BUCKETS).map((x) => ({
        value: x,
        label: t(`ApplicationStatus.${x}`),
      }));

  const commonProps = {
    id: "applications-review-state-filter",
    label: t("ApplicationsFilters.stateLabel"),
    placeholder: t("ApplicationsFilters.statePlaceHolder"),
    clearButtonAriaLabel: t("common.clearAllSelections"),
    selectedItemRemoveButtonAriaLabel: t("common.removeValue"),
  };

  return !isApplicationEvent ? (
    <Select<StringOptionType>
      multiselect
      {...commonProps}
      {...props}
      options={stateOptions}
    />
  ) : (
    <Select<StringOptionType>
      {...commonProps}
      value={props.value.find(() => true) ?? { label: "", value: "" }}
      options={stateOptions}
      onChange={(val: StringOptionType) => props.onChange([val])}
    />
  );
};

const CountFilterContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-self: start;
`;

const CountLabel = styled.div`
  grid-column: 1 / -1;
`;

type Props = {
  onSearch: (args: FilterArguments) => void;
  units: { name: string; pk: number }[];
  isApplicationEvent?: boolean;
};

const Filters = ({
  onSearch,
  units,
  isApplicationEvent,
}: Props): JSX.Element => {
  const { t } = useTranslation();
  const [state, dispatch] = useReducer(
    getReducer<FilterArguments>(emptyFilterState),
    emptyFilterState
  );

  useEffect(() => {
    onSearch(state);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  const tags = toTags(state, t, multivaledFields, [], "ApplicationsFilters");

  const typeOptions = [
    ApplicationsApplicationApplicantTypeChoices.Association,
    ApplicationsApplicationApplicantTypeChoices.Individual,
    ApplicationsApplicationApplicantTypeChoices.Community,
    ApplicationsApplicationApplicantTypeChoices.Company,
  ].map((x) => ({
    label: t(`Application.applicantTypes.${x.toString().toLocaleLowerCase()}`),
    value: x.toString(),
  }));

  const unitOptions: OptionType[] = units.map((x) => ({
    label: x.name,
    value: x.pk,
  }));

  return (
    <AutoGrid>
      {isApplicationEvent ? (
        <TextInput
          id="applications-review-name-filter"
          label={t("ApplicationsFilters.textSearchLabel")}
          placeholder={t("ApplicationsFilters.textSearchPlaceHolder")}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              onSearch(state);
            }
          }}
          onChange={(e) =>
            dispatch({ type: "set", value: { name: e.target.value } })
          }
          value={state.name || ""}
        />
      ) : (
        <Select<StringOptionType>
          id="applications-review-type-filter"
          label={t("ApplicationsFilters.filters.applicantType")}
          placeholder={t(
            "ApplicationsFilters.filters.applicantTypePlaceHolder"
          )}
          multiselect
          onChange={(e) =>
            dispatch({ type: "set", value: { applicantType: e } })
          }
          value={state.applicantType}
          options={typeOptions}
          clearButtonAriaLabel={t("common.clearAllSelections")}
          selectedItemRemoveButtonAriaLabel={t("common.removeValue")}
        />
      )}
      <SortedSelect
        id="reservation-unit-combobox"
        label={t("ReservationUnitsSearch.unitLabel")}
        placeholder={t("ReservationUnitsSearch.unitPlaceHolder")}
        multiselect
        options={unitOptions}
        onChange={(e) => dispatch({ type: "set", value: { unit: e } })}
        value={state.unit}
      />
      <CountFilterContainer>
        <CountLabel>{t("ApplicationsFilters.countLabel")}</CountLabel>
        <NumberFilter
          id="applicationCountGte"
          value={state.applicationCountGte ?? ""}
          onValueChange={(val: string) => {
            dispatch({
              type: "set",
              value: { applicationCountGte: val },
            });
          }}
          onReset={() => {
            dispatch({
              type: "deleteTag",
              field: "applicationCountGte",
            });
          }}
        />
        <NumberFilter
          id="applicationCountLte"
          value={state.applicationCountLte ?? ""}
          onValueChange={(val: string) => {
            dispatch({
              type: "set",
              value: { applicationCountLte: val },
            });
          }}
          onReset={() => {
            dispatch({
              type: "deleteTag",
              field: "applicationCountLte",
            });
          }}
        />
      </CountFilterContainer>
      <ReviewStateFilter
        isApplicationEvent={isApplicationEvent}
        onChange={(e) =>
          dispatch({ type: "set", value: { applicationStatus: e } })
        }
        value={state.applicationStatus}
      />
      <FullRow>
        <Tags tags={tags} t={t} dispatch={dispatch} />
      </FullRow>
    </AutoGrid>
  );
};

export default Filters;
