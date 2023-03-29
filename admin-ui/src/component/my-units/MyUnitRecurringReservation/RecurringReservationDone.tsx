import React from "react";
import type { ErrorType } from "common/types/gql-types";
import { Button } from "hds-react/components/Button";
import { useTranslation } from "react-i18next";
import { useNavigate, useLocation } from "react-router-dom";
import styled from "styled-components";
import { Container } from "hds-react";
import { H1, H6 } from "common/src/common/typography";
import { ActionsWrapper } from "./commonStyling";
import ReservationList from "./ReservationsList";
import withMainMenu from "../../withMainMenu";

const InfoSection = styled.p`
  margin-bottom: 2rem;
  margin-top: 0;
`;

const StyledH6 = styled(H6)`
  margin-bottom: 0;
`;

const StyledContainer = styled(Container)`
  margin-top: var(--spacing-2-xl);
  @media (min-width: 768px) {
    padding-left: var(--spacing-2-xl) !important;
    padding-right: var(--spacing-2-xl) !important;
  }
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

  const reservationId = successes.map((x) => x.reservationPk).find(() => true);

  // TODO holidays not implemented
  const holidays = 0;

  const handleGoToReservation = (id: number) => {
    const url = `/reservations/${id}`;
    navigate(url);
  };

  if (!props) {
    return <div>No data in completed reservation: Should not be here</div>;
  }

  // TODO do we need special handling for no successes
  return (
    <StyledContainer>
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
      <ReservationList items={failed} />
      <StyledH6 as="h2">
        {t(`${locPrefix}.successTitle`)} ({successes.length})
      </StyledH6>
      <ReservationList items={successes} />
      <ActionsWrapper>
        {/* TODO The back functionality is overly complex because the route hierarchy is weird */}
        <Button
          variant="secondary"
          onClick={() => navigate("../..", { relative: "path" })}
        >
          {t(`${locPrefix}.buttonToUnit`)}
        </Button>
        {reservationId != null && (
          <Button
            variant="secondary"
            onClick={() => handleGoToReservation(reservationId)}
          >
            {t(`${locPrefix}.buttonToReservation`)}
          </Button>
        )}
      </ActionsWrapper>
    </StyledContainer>
  );
};

export default withMainMenu(RecurringReservationDone);
