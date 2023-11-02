import { useMutation } from "@apollo/client";
import type {
  Mutation,
  MutationUpdateApplicationArgs,
  ApplicationUpdateMutationInput,
} from "common/types/gql-types";
import { UPDATE_APPLICATION_MUTATION } from "@/modules/queries/application";

export const useApplicationUpdate = () => {
  const [mutate, { error, loading: isLoading }] = useMutation<Mutation, MutationUpdateApplicationArgs>(
    UPDATE_APPLICATION_MUTATION,
    {
      /*
      onError: (e) => {
        console.warn("update application mutation failed: ", e);
        setError(`${t("application:error.saveFailed")}`);
      },
      */
    }
  );

  const update = async (input: ApplicationUpdateMutationInput) => {
    try {
      const response = await mutate({
        variables: {
          input,
        },
      });
      // TODO cleanup the error handling
      // TODO translate errors
      const { data, errors } = response;
      const { errors: mutErrors, pk } = data?.updateApplication ?? {};
      if (errors != null) {
        console.error("Error saving application: ", errors);
        // TOOD display to the user
        // setError("Error saving application");
        return 0;
      }
      if (mutErrors != null) {
        console.error("Mutation error saving application: ", errors);
        // TOOD display to the user
        // setError("Mutation error saving application");
        return 0;
      }
      // TODO do a refetch here instead of cache modification (after moving to fetch hook)
      return pk;
    } catch (e) {
      console.error("Error thrown while saving application: ", e);
      // setError("Error thrown while saving application");
      return 0;
    }
  }

  return [update, { error, isLoading }] as const;
}

