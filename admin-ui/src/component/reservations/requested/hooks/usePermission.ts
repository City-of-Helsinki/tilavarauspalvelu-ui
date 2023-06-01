import { useQuery } from "@apollo/client";
import { type Query, type ReservationType } from "common/types/gql-types";
import { useAuthState } from "../../../../context/AuthStateContext";
import { CURRENT_USER } from "../../../../context/queries";

const usePermission = () => {
  const { data: user } = useQuery<Query>(CURRENT_USER);
  const { hasPermission: baseHasPermission } = useAuthState().authState;

  const hasPermission = (
    reservation: ReservationType,
    permissionName:
      | "can_manage_reservations"
      | "can_comment_reservations"
      | "can_view_reservations",
    includeOwn = true
  ) => {
    // console.log('has permission check for reservation: ', re)
    const serviceSectorPks =
      reservation?.reservationUnits?.[0]?.unit?.serviceSectors
        ?.map((x) => x?.pk)
        ?.filter((x): x is number => x != null) ?? [];

    const unitPk = reservation?.reservationUnits?.[0]?.unit?.pk ?? undefined;

    const permission = baseHasPermission(
      permissionName,
      unitPk,
      serviceSectorPks
    );

    const isUsersOwnReservation =
      reservation?.user?.pk === user?.currentUser?.pk;

    const ownPermissions =
      includeOwn && isUsersOwnReservation
        ? baseHasPermission(
            "can_create_staff_reservations",
            unitPk,
            serviceSectorPks
          )
        : false;

    return permission || ownPermissions;
  };

  return {
    hasPermission,
  };
};

export default usePermission;
