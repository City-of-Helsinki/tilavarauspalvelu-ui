import React, { useRef, useState } from "react";
import { useTranslation, type TFunction } from "next-i18next";
import styled from "styled-components";
import { useRouter } from "next/router";
import {
  Card as HdsCard,
  IconArrowRight,
  IconCross,
  IconPen,
  Tag as HdsTag,
} from "hds-react";
import { parseISO } from "date-fns";
import { breakpoints } from "common/src/common/style";
import { type ApplicationType } from "common/types/gql-types";
import {
  isActive,
  applicationUrl,
  getReducedApplicationStatus,
} from "@/modules/util";
import { cancelApplication } from "@/modules/api";
import { BlackButton } from "@/styles/util";
import { getApplicationRoundName } from "@/modules/applicationRound";
import ConfirmationModal, { ModalRef } from "../common/ConfirmationModal";
import { CenterSpinner } from "../common/common";

const Card = styled(HdsCard)`
  border-width: 0;
  padding-inline: var(--spacing-s);
  padding-block: var(--spacing-s);
  margin-bottom: var(--spacing-m);
  width: auto;
  grid-template-columns: 1fr;
  display: block;

  @media (min-width: ${breakpoints.m}) {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--spacing-m);
  }
`;

const Tag = styled(HdsTag)`
  && {
    color: var(--color-white);
    background-color: var(--tilavaraus-blue);
    font-family: var(--font-regular);
  }
`;

const GreenTag = styled(Tag)`
  && {
    background-color: var(--tilavaraus-green);
  }
`;

const YellowTag = styled(Tag)`
  && {
    background-color: var(--tilavaraus-yellow);
    color: var(--color-black);
  }
`;

const Buttons = styled.div`
  font-family: var(--font-medium);
  font-size: var(--fontsize-body-s);
  margin-top: var(--spacing-m);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);

  @media (min-width: ${breakpoints.s}) {
    flex-direction: row;
    gap: var(--spacing-s);
  }

  @media (min-width: ${breakpoints.m}) {
    flex-direction: column;
    align-items: flex-end;
    justify-content: flex-end;

    > button {
      width: 100%;
    }
  }

  @media (min-width: ${breakpoints.l}) {
    flex-direction: row;
  }
`;

const Applicant = styled.div`
  font-family: var(--font-regular);
  font-size: var(--fontsize-body-m);
  margin-top: var(--spacing-xs);
  margin-bottom: var(--spacing-s);
  padding-right: var(--spacing-m);
`;

const RoundName = styled.div`
  margin-top: var(--spacing-xs);
  font-size: var(--fontsize-heading-m);
  font-family: var(--font-bold);
  margin-bottom: 0;

  @media (max-width: ${breakpoints.s}) {
    font-size: var(--fontsize-heading-m);
  }
`;

const Modified = styled.div`
  font-size: var(--fontsize-body-m);
  font-family: var(--font-regular);
  color: var(--color-black-70);
  margin-top: var(--spacing-l);

  @media (min-width: ${breakpoints.s}) {
    margin-top: var(--spacing-xl);
  }
`;

const StyledButton = styled(BlackButton).attrs({
  variant: "secondary",
  size: "small",
})`
  white-space: nowrap;

  svg {
    min-width: 24px;
  }

  @media (max-width: ${breakpoints.s}) {
    width: 100%;
  }
`;
type Props = {
  application: ApplicationType;
  actionCallback: (string: "error" | "cancel") => Promise<void>;
};

const getApplicant = (application: ApplicationType, t: TFunction): string => {
  if (application.organisation) {
    return t("applicationCard:organisation", {
      type: t(
        `applicationCard:applicantType.${application.applicantType?.toLocaleLowerCase()}`
      ),
      name: application.organisation?.name || t("applicationCard:noName"),
    });
  }
  if (application.contactPerson) {
    return t("applicationCard:person");
  }

  return "";
};

const ApplicationCard = ({
  application,
  actionCallback,
}: Props): JSX.Element | null => {
  const [state, setState] = useState<"ok" | "cancelling">("ok");
  const { t } = useTranslation();
  const router = useRouter();
  const { applicationRound } = application;
  const editable = isActive(
    applicationRound.applicationPeriodBegin,
    applicationRound.applicationPeriodEnd
  );

  const reducedApplicationStatus = getReducedApplicationStatus(
    application.status ?? undefined
  );

  let C = Tag;
  if (reducedApplicationStatus === "draft") {
    C = YellowTag;
  }
  if (reducedApplicationStatus === "sent") {
    C = GreenTag;
  }

  const cancel = async () => {
    setState("cancelling");
    try {
      if (!application.pk) {
        throw new Error("No application pk");
      }
      await cancelApplication(application.pk);
      actionCallback("cancel");
    } catch (e) {
      actionCallback("error");
      setState("ok");
    }
  };

  const modal = useRef<ModalRef>();
  return (
    <Card border key={application.pk} data-testid="applications__card--wrapper">
      <div>
        <C>{t(`applicationCard:status.${reducedApplicationStatus}`)}</C>
        <RoundName>{getApplicationRoundName(applicationRound)}</RoundName>
        <Applicant>
          {application.applicantType !== null
            ? getApplicant(application, t)
            : ""}
        </Applicant>
        <Modified>
          {application.lastModifiedDate
            ? t("applicationCard:saved", {
                date: parseISO(application.lastModifiedDate),
              })
            : ""}
        </Modified>
      </div>
      <Buttons>
        {state === "cancelling" ? (
          <CenterSpinner />
        ) : (
          <StyledButton
            aria-label={t("applicationCard:cancel")}
            onClick={() => {
              modal?.current?.open();
            }}
            disabled={!editable}
            iconRight={<IconCross aria-hidden />}
          >
            {t("applicationCard:cancel")}
          </StyledButton>
        )}
        <StyledButton
          aria-label={t("applicationCard:edit")}
          disabled={!editable}
          onClick={() => {
            if (application.pk != null) {
              router.push(`${applicationUrl(application.pk)}/page1`);
            }
          }}
          iconRight={<IconPen aria-hidden />}
        >
          {t("applicationCard:edit")}
        </StyledButton>
        <StyledButton
          aria-label={t("applicationCard:view")}
          onClick={() => {
            if (application.pk != null) {
              router.push(`${applicationUrl(application.pk)}/view`);
            }
          }}
          iconRight={<IconArrowRight aria-hidden />}
        >
          {t("applicationCard:view")}
        </StyledButton>
      </Buttons>
      <ConfirmationModal
        id="application-card-modal"
        heading={t("applicationCard:cancelHeading")}
        content={t("applicationCard:cancelContent")}
        ref={modal}
        onOk={cancel}
        cancelLabel={t("common:close")}
      />
    </Card>
  );
};

export default ApplicationCard;
