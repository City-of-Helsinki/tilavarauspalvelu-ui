import React, { useEffect } from 'react';

import { Button, IconAngleDown, IconAngleUp, useAccordion } from 'hds-react';
import styled from 'styled-components';

const AccordionElement = styled.div`
  border-bottom: 1px solid var(--color-black-60);
  padding-bottom: var(--spacing-xs);
  margin-bottom: var(--spacing-layout-xs);
`;

const HeadingButton = styled(Button)`
  width: 100%;
  padding: 0;
  margin: 0;
  border: 0;

  & span {
    color: var(--color-black-90);
    font-size: var(--fontsize-heading-m);
    font-family: var(--font-bold);
    padding: 0;
    margin: 0;
    margin-right: auto;
  }
`;

type Props = {
  heading?: string;
  open?: boolean;
  children: React.ReactNode;
  onToggle: () => void;
};
const Accordion = ({
  heading,
  open = false,
  children,
  onToggle,
}: Props): JSX.Element => {
  const { isOpen, openAccordion, closeAccordion } = useAccordion({
    initiallyOpen: open,
  });

  useEffect(() => {
    if (open !== isOpen) {
      if (open) {
        openAccordion();
      } else {
        closeAccordion();
      }
    }
  }, [closeAccordion, isOpen, open, openAccordion]);
  const icon = isOpen ? (
    <IconAngleUp aria-hidden />
  ) : (
    <IconAngleDown aria-hidden />
  );
  return (
    <AccordionElement>
      <HeadingButton
        variant="supplementary"
        iconRight={icon}
        onClick={onToggle}>
        {heading}
      </HeadingButton>
      {isOpen ? children : null}
    </AccordionElement>
  );
};

export default Accordion;
