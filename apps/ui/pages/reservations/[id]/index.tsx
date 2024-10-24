import React, { useEffect, useMemo } from "react";
import type { GetServerSidePropsContext } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import styled from "styled-components";
import { capitalize } from "lodash";
import {
  IconArrowRight,
  IconCalendar,
  IconCross,
  IconLinkExternal,
} from "hds-react";
import { useTranslation } from "next-i18next";
import { H2, H4, fontRegular } from "common/src/common/typography";
import { breakpoints } from "common/src/common/style";
import { NoWrap } from "common/styles/util";
import {
  CustomerTypeChoice,
  ReservationStateChoice,
  type ReservationNode,
  type ReservationMetadataFieldNode,
  ReservationDocument,
  type ReservationQuery,
  type ReservationQueryVariables,
  CurrentUserDocument,
  type CurrentUserQuery,
  OrderStatus,
} from "@gql/gql-types";
import Link from "next/link";
import { Container } from "common";
import { useOrder } from "@/hooks/reservation";
import { reservationUnitPath } from "@/modules/const";
import { createApolloClient } from "@/modules/apolloClient";
import {
  formatDateTimeRange,
  getTranslation,
  reservationsUrl,
} from "@/modules/util";
import { CenterSpinner } from "@/components/common/common";
import Sanitize from "@/components/common/Sanitize";
import { AccordionWithState as Accordion } from "@/components/common/Accordion";
import {
  getCheckoutUrl,
  getNormalizedReservationOrderStatus,
  getReservationValue,
  getWhyReservationCantBeChanged,
  isReservationCancellable,
} from "@/modules/reservation";
import {
  getReservationUnitInstructionsKey,
  getReservationUnitName,
  isReservationUnitFreeOfCharge,
} from "@/modules/reservationUnit";
import BreadcrumbWrapper from "@/components/common/BreadcrumbWrapper";
import { ReservationStatus } from "@/components/reservation/ReservationStatus";
import { AddressSection } from "@/components/reservation-unit/Address";
import { ReservationInfoCard } from "@/components/reservation/ReservationInfoCard";
import { ReservationOrderStatus } from "@/components/reservation/ReservationOrderStatus";
import {
  getCommonServerSideProps,
  getGenericTerms,
} from "@/modules/serverUtils";
import { base64encode, filterNonNullable } from "common/src/helpers";
import { containsField, containsNameField } from "common/src/metaFieldsHelpers";
import { NotModifiableReason } from "@/components/reservation/NotModifiableReason";
import { ButtonLikeLink } from "@/components/common/ButtonLikeLink";
import { useRouter } from "next/router";
import { successToast } from "common/src/common/toast";
import { ReservationPageWrapper } from "@/components/reservations/styles";

type PropsNarrowed = Exclude<Props, { notFound: boolean }>;

// TODO this has margin issues on mobile, there is zero margin on top because some element (breadcrumbs?) is removed on mobile
const Heading = styled(H2).attrs({ as: "h1" })`
  margin-top: 0;
  margin-bottom: var(--spacing-m);
`;

const SubHeading = styled(H4).attrs({ as: "h2" })`
  margin-top: 0;
  margin-bottom: var(--spacing-m);
  line-height: 2rem;
  ${fontRegular}

  a,
  a:visited {
    color: var(--color-black);
    text-decoration: underline;
    display: block;
    margin-bottom: var(--spacing-xs);

    @media (min-width: ${breakpoints.m}) {
      &:after {
        content: "|";
        position: relative;
        right: calc(var(--spacing-xs) * -1);
      }
      display: inline-block;
      margin-right: var(--spacing-m);
      margin-bottom: 0;
    }
  }
`;

const StatusContainer = styled.div`
  display: flex;
  gap: var(--spacing-s);
`;

/* use empty liberally to remove empty elements that add spacing because of margins */
const Actions = styled.div`
  &:empty {
    display: none;
  }

  display: flex;
  flex-direction: column;
  gap: var(--spacing-m);

  @media (min-width: ${breakpoints.s}) {
    button {
      max-width: 300px;
    }
  }

  @media (min-width: ${breakpoints.m}) {
    flex-direction: row;
  }
`;

