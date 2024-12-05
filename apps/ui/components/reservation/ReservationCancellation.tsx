import React, { useEffect, useState } from "react";
import styled, { css } from "styled-components";
import { useForm } from "react-hook-form";
import {
  Button,
  IconArrowRight,
  IconClock,
  IconCross,
  IconEuroSign,
  IconLocation,
  IconSignout,
} from "hds-react";
import { useTranslation } from "next-i18next";
import { fontMedium, H1, H4 } from "common/src/common/typography";
import {
  useCancelReservationMutation,
  type ReservationCancelPageQuery,
} from "@gql/gql-types";
import { IconButton } from "common/src/components";
import Sanitize from "../common/Sanitize";
import { ReservationInfoCard } from "./ReservationInfoCard";
import { signOut } from "common/src/browserHelpers";
import { ReservationPageWrapper } from "../reservations/styles";
import {
  convertLanguageCode,
  getTranslationSafe,
  toUIDate,
} from "common/src/common/util";
import { errorToast } from "common/src/common/toast";
import { ControlledSelect } from "common/src/components/form";
import { AutoGrid, ButtonContainer, Flex } from "common/styles/util";
import { ButtonLikeLink } from "../common/ButtonLikeLink";
import { getReservationPath } from "@/modules/urls";
import TermsBox from "common/src/termsbox/TermsBox";
import { AccordionWithState } from "../Accordion";
import { breakpoints } from "common";
import Error from "next/error";
import { getPrice } from "@/modules/reservationUnit";
import { formatDateTimeStrings } from "@/modules/util";
import { LocalizationLanguages } from "common/src/helpers";

type CancelReasonsQ = NonNullable<
  ReservationCancelPageQuery["reservationCancelReasons"]
>;
type CancelReasonsEdge = NonNullable<CancelReasonsQ["edges"]>;
type CancelReasonsNode = NonNullable<
  NonNullable<CancelReasonsEdge[number]>["node"]
>;
type NodeT = ReservationCancelPageQuery["reservation"];
type Props = {
  apiBaseUrl: string;
  reasons: CancelReasonsNode[];
  reservation: NonNullable<NodeT>;
};

const Actions = styled(ButtonContainer).attrs({
  $justifyContent: "space-between",
})`
  grid-column: 1 / -1;
`;

const Form = styled.form`
  label {
    ${fontMedium};
  }
`;

function ReturnLinkList({ apiBaseUrl }: { apiBaseUrl: string }): JSX.Element {
  const { t } = useTranslation();
  return (
    <Flex $gap="none" $alignItems="flex-start">
      <IconButton
        href="/reservations"
        label={t("reservations:gotoReservations")}
        icon={<IconArrowRight aria-hidden />}
      />
      <IconButton
        href="/"
        label={t("common:gotoFrontpage")}
        icon={<IconArrowRight aria-hidden />}
      />
      <IconButton
        icon={<IconSignout aria-hidden />}
        onClick={() => signOut(apiBaseUrl)}
        label={t("common:logout")}
      />
    </Flex>
  );
}

type FormValues = {
  reason: number;
  description?: string;
};

const infoCss = css`
  @media (min-width: ${breakpoints.m}) {
    grid-row: 1 / -1;
    grid-column: 2;
  }
`;

/* TODO need a better way to handle the size of the card
 * on dekstop we want 390px but on mobile we want 100%
 * and magic numbers are iffy */
const StyledInfoCard = styled(ReservationInfoCard)`
  ${infoCss}
`;

const ApplicationInfo = styled(Flex).attrs({ $gap: "2-xs" })`
  background-color: var(--color-silver-light);
  padding: var(--spacing-m);
  ${infoCss}
`;

const IconList = styled(Flex).attrs({
  $gap: "2-xs",
})`
  list-style: none;
  padding: 0;
  margin: var(--spacing-2-xs) 0 0;
  li {
    display: flex;
    gap: var(--spacing-xs);
    align-items: center;
  }
`;

export function ReservationCancellation(props: Props): JSX.Element {
  const [isSuccess, setIsSuccess] = useState(false);
  const { t } = useTranslation();

  const { reservation } = props;

  const title = !isSuccess
    ? t("reservations:cancelReservation")
    : t("reservations:reservationCancelledTitle");
  const ingress = !isSuccess
    ? t("reservations:cancelReservationBody")
    : t("reservations:reservationCancelledBody");

  const handleNext = () => {
    setIsSuccess(true);
  };

  // TODO check that the reservation hasn't been cancelled already

  return (
    <ReservationPageWrapper>
      <div>
        <H1 $noMargin>{title}</H1>
        <p>{ingress}</p>
      </div>
      {/* TODO replace this if part of an application
       * annoying thing here is that this adds unnecessary fields to the query
       * we only need application fields or reservation fields
       * another option would be
       * to split the pages in two so we can do separate SSR queries and append this element on the page level
       */}
      {reservation.recurringReservation ? (
        <ApplicationInfoCard reservation={reservation} />
      ) : (
        <StyledInfoCard reservation={reservation} type="confirmed" />
      )}
      <Flex>
        {!isSuccess ? (
          <CancellationForm {...props} onNext={handleNext} />
        ) : (
          <CancellationSuccess {...props} />
        )}
      </Flex>
    </ReservationPageWrapper>
  );
}

