import { debounce } from "lodash";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { H1 } from "common/src/common/typography";
import Filters, { type FilterArguments, emptyState } from "./Filters";
import { ReservationsDataLoader } from "./ReservationsDataLoader";
import BreadcrumbWrapper from "../BreadcrumbWrapper";
import { HR } from "@/component/Table";
import { Container } from "@/styles/layout";
import { toUIDate } from "common/src/common/util";

function AllReservations(): JSX.Element {
  const [filters, setFilters] = useState<FilterArguments>(emptyState);
  const debouncedSearch = debounce((value) => setFilters(value), 300);

  const { t } = useTranslation();

  return (
    <>
      <BreadcrumbWrapper route={["reservations", "all-reservations"]} />
      <Container>
        <div>
          <H1 $legacy>{t("Reservations.allReservationListHeading")}</H1>
          <p>{t("Reservations.allReservationListDescription")}</p>
        </div>
        <Filters
          onSearch={debouncedSearch}
          initialFiltering={{
            begin: toUIDate(new Date()) ?? "",
          }}
        />
        <HR />
        <ReservationsDataLoader defaultFiltering={{}} filters={filters} />
      </Container>
    </>
  );
}

export default AllReservations;
