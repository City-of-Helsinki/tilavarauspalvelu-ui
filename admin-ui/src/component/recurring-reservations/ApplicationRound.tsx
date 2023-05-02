import React from "react";
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

const useApplicationRoundByPkQuery = (pk?: string) => {
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

  const {
    applicationRound: applicationRoundGQL,
    loading,
    refetch,
  } = useApplicationRoundByPkQuery(applicationRoundId);

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
  switch (applicationRoundGQL?.status) {
    case ApplicationRoundStatus.ReviewDone:
    case ApplicationRoundStatus.Archived:
      return (
        <Allocation
          applicationRound={applicationRoundGQL}
          setApplicationRoundStatus={(status: ApplicationRoundStatusRest) =>
            setApplicationRoundStatus(Number(applicationRoundId), status)
          }
        />
      );
    case ApplicationRoundStatus.Allocated:
      return (
        <Handling
          applicationRound={applicationRoundGQL}
          // setApplicationRound={setApplicationRound}
          setApplicationRoundStatus={(status: ApplicationRoundStatusRest) =>
            setApplicationRoundStatus(Number(applicationRoundId), status)
          }
        />
      );
    case ApplicationRoundStatus.Handled:
    case ApplicationRoundStatus.Sent:
      return (
        <PreApproval
          applicationRound={applicationRoundGQL}
          setApplicationRoundStatus={(status: ApplicationRoundStatusRest) =>
            setApplicationRoundStatus(Number(applicationRoundId), status)
          }
        />
      );
    case ApplicationRoundStatus.Reserving:
    case ApplicationRoundStatus.Sending:
    case ApplicationRoundStatus.Draft:
    case ApplicationRoundStatus.InReview: {
      if (applicationRoundGQL) {
        return <Review applicationRound={applicationRoundGQL} />;
      }
      return <div>ERROR: should never happen GQL migration problem.</div>;
    }

    default:
      return <> </>;
  }
}

export default ApplicationRound;
