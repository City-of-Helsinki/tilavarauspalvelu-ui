import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useQuery } from "@apollo/client";
import {
  ApplicationRoundStatus,
  Query,
  QuerySpaceByPkArgs,
} from "common/types/gql-types";
import Review from "./review/Review";
import Allocation from "./Allocation";
import Handling from "./Handling";
import PreApproval from "./PreApproval";
import { ApplicationRoundStatus as ApplicationRoundStatusRest } from "../../common/types";
import { patchApplicationRoundStatus } from "../../common/api";
import Loader from "../Loader";
import { useNotification } from "../../context/NotificationContext";
import { APPLICATION_ROUND_BY_PK_QUERY } from "./queries";

const useApplicationRoundByPkQuery = (pk?: string, pollInterval?: number) => {
  const { notifyError } = useNotification();
  const { t } = useTranslation();

  // All ByPkArgs types are equal so use Spaces randomly here
  const { data, loading, refetch } = useQuery<Query, QuerySpaceByPkArgs>(
    APPLICATION_ROUND_BY_PK_QUERY,
    {
      skip: !pk || Number.isNaN(Number(pk)),
      variables: {
        pk: Number(pk),
      },
      onError: () => {
        notifyError(t("errors.errorFetchingApplication"));
      },
      pollInterval,
    }
  );

  const applicationRound =
    data?.applicationRounds?.edges?.find(() => true)?.node ?? undefined;

  return { applicationRound, loading, refetch };
};

type IProps = {
  applicationRoundId: string;
};

function ApplicationRound(): JSX.Element | null {
  const { notifyError } = useNotification();
  const { applicationRoundId } = useParams<IProps>();
  const { t } = useTranslation();
  const [pollingInterval, setPollingInterval] = useState(0);

  const { applicationRound, loading, refetch } = useApplicationRoundByPkQuery(
    applicationRoundId,
    pollingInterval
  );

  // TODO replace with GQL mutation and move down stream where it's used (use a hook if needed)
  const setApplicationRoundStatus = async (
    id: number,
    status: ApplicationRoundStatusRest
  ) => {
    try {
      await patchApplicationRoundStatus(id, status);
      refetch();
    } catch (error) {
      notifyError(t("errors.errorSavingData"));
    }
  };

  if (loading) {
    return <Loader />;
  }

  // FIXME confirm the enums (what matches what in the old rest API)
  switch (applicationRound?.status) {
    case ApplicationRoundStatus.ReviewDone:
    case ApplicationRoundStatus.Archived:
      return (
        <Allocation
          applicationRound={applicationRound}
          setApplicationRoundStatus={(status: ApplicationRoundStatusRest) =>
            setApplicationRoundStatus(Number(applicationRoundId), status)
          }
        />
      );
    case ApplicationRoundStatus.Allocated:
      return (
        <Handling
          applicationRound={applicationRound}
          setApplicationRoundStatus={(status: ApplicationRoundStatusRest) =>
            setApplicationRoundStatus(Number(applicationRoundId), status)
          }
          enablePolling={() => setPollingInterval(2000)}
        />
      );
    case ApplicationRoundStatus.Handled:
    case ApplicationRoundStatus.Sent:
      return (
        <PreApproval
          applicationRound={applicationRound}
          setApplicationRoundStatus={(status: ApplicationRoundStatusRest) =>
            setApplicationRoundStatus(Number(applicationRoundId), status)
          }
        />
      );
    case ApplicationRoundStatus.Reserving:
    case ApplicationRoundStatus.Sending:
    case ApplicationRoundStatus.Draft:
    case ApplicationRoundStatus.InReview: {
      return <Review applicationRound={applicationRound} />;
    }

    default:
      return <> </>;
  }
}

export default ApplicationRound;
