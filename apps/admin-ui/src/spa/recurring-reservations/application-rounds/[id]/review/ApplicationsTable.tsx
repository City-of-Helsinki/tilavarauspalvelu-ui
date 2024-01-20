import React from "react";
import { useTranslation } from "react-i18next";
import { memoize, orderBy, uniqBy } from "lodash";
import { TFunction } from "i18next";
import { IconLinkExternal } from "hds-react";
import type {
  ApplicationNode,
  ApplicationStatusChoice,
} from "common/types/gql-types";
import { publicUrl } from "@/common/const";
import { applicationDetailsUrl } from "@/common/urls";
import { truncate } from "@/helpers";
import { getApplicantName } from "@modules/application";
import { CustomTable, ExternalTableLink } from "@/component/Table";
import { ApplicationStatusCell } from "./StatusCell";

const unitsTruncateLen = 23;
const applicantTruncateLen = 20;

type UnitType = {
  pk: number;
  name: string;
};
type ApplicationView = {
  pk: number;
  eventPk: number;
  key: string;
  applicantName?: string;
  name: string;
  applicantType: string;
  units: UnitType[];
  applicationCount: string;
  status?: ApplicationStatusChoice;
  statusView: JSX.Element;
  statusType?: ApplicationStatusChoice;
};

const COLS = [
  {
    headerTKey: "Application.headings.id",
    isSortable: true,
    key: "pk",
    transform: ({ pk }: ApplicationView) => String(pk),
  },
  {
    headerTKey: "Application.headings.customer",
    isSortable: true,
    key: "applicant",
    transform: ({ applicantName, pk }: ApplicationView) =>
      pk ? (
        <ExternalTableLink
          href={`${publicUrl}${applicationDetailsUrl(pk)}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          {truncate(applicantName ?? "-", applicantTruncateLen)}
          <IconLinkExternal size="xs" aria-hidden />
        </ExternalTableLink>
      ) : (
        <span>{truncate(applicantName ?? "-", applicantTruncateLen)}</span>
      ),
  },
  {
    headerTKey: "Application.applicantType",
    isSortable: true,
    key: "applicantType",
  },
  {
    headerTKey: "Application.headings.unit",
    isSortable: true,
    key: "preferredUnitNameFi",
    transform: ({ units }: ApplicationView) => {
      const allUnits = units.map((u) => u.name).join(", ");

      return (
        <span title={allUnits}>
          {truncate(
            units
              .filter((_, i) => i < 2)
              .map((u) => u.name)
              .join(", "),
            unitsTruncateLen
          )}
        </span>
      );
    },
  },
  {
    headerTKey: "Application.headings.applicationCount",
    key: "applicationCountSort",
    transform: ({ applicationCount }: ApplicationView) => applicationCount,
  },
  {
    headerTKey: "Application.headings.phase",
    isSortable: true,
    key: "application_status",
    transform: ({ statusView }: ApplicationView) => statusView,
  },
];

const getColConfig = (t: TFunction) =>
  COLS.map(({ headerTKey, ...col }) => ({
    ...col,
    headerName: t(headerTKey),
  }));
export const SORT_KEYS = COLS.filter((c) => c.isSortable).map((c) => c.key);

const appMapper = (app: ApplicationNode, t: TFunction): ApplicationView => {
  const applicationEvents = (app.applicationEvents || [])
    .flatMap((ae) => ae?.eventReservationUnits)
    .flatMap((eru) => ({
      ...eru?.reservationUnit?.unit,
      priority: eru?.preferredOrder ?? 0,
    }));
  const units = orderBy(uniqBy(applicationEvents, "pk"), "priority", "asc").map(
    (u) => ({ pk: u.pk ?? 0, name: u.nameFi ?? "-" })
  );

  const name = app.applicationEvents?.find(() => true)?.name || "-";
  const firstEvent = app.applicationEvents?.find(() => true);
  const eventPk = firstEvent?.pk ?? 0;

  const status = app.status ?? undefined;

  const applicantName = getApplicantName(app);

  return {
    key: `${app.pk}-${eventPk || "-"} `,
    pk: app.pk ?? 0,
    eventPk,
    applicantName,
    applicantType: app.applicantType
      ? t(`Application.applicantTypes.${app.applicantType}`)
      : "",
    units,
    name,
    status,
    statusView: <ApplicationStatusCell status={status} />,
    statusType: app.status ?? undefined,
    applicationCount: "NA",
  };
};

type ApplicationsTableProps = {
  sort: string | null;
  sortChanged: (field: string) => void;
  applications: ApplicationNode[];
  isLoading?: boolean;
};

export function ApplicationsTable({
  sort,
  sortChanged: onSortChanged,
  applications,
  isLoading,
}: ApplicationsTableProps): JSX.Element {
  const { t } = useTranslation();

  const cols = memoize(() => getColConfig(t))();
  const rows = applications.map((app) => appMapper(app, t));

  if (rows.length === 0) {
    const name = t("Application.emptyFilterPageName");
    return <div>{t("common.noFilteredResults", { name })}</div>;
  }

  const sortField = sort?.replace(/-/, "") ?? "";
  const sortDirection = sort?.startsWith("-") ? "desc" : "asc";
  return (
    <CustomTable
      setSort={onSortChanged}
      indexKey="pk"
      isLoading={isLoading}
      rows={rows}
      cols={cols}
      // TODO refactor maybe so we can use a string, -field for desc, field for asc
      initialSortingColumnKey={sortField}
      initialSortingOrder={sortDirection}
    />
  );
}
