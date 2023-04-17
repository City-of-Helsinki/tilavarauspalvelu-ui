// Rewriting the metafields using zod validators
// TODO move to common after they are tested in use with
// CreateReservationModal / RecurringReservation / EditReservation
// TODO move validators into a single logical place (even if it's not in the common)

import { ReservationsReservationReserveeTypeChoices } from "common/types/gql-types";
import { z } from "zod";

// so form fields are { value: number; label: string }
// the value maps into backend pk (for the respective db table)
const OptionSchema = z.object({
  value: z.number(),
  label: z.string(),
});

export const ReservationFormMetaSchema = z.object({
  // TODO this is select based on backend options
  // ageGroup : {minimum: 12, maximum: 16, __typename: 'AgeGroupType'}
  name: z.string().optional(),
  description: z.string().optional(),
  ageGroup: OptionSchema.optional(),
  applyingForFreeOfCharge: z.boolean().optional(),
  billingAddressCity: z.string().optional(),
  billingAddressStreet: z.string().optional(),
  billingAddressZip: z.string().optional(),
  billingEmail: z.string().optional(),
  billingFirstName: z.string().optional(),
  billingLastName: z.string().optional(),
  billingPhone: z.string().optional(),
  freeOfChargeReason: z.string().optional(),
  // TODO this is select based on backend options
  // homeCity : {nameFi: 'Helsinki', __typename: 'CityType'}
  homeCity: OptionSchema.optional(),
  numPersons: z.number().optional(),
  // TODO this is select based on backend options
  // purpose : {nameFi: 'Liikkua tai pelata', __typename: 'ReservationPurposeType'}
  purpose: OptionSchema.optional(),
  reserveeAddressCity: z.string().optional(),
  reserveeAddressStreet: z.string().optional(),
  reserveeAddressZip: z.string().optional(),
  reserveeEmail: z.string().optional(),
  reserveeFirstName: z.string().optional(),
  reserveeId: z.string().optional(),
  reserveeIsUnregisteredAssociation: z.boolean().optional(),
  reserveeLastName: z.string().optional(),
  reserveeOrganisationName: z.string().optional(),
  reserveePhone: z.string().optional(),
  // TODO what are these?
  reserveeType: z
    .enum([
      ReservationsReservationReserveeTypeChoices.Individual,
      ReservationsReservationReserveeTypeChoices.Nonprofit,
      ReservationsReservationReserveeTypeChoices.Business,
    ])
    .nullable(),
  // reserveeType?: ReservationsReservationReserveeTypeChoices | "COMMON";
});

export type ReservationFormMeta = z.infer<typeof ReservationFormMetaSchema>;
