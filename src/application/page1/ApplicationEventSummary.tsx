import { differenceInWeeks } from 'date-fns';
import { IconArrowRedo, IconCalendar, IconClock, IconGroup } from 'hds-react';
import React from 'react';
import { useForm } from 'react-hook-form';
import { Trans, useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { ApplicationEvent } from '../../common/types';
import { parseDate, formatDate, fromApiDuration } from '../../common/util';
import { TwoColumnContainer } from '../../component/common';
import IconWithText from '../../reservation-unit/IconWithText';

type Props = {
  form: ReturnType<typeof useForm>;
  index: number;
  applicationEvent: ApplicationEvent;
};

const Message = styled.div`
  margin-top: var(--spacing-s);
  font-size: var(--fontsize-body-xl);
`;

const CustomIconWithText = styled(IconWithText)`
  font-size: var(--fontsize-body-l);
`;

const numHours = (
  startDate: string,
  endDate: string,
  biweekly: boolean,
  eventsPerWeek: number,
  minDurationMinutes: number
) => {
  const numWeeks =
    differenceInWeeks(parseDate(endDate), parseDate(startDate)) /
    (biweekly ? 2 : 1);

  const hours = numWeeks * eventsPerWeek * minDurationMinutes;
  return hours;
};

const ApplicationEventSummary = ({
  form,
  index,
  applicationEvent,
}: Props): JSX.Element | null => {
  const { t } = useTranslation();

  /*
  const fieldName = (nameField: string) =>
    `applicationEvents[${index}].${nameField}`;

  form.watch(fieldName('name'));
  form.watch(fieldName('begin'));
  form.watch(fieldName('end'));
  form.watch(fieldName('biweekly'));
  form.watch(fieldName('eventsPerWeek'));
  form.watch(fieldName('numPersons'));
  form.watch(fieldName('minDuration'));
  */

  if (!form.getValues().applicationEvents) {
    return null;
  }

  // const event = form.getValues().applicationEvents[index] as ApplicationEvent;

  if (!applicationEvent) {
    return null;
  }

  const begin = applicationEvent.begin as string;
  const end = applicationEvent.end as string;
  const biweekly = Boolean(applicationEvent.biweekly);
  const eventsPerWeek = Number(applicationEvent.eventsPerWeek);
  const minDuration = Number(
    fromApiDuration(applicationEvent.minDuration as string)
  );
  const numPersons = Number(applicationEvent.numPersons);

  return (
    <>
      <Message>
        {t('ApplicationEventSummary.message', {
          name: form.getValues().applicationEvents[index].name,
          startDate: formatDate(begin),
          endDate: formatDate(end),
          hours: numHours(begin, end, biweekly, eventsPerWeek, minDuration),
        })}
      </Message>
      <TwoColumnContainer>
        <CustomIconWithText
          icon={<IconGroup />}
          text={
            <Trans i18nKey="ApplicationEventSummary.numPersons">
              Ryhmän koko on <strong>{{ numPersons }}</strong>
            </Trans>
          }
        />
        <CustomIconWithText
          icon={<IconClock />}
          text={t('ApplicationEventSummary.minDuration', { minDuration })}
        />
        <CustomIconWithText
          icon={<IconCalendar />}
          text={
            <Trans
              count={eventsPerWeek}
              i18nKey="ApplicationEventSummary.eventsPerWeek">
              <strong>{{ eventsPerWeek }}</strong> vuoro viikossa
            </Trans>
          }
        />
        {biweekly ? (
          <CustomIconWithText
            icon={<IconArrowRedo />}
            text={<strong>{t('Application.Page1.biweekly')}</strong>}
          />
        ) : null}
      </TwoColumnContainer>
    </>
  );
};
export default ApplicationEventSummary;
