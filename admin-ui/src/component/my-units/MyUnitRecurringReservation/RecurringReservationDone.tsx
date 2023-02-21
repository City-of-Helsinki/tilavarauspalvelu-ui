import React from "react";
import type { ErrorType } from "common/types/gql-types";
import { Button } from "hds-react/components/Button";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import { H1, H6 } from "common/src/common/typography";
import { ActionsWrapper } from "./commonStyling";
import { ReservationList } from "./ReservationsList";

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
  data: ReservationsMade;
};
const RecurringReservationDone = (props: RecurringSuccessProps) => {
  const failed = props.data.filter(({ error }) => error != null);

  const successes = props.data.filter(({ error }) => error == null);

  const { t } = useTranslation();

  const locPrefix = "MyUnits.RecurringReservation.Confirmation";

  return (
    <>
      <H1 $legacy>{t(`${locPrefix}.title`)}</H1>
      <InfoSection>
        {failed.length === 0
          ? t(`${locPrefix}.successInfo`)
          : t(`${locPrefix}.failureInfo`, {
              total: props.data.length,
              conflicts: failed.length,
            })}
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
          onClick={() => console.log("TODO should return to toimipiste")}
        >
          {t(`${locPrefix}.buttonToUnit`)}
        </Button>
        <Button
          variant="secondary"
          onClick={() => console.log("TODO should go to reservation?")}
        >
          {t(`${locPrefix}.buttonToReservation`)}
        </Button>
      </ActionsWrapper>
    </>
  );
};

export default RecurringReservationDone;
