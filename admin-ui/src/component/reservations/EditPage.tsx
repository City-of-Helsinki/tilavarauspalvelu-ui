import React from "react";
import styled from "styled-components";
import { useTranslation } from "react-i18next";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ReservationStaffCreateMutationInput,
  ReservationStaffCreateMutationPayload,
  ReservationType,
  ReservationUnitType,
} from "common/types/gql-types";
import { useMutation } from "@apollo/client";
import { format } from "date-fns";
import get from "lodash/get";
import camelCase from "lodash/camelCase";
import { Button } from "hds-react";
import { FormProvider, useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import {
  type ReservationFormMeta,
  ReservationFormSchema,
  type ReservationFormType,
  reservationTypeSchema,
} from "app/schemas";
import withMainMenu from "../withMainMenu";
import { useNotification } from "../../context/NotificationContext";
import { CREATE_STAFF_RESERVATION } from "../my-units/create-reservation/queries";
import { flattenMetadata } from "../my-units/create-reservation/utils";
import { dateTime } from "../ReservationUnits/ReservationUnitEditor/DateTimeInput";
import {
  Grid,
  Element,
} from "../my-units/MyUnitRecurringReservation/commonStyling";
import ReservationTypeForm from "../my-units/ReservationTypeForm";
import Loader from "../Loader";
import { HR } from "../lists/components";
import { useOptions } from "../my-units/hooks";
import EditPageWrapper from "./EditPageWrapper";
import { useReservationEditData } from "./requested/hooks";

type FormValueType = ReservationFormType & ReservationFormMeta;

type PossibleOptions = {
  ageGroup: Array<{ label: string; value: number }>;
  purpose: Array<{ label: string; value: number }>;
  homeCity: Array<{ label: string; value: number }>;
};

const ButtonContainer = styled(Element)`
  grid-column-end: -1;
  gap: 1rem;
  display: flex;
  border-top-width: 2px;
`;

const GridHR = styled(HR)`
  grid-column: 1 / -1;
`;

// TODO this is a copy from CreateReservationModal.tsx combine if possible
// differences: useEditMutation, No dialog wrappers, form default values, no date / time input section
const EditReservation = ({
  onClose,
  reservation,
  reservationUnit,
  options,
}: {
  onClose: () => void;
  reservation: ReservationType;
  reservationUnit: ReservationUnitType;
  options: PossibleOptions;
}) => {
  const { t } = useTranslation();
  const start = new Date(reservation.begin);
  const end = new Date(reservation.end);

  const form = useForm<FormValueType>({
    resolver: zodResolver(
      // TODO validator should contain the MetaValidator also (inherit and combine)
      ReservationFormSchema(reservationUnit.reservationStartInterval)
    ),
    mode: "onChange",
    defaultValues: {
      date: start,
      startTime: format(start, "HH:mm"),
      endTime: format(end, "HH:mm"),
      bufferTimeBefore: false,
      bufferTimeAfter: false,
      comments: reservation.workingMemo ?? undefined,
      type: reservationTypeSchema
        .optional()
        .parse(reservation.type?.toUpperCase()),
      name: reservation.name ?? "",
      description: reservation.description ?? "",
      ageGroup: options.ageGroup.find(
        (x) => x.value === reservation.ageGroup?.pk
      ),
      applyingForFreeOfCharge: reservation.applyingForFreeOfCharge ?? undefined,
      billingAddressCity: reservation.billingAddressCity ?? "",
      billingAddressStreet: reservation.billingAddressStreet ?? "",
      billingAddressZip: reservation.billingAddressZip ?? "",
      billingEmail: reservation.billingEmail ?? "",
      billingFirstName: reservation.billingFirstName ?? "",
      billingLastName: reservation.billingLastName ?? "",
      billingPhone: reservation.billingPhone ?? "",
      freeOfChargeReason: reservation.freeOfChargeReason ?? undefined,
      homeCity: options.homeCity.find(
        (x) => x.value === reservation.homeCity?.pk
      ),
      numPersons: reservation.numPersons ?? undefined,
      purpose: options.purpose.find((x) => x.value === reservation.purpose?.pk),
      reserveeAddressCity: reservation.reserveeAddressCity ?? "",
      reserveeAddressStreet: reservation.reserveeAddressStreet ?? "",
      reserveeAddressZip: reservation.reserveeAddressZip ?? "",
      reserveeEmail: reservation.reserveeEmail ?? "",
      reserveeFirstName: reservation.reserveeFirstName ?? "",
      reserveeId: reservation.reserveeId ?? "",
      reserveeIsUnregisteredAssociation:
        reservation.reserveeIsUnregisteredAssociation ?? undefined,
      reserveeLastName: reservation.reserveeLastName ?? "",
      reserveeOrganisationName: reservation.reserveeOrganisationName ?? "",
      reserveePhone: reservation.reserveePhone ?? "",
      reserveeType: reservation.reserveeType ?? undefined,
    },
  });

  const myDateTime = (date: Date, time: string) =>
    dateTime(format(date, "dd.MM.yyyy"), time);

  const { notifyError, notifySuccess } = useNotification();

  // FIXME replace this with ReservationUpdateMutationInput
  // but is it the staff version or not?
  const [create] = useMutation<
    { createStaffReservation: ReservationStaffCreateMutationPayload },
    { input: ReservationStaffCreateMutationInput }
  >(CREATE_STAFF_RESERVATION);

  const createStaffReservation = (input: ReservationStaffCreateMutationInput) =>
    create({ variables: { input } });

  const onSubmit = async (values: FormValueType) => {
    try {
      if (!reservationUnit.pk) {
        throw new Error("Missing reservation unit");
      }

      const metadataSetFields =
        reservationUnit.metadataSet?.supportedFields
          ?.filter((x): x is string => x != null)
          .map(camelCase) ?? [];

      const flattenedMetadataSetValues = flattenMetadata(
        values,
        metadataSetFields
      );

      const input: ReservationStaffCreateMutationInput = {
        reservationUnitPks: [reservationUnit.pk],
        type: values.type ?? "",
        begin: myDateTime(new Date(values.date), values.startTime),
        end: myDateTime(new Date(values.date), values.endTime),
        bufferTimeBefore: values.bufferTimeBefore
          ? String(reservationUnit.bufferTimeBefore)
          : undefined,
        bufferTimeAfter: values.bufferTimeAfter
          ? String(reservationUnit.bufferTimeAfter)
          : undefined,
        workingMemo: values.comments,
        ...flattenedMetadataSetValues,
      };

      const { data: createResponse } = await createStaffReservation(input);

      const firstError = (
        createResponse?.createStaffReservation?.errors || []
      ).find(() => true);

      if (firstError) {
        notifyError(
          t("ReservationDialog.saveFailed", {
            error: get(firstError, "messages[0]"),
          })
        );
      } else {
        notifySuccess(
          t("ReservationDialog.saveSuccess", {
            reservationUnit: reservationUnit.nameFi,
          })
        );
        onClose();
      }
    } catch (e) {
      notifyError(
        t("ReservationDialog.saveFailed", { error: get(e, "message") })
      );
    }
  };

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Grid>
          <ReservationTypeForm reservationUnit={reservationUnit} />
          <GridHR />
          <ButtonContainer>
            <Button variant="secondary" onClick={onClose} theme="black">
              {t("common.cancel")}
            </Button>
            <Button type="submit">{t("Reservation.EditPage.save")}</Button>
          </ButtonContainer>
        </Grid>
      </form>
    </FormProvider>
  );
};

const EditPage = () => {
  const params = useParams();
  const id = params.id ?? undefined;

  const { t } = useTranslation("translation", {
    keyPrefix: "Reservation.EditPage",
  });
  const navigate = useNavigate();

  const { reservation, reservationUnit, loading } = useReservationEditData(id);

  const handleClose = () => {
    navigate(-1);
  };

  const options = useOptions();

  return (
    <EditPageWrapper reservation={reservation} title={t("title")}>
      {loading ? (
        <Loader />
      ) : !reservation ? (
        t("Reservation failed to load", { pk: id })
      ) : !reservationUnit ? (
        t("Reservation unit failed to load")
      ) : (
        <EditReservation
          reservation={reservation}
          reservationUnit={reservationUnit}
          onClose={handleClose}
          options={options}
        />
      )}
    </EditPageWrapper>
  );
};

export default withMainMenu(EditPage);
