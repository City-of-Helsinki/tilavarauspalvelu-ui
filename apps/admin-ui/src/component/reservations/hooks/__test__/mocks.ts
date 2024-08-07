import { GraphQLError } from "graphql";
import { addDays, addHours, set } from "date-fns";
import {
  type ReservationNode,
  Authentication,
  ReservationKind,
  ReservationStartInterval,
  ReservationStateChoice,
  type ReservationUnitNode,
  UpdateStaffReservationDocument,
  RecurringReservationDocument,
  UpdateRecurringReservationDocument,
} from "@gql/gql-types";
import { base64encode } from "common/src/helpers";

export const CHANGED_WORKING_MEMO = "Sisaisen kommentti";

export const MUTATION_DATA = {
  input: {
    pk: 1,
    reservationUnitPks: [1],
    type: "BEHALF",
    reservationBlockWholeDay: false,
    bufferTimeBefore: 0,
    bufferTimeAfter: 0,
    reserveeType: "BUSINESS",
    reserveeFirstName: "Etunimi",
    reserveeLastName: "Sukunimi",
    reserveeOrganisationName: "Yhdistys007",
    reserveePhone: "43434343",
    reserveeEmail: "",
    reserveeId: "44444444",
    reserveeIsUnregisteredAssociation: true,
    reserveeAddressStreet: "Katuosoite",
    reserveeAddressCity: "TRE",
    reserveeAddressZip: "44444",
    billingFirstName: "",
    billingLastName: "",
    billingPhone: "",
    billingEmail: "",
    billingAddressStreet: "",
    billingAddressCity: "",
    billingAddressZip: "",
    freeOfChargeReason: "",
    name: "New name",
    description: "",
    numPersons: 10,
  },
  workingMemo: {
    pk: 1,
    workingMemo: CHANGED_WORKING_MEMO,
  },
};

const TODAY = new Date();
const getValidInterval = (daysToAdd: number) => {
  const begin = set(addDays(TODAY, daysToAdd + 1), {
    hours: 6,
    minutes: 0,
    seconds: 0,
    milliseconds: 0,
  });
  return [begin.toISOString(), addHours(begin, 1).toISOString()];
};

function createRecurringEdges(
  startingPk: number,
  recurringPk: number,
  state: ReservationStateChoice = ReservationStateChoice.Confirmed
) {
  return [
    {
      begin: getValidInterval(0)[0],
      end: getValidInterval(0)[1],
      pk: startingPk,
      id: base64encode(`ReservationNode:${startingPk}`),
      recurringReservation: {
        id: base64encode(`RecurringReservationNode:${recurringPk}`),
        pk: recurringPk,
      },
      state,
    },
    {
      begin: getValidInterval(7)[0],
      end: getValidInterval(7)[1],
      pk: startingPk + 1,
      id: base64encode(`ReservationNode:${startingPk + 1}`),
      recurringReservation: {
        id: base64encode(`RecurringReservationNode:${recurringPk}`),
        pk: recurringPk,
      },
      state,
    },
  ];
}

const correctRecurringReservationQueryResult = (
  startingPk: number,
  recurringPk: number,
  options?: {
    shouldFailAll?: boolean;
    shouldFailOnce?: boolean;
    allDenied?: boolean;
  }
) => [
  {
    request: {
      query: RecurringReservationDocument,
      variables: {
        id: base64encode(`RecurringReservationNode:${recurringPk}`),
      },
    },
    result: {
      data: {
        recurringReservation: {
          reservations: createRecurringEdges(
            startingPk,
            recurringPk,
            options?.allDenied
              ? ReservationStateChoice.Denied
              : ReservationStateChoice.Confirmed
          ),
        },
      },
    },
  },
  {
    request: {
      query: UpdateRecurringReservationDocument,
      variables: {
        input: {
          name: "Modify recurring name",
          pk: recurringPk,
          description: CHANGED_WORKING_MEMO,
        },
      },
    },
    result: {
      data: {
        updateRecurringReservation: {
          pk: recurringPk,
          errors: null,
        },
      },
    },
  },
  {
    request: {
      query: UpdateStaffReservationDocument,
      variables: {
        input: { ...MUTATION_DATA.input, pk: startingPk },
        workingMemo: { ...MUTATION_DATA.workingMemo, pk: startingPk },
      },
    },
    result: {
      data: {
        staffReservationModify: { pk: startingPk, errors: null },
        updateReservationWorkingMemo: {
          workingMemo: CHANGED_WORKING_MEMO,
          errors: null,
        },
      },
    },
  },
  // NOTE apollo mocks are consumed on use (unlike MSW which uses functions) so create two of them
  ...[
    { fail: (options?.shouldFailAll || options?.shouldFailOnce) ?? false },
    { fail: options?.shouldFailAll ?? false },
  ].map(({ fail }) => ({
    request: {
      query: UpdateStaffReservationDocument,
      variables: {
        input: { ...MUTATION_DATA.input, pk: startingPk + 1 },
        workingMemo: { ...MUTATION_DATA.workingMemo, pk: startingPk + 1 },
      },
    },
    ...(fail
      ? { error: new Error("Error") }
      : {
          result: {
            data: {
              staffReservationModify: { pk: startingPk + 1, errors: null },
              updateReservationWorkingMemo: {
                workingMemo: CHANGED_WORKING_MEMO,
                errors: null,
              },
            },
          },
        }),
  })),
];

