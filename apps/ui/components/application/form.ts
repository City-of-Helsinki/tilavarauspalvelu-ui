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
  ApplicantFragment,
} from "@gql/gql-types";
import { type Maybe } from "graphql/jsutils/Maybe";
import { z } from "zod";
import { toApiDate, toUIDate } from "common/src/common/util";
import { fromUIDate } from "@/modules/util";
import {
  checkValidDateOnly,
  lessThanMaybeDate,
} from "common/src/schemas/schemaCommon";
import { convertWeekday } from "common/src/conversion";

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
    numPersons: z
      .number()
      .min(1)
      .optional()
      .refine((s) => s, {
        path: [""],
        message: "Required",
      }),
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
    // TODO do we want to keep the pk of the options? so we can update them when the order changes and not recreate the whole list on save?
    reservationUnits: z.array(z.number()).min(1, { message: "Required" }),
    // frontend only props
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

export type ApplicationSectionPage2FormValue  = z.infer<typeof ApplicationSectionPage2Schema>;

const ApplicationSectionPage2Schema = z.object({
  pk: z.number(),
  suitableTimeRanges: z.array(SuitableTimeRangeFormTypeSchema).min(1),
  minDuration: z.number().min(1),
  name: z.string().min(1).max(100),
  // selected reservation unit to show for this section (only used by Page2)
  // TODO split the form? so we have three schemas (common + page1 + page2)
  reservationUnitPk: z.number().optional(),
  priority: z.literal(200).or(z.literal(300)).optional(),
});

type SectionType = NonNullable<Node["applicationSections"]>[0];
function transformApplicationSectionPage2(
  section: SectionType
): ApplicationSectionPage2FormValue {
  return {
    pk: section.pk ?? 0,
    name: section.name,
    suitableTimeRanges: filterNonNullable(section.suitableTimeRanges).map(
      (timeRanges) => convertTimeRange(timeRanges)
    ),
    minDuration: section.reservationMinDuration ?? 0,
  };
}
const ApplicationPage2Schema = z.object({
  pk: z.number(),
  // applicantType: ApplicantTypeSchema.optional(),
  applicationSections: z.array(ApplicationSectionPage2Schema)
});

export type ApplicationPage2FormValues = z.infer<typeof ApplicationPage2Schema>;

export function convertToSchedule(
  b: NonNullable<NonNullable<ApplicationPage2FormValues["applicationSections"]>[0]>
): ApplicationEventScheduleFormType[] {
  return (
    b.suitableTimeRanges?.map((range) => {
      return {
        day: range ? convertWeekday(range.dayOfTheWeek) : 0,
        begin: range?.beginTime ?? "",
        end: range?.endTime ?? "",
        priority: range?.priority === Priority.Primary ? 300 : 200,
      };
    }) ?? []
  );
}

