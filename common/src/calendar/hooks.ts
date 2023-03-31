import { t as plainT } from "i18next";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";

// Common directory problem
// useTranslation hook doesn't work with CRA
// { t } from i18next doesn't work with NextJs
// So a hack hook till we can fix all translations working with the same method (useTranslation probably)
// without this we'd have to individually prop drill t function into all common components.
export const useTranslationHack = () => {
  const [isNext, setIsNext] = useState(false);
  useEffect(() => {
    if (document.querySelector("#__next")) {
      setIsNext(true);
    }
  }, []);

  const { t: nextT } = useTranslation();

  return { t: isNext ? nextT : plainT };
};
