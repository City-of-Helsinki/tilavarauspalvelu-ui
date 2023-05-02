import React, { useRef } from "react";
import styled from "styled-components";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { Card, Table } from "hds-react";
import { isEqual, trim } from "lodash";
import omit from "lodash/omit";
import { TFunction } from "i18next";
import { H2, H4, H5, Strong } from "common/src/common/typography";
import { breakpoints } from "common/src/common/style";
import {
  Query,
  ApplicationEventType,
  ReservationUnitType,
  ApplicationEventScheduleType,
  QuerySpaceByPkArgs,
} from "common/types/gql-types";
import { useQuery } from "@apollo/client";
import Accordion from "../Accordion";
import Loader from "../Loader";
import { IngressContainer } from "../../styles/layout";
import withMainMenu from "../withMainMenu";
import {
  formatNumber,
  formatDate,
  parseAgeGroups,
  parseDurationString,
  formatDurationShort,
} from "../../common/util";
import ValueBox from "./ValueBox";
import { publicUrl, weekdays } from "../../common/const";
import {
  applicantName,
  convertGQLStatusToRest,
  convertRoundGQLStatusToRest,
} from "./util";
import ApplicationStatusBlock from "./ApplicationStatusBlock";
import TimeSelector from "./time-selector/TimeSelector";
import ScrollIntoView from "../../common/ScrollIntoView";
import BreadcrumbWrapper from "../BreadcrumbWrapper";
import ShowWhenTargetInvisible from "../ShowWhenTargetInvisible";
import StickyHeader from "../StickyHeader";
import ApplicationUserBirthDate from "./ApplicationUserBirthDate";
import { GET_APPLICATION_BY_PK } from "./queries";
import { useNotification } from "../../context/NotificationContext";

interface IRouteParams {
  [key: string]: string;
  applicationId: string;
}

const StyledApplicationStatusBlock = styled(ApplicationStatusBlock)`
  margin: 0;
  margin-top: var(--spacing-l);
`;

const Wrapper = styled.div`
  margin: 0 0 var(--spacing-layout-m) 0;
  width: 100%;
  padding-bottom: var(--spacing-5-xl);
`;

const CardContentContainer = styled.div`
  display: grid;
  gap: var(--spacing-m);
  grid-template-columns: 1fr 1fr;
`;

const EventProps = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-l);
`;

const DefinitionList = styled.div`
  line-height: var(--lineheight-l);
  display: flex;
  gap: var(--spacing-s);
  flex-direction: column;
`;

const Label = styled.span``;

const Value = styled.span`
  font-family: var(--tilavaraus-admin-font-bold);
  font-weight: 700;
`;

const StyledAccordion = styled(Accordion).attrs({
  style: {
    "--header-font-size": "var(--fontsize-heading-m)",
    "--button-size": "var(--fontsize-heading-l)",
  } as React.CSSProperties,
})`
  margin-top: 48px;
  h4 {
    margin-top: 4rem;
  }
`;

const PreCard = styled.div`
  font-size: var(--fontsize-body-s);
  margin-bottom: var(--spacing-m);
`;

const StyledTable = styled(Table)`
  width: 100%;
  border-spacing: 0;
  thead {
    display: none;
  }
  td:nth-child(1) {
    padding-left: var(--spacing-xs);
  }
`;

const EventSchedules = styled.div`
  gap: var(--spacing-l);
  display: flex;
  flex-direction: column;
  width: 100%;

  @media (min-width: ${breakpoints.xl}) {
    display: grid;
    grid-template-columns: 1fr 16em;
  }
`;

const SchedulesCardContainer = styled.div`
  gap: var(--spacing-m);
  display: grid;
  grid-template-columns: 1fr 1fr;
  width: 100%;

  @media (min-width: ${breakpoints.xl}) {
    display: flex;
    flex-direction: column;
  }
  h5:nth-of-type(1) {
    margin-top: 0;
  }
`;

const EventSchedule = styled.div`
  font-size: var(--fontsize-body-m);
  line-height: 2em;
`;

const StyledH5 = styled(H5)`
  font-size: var(--fontsize-heading-xs);
  font-family: (--font-bold);
  margin-bottom: var(--spacing-2-xs);
