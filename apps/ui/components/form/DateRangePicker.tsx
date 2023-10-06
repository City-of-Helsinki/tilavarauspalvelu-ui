import { parse } from "date-fns";
import isBefore from "date-fns/isBefore";
import isValidDate from "date-fns/isValid";
import { DateInput } from "hds-react";
import React from "react";
import { useTranslation } from "next-i18next";
import styled from "styled-components";
import { toUIDate } from "common/src/common/util";
import { Language, type OptionType } from "common/types/common";
import { isValidDateString } from "../../modules/util";

const initDate = (date: Date | null): string => {
  return date ? toUIDate(date) : "";
};

export interface DateRangePickerProps {
  endDate: Date | null;
  startDate: Date | null;
  onChangeEndDate: (time: OptionType | null) => void;
  onChangeStartDate: (time: OptionType | null) => void;
  showHelperText?: boolean;
  labels?: { start?: string; end?: string };
  required?: { start?: boolean; end?: boolean };
  limits?: {
    startMinDate?: Date;
    startMaxDate?: Date;
    endMinDate?: Date;
    endMaxDate?: Date;
  };
}

const Wrapper = styled.div`
  & > div:not(:first-child) {
    margin-top: var(--spacing-s);
  }
`;

const DateRangePicker: React.FC<DateRangePickerProps> = ({
  endDate,
  startDate,
  onChangeEndDate,
  onChangeStartDate,
  showHelperText,
  labels,
  required,
  limits,
}) => {
  const [internalStartDateString, setInternalStartDateString] =
    React.useState<string>(() => initDate(startDate));
  const [internalEndDateString, setInternalEndDateString] =
    React.useState<string>(() => initDate(endDate));
  const [errors, setErrors] = React.useState({
    startDateIsInvalid: false,
    endDateIsInvalid: false,
  });

  const { t, i18n } = useTranslation();
  const helperText = t("dateSelector:infoDate");

  const internalStartDate = parse(
    internalStartDateString,
    "d.M.yyyy",
    new Date()
  );
  const internalEndDate = parse(internalEndDateString, "d.M.yyyy", new Date());

  const endDateIsBeforeStartDate =
    isValidDate(internalStartDate) &&
    isValidDate(internalEndDate) &&
    isBefore(internalEndDate, internalStartDate);

  React.useEffect(() => {
    if (!startDate && !endDate) {
      setInternalStartDateString("");
      setInternalEndDateString("");
    }
  }, [startDate, endDate]);

  React.useEffect(() => {
    const startDateIsValid = isValidDateString(internalStartDateString);
    const endDateIsValid = isValidDateString(internalEndDateString);
    const startDateObj = parse(internalStartDateString, "d.M.yyyy", new Date());
    const endDateObj = parse(internalEndDateString, "d.M.yyyy", new Date());

    if (
      startDateIsValid &&
      endDateIsValid &&
      isBefore(endDateObj, startDateObj)
    ) {
      onChangeStartDate(startDateObj);
      onChangeEndDate(null);
      return;
    }

    if (startDateIsValid) {
      setErrors({
        ...errors,
        startDateIsInvalid: false,
      });
    }

    if (endDateIsValid) {
      setErrors({
        ...errors,
        endDateIsInvalid: false,
      });
    }

    if (startDateIsValid) {
      onChangeStartDate(parse(internalStartDateString, "d.M.yyyy", new Date()));
    } else {
      onChangeStartDate(null);
    }
    if (endDateIsValid) {
      onChangeEndDate(parse(internalEndDateString, "d.M.yyyy", new Date()));
    } else {
      onChangeEndDate(null);
    }

    // ignore change handlers to avoid infinite loops (if func changes on every render)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [internalStartDateString, internalEndDateString, setErrors]);

  const handleStartDateValidation = (e: React.FocusEvent<HTMLInputElement>) => {
    setErrors({
      ...errors,
      startDateIsInvalid: !isValidDateString(e.target.value),
    });
  };

  const handleEndDateValidation = (e: React.FocusEvent<HTMLInputElement>) => {
    setErrors({
      ...errors,
      endDateIsInvalid: !isValidDateString(e.target.value),
    });
  };

  return (
    <Wrapper className="date-range-input__wrapper">
      <DateInput
        autoComplete="off"
        id="start-date"
        value={internalStartDateString}
        onBlur={handleStartDateValidation}
        disableConfirmation
        helperText={
          showHelperText && !errors.startDateIsInvalid ? helperText : undefined
        }
        minDate={limits?.startMinDate ?? new Date()}
        maxDate={limits?.startMaxDate}
        initialMonth={new Date()}
        label={labels?.start ?? t("dateSelector:labelStartDate")}
        language={i18n.language as Language}
        onChange={(date) => setInternalStartDateString(date)}
        errorText={
          errors.startDateIsInvalid
            ? t("dateSelector:errorDateFormat")
            : undefined
        }
        required={required?.start !== undefined ? required.start : true}
      />
      <DateInput
        autoComplete="off"
        id="end-date"
        value={internalEndDateString}
        onBlur={handleEndDateValidation}
        disableConfirmation
        helperText={
          showHelperText &&
          !endDateIsBeforeStartDate &&
          !errors.endDateIsInvalid
            ? helperText
            : undefined
        }
        minDate={limits?.endMinDate ?? new Date()}
        maxDate={limits?.endMaxDate}
        initialMonth={startDate ?? new Date()}
        label={labels?.end ?? t("dateSelector:labelEndDate")}
        language={i18n.language as Language}
        onChange={(date) => setInternalEndDateString(date)}
        errorText={
          endDateIsBeforeStartDate
            ? t("dateSelector:errorEndDateBeforeStartDate")
            : errors.endDateIsInvalid
            ? t("dateSelector:errorDateFormat")
            : undefined
        }
        required={required?.end !== undefined ? required.end : true}
      />
    </Wrapper>
  );
};

export default DateRangePicker;
