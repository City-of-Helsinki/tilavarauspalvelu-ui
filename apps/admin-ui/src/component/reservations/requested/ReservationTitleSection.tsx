import React, { forwardRef } from "react";
import { Tag } from "hds-react";
import styled from "styled-components";
import { useTranslation } from "react-i18next";
import { H1, fontMedium } from "common/src/common/typography";
import { breakpoints } from "common/src/common/style";
import {
  useReservationApplicationLinkQuery,
  type ReservationQuery,
} from "@gql/gql-types";
import { getName } from "./util";
import { HorisontalFlex } from "@/styles/layout";
import { formatDateTime } from "@/common/util";
import { getApplicationUrl } from "@/common/urls";
import { gql } from "@apollo/client";
import { ExternalLink } from "@/component/ExternalLink";

const Dot = styled.div`
  display: inline-block;
  border-radius: 50%;
  background: var(--tilavaraus-admin-status-not-handled);
  height: 1.6em;
  text-align: center;
  line-height: 1.6;
  aspect-ratio: 1;
  font-size: 0.6em;
  color: white;
  font-weight: 600;
  @media (min-width: ${breakpoints.m}) {
    flex-direction: row;
  }
`;

const AlignVertically = styled.div`
  display: flex;
  gap: var(--spacing-m);
  flex-direction: row;
  align-items: center;
`;

const NameState = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  margin-bottom: var(--spacing-xs);

  @media (min-width: ${breakpoints.m}) {
    flex-direction: row;
    margin-bottom: 0;
  }
`;

const Tagline = styled.div`
  font-size: var(--fontsize-body-xl);
  margin-bottom: var(--spacing-xs);
`;

const DateTime = styled.div`
  margin-bottom: var(--spacing-s);
  display: flex;
  gap: var(--spacing-xs);
  > a {
    ${fontMedium}
  }
`;

type ReservationType = NonNullable<ReservationQuery["reservation"]>;
type Props = {
  reservation: ReservationType;
  tagline: string;
  overrideTitle?: string;
};

export const APPLICATION_LINK_QUERY = gql`
  query ReservationApplicationLink($id: ID!) {
    recurringReservation(id: $id) {
      id
      allocatedTimeSlot {
        id
        pk
        reservationUnitOption {
          id
          pk
          applicationSection {
            id
            pk
            application {
              id
              pk
            }
          }
        }
      }
    }
  }
`;

const ReservationTitleSection = forwardRef<HTMLDivElement, Props>(
  ({ reservation, tagline, overrideTitle }: Props, ref) => {
    const { t } = useTranslation();

    // ignore error on purpose because this is going to fail with permission error
    const { data, error: _err } = useReservationApplicationLinkQuery({
      variables: { id: reservation.recurringReservation?.id ?? "" },
      skip: !reservation.recurringReservation?.id,
    });

    const applicationPk =
      data?.recurringReservation?.allocatedTimeSlot?.reservationUnitOption
        ?.applicationSection?.application?.pk;
    const sectionPk =
      data?.recurringReservation?.allocatedTimeSlot?.reservationUnitOption
        ?.applicationSection?.pk;
    const applicationLink = applicationPk
      ? getApplicationUrl(applicationPk, sectionPk)
      : null;

    return (
      <div>
        <NameState ref={ref}>
          <H1 $legacy>{overrideTitle ?? getName(reservation, t)}</H1>
          <HorisontalFlex>
            <AlignVertically>
              {reservation.order?.status && (
                <Tag
                  theme={{ "--tag-background": "var(--color-engel-light)" }}
                  data-testid="reservation_title_section__order_status"
                  id="reservation-order_status"
                >
                  {t(`Payment.status.${reservation.order?.status}`)}
                </Tag>
              )}
            </AlignVertically>
            <AlignVertically style={{ gap: "var(--spacing-xs)" }}>
              <Dot />
              <span data-testid="reservation_title_section__state">
                {t(`RequestedReservation.state.${reservation.state}`)}
              </span>
            </AlignVertically>
          </HorisontalFlex>
        </NameState>
        <Tagline data-testid="reservation_title_section__tagline">
          {tagline}
        </Tagline>
        <DateTime>
          {t("RequestedReservation.createdAt")}{" "}
          {formatDateTime(reservation.createdAt ?? "")}
          <ExternalLink to={applicationLink} size="s">
            {`${t("RequestedReservation.applicationLink")}: ${applicationPk}-${sectionPk}`}
          </ExternalLink>
        </DateTime>
      </div>
    );
  }
);

export default ReservationTitleSection;
