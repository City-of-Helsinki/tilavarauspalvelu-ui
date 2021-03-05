import { Button, IconArrowRight, IconPlusCircleFill } from 'hds-react';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import styled from 'styled-components';
import ApplicationEvent from './ApplicationEvent';
import {
  Action,
  Application,
  ApplicationRound,
  EditorState,
  OptionType,
  ReservationUnit,
} from '../../common/types';
import { deepCopy, mapOptions } from '../../common/util';
import { getParameters } from '../../common/api';
import { breakpoint } from '../../common/style';

type Props = {
  applicationRound: ApplicationRound;
  editorState: EditorState;
  selectedReservationUnits: ReservationUnit[];
  save: ({
    application,
    eventId,
  }: {
    application: Application;
    eventId?: number;
  }) => void;
  dispatch: React.Dispatch<Action>;
  addNewApplicationEvent: () => void;
};

const ButtonContainer = styled.div`
  @media (max-width: ${breakpoint.m}) {
    flex-direction: column;

    & > button {
      margin-top: var(--spacing-m);
      margin-left: auto;
      margin-right: auto;
    }

    & :nth-child(1) {
      margin-left: auto;
      margin-right: auto;
    }
  }

  display: flex;
  flex-direction: row;
  margin-top: var(--spacing-layout-l);
  justify-content: flex-end;

  & > button {
    margin-left: var(--spacing-m);
  }

  & :nth-child(1) {
    margin-right: auto;
    margin-left: 0;
  }
`;

const Page1 = ({
  save,
  addNewApplicationEvent,
  applicationRound,
  editorState,
  dispatch,
  selectedReservationUnits,
}: Props): JSX.Element | null => {
  const [ready, setReady] = useState(false);
  const [msg, setMsg] = useState('');
  const [ageGroupOptions, setAgeGroupOptions] = useState<OptionType[]>([]);
  const [purposeOptions, setPurposeOptions] = useState<OptionType[]>([]);
  const [abilityGroupOptions, setAbilityGroupOptions] = useState<OptionType[]>(
    []
  );
  const [reservationUnitTypeOptions, setReservationUnitTypeOptions] = useState<
    OptionType[]
  >([]);

  const optionTypes = {
    ageGroupOptions,
    purposeOptions,
    abilityGroupOptions,
    reservationUnitTypeOptions,
  };

  const { t } = useTranslation();

  const { application } = editorState;

  const form = useForm({
    mode: 'onChange',
    defaultValues: {
      applicationEvents: application.applicationEvents,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as Record<string, any>,
  });

  useEffect(() => {
    async function fetchData() {
      const fetchedAbilityGroupOptions = await getParameters('ability_group');
      const fetchedAgeGroupOptions = await getParameters('age_group');
      const fetchedPurposeOptions = await getParameters('purpose');
      const fetchedReservationUnitType = await getParameters(
        'reservation_unit_type'
      );

      setAbilityGroupOptions(mapOptions(fetchedAbilityGroupOptions));
      setAgeGroupOptions(mapOptions(fetchedAgeGroupOptions));
      setPurposeOptions(mapOptions(fetchedPurposeOptions));
      setReservationUnitTypeOptions(mapOptions(fetchedReservationUnitType));

      setReady(true);
    }
    fetchData();
  }, []);

  useEffect(() => {
    if (form.formState.isSubmitted && !form.formState.isSubmitSuccessful)
      setMsg('Please fill out all required fields');
  }, [form.formState]);

  const prepareData = (data: Application): Application => {
    const applicationCopy = {
      ...deepCopy(application),
      applicationEvents: application.applicationEvents.map(
        (appEvent, index) => ({
          ...appEvent,
          ...data.applicationEvents[index],
        })
      ),
    };
    return applicationCopy;
  };

  const onSubmit = (data: Application, eventId?: number) => {
    const appToSave = prepareData(data);
    save({ application: appToSave, eventId });
  };

  const onAddApplicationEvent = (data: Application) => {
    if (
      data.applicationEvents &&
      data.applicationEvents.some((e) => Boolean(e.id))
    ) {
      return;
    }
    addNewApplicationEvent();
  };

  if (!ready) {
    return null;
  }

  return (
    <form>
      {msg}
      {application.applicationEvents.map((event, index) => {
        return (
          <ApplicationEvent
            key={event.id || 'NEW'}
            form={form}
            applicationEvent={event}
            index={index}
            applicationRound={applicationRound}
            optionTypes={optionTypes}
            selectedReservationUnits={selectedReservationUnits}
            onSave={form.handleSubmit((app: Application) =>
              onSubmit(app, event.id)
            )}
            editorState={editorState}
            dispatch={dispatch}
          />
        );
      })}
      <ButtonContainer>
        <Button
          id="addApplicationEvent"
          iconLeft={<IconPlusCircleFill />}
          onClick={() => form.handleSubmit(onAddApplicationEvent)()}>
          {t('Application.Page1.createNew')}
        </Button>
      </ButtonContainer>
      <ButtonContainer>
        <Button
          id="next"
          iconRight={<IconArrowRight />}
          disabled={
            application.applicationEvents.length === 0 || form.formState.isDirty
          }
          onClick={() => console.log('next clicked')}>
          {t('common.next')}
        </Button>
      </ButtonContainer>
    </form>
  );
};

export default Page1;
