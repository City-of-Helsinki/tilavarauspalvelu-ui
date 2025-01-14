import React, { useState } from "react";
import styled from "styled-components";
import { Notification, NotificationProps } from "hds-react";

type NotificationPropsWithCentering = NotificationProps & {
  centered?: boolean;
};

const StyledNotification = styled(Notification)<{ $centerContent?: boolean }>`
  > div {
    max-width: var(--tilavaraus-page-max-width);
    margin: 0 ${(props) => (props.$centerContent ? "auto" : "0")};
  }
`;

function NotificationWrapper(
  props: NotificationPropsWithCentering
): JSX.Element | null {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) {
    return null;
  }
  return (
    <StyledNotification
      {...props}
      $centerContent
      onClose={() => {
        setIsVisible(false);
        props.onClose?.();
      }}
    />
  );
}

export default NotificationWrapper;
