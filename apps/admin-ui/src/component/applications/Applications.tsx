import React from "react";
import { useQuery } from "@apollo/client";
import { uniqBy } from "lodash";
import {
  type Query,
  type QueryApplicationsArgs,
  ApplicationStatusChoice,
  type ApplicationNode,
  type UnitType,
  ApplicationsApplicationApplicantTypeChoices,
  type ApplicationRoundNode,
  ApplicationRoundStatusChoice,
} from "common/types/gql-types";
import { useTranslation } from "react-i18next";
import { TFunction } from "i18next";
import { useParams } from "react-router-dom";
import styled from "styled-components";
import uniq from "lodash/uniq";
import { H1, H3 } from "common/src/common/typography";
import { useNotification } from "@/context/NotificationContext";
import { applicationUrl } from "@/common/urls";
import { ContentContainer, IngressContainer } from "@/styles/layout";
import { DataFilterConfig } from "@/common/types";
import LinkPrev from "../LinkPrev";
import {
  APPLICATIONS_BY_APPLICATION_ROUND_QUERY,
  APPLICATION_ROUD_QUERY,
} from "../recurring-reservations/queries";
import Loader from "../Loader";
import DataTable, { CellConfig } from "../DataTable";
import StatusCell from "../StatusCell";

const Wrapper = styled.div`
  width: 100%;
  margin-bottom: var(--spacing-layout-xl);
`;

const Title = styled(H1).attrs({ $legacy: true })`
  margin: var(--spacing-layout-xl) 0 var(--spacing-2-xs);
`;

const ApplicationRoundTitle = styled.div`
  margin-bottom: var(--spacing-layout-xl);
`;

const ApplicationCount = styled(H3)`
  font-size: var(--fontsize-heading-s);
  text-transform: lowercase;
`;

type ApplicationView = {
  pk: number;
  applicantName: string;
  type: string;
  units: UnitType[];
  unitsSort: string;
  applicationCount: string;
  applicationCountSort: number;
  status?: ApplicationStatusChoice;
};

const getFilterConfig = (
  applications: ApplicationView[]
): DataFilterConfig[] => {
  const applicantTypes = uniq(applications.map((app) => app.type));
  const statuses = uniq(applications.map((app) => app.status));
  const units = uniqBy(
    applications.flatMap((app) => app.units),
    "pk"
  );

  return [
    {
      title: "Application.headings.applicantType",
      filters: applicantTypes
        .filter((n) => n)
        .map((value) => ({
          title: value,
          key: "type",
          value: value || "",
        })),
    },
    {
      title: "Application.headings.applicationStatus",
      filters: statuses.map((status) => ({
        title: `Application.statuses.${status}`,
        key: "status",
        value: status,
      })),
    },
    {
      title: "Application.headings.unit",
      filters: units.map((unit) => ({
        key: "unit",
        title: unit.nameFi || "",
        function: (app: ApplicationView) =>
          app.units.find((u) => u.pk === unit.pk) != null,
      })),
    },
  ];
};

const appMapper = (app: ApplicationNode, t: TFunction): ApplicationView => {
  const units = uniqBy(
    app?.applicationEvents
      ?.flatMap((ae) => ae?.eventReservationUnits)
      ?.flatMap((eru) => eru?.reservationUnit?.unit),
    "pk"
  ).filter((u): u is UnitType => u != null);

  const status = app.status ?? undefined;

  const applicantName =
    app.applicantType === ApplicationsApplicationApplicantTypeChoices.Individual
      ? app.applicant?.name || ""
      : app.organisation?.name || "";

  return {
    pk: app.pk ?? 0,
    applicantName,
    type: app.applicantType
      ? t(`Application.applicantTypes.${app.applicantType}`)
      : "",
    unitsSort: units.find(() => true)?.nameFi || "",
    units,
    status,
    applicationCount: "NA",
    applicationCountSort: 0,
  };
};

