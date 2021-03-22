import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { Accordion } from 'hds-react';
import Container from '../component/Container';
import { ReservationUnit as ReservationUnitType } from '../common/types';
import { getReservationUnit, getReservationUnits } from '../common/api';
import Head from './Head';
import { routeData } from '../common/const';
import Address from './Address';
import Map from './Map';
import { localizedValue } from '../common/util';
import Images from './Images';
import { SpanTwoColumns } from '../component/common';
import Sanitize from '../component/Sanitize';
import { breakpoint } from '../common/style';
import RelatedUnits from './RelatedUnits';
import useReservationUnitsList from '../common/hook/useReservationUnitList';
import StartApplicationBar from '../component/StartApplicationBar';

type ParamTypes = {
  id: string;
};

const TwoColoumnLayout = styled.div`
  display: grid;
  gap: var(--spacing-layout-s);
  grid-template-columns: 7fr 390px;
  @media (max-width: ${breakpoint.l}) {
    grid-template-columns: 1fr;
  }
`;

const Content = styled.div`
  font-family: var(--font-regular);
`;

const ReservationUnit = (): JSX.Element | null => {
  const { id } = useParams<ParamTypes>();
  const { t, i18n } = useTranslation();

  const [
    reservationUnit,
    setReservationUnit,
  ] = useState<ReservationUnitType | null>(null);

  const reservationUnitList = useReservationUnitsList();

  const [relatedUnits, setRelatedUnits] = useState<ReservationUnitType[]>([]);

  useEffect(() => {
    async function fetchData() {
      const backendData = routeData()?.reservationUnit;
      if (backendData) {
        setReservationUnit(backendData);
        routeData().reservationUnit = undefined;
      } else {
        const unit = await getReservationUnit(Number(id));
        if (unit.unitId) {
          setRelatedUnits(
            (await getReservationUnits({ unit: unit.unitId })).filter(
              (u) => u.id !== Number(id)
            )
          );
        }
        setReservationUnit(unit);
      }
    }
    fetchData();
  }, [id]);

  return reservationUnit ? (
    <>
      <Head
        reservationUnit={reservationUnit}
        reservationUnitList={reservationUnitList}
      />
      <Container>
        <TwoColoumnLayout>
          <div>
            <Accordion heading={t('reservationUnit.description')}>
              <Content>
                <Sanitize html={reservationUnit.description} />
              </Content>
            </Accordion>
            <Accordion heading={t('reservationUnit.termsOfUse')}>
              <Content>
                <Sanitize html={reservationUnit.termsOfUse} />
              </Content>
            </Accordion>
          </div>
          <div>
            <Address reservationUnit={reservationUnit} />
            <Images images={reservationUnit.images} />
          </div>
          <SpanTwoColumns>
            <Map
              title={localizedValue(reservationUnit.name, i18n.language)}
              latitude={reservationUnit.location?.coordinates?.latitude}
              longitude={reservationUnit.location?.coordinates?.longitude}
            />
            {reservationUnit.location ? (
              <Address reservationUnit={reservationUnit} />
            ) : null}
            <RelatedUnits
              reservationUnitList={reservationUnitList}
              units={relatedUnits}
            />
          </SpanTwoColumns>
        </TwoColoumnLayout>
      </Container>
      <StartApplicationBar
        count={reservationUnitList.reservationUnits.length}
      />
    </>
  ) : null;
};

export default ReservationUnit;
