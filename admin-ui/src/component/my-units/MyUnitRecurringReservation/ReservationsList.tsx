import React from "react";
import { toUIDate } from "common/src/common/util";
import styled from "styled-components";
import { useTranslation } from "react-i18next";
import { ErrorType } from "common/types/gql-types";
import { Button, IconArrowUndo, IconCrossCircle } from "hds-react";

type CallbackButton = {
  callback: () => void;
  type: "remove" | "restore";
};
type NewReservationListItem = {
  date: Date;
  startTime: string;
  endTime: string;
  // TODO remove the ErrorType[] from the item (convert to string before calling this)
  error?: string | ErrorType[];
  reservationPk?: number;
  button?: CallbackButton;
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
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem 2rem;
  white-space: nowrap;
`;

const TextWrapper = styled.span<{ $failed: boolean }>`
  text-transform: capitalize;
  flex-grow: 1;
  gap: 0.5rem 2rem;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(11rem, 1fr));
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

const Btn = styled(Button)``;

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
            </TextWrapper>
            {item.button != null &&
              (item.button.type === "remove" ? (
                <Btn variant="supplementary" iconRight={<IconCrossCircle />}>
                  {t("common.remove")}
                </Btn>
              ) : (
                <Btn variant="supplementary" iconRight={<IconArrowUndo />}>
                  {t("common.restore")}
                </Btn>
              ))}
          </StyledListItem>
        ))}
      </StyledList>
    </ListWrapper>
  );
};

export default ReservationList;
export type { NewReservationListItem };
