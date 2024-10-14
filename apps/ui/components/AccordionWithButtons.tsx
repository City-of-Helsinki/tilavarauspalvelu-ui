import { breakpoints } from "common";
import { Button, IconAngleDown, IconAngleUp, useAccordion } from "hds-react";
import { useTranslation } from "next-i18next";
import styled from "styled-components";

// There is only one use case for this so not testing other cases (or making it flexible)
const N_ICONS = 3;

type Props = {
  heading: string;
  headingLevel?: number;
  initiallyOpen?: boolean;
  children: React.ReactNode;
  icons?: Array<{
    text: string;
    icon: React.ReactNode;
  }>;
};

const responsiveBreakpoint = breakpoints.l;
// TODO make the level configurable
const Heading = styled.h2`
  padding: 0;
  margin: 0;
`;

// TODO rename this
const HeadingWrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr auto auto;
  align-items: center;
  gap: var(--spacing-s);

  background-color: var(--color-black-10);
  padding: var(--spacing-s);
`;

// TODO subgrid
const IconListWrapper = styled.div`
  display: grid;
  gap: var(--spacing-s);

  grid-row: subgrid;
  grid-column: 1 / -1;
  grid-template-columns: auto;
  @media (width > ${responsiveBreakpoint}) {
    grid-column: unset;
    grid-template-columns: repeat(${N_ICONS}, auto);
  }
`;

// TODO can simplify this by removing the other buttons
const ButtonListWrapper = styled.div`
  display: block;
  gap: var(--spacing-s);
  align-self: center;
  align-items: end;

  @media (width > ${responsiveBreakpoint}) {
    grid-column-start: -1;
    grid-row: 1 / span 2;
  }

  /* Hide all but the close button on mobile */
  & > button:not(:last-child) {
    display: none;
  }
  /* TODO on mobile these need to have an aria-label in the icon (on desktop not)
   * label-by? maybe */
  & > button:last-child > span {
    display: none;
  }
  @media (width > ${responsiveBreakpoint}) {
    && > button {
      display: inline-flex;
      &:last-child {
        /* FIXME this is incorrect have to check what hds uses by default */
        display: inline-flex;
        & > span {
          display: inline;
        }
      }
    }
  }
`;

const Wrapper = styled.div``;

const IconLabel = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  > svg {
    flex-shrink: 0;
  }
`;

const Content = styled.div<{ $open: boolean }>`
  display: ${({ $open }) => ($open ? "block" : "none")};
`;

/// Stylistically very different from regular Accordion
/// Regular accordion uses the card title as a button to open/close the card
/// This has multiple buttons, so the title can't be used as a button
/// Includes internal state
/// TODO remove the button options and rename this
export function AccordionWithButtons({
  heading,
  headingLevel,
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
    <Wrapper {...rest}>
      <HeadingWrapper>
        <Heading>{heading}</Heading>
        <IconListWrapper>
          {icons.map(({ text, icon }) => (
            <IconLabel key={text}>
              {icon}
              <span>{text}</span>
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
              isOpen ? <IconAngleUp aria-hidden /> : <IconAngleDown aria-hidden />
            }
          >
            {isOpen ? t("common:close") : t("common:show")}
        </Button>
      </ButtonListWrapper>
      </HeadingWrapper>
      <Content $open={isOpen}>{children}</Content>
    </Wrapper>
  );
}
