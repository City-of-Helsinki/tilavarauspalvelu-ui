import { Button, IconPlusCircleFill } from "hds-react";
import React from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import styled from "styled-components";
import { useQuery } from "@apollo/client";
import type { Query, QueryUnitArgs } from "common/types/gql-types";
import { ContentContainer, WideContainer } from "@/styles/layout";
import Loader from "../Loader";
import { ResourcesTable } from "./ResourcesTable";
import { SpacesTable } from "./SpacesTable";
import SubPageHead from "./SubPageHead";
import Modal, { useModal as useHDSModal } from "../HDSModal";
import { NewSpaceModal } from "../Spaces/space-editor/new-space-modal/NewSpaceModal";
import { NewResourceModal } from "../Resources/resource-editor/NewResourceModal";
import { UNIT_QUERY } from "@/common/queries";
import { base64encode } from "common/src/helpers";
import { useNotification } from "@/context/NotificationContext";
import Error404 from "@/common/Error404";

interface IProps {
  [key: string]: string;
  unitPk: string;
}

const TableHead = styled.div`
  display: flex;
  margin: 2em 0;
  padding-left: 2.5em;
`;

const Title = styled.div`
  font-size: var(--fontsize-heading-l);
  font-family: var(--tilavaraus-admin-font-bold);
`;

const ActionButton = styled(Button)`
  margin-left: auto;
  padding: 0;
  span {
    padding: 0;
    color: var(--color-black);
    font-family: var(--tilavaraus-admin-font-bold);
  }
`;

/// The unit specific space and resources listing
function SpacesResources(): JSX.Element {
  const { t } = useTranslation();
  const unitPk = Number(useParams<IProps>().unitPk);

  const newSpacesButtonRef = React.createRef<HTMLButtonElement>();
  const newResourceButtonRef = React.createRef<HTMLButtonElement>();

  const { notifyError } = useNotification();

  const id = base64encode(`UnitNode:${unitPk}`);
  const {
    data,
    refetch,
    loading: isLoading,
  } = useQuery<Query, QueryUnitArgs>(UNIT_QUERY, {
    variables: { id },
    fetchPolicy: "network-only",
    onError: () => {
      notifyError("errors.errorFetchingData");
    },
  });

  const {
    open: newSpaceDialogIsOpen,
    openModal: openNewSpaceModal,
    closeModal: closeNewSpaceModal,
  } = useHDSModal();

  const {
    openWithContent,
    modalContent,
    open: isNewResourceModalOpen,
    closeModal: closeNewResourceModal,
  } = useHDSModal();

  if (isLoading) {
    return <Loader />;
  }

  const { unit } = data ?? {};
  // TODO this should be an error
  if (unit == null) {
    return <Error404 />;
  }

  const resources = unit.spaces?.flatMap((s) => s?.resourceSet);

  return (
    <ContentContainer>
      <Modal
        id="space-modal"
        open={newSpaceDialogIsOpen}
        close={() => closeNewSpaceModal()}
        afterCloseFocusRef={newSpacesButtonRef}
      >
        <NewSpaceModal
          unit={unit}
          closeModal={() => closeNewSpaceModal()}
          refetch={refetch}
        />
      </Modal>
      <SubPageHead title={t("Unit.spacesAndResources")} unit={unit} />
      <WideContainer>
        <TableHead>
          <Title>{t("Unit.spaces")}</Title>
          <ActionButton
            ref={newSpacesButtonRef}
            iconLeft={<IconPlusCircleFill />}
            variant="supplementary"
            onClick={() => openNewSpaceModal()}
          >
            {t("Unit.addSpace")}
          </ActionButton>
        </TableHead>
      </WideContainer>
      <SpacesTable unit={unit} refetch={refetch} />
      <WideContainer>
        <TableHead>
          <Title>{t("Unit.resources")}</Title>
          <ActionButton
            disabled={unit.spaces.length === 0}
            iconLeft={<IconPlusCircleFill />}
            variant="supplementary"
            onClick={() => {
              openWithContent(
                <NewResourceModal
                  spacePk={0}
                  unit={unit}
                  closeModal={closeNewResourceModal}
                  refetch={refetch}
                />
              );
            }}
          >
            {t("Unit.addResource")}
          </ActionButton>
        </TableHead>
      </WideContainer>
      <ResourcesTable unit={unit} resources={resources} refetch={refetch} />
      <Modal
        id="resource-modal"
        open={isNewResourceModalOpen}
        close={closeNewResourceModal}
        afterCloseFocusRef={newResourceButtonRef}
      >
        {modalContent}
      </Modal>
    </ContentContainer>
  );
}

export default SpacesResources;
