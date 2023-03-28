import React from "react";
import type { ErrorType } from "common/types/gql-types";
import { Button } from "hds-react/components/Button";
import { useTranslation } from "react-i18next";
import { redirect, useNavigate, useLocation } from "react-router-dom";
import styled from "styled-components";
import { H1, H6 } from "common/src/common/typography";
import { ActionsWrapper } from "./commonStyling";
import { ReservationList } from "./ReservationsList";
import withMainMenu from "../../withMainMenu";

const InfoSection = styled.p`
  margin-bottom: 2rem;
  margin-top: 0;
`;

const StyledH6 = styled(H6)`
  margin-bottom: 0;
`;

export type ReservationMade = {
  reservationPk?: number;
  startTime: string;
  endTime: string;
  date: Date;
  error?: string | ErrorType[];
};

const RecurringReservationDone = () => {
  const location = useLocation();
  // FIXME don't cast; validate
  const props: ReservationMade[] = location.state;

  const failed = props.filter(({ error }) => error != null);

  const successes = props.filter(({ error }) => error == null);

  const { t } = useTranslation();

  const navigate = useNavigate();

  const locPrefix = "MyUnits.RecurringReservation.Confirmation";

  const id = successes
    .map((x) => x.reservationPk)
    // ?.filter((x): x is number => x != null)
    .find(() => true);

  // TODO holidays not implemented
  const holidays = 0;
  // TODO do we need special handling for no successes

  if (!props) {
    return <div>No data in completed reservation: Should not be here</div>;
  }

  return (
    <>
      <H1 $legacy>{t(`${locPrefix}.title`)}</H1>
      <InfoSection>
        <span>
          {failed.length === 0
            ? t(`${locPrefix}.successInfo`)
            : t(`${locPrefix}.failureInfo`, {
                total: props.length,
                conflicts: failed.length,
              })}
        </span>
        {holidays > 0 && (
          <span>
            {t(`${locPrefix}.holidayInfo`, {
              total: props.length,
              holidays: 0,
            })}
          </span>
        )}
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
        {/* FIXME figure out how to navigate one step backwards to units/:id, not to units/ */}
        <Button variant="secondary" onClick={() => navigate("..")}>
          {t(`${locPrefix}.buttonToUnit`)}
        </Button>
        {/* FIXME this button doesn't work at all to get the single reservation of the chain */}
        {id != null && (
          <Button
            variant="secondary"
            onClick={() => redirect(`/reservations/${id}`)}
          >
            {t(`${locPrefix}.buttonToReservation`)}
          </Button>
        )}
      </ActionsWrapper>
    </>
  );
};

export default withMainMenu(RecurringReservationDone);