const getCellConfig = (applicationRound: ApplicationRoundNode): CellConfig => {
  let statusTitle: string;
  switch (applicationRound.status) {
    case ApplicationRoundStatusChoice.Handled:
      statusTitle = "Application.headings.resolutionStatus";
      break;
    default:
      statusTitle = "Application.headings.reviewStatus";
  }

  return {
    cols: [
      {
        title: "Application.headings.customer",
        key: "applicant",
      },
      {
        title: "Application.headings.applicantType",
        key: "type",
      },
      {
        title: "Application.headings.unit",
        key: "unitsSort",
        transform: ({ units }: ApplicationView) =>
          units.map((u) => u.nameFi).join(", "),
      },
      {
        title: "Application.headings.applicationCount",
        key: "applicationCountSort",
        transform: ({ applicationCount }: ApplicationView) => applicationCount,
      },
      {
        title: statusTitle,
        key: "status",
        transform: ({ status }: ApplicationView) => {
          return (
            <StatusCell
              status={status}
              text={`Application.statuses.${status}`}
              type="application"
            />
          );
        },
      },
    ],
    index: "id",
    sorting: "organisation.name",
    order: "asc",
    rowLink: ({ pk }) => applicationUrl(pk),
  };
};

function Applications({
  applicationRoundId,
}: {
  applicationRoundId: number;
}): JSX.Element {
  const { notifyError } = useNotification();

  const { t } = useTranslation();

  const { data: applicationRoundData, loading: isLoadingRound } =
    useQuery<Query>(APPLICATION_ROUD_QUERY, {
      variables: {
        pk: [applicationRoundId],
      },
      onError: () => {
        notifyError(t("errors.errorFetchingData"));
      },
    });
  const applicationRound =
    applicationRoundData?.applicationRounds?.edges?.[0]?.node;

  const { loading: isApplicationsLoading, data } = useQuery<
    Query,
    QueryApplicationsArgs
  >(APPLICATIONS_BY_APPLICATION_ROUND_QUERY, {
    skip: !applicationRound?.pk,
    variables: {
      applicationRound: applicationRound?.pk ?? 0,
      status: [
        ApplicationStatusChoice.InAllocation,
        ApplicationStatusChoice.Handled,
        ApplicationStatusChoice.ResultsSent,
        ApplicationStatusChoice.Received,
      ],
    },
    onError: () => {
      notifyError(t("errors.errorFetchingApplications"));
    },
  });

  const applications =
    data?.applications?.edges
      ?.map((edge) => edge?.node)
      .filter((app): app is ApplicationNode => app != null)
      .map((app) => appMapper(app, t)) ?? [];
  const filterConfig = getFilterConfig(applications);

  const isLoading = isLoadingRound || isApplicationsLoading;
  if (isLoading || !applicationRound) {
    return <Loader />;
  }

  const cellConfig = getCellConfig(applicationRound);

  return (
    <Wrapper>
      <ContentContainer>
        <LinkPrev />
      </ContentContainer>
      <IngressContainer>
        <Title>{t("Application.allApplications")}</Title>
        <ApplicationRoundTitle>
          {applicationRound?.nameFi}
        </ApplicationRoundTitle>
        <ApplicationCount data-testid="application-count">
          {applications.length} {t("common.volumeUnit")}
        </ApplicationCount>
      </IngressContainer>
      <DataTable
        groups={[{ id: 1, data: applications }]}
        hasGrouping={false}
        config={{
          filtering: true,
          rowFilters: true,
          selection: false,
        }}
        cellConfig={cellConfig}
        filterConfig={filterConfig}
      />
    </Wrapper>
  );
}

interface IRouteParams {
  [key: string]: string;
  applicationRoundId: string;
}

function ApplicationsRouted(): JSX.Element {
  const { applicationRoundId } = useParams<IRouteParams>();
  const { t } = useTranslation();

  if (!applicationRoundId || Number.isNaN(Number(applicationRoundId))) {
    return <div>{t("errors.router.invalidApplicationRoundNumber")}</div>;
  }
  return <Applications applicationRoundId={Number(applicationRoundId)} />;
}

export default ApplicationsRouted;
