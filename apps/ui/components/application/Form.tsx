import { startOfDay } from "date-fns";
import { filterNonNullable } from "common/src/helpers";
import {
  ApplicantTypeChoice,
  type PersonNode,
  type ApplicationUpdateMutationInput,
  Weekday,
  Priority,
  type UpdateApplicationSectionForApplicationSerializerInput,
  type ReservationUnitNode,
  type ApplicationQuery,
} from "@gql/gql-types";
import { type Maybe } from "graphql/jsutils/Maybe";
import { z } from "zod";
import { toApiDate } from "common/src/common/util";
import { apiDateToUIDate, fromUIDate } from "@/modules/util";
import {
  checkValidDateOnly,
  lessThanMaybeDate,
} from "common/src/schemas/schemaCommon";

type Node = NonNullable<ApplicationQuery["application"]>;
type Organisation = Node["organisation"];
type Address = NonNullable<Organisation>["address"];
// NOTE the zod schemas have a lot of undefineds because the form is split into four pages
// so you can't trust some of the zod validation (e.g. mandatory fields)
// real solution is to split the forms per page so we have four schemas
// the new mutation interface allows only updating the fields that are present
// also then all manual validations and setErrors should be removed

const ApplicationEventScheduleFormTypeSchema = z.object({
  day: z.number().min(0).max(6),
  begin: z.string(),
  end: z.string(),
  priority: z.number(),
});

export type ApplicationEventScheduleFormType = z.infer<
  typeof ApplicationEventScheduleFormTypeSchema
>;

const SuitableTimeRangeFormTypeSchema = z.object({
  pk: z.number().optional(),
  priority: z.nativeEnum(Priority),
  // TODO validate Time input string
  beginTime: z.string(),
  endTime: z.string(),
  dayOfTheWeek: z.nativeEnum(Weekday),
});
export type SuitableTimeRangeFormValues = z.infer<
  typeof SuitableTimeRangeFormTypeSchema
>;

const ApplicationSectionFormValueSchema = z
  .object({
    pk: z.number().optional(),
    name: z.string().min(1, { message: "Required" }).max(100),
    numPersons: z.number().min(1),
    ageGroup: z.number().refine((s) => s, { path: [""], message: "Required" }),
    purpose: z.number().refine((s) => s, { path: [""], message: "Required" }),
    minDuration: z.number().min(1, { message: "Required" }),
    maxDuration: z.number().min(1, { message: "Required" }),
    appliedReservationsPerWeek: z.number().min(1).max(7),
    begin: z
      .string()
      .optional()
      .refine((s) => s, { path: [""], message: "Required" }),
    end: z
      .string()
      .optional()
      .refine((s) => s, { path: [""], message: "Required" }),
    // optional because it's not present on the first page
    // TODO do we check this on Page2? not undefined and length > 0?)
    suitableTimeRanges: z.array(SuitableTimeRangeFormTypeSchema).optional(),
    // TODO do we want to keep the pk of the options? so we can update them when the order changes and not recreate the whole list on save?
    reservationUnits: z.array(z.number()).min(1, { message: "Required" }),
    // extra page prop, not saved to backend
    accordionOpen: z.boolean(),
    // form specific: new events don't have pks and we need a unique identifier
    formKey: z.string(),
  })
  .refine((s) => s.maxDuration >= s.minDuration, {
    path: ["maxDuration"],
    message: "Maximum duration must be greater than minimum duration",
  })
  .superRefine((val, ctx) => {
    checkValidDateOnly(fromUIDate(val.begin ?? ""), ctx, `begin`);
  })
  .superRefine((val, ctx) => {
    checkValidDateOnly(fromUIDate(val.end ?? ""), ctx, `end`);
  })
  .refine((s) => lessThanMaybeDate(s.begin, s.end), {
    path: ["end"],
    message: "End date must be after begin date",
  });

export type ApplicationSectionFormValue = z.infer<
  typeof ApplicationSectionFormValueSchema
>;

type SectionType = NonNullable<Node["applicationSections"]>[0];
function transformApplicationSectionToForm(
  section: SectionType
): ApplicationSectionFormValue {
  return {
    pk: section.pk ?? undefined,
    formKey: section.pk ? `event-${section.pk}` : "event-NEW",
    name: section.name,
    numPersons: section.numPersons ?? 0,
    ageGroup: section.ageGroup?.pk ?? 0,
    purpose: section.purpose?.pk ?? 0,
    minDuration: section.reservationMinDuration ?? 0,
    maxDuration: section.reservationMaxDuration ?? 0,
    appliedReservationsPerWeek: section.appliedReservationsPerWeek ?? 0,
    reservationUnits: filterNonNullable(
      section.reservationUnitOptions?.map(
        ({ reservationUnit, preferredOrder }) => ({
          pk: reservationUnit?.pk,
          preferredOrder,
        })
      )
    )
      .sort((a, b) =>
        a.preferredOrder && b.preferredOrder
          ? a.preferredOrder - b.preferredOrder
          : 0
      )
      .map((eru) => eru.pk ?? 0)
      .filter((pk) => pk > 0),
    suitableTimeRanges: filterNonNullable(section.suitableTimeRanges).map(
      (timeRanges) => convertTimeRange(timeRanges)
    ),
    begin: convertDate(section.reservationsBeginDate),
    end: convertDate(section.reservationsEndDate),
    accordionOpen: false,
  };
}

