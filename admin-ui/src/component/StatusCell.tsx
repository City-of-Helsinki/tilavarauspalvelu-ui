import React, { ReactNode } from "react";
import styled from "styled-components";
import { IconArrowRight, IconCheck, IconEnvelope } from "hds-react";
import { useTranslation } from "react-i18next";
import type { ApplicationStatus } from "common/types/gql-types";
import type {
  ExtendedApplicationEventStatus,
  ExtendedApplicationStatus,
} from "../common/types";
import { StatusDot, getApplicationEventStatusColor } from "../styles/util";

interface IStatusCellProps {
  text: string;
  status?: ExtendedApplicationStatus | ExtendedApplicationEventStatus;
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

const ApplicationEventStatusDot = styled.div<{
  status: ExtendedApplicationEventStatus;
  size: number;
}>`
  display: inline-block;
  width: ${({ size }) => size && `${size}px`};
  height: ${({ size }) => size && `${size}px`};
  border-radius: 50%;
  background-color: ${({ status }) =>
    getApplicationEventStatusColor(status, "s")};
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
  // TODO type casts are bad and usafe (here they only cause visual artifacts)
  switch (type) {
    case "applicationEvent":
      icon = (
        <ApplicationEventStatusDot
          status={status as ExtendedApplicationEventStatus}
          size={12}
        />
      );
      linkText = "ApplicationEvent.gotoLink";
      break;
    case "application":
      if (status === "sent") {
        icon = <IconEnvelope aria-hidden />;
      } else if (status === "approved") {
        icon = (
          <IconCheck aria-hidden style={{ color: "var(--color-success)" }} />
        );
      } else {
        icon = (
          <StatusDot
            aria-hidden
            status={status as ApplicationStatus}
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

export default StatusCell;
