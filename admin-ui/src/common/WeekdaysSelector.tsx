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

const weekdays = [0, 1, 2, 3, 4, 5, 6];

type Props = {
  value: number[];
  onChange: (value: number[]) => void;
};

const WeekdaysSelector = ({ value = [], onChange }: Props) => {
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

  return (
    <Wrapper>
      {weekdays.map((weekday) => (
        <Day
          key={`weekday-${weekday}`}
          onClick={() => handleDayToggle(weekday)}
          className={value.includes(weekday) ? "active" : ""}
        >
          {t(`dayShort.${weekday}`)}
        </Day>
      ))}
    </Wrapper>
  );
};

export { WeekdaysSelector };
