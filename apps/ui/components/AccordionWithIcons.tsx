import { breakpoints } from "common";
import { Button, IconAngleDown, IconAngleUp, useAccordion } from "hds-react";
import { useTranslation } from "next-i18next";
import styled from "styled-components";

// There is only one use case for this so not testing other cases (or making it flexible)
const N_ICONS = 3;

type Props = {
  heading: string;
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
  initiallyOpen?: boolean;
  children: React.ReactNode;
  icons?: Array<{
    text: string;
    textPostfix?: string;
    icon: React.ReactNode;
  }>;
};

const Heading = styled.h2<{ as: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" }>`
  padding: 0;
  margin: 0;
`;

const ClosedAccordionWrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr auto auto;
  align-items: center;
  gap: var(--spacing-s);

  background-color: var(--color-black-10);
  padding: var(--spacing-s);
`;

const IconListWrapper = styled.div`
  display: grid;
  gap: var(--spacing-s);

  grid-row: subgrid;
  grid-column: 1 / -1;
  grid-template-columns: auto;
  @media (width > ${breakpoints.m}) {
    grid-column: unset;
    grid-template-columns: repeat(${N_ICONS}, auto);
  }
`;

const ButtonListWrapper = styled.div`
  display: block;
  gap: var(--spacing-s);
  align-self: center;
  align-items: end;

  @media (width > ${breakpoints.s}) {
    grid-column-start: -1;
    grid-row: 1 / span 2;
  }
  & > button:last-child > span {
    display: none;
  }
  @media (width > ${breakpoints.s}) {
    & > button:last-child > span {
      display: inline;
    }
  }
`;

const IconLabel = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);

  /* truncate the first child span while not touch the postfix */
  min-width: 0;
  max-width: 100%;
  span {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  span:last-child {
    flex-shrink: 0;
  }

  > svg {
    flex-shrink: 0;
  }
`;

const Content = styled.div<{ $open: boolean }>`
  display: ${({ $open }) => ($open ? "block" : "none")};
`;

/// Stylistically different from regular Accordion
/// Regular accordion uses the card title as a button to open/close the card
/// and has no options for other content inside the accordion.
/// Includes internal state
export function AccordionWithIcons({
  heading,
  headingLevel = 2,
  initiallyOpen = false,
  icons = [],
  children,
  ...rest
}: Props): JSX.Element {
  const { isOpen, openAccordion, closeAccordion } = useAccordion({
    initiallyOpen,
  });
  const { t } = useTranslation();

  const handleToggle = () => {
    if (isOpen) {
      closeAccordion();
    } else {
      openAccordion();
    }
  };

  return (
    <div {...rest}>
      <ClosedAccordionWrapper>
        <Heading as={`h${headingLevel}`}>{heading}</Heading>
        <IconListWrapper>
          {icons.map(({ text, icon, textPostfix }) => (
            <IconLabel key={text}>
              {icon}
              <span>{text}</span>
              <span>{textPostfix}</span>
            </IconLabel>
          ))}
        </IconListWrapper>
        <ButtonListWrapper>
          <Button
            key="toggle"
            onClick={handleToggle}
            variant="supplementary"
            theme="black"
            // we are hiding the text on mobile
            aria-label={isOpen ? t("common:close") : t("common:show")}
            iconRight={
              isOpen ? (
                <IconAngleUp aria-hidden />
              ) : (
                <IconAngleDown aria-hidden />
              )
            }
          >
            {isOpen ? t("common:close") : t("common:show")}
          </Button>
        </ButtonListWrapper>
      </ClosedAccordionWrapper>
      <Content $open={isOpen}>{children}</Content>
    </div>
  );
}