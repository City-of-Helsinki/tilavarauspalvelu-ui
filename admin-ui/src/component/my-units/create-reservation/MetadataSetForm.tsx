import React from "react";
import { H4 } from "common/src/common/typography";
import { Checkbox, NumberInput, Select, TextArea } from "hds-react";
import { Controller, UseFormReturn } from "react-hook-form";
import styled from "styled-components";
import { Query, ReservationUnitType } from "common/types/gql-types";
import { useQuery } from "@apollo/client";
import { omit, sortBy } from "lodash";
import { OptionType } from "common/types/common";
import { useTranslation } from "react-i18next";
import { Grid, Span12, Span6 } from "../../../styles/layout";
import { OPTIONS_QUERY } from "./queries";
import { ReservationForm } from "./types";

const SubHeading = styled(H4)`
  margin-block-start: 0;
`;

type Props = {
  form: UseFormReturn<ReservationForm>;
  reservationUnit: ReservationUnitType;
};

const MetadataSetForm = ({ form, reservationUnit }: Props): JSX.Element => {
  const { t } = useTranslation();

  const { data: optionsData } = useQuery<Query>(OPTIONS_QUERY);

  const purposeOptions = sortBy(
    optionsData?.purposes?.edges || [],
    "node.nameFi"
  ).map((purpose) => ({
    label: purpose?.node?.nameFi as string,
    value: purpose?.node?.pk as number,
  }));

  const ageGroupOptions = sortBy(
    optionsData?.ageGroups?.edges || [],
    "node.minimum"
  ).map((ageGroup) => ({
    label: `${ageGroup?.node?.minimum}-${ageGroup?.node?.maximum || ""}`,
    value: ageGroup?.node?.pk as number,
  }));

  return (
    <>
      <SubHeading>{t("ReservationDialog.reservationInfo")}</SubHeading>
      <Grid>
        <Span12>
          <Controller
            name="purpose"
            control={form.control}
            render={({ field }) => (
              <Select
                options={purposeOptions}
                placeholder={t("common.select")}
                label={t("ReservationDialog.purpose")}
                value={field.value}
                onChange={(value: OptionType) => {
                  form.setValue("purpose", value);
                }}
              />
            )}
          />
        </Span12>
        <Span6>
          <Controller
            name="ageGroup"
            control={form.control}
            render={({ field }) => (
              <Select
                label={t("ReservationDialog.ageGroup")}
                placeholder={t("common.select")}
                options={ageGroupOptions}
                value={field.value}
                onChange={(value: OptionType) => {
                  form.setValue("ageGroup", value);
                }}
              />
            )}
          />
        </Span6>
        <Span6>
          <NumberInput
            id="numPersons"
            minusStepButtonAriaLabel={t("common.decreaseByOneAriaLabel")}
            plusStepButtonAriaLabel={t("common.increaseByOneAriaLabel")}
            step={1}
            label={t("ReservationDialog.numPersons")}
            {...omit(form.register("numPersons"), ["name"])}
            onChange={(e) =>
              form.setValue("numPersons", Number(e.target.value))
            }
            min={1}
            max={reservationUnit.maxPersons as number}
          />
        </Span6>
        <Span12>
          <TextArea
            label={t("ReservationDialog.description")}
            id="ReservationDialog.description"
            {...form.register("description")}
          />
        </Span12>
        <Span12>
          {" "}
          <Checkbox
            id="applyingForFreeOfCharge"
            label={t("ReservationDialog.applyingForFreeOfCharge")}
            {...omit(form.register("applyingForFreeOfCharge"), ["name"])}
          />
        </Span12>
      </Grid>
    </>
  );
};

export default MetadataSetForm;
