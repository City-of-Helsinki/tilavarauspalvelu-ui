import { Tag } from "hds-react";
import React from "react";
import { useTranslation } from "react-i18next";
import {
  ApplicationRoundStatus,
  ApplicationRoundType,
} from "common/types/gql-types";

interface IProps {
  applicationRound: ApplicationRoundType;
}

type RoundStatus = {
  color: string;
  label: string;
  group: string;
};

export const getApplicationRoundStatus = ({
  periodBegin,
  periodEnd,
  status,
}: {
  periodBegin: string;
  periodEnd: string;
  status?: ApplicationRoundStatus;
}): RoundStatus => {
  const cutOffDate = new Date();
  switch (status) {
    case ApplicationRoundStatus.InReview:
      return {
        group: "g1",
        color: "var(--color-gold-medium-light)",
        label: "review",
      };
    case ApplicationRoundStatus.ReviewDone:
    case ApplicationRoundStatus.Allocated:
      return {
        group: "g1",
        color: "var(--color-info-light)",
        label: "handling",
      };
    case ApplicationRoundStatus.Handled:
      return { group: "g2", color: "var(--color-bus-light)", label: "handled" };
    case ApplicationRoundStatus.Draft: {
      if (cutOffDate < new Date(periodBegin)) {
        return {
          group: "g4",
          color: "var(--color-engel-light)",
          label: "upcoming",
        };
      }

      if (cutOffDate > new Date(periodEnd)) {
        return {
          group: "g1",
          color: "var(--color-info-light)",
          label: "handling",
        };
      }

      return { group: "g3", color: "var(--color-brick-light)", label: "open" };
    }
    case ApplicationRoundStatus.Sent:
      return { group: "g5", color: "var(--color-black-05)", label: "sent" };
    default:
      return {
        group: "g5",
        color: "white",
        label: status ?? "",
      };
  }
};

function ApplicationRoundStatusTag({ applicationRound }: IProps): JSX.Element {
  const { t } = useTranslation();
  const statusFlag = getApplicationRoundStatus({
    periodBegin: applicationRound.reservationPeriodBegin,
    periodEnd: applicationRound.reservationPeriodEnd,
    status: applicationRound.status ?? undefined,
  });
  return (
    <Tag
      theme={{
        "--tag-background": statusFlag.color,
      }}
    >
      {t(`ApplicationRound.statuses.${statusFlag.label}`)}
    </Tag>
  );
}

export default ApplicationRoundStatusTag;