function ApplicationInfoCard({
  reservation,
}: {
  reservation: Props["reservation"];
}) {
  // NOTE assumes that the name of the recurringReservation is copied from applicationSection when it's created
  const name = reservation.recurringReservation?.name;
  const reservationUnit = reservation.reservationUnits.find(() => true);
  const { t, i18n } = useTranslation();
  const lang = convertLanguageCode(i18n.language);
  const reservationUnitName =
    reservationUnit != null
      ? getTranslationSafe(reservationUnit, "name", lang)
      : "-";
  const price = getPrice(reservation, lang, t);

  const { dayOfWeek, time, date } = formatDateTimeStrings(
    t,
    reservation,
    undefined,
    true
  );

  const icons = [
    {
      text: time,
      icon: <IconClock aria-hidden="true" />,
    },
    {
      icon: <IconLocation aria-hidden="true" />,
      text: reservationUnitName,
    },
    {
      icon: <IconEuroSign aria-hidden="true" />,
      text: price,
    },
  ];

  return (
    <ApplicationInfo>
      <H4 as="h2" $noMargin>
        {name}
      </H4>
      <div>
        {toUIDate(date)}
        {" - "}
        {dayOfWeek}
      </div>
      <IconList>
        {icons.map(({ text, icon }) => (
          <li key={text}>
            {icon}
            {text}
          </li>
        ))}
      </IconList>
    </ApplicationInfo>
  );
}

function CancellationForm(props: Props & { onNext: () => void }): JSX.Element {
  const { reservation, onNext } = props;
  const { t, i18n } = useTranslation();
  const lang = convertLanguageCode(i18n.language);

  const reasons = props.reasons.map((node) => ({
    label: getTranslationSafe(node, "reason", lang),
    value: node?.pk ?? 0,
  }));

  const [cancelReservation, { loading }] = useCancelReservationMutation();

  const form = useForm<FormValues>();
  const { register, handleSubmit, watch, control } = form;

  useEffect(() => {
    register("reason", { required: true });
    register("description");
  }, [register]);

  const onSubmit = (formData: FormValues) => {
    if (!reservation.pk || !formData.reason) {
      return;
    }
    const { reason, description } = formData;
    try {
      cancelReservation({
        variables: {
          input: {
            pk: reservation.pk,
            cancelReason: reason,
            cancelDetails: description,
          },
        },
      });
      // TODO redirect to a success page (or back to the reservation page with a toast is preferable)
      onNext();
      window.scrollTo(0, 0);
    } catch (e) {
      errorToast({
        text: t("reservations:reservationCancellationFailed"),
      });
    }
  };

  const cancellationTerms = getTranslatedTerms(reservation, lang);
  // TODO need to switch to application link if this is part of an application
  const backLink = getReservationPath(reservation.pk);

  return (
    <>
      <p style={{ margin: 0 }}>{t("reservations:cancelInfoBody")}</p>
      {cancellationTerms != null && (
        <AccordionWithState
          heading={t("reservationUnit:cancellationTerms")}
          disableBottomMargin
        >
          <TermsBox body={<Sanitize html={cancellationTerms} />} />
        </AccordionWithState>
      )}
      <Form onSubmit={handleSubmit(onSubmit)}>
        <AutoGrid>
          <ControlledSelect
            name="reason"
            control={control}
            label={t("reservations:cancelReason")}
            options={reasons}
            required
          />
          <Actions>
            <ButtonLikeLink
              data-testid="reservation-cancel__button--back"
              href={backLink}
            >
              <IconCross aria-hidden="true" />
              {t("reservations:cancelReservationCancellation")}
            </ButtonLikeLink>
            <Button
              variant="primary"
              type="submit"
              disabled={!watch("reason")}
              data-testid="reservation-cancel__button--cancel"
              isLoading={loading}
            >
              {t("reservations:cancelReservation")}
            </Button>
          </Actions>
        </AutoGrid>
      </Form>
    </>
  );
}

/// For applications use application round terms of use
function getTranslatedTerms(
  reservation: Props["reservation"],
  lang: LocalizationLanguages
) {
  if (reservation.recurringReservation) {
    const round =
      reservation.recurringReservation?.allocatedTimeSlot?.reservationUnitOption
        ?.applicationSection?.application?.applicationRound;
    const { termsOfUse } = round ?? {};
    if (termsOfUse) {
      return getTranslationSafe(termsOfUse, "text", lang);
    }
    return null;
  }
  const reservationUnit = reservation.reservationUnits.find(() => true);
  if (reservationUnit?.cancellationTerms != null) {
    return getTranslationSafe(reservationUnit?.cancellationTerms, "text", lang);
  }
  return null;
}

/* TODO
Perumisen vahvistaminen ohjaa takaisin kausivaraushakemuksen kaikkien varausten listaan.
Näytetään toast, joka ilmaisee peruttiinko kaikki tulevat varaukset vai ei: “Peruttiin kaikki tulevat varaukset.“ vs. “Peruttiin perumisehtojen mukaiset tulevat varaukset.“
Kaikkien varausten peruminen onnistui. / All bookings were successfully canceled. /Alla bokningar avbokades framgångsrikt.
Peruutusehdon täyttävät varaukset peruttiin / Bookings meeting the cancellation conditions were canceled. / Bokningar som uppfyllde avbokningsvillkoren avbokades.
*/
function CancellationSuccess(props: Props): JSX.Element {
  const { apiBaseUrl } = props;
  const reservationUnit = props.reservation.reservationUnits.find(() => true);
  const { i18n } = useTranslation();
  const lang = convertLanguageCode(i18n.language);

  // Should never happen but we can't enforce it in the type system
  if (reservationUnit == null) {
    return <Error statusCode={404} />;
  }

  const instructions = getTranslationSafe(
    reservationUnit,
    "reservationCancelledInstructions",
    lang
  );

  return (
    <>
      {instructions && <p>{instructions}</p>}
      <ReturnLinkList apiBaseUrl={apiBaseUrl} />
    </>
  );
}
