import {
  type ApplicationReservationsQuery,
  useApplicationReservationsQuery,
  type ApplicationQuery,
  ReservationUnitNode,
  ReservationStateChoice,
} from "@/gql/gql-types";
import {
  getApplicationSectionPath,
  getReservationUnitPath,
} from "@/modules/urls";
import { breakpoints, fontMedium, fontRegular, H5 } from "common";
import { errorToast } from "common/src/common/toast";
import {
  getTranslationSafe,
  toApiDate,
  toUIDate,
} from "common/src/common/util";
import { IconButton, StatusLabel } from "common/src/components";
import {
  filterNonNullable,
  formatApiTimeInterval,
  formatMinutes,
  fromMondayFirst,
  getLocalizationLang,
  LocalizationLanguages,
  timeToMinutes,
} from "common/src/helpers";
import {
  Button,
  Dialog,
  IconCalendarRecurring,
  IconClock,
  IconCross,
  IconEuroSign,
  IconInfoCircle,
  IconLinkExternal,
  IconLocation,
  IconPen,
  Table,
} from "hds-react";
import React, { useState } from "react";
import { useTranslation } from "next-i18next";
import styled from "styled-components";
import Sanitize from "../common/Sanitize";
import { LinkLikeButton } from "common/styles/buttonCss";
import { type TFunction } from "i18next";
import { convertWeekday } from "common/src/conversion";
import { formatTime } from "@/modules/util";
import { ButtonLikeLink } from "../common/ButtonLikeLink";
import { AccordionWithIcons } from "../AccordionWithIcons";
import { CenterSpinner } from "../common/common";

const N_RESERVATIONS_TO_SHOW = 20;

type ApplicationT = Pick<
  NonNullable<ApplicationQuery["application"]>,
  "id" | "pk"
>;
type Props = {
  application: ApplicationT;
};

const H3 = styled(H5).attrs({ as: "h3" })`
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
  /* Mobile uses cards, so no horizontal scroll */
  @media (width > ${breakpoints.s}) {
    & > div {
      overflow-x: auto;
      > table {
        width: max-content;
        min-width: 100%;
      }
    }
  }

  /* remove icons unless mobile */
  @media (width > ${breakpoints.s}) {
    /* the first link uses icon button, don't remove it's icon */
    /* && table > tbody > tr > td *:not([class*="IconButton_"]) svg { */
    /* TODO these rules are way too complex, and also it doesn't pick both the a and button children correctly
     * move the display setting to the child elements instead of the table */
    /* && table > tbody > tr > td *:not(button):not(a) * > div > svg { */
    && table > tbody > tr > td * svg {
      display: none;
    }
  }

  /* Change table to cards on mobile
   * wrong way selector because we don't want to redo the HDS table styling
   *
   * TODO remove background colour
   * TODO should have no padding between cards (and single border between two cards)
   * TODO first table element is "title" for the card
   * - medium font, no icon, less padding,
   */
  @media (width <= ${breakpoints.s}) {
    && table {
      /* No heading, cards have their own headings */
      & thead {
        display: none;
      }
      /* TODO remove from final version (we don't want spacing between the cards */
      border-collapse: separate;
      border-spacing: 0 0.5rem;

      & td {
        /* TODO remove bg colour (after we have borders correct) */
        background-color: var(--color-black-5);
        /*border-style : hidden;*/
        --border-width: 1px;
        --border-color: var(--color-black-90);
        border: var(--border-width) solid var(--border-color);
        border-bottom: none;
        border-top: none;
        &:first-child {
          border-top: var(--border-width) solid var(--border-color);
        }
        &:last-child {
          border-bottom: var(--border-width) solid var(--border-color);
        }
      }
    }
    & table > thead > tr > th,
    & table > tbody > tr > td {
      display: flex;
      &:empty {
        display: none;
      }
    }
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: var(--spacing-s);
  justify-content: center;
  flex-direction: row;
  @media (max-width: ${breakpoints.s}) {
    flex-direction: column;
  }
`;

// TODO type return
function getAesReservationUnits(aes: ApplicationSectionT) {
  return filterNonNullable(
    aes.reservationUnitOptions
      .map((x) => x.allocatedTimeSlots)
      .map((x) => x.map((y) => y.recurringReservation?.reservationUnit))
      .flat()
  );
}

function formatAesName(
  aes: ApplicationSectionT,
  lang: LocalizationLanguages
): string {
  const reservationUnits = getAesReservationUnits(aes);
  const firstResUnit = reservationUnits[0];
  if (firstResUnit == null) {
    return "-";
  }
  const { unit } = firstResUnit;
  const resUnitName = getTranslationSafe(firstResUnit, "name", lang);
  const unitName = unit != null ? getTranslationSafe(unit, "name", lang) : "";
  return `${resUnitName}, ${unitName}`;
}

