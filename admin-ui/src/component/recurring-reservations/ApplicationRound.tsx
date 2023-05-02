import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { AxiosError } from "axios";
import { useQuery } from "@apollo/client";
import { Query, QuerySpaceByPkArgs } from "common/types/gql-types";
import Review from "./review/Review";
import Allocation from "./Allocation";
import Handling from "./Handling";
import PreApproval from "./PreApproval";
import {
  ApplicationRoundStatus,
  ApplicationRound as ApplicationRoundType,
} from "../../common/types";
import {
  getApplicationRound,
  patchApplicationRoundStatus,
} from "../../common/api";
import Loader from "../Loader";
import { useNotification } from "../../context/NotificationContext";
import { APPLICATION_ROUND_BY_PK_QUERY } from "./queries";

const useApplicationRoundByPkQuery = (pk?: string) => {
  const { notifyError } = useNotification();
  const { t } = useTranslation();

  // All ByPkArgs types are equal so use Spaces randomly here
  const { data, loading } = useQuery<Query, QuerySpaceByPkArgs>(
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

  return { applicationRound, loading };
};

type IProps = {
  applicationRoundId: string;
};

function ApplicationRound(): JSX.Element | null {
  const [isLoading, setIsLoading] = useState(true);
  const { notifyError } = useNotification();
  const [applicationRound, setApplicationRound] =
    useState<ApplicationRoundType | null>(null);

  const { applicationRoundId } = useParams<IProps>();
  const { t } = useTranslation();

  const setApplicationRoundStatus = async (
    id: number,
    status: ApplicationRoundStatus
  ) => {
    try {
      const result = await patchApplicationRoundStatus(id, status);
      setApplicationRound(result);
    } catch (error) {
      notifyError(t("errors.errorSavingData"));
    }
  };
  const { applicationRound: applicationRoundGQL, loading } =
    useApplicationRoundByPkQuery(applicationRoundId);

  useEffect(() => {
    const fetchApplicationRound = async () => {
      setIsLoading(true);

      try {
        const result = await getApplicationRound({
          id: Number(applicationRoundId),
        });
        console.log("application round: ", result);
        setApplicationRound(result);
      } catch (error) {
        const msg =
          (error as AxiosError).response?.status === 404
            ? "errors.applicationRoundNotFound"
            : "errors.errorFetchingData";
        notifyError(t(msg));
      } finally {
        setIsLoading(false);
      }
    };

    fetchApplicationRound();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [applicationRoundId]);

  console.log("GQL round: ", applicationRoundGQL);

  if (isLoading || loading) {
    return <Loader />;
  }

  switch (applicationRound?.status) {
    case "review_done":
      return (
        <Allocation
          applicationRound={applicationRound}
          setApplicationRoundStatus={(status: ApplicationRoundStatus) =>
            setApplicationRoundStatus(Number(applicationRoundId), status)
          }
        />
      );
    case "allocated":
    case "approved":
      return (
        <Handling
          applicationRound={applicationRound}
          setApplicationRound={setApplicationRound}
          setApplicationRoundStatus={(status: ApplicationRoundStatus) =>
            setApplicationRoundStatus(Number(applicationRoundId), status)
          }
        />
      );
    case "handled":
    case "validated":
      return (
        <PreApproval
          applicationRound={applicationRound}
          setApplicationRoundStatus={(status: ApplicationRoundStatus) =>
            setApplicationRoundStatus(Number(applicationRoundId), status)
          }
        />
      );
    case "draft":
    case "in_review": {
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
