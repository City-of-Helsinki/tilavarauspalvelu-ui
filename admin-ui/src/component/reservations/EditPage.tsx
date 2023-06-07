import React from "react";
import styled from "styled-components";
import { useTranslation } from "react-i18next";
import { useMutation } from "@apollo/client";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ReservationStaffModifyMutationInput,
  ReservationStaffModifyMutationPayload,
  ReservationType,
  ReservationUnitType,
  ReservationWorkingMemoMutationInput,
  ReservationsReservationStateChoices,
} from "common/types/gql-types";
import camelCase from "lodash/camelCase";
import { Button } from "hds-react";
import { FormProvider, useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { ErrorBoundary } from "react-error-boundary";
import {
  type ReservationFormMeta,
  ReservationTypeSchema,
  type ReservationChangeFormType,
  ReservationChangeFormSchema,
} from "app/schemas";
import withMainMenu from "../withMainMenu";
import { useNotification } from "../../context/NotificationContext";
import { flattenMetadata } from "../my-units/create-reservation/utils";
import {
  Grid,
  Element,
} from "../my-units/MyUnitRecurringReservation/commonStyling";
import ReservationTypeForm from "../my-units/ReservationTypeForm";
import Loader from "../Loader";
import { HR } from "../lists/components";
import { useOptions } from "../my-units/hooks";
import EditPageWrapper from "./EditPageWrapper";
import {
  useRecurringReservations,
  useReservationEditData,
} from "./requested/hooks";
import { CHANGE_STAFF_RESERVATION } from "./queries";

type FormValueType = ReservationChangeFormType & ReservationFormMeta;

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

const noSeparateBillingDefined = (reservation: ReservationType): boolean =>
  !reservation.billingAddressCity &&
  !reservation.billingAddressStreet &&
  !reservation.billingAddressZip &&
  !reservation.billingEmail &&
  !reservation.billingFirstName &&
  !reservation.billingLastName &&
  !reservation.billingPhone;

/// Combines regular and recurring reservation change mutation
const useStaffReservationMutation = ({
  reservation,
  onSuccess,
}: {
  reservation: ReservationType;
  onSuccess: () => void;
}) => {
  const { t } = useTranslation();
  const { notifyError, notifySuccess } = useNotification();
  const [mutation] = useMutation<
    { staffReservationModify: ReservationStaffModifyMutationPayload },
    {
      input: ReservationStaffModifyMutationInput;
      workingMemo: ReservationWorkingMemoMutationInput;
    }
  >(CHANGE_STAFF_RESERVATION);

  const today = new Date();
  const { reservations } = useRecurringReservations(
    reservation.recurringReservation?.pk ?? undefined,
    {
      states: [ReservationsReservationStateChoices.Confirmed],
      begin: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
    }
  );

  const handleSucces = () => {
    notifySuccess(t("Reservation.EditPage.saveSuccess"));
    onSuccess();
  };
  const handleError = () => {
    notifyError(t("Reservation.EditPage.saveError"));
  };

  const isRecurring = !!reservation.recurringReservation?.pk;

  const editStaffReservation = async (
    input: ReservationStaffModifyMutationInput,
    workingMemo?: string
  ) => {
    if (isRecurring) {
      const toUpdate = reservations
        .map((x) => x.pk)
        .filter((x): x is number => x != null);

      // FIXME do we update the workingMemo or the recurring description?
      const resolved = toUpdate.map((pk) =>
        mutation({
          variables: {
            input: { ...input, pk },
            workingMemo: { pk, workingMemo },
          },
        })
      );

      await Promise.all(resolved).then(handleSucces).catch(handleError);
    } else {
      mutation({
        variables: {
          input,
          workingMemo: {
            pk: input.pk,
            workingMemo,
          },
        },
        onCompleted: handleSucces,
        onError: handleError,
      });
    }
  };

  return editStaffReservation;
};

const EditReservation = ({
  onCancel,
  reservation,
  reservationUnit,
  options,
  onSuccess,
}: {
  onCancel: () => void;
  reservation: ReservationType;
  reservationUnit: ReservationUnitType;
  options: PossibleOptions;
  onSuccess: () => void;
}) => {
  const { t } = useTranslation();

  // TODO recurring requires a description and a name box
  const form = useForm<FormValueType>({
    resolver: zodResolver(ReservationChangeFormSchema),
    mode: "onChange",
    defaultValues: {
      bufferTimeBefore: false,
      bufferTimeAfter: false,
      comments: reservation.workingMemo ?? undefined,
      type: ReservationTypeSchema.optional().parse(
        reservation.type?.toUpperCase()
      ),
      name: reservation.name ?? "",
      description: reservation.description ?? "",
      ageGroup: options.ageGroup.find(
        (x) => x.value === reservation.ageGroup?.pk
      ),
      applyingForFreeOfCharge: reservation.applyingForFreeOfCharge ?? undefined,
      showBillingAddress: !noSeparateBillingDefined(reservation),
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

  const { notifyError } = useNotification();

  const changeStaffReservation = useStaffReservationMutation({
    reservation,
    onSuccess,
  });

  const onSubmit = async (values: FormValueType) => {
    if (!reservationUnit.pk) {
      notifyError("ERROR: Can't update without reservation unit");
      return;
    }
    if (!reservation.pk) {
      notifyError("ERROR: Can't update without reservation");
      return;
    }

    const metadataSetFields =
      reservationUnit.metadataSet?.supportedFields
        ?.filter((x): x is string => x != null)
        .map(camelCase) ?? [];

    const flattenedMetadataSetValues = flattenMetadata(
      values,
      metadataSetFields
    );

    const toSubmit = {
      pk: reservation.pk,
      reservationUnitPks: [reservationUnit.pk],
      type: values.type ?? "",
      bufferTimeBefore: values.bufferTimeBefore
        ? reservationUnit.bufferTimeBefore
        : undefined,
      bufferTimeAfter: values.bufferTimeAfter
        ? reservationUnit.bufferTimeAfter
        : undefined,
      ...flattenedMetadataSetValues,
    };

    changeStaffReservation(toSubmit, values.comments);
  };

  const {
    handleSubmit,
    formState: { isDirty },
  } = form;

  return (
    <FormProvider {...form}>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <Grid>
          <ReservationTypeForm reservationUnit={reservationUnit} />
          <GridHR />
          <ButtonContainer>
            <Button variant="secondary" onClick={onCancel} theme="black">
              {t("common.cancel")}
            </Button>
            <Button type="submit" disabled={!isDirty}>
              {t("Reservation.EditPage.save")}
            </Button>
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

  const { reservation, reservationUnit, loading, refetch } =
    useReservationEditData(id);

  const handleCancel = () => {
    navigate(-1);
  };

  const handleSuccess = () => {
    refetch();
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
        <ErrorBoundary fallback={<div>{t("pageThrewError")}</div>}>
          <EditReservation
            reservation={reservation}
            reservationUnit={reservationUnit}
            onCancel={handleCancel}
            options={options}
            onSuccess={handleSuccess}
          />
        </ErrorBoundary>
      )}
    </EditPageWrapper>
  );
};

export default withMainMenu(EditPage);
