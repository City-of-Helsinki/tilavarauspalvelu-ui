import { formatErrorMessage } from "@/modules/util";
import { getApiErrors } from "common/src/apolloUtils";
import { errorToast } from "common/src/common/toast";
import { useTranslation } from "next-i18next";

export function useDisplayError() {
  const { t } = useTranslation();

  return function displayError(error: unknown) {
    const errs = getApiErrors(error);
    if (errs.length > 0) {
      const msgs = errs.map((e) => formatErrorMessage(t, e));
      for (const text of msgs) {
        errorToast({
          text,
        });
      }
    } else {
      errorToast({
        text: t("errors:general_error"),
      });
    }
  };
}
