import { Address, ContactPerson, Organisation } from "common/types/common";

type ApplicationForm = {
  organisation?: Organisation;
  contactPerson?: ContactPerson;
  billingAddress?: Address;
  additionalInformation?: string;
  homeCityId?: number;
};

export default ApplicationForm;