const SecondaryActions = styled.div`
  &:empty {
    display: none;
  }

  margin-top: var(--spacing-l);
  display: flex;
  gap: var(--spacing-m);
  flex-direction: column;

  @media (min-width: ${breakpoints.s}) {
    > button {
      justify-self: flex-end;
      max-width: 300px;
    }
  }

  @media (min-width: ${breakpoints.m}) {
    display: inline-flex;
    justify-items: flex-end;
  }
`;

const Content = styled.div`
  font-size: var(--fontsize-body-l);
  max-width: 65ch;
`;

const ParagraphHeading = styled(H4).attrs({ as: "h3" })``;

const Paragraph = styled.p`
  white-space: pre-line;
  margin-bottom: var(--spacing-xl);

  & > span {
    display: block;
  }
`;

const ParagraphAlt = styled(Paragraph)`
  margin-bottom: 0;
  & > span {
    display: inline;
  }
`;

const ContentContainer = styled.div`
  margin-bottom: var(--spacing-xl);
  white-space: pre-line;

  div[role="heading"] {
    font-size: var(--fontsize-heading-s);
  }
`;

const AccordionContent = styled.div`
  font-size: var(--fontsize-body-l);
  line-height: var(--lineheight-l);
  white-space: pre-wrap;
  word-break: break-word;
  margin-bottom: var(--spacing-s);
  padding-top: var(--spacing-m);
`;

const Terms = styled.div`
  margin-bottom: var(--spacing-xl);
`;

function ReserveeInfo({
  reservation,
  supportedFields,
}: {
  reservation: NodeT;
  supportedFields: Pick<ReservationMetadataFieldNode, "fieldName">[];
}) {
  const { t } = useTranslation();
  if (
    CustomerTypeChoice.Business === reservation.reserveeType ||
    CustomerTypeChoice.Nonprofit === reservation.reserveeType
  ) {
    return (
      <ContentContainer>
        {containsField(supportedFields, "reserveeOrganisationName") && (
          <ParagraphAlt>
            {t("reservations:organisationName")}:{" "}
            <span data-testid="reservation__reservee-organisation-name">
              {reservation.reserveeOrganisationName || "-"}
            </span>
          </ParagraphAlt>
        )}
        {containsField(supportedFields, "reserveeId") && (
          <ParagraphAlt>
            {t("reservations:reserveeId")}:
            <span data-testid="reservation__reservee-id">
              {reservation.reserveeId || "-"}
            </span>
          </ParagraphAlt>
        )}
        {containsNameField(supportedFields) && (
          <ParagraphAlt>
            {t("reservations:contactName")}:{" "}
            <span data-testid="reservation__reservee-name">
              {`${reservation.reserveeFirstName || ""} ${
                reservation.reserveeLastName || ""
              }`.trim()}
            </span>
          </ParagraphAlt>
        )}
        {containsField(supportedFields, "reserveePhone") && (
          <ParagraphAlt>
            {t("reservations:contactPhone")}:
            <span data-testid="reservation__reservee-phone">
              {reservation.reserveePhone}
            </span>
          </ParagraphAlt>
        )}
        {containsField(supportedFields, "reserveeEmail") && (
          <ParagraphAlt>
            {t("reservations:contactEmail")}:
            <span data-testid="reservation__reservee-email">
              {reservation.reserveeEmail}
            </span>
          </ParagraphAlt>
        )}
      </ContentContainer>
    );
  }

  return (
    <ContentContainer>
      {containsNameField(supportedFields) && (
        <ParagraphAlt>
          {t("common:name")}:{" "}
          <span data-testid="reservation__reservee-name">
            {`${reservation.reserveeFirstName || ""} ${
              reservation.reserveeLastName || ""
            }`.trim()}
          </span>
        </ParagraphAlt>
      )}
      {containsField(supportedFields, "reserveePhone") && (
        <ParagraphAlt>
          {t("common:phone")}:
          <span data-testid="reservation__reservee-phone">
            {reservation.reserveePhone || "-"}
          </span>
        </ParagraphAlt>
      )}
      {containsField(supportedFields, "reserveeEmail") && (
        <ParagraphAlt>
          {t("common:email")}:
          <span data-testid="reservation__reservee-email">
            {reservation.reserveeEmail || "-"}
          </span>
        </ParagraphAlt>
      )}
    </ContentContainer>
  );
}

