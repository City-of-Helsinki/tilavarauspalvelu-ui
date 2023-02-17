import { useTranslation } from "react-i18next";

// Custom hook to fix admin-ui lacking translation namespaces
export const useReservationTranslation = () => {
  const { t: originalT, ...rest } = useTranslation();

  /** 'til namespaces are used in admin-ui, strip away napespace, add prefix */
  const t = (key: string) =>
    key.indexOf(":") !== -1
      ? originalT(`ReservationDialog.${key.substring(key.indexOf(":") + 1)}`)
      : originalT(key);

  return { t, ...rest };
};
