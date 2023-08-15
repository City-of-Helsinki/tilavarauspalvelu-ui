import React from "react";
import { useSession } from "next-auth/react";
import { Permission } from "app/modules/permissionHelper";
import usePermission from "app/component/reservations/requested/hooks/usePermission";
import MainLander from "app/component/MainLander";

import Error403 from "./Error403";

const AuthorisationChecker = ({
  children,
  permission,
}: {
  children: React.ReactNode;
  permission?: Permission;
}) => {
  const { hasSomePermission } = usePermission();

  // Only allow logged in
  const { data: session } = useSession();
  if (!session?.user) {
    return <MainLander />;
  }

  // Only allow if user has permission
  if (permission && !hasSomePermission(permission)) {
    return <Error403 showLogoutSection />;
  }
  // TODO have a general hasAnyPermission
  if (!hasSomePermission(Permission.CAN_VIEW_RESERVATIONS)) {
    return <Error403 showLogoutSection />;
  }
  return <>{children}</>;
};

export default AuthorisationChecker;