function ReservationInfo({
  reservation,
  supportedFields,
}: {
  reservation: NodeT;
  supportedFields: Pick<ReservationMetadataFieldNode, "fieldName">[];
}) {
  const { t } = useTranslation();
  const POSSIBLE_FIELDS = ["purpose", "numPersons", "ageGroup", "description"];
  const fields = POSSIBLE_FIELDS.filter((field) =>
    containsField(supportedFields, field)
  );

  return (
    <ContentContainer>
      {fields.map((field) => (
        <ParagraphAlt key={field}>
          {t(`reservationApplication:label.common.${field}`)}:{" "}
          <span data-testid={`reservation__${field}`}>
            {/* FIXME remove the value function */}
            {getReservationValue(reservation as ReservationNode, field) || "-"}
          </span>
        </ParagraphAlt>
      ))}
    </ContentContainer>
  );
}

function useToastIfUpdated() {
  const router = useRouter();
  const { t } = useTranslation();

  useEffect(() => {
    const removeTimeUpdatedParam = () => {
      const { pathname, query } = router;
      // NOTE ParsedQuery is a Record<string, string>
      const params = new URLSearchParams(query as Record<string, string>);
      params.delete("timeUpdated");

      router.replace(
        {
          pathname,
          query: params.toString(),
        },
        undefined,
        { shallow: true }
      );
    };
    const q = router.query;

    if (q.timeUpdated) {
      successToast({
        text: t("reservations:saveNewTimeSuccess"),
      });
      removeTimeUpdatedParam();
    }
  }, [router, t]);
}

