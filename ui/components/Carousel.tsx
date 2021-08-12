import React from "react";
import NukaCarousel from "nuka-carousel";
import { Button as HDSButton, IconAngleLeft, IconAngleRight } from "hds-react";
import styled from "styled-components";
import { breakpoint } from "../modules/style";

type Props = {
  children: React.ReactNode[];
};

const Button = styled(HDSButton).attrs({
  style: {
    "--color-bus": "rgba(0,0,0,0.4)",
    "--color-bus-dark": "rgba(0,0,0,0.4)",
    "--border-color": "rgba(0,0,0,0.4)",
    "--border-width": "1px",
    "--min-size": "40px",
    "--outline-gutter": "-2px",
    "--outline-width": "2px",
  } as React.CSSProperties,
})`
  && {
    & > span {
      padding: 0;
    }

    padding: 0;
    border-color: transparent !important;
  }

  button {
    padding: 0;
  }
`;

const StyledCarousel = styled(NukaCarousel)`
  width: calc(100% + var(--spacing-xs) * 2) !important;
  margin-right: calc(var(--spacing-xs) * -1);
  margin-left: calc(var(--spacing-xs) * -1);

  .slider-control-bottomcenter {
    position: relative !important;
    bottom: unset !important;
    left: unset !important;
    transform: unset !important;

    ul {
      top: var(--spacing-m) !important;
      gap: var(--spacing-s);
      flex-wrap: wrap;
      width: 100%;
      justify-content: center;
    }

    .paging-item {
      button {
        svg {
          transform: scale(1.9);
          border: 1px solid var(--color-black-50);
          border-radius: 50%;
          fill: var(--color-black-20);
        }
      }
    }
  }

  @media (min-width: ${breakpoint.m}) {
    width: 100% !important;
    margin: 0 !important;
  }
`;

const Carousel = ({ children, ...rest }: Props): JSX.Element => {
  return (
    <StyledCarousel
      renderCenterLeftControls={({ previousSlide }) => (
        <Button type="button" onClick={previousSlide}>
          <IconAngleLeft />
        </Button>
      )}
      renderCenterRightControls={({ nextSlide }) => (
        <Button type="button" onClick={nextSlide}>
          <IconAngleRight />
        </Button>
      )}
      wrapAround
      heightMode="max"
      {...rest}
    >
      {children}
    </StyledCarousel>
  );
};

export default Carousel;