`;

const KV = ({
  k,
  v,
  dataId,
}: {
  k: string;
  v?: string;
  dataId?: string;
}): JSX.Element => (
  <div key={k}>
    <Label id={k}>{k}</Label>:{" "}
    <Value aria-labelledby={k} data-testid={dataId}>
      {v || "-"}
    </Value>
  </div>
);

const formatDuration = (
  duration: string | null,
  t: TFunction,
  type?: "min" | "max"
): string => {
  if (!duration) {
    return "";
  }
  const dur = parseDurationString(duration);
  const translationKey = `common.${type}Amount`;
  if (!dur) {
    return "";
  }
  return `${type ? t(translationKey) : ""} ${formatDurationShort(dur)}`;
};

const appEventDuration = (
  min: number | null,
  max: number | null,
  t: TFunction
): string => {
  let duration = "";
  // TODO invalid number / null handling
  if (isEqual(min, max)) {
    duration += formatDuration(String(min), t);
  } else {
    duration += formatDuration(String(min), t, "min");
    duration += `, ${formatDuration(String(max), t, "max")}`;
  }
  return trim(duration, ", ");
};

// Return a single application
const useApplicationQuery = (pk?: string) => {
  const { notifyError } = useNotification();
  const { t } = useTranslation();
  // All ByPkArgs types are equal so use Spaces randomly here
  const { data, loading } = useQuery<Query, QuerySpaceByPkArgs>(
    GET_APPLICATION_BY_PK,
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

  /// FIXME transfer this portion to GQL or local hook
  /*
  application.applicationEvents.forEach((ae) => {
    set(
      ae,
      "eventReservationUnits",
      orderBy(ae.eventReservationUnits, "priority", "asc")
    );
    set(
      ae,
      "applicationEventSchedules",
      orderBy(ae.applicationEventSchedules, "begin", "asc")
    );
  });
  */

  const application =
    data?.applications?.edges.find(() => true)?.node ?? undefined;

  return { application, loading };
};

export const parseApplicationEventSchedules = (
  applicationEventSchedules: ApplicationEventScheduleType[],
  index: number,
  priority: number
): string => {
  const schedules = applicationEventSchedules
    .filter((s) => s.day === index)
    .filter((s) => s.priority === priority);

  return schedules
    .map((s) => `${s.begin.substring(0, 2)}-${s.end.substring(0, 2)}`)
    .join(", ");
};

function ApplicationDetails(): JSX.Element | null {
  const { applicationId } = useParams<IRouteParams>();
  const { t } = useTranslation();

  const ref = useRef<HTMLHeadingElement>(null);

  const { application, loading } = useApplicationQuery(applicationId);

  if (loading) {
    return <Loader />;
  }

  if (!application) {
    return null;
  }

  const isOrganisation = Boolean(application?.organisation);

  const hasBillingAddress =
    application?.billingAddress &&
    !isEqual(
      omit(application?.billingAddress, "id"),
      omit(application?.organisation?.address, "id")
    );

  const customerName = applicantName(application);
  const homeCity = application.homeCity ?? undefined;
  const { applicationRound } = application;

  return (
    <Wrapper>
      {application && applicationRound && (
        <>
          <BreadcrumbWrapper
            route={[
              "recurring-reservations",
              `${publicUrl}/recurring-reservations/application-rounds`,
              `${publicUrl}/recurring-reservations/application-rounds/${applicationRound.pk}`,
              `application`,
            ]}
            aliases={[
              {
                slug: "application-round",
                title: applicationRound.nameFi ?? undefined,
              },
              {
                slug: `${applicationRound.pk}`,
                title: applicationRound.nameFi ?? undefined,
              },
              { slug: "application", title: customerName },
            ]}
          />
          <ShowWhenTargetInvisible target={ref}>
            <StickyHeader
              name={customerName}
              tagline={`${t("Application.id")}: ${applicationId}`}
            />
          </ShowWhenTargetInvisible>

          <IngressContainer>
            {application.status ? (
              <StyledApplicationStatusBlock
                status={convertGQLStatusToRest(application.status)}
                view={
                  applicationRound.status
                    ? convertRoundGQLStatusToRest(applicationRound.status)
                    : undefined
                }
              />
            ) : (
              <div>ERROR: Application should have status</div>
            )}
            <H2
              ref={ref}
              style={{ margin: "1rem 0" }}
              data-testid="application-details__heading--main"
            >
              {customerName}
            </H2>
            <PreCard>
              {t("Application.applicationReceivedTime")}{" "}
              {formatDate(application.lastModifiedDate, "d.M.yyyy HH:mm")}
            </PreCard>
            <Card
              theme={{
                "--background-color": "var(--color-black-5)",
                "--padding-horizontal": "var(--spacing-m)",
                "--padding-vertical": "var(--spacing-m)",
              }}
            >
              <CardContentContainer>
                <DefinitionList>
                  <KV
                    k={t("Application.applicantType")}
                    v={t(
                      `Application.applicantTypes.${application.applicantType?.toLocaleLowerCase()}`
                    )}
                    dataId="application-details__data--applicant-type"
                  />
                  <KV k={t("common.homeCity")} v={homeCity?.name} />
                  <KV
                    k={t("Application.coreActivity")}
                    v={application.organisation?.coreBusiness || "-"}
                  />
                </DefinitionList>
                <DefinitionList>
                  <KV
                    k={t("Application.numHours")}
                    v={`${t("common.hoursUnitLong", {
                      count:
                        (application.aggregatedData?.appliedMinDurationTotal ??
                          0) / 3600,
                    })}`}
                  />
                  <KV
                    k={t("Application.numTurns")}
                    v={`${
                      application.aggregatedData?.appliedReservationsTotal
                    } ${t("common.volumeUnit")}`}
                  />
                  <KV k={t("Application.basket")} v="" />
                </DefinitionList>
              </CardContentContainer>
            </Card>
          </IngressContainer>
          <IngressContainer>
            {application?.applicationEvents
              ?.filter((x): x is ApplicationEventType => x != null)
              .map((applicationEvent) => {
                const duration = appEventDuration(
                  applicationEvent.minDuration ?? null,
                  applicationEvent.maxDuration ?? null,
                  t
                );

                const ageGroup = {
                  minimum: applicationEvent?.ageGroup?.minimum,
                  maximum: applicationEvent?.ageGroup?.maximum ?? undefined,
                };

                // TODO don't default input fields to undefined (causes errors)
                const pk = applicationEvent.pk ?? 0;
                return (
                  <ScrollIntoView key={pk} hash={pk.toString()}>
                    <StyledAccordion
                      heading={applicationEvent.name}
                      defaultOpen
                    >
                      <EventProps>
                        <ValueBox
                          label={t("ApplicationEvent.ageGroup")}
                          value={
                            ageGroup ? parseAgeGroups(ageGroup) : undefined
                          }
                        />
                        <ValueBox
                          label={t("ApplicationEvent.groupSize")}
                          value={`${formatNumber(
                            applicationEvent.numPersons,
                            t("common.membersSuffix")
                          )}`}
                        />
                        <ValueBox
                          label={t("ApplicationEvent.purpose")}
                          value={applicationEvent.purpose?.nameFi}
                        />
                        <ValueBox
                          label={t("ApplicationEvent.eventDuration")}
                          value={duration}
                        />
                        <ValueBox
                          label={t("ApplicationEvent.eventsPerWeek")}
                          value={`${applicationEvent.eventsPerWeek}`}
                        />
                        <ValueBox
                          label={t("ApplicationEvent.dates")}
                          value={`${formatDate(
                            applicationEvent.begin ?? null
                          )} - ${formatDate(applicationEvent.end ?? null)}`}
                        />
                      </EventProps>
                      <H4>{t("ApplicationEvent.requestedReservationUnits")}</H4>
                      <StyledTable
                        rows={
                          applicationEvent?.eventReservationUnits
                            ?.map((x) => x?.reservationUnit)
                            ?.filter((x): x is ReservationUnitType => x != null)
                            ?.map((reservationUnit, index) => ({
                              index: index + 1,
                              id: reservationUnit.pk,
                              unit: reservationUnit.unit?.nameFi,
                              name: reservationUnit.nameFi,
                            })) ?? []
                        }
                        cols={[
                          { headerName: "a", key: "index" },
                          { headerName: "b", key: "unit" },
                          { headerName: "c", key: "name" },
                        ]}
                        indexKey="id"
                      />
                      <H4>{t("ApplicationEvent.requestedTimes")}</H4>
                      <EventSchedules>
                        <TimeSelector applicationEvent={applicationEvent} />
                        <Card
                          border
                          theme={{
                            "--background-color": "var(--color-black-5)",
                            "--padding-horizontal": "var(--spacing-m)",
                            "--padding-vertical": "var(--spacing-m)",
                          }}
                        >
                          <SchedulesCardContainer>
                            <div>
                              <StyledH5>
                                {t("ApplicationEvent.primarySchedules")}
                              </StyledH5>
                              {weekdays.map((day, index) => {
                                const schedulesTxt =
                                  parseApplicationEventSchedules(
                                    applicationEvent?.applicationEventSchedules?.filter(
                                      (x): x is ApplicationEventScheduleType =>
                                        x != null
                                    ) ?? [],
                                    index,
                                    300
                                  );

                                return (
                                  <EventSchedule key={day}>
                                    <Strong>{t(`calendar.${day}`)}</Strong>
                                    {schedulesTxt ? `: ${schedulesTxt}` : ""}
                                  </EventSchedule>
                                );
                              })}
                            </div>
                            <div>
                              <StyledH5>
                                {t("ApplicationEvent.secondarySchedules")}
                              </StyledH5>
                              {weekdays.map((day, index) => {
                                const schedulesTxt =
                                  parseApplicationEventSchedules(
                                    applicationEvent?.applicationEventSchedules?.filter(
                                      (x): x is ApplicationEventScheduleType =>
                                        x != null
                                    ) ?? [],
                                    index,
                                    200
                                  );

                                return (
                                  <EventSchedule key={day}>
                                    <Strong>{t(`calendar.${day}`)}</Strong>
                                    {schedulesTxt ? `: ${schedulesTxt}` : ""}
                                  </EventSchedule>
                                );
                              })}
                            </div>
                          </SchedulesCardContainer>
                        </Card>
                      </EventSchedules>
                    </StyledAccordion>
                  </ScrollIntoView>
                );
              })}
            <H4>{t("Application.customerBasicInfo")}</H4>
            <EventProps>
              <ValueBox
                label={t("Application.authenticatedUser")}
                value={application.applicantEmail}
              />
              <ValueBox
                label={t("Application.applicantType")}
                value={t(
                  `Application.applicantTypes.${application?.applicantType?.toLocaleLowerCase()}`
                )}
              />
              <ValueBox
                label={t("Application.organisationName")}
                value={application.organisation?.name}
              />
              <ValueBox
                label={t("Application.coreActivity")}
                value={application.organisation?.coreBusiness}
              />
              <ValueBox label={t("common.homeCity")} value={homeCity?.name} />
              <ValueBox
                label={t("Application.identificationNumber")}
                value={application.organisation?.identifier}
              />
              <ValueBox
                label={t("Application.headings.additionalInformation")}
                value={application.additionalInformation}
              />
              <ValueBox
                label={t("Application.headings.userBirthDate")}
                value={
                  <ApplicationUserBirthDate
                    applicationPk={applicationId}
                    showLabel={t("RequestedReservation.showBirthDate")}
                    hideLabel={t("RequestedReservation.hideBirthDate")}
                  />
                }
              />
            </EventProps>
            <H4>{t("Application.contactPersonInformation")}</H4>
            <EventProps>
              <ValueBox
                label={t("Application.contactPersonFirstName")}
                value={application.contactPerson?.firstName}
              />
              <ValueBox
                label={t("Application.contactPersonLastName")}
                value={application.contactPerson?.lastName}
              />
              <ValueBox
                label={t("Application.contactPersonEmail")}
                value={application.contactPerson?.email}
              />
              <ValueBox
                label={t("Application.contactPersonPhoneNumber")}
                value={application.contactPerson?.phoneNumber}
              />
            </EventProps>
            {isOrganisation ? (
              <>
                <H4>{t("Application.contactInformation")}</H4>
                <EventProps>
                  <ValueBox
                    label={t("common.streetAddress")}
                    value={application.organisation?.address?.streetAddress}
                  />
                  <ValueBox
                    label={t("common.postalNumber")}
                    value={application.organisation?.address?.postCode}
                  />
                  <ValueBox
                    label={t("common.postalDistrict")}
                    value={application.organisation?.address?.city}
                  />
                </EventProps>
              </>
            ) : null}
            {hasBillingAddress ? (
              <>
                <H4>{t("common.billingAddress")}</H4>
                <EventProps>
                  <ValueBox
                    label={t("common.streetAddress")}
                    value={application.billingAddress?.streetAddress}
                  />
                  <ValueBox
                    label={t("common.postalNumber")}
                    value={application.billingAddress?.postCode}
                  />
                  <ValueBox
                    label={t("common.postalDistrict")}
                    value={application.billingAddress?.city}
                  />
                </EventProps>
              </>
            ) : null}
          </IngressContainer>
        </>
      )}
    </Wrapper>
  );
}

export default withMainMenu(ApplicationDetails);
