export const weekdays = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
];

export const reservationUnitPrefix = '/reservation-unit';
export const searchPrefix = '/search';

export const reservationUnitPath = (id: number): string =>
  `${reservationUnitPrefix}/${id}`;
