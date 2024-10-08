import {
  type ApplicationReservationsQuery,
  useApplicationReservationsQuery,
  type ApplicationQuery,
  ReservationUnitNode,
  ReservationStateChoice,
} from "@/gql/gql-types";
import { getReservationUnitPath } from "@/modules/urls";
import { fontMedium, fontRegular } from "common";
import { errorToast } from "common/src/common/toast";
import {
  getTranslationSafe,
  toApiDate,
  toUIDate,
} from "common/src/common/util";
import { IconButton } from "common/src/components";
import {
  filterNonNullable,
  formatApiTimeInterval,
  getLocalizationLang,
  LocalizationLanguages,
  toMondayFirstUnsafe,
} from "common/src/helpers";
import {
  Accordion,
  Button,
  Dialog,
  IconCross,
  IconInfoCircle,
  IconLinkExternal,
  Table,
} from "hds-react";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import Sanitize from "../common/Sanitize";
import { LinkLikeButton } from "common/styles/buttonCss";

const N_RESERVATIONS_TO_SHOW = 20;

// TODO this probably doesn't need to be more than id (if we are doing all the queries on client side)
type ApplicationT = NonNullable<ApplicationQuery["application"]>;
type Props = {
  application: ApplicationT;
};

// TODO needs to be replaced with a custom accordion component
// that has:
// - an option for extra buttons on the right
// - close button that is not the header
// - option for icon + text list under the header
// Our custom Accordion component can't handle these either
const StyledAccordion = styled(Accordion)`
  [class*="Accordion-module_accordionHeader__"] {
    background-color: var(--color-black-10);
  }
  [class*="Accordion-module_accordionHeader__3_"] {
    padding: var(--spacing-m);
  }
`;

const H3 = styled.h3`
  font-size: var(--fontsize-heading-s);
  line-height: var(--lineheight-s);
  ${fontMedium}
`;

const ListContainer = styled.div`
  margin-top: var(--spacing-xl);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-m);
`;

// Tables can't do horizontal scroll without wrapping the table in a div
// NOTE HDS Table can't be styled so have to wrap it in an extra div.
const TableWrapper = styled.div`
  & > div {
    overflow-x: auto;
    > table {
      width: max-content;
    }
  }
`;

export function ApprovedReservations({ application }: Props) {
  const { data, loading } = useApplicationReservationsQuery({
    variables: {
      id: application.id,
      // FIXME TESTING
      beginDate: toApiDate(new Date("2021-01-01T00:00:00Z")) ?? "",
      // beginDate: toApiDate(new Date()) ?? "",
    },
  });
  const { application: app } = data || {};

  return (
    <ListContainer>
      {/* TODO spinner (or skeleton and put the spinner below) */}
      {loading && <p>Ladataan...</p>}
      {app?.applicationSections?.map((aes) => (
        /* TODO should be initially open if applicationSections.length === 1 */
        <StyledAccordion
          heading={aes.name}
          initiallyOpen={application.applicationSections?.length === 1}
          headingLevel={2}
          closeButton={false}
          key={aes.pk}
        >
          <ApplicationSection applicationSection={aes} key={aes.pk} />
        </StyledAccordion>
      ))}
    </ListContainer>
  );
}

type QueryT = NonNullable<ApplicationReservationsQuery["application"]>;
type ApplicationSectionT = NonNullable<QueryT["applicationSections"]>[0];

