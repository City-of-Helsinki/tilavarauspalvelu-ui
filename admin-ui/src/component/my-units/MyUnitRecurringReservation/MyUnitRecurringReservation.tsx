import { useQuery } from "@apollo/client";
import { H2 } from "common/src/common/typography";
import {
  Query,
  QueryUnitsArgs,
  ReservationUnitType,
} from "common/types/gql-types";
import { Button, IconAngleLeft } from "hds-react";
import React from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import styled from "styled-components";
import { myUnitUrl } from "../../../common/urls";
import { useNotification } from "../../../context/NotificationContext";
import { Container } from "../../../styles/layout";
import { BasicLink } from "../../../styles/util";
import Loader from "../../Loader";
import withMainMenu from "../../withMainMenu";
import { RECURRING_RESERVATION_UNIT_QUERY } from "../queries";
import { MyUnitRecurringReservationForm } from "./MyUnitRecurringReservationForm";

const PreviousLinkWrapper = styled.div`
  padding: var(--spacing-xs);
`;

type Params = {
  unitId: string;
  reservationUnitId: string;
};

const MyUnitRecurringReservation = () => {
  const { notifyError } = useNotification();
  const { t } = useTranslation();
  // FIXME maybe params need better handling
  const { unitId } = useParams<Params>();

  const previousUrl = myUnitUrl(parseInt(unitId ?? "0", 10));
  const { loading, data: unitData } = useQuery<Query, QueryUnitsArgs>(
    RECURRING_RESERVATION_UNIT_QUERY,
    {
      variables: {
        pk: [unitId ?? "0"],
        offset: 0,
      },
      onError: (err) => {
        notifyError(err.message);
      },
    }
  );
  const unit = unitData?.units?.edges[0];
  const reservationUnits = unit?.node?.reservationUnits?.filter(
    (item): item is ReservationUnitType => !!item
  );

  if (loading) return <Loader />;

  return (
    <>
      <PreviousLinkWrapper>
        <BasicLink to={previousUrl}>
          <Button
            aria-label={t("common.prev")}
            size="small"
            variant="supplementary"
            iconLeft={<IconAngleLeft />}
          >
            {t("common.prev")}
          </Button>
        </BasicLink>
      </PreviousLinkWrapper>

      <Container>
        <H2 as="h1">Tee toistuva varaus</H2>
        {reservationUnits != null && reservationUnits.length > 0 ? (
          <MyUnitRecurringReservationForm reservationUnits={reservationUnits} />
        ) : (
          <div>
            WIP: no reservation units this should block the button on the
            previous page
          </div>
        )}
      </Container>
    </>
  );
};

export default withMainMenu(MyUnitRecurringReservation);
