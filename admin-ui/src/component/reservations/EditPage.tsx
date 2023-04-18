import React from "react";
import styled from "styled-components";
import { useTranslation } from "react-i18next";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Query,
  QueryReservationByPkArgs,
  ReservationStaffCreateMutationInput,
  ReservationStaffCreateMutationPayload,
  ReservationType,
  ReservationUnitType,
} from "common/types/gql-types";
import { useMutation, useQuery } from "@apollo/client";
import { format } from "date-fns";
import get from "lodash/get";
import camelCase from "lodash/camelCase";
import { Button } from "hds-react";
import { FormProvider, useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import {
  ReservationFormSchema,
  ReservationFormType,
} from "../my-units/create-reservation/validator";
import LinkPrev from "../LinkPrev";
import { Container } from "../../styles/layout";
import withMainMenu from "../withMainMenu";
import { useNotification } from "../../context/NotificationContext";
import { CREATE_STAFF_RESERVATION } from "../my-units/create-reservation/queries";
import { flattenMetadata } from "../my-units/create-reservation/utils";
import { dateTime } from "../ReservationUnits/ReservationUnitEditor/DateTimeInput";
import {
  Grid,
  Element,
} from "../my-units/MyUnitRecurringReservation/commonStyling";
import ControlledDateInput from "../my-units/components/ControlledDateInput";
import ControlledTimeInput from "../my-units/components/ControlledTimeInput";
import ReservationTypeForm from "../my-units/ReservationTypeForm";
import Loader from "../Loader";
import { SINGLE_RESERVATION_QUERY } from "./queries";
import { HR } from "../lists/components";
import ReservationTitleSection from "./requested/ReservationTitleSection";
import { createTagString } from "./requested/util";
import { ReservationFormMeta } from "./metaValidators";
import { useOptions } from "../my-units/hooks";

const PreviousLinkWrapper = styled.div`
  padding: var(--spacing-s);
`;

// TODO use zod or at least return the enum types
// data is lower case but the enums are uppercase
const reservationTypeFromString = (
  t: string | undefined
): "STAFF" | "BEHALF" | "BLOCKED" | undefined => {
  const t1 = t?.toUpperCase();
  if (t1 === "STAFF" || t1 === "BEHALF" || t1 === "BLOCKED") {
    return t1;
  }
  return undefined;
};

type FormValueType = ReservationFormType & ReservationFormMeta;

// TODO this is a copy from CreateReservationModal.tsx combine if possible
// differences: useEditMutation, No dialog wrappers, form default values
// TODO narrow the reservationUnit to only include what is needed (not the whole unit) so we can use single query
// NOTE need to pass all query results as values (not undefined) otherwise form default values wont work
const EditReservation = ({
  onClose,
  reservation,
  reservationUnit,
  options,
}: {
  onClose: () => void;
  reservation: ReservationType;
  reservationUnit: ReservationUnitType;
  // TODO type should be defined not inlined
  options: {
    ageGroup: Array<{ label: string; value: number }>;
    purpose: Array<{ label: string; value: number }>;
    homeCity: Array<{ label: string; value: number }>;
  };
}) => {
  const { t } = useTranslation();
  const start = new Date(reservation.begin);
  const end = new Date(reservation.end);

  const form = useForm<FormValueType>({
    resolver: zodResolver(
      // TODO validator should contain the MetaValidator also (inherit and combine)
      ReservationFormSchema(reservationUnit.reservationStartInterval)
    ),
    // TODO onBlur or onChange? onChange is anoying because it highlights even untouched fields
    // onBlur on the other hand does no validation on the focused field till it's blurred

    // I want show errors for touched fields onBlur + clear errors onChange
    // I guess I just have to write logic for it using isTouched + onChange

    mode: "onChange",
    defaultValues: {
      date: start,
      startTime: format(start, "HH:mm"),
      endTime: format(end, "HH:mm"),
      bufferTimeBefore: false,
      bufferTimeAfter: false,
      comments: reservation.workingMemo ?? undefined,
      type: reservationTypeFromString(reservation.type ?? undefined),
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

  const {
    formState: { errors },
  } = form;

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

  const translateError = (errorMsg?: string) =>
    errorMsg ? t(`reservationForm:errors.${errorMsg}`) : "";

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Grid>
          <Element>
            <ControlledDateInput
              name="date"
              control={form.control}
              error={translateError(errors.date?.message)}
              required
            />
          </Element>
          <Element>
            <ControlledTimeInput
              name="startTime"
              control={form.control}
              error={translateError(errors.startTime?.message)}
              required
            />
          </Element>
          <Element>
            <ControlledTimeInput
              name="endTime"
              control={form.control}
              error={translateError(errors.endTime?.message)}
              required
            />
          </Element>
          <ReservationTypeForm reservationUnit={reservationUnit} />
          <HR
            style={{
              gridColumn: "1 / -1",
            }}
          />
          <Element
            style={{
              gridColumnEnd: "-1",
              gap: "1rem",
              display: "flex",
              borderTopWidth: "2px",
            }}
          >
            <Button variant="secondary" onClick={onClose} theme="black">
              {t("common.cancel")}
            </Button>
            <Button type="submit">{t("EditPage.save")}</Button>
          </Element>
        </Grid>
      </form>
    </FormProvider>
  );
};

const EditPage = () => {
  const params = useParams();
  const id = params.id ?? undefined;

  const { data, loading } = useQuery<Query, QueryReservationByPkArgs>(
    SINGLE_RESERVATION_QUERY,
    {
      skip: !id,
      fetchPolicy: "no-cache",
      variables: {
        pk: Number(id),
      },
    }
  );

  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleClose = () => {
    navigate(-1);
  };

  const reservation = data?.reservationByPk ?? undefined;
  const reservationUnit =
    data?.reservationByPk?.reservationUnits?.find((x) => x != null) ??
    undefined;
  const tagline = reservation ? createTagString(reservation, t) : "";

  const options = useOptions();

  return (
    <>
      <PreviousLinkWrapper>
        <LinkPrev />
      </PreviousLinkWrapper>
      {/* TODO the container and title section is common with RequestedReservation and EditTime */}
      <Container>
        {reservation && (
          <ReservationTitleSection
            reservation={reservation}
            tagline={tagline}
          />
        )}
        {loading ? (
          <Loader />
        ) : !reservation || !reservationUnit ? (
          "No data"
        ) : (
          <EditReservation
            reservation={reservation}
            reservationUnit={reservationUnit}
            onClose={handleClose}
            options={options}
          />
        )}
      </Container>
    </>
  );
};

export default withMainMenu(EditPage);
