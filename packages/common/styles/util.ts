import { LoadingSpinner } from "hds-react";
import styled, { css } from "styled-components";

// TODO rename this file after moving common styled components here

export const NoWrap = styled.span`
  white-space: nowrap;
`;

export const autoGridCss = css`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(14rem, 1fr));
  align-items: baseline;
  gap: var(--spacing-m);
`;

export const AutoGrid = styled.div<{
  $minWidth?: string;
  $largeGap?: boolean;
  $alignCenter?: boolean;
}>`
  display: grid;
  grid-template-columns: repeat(
    auto-fill,
    minmax(
      ${({ $minWidth }) =>
        $minWidth && $minWidth?.length > 0 ? $minWidth : "16rem"},
      1fr
    )
  );
  align-items: ${({ $alignCenter }) => ($alignCenter ? "center" : "baseline")};
  gap: ${({ $largeGap }) =>
      $largeGap ? " var(--spacing-xl)" : "var(--spacing-m)"}
    var(--spacing-m);
`;

export const FullRow = styled.div`
  grid-column: 1 / -1;
`;

// TODO should allow for switching to smaller gap on mobile (scale down)
export const Flex = styled.div<{
  $direction?: "row" | "column";
  $gap?: "2-xs" | "xs" | "s" | "m" | "l" | "xl" | "2-xl";
  $justify?:
    | "center"
    | "flex-start"
    | "flex-end"
    | "space-between"
    | "space-around"
    | "space-evenly";
  $align?: "center" | "flex-start" | "flex-end" | "baseline" | "stretch";
  $wrap?: "wrap" | "nowrap";
  $width?: "full" | "auto";
}>`
  display: flex;
  flex-wrap: ${({ $wrap }) => $wrap ?? "nowrap"};
  gap: ${({ $gap }) =>
    $gap != null ? `var(--spacing-${$gap})` : "var(--spacing-m)"};
  flex-direction: ${({ $direction }) =>
    $direction === "row" ? "row" : "column"};
  justify-content: ${({ $justify }) => $justify ?? "initial"};
  align-items: ${({ $align }) => $align ?? "initial"};
`;

// TODO refactor this to have parameters for gap
// use grid instead of flex
// two buttons should be side-by-side on mobile (100% width total)
// three buttons need a 1, 1/2, 1/2 layout on mobile (100% width total, two rows)
// four buttons need 1/2, 1/2, 1/2, 1/2 layout on mobile (100% width total, two rows)
export const ButtonContainer = styled.div<{
  $noMargin?: boolean;
  $justify?:
    | "center"
    | "flex-start"
    | "flex-end"
    | "space-between"
    | "space-around"
    | "space-evenly";
}>`
  display: inline-flex;
  flex-wrap: wrap;
  gap: var(--spacing-2-xs);
  width: 100%;
  margin-bottom: ${({ $noMargin }) => ($noMargin ? "0" : "var(--spacing-s);")};
  justify-content: ${({ $justify }) => $justify ?? "flex-end"};
`;

export const CenterSpinner = styled(LoadingSpinner)`
  margin: 0 auto var(--spacing-2-xl) auto;
`;

/// Tab causes horizontal overflow without this
/// we use grids primarily and components inside grid without max-width overflow.
export const TabWrapper = styled.div`
  max-width: calc(100vw - 2 * var(--tilavaraus-page-margin));
`;
