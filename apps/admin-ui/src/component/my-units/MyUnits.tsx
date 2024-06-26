import React, { useState } from "react";
import { debounce } from "lodash";
import { useTranslation } from "react-i18next";
import { H1 } from "common/src/common/typography";
import { Container } from "@/styles/layout";
import BreadcrumbWrapper from "../BreadcrumbWrapper";
import Filters, { FilterArguments, emptyFilterState } from "../Unit/Filters";
import { HR } from "@/component/Table";
import { UnitsDataLoader } from "../Unit/UnitsDataLoader";

// NOTE copy pasta from Unit/Units.tsx
const MyUnits = () => {
  const [filters, setFilters] = useState<FilterArguments>(emptyFilterState);
  const debouncedSearch = debounce((value) => setFilters(value), 100);

  const { t } = useTranslation();

  return (
    <>
      <BreadcrumbWrapper route={["my-units"]} />
      <Container>
        <div>
          <H1 $legacy>{t("MyUnits.heading")}</H1>
          <p>{t("MyUnits.description")}</p>
        </div>
        <Filters onSearch={debouncedSearch} />
        <HR />
        <UnitsDataLoader filters={filters} isMyUnits />
      </Container>
    </>
  );
};

export default MyUnits;
