import React from "react";
import { useQuery } from "@apollo/client";
import { Query, QueryReservationByPkArgs } from "common/types/gql-types";
import { BirthDate } from "../BirthDate";
import { GET_BIRTHDATE_BY_APPLICATION_PK } from "./queries";
import Loader from "../Loader";

type Props = {
  applicationPk?: string;
  showLabel: string;
  hideLabel: string;
};

const ApplicationUserBirthDate = ({
  applicationPk,
  showLabel,
  hideLabel,
}: Props): JSX.Element => {
  const { loading, data } = useQuery<Query, QueryReservationByPkArgs>(
    GET_BIRTHDATE_BY_APPLICATION_PK,
    {
      skip: !applicationPk || Number.isNaN(Number(applicationPk)),
      fetchPolicy: "no-cache",
      variables: {
        pk: Number(applicationPk),
      },
    }
  );

  if (loading) {
    return <Loader />;
  }

  return (
    <BirthDate
      user={data?.applications?.edges[0]?.node?.applicantUser || null}
      showLabel={showLabel}
      hideLabel={hideLabel}
      onShow={() => {}}
    />
  );
};

export default ApplicationUserBirthDate;