function transformApplicationSectionToForm(
  section: SectionType
): ApplicationSectionFormValue {
  const initialReservationUnitPk =
    section.reservationUnitOptions[0].reservationUnit.pk ?? 0;

  const reservationUnits = filterNonNullable(
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
      .filter((pk) => pk > 0);

  return {
    pk: section.pk ?? undefined,
    formKey: section.pk ? `event-${section.pk}` : "event-NEW",
    name: section.name,
    numPersons: section.numPersons,
    ageGroup: section.ageGroup?.pk ?? 0,
    purpose: section.purpose?.pk ?? 0,
    minDuration: section.reservationMinDuration ?? 0,
    maxDuration: section.reservationMaxDuration ?? 0,
    appliedReservationsPerWeek: section.appliedReservationsPerWeek ?? 0,
    reservationUnits,
    // TODO why do these default to undefined instead of empty string?
    begin: convertDate(section.reservationsBeginDate),
    end: convertDate(section.reservationsEndDate),
    accordionOpen: false,
    reservationUnitPk: initialReservationUnitPk,
    priority: 300,
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
  if (date == null) {
    return undefined;
  }
  return toUIDate(new Date(date)) || undefined;
}

const AddressFormValueSchema = z.object({
  pk: z.number().optional(),
  streetAddress: z.string().min(1).max(80),
  city: z.string().min(1).max(80),
  postCode: z.string().min(1).max(32),
});
export type AddressFormValues = z.infer<typeof AddressFormValueSchema>;

// TODO identifier is only optional for Associations (not for Companies / Communities)
const OrganisationFormValuesSchema = z.object({
  pk: z.number().optional(),
  name: z.string().min(1).max(255),
  identifier: z.string().max(255).optional(),
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
  email: z.string().min(1).max(254).email(),
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
const ApplicationPage1Schema = z.object({
  pk: z.number(),
  applicantType: ApplicantTypeSchema.optional(),
  applicationSections: z
    .array(ApplicationSectionFormValueSchema.optional())
    .optional(),
});

export type ApplicationPage1FormValues = z.infer<typeof ApplicationPage1Schema>;

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

export function ApplicationPage1SchemaRefined(round: {
  begin: Date;
  end: Date;
}) {
  return ApplicationPage1Schema.superRefine((val, ctx) => {
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
export const ApplicationPage3Schema = z
  .object({
    pk: z.number(),
    applicantType: ApplicantTypeSchema.optional(),
    organisation: OrganisationFormValuesSchema.optional(),
    contactPerson: PersonFormValuesSchema.optional(),
    billingAddress: AddressFormValueSchema.optional(),
    // this is not submitted, we can use it to remove the billing address from submit without losing the frontend state
    hasBillingAddress: z.boolean().optional(),
    // TODO what is the max length for this?
    additionalInformation: z.string().optional(),
    homeCity: z.number().optional(),
  })
  .superRefine((val, ctx) => {
    switch (val.applicantType) {
      case ApplicantTypeChoice.Association:
      case ApplicantTypeChoice.Company:
        if (val.organisation?.identifier == null) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["organisation", "identifier"],
            message: "Required",
          });
        }
        break;
      default:
        break;
    }
    if (val.applicantType !== ApplicantTypeChoice.Individual) {
      if (val.organisation?.name == null) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["organisation", "name"],
          message: "Required",
        });
      }
      if (val.organisation?.coreBusiness == null) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["organisation", "coreBusiness"],
          message: "Required",
        });
      }
      if (!val.organisation?.address?.streetAddress) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["organisation", "address", "streetAddress"],
          message: "Required",
        });
      }
      if (!val.organisation?.address?.city) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["organisation", "address", "city"],
          message: "Required",
        });
      }
      if (!val.organisation?.address?.postCode) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["organisation", "address", "postCode"],
          message: "Required",
        });
      }
    }
    // TODO need to split
    if (!val.contactPerson?.firstName) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["contactPerson", "firstName"],
        message: "Required",
      });
    }
    if (!val.contactPerson?.lastName) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["contactPerson", "lastName"],
        message: "Required",
      });
    }
    if (!val.contactPerson?.email) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["contactPerson", "email"],
        message: "Required",
      });
    }
    if (!val.contactPerson?.phoneNumber) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["contactPerson", "phoneNumber"],
        message: "Required",
      });
    }

    // TODO need to check the subfields of the address
    if (val.hasBillingAddress) {
      if (!val.billingAddress?.streetAddress) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["billingAddress", "streetAddress"],
          message: "Required",
        });
      }
      if (!val.billingAddress?.city) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["billingAddress", "city"],
          message: "Required",
        });
      }
      if (!val.billingAddress?.postCode) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["billingAddress", "postCode"],
          message: "Required",
        });
      }
    }
  });

export type ApplicationPage3FormValues = z.infer<
  typeof ApplicationPage3Schema
>;

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
    numPersons: ae.numPersons,
    ageGroup: ae.ageGroup,
    purpose: ae.purpose,
    reservationMinDuration: ae.minDuration ?? 0, // "3600" == 1h
    reservationMaxDuration: ae.maxDuration ?? 0, // "7200" == 2h
    appliedReservationsPerWeek: ae.appliedReservationsPerWeek,
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
export function transformApplication(
  values: ApplicationPage1FormValues
): ApplicationUpdateMutationInput {
  const appEvents = filterNonNullable(values.applicationSections);
  return {
    pk: values.pk,
    applicantType: values.applicantType,
    applicationSections: appEvents.map((ae) => transformApplicationSection(ae)),
  };
}

