import React from "react";
import styled from "styled-components";
import { ReservationUnit } from "../../modules/types";

type Props = {
  reservationUnit: ReservationUnit;
};

const Wrapper = styled.div``;

const ReservationDialog = ({ reservationUnit }: Props): JSX.Element => {
  return <Wrapper>{reservationUnit.name}</Wrapper>;
};

export default ReservationDialog;
