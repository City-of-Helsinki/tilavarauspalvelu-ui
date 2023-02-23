import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useTranslation } from "react-i18next";

const Wrapper = styled.div`
  display: flex;
  direction: column;
  gap: var(--spacing-s);
`;

const Day = styled.div`
  background-color: var(--color-black-5);
  border: 2px solid var(--color-black-5);
  color: var(--color-black);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  font-size: var(--fontsize-body-s);

  &:hover {
    cursor: pointer;
    background-color: var(--color-black-50);
    border: 2px solid var(--color-black-80);
    color: var(--color-white);
  }

  &.active {
    background-color: var(--color-black-5);
    border: 2px solid var(--color-bus);
    color: var(--color-bus);
  }
`;

// Custom copy of HDS error field component which isn't exported
const ErrorText = styled.div`
  position: relative;
  color: var(--helper-color-invalid);
  padding-left: calc(var(--icon-size) + var(--spacing-2-xs));
  display: flex;
  line-height: var(--lineheight-l);
  font-size: var(--fontsize-body-m);
  margin-top: var(--spacing-3-xs);
  white-space: pre-line;

  & svg {
    margin-right: 0.5rem;
    max-width: 24px;
    max-height: 24px;
  }
`;

const WarningIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
    <g fill="none" fillRule="evenodd">
      <path d="M0 0h24v24H0z" />
      <path
        fill="currentColor"
        d="M12 3a9 9 0 110 18 9 9 0 010-18zm1 13v2h-2v-2h2zm0-10v8h-2V6h2z"
      />
    </g>
  </svg>
);

const weekdays = [0, 1, 2, 3, 4, 5, 6];

type Props = {
  value: number[];
  onChange: (value: number[]) => void;
  errorText?: string;
};

const WeekdaysSelector = ({ value = [], onChange, errorText }: Props) => {
  const { t } = useTranslation();
  const [selectedDays, setSelectedDays] = useState<number[]>(value);

  useEffect(() => {
    if (onChange) {
      onChange(selectedDays);
    }
  }, [selectedDays, onChange]);

  const handleDayToggle = (day: number) => {
    if (selectedDays.includes(day)) {
      setSelectedDays((prev) => [...prev.filter((d) => d !== day)]);
    } else {
      setSelectedDays((prev) => [...prev, day]);
    }
  };

  // NOTE This is not accessible (even with the role="checkbox")
  return (
    <div>
      <Wrapper>
        {weekdays.map((weekday) => (
          <Day
            key={`weekday-${weekday}`}
            onClick={() => handleDayToggle(weekday)}
            className={value.includes(weekday) ? "active" : ""}
            role="checkbox"
          >
            {t(`dayShort.${weekday}`)}
          </Day>
        ))}
      </Wrapper>
      {errorText && (
        <ErrorText>
          <WarningIcon /> {errorText}
        </ErrorText>
      )}
    </div>
  );
};

export { WeekdaysSelector };
