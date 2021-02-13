import { OptionType } from './types';

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

export const emptyOption = (label: string): OptionType => ({
  label,
  value: undefined,
});

export const participantCountOptions = [
  1,
  2,
  3,
  4,
  5,
  6,
  7,
  8,
  9,
  10,
  15,
  20,
  25,
  30,
  40,
  50,
  60,
  70,
  80,
  90,
  100,
].map((v) => ({ label: `${v}`, value: v } as OptionType));
