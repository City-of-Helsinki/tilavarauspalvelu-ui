import { Tag } from "hds-react";
import { get, omit } from "lodash";
import React, { useEffect, useReducer } from "react";
import { TFunction, useTranslation } from "react-i18next";
import styled from "styled-components";
import { breakpoints } from "../../../styles/util";
import { OptionType } from "../../../common/types";
import UnitFilter from "../../filters/UnitFilter";

export type FilterArguments = {
  nameFi?: string;
  maxPersonsGte?: string;
  maxPersonsLte?: string;
  surfaceAreaGte?: string;
  surfaceAreaLte?: string;
  unit: OptionType[];
  reservationUnitType: OptionType[];
  sort?: string;
};

export const emptyFilterState = { reservationUnitType: [], unit: [] };

const multivaledFields = ["unit", "reservationUnitType"];

type Props = {
  onSearch: (args: FilterArguments) => void;
};

const Grid3Container = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--spacing-l);
  @media (min-width: ${breakpoints.l}) {
    grid-template-columns: 1fr 1fr 1fr;
  }
`;

const Tags = styled.div`
  display: flex;
  gap: var(--spacing-s);
  flex-wrap: wrap;
`;

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-layout-xs);
`;

export const emptyState = { reservationUnitType: [], unit: [] };

type Action =
  | { type: "set"; value: Partial<FilterArguments> }
  | { type: "deleteTag"; field: keyof FilterArguments; value?: string }
  | { type: "reset" };

const reducer = (state: FilterArguments, action: Action): FilterArguments => {
  switch (action.type) {
    case "set": {
      return { ...state, ...action.value };
    }

    case "reset": {
      return emptyState;
    }

    case "deleteTag": {
      if (multivaledFields.includes(action.field)) {
        return {
          ...state,
          [action.field]: (state[action.field] as OptionType[]).filter(
            (v) => v.value !== action.value
          ),
        };
      }
      return omit(state, action.field) as FilterArguments;
    }

    default:
      return { ...state };
  }
};

type Tag = {
  key: string;
  value: string;
  ac: Action;
};

const toTags = (state: FilterArguments, t: TFunction): Tag[] => {
  return (Object.keys(state) as unknown as (keyof FilterArguments)[]).flatMap(
    (key) => {
      if (multivaledFields.includes(key)) {
        return (get(state, key) as []).map(
          (v: OptionType) =>
            ({
              key: `${key}.${v.value}`,
              value: v.label,
              ac: { type: "deleteTag", field: key, value: v.value },
            } as Tag)
        );
      }

      return [
        {
          key,
          value:
            key === "nameFi"
              ? `"${state.nameFi}"`
              : t(`ReservationUnitsSearch.filter.${key}`),
          ac: {
            type: "deleteTag",
            field: key,
          },
        } as Tag,
      ];
    }
  );
};

const Filters = ({ onSearch }: Props): JSX.Element => {
  const { t } = useTranslation();
  const [state, dispatch] = useReducer(reducer, emptyState);

  useEffect(() => {
    onSearch(state);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  const tags = toTags(state, t);

  return (
    <div>
      <Wrapper>
        <Grid3Container>
          <UnitFilter
            onChange={(e) => dispatch({ type: "set", value: { unit: e } })}
            value={state.unit}
          />
        </Grid3Container>
      </Wrapper>

      {tags.length ? (
        <Tags>
          {tags.map((tag) => (
            <Tag id={tag.key} onDelete={() => dispatch(tag.ac)} key={tag.key}>
              {tag.value}
            </Tag>
          ))}
          {tags.length > 0 && (
            <Tag
              id="delete"
              onDelete={() => dispatch({ type: "reset" })}
              theme={{ "--tag-background": "transparent" }}
            >
              {t("ReservationUnitsSearch.clear")}
            </Tag>
          )}
        </Tags>
      ) : null}
    </div>
  );
};

export default Filters;
