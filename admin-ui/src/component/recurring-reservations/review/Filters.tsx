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
/**
Hakijatyypin mukaan (only on first tab)
Vuoron nimen mukaan (only on second tab)
Toimipisteen mukaan (unit)
Haettu = haetun määrän mukaan
Vaiheen mukaan
*/
export type FilterArguments = {
  unit: OptionType[];
  name?: string;
  applicantType: StringOptionType[];
  applicationCountGte?: string;
  applicationCountLte?: string;
  applicationStatus: StringOptionType[];
};

export const emptyFilterState = {
  unit: [],
  applicantType: [],
  applicationStatus: [],
};

const multivaledFields = ["unit", "applicationStatus", "applicantType"];

const ReviewApplicationStateFilter = ({
  options,
  value,
  onChange,
}: {
  options: StringOptionType[];
  onChange: (status: StringOptionType[]) => void;
  value: StringOptionType[];
}) => {
  const { t } = useTranslation();

  return (
    <Select<StringOptionType>
      id="applications-review-state-filter"
      label={t("ApplicationsFilters.stateLabel")}
      placeholder={t("ApplicationsFilters.statePlaceHolder")}
      value={value}
      multiselect
      options={options}
      onChange={onChange}
      clearButtonAriaLabel={t("common.clearAllSelections")}
      selectedItemRemoveButtonAriaLabel={t("common.removeValue")}
    />
  );
};

const ReviewApplicationEventStateFilter = ({
  options,
  value,
  onChange,
}: {
  options: StringOptionType[];
  onChange: (status: StringOptionType[]) => void;
  value: StringOptionType[];
}) => {
  const { t } = useTranslation();

  return (
    <Select<StringOptionType>
      id="applications-review-state-filter"
      label={t("ApplicationsFilters.stateLabel")}
      placeholder={t("ApplicationsFilters.statePlaceHolder")}
      value={value.find(() => true) ?? { label: "", value: "" }}
      options={options}
      onChange={(val: StringOptionType) => onChange([val])}
      clearButtonAriaLabel={t("common.clearAllSelections")}
      selectedItemRemoveButtonAriaLabel={t("common.removeValue")}
    />
  );
};

const ApplicantTypeFilter = ({
  options,
  onChange,
  value,
}: {
  options: StringOptionType[];
  onChange: (status: StringOptionType[]) => void;
  value: StringOptionType[];
}) => {
  const { t } = useTranslation();

  return (
    <Select<StringOptionType>
      id="applications-review-type-filter"
      label={t("ApplicationsFilters.filters.applicantType")}
      placeholder={t("ApplicationsFilters.filters.applicantTypePlaceHolder")}
      value={value}
      multiselect
      options={options}
      onChange={onChange}
      clearButtonAriaLabel={t("common.clearAllSelections")}
      selectedItemRemoveButtonAriaLabel={t("common.removeValue")}
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

// TODO these functions can be simplified with Object.values(Enum)
const getApplicationStateOptions = (t: TFunction) =>
  Object.values(ApplicationStatus).map((x) => ({
    label: t(`ApplicationStatus.${x.toString()}`),
    value: x.toString(),
  }));

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

  const stateOptions = getApplicationStateOptions(t);

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
        <ApplicantTypeFilter
          onChange={(e) =>
            dispatch({ type: "set", value: { applicantType: e } })
          }
          value={state.applicantType}
          options={typeOptions}
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
          value={
            state.applicationCountGte ? String(state.applicationCountGte) : ""
          }
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
          value={
            state.applicationCountLte ? String(state.applicationCountLte) : ""
          }
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
      {!isApplicationEvent ? (
        <ReviewApplicationStateFilter
          onChange={(e) =>
            dispatch({ type: "set", value: { applicationStatus: e } })
          }
          value={state.applicationStatus}
          options={stateOptions}
        />
      ) : (
        <ReviewApplicationEventStateFilter
          onChange={(e) =>
            dispatch({ type: "set", value: { applicationStatus: e } })
          }
          value={state.applicationStatus}
          options={stateOptions}
        />
      )}

      <FullRow>
        <Tags tags={tags} t={t} dispatch={dispatch} />
      </FullRow>
    </AutoGrid>
  );
};

export default Filters;
