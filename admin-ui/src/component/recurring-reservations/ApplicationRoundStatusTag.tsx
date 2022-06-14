import { Tag } from "hds-react";
import React from "react";
import { useTranslation } from "react-i18next";
import {
  ApplicationRoundStatus,
  ApplicationRoundType,
} from "../../common/gql-types";

interface IProps {
  applicationRound: ApplicationRoundType;
}

const getApplicationStatus = (applicationRound: ApplicationRoundType) => {
  const cutOffDate = Date();
  switch (applicationRound.status) {
    // ui has 5 groups
    case ApplicationRoundStatus.InReview:
      return "g1";
    case ApplicationRoundStatus.ReviewDone:
      return " ";
    case ApplicationRoundStatus.Handled:
      return "g2";
    case ApplicationRoundStatus.Draft:
      return cutOffDate < applicationRound.applicationPeriodBegin ? "g4" : "g3";
    default:
      return "g5";
  }
};

function ApplicationRoundStatusTag({ applicationRound }: IProps): JSX.Element {
  const { t } = useTranslation();
  return (
    <Tag>
      {t(`applicationRound.status${getApplicationStatus(applicationRound)}`)}
    </Tag>
  );
}

export default ApplicationRoundStatusTag;
