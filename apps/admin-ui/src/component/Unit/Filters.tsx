import React from "react";
import { AutoGrid, FullRow } from "@/styles/layout";
import { SearchFilter } from "../QueryParamFilters";
import { SearchTags } from "../SearchTags";

export function Filters(): JSX.Element {
  const translateTag = (key: string, value: string) => {
    switch (key) {
      case "search":
        return value;
      default:
        return "";
    }
  };

  return (
    <>
      <AutoGrid>
        <SearchFilter name="search" labelKey="unit" />
      </AutoGrid>
      <FullRow>
        <SearchTags hide={[]} translateTag={translateTag} />
      </FullRow>
    </>
  );
}