function getAesReservationUnitCount(aes: ApplicationSectionT): number {
  return getAesReservationUnits(aes).length;
}

function formatNumberOfReservations(
  t: TFunction,
  aes: ApplicationSectionT
): string {
  const reservations = aes.reservationUnitOptions.flatMap((ruo) =>
    ruo.allocatedTimeSlots.flatMap(
      (ats) => ats.recurringReservation?.reservations ?? []
    )
  );
  const count = reservations.length;
  return `${count} ${t("application:view.reservationsTab.reservationCountPostfix")}`;
}

function formatReservationTimes(
  t: TFunction,
  aes: ApplicationSectionT
): string {
  const atsList = filterNonNullable(
    aes.reservationUnitOptions.flatMap((ruo) =>
      ruo.allocatedTimeSlots.map((a) => a)
    )
  );
  type TimeLabel = {
    day: number;
    label: string;
  };
  const times: TimeLabel[] = atsList.reduce<TimeLabel[]>((acc, ats) => {
    if (ats.recurringReservation == null) {
      return acc;
    }
    const { dayOfTheWeek } = ats;
    const day = convertWeekday(dayOfTheWeek);
    const time = formatApiTimeInterval(ats.recurringReservation);
    // NOTE our translations are sunday first
    // using enum translations is bad because we need to sort by day of the week
    const tday = t(`weekDay.${fromMondayFirst(day)}`);
    return [...acc, { day, label: `${tday} ${time}` }];
  }, []);
  times.sort((a, b) => a.day - b.day);

  return times.map((x) => x.label).join(" / ") || "-";
}

export function ApprovedReservations({ application }: Props) {
  const { t, i18n } = useTranslation();
  const { data, loading } = useApplicationReservationsQuery({
    variables: {
      id: application.id,
      beginDate: toApiDate(new Date()) ?? "",
    },
  });
  const { application: app } = data || {};

  const lang = getLocalizationLang(i18n.language);

  return (
    <ListContainer>
      {loading && <CenterSpinner />}
      {app?.applicationSections?.map((aes) => (
        <AccordionWithIcons
          heading={aes.name}
          initiallyOpen={app.applicationSections?.length === 1}
          headingLevel={2}
          icons={[
            {
              icon: <IconCalendarRecurring aria-hidden="true" />,
              text: formatNumberOfReservations(t, aes),
            },
            {
              icon: <IconClock aria-hidden="true" />,
              text: formatReservationTimes(t, aes),
            },
            {
              icon: <IconLocation aria-hidden="true" />,
              text: formatAesName(aes, lang),
              textPostfix:
                getAesReservationUnitCount(aes) > 1
                  ? `+ ${getAesReservationUnitCount(aes) - 1} ${t("application:view:reservationsTab.others")}`
                  : undefined,
            },
          ]}
          key={aes.pk}
        >
          <ApplicationSection
            applicationSection={aes}
            key={aes.pk}
            application={application}
          />
        </AccordionWithIcons>
      ))}
    </ListContainer>
  );
}

type QueryT = NonNullable<ApplicationReservationsQuery["application"]>;
type ApplicationSectionT = NonNullable<QueryT["applicationSections"]>[0];

const IconTextWrapper = styled.span`
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-3-xs);
`;

type ReservationUnitTableElem = {
  reservationUnit: Pick<
    ReservationUnitNode,
    | "id"
    | "pk"
    | "reservationConfirmedInstructionsFi"
    | "reservationConfirmedInstructionsSv"
    | "reservationConfirmedInstructionsEn"
    | "nameFi"
    | "nameSv"
    | "nameEn"
  >;
  dateOfWeek: string;
  price: string;
  // same for this actual end / start times or a combined string
  time: string;
};

