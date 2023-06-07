import React from "react";
import styled from "styled-components";
import { useTranslation } from "react-i18next";
import { useMutation } from "@apollo/client";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ReservationsReservationStateChoices,
  type RecurringReservationUpdateMutationInput,
  type RecurringReservationUpdateMutationPayload,
  type ReservationStaffModifyMutationInput,
  type ReservationStaffModifyMutationPayload,
  type ReservationType,
  type ReservationUnitType,
  type ReservationWorkingMemoMutationInput,
} from "common/types/gql-types";
import camelCase from "lodash/camelCase";
import { Button, TextInput } from "hds-react";
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
import ReservationTypeForm from "../my-units/ReservationTypeForm";
import Loader from "../Loader";
import { HR } from "../lists/components";
import { useOptions } from "../my-units/hooks";
import EditPageWrapper from "./EditPageWrapper";
import {
  useRecurringReservations,
  useReservationEditData,
} from "./requested/hooks";
import {
  UPDATE_STAFF_RECURRING_RESERVATION,
  UPDATE_STAFF_RESERVATION,
} from "./queries";

type FormValueType = ReservationChangeFormType & ReservationFormMeta;

type PossibleOptions = {
  ageGroup: Array<{ label: string; value: number }>;
  purpose: Array<{ label: string; value: number }>;
  homeCity: Array<{ label: string; value: number }>;
};

const ButtonContainer = styled.div`
  gap: 1rem;
  display: flex;
  justify-content: flex-end;
  border-top-width: 2px;
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
  >(UPDATE_STAFF_RESERVATION);

  const { reservations } = useRecurringReservations(
    reservation.recurringReservation?.pk ?? undefined
  );

  const [recurringMutation] = useMutation<
    { staffReservationModify: RecurringReservationUpdateMutationPayload },
    {
      input: RecurringReservationUpdateMutationInput;
    }
  >(UPDATE_STAFF_RECURRING_RESERVATION);

  const handleSucces = (isRecurring: boolean) => {
    // TODO for recurring this needs to be “Muutokset tallennettu tuleviin varauksiin!”
    notifySuccess(
      t(
        `Reservation.EditPage.${
          isRecurring ? "saveSuccessRecurring" : "saveSuccess"
        }`
      )
    );
    onSuccess();
  };
  const handleError = () => {
    notifyError(t("Reservation.EditPage.saveError"));
  };

  const isRecurring = !!reservation.recurringReservation?.pk;

  const editStaffReservation = async (
    input: ReservationStaffModifyMutationInput & {
      seriesName?: string;
      workingMemo?: string;
    }
  ) => {
    const { seriesName, workingMemo, ...rest } = input;
    if (isRecurring) {
      // NOTE frontend filtering because of cache issues
      const toUpdate = reservations
        .filter((x) => new Date(x.begin) >= new Date())
        .filter(
          (x) => x.state === ReservationsReservationStateChoices.Confirmed
        )
        .map((x) => x.pk)
        .filter((x): x is number => x != null);

      await recurringMutation({
        variables: {
          input: {
            name: seriesName,
            pk: reservation.recurringReservation?.pk ?? 0,
          },
        },
      });

      // FIXME do we update the workingMemo or the recurring description?
      const resolved = toUpdate.map((pk) =>
        mutation({
          variables: {
            input: { ...rest, pk },
            workingMemo: { pk, workingMemo },
          },
        })
      );

      // TODO early abort if one of the mutations fails
      await Promise.all(resolved)
        .then(() => handleSucces(true))
        .catch(handleError);
    } else {
      mutation({
        variables: {
          input: rest,
          workingMemo: {
            pk: input.pk,
            workingMemo,
          },
        },
        onCompleted: () => handleSucces(false),
        onError: handleError,
      });
    }
  };

  return editStaffReservation;
};

const InnerTextInput = styled(TextInput)`
  grid-column: 1 / -1;
  max-width: var(--prose-width);
`;

const Form = styled.form`
  display: flex;
  gap: 1rem;
  flex-direction: column;
`;

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
      seriesName: reservation.recurringReservation?.name ?? "",
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
      seriesName: values.seriesName !== "" ? values.seriesName : undefined,
      workingMemo: values.comments,
      type: values.type ?? "",
      bufferTimeBefore: values.bufferTimeBefore
        ? reservationUnit.bufferTimeBefore
        : undefined,
      bufferTimeAfter: values.bufferTimeAfter
        ? reservationUnit.bufferTimeAfter
        : undefined,
      ...flattenedMetadataSetValues,
    };

    changeStaffReservation(toSubmit);
  };

  const {
    handleSubmit,
    register,
    formState: { isDirty },
  } = form;

  return (
    <FormProvider {...form}>
      <Form onSubmit={handleSubmit(onSubmit)} noValidate>
        <ReservationTypeForm reservationUnit={reservationUnit}>
          {reservation.recurringReservation?.pk && (
            <InnerTextInput
              id="seriesName"
              disabled={reservationUnit == null}
              label={t(`MyUnits.RecurringReservationForm.name`)}
              required
              {...register("seriesName")}
              // FIXME errors? series name needs to !== "" at least
              // invalid={errors.seriesName != null}
              // errorText={translateError(errors.seriesName?.message)}
            />
          )}
        </ReservationTypeForm>
        <HR />
        <ButtonContainer>
          <Button variant="secondary" onClick={onCancel} theme="black">
            {t("common.cancel")}
          </Button>
          <Button type="submit" disabled={!isDirty}>
            {t("Reservation.EditPage.save")}
          </Button>
        </ButtonContainer>
      </Form>
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
