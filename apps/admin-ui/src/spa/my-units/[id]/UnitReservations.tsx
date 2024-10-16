import React, { useEffect } from "react";
import { breakpoints } from "common/src/common/style";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import Loader from "@/component/Loader";
import Legend from "@/component/Legend";
import { legend } from "./eventStyleGetter";
import { UnitCalendar } from "./UnitCalendar";
import { useUnitResources } from "./hooks";
import { fromUIDate, isValidDate, toUIDate } from "common/src/common/util";
import { startOfDay } from "date-fns";
import { Button } from "hds-react";
import { useParams, useSearchParams } from "react-router-dom";
import { AutoGrid, VerticalFlex } from "@/styles/layout";
import { useReservationUnitTypes } from "@/hooks";
import { HR } from "@/component/Table";
import { SearchTags } from "@/component/SearchTags";
import { MultiSelectFilter } from "@/component/QueryParamFilters";
import { DayNavigation } from "@/component/QueryParamFilters/DayNavigation";

const Legends = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-xl);
  padding: var(--spacing-m) 0;
`;

const LegendContainer = styled.div`
  max-width: 100%;
  overflow: auto hidden;
  @media (max-width: ${breakpoints.s}) {
    div {
      flex-wrap: nowrap;
    }
  }
`;

type InnerProps = {
  unitPk: string;
  reservationUnitTypes: number[];
};

function UnitReservationsInner({
  unitPk,
  reservationUnitTypes,
}: InnerProps): JSX.Element {
  const [searchParams] = useSearchParams();

  const d = searchParams.get("date");
  const currentDate = d ? fromUIDate(d) : startOfDay(new Date());

  const { t } = useTranslation();

  const { loading, resources, refetch } = useUnitResources(
    currentDate ?? new Date(),
    unitPk,
    reservationUnitTypes
  );

  const date =
    currentDate && isValidDate(currentDate) ? currentDate : new Date();

  return (
    <>
      {loading ? (
        <Loader />
      ) : (
        <UnitCalendar
          date={date}
          resources={resources}
          refetch={refetch}
          unitPk={Number(unitPk)}
        />
      )}
      <LegendContainer>
        <Legends>
          {legend.map((l) => (
            <Legend key={l.label} style={l.style} label={t(l.label)} />
          ))}
        </Legends>
      </LegendContainer>
    </>
  );
}

const HorisontalFlexWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
`;

type Params = {
  unitId: string;
  reservationUnitId: string;
};

export function UnitReservations(): JSX.Element {
  const { unitId } = useParams<Params>();
  const { t } = useTranslation();

  const { options: reservationUnitTypeOptions } = useReservationUnitTypes();

  const translateTag = (key: string, value: string) => {
    switch (key) {
      case "reservationUnitType":
        return (
          reservationUnitTypeOptions.find((u) => u.value === Number(value))
            ?.label ?? ""
        );
      default:
        return "";
    }
  };

  const [searchParams, setSearchParams] = useSearchParams();
  const reservationUnitTypes = searchParams
    .getAll("reservationUnitType")
    .map(Number)
    .filter(Number.isInteger);

  useEffect(() => {
    if (searchParams.get("date")) {
      return;
    }
    const p = new URLSearchParams(searchParams);
    p.set("date", toUIDate(new Date()));
    setSearchParams(p, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only on page load
  }, []);

  return (
    <VerticalFlex>
      <AutoGrid>
        <MultiSelectFilter
          style={{
            zIndex: "var(--tilavaraus-admin-stack-select-over-calendar)",
          }}
          name="reservationUnitType"
          options={reservationUnitTypeOptions}
        />
      </AutoGrid>
      <SearchTags hide={["date", "tab"]} translateTag={translateTag} />
      <HR />
      <HorisontalFlexWrapper>
        <Button
          variant="secondary"
          theme="black"
          size="small"
          onClick={() => {
            const p = new URLSearchParams(searchParams);
            p.set("date", toUIDate(new Date()));
            setSearchParams(p, { replace: true });
          }}
        >
          {t("common.today")}
        </Button>
        <DayNavigation name="date" />
        <div />
      </HorisontalFlexWrapper>
      {/* TODO missing unitId is an error, not return null */}
      {unitId ? (
        <UnitReservationsInner
          reservationUnitTypes={reservationUnitTypes}
          unitPk={unitId}
        />
      ) : null}
    </VerticalFlex>
  );
}
