export interface FormValues {
  purposes: string | null;
  unit: string | null;
  equipments: string | null;
  timeBegin: string | null;
  timeEnd: string | null;
  startDate: string | null;
  endDate: string | null;
  duration: number | null;
  minPersons: string | null;
  maxPersons: string | null;
  reservationUnitType: string;
  showOnlyReservable?: boolean;
  textSearch?: string;
}
