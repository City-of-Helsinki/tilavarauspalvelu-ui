import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { TFunction } from "i18next";
import styled from "styled-components";
import { Button, IconCheckCircle, Notification } from "hds-react";
import { H3 } from "common/src/common/typography";
import uniq from "lodash/uniq";
import uniqBy from "lodash/uniqBy";
import trim from "lodash/trim";
import { breakpoints } from "common/src/common/style";
import Loader from "../Loader";
import {
  AllocationResult,
  ApplicationRound as ApplicationRoundType,
  ApplicationRoundStatus,
  DataFilterConfig,
  GroupedAllocationResult,
} from "../../common/types";
import { IngressContainer, NarrowContainer } from "../../styles/layout";
import { InlineRowLink, BasicLink } from "../../styles/util";
import StatusRecommendation from "../applications/StatusRecommendation";
import ApplicationRoundNavi from "./ApplicationRoundNavi";
import TimeframeStatus from "./TimeframeStatus";
import { ContentHeading } from "../../styles/typography";
import KorosHeading, {
  Heading as KorosHeadingHeading,
  SubHeading,
} from "../KorosHeading";
import StatusCircle from "../StatusCircle";
import DataTable, { CellConfig } from "../DataTable";
import {
  formatNumber,
  getNormalizedApplicationEventStatus,
  parseAgeGroups,
  formatDuration,
} from "../../common/util";
import {
  prepareAllocationResults,
  modifyAllocationResults,
  processAllocationResult,
  getAllocationCapacity,
} from "../../common/AllocationResult";
import StatusCell from "../StatusCell";
import { getAllocationResults } from "../../common/api";
import SelectionActionBar from "../SelectionActionBar";
import RecommendationDataTableGroup from "./RecommendationDataTableGroup";
import {
  applicationRoundApplications,
  applicationRoundUrl,
} from "../../common/urls";
import BreadcrumbWrapper from "../BreadcrumbWrapper";
import { useNotification } from "../../context/NotificationContext";

interface IProps {
  applicationRound: ApplicationRoundType;
  setApplicationRoundStatus: (
    status: ApplicationRoundStatus
  ) => Promise<ApplicationRoundType>;
}

const Wrapper = styled.div`
  width: 100%;
  margin-bottom: var(--spacing-layout-2-xl);
`;

const StyledKorosHeading = styled(KorosHeading)`
  margin-bottom: var(--spacing-layout-l);
`;

const TopIngress = styled.div`
  & > div:last-of-type {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    margin-top: var(--spacing-l);

    ${H3} {
      font-size: var(--fontsize-heading-s);
      margin-left: var(--spacing-m);
      width: 50px;
      line-height: var(--lineheight-m);
    }
  }

  display: grid;
  padding-right: var(--spacing-m);

  ${ContentHeading} {
    width: 100%;
    padding: 0;
  }

  @media (min-width: ${breakpoints.l}) {
    grid-template-columns: 1.8fr 1fr;
    grid-gap: var(--spacing-layout-m);
  }
`;

const Recommendation = styled.div`
  margin: var(--spacing-m) 0 0 0;
`;

const RecommendationLabel = styled.label`
  font-family: var(--tilavaraus-admin-font-bold);
  font-size: 1.375rem;
  font-weight: bold;
`;

const RecommendationValue = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  margin-top: var(--spacing-3-xs);
`;

const ActionContainer = styled.div`
  button {
    margin-top: var(--spacing-s);
  }

  display: flex;
  justify-content: space-between;
  flex-direction: column-reverse;
  margin-top: var(--spacing-s);

  @media (min-width: ${breakpoints.l}) {
    flex-direction: row;
  }
`;

const StyledNotification = styled(Notification)`
  margin-top: var(--spacing-l);
  padding-left: var(--spacing-xl);

  h3 {
    display: flex;
    align-items: center;

    svg {
      margin-right: var(--spacing-2-xs);
    }
  }

  div[role="heading"] {
    display: none;
  }