type ReservationUnitTableElem = {
  reservationUnit: Pick<
    ReservationUnitNode,
    "nameSv" | "nameFi" | "nameEn" | "id" | "pk"
  >;
  // TODO should this be a number or a string here (i.e. should it be translated already)?
  dateOfWeek: string;
  price: string;
  // same for this actual end / start times or a combined string
  time: string;
  // TODO what is help link not a link it's a modal text
  // probably needs to be a fragment (translated text fields)
  helpText: Pick<
    ReservationUnitNode,
    | "reservationConfirmedInstructionsFi"
    | "reservationConfirmedInstructionsSv"
    | "reservationConfirmedInstructionsEn"
    | "nameFi"
    | "nameSv"
    | "nameEn"
  >;
};
function ReservationUnitTable({
  reservationUnits,
}: {
  reservationUnits: ReservationUnitTableElem[];
}) {
  const { t, i18n } = useTranslation();
  type ModalT = ReservationUnitTableElem["helpText"];
  const [modal, setModal] = useState<ModalT | null>(null);

  const lang = getLocalizationLang(i18n.language);

  // TODO translate headerName
  const cols = [
    {
      key: "reservationUnit",
      // TODO the keys are too long for no reason
      headerName: t("application:view.reservationsTab.reservationUnit"),
      isSortable: false,
      transform: (elem: ReservationUnitTableElem) =>
        createReservationUnitLink({
          reservationUnit: elem.reservationUnit,
          lang,
        }),
    },
    {
      key: "dateOfWeek",
      headerName: t("common:day"),
      isSortable: false,
    },
    {
      key: "time",
      headerName: t("common:timeLabel"),
      isSortable: false,
    },
    {
      key: "price",
      headerName: t("common:price"),
      isSortable: false,
    },
    {
      key: "helpLink",
      headerName: t("application:view.helpModal.title"),
      transform: ({ helpText }: ReservationUnitTableElem) => {
        return (
          <LinkLikeButton
            onClick={() => {
              setModal(helpText);
            }}
          >
            Ohjeet
          </LinkLikeButton>
        );
      },
      isSortable: false,
    },
  ];

  const getTranslation = (
    elem: ModalT | null,
    field: "name" | "reservationConfirmedInstructions"
  ) => {
    if (elem == null) {
      return "";
    }
    return getTranslationSafe(elem, field, lang);
  };

  // TODO use our base table from admin-ui?
  // it has some custom styling options, don't need the sort functionality from it though
  return (
    <>
      <TableWrapper>
        <Table
          variant="light"
          indexKey="pk"
          rows={reservationUnits}
          cols={cols}
        />
      </TableWrapper>
      <Dialog
        id="reservation-unit-modal-help"
        isOpen={modal != null}
        title={t("application:view.helpModal.title")}
        aria-labelledby="reservation-unit-modal-help-header"
        closeButtonLabelText={t("common:close")}
        close={() => {
          setModal(null);
        }}
      >
        <Dialog.Header
          id="reservation-unit-modal-help-header"
          title={getTranslation(modal, "name")}
          iconLeft={<IconInfoCircle aria-hidden="true" />}
        />
        <Dialog.Content id="dialog-content">
          <Sanitize
            html={getTranslation(modal, "reservationConfirmedInstructions")}
          />
        </Dialog.Content>
        <Dialog.ActionButtons>
          <Button onClick={() => setModal(null)}>
            {t("common:close")}
          </Button>
        </Dialog.ActionButtons>
      </Dialog>
    </>
  );
}

type ReservationsTableElem = {
  date: Date;
  dayOfWeek: string;
  time: string;
  // TODO replace with pk + name
  reservationUnit: Pick<
    ReservationUnitNode,
    "nameSv" | "nameFi" | "nameEn" | "id" | "pk"
  >;
  status: "" | "rejected";
  // TODO how to implement the cancel callback
  // should be the pk of the reservation so we can call a mutation on it
  // cancelButton: string;
  pk: number;
};

// icon button forces medium styling for the label
// FIXME focus effect doesn't work correctly inside a table
const IconButton400 = styled(IconButton)`
  & span {
    ${fontRegular}
  }
`;

function createReservationUnitLink({
  reservationUnit,
  lang,
}: {
  lang: LocalizationLanguages;
  reservationUnit: Pick<
    ReservationUnitNode,
    "nameSv" | "nameFi" | "nameEn" | "id" | "pk"
  >;
}): JSX.Element {
  const { pk } = reservationUnit;
  // TODO needs a truncate?
  const name = getTranslationSafe(reservationUnit, "name", lang);
  return pk != null && pk > 0 ? (
    <IconButton400
      href={getReservationUnitPath(pk)}
      label={name}
      openInNewTab
      icon={<IconLinkExternal aria-hidden />}
    />
  ) : (
    <span>{name}</span>
  );
}

function ReservationsTable({
  reservations,
}: {
  reservations: ReservationsTableElem[];
}) {
  const { i18n } = useTranslation();
  const { t } = useTranslation();

  const lang = getLocalizationLang(i18n.language);
  const handleCancel = (pk: number) => {
    errorToast({ text: `Not implemented: cancel reservation: ${pk}` });
  };
  const cols = [
    {
      key: "date",
      headerName: t("common:dateLabel"),
      isSortable: false,
      transform: ({ date }: ReservationsTableElem) => toUIDate(date),
    },
    {
      key: "dayOfWeek",
      headerName: t("common:day"),
      isSortable: false,
    },
    {
      key: "time",
      headerName: t("common:timeLabel"),
      isSortable: false,
    },
    {
      key: "reservationUnit",
      // TODO the keys are too long for no reason
      headerName: t("application:view.reservationsTab.reservationUnit"),
      isSortable: false,
      transform: (elem: ReservationsTableElem) =>
        createReservationUnitLink({
          reservationUnit: elem.reservationUnit,
          lang,
        }),
    },
    {
      key: "status",
      headerName: "",
      isSortable: false,
      // TODO this should be a StatusTag
      transform: ({ status }: ReservationsTableElem) => (
        <span>
          {status === "rejected"
            ? t("application:view.reservationsTab.rejected")
            : ""}
        </span>
      ),
    },
    {
      key: "cancelButton",
      headerName: "",
      isSortable: false,
      transform: ({ pk }: ReservationsTableElem) => (
        <Button
          variant="supplementary"
          iconLeft={<IconCross />}
          // TODO should use global css rules to override all supplementary buttons (or default theme)
          theme="black"
          style={{ whiteSpace: "nowrap" }}
          onClick={() => handleCancel(pk)}
        >
          {t("common:remove")}
        </Button>
      ),
    },
  ];

  return (
    <TableWrapper>
      <Table variant="light" indexKey="date" rows={reservations} cols={cols} />
    </TableWrapper>
  );
}

