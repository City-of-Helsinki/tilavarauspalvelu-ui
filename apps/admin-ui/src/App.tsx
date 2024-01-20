import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import dynamic from "next/dynamic";
import { Permission } from "@modules/permissionHelper";
import PageWrapper from "@component/PageWrapper";
import "./i18n";
import { publicUrl } from "@common/const";
import { GlobalContext } from "@context/GlobalContexts";
import { prefixes } from "@common/urls";
import { AuthorisationChecker } from "@component/AuthorisationChecker";
import { Error404 } from "@component/error";
import ReservationsRouter from "@/spa/reservations/ReservationRouter";
import { MyUnitsRouter } from "@/spa/my-units/MyUnitsRouter";
import NotificationsRouter from "@/spa/notifications/router";
import ApplicationRound from "@/spa/recurring-reservations/application-rounds/[id]";

const Units = dynamic(() => import(`./spa/units`));
const Unit = dynamic(() => import(`./spa/units/[id]`));
const SpacesResources = dynamic(import(`./spa/units/[id]/spaces/index`));
const SpacesList = dynamic(() => import("./spa/spaces"));
const SpaceEditorView = dynamic(() => import("./spa/spaces/[id]"));
const ResourcesList = dynamic(() => import("./spa/resources"));
const ResourceEditorView = dynamic(() => import("./spa/resources/[id]"));

const ApplicationDetails = dynamic(() => import("./spa/applications"));

const ReservationUnits = dynamic(() => import("./spa/reservation-units"));
const ReservationUnitEditor = dynamic(
  () => import("./spa/reservation-units/[id]")
);

const HomePage = dynamic(() => import("./spa/HomePage"));

const AllApplicationRounds = dynamic(
  () => import(`./spa/recurring-reservations/application-rounds/index`)
);
const Criteria = dynamic(
  () => import(`./spa/recurring-reservations/application-rounds/[id]/criteria`)
);
const ApplicationRoundAllocation = dynamic(
  () =>
    import(`./spa/recurring-reservations/application-rounds/[id]/allocation`)
);

const withAuthorization = (component: JSX.Element, permission?: Permission) => (
  <AuthorisationChecker permission={permission}>
    {component}
  </AuthorisationChecker>
);

const UnitsRouter = () => (
  <Routes>
    <Route path=":unitPk/spacesResources" element={<SpacesResources />} />
    <Route path=":unitPk/space/edit/:spacePk" element={<SpaceEditorView />} />
    <Route
      path=":unitPk/resource/edit/:resourcePk"
      element={<ResourceEditorView />}
    />
    <Route
      index
      path=":unitPk/reservationUnit/edit/"
      element={<ReservationUnitEditor />}
    />
    <Route
      path=":unitPk/reservationUnit/edit/:reservationUnitPk"
      element={<ReservationUnitEditor />}
    />
    <Route path=":unitPk" element={<Unit />} />
  </Routes>
);

const ApplicationRouter = () => (
  <Routes>
    <Route path=":applicationId" element={<ApplicationDetails />} />
    <Route path=":applicationId/details" element={<ApplicationDetails />} />
  </Routes>
);

const ApplicationRoundsRouter = () => (
  <Routes>
    <Route index element={<AllApplicationRounds />} />
    <Route path=":applicationRoundId/criteria" element={<Criteria />} />
    <Route
      path=":applicationRoundId/allocation"
      element={<ApplicationRoundAllocation />}
    />
    <Route path=":applicationRoundId" element={<ApplicationRound />} />
  </Routes>
);

const PremisesRouter = () => (
  <Routes>
    <Route
      path="spaces"
      element={withAuthorization(<SpacesList />, Permission.CAN_MANAGE_SPACES)}
    />
    <Route
      path={`${prefixes.reservationUnits}`}
      element={withAuthorization(
        <ReservationUnits />,
        Permission.CAN_MANAGE_UNITS
      )}
    />
    <Route
      path="resources"
      element={withAuthorization(
        <ResourcesList />,
        Permission.CAN_MANAGE_RESOURCES
      )}
    />
    <Route
      path="units"
      element={withAuthorization(<Units />, Permission.CAN_MANAGE_UNITS)}
    />
  </Routes>
);

const App = () => {
  return (
    <BrowserRouter basename={publicUrl}>
      <PageWrapper>
        <Routes>
          <Route path="*" element={<Error404 />} />
          <Route path="/" element={withAuthorization(<HomePage />)} />

          <Route
            path={`${prefixes.applications}/*`}
            element={withAuthorization(
              <ApplicationRouter />,
              Permission.CAN_VALIDATE_APPLICATIONS
            )}
          />

          <Route
            path={`${prefixes.recurringReservations}/application-rounds/*`}
            element={withAuthorization(
              <ApplicationRoundsRouter />,
              Permission.CAN_VALIDATE_APPLICATIONS
            )}
          />

          <Route
            path="/premises-and-settings/*"
            element={withAuthorization(<PremisesRouter />)}
          />

          <Route path="/unit/*" element={withAuthorization(<UnitsRouter />)} />
          <Route
            path="/reservations/*"
            element={withAuthorization(<ReservationsRouter />)}
          />
          <Route
            path="/my-units/*"
            element={withAuthorization(<MyUnitsRouter />)}
          />
          <Route
            path="/messaging/notifications/*"
            element={withAuthorization(
              <NotificationsRouter />,
              Permission.CAN_MANAGE_BANNER_NOTIFICATIONS
            )}
          />
        </Routes>
      </PageWrapper>
    </BrowserRouter>
  );
};

const AppWrapper = () => {
  if (typeof window === "undefined") {
    return null;
  }
  return (
    <GlobalContext>
      <App />
    </GlobalContext>
  );
};

export default AppWrapper;
