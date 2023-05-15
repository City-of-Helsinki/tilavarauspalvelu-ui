import React from "react";
import styled from "styled-components";
import { Notification } from "hds-react";
import { breakpoints } from "common/src/common/style";

const Wrapper = styled.div`
  @media (min-width: ${breakpoints.xl}) {
    > section > div {
      max-width: calc(${breakpoints.xl} - (2 * var(--spacing-m)));
      margin: 0 auto;
    }
  }
`;

const NotificationWrapper = (props): JSX.Element => {
  const [isVisible, setIsVisible] = React.useState(true);

  return isVisible ? (
    <Wrapper>
      <Notification {...props} onClose={() => setIsVisible(false)} />
    </Wrapper>
  ) : null;
};

export default NotificationWrapper;
