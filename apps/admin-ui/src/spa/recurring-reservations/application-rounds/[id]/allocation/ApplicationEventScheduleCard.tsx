import React from "react";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import { Strong } from "common/src/common/typography";
import { useMutation } from "@apollo/client";
import type {
  ApplicationEventNode,
  Mutation,
  MutationApproveApplicationEventScheduleArgs,
} from "common/types/gql-types";
import { filterNonNullable } from "common/src/helpers";
import type { ReservationUnitNode } from "common";
import { getApplicantName } from "@/component/applications/util";
import { formatDuration } from "@/common/util";
import { SmallRoundButton } from "@/styles/buttons";
import { useNotification } from "@/context/NotificationContext";
import { useAllocationContext } from "@/context/AllocationContext";
import {
  ApplicationEventScheduleResultStatuses,
  doSomeSlotsFitApplicationEventSchedule,
  getApplicationEventScheduleTimeString,
  timeSlotKeyToScheduleTime,
} from "./modules/applicationRoundAllocation";
import { APPROVE_APPLICATION_EVENT_SCHEDULE } from "./queries";

type Props = {
  applicationEvent: ApplicationEventNode;
  reservationUnit: ReservationUnitNode;
  selection: string[];
  applicationEventScheduleResultStatuses: ApplicationEventScheduleResultStatuses;
};

const Wrapper = styled.div`
  &:last-of-type {
    border: 0;
    margin-bottom: 0;
  }

  border-bottom: 1px solid var(--color-black-50);
  margin-bottom: var(--spacing-s);
  padding-bottom: var(--spacing-s);
`;

const ApplicationEventName = styled.div`
  ${Strong}
  font-size: var(--fontsize-body-m);
`;

const Applicant = styled.div`
  line-height: var(--lineheight-m);
  padding-bottom: var(--spacing-2-xs);
`;

const DetailRow = styled.div`
  text-align: left;

  > span {
    &:nth-of-type(1) {
      white-space: nowrap;
      margin-right: var(--spacing-3-xs);
    }

    &:nth-of-type(2) {
      ${Strong}
    }
  }
`;

const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: var(--spacing-s);
`;

const ApplicationEventScheduleCard = ({
  applicationEvent,
  reservationUnit,
  selection,
  applicationEventScheduleResultStatuses,
}: Props): JSX.Element => {
  const { setRefreshApplicationEvents } = useAllocationContext();
  const { notifyError, notifySuccess } = useNotification();
  const { t } = useTranslation();

  const [acceptApplicationEvent] = useMutation<
    Mutation,
    MutationApproveApplicationEventScheduleArgs
  >(APPROVE_APPLICATION_EVENT_SCHEDULE, {
    onCompleted: () => {
      notifySuccess(
        t("Allocation.acceptingSuccess", {
          applicationEvent: applicationEvent.name,
        })
      );
    },
  });

  const selectionDuration = formatDuration(selection.length * 30 * 60);

  const aes = filterNonNullable(applicationEvent?.applicationEventSchedules);
  const matchingSchedules = aes.filter((ae) =>
    doSomeSlotsFitApplicationEventSchedule(ae, selection)
  );
  const matchingApplicationEventSchedule =
    matchingSchedules.length > 0 ? matchingSchedules[0] : undefined;

  const handleAcceptSlot = async () => {
    if (
      selection.length === 0 ||
      reservationUnit.pk == null ||
      matchingApplicationEventSchedule?.pk == null
    ) {
      notifyError(t("Allocation.errors.acceptingFailed"));
      return;
    }
    const allocatedBegin = timeSlotKeyToScheduleTime(selection[0]);
    const allocatedEnd = timeSlotKeyToScheduleTime(
      selection[selection.length - 1],
      true
    );
    const input = {
      pk: matchingApplicationEventSchedule.pk,
      allocatedReservationUnit: reservationUnit.pk,
      allocatedDay: matchingApplicationEventSchedule.day,
      allocatedBegin,
      allocatedEnd,
    };

    const { data, errors } = await acceptApplicationEvent({
      variables: {
        input,
      },
    });
    if (errors) {
      notifyError(
        t("Allocation.errors.acceptingFailed", {
          applicationEvent: applicationEvent.name,
        })
      );
      return;
    }
    const res = data?.approveApplicationEventSchedule;
    const { errors: resErrors } = res || {};
    if (resErrors) {
      notifyError(
        t("Allocation.errors.acceptingFailed", {
          applicationEvent: applicationEvent.name,
        })
      );
      return;
    }
    setRefreshApplicationEvents(true);
  };

  const parsedDuration =
    applicationEvent.minDuration === applicationEvent.maxDuration
      ? formatDuration(applicationEvent.minDuration)
      : `${formatDuration(applicationEvent.minDuration)} - ${formatDuration(
          applicationEvent.maxDuration
        )}`;

  const primaryTimes = getApplicationEventScheduleTimeString(aes, 300);
  const secondaryTimes = getApplicationEventScheduleTimeString(aes, 200);

  // WHY? don't we already have application? or would it be a circular reference in gql
  // also can we just refactor this so that applicantName is passed here instead of applications?
  const application = applicationEvent.application ?? null;
  const applicantName =
    application != null ? getApplicantName(application) : "-";
  const isReservable = !selection.some((slot) =>
    applicationEventScheduleResultStatuses.acceptedSlots.includes(slot)
  );

  const disableAllocateButton =
    !reservationUnit.pk || !matchingApplicationEventSchedule || !isReservable;

  return (
    <Wrapper>
      <ApplicationEventName>{applicationEvent.name}</ApplicationEventName>
      <Applicant>{applicantName}</Applicant>
      <DetailRow>
        <span>{t("Allocation.applicationsWeek")}:</span>
        <span>
          {parsedDuration}, {applicationEvent.eventsPerWeek}x
        </span>
      </DetailRow>
      <DetailRow>
        <span>{t("Allocation.primaryTimes")}:</span>
        <span>{primaryTimes || "-"}</span>
      </DetailRow>
      <DetailRow>
        <span>{t("Allocation.secondaryTimes")}:</span>
        <span>{secondaryTimes || "-"}</span>
      </DetailRow>
      <Actions>
        <SmallRoundButton
          variant="primary"
          disabled={disableAllocateButton}
          onClick={handleAcceptSlot}
        >
          {t("Allocation.acceptSlot", { duration: selectionDuration })}
        </SmallRoundButton>
      </Actions>
    </Wrapper>
  );
};

export { ApplicationEventScheduleCard };