export const mocks = [
  // single reservation success
  {
    request: {
      query: UpdateStaffReservationDocument,
      variables: MUTATION_DATA,
    },
    result: {
      data: {
        staffReservationModify: { pk: 1, errors: null },
        updateReservationWorkingMemo: {
          workingMemo: CHANGED_WORKING_MEMO,
          errors: null,
        },
      },
    },
  },
  // single reservation Failure mocks: networkError once then succceed
  ...[{ fail: true }, { fail: false }].map(({ fail }) => ({
    request: {
      query: UpdateStaffReservationDocument,
      variables: {
        input: { ...MUTATION_DATA.input, pk: 101 },
        workingMemo: { ...MUTATION_DATA.workingMemo, pk: 101 },
      },
    },
    error: fail ? new Error("Error") : undefined,
    result: !fail
      ? {
          data: {
            staffReservationModify: { pk: 101, errors: null },
            updateReservationWorkingMemo: {
              workingMemo: CHANGED_WORKING_MEMO,
              errors: null,
            },
          },
        }
      : undefined,
  })),
  // networkError twice
  ...[1, 2].map(() => ({
    request: {
      query: UpdateStaffReservationDocument,
      variables: {
        input: { ...MUTATION_DATA.input, pk: 102 },
        workingMemo: { ...MUTATION_DATA.workingMemo, pk: 102 },
      },
    },
    error: new Error("Error"),
  })),
  // graphQLError
  {
    request: {
      query: UpdateStaffReservationDocument,
      variables: {
        input: { ...MUTATION_DATA.input, pk: 111 },
        workingMemo: { ...MUTATION_DATA.workingMemo, pk: 111 },
      },
    },
    result: {
      errors: [new GraphQLError("Error")],
    },
  },
  ...correctRecurringReservationQueryResult(21, 1),
  ...correctRecurringReservationQueryResult(31, 2, { shouldFailOnce: true }),
  ...correctRecurringReservationQueryResult(41, 3, { allDenied: true }),
  ...correctRecurringReservationQueryResult(51, 4, { shouldFailAll: true }),
];

export const mockReservation: ReservationNode = {
  pk: 1,
  begin: "2024-01-01T10:00:00+00:00",
  end: "2024-01-01T14:00:00+00:00",
  bufferTimeAfter: 0,
  bufferTimeBefore: 0,
  state: ReservationStateChoice.Confirmed,
  id: base64encode("ReservationNode:1"),
  reservationUnit: [],
  paymentOrder: [],
  workingMemo: "empty",
  handlingDetails: "",
};

const reservationUnit: ReservationUnitNode = {
  pk: 1,
  id: base64encode("ReservationUnitNode:1"),
  allowReservationsWithoutOpeningHours: true,
  applicationRoundTimeSlots: [],
  applicationRounds: [],
  bufferTimeAfter: 0,
  bufferTimeBefore: 0,
  authentication: Authentication.Weak,
  canApplyFreeOfCharge: false,
  contactInformation: "",
  description: "",
  equipments: [],
  images: [],
  isArchived: false,
  isDraft: false,
  name: "",
  paymentTypes: [],
  pricings: [],
  purposes: [],
  qualifiers: [],
  requireIntroduction: false,
  requireReservationHandling: false,
  reservationBlockWholeDay: false,
  reservationCancelledInstructions: "",
  reservationConfirmedInstructions: "",
  reservationKind: ReservationKind.DirectAndSeason,
  reservationPendingInstructions: "",
  reservationStartInterval: ReservationStartInterval.Interval_15Mins,
  resources: [],
  services: [],
  spaces: [],
  maxPersons: 10,
  uuid: "be4fa7a2-05b7-11ee-be56-0242ac120004",
};

export const mockRecurringReservation: ReservationNode = {
  ...mockReservation,
  pk: 21,
  id: base64encode("ReservationNode:21"),
  recurringReservation: {
    pk: 1,
    created: "2021-09-01T10:00:00+00:00",
    description: "",
    reservations: [],
    id: base64encode("RecurringReservationNode:1"),
    name: "recurring",
    reservationUnit,
    rejectedOccurrences: [],
  },
};
