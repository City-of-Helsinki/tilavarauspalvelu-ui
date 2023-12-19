import React, { ReactNode } from "react";
import styled from "styled-components";
import { IconArrowRight, IconCheck, IconEnvelope } from "hds-react";
import { useTranslation } from "react-i18next";
import {
  ApplicationEventStatusChoice,
  ApplicationStatusChoice,
} from "common/types/gql-types";
import {
  getApplicationEventStatusColor,
  getApplicationStatusColor,
} from "@/component//applications/util";

const StatusDot = styled.div<{
  status: ApplicationStatusChoice;
  size: number;
}>`
  display: inline-block;
  width: ${({ size }) => size && `${size}px`};
  height: ${({ size }) => size && `${size}px`};
  border-radius: 50%;
  background-color: ${({ status }) => getApplicationStatusColor(status, "s")};
`;

const ApplicationEventStatusDot = styled.div<{
  status: ApplicationEventStatusChoice;
  size: number;
}>`
  display: inline-block;
  width: ${({ size }) => size && `${size}px`};
  height: ${({ size }) => size && `${size}px`};
  border-radius: 50%;
  background-color: ${({ status }) =>
    getApplicationEventStatusColor(status, "s")};
`;

interface IStatusCellProps {
  text: string;
  status?: ApplicationStatusChoice | ApplicationEventStatusChoice;
  type: "application" | "applicationEvent";
  withArrow?: boolean;
}

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: var(--tilavaraus-admin-content-text-color);

  ${StatusDot} {
    margin-right: 0.625em;
  }
`;

const Status = styled.div`
  display: inline-flex;
  align-items: center;
`;

const StatusCell = ({
  text,
  status,
  type,
  withArrow = true,
}: IStatusCellProps): JSX.Element => {
  const { t } = useTranslation();

  let icon: ReactNode;
  let linkText = "";
  switch (type) {
    case "applicationEvent":
      icon = (
        <ApplicationEventStatusDot
          status={status as ApplicationEventStatusChoice}
          size={12}
        />
      );
      linkText = "ApplicationEvent.gotoLink";
      break;
    case "application":
      if (status === ApplicationStatusChoice.Received) {
        icon = <IconEnvelope aria-hidden />;
      } else if (status === ApplicationStatusChoice.Handled) {
        icon = (
          <IconCheck aria-hidden style={{ color: "var(--color-success)" }} />
        );
      } else {
        icon = (
          <StatusDot
            aria-hidden
            status={status as ApplicationStatusChoice}
            size={12}
          />
        );
      }
      linkText = "Application.gotoLink";
      break;
    default:
  }

  return (
    <Wrapper>
      <Status>
        {icon}
        <span>{t(text)}</span>
      </Status>
      {withArrow && (
        <IconArrowRight
          aria-label={t(linkText)}
          data-testid="status-cell__link--icon"
        />
      )}
    </Wrapper>
  );
};

const StyledStatusCell = styled(StatusCell)`
  gap: 0 !important;
  > div {
    gap: 0 !important;
  }
`;

// Define separate components to make the refactoring easier
// the type parameter and dynamic switching is very error prone and hard to grep for in the source code
const ApplicationStatusCell = (
  props: Omit<IStatusCellProps, "type">
): JSX.Element => <StyledStatusCell {...props} type="application" />;

const ApplicationEventStatusCell = (
  props: Omit<IStatusCellProps, "type">
): JSX.Element => <StyledStatusCell {...props} type="applicationEvent" />;

export {
  ApplicationStatusCell,
  ApplicationEventStatusCell,
  // old export
  StyledStatusCell as StatusCell,
};