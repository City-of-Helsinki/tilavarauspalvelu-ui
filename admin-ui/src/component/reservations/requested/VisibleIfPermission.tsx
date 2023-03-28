import React from "react";
import { useAuthState } from "../../../context/AuthStateContext";

type Props = {
  unitPk: number;
  serviceSectorPks: number[];
  permissionName: string;
  children: React.ReactNode;
  otherwise?: React.ReactNode;
};

const VisibleIfPermission = ({
  unitPk,
  serviceSectorPks,
  permissionName,
  children,
  otherwise,
}: Props): JSX.Element => {
  const { hasPermission } = useAuthState().authState;
  const permission = hasPermission(permissionName, unitPk, serviceSectorPks);

  return (
    <>
      {permission && children}
      {!permission && otherwise}
    </>
  );
};

const VisibleIfPermissionWrapper = (props: {
  unitPk?: number;
  serviceSectorPks: number[];
  permissionName: string;
  children: React.ReactNode;
  otherwise?: React.ReactNode;
}) => {
  const { unitPk } = props;
  // FIXME translations
  // FIXME should we display these as errors or log them somewhere or what?
  if (!unitPk) {
    return <div>No unit pk defined</div>;
  }
  if (props.serviceSectorPks.length === 0) {
    return <div>No service sectors defined</div>;
  }

  return <VisibleIfPermission {...props} unitPk={unitPk} />;
};

export default VisibleIfPermissionWrapper;
