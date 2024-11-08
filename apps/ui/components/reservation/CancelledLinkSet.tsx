import React from "react";
import { useTranslation } from "next-i18next";
import { IconArrowRight, IconSignout } from "hds-react";
import { signOut } from "common/src/browserHelpers";
import { getSingleSearchPath } from "@/modules/urls";
import { IconButton } from "common/src/components";
import { Flex } from "common/styles/util";

type Props =
  | {
      apiBaseUrl: string;
    }
  | {
      reservationUnitHome: string;
      apiBaseUrl: string;
    };

function BaseLinkSet(props: Props): JSX.Element {
  const { apiBaseUrl } = props;
  const { t } = useTranslation();
  const resUnitUrl =
    "reservationUnitHome" in props ? props.reservationUnitHome : null;

  return (
    <Flex>
      {resUnitUrl ? (
        <IconButton
          href={resUnitUrl}
          label={t("reservations:backToReservationUnit")}
          icon={<IconArrowRight aria-hidden />}
        />
      ) : (
        <IconButton
          href={getSingleSearchPath()}
          icon={<IconArrowRight size="m" aria-hidden="true" />}
          label={t("reservations:backToSearch")}
        />
      )}
      <IconButton
        href="/"
        label={t("common:gotoFrontpage")}
        icon={<IconArrowRight size="m" aria-hidden="true" />}
      />
      <IconButton
        onClick={() => signOut(apiBaseUrl)}
        label={t("common:logout")}
        icon={<IconSignout size="m" aria-hidden="true" />}
      />
    </Flex>
  );
}

export function CancelledLinkSet({ apiBaseUrl }: Props) {
  return <BaseLinkSet apiBaseUrl={apiBaseUrl} />;
}

export function BackLinkList(props: {
  reservationUnitHome: string;
  apiBaseUrl: string;
}): JSX.Element {
  return <BaseLinkSet {...props} />;
}
