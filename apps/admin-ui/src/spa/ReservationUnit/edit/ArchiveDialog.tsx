import React from "react";
import { useTranslation } from "react-i18next";
import { ReservationUnitByPkType } from "common/types/gql-types";
import { GenericDialog } from "./GenericDialog";

export function ArchiveDialog({
  reservationUnit,
  onClose,
  onAccept,
}: {
  reservationUnit: ReservationUnitByPkType;
  onClose: () => void;
  onAccept: () => void;
}): JSX.Element {
  const { t } = useTranslation();

  return (
    <GenericDialog
      onAccept={onAccept}
      onClose={onClose}
      description={t("ArchiveReservationUnitDialog.description")}
      title={t("ArchiveReservationUnitDialog.title", {
        name: reservationUnit.nameFi as string,
      })}
      acceptLabel={t("ArchiveReservationUnitDialog.archive")}
    />
  );
}
