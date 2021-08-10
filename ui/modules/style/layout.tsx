import styled from "styled-components";
import Container from "../../components/common/Container";
import { breakpoint } from "../style";

export const NarrowCenteredContainer = styled(Container)`
  @media (min-width: ${breakpoint.m}) {
    max-width: 880px;
    padding-right: 130px;
  }
`;
