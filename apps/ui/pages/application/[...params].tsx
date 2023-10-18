import React, { useReducer, useState } from "react";
import { useAsync } from "react-use";
import { Notification } from "hds-react";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import { GetServerSideProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { Application as ApplicationType } from "common/types/common";
import {
  Query,
  QueryApplicationRoundsArgs,
  QueryTermsOfUseArgs,
  ReservationUnitType,
  TermsOfUseType,
} from "common/types/gql-types";
import { redirectProtectedRoute } from "@/modules/protectedRoute";
import { saveApplication, getApplication } from "../../modules/api";
import { ApplicationPageWrapper } from "@/components/application/ApplicationPage";
import Page1 from "../../components/application/Page1";
import Page2 from "../../components/application/Page2";
import Page3 from "../../components/application/Page3";
import Preview from "../../components/application/Preview";
import View from "../../components/application/View";
import applicationReducer from "@/modules/application/applicationReducer";
import useReservationUnitList from "../../hooks/useReservationUnitList";
import Sent from "../../components/application/Sent";
import { CenterSpinner } from "../../components/common/common";
import {
  apiDateToUIDate,
  deepCopy,
  getTranslation,
  uiDateToApiDate,
} from "../../modules/util";
import { TERMS_OF_USE } from "../../modules/queries/reservationUnit";
import { createApolloClient } from "../../modules/apolloClient";
import { APPLICATION_ROUNDS } from "../../modules/queries/applicationRound";

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const { locale } = ctx;

  const redirect = redirectProtectedRoute(ctx);
  if (redirect) {
    return redirect;
  }

  const apolloClient = createApolloClient(ctx);
  const { data: tosData } = await apolloClient.query<
    Query,
    QueryTermsOfUseArgs
  >({
    query: TERMS_OF_USE,
  });

  // TODO why does this work? pk should be number but we compare to string?
  // is this an inconsistency in the backend?
  const tos = tosData?.termsOfUse?.edges
    .map((n) => n?.node)
    .filter((n) => n?.pk === "KUVAnupa" || n?.pk === "generic1");

  return {
    props: {
      key: locale,
      tos,
      ...(await serverSideTranslations(locale ?? "fi")),
    },
  };
};

type Props = {
  tos: TermsOfUseType[];
};

