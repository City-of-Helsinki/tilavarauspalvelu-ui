import React from "react";
import { useTranslation } from "react-i18next";
import { H1 } from "common/src/common/typography";
import { Container } from "@/styles/layout";
import { Filters } from "@/spa/unit/Filters";
import { HR } from "@/component/Table";
import { UnitsDataLoader } from "@/spa/unit/UnitsDataLoader";

// NOTE copy pasta from Unit/Units.tsx
export function MyUnits() {
  const { t } = useTranslation();

  return (
    <Container>
      <div>
        <H1 $legacy>{t("MyUnits.heading")}</H1>
        <p>{t("MyUnits.description")}</p>
      </div>
      <Filters />
      <HR />
      <UnitsDataLoader isMyUnits />
    </Container>
  );
}
