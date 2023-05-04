import { Button, IconAngleDown, IconAngleUp, TextInput } from "hds-react";
import React, { useEffect, useReducer, useState } from "react";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import { breakpoints } from "common/src/common/style";
import { OptionType } from "../../common/types";
import UnitFilter from "../filters/UnitFilter";
import Tags, { Action, getReducer, toTags } from "../lists/Tags";
import { Grid, Span3 } from "../../styles/layout";
import ReservationUnitStateFilter from "../filters/ReservationUnitStateFilter";
import ReservationUnitTypeFilter from "../filters/ReservationUnitTypeFilter";
import NumberFilter from "../NumberFilter";

export type FilterArguments = {
  nameFi?: string;
  maxPersonsGte?: string;
  maxPersonsLte?: string;
  surfaceAreaGte?: string;
  surfaceAreaLte?: string;
  unit: OptionType[];
  reservationUnitType: OptionType[];
  reservationUnitStates: OptionType[];
};

function CustomNumberFilter({
  id,
  value,
  dispatch,
}: {
  id: keyof FilterArguments;
  value?: string;
  dispatch: React.Dispatch<Action<FilterArguments>>;
}) {
  return (
    <NumberFilter
      id={id}
      value={value}
      onValueChange={(val: string) => {
        dispatch({
          type: "set",
          value: { [id]: val },
        });
      }}
      onReset={() => {
        dispatch({
          type: "deleteTag",
          field: id,
        });
      }}
    />
  );
}

const multivaluedFields = [
  "unit",
  "reservationUnitType",
  "reservationUnitStates",
];

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

const Grid2Container = styled(Grid3Container)`
  @media (min-width: ${breakpoints.l}) {
    grid-template-columns: 1fr 1fr;
  }
`;

const RangeContrainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: top;
  text-align: center;
`;

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-layout-xs);
`;

const ThinButton = styled(Button)`
  margin: var(--spacing-xs) 0 0 0;
  border: 0;
  padding-left: 0;
  span {
    padding: 0;
    line-height: 1;
  }
`;

const Buttons = styled.div``;

export const emptyState = {
  reservationUnitType: [],
  unit: [],
  reservationUnitStates: [],
};

const Filters = ({ onSearch }: Props): JSX.Element => {
  const { t } = useTranslation();
  const [state, dispatch] = useReducer(
    getReducer<FilterArguments>(emptyState),
    emptyState
  );
  const [more, setMore] = useState(false);

  useEffect(() => {
    onSearch(state);
  }, [onSearch, state]);

  const tags = toTags(
    state,
    t,
    multivaluedFields,
    ["nameFi"],
    "ReservationUnitsSearch"
  );

  return (
    <div>
      <Wrapper>
        <Grid>
          <Span3>
            <TextInput
              id="nameFi"
              label={t("ReservationUnitsSearch.textSearchLabel")}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  onSearch(state);
                }
              }}
              onChange={(e) =>
                dispatch({ type: "set", value: { nameFi: e.target.value } })
              }
              placeholder={t("ReservationUnitsSearch.textSearchPlaceHolder")}
              value={state.nameFi || ""}
            />
          </Span3>
          <Span3>
            <UnitFilter
              onChange={(e) => dispatch({ type: "set", value: { unit: e } })}
              value={state.unit}
            />
          </Span3>
          <Span3>
            <ReservationUnitTypeFilter
              onChange={(e) =>
                dispatch({ type: "set", value: { reservationUnitType: e } })
              }
              value={state.reservationUnitType}
            />
          </Span3>
          <Span3>
            <ReservationUnitStateFilter
              value={state.reservationUnitStates}
              onChange={(e) =>
                dispatch({ type: "set", value: { reservationUnitStates: e } })
              }
            />
          </Span3>
        </Grid>
        {more && (
          <Grid2Container>
            <div>
              <div>{t("ReservationUnitsSearch.maxPersonsLabel")}</div>
              <RangeContrainer>
                <CustomNumberFilter
                  id="maxPersonsGte"
                  value={state.maxPersonsGte}
                  dispatch={dispatch}
                />
                <CustomNumberFilter
                  id="maxPersonsLte"
                  value={state.maxPersonsLte}
                  dispatch={dispatch}
                />
              </RangeContrainer>
            </div>
            <div>
              <div>{t("ReservationUnitsSearch.surfaceAreaLabel")}</div>
              <RangeContrainer>
                <CustomNumberFilter
                  id="surfaceAreaGte"
                  value={state.surfaceAreaGte}
                  dispatch={dispatch}
                />
                <CustomNumberFilter
                  id="surfaceAreaLte"
                  value={state.surfaceAreaLte}
                  dispatch={dispatch}
                />
              </RangeContrainer>
            </div>
          </Grid2Container>
        )}
      </Wrapper>

      <Buttons>
        <ThinButton
          variant="supplementary"
          onClick={() => setMore(!more)}
          iconRight={more ? <IconAngleUp /> : <IconAngleDown />}
        >
          {t(
            more
              ? "ReservationUnitsSearch.lessFilters"
              : "ReservationUnitsSearch.moreFilters"
          )}
        </ThinButton>
      </Buttons>
      <Tags tags={tags} t={t} dispatch={dispatch} />
    </div>
  );
};

export default Filters;