// TODO add a state check => if state is Created redirect to the reservation funnel
// if state is Cancelled, Denied, WaitingForPayment what then?
function Reservation({
  termsOfUse,
  reservation,
}: PropsNarrowed): JSX.Element | null {
  const { t, i18n } = useTranslation();

  // TODO this should be moved to SSR also
  const { order, isLoading: orderLoading } = useOrder({
    orderUuid: reservation.paymentOrder[0]?.orderUuid ?? "",
  });

  const reservationUnit = reservation.reservationUnits?.[0] ?? null;
  const instructionsKey =
    reservation.state != null
      ? getReservationUnitInstructionsKey(reservation.state)
      : undefined;

  const shouldDisplayPricingTerms: boolean = useMemo(() => {
    if (!reservationUnit) {
      return false;
    }

    const isFreeOfCharge = isReservationUnitFreeOfCharge(
      reservationUnit.pricings,
      new Date(reservation.begin)
    );

    return (
      reservation.applyingForFreeOfCharge ||
      (reservationUnit.canApplyFreeOfCharge && !isFreeOfCharge)
    );
  }, [reservation, reservationUnit]);

  const paymentTermsContent =
    reservationUnit.paymentTerms != null
      ? getTranslation(reservationUnit.paymentTerms, "text")
      : undefined;
  const cancellationTermsContent =
    reservationUnit.cancellationTerms != null
      ? getTranslation(reservationUnit.cancellationTerms, "text")
      : undefined;
  const pricingTermsContent =
    reservationUnit?.pricingTerms != null
      ? getTranslation(reservationUnit?.pricingTerms, "text")
      : undefined;
  const serviceSpecificTermsContent =
    reservationUnit.serviceSpecificTerms != null
      ? getTranslation(reservationUnit.serviceSpecificTerms, "text")
      : undefined;

  const modifyTimeReason = getWhyReservationCantBeChanged({ reservation });
  const canTimeBeModified = modifyTimeReason == null;

  const normalizedOrderStatus =
    getNormalizedReservationOrderStatus(reservation);

  useToastIfUpdated();

  if (orderLoading) {
    return <CenterSpinner />;
  }

  const { begin, end } = reservation;
  const timeString = capitalize(
    formatDateTimeRange(t, new Date(begin), new Date(end))
  );

  const supportedFields = filterNonNullable(
    reservationUnit.metadataSet?.supportedFields
  );

  const isBeingHandled =
    reservation.state === ReservationStateChoice.RequiresHandling;
  const isCancellable = isReservationCancellable(reservation);

  const checkoutUrl = getCheckoutUrl(order, i18n.language);

  const hasCheckoutUrl = !!checkoutUrl;
  const isWaitingForPayment =
    reservation.state === ReservationStateChoice.WaitingForPayment;

  const routes = [
    {
      slug: "/reservations",
      title: t("breadcrumb:reservations"),
    },
    {
      // NOTE Don't set slug. It hides the mobile breadcrumb
      title: t("reservations:reservationName", { id: reservation.pk }),
    },
  ];

  const hasReceipt =
    order?.receiptUrl &&
    (order.status === OrderStatus.Paid ||
      order.status === OrderStatus.Refunded);

  return (
    <>
      <BreadcrumbWrapper route={routes} />
      <Container>
        <ReservationPageWrapper data-testid="reservation__content">
          <div style={{ gridColumn: "1 / span 1", gridRow: "1 / span 1" }}>
            <Heading data-testid="reservation__name">
              {t("reservations:reservationName", { id: reservation.pk })}
            </Heading>
            <SubHeading>
              <Link
                data-testid="reservation__reservation-unit"
                href={reservationUnitPath(reservationUnit.pk ?? 0)}
              >
                {getReservationUnitName(reservationUnit)}
              </Link>
              <NoWrap data-testid="reservation__time">{timeString}</NoWrap>
            </SubHeading>
            <StatusContainer>
              <ReservationStatus
                testId="reservation__status"
                state={reservation.state ?? ReservationStateChoice.Confirmed}
              />
              {normalizedOrderStatus && (
                <ReservationOrderStatus
                  orderStatus={normalizedOrderStatus}
                  testId="reservation__payment-status"
                />
              )}
            </StatusContainer>
          </div>
          <div style={{ gridRowEnd: "span 3" }}>
            <ReservationInfoCard reservation={reservation} type="complete" />
            <SecondaryActions>
              {reservation.state === ReservationStateChoice.Confirmed && (
                <ButtonLikeLink
                  size="large"
                  disabled={!reservation.calendarUrl}
                  data-testid="reservation__button--calendar-link"
                  href={reservation.calendarUrl ?? ""}
                  locale={false}
                >
                  {t("reservations:saveToCalendar")}
                  <IconCalendar aria-hidden />
                </ButtonLikeLink>
              )}
              {hasReceipt && (
                <ButtonLikeLink
                  size="large"
                  data-testid="reservation__confirmation--button__receipt-link"
                  href={`${order.receiptUrl}&lang=${i18n.language}`}
                  target="_blank"
                >
                  {t("reservations:downloadReceipt")}
                  <IconLinkExternal aria-hidden />
                </ButtonLikeLink>
              )}
            </SecondaryActions>
          </div>
          <div>
            <Actions>
              {isWaitingForPayment && (
                <ButtonLikeLink
                  size="large"
                  disabled={!hasCheckoutUrl}
                  href={checkoutUrl ?? ""}
                  data-testid="reservation-detail__button--checkout"
                >
                  {t("reservations:payReservation")}
                  <IconArrowRight aria-hidden />
                </ButtonLikeLink>
              )}
              {canTimeBeModified && (
                <ButtonLikeLink
                  size="large"
                  href={`${reservationsUrl}${reservation.pk}/edit`}
                  data-testid="reservation-detail__button--edit"
                >
                  {t("reservations:modifyReservationTime")}
                  <IconCalendar aria-hidden />
                </ButtonLikeLink>
              )}
              {isCancellable && (
                <ButtonLikeLink
                  // TODO use url builder
                  size="large"
                  href={`${reservationsUrl}${reservation.pk}/cancel`}
                  data-testid="reservation-detail__button--cancel"
                >
                  {t(
                    `reservations:cancel${
                      isBeingHandled ? "Application" : "Reservation"
                    }`
                  )}
                  <IconCross aria-hidden />
                </ButtonLikeLink>
              )}
            </Actions>
            <NotModifiableReason reservation={reservation} />
          </div>
          <Content>
            {instructionsKey &&
              getTranslation(reservationUnit, instructionsKey) && (
                <ContentContainer>
                  <ParagraphHeading>
                    {t("reservations:reservationInfo")}
                  </ParagraphHeading>
                  <Paragraph>
                    {getTranslation(reservationUnit, instructionsKey)}
                  </Paragraph>
                </ContentContainer>
              )}
            <ParagraphHeading>
              {t("reservationApplication:applicationInfo")}
            </ParagraphHeading>
            <ReservationInfo
              reservation={reservation}
              supportedFields={supportedFields}
            />
            <ParagraphHeading>
              {t("reservationCalendar:reserverInfo")}
            </ParagraphHeading>
            <ReserveeInfo
              reservation={reservation}
              supportedFields={supportedFields}
            />
            <Terms>
              {(paymentTermsContent || cancellationTermsContent) && (
                <Accordion
                  heading={t(
                    `reservationUnit:${
                      paymentTermsContent
                        ? "paymentAndCancellationTerms"
                        : "cancellationTerms"
                    }`
                  )}
                  theme="thin"
                  data-testid="reservation__payment-and-cancellation-terms"
                >
                  {paymentTermsContent != null && (
                    <AccordionContent>
                      <Sanitize html={paymentTermsContent} />
                    </AccordionContent>
                  )}
                  {cancellationTermsContent != null && (
                    <AccordionContent>
                      <Sanitize html={cancellationTermsContent} />
                    </AccordionContent>
                  )}
                </Accordion>
              )}
              {shouldDisplayPricingTerms && pricingTermsContent && (
                <Accordion
                  heading={t("reservationUnit:pricingTerms")}
                  theme="thin"
                  data-testid="reservation__pricing-terms"
                >
                  <AccordionContent>
                    <Sanitize html={pricingTermsContent} />
                  </AccordionContent>
                </Accordion>
              )}
              <Accordion
                heading={t("reservationUnit:termsOfUse")}
                theme="thin"
                data-testid="reservation__terms-of-use"
              >
                {serviceSpecificTermsContent && (
                  <AccordionContent>
                    <Sanitize html={serviceSpecificTermsContent} />
                  </AccordionContent>
                )}
                <AccordionContent>
                  {termsOfUse?.genericTerms != null && (
                    <Sanitize
                      html={getTranslation(termsOfUse.genericTerms, "text")}
                    />
                  )}
                </AccordionContent>
              </Accordion>
            </Terms>
            <AddressSection reservationUnit={reservationUnit} />
          </Content>
        </ReservationPageWrapper>
      </Container>
    </>
  );
}

