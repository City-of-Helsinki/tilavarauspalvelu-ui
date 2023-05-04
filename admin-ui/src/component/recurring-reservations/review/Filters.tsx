import React, { useEffect, useReducer } from "react";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import { Select } from "hds-react";
import { ApplicationStatus } from "common/types/gql-types";
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
  applicantType: StringOptionType[]; // applicant type
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

const ReviewUnitFilter = ({
  units,
  value,
  onChange,
}: {
  units: { pk: number; name: string }[];
  onChange: (units: OptionType[]) => void;
  value: OptionType[];
}) => {
  const { t } = useTranslation();

  const options: OptionType[] = units.map((x) => ({
    label: x.name,
    value: x.pk,
  }));

  return (
    <SortedSelect
      label={t("ReservationUnitsSearch.unitLabel")}
      multiselect
      placeholder={t("ReservationUnitsSearch.unitPlaceHolder")}
      options={options}
      value={value}
      onChange={onChange}
      id="reservation-unit-combobox"
    />
  );
};

const ReviewStateFilter = ({
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
      label={t("ReservationUnitsSearch.stateLabel")}
      placeholder={t("ReservationUnitsSearch.unitPlaceHolder")}
      value={value}
      multiselect
      options={options}
      onChange={onChange}
      clearButtonAriaLabel="Clear all selections"
      selectedItemRemoveButtonAriaLabel="Remove value"
    />
  );
};

const CountFilterContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-self: start;
  height: 100%;
`;

const CountLabel = styled.div`
  grid-column: 1 / -1;
`;

type Props = {
  onSearch: (args: FilterArguments) => void;
  units: { name: string; pk: number }[];
};

const Filters = ({ onSearch, units }: Props): JSX.Element => {
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

  const options = [
    ApplicationStatus.Allocated,
    ApplicationStatus.Cancelled,
    ApplicationStatus.Draft,
    ApplicationStatus.Expired,
    ApplicationStatus.Handled,
    ApplicationStatus.InReview,
    ApplicationStatus.Received,
    ApplicationStatus.ReviewDone,
    ApplicationStatus.Sent,
  ].map((x) => ({
    label: t(`ApplicationStatus.${x.toString()}`),
    value: x.toString(),
  }));

  return (
    <AutoGrid>
      <ReviewUnitFilter
        units={units}
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
      <ReviewStateFilter
        onChange={(e) =>
          dispatch({ type: "set", value: { applicationStatus: e } })
        }
        value={state.applicationStatus}
        options={options}
      />
      <FullRow>
        <Tags tags={tags} t={t} dispatch={dispatch} />
      </FullRow>
    </AutoGrid>
  );
};

export default Filters;
