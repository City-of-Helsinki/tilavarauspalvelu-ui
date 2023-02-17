import { OptionType } from "common/types/common";
import { IconGroup, IconUser } from "hds-react";
import React from "react";
import styled from "styled-components";
import { fontMedium, fontRegular } from "common/src/common/typography";
import {
  ReservationMetadataSetType,
  ReservationsReservationReserveeTypeChoices,
  ReservationUnitType,
} from "common/types/gql-types";
import ReservationFormField from "common/src/reservation-form/ReservationFormField";
import { Inputs, Reservation } from "common/src/reservation-form/types";
import RadioButtonWithImage from "common/src/reservation-form/RadioButtonWithImage";
import camelCase from "lodash/camelCase";

import {
  GroupHeading,
  Subheading,
  TwoColumnContainer,
} from "common/src/reservation-form/styles";
import { ReactComponent as IconPremises } from "../../../images/icon_premises.svg";
import { useReservationTranslation } from "./hooks";

// TODO this file should be split logically
// TODO this file should be renamed because it's only used by Metadata (that is not metadata)
// TODO this file should be in common since ui uses the same thing
// TODO this is duplicated in the ui part
type Props = {
  reservationUnit: ReservationUnitType;
  reserveeType?: ReservationsReservationReserveeTypeChoices;
  setReserveeType: React.Dispatch<
    React.SetStateAction<ReservationsReservationReserveeTypeChoices | undefined>
  >;
  reservation: Reservation;
  generalFields: string[];
  reservationApplicationFields: string[];
  options: Record<string, OptionType[]>;
};

const Container = styled.div`
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

const ReserveeTypeContainer = styled.div`
  display: flex;
  margin-bottom: var(--spacing-3-xl);
  width: 100%;
  gap: var(--spacing-xs);
  flex-wrap: wrap;
`;

const InfoHeading = styled(Subheading)`
  margin: "0 0 var(--spacing-xs)";
`;

const ReserverInfoHeading = styled(Subheading)`
  margin: "var(--spacing-layout-m) 0 var(--spacing-xs)";
`;

const ReservationApplicationFieldsContainer = styled(TwoColumnContainer)`
  margin: "var(--spacing-layout-m) 0 var(--spacing-layout-m)";