const ApplicationRootPage = ({ tos }: Props): JSX.Element | null => {
  const { t } = useTranslation();

  const [error, setError] = useState<string | null>();

  const [state, dispatch] = useReducer(applicationReducer, {
    application: { id: 0 } as ApplicationType,
    applicationEvents: [],
    loading: true,
  });

  const router = useRouter();

  const [applicationId, pageId] = router.query?.params as string[];

  const applicationLoadingStatus = useAsync(async () => {
    // TODO check for NaN also
    if (applicationId && Number(applicationId)) {
      try {
        // FIXME replace with GQL
        const application = await getApplication(Number(applicationId));
        // TODO this is weird, why are we not using Client side cache?
        const apolloClient = createApolloClient(undefined);
        const { data } = await apolloClient.query<
          Query,
          QueryApplicationRoundsArgs
        >({
          query: APPLICATION_ROUNDS,
          fetchPolicy: "no-cache",
        });
        const applicationRound = data.applicationRounds?.edges
          ?.map((n) => n?.node)
          .find((n) => n?.pk === application.applicationRoundId);

        // convert dates
        application.applicationEvents.forEach((ae, i) => {
          if (ae.end) {
            application.applicationEvents[i].end = apiDateToUIDate(ae.end);
          }
          if (ae.begin) {
            application.applicationEvents[i].begin = apiDateToUIDate(ae.begin);
          }
        });
        const begin = applicationRound?.reservationPeriodBegin;
        const end = applicationRound?.reservationPeriodEnd;
        dispatch({
          type: "load",
          application,
          params: {
            begin: begin ? apiDateToUIDate(begin) : "",
            end: end ? apiDateToUIDate(end) : "",
          },
        });
        return { application, applicationRound };
      } catch (e) {
        setError(`${t("common:error.dataError")}`);
      }
    }
    return null;
  });

  const { reservationUnits, clearSelections } = useReservationUnitList();

  const saveWithEffect = async (
    appToSave: ApplicationType,
    postSave?: (string?: number) => void,
    eventId?: number
  ) => {
    let loadedApplication: ApplicationType;

    const transformForSaving = (app: ApplicationType): ApplicationType => {
      const tapp = deepCopy(app);
      tapp.applicationEvents.forEach((ae, i) => {
        const begin = ae.begin != null ? uiDateToApiDate(ae.begin) : null;
        const end = ae.end != null ? uiDateToApiDate(ae.end) : null;
        tapp.applicationEvents[i].begin = begin ?? null;
        tapp.applicationEvents[i].end = end ?? null;
      });
      return tapp;
    };

    try {
      const existingIds = appToSave.applicationEvents
        .map((ae) => ae.id)
        .filter((id): id is number => id != null);
      loadedApplication = await saveApplication(transformForSaving(appToSave));
      const newEvent = loadedApplication.applicationEvents.filter(
        (ae) => ae.id != null && existingIds.indexOf(ae.id) === -1
      );
      dispatch({
        type: "save",
        application: loadedApplication,
        savedEventId: eventId || (newEvent.length && newEvent[0].id) || 0,
      });

      if (postSave) {
        postSave(loadedApplication.id);
      }
    } catch (e) {
      setError(`${t("application:error.saveFailed")}`);
      throw e;
    }
  };

  const saveAndNavigate = (path: string) => (appToSave: ApplicationType) =>
    saveWithEffect(appToSave, (id) => {
      const prefix = `/application/${id}`;
      const target = `${prefix}/${path}`;
      clearSelections();
      router.push(target);
    });

  const applicationRound = applicationLoadingStatus.value?.applicationRound;

  const addNewApplicationEvent = () => {
    const begin = applicationRound?.reservationPeriodBegin;
    const end = applicationRound?.reservationPeriodEnd;
    const params = applicationLoadingStatus.value
      ? {
          begin: begin ? apiDateToUIDate(begin) : "",
          end: end ? apiDateToUIDate(end) : "",
        }
      : {};

    dispatch({
      params,
      type: "addNewApplicationEvent",
    });
  };

  const appRound =
    applicationLoadingStatus.value?.applicationRound ?? undefined;
  const applicationRoundName =
    appRound != null ? getTranslation(appRound, "name") : "-";

  const ready = !applicationLoadingStatus.loading && state.loading === false;

  if (!ready) {
    return error ? (
      <Notification
        type="error"
        label={error}
        position="top-center"
        displayAutoCloseProgress={false}
        onClose={() => router.reload()}
      >
        {error}
      </Notification>
    ) : (
      <CenterSpinner />
    );
  }

  const rerender = state.application.applicationEvents.length; // rerender every time event count is changed so that form state stays in sync

  const application = state.application;
  return (
    <>
      {pageId === "page1" && (
        <ApplicationPageWrapper
          key={rerender}
          application={application}
          overrideText={applicationRoundName}
          translationKeyPrefix="application:Page1"
        >
          {applicationRound != null && (
            <Page1
              selectedReservationUnits={
                reservationUnits as ReservationUnitType[]
              }
              applicationRound={applicationRound}
              onDeleteUnsavedEvent={() => {
                dispatch({
                  type: "removeApplicationEvent",
                  eventId: undefined,
                });
              }}
              application={application}
              savedEventId={state.savedEventId}
              save={({
                application,
                eventId,
              }: {
                application: ApplicationType;
                eventId?: number;
              }) => saveWithEffect(application, undefined, eventId)}
              addNewApplicationEvent={addNewApplicationEvent}
              setError={setError}
            />
          )}
        </ApplicationPageWrapper>
      )}
      {pageId === "page2" && (
        <ApplicationPageWrapper
          application={application}
          translationKeyPrefix="application:Page2"
        >
          <Page2
            application={application}
            onNext={saveAndNavigate("page3")}
          />
        </ApplicationPageWrapper>
      )}
      {pageId === "page3" && (
        <ApplicationPageWrapper
          application={application}
          translationKeyPrefix="application:Page3"
        >
          <Page3
            application={application}
            onNext={saveAndNavigate("preview")}
          />
        </ApplicationPageWrapper>
      )}
      {pageId === "preview" && (
       <ApplicationPageWrapper
          application={application}
          translationKeyPrefix="application:preview"
        >
          <Preview
            application={application}
            onNext={saveAndNavigate("sent")}
            tos={tos}
          />
        </ApplicationPageWrapper>
      )}
      {pageId === "view" && (
        <ApplicationPageWrapper
          application={application}
          translationKeyPrefix="application:view"
          headContent={applicationRoundName}
          hideStepper
        >
          <View application={application} tos={tos} />
        </ApplicationPageWrapper>
      )}
      {pageId === "sent" && <Sent />}

      {error ? (
        <Notification
          type="error"
          label={error}
          position="top-center"
          autoClose
          displayAutoCloseProgress={false}
          onClose={() => setError(null)}
        >
          {error}
        </Notification>
      ) : null}
    </>
  );
};

export default ApplicationRootPage;