function ApplicationSection({
  applicationSection,
}: {
  applicationSection: ApplicationSectionT;
}) {
  const { t } = useTranslation();

  // TODO need to do some reduce magic also since weekdays: [] while we need to flatten them
  // TODO remove all elements with null recurring reservation here
  // in case we are here either because of invalid data or because this component is used when the Application has not been finalized
  const reservationUnits: ReservationUnitTableElem[] = filterNonNullable(
    applicationSection.reservationUnitOptions
      .map((ruo) =>
        ruo.allocatedTimeSlots.map((ats) => ats.recurringReservation)
      )
      .flat()
  ).map((r) => ({
    reservationUnit: r.reservationUnit,
    // TODO this requires reduce (array expansion)
    dateOfWeek:
      filterNonNullable(r.weekdays)
        .map((day) => t(`weekDayLong.${day}`))
        .join(", ") ?? "-",
    // Pricing is not implemented. So all are free or empty?
    price: "",
    time: formatApiTimeInterval(r),
    // link to the reservation-unit? or a specific page for it
    helpText: r.reservationUnit,
  }));

  const reservations: ReservationsTableElem[] = filterNonNullable(
    applicationSection.reservationUnitOptions
      .map((ruo) =>
        ruo.allocatedTimeSlots.map((ats) => ats.recurringReservation)
      )
      .flat()
  )
    .reduce<ReservationsTableElem[]>((acc, r) => {
      // TODO test
      const rejected: ReservationsTableElem[] = r.rejectedOccurrences.map(
        (res) => {
          const start = new Date(res.beginDatetime);
          const end = new Date(res.endDatetime);
          const dayOfWeek = t(
            `weekDayLong.${toMondayFirstUnsafe(start.getDay())}`
          );
          // TODO
          const time = `${start.getHours()}:${start.getMinutes()} - ${end.getHours()}:${end.getMinutes()}`;
          return {
            date: start,
            dayOfWeek,
            time,
            reservationUnit: r.reservationUnit,
            status: "rejected",
            pk: 0,
          };
        }
      );
      const expanded: ReservationsTableElem[] = r.reservations.map((res) => {
        // TODO this is wrong we need to take the day from the actual reservation
        // i.e. convert it to a date and get the day of the week
        const dayOfWeek =
          filterNonNullable(r.weekdays)
            .map((day) => t(`weekDayLong.${day}`))
            .join(", ") ?? "-";
        const time = formatApiTimeInterval(r);
        // TODO this should be enabled if there is something unusual (like it's from the rejected list)
        // it defaults to empty
        const status =
          res.state === ReservationStateChoice.Confirmed ? "" : "rejected";
        const start = new Date(res.begin);
        return {
          date: start,
          dayOfWeek,
          time,
          reservationUnit: r.reservationUnit,
          status,
          pk: res.pk ?? 0,
        };
      });
      return [...acc, ...expanded, ...rejected];
    }, [])
    // For demo purposes (should be backend paginated)
    // NOTE we do need to keep the slice even if backend returns only 20 of each
    // because we want to keep the total at 20
    .slice(0, N_RESERVATIONS_TO_SHOW)
    // NOTE have to sort here because we are combining two lists
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  return (
    <ListContainer>
      <H3>{t("application:view.reservationsTab.reservationUnitsTitle")}</H3>
      <ReservationUnitTable reservationUnits={reservationUnits} />
      <H3>{t("application:view.reservationsTab.reservationsTitle")}</H3>
      <ReservationsTable reservations={reservations} />
      <div style={{ display: "flex", justifyContent: "space-around" }}>
        {/* TODO needs to be a link button with an open to other tab and external icon */}
        <Button disabled variant="secondary">
          {t("application:view.reservationsTab.showAllReservations")}
        </Button>
      </div>
    </ListContainer>
  );
}
