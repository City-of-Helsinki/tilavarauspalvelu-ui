import React from "react";
import NukaCarousel from "nuka-carousel";
import { IconAngleLeft, IconAngleRight } from "hds-react";
import styled from "styled-components";
import { breakpoints } from "common/src/common/style";
import { useTranslation } from "next-i18next";
import { MediumButton } from "@/styles/util";

type Props = {
  children: React.ReactNode[];
  slidesToShow?: number;
  slidesToScroll?: number;
  cellSpacing?: number;
  wrapAround?: boolean;
  hideCenterControls?: boolean;
  controlAriaLabel?: string;
  slideIndex?: number;
};

const Button = styled(MediumButton).attrs({
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

const SmallArrowButton = styled(Button)<{ $disabled: boolean }>`
  &&& {
    --color-bus: transparent;
    --color-bus-dark: transparent;
    --min-size: 0;

    background-color: transparent;
    margin: 0;
    padding: 0;

    ${({ $disabled }) =>
      $disabled
        ? `
    display: none !important;
  `
        : `
    &:hover {
      opacity: 0.7;
    }
    opacity: 1;
  `};

    svg {
      color: black;
      transform: scale(1.5);
    }
  }
`;

const StyledCarousel = styled(NukaCarousel)<{
  children: React.ReactNode;
}>`
  width: calc(100% + var(--spacing-xs) * 2) !important;
  height: fit-content !important;
  margin-right: calc(var(--spacing-xs) * -1);
  margin-left: calc(var(--spacing-xs) * -1);

  @media (min-width: ${breakpoints.m}) {
    width: 100% !important;
    height: fit-content !important;
    margin: 0 !important;
  }
`;

const CustomBottomControls = styled.div`
  position: absolute;
  bottom: 5px;
  left: 50%;
  transform: translateX(-50%);

  ul {
    position: relative;
    top: -10px;
    display: flex;
    margin: 0;
    padding: 0 var(--spacing-3-xs);
    list-style-type: none;
    background: rgba(0, 0, 0, 0.3);
    border-radius: var(--spacing-xs);

    li {
      button {
        cursor: pointer;
        background: transparent;
        border: none;
        fill: white;
        opacity: 0.7;
        &:hover {
          opacity: 1;
        }
      }
      &.active button {
        fill: var(--color-bus);
      }
    }
  }
`;

const Carousel = ({
  children,
  slidesToShow = 1,
  slidesToScroll = 1,
  cellSpacing = 1,
  wrapAround = true,
  hideCenterControls = false,
  controlAriaLabel = "",
  ...rest
}: Props): JSX.Element => {
  const { t } = useTranslation();

  const ButtonComponent = SmallArrowButton;

  return (
    <StyledCarousel
      renderCenterLeftControls={({ previousSlide, previousDisabled }) => (
        <ButtonComponent
          $disabled={previousDisabled}
          type="button"
          onClick={previousSlide}
          aria-label={t("common:prev")}
          data-testid="slot-carousel-button"
        >
          <IconAngleLeft />
        </ButtonComponent>
      )}
      renderCenterRightControls={({ nextSlide, nextDisabled }) => (
        <ButtonComponent
          $disabled={nextDisabled}
          type="button"
          onClick={nextSlide}
          aria-label={t("common:next")}
          data-testid="slot-carousel-button"
        >
          <IconAngleRight />
        </ButtonComponent>
      )}
      renderBottomCenterControls={({ slideCount, currentSlide, goToSlide }) => (
        <CustomBottomControls>
          <ul>
            {[...Array(slideCount)].map((key, idx) => (
              <li
                key={key}
                className={currentSlide === idx ? "active" : undefined}
              >
                <button
                  type="button"
                  aria-label={`${controlAriaLabel} #${idx + 1}`}
                  onClick={() => goToSlide(idx)}
                >
                  <svg width="12" height="12">
                    <circle cx="5" cy="5" r="5" />
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        </CustomBottomControls>
      )}
      wrapAround={wrapAround}
      slidesToShow={slidesToShow}
      slidesToScroll={slidesToScroll}
      cellSpacing={cellSpacing}
      withoutControls={children?.length <= slidesToShow}
      {...(hideCenterControls && {
        renderBottomCenterControls: () => null,
      })}
      dragging={children?.length > slidesToShow}
      {...rest}
    >
      {children}
    </StyledCarousel>
  );
};

export default Carousel;
