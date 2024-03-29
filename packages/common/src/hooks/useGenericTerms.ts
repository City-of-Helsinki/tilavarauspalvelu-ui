import {
  type QueryTermsOfUseArgs,
  type Query,
  TermsType,
} from "../../types/gql-types";
import { useQuery } from "@apollo/client";
import { filterNonNullable } from "../helpers";
import { TERMS_OF_USE } from "../queries/terms";
import { genericTermsVariant } from "../const";

export function useGenericTerms() {
  const { data } = useQuery<Query, QueryTermsOfUseArgs>(TERMS_OF_USE, {
    variables: {
      termsType: TermsType.GenericTerms,
    },
  });

  const genericTerms = filterNonNullable(
    data?.termsOfUse?.edges?.map((n) => n?.node)
  ).find((n) => n.pk === genericTermsVariant.BOOKING);

  return genericTerms;
}
