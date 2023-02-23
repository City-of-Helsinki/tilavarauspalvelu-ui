/**
 *  First part of the Reservation process form
 *  This component needs to be wrapped inside a Form context
 */
import { OptionType } from "common/types/common";
import { IconArrowLeft, IconArrowRight } from "hds-react";
import React from "react";
import { useTranslation } from "next-i18next";
import styled from "styled-components";
import { fontMedium, fontRegular } from "common/src/common/typography";
import MetaFields from "common/src/reservation-form/MetaFields";
import {
  ReservationsReservationReserveeTypeChoices,
  ReservationUnitType,
} from "common/types/gql-types";
import { MediumButton } from "../../styles/util";
import { ActionContainer } from "./styles";
import { getTranslation } from "../../modules/util";
import InfoDialog from "../common/InfoDialog";
import { JustForMobile } from "../../modules/style/layout";
import { PinkBox, Subheading } from "../reservation-unit/ReservationUnitStyles";
import Sanitize from "../common/Sanitize";

type Props = {
  reservationUnit: ReservationUnitType;
  reserveeType: ReservationsReservationReserveeTypeChoices;
  setReserveeType: React.Dispatch<
    React.SetStateAction<ReservationsReservationReserveeTypeChoices>
  >;
  handleSubmit: () => void;
  generalFields: string[];
  reservationApplicationFields: string[];
  cancelReservation: () => void;
  options: Record<string, OptionType[]>;
};

const Form = styled.form`
  label {
    ${fontMedium};

    span {
      line-height: unset;
      transform: unset;
      margin-left: 0;
      display: inline;
      font-size: unset;
    }
  }

  input[type="radio"] + label {
    ${fontRegular};
  }
`;

const StyledActionContainer = styled(ActionContainer)`
  padding-top: var(--spacing-xl);
`;

const Step0 = ({
  reservationUnit,
  reserveeType,
  setReserveeType,
  handleSubmit,
  generalFields,
  reservationApplicationFields,
  cancelReservation,
  options,
}: Props): JSX.Element => {
  const { t } = useTranslation();

  // const openPricingTermsRef = useRef();
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  // FIXME (this is broken in an earlier commit where we typed the label properly)
  // This should not be a label but an extra React component that is rendered near the label
  // because labels are supposed to be text only (not buttons or links).
  // It isn't shown on the test server either because the link is not defined
  // TODO it should be an icon button, not a link (html semantics)
  /* subventionLabel: "FIXME" (
    <Trans
    i18nKey="reservationApplication:label.common.applyingForFreeOfChargeWithLink"
    defaults="Haen maksuttomuutta tai hinnan alennusta ja olen tutustunut <a />"
    components={{
      a: (
        <a
        href="#"
        ref={openPricingTermsRef}
        onClick={(e) => {
          e.preventDefault();
          setIsDialogOpen(true);
        }}
        >
          alennusperusteisiin
        </a>
      ),
    }}
    />
  ) */

  const termsOfUse = getTranslation(reservationUnit, "termsOfUse");

  return (
    <Form
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit();
      }}
    >
      <MetaFields
        reservationUnit={reservationUnit}
        options={options}
        reserveeType={reserveeType}
        setReserveeType={setReserveeType}
        generalFields={generalFields}
        reservationApplicationFields={reservationApplicationFields}
        t={t}
      />
      <InfoDialog
        id="pricing-terms"
        heading={t("reservationUnit:pricingTerms")}
        text={getTranslation(reservationUnit.pricingTerms, "text")}
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
      />
      {termsOfUse && (
        <JustForMobile>
          <PinkBox>
            <Subheading>
              {t("reservations:reservationInfoBoxHeading")}
            </Subheading>
            <Sanitize html={termsOfUse} />
          </PinkBox>
        </JustForMobile>
      )}
      <StyledActionContainer>
        <MediumButton
          variant="primary"
          type="submit"
          iconRight={<IconArrowRight aria-hidden />}
          data-test="reservation__button--update"
        >
          {t("reservationCalendar:nextStep")}
        </MediumButton>
        <MediumButton
          variant="secondary"
          iconLeft={<IconArrowLeft aria-hidden />}
          onClick={() => {
            cancelReservation();
          }}
          data-test="reservation__button--cancel"
        >
          {t("common:cancel")}
        </MediumButton>
      </StyledActionContainer>
    </Form>
  );
};

export default Step0;
