import { useQuery } from "@apollo/client";
import { trim } from "lodash";
import React, { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import styled from "styled-components";
import { TFunction } from "i18next";
import { add, startOfISOWeek } from "date-fns";
import { breakpoints } from "common/src/common/style";
import {
  Maybe,
  Query,
  QueryReservationByPkArgs,
  ReservationType,
  ReservationsReservationReserveeTypeChoices,
  ReservationUnitsReservationUnitPricingPricingTypeChoices,
  ReservationsReservationStateChoices,
} from "common/types/gql-types";
import { Permission } from "@/modules/permissionHelper";
import { publicUrl } from "@/common/const";
import { useNotification } from "@/context/NotificationContext";
import Loader from "@/component/Loader";
import { useModal } from "@/context/ModalContext";
import { ButtonContainer, Container } from "@/styles/layout";
import BreadcrumbWrapper from "@/component/BreadcrumbWrapper";
import ShowWhenTargetInvisible from "@/component/ShowWhenTargetInvisible";
import StickyHeader from "@/component/StickyHeader";
import { ReservationWorkingMemo } from "@/component/WorkingMemo";
import { Accordion } from "@/common/hds-fork/Accordion";
import {
  ageGroup,
  createTagString,
  getName,
  getReservatinUnitPricing,
  getTranslationKeyForReserveeType,
  reservationPrice,
} from "./util";
import Calendar from "./Calendar";
import ReservationUserBirthDate from "./ReservationUserBirthDate";
import VisibleIfPermission from "./VisibleIfPermission";
import ApprovalButtons from "./ApprovalButtons";
import RecurringReservationsView from "./RecurringReservationsView";
import { useRecurringReservations, useReservationData } from "./hooks";
import ApprovalButtonsRecurring from "./ApprovalButtonsRecurring";
import ReservationTitleSection from "./ReservationTitleSection";
import { SINGLE_RESERVATION_QUERY } from "./hooks/queries";

const ApplicationDatas = styled.div`
  display: grid;
  gap: var(--spacing-l);
  grid-template-columns: 1fr;
  @media (min-width: ${breakpoints.m}) {
    grid-template-columns: 1fr 1fr;
  }
`;

const Summary = styled(ApplicationDatas)`
  padding: var(--spacing-m);
  gap: var(--spacing-s);
  background: var(--color-black-5);

  display: grid;
  grid-template-columns: 1fr;
  @media (min-width: ${breakpoints.m}) {
    grid-template-columns: 1fr 1fr;
  }
`;

const ApplicationProp = ({
  label,
  data,
  wide,
}: {
  label: string;
  data?: Maybe<string> | number;
  wide?: boolean;
}) =>
  data ? (
    <div style={{ gridColumn: wide ? "1 / -1" : "" }}>
      {label}: <strong style={{ whiteSpace: "pre-wrap" }}>{data}</strong>
    </div>
  ) : null;

const ApplicationData = ({
  label,
  data,
  wide,
}: {
  label: string;
  data?: Maybe<string> | number | JSX.Element;
  wide?: boolean;
}) => (
  <div style={{ fontWeight: "400", gridColumn: wide ? "1 / span 2" : "auto" }}>
    <div
      style={{
        paddingBottom: "var(--spacing-xs)",
        color: "var(--color-black-70)",
      }}
    >
      <span>{label}</span>
    </div>
    <span style={{ fontSize: "var(--fontsize-body-l)" }}>{data}</span>
  </div>
);

const ButtonsWithPermChecks = ({
  reservation,
  isFree,
  onReservationUpdated,
  disableNonEssentialButtons,
}: {
  reservation: ReservationType;
  isFree: boolean;
  // Hack to deal with reservation query not being cached so we need to refetch
  onReservationUpdated: () => void;
  disableNonEssentialButtons?: boolean;
}) => {
  const { setModalContent } = useModal();

  const closeDialog = () => {
    setModalContent(null);
  };

  return (
    <VisibleIfPermission
      reservation={reservation}
      permission={Permission.CAN_MANAGE_RESERVATIONS}
    >
      {reservation.recurringReservation ? (
        <ApprovalButtonsRecurring
          recurringReservation={reservation.recurringReservation}
          handleClose={closeDialog}
          handleAccept={() => {
            onReservationUpdated();
            closeDialog();
          }}
          disableNonEssentialButtons={disableNonEssentialButtons}
        />
      ) : (
        <ApprovalButtons
          state={reservation.state}
          isFree={isFree}
          reservation={reservation}
          handleClose={closeDialog}
          handleAccept={() => {
            onReservationUpdated();
            closeDialog();
          }}
          disableNonEssentialButtons={disableNonEssentialButtons}
        />
      )}
    </VisibleIfPermission>
  );
};

const translateType = (res: ReservationType, t: TFunction) => {
  const [part1, part2] = getTranslationKeyForReserveeType(
    res.type ?? undefined,
    res.reserveeType ?? undefined,
    res.reserveeIsUnregisteredAssociation ?? false
  );
  return `${t(part1)}${part2 ? `: ${t(part2)}` : ""}`;
};

const ReservationSummary = ({
  reservation,
  isFree,
}: {
  reservation: ReservationType;
  isFree: boolean;
}) => {
  const { t } = useTranslation();

  const type =
    reservation.reserveeType != null
      ? {
          l: "reserveeType",
          v: translateType(reservation, t),
        }
      : undefined;

  const numPersons =
    reservation.numPersons != null
      ? { l: "numPersons", v: reservation.numPersons }
      : undefined;

  const ageGroupParams =
    reservation.ageGroup != null
      ? {
          l: "ageGroup",
          v: `${ageGroup(reservation.ageGroup)} ${t(
            "RequestedReservation.ageGroupSuffix"
          )}`,
        }
      : undefined;

  const purpose =
    reservation.purpose?.nameFi != null
      ? { l: "purpose", v: reservation.purpose.nameFi }
      : undefined;

  const description = reservation.description
    ? { l: "description", v: reservation.description }
    : undefined;

  const price = !isFree
    ? {
        l: "price",
        v: `${reservationPrice(reservation, t)}${
          reservation.applyingForFreeOfCharge
            ? `, ${t("RequestedReservation.appliesSubvention")}`
            : ""
        }`,
      }
    : undefined;

  const cancelReasonString =
    reservation.state === ReservationsReservationStateChoices.Cancelled
      ? {
          l: "cancelReason",
          v: reservation?.cancelReason?.reasonFi || "-",
        }
      : undefined;
  const rejectionReasonString =
    reservation.state === ReservationsReservationStateChoices.Denied
      ? {
          l: "denyReason",
          v: reservation?.denyReason?.reasonFi || "-",
        }
      : undefined;

  const summary = [
    ...(type != null ? [type] : []),
    ...(numPersons != null ? [numPersons] : []),
    ...(ageGroupParams != null ? [ageGroupParams] : []),
    ...(purpose != null ? [purpose] : []),
    ...(description != null ? [description] : []),
    ...(price != null ? [price] : []),
    ...(cancelReasonString != null ? [cancelReasonString] : []),
    ...(rejectionReasonString != null ? [rejectionReasonString] : []),
    ...(reservation.handlingDetails != null
      ? [{ l: "handlingDetails", v: reservation.handlingDetails }]
      : []),
  ];

  if (summary.length === 0) {
    return null;
  }

  return (
    <Summary>
      {summary.map((e) => (
        <ApplicationProp
          key={e.l}
          label={t(`RequestedReservation.${e.l}`)}
          data={e.v}
          wide={e.l === "handlingDetails"}
        />
      ))}
    </Summary>
  );
};

const maybeStringToDate: (s?: string) => Date | undefined = (str) =>
  str ? new Date(str) : undefined;

const onlyFutureDates: (d?: Date) => Date | undefined = (d) =>
  d && d > new Date() ? d : undefined;

const TimeBlock = ({
  reservation,
  onReservationUpdated,
}: {
  reservation: ReservationType;
  onReservationUpdated: () => void;
}) => {
  const [selected, setSelected] = useState<ReservationType | undefined>(
    undefined
  );

  const { t } = useTranslation();

  // date focus rules for Calendar
  // (1) if selected => show that
  // (2) else if reservation is in the future => show that
  // (3) else if reservation.recurrance has an event in the future => show that
  // (4) else show today
  const { reservations } = useRecurringReservations(
    reservation.recurringReservation?.pk ?? undefined
  );

  const nextReservation = reservations.find(
    (x) =>
      x.state === ReservationsReservationStateChoices.Confirmed &&
      new Date(x.begin) > new Date()
  );

  const shownReservation =
    new Date(reservation.begin) > new Date() ? reservation : nextReservation;

  const [focusDate, setFocusDate] = useState<Date>(
    maybeStringToDate(selected?.begin) ??
      onlyFutureDates(maybeStringToDate(shownReservation?.begin)) ??
      new Date()
  );

  // No month view so always query the whole week even if a single day is selected
  // to avoid spamming queries and having to deal with start of day - end of day.
  // focus day can be in the middle of the week.
  const { events: eventsAll, refetch: calendarRefetch } = useReservationData(
    startOfISOWeek(focusDate),
    add(startOfISOWeek(focusDate), { days: 7 }),
    String(reservation?.reservationUnits?.[0]?.pk),
    reservation?.pk ?? undefined
  );

  const handleChanged = () => {
    onReservationUpdated();
    calendarRefetch();
  };

  return (
    <>
      {reservation.recurringReservation?.pk && (
        <Accordion heading={t("RequestedReservation.recurring")}>
          <RecurringReservationsView
            recurringPk={reservation.recurringReservation.pk}
            onSelect={setSelected}
            onReservationUpdated={handleChanged}
            onChange={handleChanged}
          />
        </Accordion>
      )}
      <Accordion
        heading={t("RequestedReservation.calendar")}
        initiallyOpen={reservation.recurringReservation != null}
        id="reservation-calendar"
      >
        <Calendar
          reservation={reservation}
          selected={selected}
          focusDate={focusDate}
          refetch={(d) => {
            onReservationUpdated();
            // NOTE setting focus date refetches calendar data, don't double refetch
            if (!d || focusDate === d) {
              calendarRefetch();
            } else {
              setFocusDate(d);
            }
          }}
          events={eventsAll}
        />
      </Accordion>
    </>
  );
};

const RequestedReservation = ({
  reservation,
  refetch,
}: {
  reservation: ReservationType;
  refetch: () => void;
}): JSX.Element | null => {
  const { t } = useTranslation();

  const ref = useRef<HTMLHeadingElement>(null);

  const pricing = reservation?.reservationUnits?.[0]
    ? getReservatinUnitPricing(
        reservation?.reservationUnits?.[0],
        reservation.begin
      )
    : undefined;

  const isNonFree =
    pricing?.pricingType ===
      ReservationUnitsReservationUnitPricingPricingTypeChoices.Paid &&
    pricing.highestPrice >= 0;

  const reservationTagline = createTagString(reservation, t);

  return (
    <>
      <BreadcrumbWrapper
        route={[
          "reservations",
          `${publicUrl}/reservations/requested`,
          "requested-reservation",
        ]}
        aliases={[
          {
            slug: "requested",
            title: t("breadcrumb.requested-reservations"),
          },
          { slug: "requested-reservation", title: getName(reservation, t) },
        ]}
      />
      <ShowWhenTargetInvisible target={ref}>
        <StickyHeader
          name={getName(reservation, t)}
          tagline={reservationTagline}
          buttons={
            <ButtonsWithPermChecks
              reservation={reservation}
              isFree={!isNonFree}
              onReservationUpdated={refetch}
              disableNonEssentialButtons
            />
          }
        />
      </ShowWhenTargetInvisible>
      <Container>
        <ReservationTitleSection
          ref={ref}
          reservation={reservation}
          tagline={reservationTagline}
        />
        <ButtonContainer>
          <ButtonsWithPermChecks
            reservation={reservation}
            onReservationUpdated={refetch}
            isFree={!isNonFree}
          />
        </ButtonContainer>
        <ReservationSummary reservation={reservation} isFree={!isNonFree} />
        <div>
          <VisibleIfPermission
            permission={Permission.CAN_COMMENT_RESERVATIONS}
            reservation={reservation}
          >
            <Accordion
              heading={t("RequestedReservation.workingMemo")}
              initiallyOpen={
                reservation.workingMemo?.length != null &&
                reservation.workingMemo?.length > 0
              }
            >
              <ReservationWorkingMemo
                reservationPk={reservation.pk ?? 0}
                refetch={refetch}
                initialValue={reservation.workingMemo ?? ""}
              />
            </Accordion>
          </VisibleIfPermission>
          <TimeBlock reservation={reservation} onReservationUpdated={refetch} />
          <Accordion heading={t("RequestedReservation.reservationDetails")}>
            <ApplicationDatas>
              <ApplicationData
                label={t("RequestedReservation.id")}
                data={reservation.pk}
              />
              <ApplicationData
                label={t("RequestedReservation.numPersons")}
                data={reservation.numPersons}
              />
              {reservation.ageGroup && (
                <ApplicationData
                  label={t("RequestedReservation.ageGroup")}
                  data={`${ageGroup(reservation.ageGroup)} ${t(
                    "RequestedReservation.ageGroupSuffix"
                  )}`}
                />
              )}
              <ApplicationData
                label={t("RequestedReservation.purpose")}
                data={reservation.purpose?.nameFi}
              />
              <ApplicationData
                label={t("RequestedReservation.description")}
                data={reservation.description}
              />
            </ApplicationDatas>
          </Accordion>
          <Accordion heading={t("RequestedReservation.reservationUser")}>
            <ApplicationDatas>
              <ApplicationData
                label={t("RequestedReservation.reserveeType")}
                data={translateType(reservation, t)}
                wide={
                  reservation.reserveeType ===
                  ReservationsReservationReserveeTypeChoices.Individual
                }
              />
              <ApplicationData
                label={t(
                  reservation.reserveeType ===
                    ReservationsReservationReserveeTypeChoices.Business
                    ? "RequestedReservation.reserveeBusinessName"
                    : "RequestedReservation.reserveeOrganisationName"
                )}
                data={reservation.reserveeOrganisationName}
              />
              <ApplicationData
                label={t("RequestedReservation.homeCity")}
                data={reservation.homeCity?.nameFi}
              />
              <ApplicationData
                label={t("RequestedReservation.reserveeId")}
                data={
                  reservation.reserveeId ||
                  t("RequestedReservation.noReserveeId")
                }
              />
              <ApplicationData
                label={t("RequestedReservation.reserveeFirstName")}
                data={reservation.reserveeFirstName}
              />
              <ApplicationData
                label={t("RequestedReservation.reserveeLastName")}
                data={reservation.reserveeLastName}
              />
              <ApplicationData
                label={t("RequestedReservation.reserveePhone")}
                data={reservation.reserveePhone}
              />
              <ApplicationData
                label={t("RequestedReservation.reserveeEmail")}
                data={reservation.reserveeEmail}
              />
            </ApplicationDatas>
          </Accordion>

          {isNonFree && (
            <Accordion heading={t("RequestedReservation.pricingDetails")}>
              <ApplicationDatas>
                <ApplicationData
                  label={t("RequestedReservation.price")}
                  data={reservation.price && reservationPrice(reservation, t)}
                />
                <ApplicationData
                  label={t("RequestedReservation.paymentState")}
                  data={
                    reservation.orderStatus == null
                      ? "-"
                      : t(`Payment.status.${reservation.orderStatus}`)
                  }
                />
                <ApplicationData
                  label={t("RequestedReservation.applyingForFreeOfCharge")}
                  data={t(
                    reservation.applyingForFreeOfCharge
                      ? "common.true"
                      : "common.false"
                  )}
                />
                <ApplicationData
                  label={t("RequestedReservation.freeOfChargeReason")}
                  data={reservation.freeOfChargeReason}
                />
              </ApplicationDatas>
            </Accordion>
          )}
          <Accordion heading={t("RequestedReservation.reserveeDetails")}>
            <ApplicationDatas>
              <ApplicationData
                label={t("RequestedReservation.user")}
                data={
                  trim(
                    `${reservation?.user?.firstName || ""} ${
                      reservation?.user?.lastName || ""
                    }`
                  ) || t("RequestedReservation.noName")
                }
              />
              <ApplicationData
                label={t("RequestedReservation.email")}
                data={reservation?.user?.email}
              />
              <ApplicationData
                label={t("RequestedReservation.birthDate")}
                data={
                  <ReservationUserBirthDate
                    reservationPk={reservation.pk as number}
                    showLabel={t("RequestedReservation.showBirthDate")}
                    hideLabel={t("RequestedReservation.hideBirthDate")}
                  />
                }
              />
              <ApplicationData
                label={t("RequestedReservation.addressStreet")}
                data={
                  <>
                    <span>{reservation.reserveeAddressStreet || "-"}</span>
                    <br />
                    <span>
                      {reservation.reserveeAddressZip ||
                      reservation.reserveeAddressCity
                        ? `${reservation.reserveeAddressZip} ${reservation.reserveeAddressCity}`
                        : ""}
                    </span>
                  </>
                }
              />
              <ApplicationData
                label={t("RequestedReservation.addressCity")}
                data={reservation.reserveeAddressCity || "-"}
              />
            </ApplicationDatas>
          </Accordion>
        </div>
      </Container>
    </>
  );
};

const PermissionWrappedReservation = () => {
  const { id } = useParams() as { id: string };
  const { t } = useTranslation();
  const { notifyError } = useNotification();
  const { data, loading, refetch } = useQuery<Query, QueryReservationByPkArgs>(
    SINGLE_RESERVATION_QUERY,
    {
      skip: !id || Number.isNaN(Number(id)),
      fetchPolicy: "no-cache",
      variables: {
        pk: Number(id),
      },
      onError: () => {
        notifyError(t("errors.errorFetchingData"));
      },
    }
  );

  const reservation = data?.reservationByPk;

  if (loading) {
    return <Loader />;
  }

  if (!reservation) {
    return null;
  }

  return (
    <VisibleIfPermission
      permission={Permission.CAN_VIEW_RESERVATIONS}
      reservation={reservation}
      otherwise={
        <Container>
          <p>{t("errors.noPermission")}</p>
        </Container>
      }
    >
      <RequestedReservation reservation={reservation} refetch={refetch} />
    </VisibleIfPermission>
  );
};

export default PermissionWrappedReservation;
