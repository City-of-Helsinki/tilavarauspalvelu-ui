import { useQuery } from "@apollo/client";
import { joiResolver } from "@hookform/resolvers/joi";
import { H2 } from "common/src/common/typography";
import {
  Query,
  QueryUnitsArgs,
  ReservationUnitType,
} from "common/types/gql-types";
import {
  Button,
  Checkbox,
  DateInput,
  IconAngleLeft,
  RadioButton,
  SelectionGroup,
  TextArea,
  TextInput,
} from "hds-react";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import styled from "styled-components";
import { myUnitUrl } from "../../common/urls";
import { WeekdaysSelector } from "../../common/WeekdaysSelector";
import { useNotification } from "../../context/NotificationContext";
import {
  Container,
  Grid,
  Span3,
  Span4,
  Span6,
  VerticalFlex,
} from "../../styles/layout";
import { BasicLink } from "../../styles/util";
import SortedSelect from "../ReservationUnits/ReservationUnitEditor/SortedSelect";
import withMainMenu from "../withMainMenu";
import { ReservationType } from "./create-reservation/types";
import { RECURRING_RESERVATION_UNIT_QUERY } from "./queries";
import {
  RecurringReservationForm,
  RecurringReservationFormSchema,
} from "./RecurringReservationSchema";

const PreviousLinkWrapper = styled.div`
  padding: var(--spacing-xs);
`;

const Label = styled.p`
  font-family: var(--fontsize-body-m);
`;

const ActionsWrapper = styled.div`
  display: flex;
  grid-area: auto / -6;
  gap: var(--spacing-m);
  justify-content: end;
`;

type Params = {
  unitId: string;
  reservationUnitId: string;
};

const getReservationUnitBuffers = ({
  reservationUnits,
  pk,
}: {
  reservationUnits?: ReservationUnitType[];
  pk?: string;
}) => {
  if (!reservationUnits || !pk) return undefined;

  const unit = reservationUnits.find((ru) => ru.pk === parseInt(pk, 10));
  const buffers = {
    bufferTimeBefore: unit?.bufferTimeBefore || undefined,
    bufferTimeAfter: unit?.bufferTimeAfter || undefined,
  };
  const hasBuffers = Object.values(buffers).some(Boolean);

  return hasBuffers ? buffers : undefined;
};

