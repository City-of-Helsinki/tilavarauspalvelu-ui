import { gql } from "@apollo/client";

/* WIP, perhaps we should autogenerate these under common module for both uis to use */
export type SpaceCreateMutationInput = {
  key?: string;
  name: string;
  parentId: string;
  buildingId: string;
  surfaceArea: number;
  districtId: string;
  clientMutationId?: string;
};

export type ErrorType = {
  field: string;
  messages: string[];
};

export type SpaceCreateMutationPayload = {
  id: number;
  errors: ErrorType;
  clientMutationId: string;
};

// WIP api is broken...
// eslint-disable-next-line @typescript-eslint/naming-convention
export const CREATE_SPACE = gql`
  mutation createSpace($input: SpaceCreateMutationInput!) {
    createSpace(input: $input) {
      id
      errors {
        field
        messages
      }
    }
  }
`;
