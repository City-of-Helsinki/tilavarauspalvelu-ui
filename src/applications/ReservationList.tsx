import { TFunction } from 'i18next';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { Reservation } from '../common/types';
import { localizedValue, parseDate } from '../common/util';

type Props = {
  reservations?: Reservation[];
};

const Container = styled.div`
  margin-top: var(--spacing-m);
`;

const InfoText = styled.div`
  margin-top: var(--spacing-m);
  font-size: var(--fontsize-heading-m);
`;

const TwoColLayout = styled.div`
  margin-top: var(--spacing-m);
  display: grid;
  grid-gap: 0.5em;
  grid-template-columns: 1fr 1fr 9fr;
`;

const reservationLine = (
  reservation: Reservation,
  t: TFunction,
  language: string
) => {
  const begin = parseDate(reservation.begin);
  const end = parseDate(reservation.end);
  return (
    <TwoColLayout>
      <span>{t('common.dateLong', { date: begin })}</span>
      <span>
        {t('common.time', { date: begin })}-{t('common.time', { date: end })}
      </span>
      <span>
        {reservation.reservationUnit
          .map((ru) => localizedValue(ru.name, language))
          .join(',')}
      </span>
    </TwoColLayout>
  );
};

const ReservationList = ({ reservations }: Props): JSX.Element | null => {
  const { t, i18n } = useTranslation();
  const sortedReservations = reservations?.sort(
    (r1, r2) => parseDate(r1.begin).getTime() - parseDate(r2.begin).getTime()
  );
  return (
    <Container>
      <InfoText>{t('ReservationList.granted')}:</InfoText>
      {sortedReservations
        ?.filter((res) => res.state === 'confirmed')
        .map((reservation) => {
          return reservationLine(reservation, t, i18n.language);
        })}
      <InfoText>{t('ReservationList.cancelled')}:</InfoText>
      {sortedReservations
        ?.filter((res) => res.state === 'cancelled')
        .map((reservation) => {
          return reservationLine(reservation, t, i18n.language);
        })}
    </Container>
  );
};

export default ReservationList;
