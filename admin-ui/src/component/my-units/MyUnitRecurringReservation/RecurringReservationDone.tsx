import React from "react";
import type { ErrorType } from "common/types/gql-types";
import { Button } from "hds-react/components/Button";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import { H1, H6 } from "common/src/common/typography";
import { ActionsWrapper } from "./commonStyling";
import { ReservationList } from "./ReservationsList";
import { useNotification } from "../../../context/NotificationContext";

const InfoSection = styled.p`
  margin-bottom: 2rem;
  margin-top: 0;
`;

const StyledH6 = styled(H6)`
  margin-bottom: 0;
`;

export type ReservationsMade = Array<{
  reservationPk?: number;
  startTime: string;
  endTime: string;
  date: Date;
  error?: string | ErrorType[];
}>;

type RecurringSuccessProps = {
  reservation: ReservationsMade;
};
const RecurringReservationDone = (props: RecurringSuccessProps) => {
  const failed = props.reservation.filter(({ error }) => error != null);

  const successes = props.reservation.filter(({ error }) => error == null);

  const { t } = useTranslation();
  const { notifyError } = useNotification();

  const locPrefix = "MyUnits.RecurringReservation.Confirmation";

  // TODO holidays not implemented (zero holidays should not printed etc.)
  // TODO do we need special handling for 1 / X
  return (
    <>
      <H1 $legacy>{t(`${locPrefix}.title`)}</H1>
      <InfoSection>
        <span>
          {failed.length === 0
            ? t(`${locPrefix}.successInfo`)
            : t(`${locPrefix}.failureInfo`, {
                total: props.reservation.length,
                conflicts: failed.length,
              })}
        </span>
        <span>
          {t(`${locPrefix}.holidayInfo`, {
            total: props.reservation.length,
            holidays: 0,
          })}
        </span>
      </InfoSection>
      {failed.length > 0 && (
        <InfoSection>
          {t(`${locPrefix}.failureInfoSecondParagraph`)}
        </InfoSection>
      )}
      {failed.length > 0 && (
        <StyledH6 as="h2">
          {t(`${locPrefix}.failedTitle`)} ({failed.length})
        </StyledH6>
      )}
      {/* TODO add error type e.g. "Aika ei saataville" */}
      <ReservationList items={failed} />
      <StyledH6 as="h2">
        {t(`${locPrefix}.successTitle`)} ({successes.length})
      </StyledH6>
      <ReservationList items={successes} />
      <ActionsWrapper>
        <Button
          variant="secondary"
          onClick={() => notifyError("TODO implement return to toimipiste")}
        >
          {t(`${locPrefix}.buttonToUnit`)}
        </Button>
        <Button
          variant="secondary"
          onClick={() => notifyError("TODO implement go to reservation made")}
        >
          {t(`${locPrefix}.buttonToReservation`)}
        </Button>
      </ActionsWrapper>
    </>
  );
};

export default RecurringReservationDone;
