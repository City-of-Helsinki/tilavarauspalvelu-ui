import React from "react";
import { useTranslation } from "react-i18next";
import { omit } from "lodash";
import {
  Button,
  Dialog,
  IconArrowLeft,
  IconCheck,
  IconPlusCircleFill,
  NumberInput,
  TextInput,
} from "hds-react";
import { FetchResult } from "@apollo/client";
import {
  SpaceCreateMutationInput,
  SpaceCreateMutationPayload,
  UnitByPkType,
} from "../../../../common/gql-types";
import { CustomDialogHeader } from "../../../CustomDialogHeader";
import {
  Action,
  ActionButtons,
  Address,
  ButtonContainer,
  EditorColumns,
  EditorContainer,
  IconDelete,
  Name,
  NewRowButton,
  NextButton,
  Parent,
  RoundTag,
  State,
  UnitInfo,
} from "./newSpaceModal";
import { parseAddress } from "../../../../common/util";
import { languages } from "../../../../common/const";

const SpaceEditor = ({
  space,
  index,
  dispatch,
}: {
  space: SpaceCreateMutationInput;
  index: number;
  dispatch: React.Dispatch<Action>;
}) => {
  const { t } = useTranslation();

  return (
    <>
      <EditorContainer>
        <div>
          {languages.map((lang) => (
            <TextInput
              key={lang}
              required
              id={`name.${lang}`}
              label={t("SpaceModal.nameLabel", { lang })}
              placeholder={t("SpaceModal.namePlaceholder", {
                language: t(`language.${lang}`),
              })}
              onBlur={(e) => {
                dispatch({
                  type: "setSpaceName",
                  index,
                  name: e.target.value,
                  lang,
                });
              }}
              defaultValue=""
            />
          ))}

          <EditorColumns>
            <NumberInput
              defaultValue={space.surfaceArea || 0}
              id={`surfaceArea[${index}]`}
              label={t("SpaceModal.page2.surfaceAreaLabel")}
              helperText={t("SpaceModal.page2.surfaceAreaHelperText")}
              minusStepButtonAriaLabel={t("common.decreaseByOneAriaLabel")}
              plusStepButtonAriaLabel={t("common.increaseByOneAriaLabel")}
              onChange={(e) => {
                dispatch({
                  type: "setSpaceSurfaceArea",
                  index,
                  surfaceArea: Number(e.target.value),
                });
              }}
              step={1}
              type="number"
              min={0}
              max={10}
              required
            />
            <NumberInput
              defaultValue={space.surfaceArea || 0}
              id={`maxPersons[${index}]`}
              label={t("SpaceModal.page2.maxPersonsLabel")}
              minusStepButtonAriaLabel={t("common.decreaseByOneAriaLabel")}
              plusStepButtonAriaLabel={t("common.increaseByOneAriaLabel")}
              onChange={(e) => {
                dispatch({
                  type: "setSpaceMaxPersonCount",
                  index,
                  maxPersonCount: Number(e.target.value),
                });
              }}
              step={1}
              type="number"
              min={0}
              helperText={t("SpaceModal.page2.maxPersonsHelperText")}
              max={10}
              required
            />
            <TextInput
              id={`code[${index}]`}
              label={t("SpaceModal.page2.codeLabel")}
              placeholder={t("SpaceModal.page2.codePlaceholder")}
              defaultValue=""
              onChange={(e) => {
                dispatch({
                  type: "setSpaceCode",
                  index,
                  code: e.target.value,
                });
              }}
            />
          </EditorColumns>
        </div>
        <IconDelete
          tabIndex={0}
          onKeyPress={() => dispatch({ type: "delete", index })}
          onClick={() => dispatch({ type: "delete", index })}
        />
      </EditorContainer>
    </>
  );
};

const Page2 = ({
  editorState,
  unit,
  dispatch,
  closeModal,
  createSpace,
  onSave,
  onDataError,
  hasFixedParent,
}: {
  editorState: State;
  unit: UnitByPkType;
  dispatch: React.Dispatch<Action>;
  closeModal: () => void;
  createSpace: (
    variables: SpaceCreateMutationInput
  ) => Promise<FetchResult<{ createSpace: SpaceCreateMutationPayload }>>;
  onSave: () => void;
  onDataError: (message: string) => void;
  hasFixedParent: boolean;
}): JSX.Element => {
  const { t } = useTranslation();

  const nextEnabled =
    editorState.numSpaces > 0 && editorState.parentPk !== undefined;

  return (
    <>
      <CustomDialogHeader
        id="dialog-title"
        title={t(
          hasFixedParent
            ? "SpaceModal.page2.subSpaceModalTitle"
            : "SpaceModal.page2.modalTitle"
        )}
        extras={<RoundTag>{t("SpaceModal.phase")} 2/2</RoundTag>}
        close={closeModal}
      />
      <Dialog.Content>
        <p className="text-body" id="custom-dialog-content">
          {t(
            hasFixedParent
              ? "SpaceModal.page2.subSpaceInfo"
              : "SpaceModal.page2.info"
          )}
        </p>
        <UnitInfo>
          <IconCheck />
          <div>
            <Name>{unit.nameFi}</Name>
            <Parent>
              {editorState.parentPk
                ? editorState.parentName
                : t("SpaceModal.page2.newRootSpace")}
            </Parent>
          </div>
          {unit.location ? (
            <Address>{parseAddress(unit.location)}</Address>
          ) : null}
        </UnitInfo>
        {editorState.spaces.map((space, i) => (
          <SpaceEditor
            index={i}
            key={space.key}
            space={space as SpaceCreateMutationInput}
            dispatch={dispatch}
          />
        ))}
        <ButtonContainer>
          <NewRowButton
            variant="supplementary"
            iconLeft={<IconPlusCircleFill />}
            onClick={() => dispatch({ type: "addRow" })}
          >
            {t("SpaceModal.page2.addRowButton")}
          </NewRowButton>
        </ButtonContainer>
      </Dialog.Content>
      <ActionButtons>
        <Button
          onClick={() => dispatch({ type: "prevPage" })}
          variant="supplementary"
          iconLeft={<IconArrowLeft />}
        >
          {t("SpaceModal.page2.prevButton")}
        </Button>
        <NextButton
          disabled={!nextEnabled}
          loadingText={t("SpaceModal.page2.saving")}
          onClick={() => {
            const promises = Promise.allSettled(
              editorState.spaces.map((s) =>
                createSpace({
                  ...(omit(s, [
                    "key",
                    "locationType",
                    "parentId",
                  ]) as SpaceCreateMutationInput),
                  unitPk: editorState.unitPk,
                })
              )
            );

            promises
              .then((res) => {
                const succesful = res.filter(
                  (r) => r.status === "fulfilled" && !r.value.errors
                ) as PromiseFulfilledResult<
                  FetchResult<{ createSpace: SpaceCreateMutationPayload }>
                >[];

                if (succesful.length === editorState.spaces.length) {
                  onSave();
                  closeModal();
                } else {
                  onDataError(t("SpaceModal.page2.saveFailed"));
                }
              })
              .catch(() => {
                onDataError(t("SpaceModal.page2.saveFailed"));
              });
          }}
        >
          {t("SpaceModal.page2.createButton")}
        </NextButton>
      </ActionButtons>
    </>
  );
};

export default Page2;
