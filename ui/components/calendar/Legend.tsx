import React from "react";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import { breakpoint } from "../../modules/style";

type Props = {
  items?: LegendItem[];
};

type LegendItem = {
  title: string;
  color: string;
};

const Wrapper = styled.div`
  display: flex;
  justify-content: space-between;
  max-width: 400px;
  margin-bottom: var(--spacing-l);

  @media (min-width: ${breakpoint.m}) {
    margin-left: var(--spacing-layout-xl);
  }
`;

const LegendItem = styled.div<{ $color: string }>`
  &:before {
    content: "";
    display: block;
    background-color: ${({ $color }) => $color};
    border: 1px solid var(--color-black-40);
    width: 24px;
    height: 24px;
  }

  display: flex;
  align-items: center;
  flex-direction: column;
  column-gap: var(--spacing-m);
  gap: var(--spacing-s);
`;

const LegendTitle = styled.div`
  display: block;
  white-space: nowrap;
`;

const defaultItems: LegendItem[] = [
  {
    title: "free",
    color: "var(--color-white)",
  },
  {
    title: "unavailable",
    color: "var(--color-black-10)",
  },
  {
    title: "busy",
    color: "var(--color-brick-dark)",
  },
];

const Legend = ({ items = defaultItems }: Props): JSX.Element => {
  const { t } = useTranslation();

  return (
    <Wrapper>
      {items.map(({ title, color }) => (
        <LegendItem key={title} $color={color}>
          <LegendTitle>{t(`reservationCalendar:legend.${title}`)}</LegendTitle>
        </LegendItem>
      ))}
    </Wrapper>
  );
};
export default Legend;