`;

const getFilterConfig = (
  recommendations: AllocationResult[]
): DataFilterConfig[] => {
  const purposes = uniq(
    recommendations.map((rec: AllocationResult) => rec.applicationEvent.purpose)
  ).sort();
  const statuses = uniq(
    recommendations.map((rec: AllocationResult) => rec.applicationEvent.status)
  );
  const reservationUnits = uniq(
    recommendations.map((rec: AllocationResult) => rec.unitName)
  ).sort();
  const baskets = uniqBy(
    recommendations,
    (rec: AllocationResult) => rec.basketName
  )
    .filter((rec: AllocationResult) => rec.basketName)
    .map((rec: AllocationResult) => ({
      title: `${rec.basketOrderNumber}. ${rec.basketName}`,
      value: rec.basketName,
    }));

  return [
    {
      title: "Recommendation.headings.reservationUnit",
      filters: reservationUnits.map((value) => ({
        title: value,
        key: "unitName",
        value: value || "",
      })),
    },
    {
      title: "Recommendation.headings.purpose",
      filters: purposes.map((value) => ({
        title: value,
        key: "applicationEvent.purpose",
        value: value || "",
      })),
    },
    {
      title: "Application.headings.applicationStatus",
      filters: statuses.map((status) => {
        const normalizedStatus = getNormalizedApplicationEventStatus(status);
        return {
          title: `Recommendation.statuses.${normalizedStatus}`,
          key: "applicationEvent.status",
          value: status,
        };
      }),
    },
    {
      title: "Recommendation.headings.basket",
      filters: baskets.map(({ title, value }) => ({
        title,
        key: "basketName",
        value: value || "",
      })),
    },
  ];
};

const getCellConfig = (
  t: TFunction,
  applicationRound: ApplicationRoundType
): CellConfig => {
  return {
    cols: [
      {
        title: "Application.headings.applicantName",
        key: "organisationName",
        transform: ({
          applicantType,
          applicantName,
          organisationId,
          organisationName,
          applicantId,
        }: AllocationResult) => {
          const index = organisationId || applicantId;
          const title =
            applicantType === "individual" ? applicantName : organisationName;
          return index ? (
            <InlineRowLink
              to={`${applicationRoundUrl(applicationRound.id)}/${
                organisationId ? "organisation" : "applicant"
              }/${index}`}
            >
              {title}
            </InlineRowLink>
          ) : (
            title || ""
          );
        },
      },
      {
        title: "ApplicationRound.basket",
        key: "basketOrderNumber",
        transform: ({ basketName, basketOrderNumber }: AllocationResult) => (
          <>{trim(`${basketOrderNumber || ""}. ${basketName || ""}`, ". ")}</>
        ),
      },
      {
        title: "Application.headings.purpose",
        key: "applicationEvent.purpose",
      },
      {
        title: "Application.headings.ageGroup",
        key: "applicationEvent.ageGroupDisplay.minimum",
        transform: ({ applicationEvent }: AllocationResult) => (
          <>{parseAgeGroups(applicationEvent.ageGroupDisplay)}</>
        ),
      },
      {
        title: "Recommendation.headings.recommendationCount",
        key: "aggregatedData.reservationsTotal",
        transform: ({ aggregatedData }: AllocationResult) => (
          <>
            {trim(
              `${formatNumber(
                aggregatedData?.reservationsTotal,
                t("common.volumeUnit")
              )} / ${formatDuration(aggregatedData?.durationTotal)}`,
              " / "
            )}
          </>
        ),
      },
      {
        title: "Recommendation.headings.status",
        key: "applicationEvent.status",
        transform: ({ applicationEvent }: AllocationResult) => {
          const normalizedStatus = getNormalizedApplicationEventStatus(
            applicationEvent.status
          );
          return (
            <StatusCell
              status={normalizedStatus}
              text={`Recommendation.statuses.${normalizedStatus}`}
              type="applicationEvent"
            />
          );
        },
      },
    ],
    index: "applicationEventScheduleId",
    sorting: "organisation.name",
    order: "asc",
    rowLink: ({ applicationEventScheduleId }: AllocationResult) => {
      return applicationEventScheduleId && applicationRound
        ? `${applicationRoundUrl(
            applicationRound.id
          )}/recommendation/${applicationEventScheduleId}`
        : "";
    },
    groupLink: ({ space }) =>
      applicationRound
        ? `${applicationRoundUrl(applicationRound.id)}/reservationUnit/${
            space?.id
          }`
        : "",
  };
};

const renderGroup = (
  group: GroupedAllocationResult,
  hasGrouping: boolean,
  cellConfig: CellConfig,
  groupIndex: number,
  groupVisibility: boolean[],
  setGroupVisibility: React.Dispatch<React.SetStateAction<boolean[]>>,
  isSelectionActive: boolean,
  groupRows: number[],
  selectedRows: number[],
  updateSelection: (
    selection: number[],
    method?: "add" | "remove" | undefined
  ) => void,
  children: React.ReactChild
): JSX.Element => (
  <RecommendationDataTableGroup
    group={group}
    hasGrouping={hasGrouping}
    key={group.id || "group"}
    cols={cellConfig.cols.length}
    index={groupIndex}
    isVisible={groupVisibility[groupIndex]}
    toggleGroupVisibility={(): void => {
      const tempGroupVisibility = [...groupVisibility];
      tempGroupVisibility[groupIndex] = !tempGroupVisibility[groupIndex];
      setGroupVisibility(tempGroupVisibility);
    }}
    isSelectionActive={isSelectionActive}
    isSelected={
      groupRows.length > 0 && groupRows.every((id) => selectedRows.includes(id))
    }
    toggleSelection={updateSelection}
    groupRows={groupRows}
    groupLink={cellConfig.groupLink}
  >
    {children}
  </RecommendationDataTableGroup>
);

function Handling({
  applicationRound,
  setApplicationRoundStatus,
}: IProps): JSX.Element {
  const isApplicationRoundApproved = ["approved"].includes(
    applicationRound.status
  );
  const { notifyError } = useNotification();
  const [isSaving, setIsSaving] = useState(false);
  const [isResolutionNotificationVisible, setIsResolutionNotificationVisible] =
    useState<boolean>(isApplicationRoundApproved);
  const [selections, setSelections] = useState<number[]>([]);

  const { t } = useTranslation();

  const {
    data: allocations,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: [
      "allocationResultsByRound",
      applicationRound?.id,
      applicationRound?.serviceSectorId ?? 0,
    ],
    queryFn: () =>
      getAllocationResults({
        applicationRoundId: applicationRound?.id,
        serviceSectorId: applicationRound?.serviceSectorId,
      }),
    enabled: applicationRound?.id != null,
    onError: () => {
      notifyError(t("errors.errorFetchingApplications"));
    },
  });

  const processedResult = processAllocationResult(allocations ?? []);
  const cellConfig = getCellConfig(t, applicationRound);
  const filterConfig = getFilterConfig(processedResult);

  const recommendations = processedResult;

  const unhandledRecommendationCount: number = recommendations
    .flatMap((recommendation) => recommendation.applicationEvent)
    .map((recommendation) => recommendation.status)
    .filter((status) =>
      ["created", "allocating", "allocated"].includes(status)
    ).length;

  if (isLoading) {
    return <Loader />;
  }

  const capacity = getAllocationCapacity(
    recommendations,
    applicationRound.aggregatedData.totalHourCapacity,
    applicationRound.aggregatedData.totalReservationDuration
  );

  if (!applicationRound) {
    return <div>{t("ApplicationRound.errors.noApplicationRound")}</div>;
  }

  return (
    <>
      <>
        {!isApplicationRoundApproved && (
          <StyledKorosHeading>
            <KorosHeadingHeading>
              {unhandledRecommendationCount}
            </KorosHeadingHeading>
            <SubHeading>
              {t("ApplicationRound.suffixUnhandledSuggestions")}
            </SubHeading>
          </StyledKorosHeading>
        )}
        <IngressContainer>
          <ApplicationRoundNavi
            applicationRoundId={applicationRound.id}
            applicationRoundStatus={applicationRound.status}
          />
          <TopIngress>
            <div>
              <ContentHeading>{applicationRound.name}</ContentHeading>
              <TimeframeStatus
                applicationPeriodBegin={applicationRound.applicationPeriodBegin}
                applicationPeriodEnd={applicationRound.applicationPeriodEnd}
                isResolved={isApplicationRoundApproved}
                resolutionDate={applicationRound.statusTimestamp}
              />
            </div>
            <div>
              {applicationRound.aggregatedData.totalHourCapacity &&
                capacity && (
                  <>
                    <StatusCircle status={capacity.percentage} />
                    <H3>{t("ApplicationRound.amountReserved")}</H3>
                  </>
                )}
            </div>
          </TopIngress>
        </IngressContainer>
        <NarrowContainer style={{ marginBottom: "var(--spacing-4-xl)" }}>
          {!isApplicationRoundApproved && (
            <>
              <Recommendation>
                <RecommendationLabel>
                  {t("Application.recommendedStage")}:
                </RecommendationLabel>
                <RecommendationValue>
                  <StatusRecommendation
                    status="allocated"
                    applicationRound={applicationRound}
                  />
                </RecommendationValue>
              </Recommendation>
              <ActionContainer>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setApplicationRoundStatus("handled");
                  }}
                  disabled={unhandledRecommendationCount > 0 || isSaving}
                >
                  {t("ApplicationRound.navigateToApprovalPreparation")}
                </Button>
              </ActionContainer>
            </>
          )}
          {isResolutionNotificationVisible && (
            <StyledNotification
              type="success"
              label=""
              dismissible
              closeButtonLabelText={`${t("common.close")}`}
              onClose={() => setIsResolutionNotificationVisible(false)}
            >
              <H3>
                <IconCheckCircle size="m" />{" "}
                {t("ApplicationRound.notificationResolutionDoneHeading")}
              </H3>
              <p>
                <BasicLink
                  to={applicationRoundApplications(applicationRound.id)}
                  style={{ textDecoration: "underline" }}
                >
                  {t("ApplicationRound.notificationResolutionDoneBody")}
                </BasicLink>
              </p>
            </StyledNotification>
          )}
        </NarrowContainer>
        {cellConfig && (
          <DataTable
            groups={prepareAllocationResults(recommendations)}
            setSelections={setSelections}
            renderGroup={renderGroup}
            hasGrouping
            config={{
              filtering: true,
              rowFilters: true,
              handledStatuses: isApplicationRoundApproved
                ? []
                : ["ignored", "validated", "handled"],
              selection: !isApplicationRoundApproved,
            }}
            filterConfig={filterConfig}
            cellConfig={cellConfig}
            areAllRowsDisabled={recommendations.every(
              (row) =>
                row.applicationEvent.status === "ignored" ||
                row.accepted ||
                row.declined
            )}
            isRowDisabled={(row: AllocationResult) => {
              return (
                ["ignored", "declined"].includes(row.applicationEvent.status) ||
                row.accepted
              );
            }}
            statusField="applicationEvent.status"
          />
        )}
      </>
      {selections?.length > 0 && (
        <SelectionActionBar
          selections={selections}
          options={[
            { label: t("Recommendation.actionMassApprove"), value: "approve" },
            { label: t("Recommendation.actionMassDecline"), value: "decline" },
            {
              label: t("Recommendation.actionMassIgnoreReservationUnit"),
              value: "ignore",
            },
          ]}
          callback={(action: string) => {
            setIsSaving(true);
            modifyAllocationResults({
              data: recommendations,
              selections,
              action,
              notifyError,
              t,
              callback: () => {
                // LOL
                setTimeout(() => setIsSaving(false), 1000);
                refetch();
              },
            });
          }}
          isSaving={isSaving}
        />
      )}
    </>
  );
}

const PageWrapper = ({
  applicationRound,
  setApplicationRoundStatus,
}: IProps) => (
  <Wrapper>
    <BreadcrumbWrapper
      route={[
        "recurring-reservations",
        "/recurring-reservations/application-rounds",
        "application-round",
      ]}
      aliases={[{ slug: "application-round", title: applicationRound.name }]}
    />
    <Handling
      applicationRound={applicationRound}
      setApplicationRoundStatus={setApplicationRoundStatus}
    />
  </Wrapper>
);

export default PageWrapper;