function ReservationUnitTable({
  reservationUnits,
}: {
  reservationUnits: ReservationUnitTableElem[];
}) {
  const { t, i18n } = useTranslation();
  type ModalT = ReservationUnitTableElem["reservationUnit"];
  const [modal, setModal] = useState<ModalT | null>(null);

  const lang = getLocalizationLang(i18n.language);

  const cols = [
    {
      key: "reservationUnit",
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
      // TODO aria-hidden is questionable on mobile (because we are hiding the table header)
      transform: ({ dateOfWeek }: ReservationUnitTableElem) => (
        <IconTextWrapper>
          <IconClock aria-hidden="true" />
          {dateOfWeek}
        </IconTextWrapper>
      ),
    },
    {
      key: "time",
      headerName: t("common:timeLabel"),
      isSortable: false,
      transform: ({ time }: ReservationUnitTableElem) => (
        <IconTextWrapper>
          <IconClock aria-hidden="true" />
          {time}
        </IconTextWrapper>
      )
    },
    {
      key: "price",
      headerName: t("common:price"),
      isSortable: false,
      transform: ({ price }: ReservationUnitTableElem) => (
        price ? (
          <IconTextWrapper>
            <IconEuroSign aria-hidden="true" />
            {price}
          </IconTextWrapper>
        ) : ""
      ),
    },
    {
      key: "helpLink",
      headerName: t("application:view.helpModal.title"),
      transform: ({ reservationUnit }: ReservationUnitTableElem) => (
          <LinkLikeButton
            onClick={() => {
              setModal(reservationUnit);
            }}
            // table already includes padding
            style={{ padding: 0 }}
          >
            <IconInfoCircle aria-hidden="true" />
            {t("application:view.helpLink")}
          </LinkLikeButton>
      ),
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
          <Button onClick={() => setModal(null)}>{t("common:close")}</Button>
        </Dialog.ActionButtons>
      </Dialog>
    </>
  );
}

type ReservationsTableElem = {
  date: Date;
  dayOfWeek: string;
  time: string;
  reservationUnit: Pick<
    ReservationUnitNode,
    "nameSv" | "nameFi" | "nameEn" | "id" | "pk"
  >;
  status: "" | "rejected" | "modified";
  pk: number;
};

// TODO on mobile we want to wrap or truncate the text => requires changing Table instead
// TODO this should not wrap on mobile, use truncate instead (it looks better and should be a rare case)
const ReservationUnitLink = styled(IconButton)`
  & span {
    display: inline-flex;
    flex-wrap: wrap;
  }

  /* table hides icons by default, override this behaviour */
  &&& svg {
    display: inline;
  }

  /* icon button forces medium styling for the label
   * on mobile it's mock title for the card so medium is correct
   * on desktop it's a table cell so it's not correct
   */
  @media (width > ${breakpoints.s}) {
    & span {
      ${fontRegular}
      text-decoration: underline;
    }
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
  const name = getTranslationSafe(reservationUnit, "name", lang);
  if (pk == null || pk <= 0) {
    return <span>{name}</span>
  }
  return (
    <ReservationUnitLink
      href={getReservationUnitPath(pk)}
      label={name}
      openInNewTab
      icon={<IconLinkExternal aria-hidden />}
    />
  );
}

// TODO on mobile this should be hidden behind a popover
// for now hide it on mobile (the functionality is not implemented anyway)
const CancelButton = styled(Button).attrs({
  theme: "black",
  variant: "supplementary",
  iconLeft: <IconCross aria-hidden />,
})`
  white-space: nowrap;
  /* the table hides icons by default, override this behaviour */
  &&& svg {
    display: inline;
  }

  display: none !important;
  @media (width > ${breakpoints.s}) {
    display: inline-flex !important;
  }
`;


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

  // TODO on mobile the first three columns should be combined into a single row
  // is the formatting the same? or should we do some shinanigans with two different html elements and display:none?
  // actually no
  // First row (mock title): {date} - {day full}
  // second row: {icon} {day short} {time}
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
      transform: ({ status }: ReservationsTableElem) => {
        const icon = status === "rejected" ? <IconCross /> : <IconPen />;
        const type = status === "rejected" ? "error" : "neutral";
        if (status === "") {
          return ""
        }
        // TODO do we need the extra span?
        return (
          <span>
            <StatusLabel icon={icon} type={type}>
              {t(`application:view.reservationsTab.${status}`)}
            </StatusLabel>
          </span>
        );
      },
    },
    {
      key: "cancelButton",
      headerName: "",
      isSortable: false,
      transform: ({ pk }: ReservationsTableElem) => (
        <CancelButton onClick={() => handleCancel(pk)}>
          {t("common:cancel")}
        </CancelButton>
      ),
    },
  ];

  return (
    <TableWrapper>
      <Table variant="light" indexKey="date" rows={reservations} cols={cols} />
    </TableWrapper>
  );
}

function sectionToreservations(
  t: TFunction,
  section: ApplicationSectionT
): ReservationsTableElem[] {
  const recurringReservations = filterNonNullable(
    section.reservationUnitOptions.flatMap((ruo) =>
      ruo.allocatedTimeSlots.map((ats) => ats.recurringReservation)
    )
  );
  function getRejected(
    r: (typeof recurringReservations)[0]
  ): ReservationsTableElem[] {
    return r.rejectedOccurrences.map((res) => {
      const start = new Date(res.beginDatetime);
      const end = new Date(res.endDatetime);
      const dayOfWeek = t(`weekDayLong.${start.getDay()}`);
      const stime = formatTime(t, start);
      const etime = formatTime(t, end);
      const time = `${stime} - ${etime}`;
      return {
        date: start,
        dayOfWeek,
        time,
        reservationUnit: r.reservationUnit,
        status: "rejected",
        pk: 0,
      };
    });
  }

  function getReservations(
    r: (typeof recurringReservations)[0]
  ): ReservationsTableElem[] {
    return r.reservations.map((res) => {
      const start = new Date(res.begin);
      const end = new Date(res.end);
      const dayOfWeek = t(`weekDayLong.${start.getDay()}`);

      const beginMins = timeToMinutes(r.beginTime ?? "");
      const endMins = timeToMinutes(r.endTime ?? "");
      const beginMins2 = start.getHours() * 60 + start.getMinutes();
      const endMins2 = end.getHours() * 60 + end.getMinutes();
      const isModified = beginMins !== beginMins2 || endMins !== endMins2;
      const btime = formatMinutes(beginMins2);
      const etime = formatMinutes(endMins2);

      const status =
        res.state === ReservationStateChoice.Denied
          ? "rejected"
          : isModified
            ? "modified"
            : "";
      return {
        date: start,
        dayOfWeek,
        time: `${btime} - ${etime}`,
        reservationUnit: r.reservationUnit,
        status,
        pk: res.pk ?? 0,
      };
    });
  }

  return (
    recurringReservations
      .reduce<ReservationsTableElem[]>((acc, r) => {
        const rejected = getRejected(r);
        const expanded: ReservationsTableElem[] = getReservations(r);
        return [...acc, ...expanded, ...rejected];
      }, [])
      // NOTE have to sort here because we are combining two lists
      .sort((a, b) => a.date.getTime() - b.date.getTime())
  );
}

function sectionToReservationUnits(
  t: TFunction,
  section: ApplicationSectionT
): ReservationUnitTableElem[] {
  const reservationUnitsByDay = filterNonNullable(
    section.reservationUnitOptions
      .map((ruo) => ruo.allocatedTimeSlots.map((ats) => ats))
      .flat()
      .map((ats) => {
        const { recurringReservation: r, dayOfTheWeek } = ats;
        if (r == null) {
          return null;
        }
        const { reservationUnit } = r;
        const day = convertWeekday(dayOfTheWeek);
        return {
          reservationUnit,
          // NOTE monday first for sorting
          day,
          recurringReservation: r,
          time: formatApiTimeInterval(r),
        };
      })
  );
  reservationUnitsByDay.sort((a, b) => a.day - b.day);
  return reservationUnitsByDay.map((x) => {
    const { reservationUnit, day, time } = x;
    return {
      reservationUnit,
      // NOTE our translations are sunday first
      dateOfWeek: t(`weekDayLong.${fromMondayFirst(day)}`),
      // Pricing is not implemented. So all are empty
      price: "",
      time,
    };
  });
}

export function AllReservations({
  applicationSection,
}: {
  applicationSection: ApplicationSectionT;
}) {
  const { t } = useTranslation();
  const reservations = sectionToreservations(t, applicationSection);
  return (
    <>
      <H3 as="h2">{t("application:view.reservationsTab.reservationsTitle")}</H3>
      <ReservationsTable reservations={reservations} />
    </>
  );
}

export function ApplicationSection({
  applicationSection,
  application,
}: {
  applicationSection: ApplicationSectionT;
  application: Pick<ApplicationT, "pk">;
}) {
  const { t } = useTranslation();

  const reservationUnits: ReservationUnitTableElem[] =
    sectionToReservationUnits(t, applicationSection);
  const reservations = sectionToreservations(t, applicationSection)
    // NOTE we need to slice even if backend returns only 20 of each
    // because we want to keep the total at 20
    .slice(0, N_RESERVATIONS_TO_SHOW);

  return (
    <ListContainer>
      <H3>{t("application:view.reservationsTab.reservationUnitsTitle")}</H3>
      <ReservationUnitTable reservationUnits={reservationUnits} />
      <H3>{t("application:view.reservationsTab.reservationsTitle")}</H3>
      <ReservationsTable reservations={reservations} />
      <ButtonContainer>
        <ButtonLikeLink
          href={getApplicationSectionPath(
            applicationSection.pk,
            application.pk
          )}
          target="_blank"
          rel="noopener noreferrer"
        >
          {t("application:view.reservationsTab.showAllReservations")}
          <IconLinkExternal />
        </ButtonLikeLink>
        <Button
          variant="secondary"
          theme="black"
          key="cancel"
          onClick={() => {
            errorToast({ text: "Not implemented: cancel application" });
          }}
          iconRight={<IconCross />}
        >
          {t("application:view.reservationsTab.cancelApplication")}
        </Button>
      </ButtonContainer>
    </ListContainer>
  );
}