function convertTimeRange(
  timeRange: NonNullable<SectionType["suitableTimeRanges"][0]>
): SuitableTimeRangeFormValues {
  return {
    pk: timeRange.pk ?? undefined,
    // TODO pk should be sent if updating (otherwise it always creates new)
    beginTime: timeRange.beginTime ?? "",
    dayOfTheWeek: timeRange.dayOfTheWeek ?? 0,
    endTime: timeRange.endTime ?? "",
    priority: timeRange.priority ?? 50,
  };
}

function convertDate(date: string | null | undefined): string | undefined {
  // TODO is there a case where this could be DD.MM.YYYY? do we want to ignore invalide dates or raise a problem?
  return date != null && date.includes("-") ? apiDateToUIDate(date) : undefined;
}

const AddressFormValueSchema = z.object({
  pk: z.number().optional(),
  streetAddress: z.string(),
  city: z.string(),
  postCode: z.string(),
});
export type AddressFormValues = z.infer<typeof AddressFormValueSchema>;

// TODO identifier is only optional for Associations (not for Companies / Communities)
const OrganisationFormValuesSchema = z.object({
  pk: z.number().optional(),
  name: z.string().min(1).max(255),
  identifier: z.string().optional(),
  yearEstablished: z.number().optional(),
  coreBusiness: z.string().min(1).max(255),
  address: AddressFormValueSchema,
});
export type OrganisationFormValues = z.infer<
  typeof OrganisationFormValuesSchema
>;

const PersonFormValuesSchema = z.object({
  pk: z.number().optional(),
  firstName: z.string().min(1).max(255),
  lastName: z.string().min(1).max(255),
  email: z.string().min(1).max(255).email(),
  phoneNumber: z.string().min(1).max(255),
});
export type PersonFormValues = z.infer<typeof PersonFormValuesSchema>;

export const convertPerson = (p: Maybe<PersonNode>): PersonFormValues => ({
  pk: p?.pk ?? undefined,
  firstName: p?.firstName ?? "",
  lastName: p?.lastName ?? "",
  email: p?.email ?? "",
  phoneNumber: p?.phoneNumber ?? "",
});

// TODO are these converters the wrong way around? (not input, but output)
export const convertAddress = (a: Address): AddressFormValues => ({
  pk: a?.pk ?? undefined,
  streetAddress: a?.streetAddressFi ?? "",
  city: a?.cityFi ?? "",
  postCode: a?.postCode ?? "",
});

export const convertOrganisation = (
  o: Organisation
): OrganisationFormValues => ({
  pk: o?.pk ?? undefined,
  name: o?.nameFi ?? "",
  identifier: o?.identifier ?? "",
  yearEstablished: o?.yearEstablished ?? 0,
  coreBusiness: o?.coreBusinessFi ?? "",
  address: convertAddress(o?.address),
});

const ApplicantTypeSchema = z.enum([
  ApplicantTypeChoice.Individual,
  ApplicantTypeChoice.Company,
  ApplicantTypeChoice.Association,
  ApplicantTypeChoice.Community,
]);
const ApplicationFormSchema = z.object({
  pk: z.number(),
  applicantType: ApplicantTypeSchema.optional(),
  applicationSections: z
    .array(ApplicationSectionFormValueSchema.optional())
    .optional(),
});

function checkDateRange(props: {
  date: Date;
  pathRoot: string;
  part: "begin" | "end";
  range: { begin: Date; end: Date };
  ctx: z.RefinementCtx;
}) {
  const { date, pathRoot, part, range, ctx } = props;

  const path = `${pathRoot}.${part}`;
  if (startOfDay(date).getTime() < startOfDay(range.begin).getTime()) {
    const message = `${part} date must be after application round begin date`;
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: [path],
      message,
    });
  }
  if (startOfDay(date).getTime() > startOfDay(range.end).getTime()) {
    const message = `${part} date must be before application round end date`;
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: [path],
      message,
    });
  }
}

/// check that the given time is inside a DateRange
/// Assumes that date validity has already been checked (adds a range error if the date is invalid)
/// but that's implementation specific and could change in the future (depending on the fromUIDate implementation)
function checkApplicationRoundDates(
  round: {
    begin: Date;
    end: Date;
  },
  val: ApplicationSectionFormValue,
  pathRoot: string,
  ctx: z.RefinementCtx
) {
  const { begin, end } = val;
  if (begin == null || end == null) {
    return;
  }
  const b = fromUIDate(begin);
  const e = fromUIDate(end);

  if (b != null) {
    checkDateRange({
      date: b,
      pathRoot,
      part: "begin",
      range: { begin: round.begin, end: round.end },
      ctx,
    });
  }

  if (e != null) {
    checkDateRange({
      date: e,
      pathRoot,
      part: "end",
      range: { begin: round.begin, end: round.end },
      ctx,
    });
  }
}

