import { useTranslation } from "next-i18next";
import { useReservationDenyReasonsQuery } from "@gql/gql-types";
import { filterNonNullable } from "common/src/helpers";
import { errorToast } from "common/src/common/toast";

export function useDenyReasonOptions() {
  const { t } = useTranslation();

  const { data, loading } = useReservationDenyReasonsQuery({
    onError: () => {
      errorToast({ text: t("errors.errorFetchingData") });
    },
  });
  const { reservationDenyReasons } = data ?? {};
  const denyReasonOptions = filterNonNullable(
    reservationDenyReasons?.edges.map((x) => x?.node)
  ).map((dr) => ({
    value: dr?.pk ?? 0,
    label: dr?.reasonFi ?? "",
  }));

  return { options: denyReasonOptions, loading };
}