const MyUnitRecurringReservation = () => {
  const { notifyError } = useNotification();
  const { t } = useTranslation();
  // FIXME the maybe unitId causes problems with hook rules (stupid: ?? "0" hack)
  const { unitId } = useParams<Params>();
  const { handleSubmit, control, register, watch } =
    useForm<RecurringReservationForm>({
      mode: "onChange",
      resolver: joiResolver(RecurringReservationFormSchema),
    });

  const previousUrl = myUnitUrl(parseInt(unitId ?? "0", 10));

  const { loading, data: unitData } = useQuery<Query, QueryUnitsArgs>(
    RECURRING_RESERVATION_UNIT_QUERY,
    {
      variables: {
        pk: [unitId ?? "0"],
        offset: 0,
      },
      onError: (err) => {
        notifyError(err.message);
      },
    }
  );
  const unit = unitData?.units?.edges[0];

  const selectedReservationUnit = watch("reservationUnit");
  const buffers = getReservationUnitBuffers({
    reservationUnits: unit?.node?.reservationUnits?.filter(
      (item): item is ReservationUnitType => !!item
    ),
    pk: selectedReservationUnit?.value,
  });

  const onSubmit = (data: any) => {
    console.log("data", data);
  };

  return (
    <>
      <PreviousLinkWrapper>
        <BasicLink to={previousUrl}>
          <Button
            aria-label={t("common.prev")}
            size="small"
            variant="supplementary"
            iconLeft={<IconAngleLeft />}
          >
            {t("common.prev")}
          </Button>
        </BasicLink>
      </PreviousLinkWrapper>

      <Container>
        <H2>Tee toistuva varaus</H2>

        <form onSubmit={handleSubmit(onSubmit)}>
          <VerticalFlex style={{ marginTop: "var(--spacing-m)" }}>
            <Grid>
              <Span6>
                <Controller
                  name="reservationUnit"
                  control={control}
                  render={({ field }) => (
                    <SortedSelect
                      disabled={loading}
                      sort
                      label={t(
                        "MyUnits.RecurringReservationForm.reservationUnit"
                      )}
                      multiselect={false}
                      placeholder={t("common.select")}
                      options={(unit?.node?.reservationUnits || []).map(
                        (reservationUnit) => ({
                          label: reservationUnit?.nameFi as string,
                          value: String(reservationUnit?.pk as number),
                        })
                      )}
                      {...field}
                    />
                  )}
                />
              </Span6>
            </Grid>
            <Grid>
              <Span3>
                <Controller
                  name="startingDate"
                  control={control}
                  render={({ field }) => (
                    <DateInput
                      id="startingDate"
                      label={t("MyUnits.RecurringReservationForm.startingDate")}
                      minDate={new Date()}
                      placeholder={t("common.select")}
                      disableConfirmation
                      language="fi"
                      {...field}
                    />
                  )}
                />
              </Span3>
              <Span3>
                <Controller
                  name="endingDate"
                  control={control}
                  render={({ field }) => (
                    <DateInput
                      id="endingDate"
                      label={t("MyUnits.RecurringReservationForm.endingDate")}
                      minDate={new Date()}
                      placeholder={t("common.select")}
                      disableConfirmation
                      language="fi"
                      {...field}
                    />
                  )}
                />
              </Span3>
              <Span3>
                <Controller
                  name="repeatPattern"
                  control={control}
                  render={({ field }) => (
                    <SortedSelect
                      disabled={loading}
                      sort
                      label={t(
                        "MyUnits.RecurringReservationForm.repeatPattern"
                      )}
                      multiselect={false}
                      placeholder={t("common.select")}
                      options={[
                        { value: "weekly", label: t("common.weekly") },
                        { value: "biweekly", label: t("common.biweekly") },
                      ]}
                      {...field}
                    />
                  )}
                />
              </Span3>
            </Grid>
            <Grid>
              <Span3>
                <Controller
                  name="startingTime"
                  control={control}
                  render={({ field }) => (
                    <SortedSelect
                      disabled={loading}
                      sort
                      label={t("MyUnits.RecurringReservationForm.startingTime")}
                      multiselect={false}
                      placeholder={t("common.select")}
                      options={[]}
                      {...field}
                    />
                  )}
                />
              </Span3>
              <Span3>
                <Controller
                  name="endingTime"
                  control={control}
                  render={({ field }) => (
                    <SortedSelect
                      disabled={loading}
                      sort
                      label={t("MyUnits.RecurringReservationForm.endingTime")}
                      multiselect={false}
                      placeholder={t("common.select")}
                      options={[]}
                      {...field}
                    />
                  )}
                />
              </Span3>
            </Grid>

            {buffers ? (
              <Span3>
                <Label>{t(`MyUnits.RecurringReservationForm.buffers`)}</Label>
                {Object.entries(buffers).map(
                  ([key, value]) =>
                    value && (
                      <Controller
                        name={key as keyof RecurringReservationForm}
                        control={control}
                        render={({ field }) => (
                          <Checkbox
                            id={key}
                            label={t(
                              `MyUnits.RecurringReservationForm.${key}`,
                              { minutes: value / 60 }
                            )}
                            checked={String(field.value) === "true"}
                            {...field}
                            value={String(field.value)}
                          />
                        )}
                      />
                    )
                )}
              </Span3>
            ) : null}
            <Span3>
              <Label>
                {t(`MyUnits.RecurringReservationForm.repeatOnDays`)}
              </Label>
              <Controller
                name="repeatOnDays"
                control={control}
                render={({ field: { value, onChange } }) => (
                  <WeekdaysSelector value={value} onChange={onChange} />
                )}
              />
            </Span3>

            <Span6>
              <Controller
                name="typeOfReservation"
                control={control}
                render={({ field }) => (
                  <SelectionGroup
                    required
                    label={t(
                      `MyUnits.RecurringReservationForm.typeOfReservation`
                    )}
                  >
                    {Object.values(ReservationType)
                      .filter((v) => typeof v === "string")
                      .map((v) => (
                        <RadioButton
                          key={v}
                          id={v as string}
                          checked={v === field.value}
                          label={t(
                            `MyUnits.RecurringReservationForm.reservationType.${v}`
                          )}
                          onChange={() => field.onChange(v)}
                        />
                      ))}
                  </SelectionGroup>
                )}
              />
            </Span6>

            <Grid>
              <Span4>
                <TextInput
                  id="name"
                  label={t(`MyUnits.RecurringReservationForm.name`)}
                  {...register("name")}
                />
              </Span4>
            </Grid>
            <Grid>
              <Span4>
                <TextArea
                  id="comments"
                  label={t(`MyUnits.RecurringReservationForm.comments`)}
                  {...register("comments")}
                />
              </Span4>
            </Grid>

            <Grid>
              <ActionsWrapper>
                <Button variant="secondary" onClick={() => console.log("test")}>
                  {t("common.cancel")}
                </Button>
                <Button variant="primary" type="submit">
                  {t("common.reserve")}
                </Button>
              </ActionsWrapper>
            </Grid>
          </VerticalFlex>
        </form>
      </Container>
    </>
  );
};

export default withMainMenu(MyUnitRecurringReservation);
