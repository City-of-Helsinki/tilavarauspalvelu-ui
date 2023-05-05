import React from "react";
import { useTranslation } from "react-i18next";
import { isPast } from "date-fns";
import {
  ApplicationRoundStatus,
  ApplicationStatus,
} from "common/types/gql-types";
import { ApplicationRound } from "../../common/types";
import { getApplicationRoundStatusColor } from "../../styles/util";
import StatusBlock from "../StatusBlock";
import { getNormalizedApplicationRoundStatus } from "../../common/util";

interface IProps {
  applicationRound: ApplicationRound;
  applicationStatus: ApplicationStatus;
  className?: string;
}

function ApplicantApplicationsStatusBlock({
  applicationRound,
  applicationStatus,
  className,
}: IProps): JSX.Element {
  const { t } = useTranslation();

  let { status } = applicationRound;
  if (
    status === ApplicationRoundStatus.Draft &&
    isPast(new Date(applicationRound.applicationPeriodEnd))
  ) {
    status = ApplicationRoundStatus.InReview;
  }

  const normalizedStatus =
    applicationStatus === ApplicationStatus.Sent
      ? "sent"
      : getNormalizedApplicationRoundStatus(applicationRound);

  return (
    <StatusBlock
      statusStr={t(`Recommendation.applicantStatuses.${normalizedStatus}`)}
      color={getApplicationRoundStatusColor(normalizedStatus)}
      className={className}
    />
  );
}

export default ApplicantApplicationsStatusBlock;
