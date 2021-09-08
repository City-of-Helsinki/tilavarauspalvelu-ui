import React from "react";
import NukaCarousel from "nuka-carousel";
import { Button as HDSButton, IconAngleLeft, IconAngleRight } from "hds-react";
import styled from "styled-components";
import { breakpoint } from "../modules/style";

type Props = {
  children: React.ReactNode[];
  slidesToShow?: number;
  slidesToScroll?: number;
  cellSpacing?: number;
  wrapAround?: boolean;
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

const StyledCarousel = styled(NukaCarousel)<{ $showCenterControls: boolean }>`
  width: calc(100% + var(--spacing-xs) * 2) !important;
  margin-right: calc(var(--spacing-xs) * -1);
  margin-left: calc(var(--spacing-xs) * -1);

  .slider-control-bottomcenter {
    ${({ $showCenterControls }) => !$showCenterControls && "display: none;"}
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

const VerticalButton = styled(Button)<{ $disabled: boolean }>`
  ${({ $disabled }) =>
    $disabled
      ? `
    display: none !important;
  `
      : `
    &:hover {
      opacity: 1;
    }

    opacity: 0.5;
  `};
`;

const Carousel = ({
  children,
  slidesToShow = 1,
  slidesToScroll = 1,
  cellSpacing = 1,
  wrapAround = true,
  ...rest
}: Props): JSX.Element => {
  return (
    <StyledCarousel
      renderCenterLeftControls={({ currentSlide, previousSlide }) => {
        const isDisabled = !wrapAround && currentSlide === 0;
        return (
          <VerticalButton
            $disabled={isDisabled}
            type="button"
            onClick={previousSlide}
          >
            <IconAngleLeft />
          </VerticalButton>
        );
      }}
      renderCenterRightControls={({
        currentSlide,
        slidesToShow: sts,
        slideCount,
        nextSlide,
      }) => {
        const isDisabled = !wrapAround && currentSlide + sts >= slideCount;
        return (
          <VerticalButton
            $disabled={isDisabled}
            type="button"
            onClick={nextSlide}
          >
            <IconAngleRight />
          </VerticalButton>
        );
      }}
      wrapAround={wrapAround}
      heightMode="max"
      slidesToShow={slidesToShow}
      slidesToScroll={slidesToScroll}
      cellSpacing={cellSpacing}
      $showCenterControls={children?.length > slidesToShow}
      {...rest}
    >
      {children}
    </StyledCarousel>
  );
};

export default Carousel;
