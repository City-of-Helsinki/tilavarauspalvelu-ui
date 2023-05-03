import React, { useEffect, useReducer } from "react";
import { useTranslation } from "react-i18next";
import { gql, useQuery } from "@apollo/client";
import { NumberInput, Select } from "hds-react";
import { ApplicationStatus, Query, UnitType } from "common/types/gql-types";
import { OptionType } from "../../../common/types";
import Tags, { getReducer, toTags } from "../../lists/Tags";
import { AutoGrid, FullRow } from "../../../styles/layout";
import SortedSelect from "../../ReservationUnits/ReservationUnitEditor/SortedSelect";

/**
Hakijatyypin mukaan (only on first tab)
Vuoron nimen mukaan (only on second tab)
Toimipisteen mukaan (unit)
Haettu = haetun määrän mukaan
Vaiheen mukaan
*/
export type FilterArguments = {
  unit: OptionType[];
  applicantType: string[]; // applicant type
  applicationCount: number | null;
  // TODO this should be Application status => transformed to string when querying
  status: string[];
};

export const emptyFilterState = {
  unit: [],
  applicantType: [],
  applicationCount: null,
  status: [],
};

const multivaledFields = ["unit", "status", "applicantType"];

const APPLICATION_UNITS_QUERY = gql`
  query units($pks: [ID]) {
    units(onlyWithPermission: true, pk: $pks, orderBy: "nameFI") {
      edges {
        node {
          nameFi
          pk
        }
      }
    }
  }
`;

const ReviewUnitFilter = ({
  unitPks,
  value,
  onChange,
}: {
  unitPks: number[];
  onChange: (units: OptionType[]) => void;
  value: OptionType[];
}) => {
  const { t } = useTranslation();
  // TODO this should use cache properly (auto fetch 2000 units)
  const { data, loading } = useQuery<Query>(APPLICATION_UNITS_QUERY, {
    variables: {
      pks: unitPks,
    },
  });

  const opts: OptionType[] = (data?.units?.edges || [])
    .map((e) => e?.node)
    .filter((e): e is UnitType => e != null)
    .map((unit) => ({
      label: unit?.nameFi ?? "",
      value: unit?.pk ?? "",
    }));

  return (
    <SortedSelect
      disabled={loading}
      label={t("ReservationUnitsSearch.unitLabel")}
      multiselect
      placeholder={t("ReservationUnitsSearch.unitPlaceHolder")}
      options={opts}
      value={value}
      onChange={onChange}
      id="reservation-unit-combobox"
    />
  );
};

const ReviewCountFilter = ({
  value,
  onChange,
}: {
  onChange: (count: number) => void;
  value: number | null;
}) => {
  return (
    <NumberInput
      id="applications-review-count-filter"
      label="count"
      value={value ?? ""}
      onChange={(e) => onChange(Number(e.target.value))}
    />
  );
};

type StringOptionType = { value: string; label: string };
const ReviewStateFilter = ({
  value,
  onChange,
}: {
  onChange: (status: string[]) => void;
  value: string[];
}) => {
  // TODO translate the keys
  const opts = [
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
    label: x.toString(),
    value: x.toString(),
  }));

  const sVal = opts.filter((x) => value.includes(x.value));

  const handleChange = (val: StringOptionType[]) => {
    onChange(val.map((x) => x.value));
  };

  return (
    <Select<StringOptionType>
      id="applications-review-state-filter"
      label="state"
      helper="Assistive text"
      placeholder="Placeholder"
      value={sVal}
      multiselect
      options={opts}
      onChange={handleChange}
      clearButtonAriaLabel="Clear all selections"
      selectedItemRemoveButtonAriaLabel="Remove value"
    />
  );
};

type Props = {
  onSearch: (args: FilterArguments) => void;
  unitPks: number[];
};

const Filters = ({ onSearch, unitPks }: Props): JSX.Element => {
  const { t } = useTranslation();
  const [state, dispatch] = useReducer(
    getReducer<FilterArguments>(emptyFilterState),
    emptyFilterState
  );

  useEffect(() => {
    onSearch(state);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  // FIXME there is an extra "null" tag here
  // FIXME tags don't work for applicationState at all
  // they are also rather off for count
  // check the other pages for how they are supposed to be
  const tags = toTags(state, t, multivaledFields, ["applicationCount"]);

  return (
    <AutoGrid>
      <ReviewUnitFilter
        unitPks={unitPks}
        onChange={(e) => dispatch({ type: "set", value: { unit: e } })}
        value={state.unit}
      />
      <ReviewCountFilter
        onChange={(e) =>
          dispatch({ type: "set", value: { applicationCount: e } })
        }
        value={state.applicationCount}
      />
      <ReviewStateFilter
        onChange={(e) => dispatch({ type: "set", value: { status: e } })}
        value={state.status}
      />
      <FullRow>
        <Tags tags={tags} t={t} dispatch={dispatch} />
      </FullRow>
    </AutoGrid>
  );
};

export default Filters;
