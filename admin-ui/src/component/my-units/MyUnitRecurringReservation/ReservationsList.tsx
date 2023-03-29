import React from "react";
import { toUIDate } from "common/src/common/util";
import styled from "styled-components";
import { useTranslation } from "react-i18next";
import { ErrorType } from "common/types/gql-types";

type NewReservationListItem = {
  date: Date;
  startTime: string;
  endTime: string;
  error?: string | ErrorType[];
  reservationPk?: number;
};

type Props = {
  items: NewReservationListItem[];
};

// In the UI spec parent container max height is 22rem, but overflow forces us to define child max-height
const ListWrapper = styled.div`
  max-height: 18.5rem;
  overflow-y: auto;
  overflow-x: hidden;
`;

const StyledList = styled.ul`
  list-style-type: none;
  border: none;
  padding: 0 var(--spacing-s);
`;

const StyledListItem = styled.li`
  padding: var(--spacing-s) 0;
  border-bottom: 1px solid var(--color-black-20);
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(11.5rem, 1fr));
  align-items: center;
  gap: 0.5rem 2rem;
`;

const TextWrapper = styled.span<{ $failed: boolean }>`
  text-transform: capitalize;
  color: ${($failed) =>
    $failed ? "var(--color-black-60)" : "var(--color-black)"};
`;

const ErrorLabel = styled.div`
  & > span {
    color: var(--color-black);
    background: var(--color-metro-medium-light);
    padding: 0.5rem 0.5rem;
  }
`;

const stripTimeZeros = (time: string) =>
  time.substring(0, 1) === "0" ? time.substring(1) : time;

const ReservationList = ({ items }: Props) => {
  const { t } = useTranslation();

  if (!items.length) return null;

  return (
    <ListWrapper>
      <StyledList>
        {items.map((item) => (
          <StyledListItem
            key={`${item.date}-${item.startTime}-${item.endTime}`}
          >
            <TextWrapper $failed={item.error != null}>
              {`${toUIDate(item.date, "cccccc d.M.yyyy")}, ${stripTimeZeros(
                item.startTime
              )}-${stripTimeZeros(item.endTime)}`}
            </TextWrapper>
            {item.error && (
              <ErrorLabel>
                <span>
                  {t(
                    `MyUnits.RecurringReservation.Confirmation.failureMessages.${String(
                      item.error
                    )}`
                  )}
                </span>
              </ErrorLabel>
            )}
          </StyledListItem>
        ))}
      </StyledList>
    </ListWrapper>
  );
};

export default ReservationList;
export type { NewReservationListItem };
