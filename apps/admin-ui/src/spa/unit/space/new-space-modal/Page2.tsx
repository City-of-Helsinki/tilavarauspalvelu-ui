import React from "react";
import { useTranslation } from "react-i18next";
import {
  Button,
  ButtonVariant,
  Dialog,
  IconArrowLeft,
  IconCheck,
  LoadingSpinner,
} from "hds-react";
import type { UnitQuery } from "@gql/gql-types";
import { CustomDialogHeader } from "@/component/CustomDialogHeader";
import {
  Address,
  Name,
  Parent,
  StyledTag,
  UnitInfo,
} from "./modules/newSpaceModal";
import { parseAddress } from "@/common/util";
import { SpaceForm, type SpaceUpdateForm } from "../SpaceForm";
import { FormErrorSummary } from "@/common/FormErrorSummary";
import { UseFormReturn } from "react-hook-form";
import { DialogActionsButtons } from "@/styles/util";

type Props = {
  unit: UnitQuery["unit"];
  closeModal: () => void;
  hasFixedParent: boolean;
  onPrevPage: () => void;
  form: UseFormReturn<SpaceUpdateForm>;
};

export function Page2({
  unit,
  onPrevPage,
  closeModal,
  hasFixedParent,
  form,
}: Props): JSX.Element {
  const { t } = useTranslation();
  const { watch, formState } = form;
  const { errors, isDirty, isSubmitting } = formState;

  const parentPk = watch("parent") ?? null;
  const parentName = unit?.spaces.find(
    (space) => space.pk === parentPk
  )?.nameFi;

  return (
    <>
      <CustomDialogHeader
        title={t(
          hasFixedParent
            ? "SpaceModal.page2.subSpaceModalTitle"
            : "SpaceModal.page2.modalTitle"
        )}
        extras={<StyledTag>{`${t("SpaceModal.phase")} 2/2`}</StyledTag>}
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
            <Name>{unit?.nameFi}</Name>
            <Parent>{parentName}</Parent>
          </div>
          {unit?.location != null && (
            <Address>{parseAddress(unit?.location)}</Address>
          )}
        </UnitInfo>
        <div>
          <FormErrorSummary errors={errors} />
          <SpaceForm form={form} />
        </div>
      </Dialog.Content>
      <DialogActionsButtons>
        <Button
          onClick={onPrevPage}
          variant={ButtonVariant.Supplementary}
          iconStart={<IconArrowLeft aria-hidden="true" />}
          disabled={isSubmitting}
        >
          {t("SpaceModal.page2.prevButton")}
        </Button>
        <Button
          type="submit"
          variant={isSubmitting ? ButtonVariant.Clear : ButtonVariant.Primary}
          iconStart={isSubmitting ? <LoadingSpinner small /> : undefined}
          disabled={!isDirty || isSubmitting}
        >
          {t("SpaceModal.page2.createButton")}
        </Button>
      </DialogActionsButtons>
    </>
  );
}
