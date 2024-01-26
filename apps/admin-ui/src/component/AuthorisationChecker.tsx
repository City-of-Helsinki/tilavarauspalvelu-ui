import React, { Suspense } from "react";
import { useSession } from "@hooks/auth";
import { Permission } from "@modules/permissionHelper";
import { usePermissionSuspended } from "@hooks/usePermission";
import MainLander from "@component/MainLander";
import Loader from "@component/Loader";
import { Error403 } from "@component/error";

export function AuthorisationChecker({
  children,
  permission,
}: {
  children: React.ReactNode;
  permission?: Permission;
}) {
  const { hasAnyPermission, hasSomePermission } = usePermissionSuspended();

  const { isAuthenticated } = useSession();
  if (!isAuthenticated) {
    return <MainLander />;
  }

  const hasAccess = permission
    ? hasSomePermission(permission)
    : hasAnyPermission();

  // Use suspense to avoid flash of unauthorised content
  return (
    <Suspense fallback={<Loader />}>
      {hasAccess ? children : <Error403 />}
    </Suspense>
  );
}
