import React from "react";
import { Tag } from "hds-react";
import { useTranslation } from "react-i18next";
import { ReservationUnitState } from "common/types/gql-types";

interface IProps {
  state: ReservationUnitState;
}

export const statusColor = (state: ReservationUnitState): string => {
  switch (state) {
    // TODO missing archived colour
    case ReservationUnitState.Draft:
      return "var(--color-silver-light)";
    case ReservationUnitState.Published:
      return "var(--color-success-light)";
    // TODO check the tag colours for the Hiding and Period
    case ReservationUnitState.ScheduledHiding:
    case ReservationUnitState.ScheduledPeriod:
      return "var(--color-engel-light)";
    case ReservationUnitState.ScheduledPublishing:
      return "var(--color-gold-medium-light)";
    default:
      return "white";
  }
};

function ReservationUnitStateTag({ state }: IProps): JSX.Element {
  const { t } = useTranslation();
  return (
    <Tag
      theme={{
        "--tag-background": statusColor(state),
      }}
    >
      <span style={{ whiteSpace: "nowrap" }}>
        {t(`ReservationUnits.state.${state}`)}
      </span>
    </Tag>
  );
}

export default ReservationUnitStateTag;
