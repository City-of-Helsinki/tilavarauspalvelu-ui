import React, { memo } from "react";
import { useParams } from "react-router-dom";
import { ContentContainer } from "../../../styles/layout";
import withMainMenu from "../../withMainMenu";
import SpaceEditor from "./SpaceEditor";

type Props = {
  unitPk: string;
  spacePk: string;
};

const SpaceEditorView = (): JSX.Element | null => {
  const { spacePk, unitPk } = useParams<Props>();

  const [space, unit] = [spacePk, unitPk].map(Number);

  if (!space) {
    return <ContentContainer>tilan tunniste virheellinen</ContentContainer>;
  }

  if (!unit) {
    return (
      <ContentContainer>Toimipisteen tunniste virheellinen</ContentContainer>
    );
  }

  return <SpaceEditor space={space} unit={unit} />;
};

export default memo(withMainMenu(SpaceEditorView));
