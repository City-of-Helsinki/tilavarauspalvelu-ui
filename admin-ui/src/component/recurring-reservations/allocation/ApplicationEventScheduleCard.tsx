import React, { useMemo } from "react";
import styled from "styled-components";
import {
  ApplicationEventType,
  ApplicationType,
} from "../../../common/gql-types";
import {
  parseApplicationEventScheduleTime,
  parseDuration,
} from "../../../common/util";
import { SmallRoundButton } from "../../../styles/buttons";
import { FontBold } from "../../../styles/typography";
import {
  getApplicantName,
  getApplicationByApplicationEvent,
} from "../modules/applicationRoundAllocation";

type Props = {
  applicationEvent: ApplicationEventType;
  applications: ApplicationType[];
  selectionDuration: string | null;
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
  ${FontBold}
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
      ${FontBold}
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
  applications,
  selectionDuration,
}: Props): JSX.Element => {
  const application = useMemo(
    () =>
      getApplicationByApplicationEvent(
        applications,
        applicationEvent.pk as number
      ),
    [applicationEvent, applications]
  );

  const applicantName = useMemo(
    () => getApplicantName(application),
    [application]
  );

  const parsedDuration = useMemo(
    () =>
      applicationEvent.minDuration === applicationEvent.maxDuration
        ? parseDuration(applicationEvent.minDuration)
        : `${parseDuration(applicationEvent.minDuration)} - ${parseDuration(
            applicationEvent.maxDuration
          )}`,
    [applicationEvent.minDuration, applicationEvent.maxDuration]
  );

  const primaryTimes = useMemo(() => {
    const schedules = applicationEvent?.applicationEventSchedules?.filter(
      (applicationEventSchedule) => applicationEventSchedule?.priority === 300
    );

    return schedules
      ?.map(
        (schedule) => schedule && parseApplicationEventScheduleTime(schedule)
      )
      .join(", ");
  }, [applicationEvent?.applicationEventSchedules]);

  const secondaryTimes = useMemo(() => {
    const schedules = applicationEvent?.applicationEventSchedules?.filter(
      (applicationEventSchedule) => applicationEventSchedule?.priority === 200
    );

    return schedules
      ?.map(
        (schedule) => schedule && parseApplicationEventScheduleTime(schedule)
      )
      .join(", ");
  }, [applicationEvent?.applicationEventSchedules]);

  return (
    <Wrapper>
      <ApplicationEventName>{applicationEvent.name}</ApplicationEventName>
      <Applicant>{applicantName}</Applicant>
      <DetailRow>
        <span>Vuorotoive / viikko:</span>
        <span>
          {parsedDuration}, {applicationEvent.eventsPerWeek}x
        </span>
      </DetailRow>
      <DetailRow>
        <span>Ensisijaiset ajat:</span>
        <span>{primaryTimes || "-"}</span>
      </DetailRow>
      <DetailRow>
        <span>Muut ajat:</span>
        <span>{secondaryTimes || "-"}</span>
      </DetailRow>
      <Actions>
        <SmallRoundButton variant="primary">
          Jaa {selectionDuration} vuoro
        </SmallRoundButton>
      </Actions>
    </Wrapper>
  );
};

export default ApplicationEventScheduleCard;
