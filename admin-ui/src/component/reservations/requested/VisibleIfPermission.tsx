import React from "react";
import { useAuthState } from "../../../context/AuthStateContext";

type Props = {
  unitPk: number;
  serviceSectorPk?: number;
  permissionName: string;
  children: JSX.Element | JSX.Element[];
  otherwice?: JSX.Element | JSX.Element[];
};

const VisibleIfPermission = ({
  unitPk,
  serviceSectorPk,
  permissionName,
  children,
  otherwice,
}: Props): JSX.Element => {
  const { hasPermission } = useAuthState().authState;
  const permission = hasPermission(permissionName, unitPk, serviceSectorPk);
  if (!permission) {
    console.debug(
      "no permission to display content",
      permission,
      unitPk,
      serviceSectorPk
    );
  }

  return (
    <>
      {permission && children}
      {!permission && otherwice}
    </>
  );
};

export default VisibleIfPermission;
