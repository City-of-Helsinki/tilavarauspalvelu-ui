import { useSession } from "@/hooks/auth";
import { UserPermissionChoice, useCheckPermissionsQuery } from "@gql/gql-types";
import { gql } from "@apollo/client";

export const CheckPermissionsQuery = gql`
  query CheckPermissions(
    $permission: UserPermissionChoice!
    $units: [Int!]
    $requireAll: Boolean = false
  ) {
    checkPermissions(
      permission: $permission
      units: $units
      requireAll: $requireAll
    ) {
      hasPermission
    }
  }
`;

export function useCheckPermission({
  units,
  permission,
  requireAll = false,
}: {
  units: number[];
  permission: UserPermissionChoice;
  requireAll?: boolean;
}) {
  const { user } = useSession();
  const {
    data: permissionsData,
    loading,
    error,
  } = useCheckPermissionsQuery({
    variables: {
      permission,
      units,
      requireAll,
    },
  });

  const perms = permissionsData?.checkPermissions;

  return {
    user,
    hasPermission: perms?.hasPermission,
    isLoading: loading,
    error,
  };
}
