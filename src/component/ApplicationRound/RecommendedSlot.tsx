import React, { ReactNode } from "react";
import styled from "styled-components";
import { IconClock, IconInfoCircle } from "hds-react";
import { useTranslation } from "react-i18next";
import { weekdays } from "../../common/const";
import {
  formatDate,
  formatTimeDistance,
  parseDuration,
} from "../../common/util";
import { Divider } from "../../styles/util";
import { ReactComponent as IconCalendar } from "../../images/icon_calendar.svg";

interface IProps {
  id: number;
  start: string | null;
  end: string | null;
  weekday: number;
  biweekly: boolean;
  timeStart: string;
  timeEnd: string;
}

const Wrapper = styled.tbody`
  line-height: var(--lineheight-xl);
`;

const Row = styled.tr``;

const Heading = styled(Row)`
  margin: 0;
`;

const Col = styled.td`
  white-space: nowrap;
  padding-right: var(--spacing-m);
  vertical-align: top;
`;

const Day = styled.div`
  display: inline-flex;
  border: 2px solid var(--color-black);
  padding: var(--spacing-3-xs) 0;
  margin-right: var(--spacing-s);
  width: var(--spacing-layout-l);
  justify-content: center;
`;

const Duration = styled.span`
  color: var(--color-black-70);
  display: inline-flex;
  align-items: center;
`;

interface IDateLabelProps {
  type: "date" | "time";
  children: ReactNode;
}

const LabelWrapper = styled.div`
  display: inline-flex;
  align-items: center;
  font-family: var(--tilavaraus-admin-font-bold);
  font-weight: 700;
  white-space: nowrap;
  position: relative;

  svg {
    margin-right: var(--spacing-xs);
    position: relative;
    top: -2px;
  }
`;

function Label({ type, children }: IDateLabelProps): JSX.Element {
  return (
    <Col>
      <LabelWrapper>
        {type === "date" ? <IconCalendar /> : <IconClock size="m" />}
        {children}
      </LabelWrapper>
    </Col>
  );
}

function RecommendedSlot({
  id,
  start,
  end,
  weekday,
  biweekly,
  timeStart,
  timeEnd,
}: IProps): JSX.Element {
  const { t } = useTranslation();

  const formatTime = (input: string) => {
    const hm = input.split(":").slice(0, -1);
    return hm.join(":");
  };

  return (
    <Wrapper data-test-id={`recommendation__slot--${id}`}>
      <Heading>
        <Col colSpan={2}>{t("common.begins")}</Col>
        <Col>{t("common.ends")}</Col>
        <Col />
        <Col>{t("common.day")}</Col>
      </Heading>
      <Row>
        <Label type="date">{formatDate(start)}</Label>
        <Col>-</Col>
        <Label type="date">{formatDate(end)}</Label>
        <Col />
        <Col>
          <Day>{t(`calendar.${weekdays[weekday]}`).substring(0, 2)}</Day>
          <span>{t(`common.${biweekly ? "biweekly" : "weekly"}`)}</span>
        </Col>
      </Row>
      <Heading>
        <Col colSpan={3}>{t("common.timeOfDay")}</Col>
      </Heading>
      <Row>
        <Label type="time">{formatTime(timeStart)}</Label>
        <Col>-</Col>
        <Label type="time">{formatTime(timeEnd)}</Label>
        {timeStart && timeEnd && (
          <>
            <Col />
            <Col>
              <Duration>
                <IconInfoCircle style={{ marginRight: "var(--spacing-xs)" }} />{" "}
                {t("Recommendation.scheduleDuration", {
                  duration: parseDuration(
                    formatTimeDistance(timeStart, timeEnd),
                    "long"
                  ),
                })}
              </Duration>
            </Col>
          </>
        )}
      </Row>
      <Row>
        <Col colSpan={5}>
          <Divider />
        </Col>
      </Row>
    </Wrapper>
  );
}

export default RecommendedSlot;
