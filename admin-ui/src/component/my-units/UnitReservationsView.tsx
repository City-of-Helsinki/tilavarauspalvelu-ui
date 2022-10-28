import { useQuery } from "@apollo/client";
import { H1 } from "common/src/common/typography";
import React, { useReducer, useState } from "react";
import { useParams } from "react-router-dom";
import { addDays, subDays } from "date-fns";
import { useTranslation } from "react-i18next";
import { LocationType, Query, QueryUnitsArgs } from "../../common/gql-types";
import { useNotification } from "../../context/NotificationContext";
import BreadcrumbWrapper from "../BreadcrumbWrapper";
import Loader from "../Loader";
import withMainMenu from "../withMainMenu";
import { UNIT_QUERY } from "./queries";
import { parseAddress } from "../../common/util";
import { Container, Grid, HorisontalFlex, Span4 } from "../../styles/layout";
import { publicUrl } from "../../common/const";
import ReservationUnitTypeFilter from "../filters/ReservationUnitTypeFilter";
import { OptionType } from "../../common/types";
import Tags, { getReducer, toTags } from "../lists/Tags";
import DayNavigation from "./DayNavigation";
import UnitReservations from "./UnitReservations";

type Params = {
  unitId: string;
  reservationUnitId: string;
};

const UnitReservationsView = () => {
  const { notifyError } = useNotification();
  const [begin, setBegin] = useState(new Date().toISOString());
  const { unitId } = useParams<Params>();

  const { t } = useTranslation();

  const { loading: unitLoading, data: unitData } = useQuery<
    Query,
    QueryUnitsArgs
  >(UNIT_QUERY, {
    variables: {
      pk: [unitId],
      offset: 0,
    },
    onError: (err) => {
      notifyError(err.message);
    },
  });

  const initialEmptyState = { reservationUnitType: [] };

  const [state, dispatch] = useReducer(
    getReducer<{ reservationUnitType: OptionType[] }>(initialEmptyState),
    initialEmptyState
  );

  if (unitLoading) {
    return <Loader />;
  }

  const unit = unitData?.units?.edges[0];

  const tags = toTags(
    state,
    t,
    ["reservationUnitType"],
    [],
    "UnitReservationsView"
  );

  return (
    <>
      <BreadcrumbWrapper
        route={[`${publicUrl}/my-units`, "unit"]}
        aliases={[{ slug: "unit", title: unit?.node?.nameFi as string }]}
      />
      <Container>
        <div>
          <H1>{unit?.node?.nameFi}</H1>
          <p>{parseAddress(unit?.node?.location as LocationType)}</p>
        </div>
        <Grid>
          <Span4>
            <ReservationUnitTypeFilter
              style={{ zIndex: 101 }}
              value={state.reservationUnitType}
              onChange={(reservationUnitType) => {
                dispatch({ type: "set", value: { reservationUnitType } });
              }}
            />
          </Span4>
        </Grid>
        <Tags tags={tags} dispatch={dispatch} t={t} />
        <HorisontalFlex style={{ justifyContent: "center" }}>
          <DayNavigation
            date={begin}
            onPrev={() => {
              setBegin(subDays(new Date(begin), 1).toISOString());
            }}
            onNext={() => {
              setBegin(addDays(new Date(begin), 1).toISOString());
            }}
          />
        </HorisontalFlex>
        <UnitReservations
          reservationUnitTypes={state.reservationUnitType.map((option) =>
            Number(option.value)
          )}
          unitPk={unitId}
          key={begin}
          begin={begin}
        />
      </Container>
    </>
  );
};

export default withMainMenu(UnitReservationsView);
