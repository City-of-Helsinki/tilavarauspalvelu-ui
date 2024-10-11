import React from "react";
import { useTranslation } from "next-i18next";
import { ApplicantTypeChoice, type ApplicationQuery } from "@gql/gql-types";
import {
  ApplicationInfoContainer,
  InfoItemContainer,
  InfoItem,
} from "./styled";

const LabelValue = ({
  label,
  value,
}: {
  label: string;
  value?: string | number | null;
}) => {
  return (
    <InfoItemContainer
      className={
        label === "preview.organisation.billingAddress" ? "fullWidth" : ""
      }
    >
      <InfoItem>
        <h4 className="info-label">{label}</h4>
        <p>{value}</p>
      </InfoItem>
    </InfoItemContainer>
  );
};
type Node = NonNullable<ApplicationQuery["application"]>;
export function ApplicantInfoPreview({
  application,
}: {
  application: Node;
}): JSX.Element {
  const { t } = useTranslation();
  const applicant = {
    firstName: application.contactPerson?.firstName,
    lastName: application.contactPerson?.lastName,
    email: application.contactPerson?.email,
    phoneNumber: application.contactPerson?.phoneNumber,
  };
  const contactPersonName = `${applicant.firstName} ${applicant.lastName}`;
  const contactInfo = `${applicant.phoneNumber} / ${applicant.email}`;
  const addressString = `${application.organisation?.address?.streetAddressFi}, ${application.organisation?.address?.postCode} ${application.organisation?.address?.cityFi}`;
  const billingAddressString = `${application.billingAddress?.streetAddressFi}, ${application.billingAddress?.postCode} ${application.billingAddress?.cityFi}`;
  return (
    <ApplicationInfoContainer>
      {application.applicantType == null ? (
        // TODO translate (though this is more a system error than a user error)
        <div style={{ gridColumn: "1 / -1" }}>ERROR: applicantType is null</div>
      ) : application.applicantType !== ApplicantTypeChoice.Individual ? (
        <>
          <LabelValue
            label={t("application:preview.organisation.name")}
            value={application.organisation?.nameFi}
          />
          <LabelValue
            label={t("application:preview.organisation.coreBusiness")}
            value={application.organisation?.coreBusinessFi}
          />
          <LabelValue
            label={t("application:preview.organisation.registrationNumber")}
            value={application.organisation?.identifier}
          />
        </>
      ) : null}
      <LabelValue
        label={t("application:preview.contactPerson")}
        value={contactPersonName}
      />
      <LabelValue
        label={t("application:preview.contactInfo")}
        value={contactInfo}
      />
      <LabelValue
        label={t("application:preview.address")}
        value={addressString}
      />
      {application.billingAddress && (
        <LabelValue
          label={t("application:preview.organisation.billingAddress")}
          value={billingAddressString}
        />
      )}
    </ApplicationInfoContainer>
  );
}
