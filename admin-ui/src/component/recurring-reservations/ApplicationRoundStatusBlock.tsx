import React from "react";
import isPast from "date-fns/isPast";
import { useTranslation } from "react-i18next";
import { ApplicationRoundStatus } from "common/types/gql-types";
import { ApplicationRound } from "../../common/types";
import { getNormalizedApplicationRoundStatus } from "../../common/util";
import { getApplicationRoundStatusColor } from "../../styles/util";
import StatusBlock from "../StatusBlock";

interface IProps {
  applicationRound: ApplicationRound;
  className?: string;
}

function ApplicationRoundStatusBlock({
  applicationRound,
  className,
}: IProps): JSX.Element {
  const { t } = useTranslation();

  let { status } = applicationRound;
  if (
    status === "draft" &&
    isPast(new Date(applicationRound.applicationPeriodEnd))
  ) {
    status = ApplicationRoundStatus.InReview;
  }

  const normalizedStatus = getNormalizedApplicationRoundStatus({
    ...applicationRound,
    status,
  });

  return (
    <StatusBlock
      statusStr={t(`ApplicationRound.statuses.${normalizedStatus}`)}
      color={getApplicationRoundStatusColor(normalizedStatus)}
      className={className}
    />
  );
}

export default ApplicationRoundStatusBlock;
