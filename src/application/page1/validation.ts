import { parse } from 'date-fns';

export const before = (reference: string, value: string) => {
  const ref = parse(reference, 'yyyy-MM-dd', 0);
  const val = parse(value, 'yyyy-MM-dd', 0);

  return val.getTime() < ref.getTime();
};

export const after = (reference: string, value: string) => {
  const ref = parse(reference, 'yyyy-MM-dd', 0);
  const val = parse(value, 'yyyy-MM-dd', 0);

  return val.getTime() > ref.getTime();
};