export function convertApplication(
  app: Node,
  reservationUnits: Pick<ReservationUnitNode, "pk">[]
): ApplicationPage1FormValues {
  const formAes = filterNonNullable(app?.applicationSections).map((ae) =>
    transformApplicationSectionToForm(ae)
  );
  // TODO do we need to set default values?
  const defaultAes: (typeof formAes)[0] = {
    pk: undefined,
    name: "",
    // TODO this is not unique if the user adds multiple new sections
    formKey: "event-NEW",
    numPersons: undefined,
    ageGroup: 0,
    purpose: 0,
    minDuration: 0,
    maxDuration: 0,
    begin: undefined,
    end: undefined,
    appliedReservationsPerWeek: 1,
    reservationUnits: filterNonNullable(reservationUnits.map((ru) => ru.pk)),
    accordionOpen: true,
    reservationUnitPk: 0,
    priority: 300,
  };
  return {
    pk: app?.pk ?? 0,
    applicantType: app?.applicantType ?? undefined,
    applicationSections: formAes.length > 0 ? formAes : [defaultAes],
  };
}

// Filter out any empty strings from the object (otherwise the mutation fails)
function transformPerson(person?: PersonFormValues) {
  return {
    firstName: person?.firstName || undefined,
    lastName: person?.lastName || undefined,
    email: person?.email || undefined,
    phoneNumber: person?.phoneNumber || undefined,
  };
}

function isAddressValid(address?: AddressFormValues) {
  const { streetAddress, postCode, city } = address || {};
  return (
    streetAddress != null &&
    streetAddress !== "" &&
    postCode != null &&
    postCode !== "" &&
    city != null &&
    city !== ""
  );
}

function transformAddress(address?: AddressFormValues) {
  return {
    pk: address?.pk || undefined,
    streetAddress: address?.streetAddress || undefined,
    postCode: address?.postCode || undefined,
    city: address?.city || undefined,
  };
}

// Filter out any empty strings from the object (otherwise the mutation fails)
// remove the identifier if it's empty (otherwise the mutation fails)
function transformOrganisation(org: OrganisationFormValues) {
  return {
    name: org.name || undefined,
    identifier: org.identifier || undefined,
    address: isAddressValid(org.address)
      ? transformAddress(org.address)
      : undefined,
    coreBusiness: org.coreBusiness || undefined,
  };
}

export function convertApplicationPage3(
  app?: Maybe<ApplicantFragment>
): ApplicationPage3FormValues {
  return {
    pk: app?.pk ?? 0,
    applicantType: app?.applicantType ?? undefined,
    organisation: convertOrganisation(app?.organisation),
    contactPerson: convertPerson(app?.contactPerson),
    billingAddress: convertAddress(app?.billingAddress),
    hasBillingAddress:
      app?.applicantType !== ApplicantTypeChoice.Individual &&
      app?.billingAddress?.streetAddressFi != null,
    additionalInformation: app?.additionalInformation ?? "",
    homeCity: app?.homeCity?.pk ?? undefined,
  };
}

export function transformPage3Application(
  values: ApplicationPage3FormValues
): ApplicationUpdateMutationInput {
  const shouldSaveBillingAddress =
    values.applicantType === ApplicantTypeChoice.Individual ||
    values.hasBillingAddress;
  return {
    pk: values.pk,
    applicantType: values.applicantType,
    ...(values.billingAddress != null && shouldSaveBillingAddress
      ? { billingAddress: transformAddress(values.billingAddress) }
      : {}),
    ...(values.contactPerson != null
      ? { contactPerson: transformPerson(values.contactPerson) }
      : {}),
    ...(values.organisation != null &&
    values.applicantType !== ApplicantTypeChoice.Individual
      ? { organisation: transformOrganisation(values.organisation) }
      : {}),
    ...(values.additionalInformation != null
      ? { additionalInformation: values.additionalInformation }
      : {}),
    ...(values.homeCity != null && values.homeCity !== 0
      ? { homeCity: values.homeCity }
      : {}),
  };
}