export function ApplicationFormSchemaRefined(round: {
  begin: Date;
  end: Date;
}) {
  return ApplicationFormSchema.superRefine((val, ctx) => {
    if (val.applicationSections == null) {
      return;
    }
    for (let i = 0; i < val.applicationSections.length; i++) {
      const section = val.applicationSections[i];
      if (section == null) {
        continue;
      }
      const pathRoot = `applicationSections.${i}`;
      checkApplicationRoundDates(round, section, pathRoot, ctx);
    }
  });
}

// TODO refine the form (different applicant types require different fields)
// if applicantType === Organisation | Company => organisation.identifier is required
// if hasBillingAddress | applicantType === Individual => billingAddress is required
const ApplicationFormPage3Schema = z.object({
  pk: z.number(),
  applicantType: ApplicantTypeSchema.optional(),
  organisation: OrganisationFormValuesSchema.optional(),
  contactPerson: PersonFormValuesSchema.optional(),
  billingAddress: AddressFormValueSchema.optional(),
  // this is not submitted, we can use it to remove the billing address from submit without losing the frontend state
  hasBillingAddress: z.boolean().optional(),
  additionalInformation: z.string().optional(),
  homeCity: z.number().optional(),
});
export type ApplicationFormPage3Values = z.infer<
  typeof ApplicationFormPage3Schema
>;

export type ApplicationFormValues = z.infer<typeof ApplicationFormSchema>;

/// form -> API transformers, enforce return types so API changes cause type errors

function transformDateString(date?: string | null): string | null {
  if (date == null) {
    return null;
  }
  const d = fromUIDate(date);
  if (d != null) {
    return toApiDate(d);
  }
  return null;
}

// On purpose not return typed create / update compatible objects
const transformEventReservationUnit = (pk: number, priority: number) => ({
  preferredOrder: priority,
  reservationUnit: pk,
});

function transformSuitableTimeRange(timeRange: SuitableTimeRangeFormValues) {
  return {
    ...(timeRange.pk != null ? { pk: timeRange.pk } : {}),
    beginTime: timeRange.beginTime ?? "",
    endTime: timeRange.endTime ?? "",
    priority: timeRange.priority ?? 50,
    dayOfTheWeek: timeRange.dayOfTheWeek,
  };
}

// NOTE this works only for subsections of an application mutation
// if needed without an application mutation needs to use a different SerializerInput
function transformApplicationSection(
  ae: ApplicationSectionFormValue
): UpdateApplicationSectionForApplicationSerializerInput {
  const begin = transformDateString(ae.begin);
  const end = transformDateString(ae.end);

  const commonData: UpdateApplicationSectionForApplicationSerializerInput = {
    ...(begin != null ? { reservationsBeginDate: begin } : {}),
    ...(end != null ? { reservationsEndDate: end } : {}),
    name: ae.name,
    numPersons: ae.numPersons ?? 0,
    ageGroup: ae.ageGroup,
    purpose: ae.purpose,
    reservationMinDuration: ae.minDuration ?? 0, // "3600" == 1h
    reservationMaxDuration: ae.maxDuration ?? 0, // "7200" == 2h
    appliedReservationsPerWeek: ae.appliedReservationsPerWeek,
    suitableTimeRanges: ae.suitableTimeRanges?.map(transformSuitableTimeRange),
    // TODO should validate that the units are on the application round
    reservationUnitOptions: ae.reservationUnits.map((ruo, ruoIndex) =>
      transformEventReservationUnit(ruo, ruoIndex)
    ),
  };
  if (ae.pk != null) {
    return {
      ...commonData,
      pk: ae.pk,
    };
  }

  return commonData;
}

// For pages 1 and 2
export const transformApplication = (
  values: ApplicationFormValues
): ApplicationUpdateMutationInput => {
  const appEvents = filterNonNullable(values.applicationSections);
  return {
    pk: values.pk,
    applicantType: values.applicantType,
    applicationSections: appEvents.map((ae) => transformApplicationSection(ae)),
  };
};

export function convertApplication(
  app: Node,
  reservationUnits: Pick<ReservationUnitNode, "pk">[]
): ApplicationFormValues {
  const formAes = filterNonNullable(app?.applicationSections).map((ae) =>
    transformApplicationSectionToForm(ae)
  );
  // TODO do we need to set default values?
  const defaultAes: (typeof formAes)[0] = {
    pk: undefined,
    name: "",
    formKey: "event-NEW",
    numPersons: 0,
    ageGroup: 0,
    purpose: 0,
    minDuration: 0,
    maxDuration: 0,
    begin: undefined,
    end: undefined,
    appliedReservationsPerWeek: 1,
    suitableTimeRanges: [],
    reservationUnits: filterNonNullable(reservationUnits.map((ru) => ru.pk)),
    accordionOpen: true,
  };
  return {
    pk: app?.pk ?? 0,
    applicantType: app?.applicantType ?? undefined,
    applicationSections: formAes.length > 0 ? formAes : [defaultAes],
  };
}
/* eslint-disabled @typescript-eslint/explicit-function-return-type */