type Props = Awaited<ReturnType<typeof getServerSideProps>>["props"];

type NodeT = NonNullable<ReservationQuery["reservation"]>;

// TODO this should return 500 if the backend query fails (not 404), or 400 if the query is incorrect etc.
// typically 500 would be MAX_COMPLEXITY issue (could also make it 400 but 400 should be invalid query, not too complex)
// 500 should not be if the backend is down (which one is that?)
export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  const { locale, params } = ctx;
  const pk = Number(params?.id);
  const commonProps = getCommonServerSideProps();
  const apolloClient = createApolloClient(commonProps.apiBaseUrl, ctx);

  if (isFinite(pk)) {
    const bookingTerms = await getGenericTerms(apolloClient);

    // NOTE errors will fallback to 404
    const id = base64encode(`ReservationNode:${pk}`);
    const { data, error } = await apolloClient.query<
      ReservationQuery,
      ReservationQueryVariables
    >({
      query: ReservationDocument,
      fetchPolicy: "no-cache",
      variables: { id },
    });

    const { data: userData } = await apolloClient.query<CurrentUserQuery>({
      query: CurrentUserDocument,
      fetchPolicy: "no-cache",
    });
    const user = userData?.currentUser;

    if (error) {
      // eslint-disable-next-line no-console
      console.error("Error while fetching reservation", error);
    }

    const { reservation } = data ?? {};
    // Return 404 for unauthorized access
    if (
      reservation != null &&
      user != null &&
      reservation.user?.pk === user.pk
    ) {
      return {
        props: {
          ...commonProps,
          key: `${id}-${locale}`,
          ...(await serverSideTranslations(locale ?? "fi")),
          overrideBackgroundColor: "var(--tilavaraus-white)",
          reservation,
          termsOfUse: {
            genericTerms: bookingTerms ?? null,
          },
        },
      };
    }
  }

  return {
    notFound: true,
    props: {
      // have to double up notFound inside the props to get TS types dynamically
      notFound: true,
      ...commonProps,
      ...(await serverSideTranslations(locale ?? "fi")),
    },
  };
}

export default Reservation;