`;

const reserveeOptions = [
  {
    id: ReservationsReservationReserveeTypeChoices.Individual,
    icon: <IconUser aria-hidden />,
  },
  {
    id: ReservationsReservationReserveeTypeChoices.Nonprofit,
    icon: <IconGroup aria-hidden />,
  },
  {
    id: ReservationsReservationReserveeTypeChoices.Business,
    icon: <IconPremises width="24" height="24" aria-hidden />,
  },
];

const SubheadingByType = ({
  reserveeType,
  index,
  field,
  t,
}: {
  reserveeType: ReservationsReservationReserveeTypeChoices;
  index: number;
  field: string;
  t: (key: string) => string;
}) => {
  const headingForNonProfit =
    reserveeType === ReservationsReservationReserveeTypeChoices.Nonprofit &&
    index === 0;

  const headingForNonProfitContactInfo =
    reserveeType === ReservationsReservationReserveeTypeChoices.Nonprofit &&
    field === "reserveeFirstName";

  const headingForCompanyInfo =
    reserveeType === ReservationsReservationReserveeTypeChoices.Business &&
    index === 0;

  const headingForContactInfo =
    reserveeType === ReservationsReservationReserveeTypeChoices.Business &&
    field === "reserveeFirstName";

  return (
    <>
      {headingForNonProfit && (
        <GroupHeading style={{ marginTop: 0 }}>
          {t("reservationApplication:label.headings.nonprofitInfo")}
        </GroupHeading>
      )}
      {headingForNonProfitContactInfo && (
        <GroupHeading>
          {t("reservationApplication:label.headings.contactInfo")}
        </GroupHeading>
      )}
      {headingForCompanyInfo && (
        <GroupHeading style={{ marginTop: 0 }}>
          {t("reservationApplication:label.headings.companyInfo")}
        </GroupHeading>
      )}{" "}
      {headingForContactInfo && (
        <GroupHeading>
          {t("reservationApplication:label.headings.contactInfo")}
        </GroupHeading>
      )}
    </>
  );
};

const ReservationFormFields = ({
  fields,
  reservation,
  options,
  // subheading is needed because application form uses it and requires index / field data to render it
  hasSubheading,
  reserveeType,
  metadata,
  params,
}: {
  fields: string[];
  reservation: Reservation;
  // TODO this is bad it just hides unsafe types behind a keymap
  options: Record<string, OptionType[]>;
  hasSubheading?: boolean;
  reserveeType?: ReservationsReservationReserveeTypeChoices;
  metadata?: ReservationMetadataSetType;
  params?: { numPersons: { min: number; max: number } };
}) => {
  const { t } = useReservationTranslation();

  const fieldsExtended = fields.map((field) => ({
    field,
    required: (metadata?.requiredFields || [])
      .filter((x): x is string => x != null)
      .map(camelCase)
      .includes(field),
  }));

  return (
    <>
      {fieldsExtended.map(({ field, required }, index) => (
        <>
          {hasSubheading && reserveeType != null && (
            <SubheadingByType
              reserveeType={reserveeType}
              index={index}
              field={field}
              t={t}
            />
          )}
          <ReservationFormField
            key={`key-${field}`}
            field={field as unknown as keyof Inputs}
            options={options}
            required={required}
            reserveeType={reserveeType}
            reservation={reservation}
            params={params}
            t={t}
            data={{
              // The link that this uses is only on the ui side of this
              subventionLabel: t(
                "reservationApplication:label.common.applyingForFreeOfChargeWithLink"
              ),
            }}
          />
        </>
      ))}
    </>
  );
};

// This is NOT a ReservationForm
// this is a metadata section / part of that form
// you can confirm this by removing all metadata in the backend
// this form part is never rendered
// Though there is a super component that is the only consumer of this component
// This is the part that does Layout and Rendering while that other one is a logic Wrapper for this
const ReservationForm = ({
  reservationUnit,
  reserveeType,
  setReserveeType,
  generalFields,
  reservation,
  reservationApplicationFields,
  options,
}: Props) => {
  const { t } = useReservationTranslation();

  if (!reservationUnit.metadataSet) {
    return null;
  }

  const isTypeSelectable =
    reservationUnit?.metadataSet?.supportedFields?.includes("reservee_type") ??
    false;

  return (
    <Container>
      <InfoHeading>{t("ReservationDialog.reservationInfo")}</InfoHeading>
      <TwoColumnContainer>
        <ReservationFormFields
          options={options}
          fields={generalFields}
          metadata={reservationUnit.metadataSet}
          reservation={reservation}
          reserveeType={reserveeType}
          params={{
            // TODO numPersons should take undefined for example for max unlimited
            numPersons: {
              min: reservationUnit.minPersons ?? 0,
              max: !Number.isNaN(reservationUnit.maxPersons)
                ? Number(reservationUnit.maxPersons)
                : 0,
            },
          }}
        />
      </TwoColumnContainer>
      <ReserverInfoHeading>
        {t("reservationCalendar:reserverInfo")}
      </ReserverInfoHeading>
      {isTypeSelectable && (
        <>
          <p>{t("reservationApplication:reserveeTypePrefix")}</p>
          <ReserveeTypeContainer data-testid="reservation__checkbox--reservee-type">
            {reserveeOptions.map(({ id, icon }) => (
              <RadioButtonWithImage
                key={id}
                id={id}
                label={t(
                  `reservationApplication:reserveeTypes.labels.${id.toLocaleLowerCase()}`
                )}
                onClick={() => {
                  setReserveeType(id);
                }}
                icon={icon}
                checked={reserveeType === id}
              />
            ))}
          </ReserveeTypeContainer>
        </>
      )}
      <ReservationApplicationFieldsContainer>
        <ReservationFormFields
          fields={reservationApplicationFields}
          reservation={reservation}
          options={options}
          hasSubheading
          reserveeType={reserveeType}
        />
      </ReservationApplicationFieldsContainer>
    </Container>
  );
};

export default ReservationForm;
