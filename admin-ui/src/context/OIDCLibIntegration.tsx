import { useReactOidc } from "@axa-fr/react-oidc-context";
import { User } from "oidc-client";
import { useEffect } from "react";

const OIDCLibIntegration = ({
  setUser,
}: {
  // eslint-disable-next-line @typescript-eslint/ban-types
  setUser: (user: User, login: Function, logout: Function) => void;
}) => {
  const { events, oidcUser, login, logout } = useReactOidc();

  useEffect(() => {
    events.addUserLoaded(() => console.log("** user loaded"));
    events.addAccessTokenExpired(() => console.log("** access token expired"));
    events.addAccessTokenExpiring(() =>
      console.log("** access token expiring")
    );
    events.addSilentRenewError(() => console.log("** silent renew error"));
    events.addUserSessionChanged(() => console.log("** user session changed"));
    events.addUserSignedIn(() => console.log("** user signed in"));
    events.addUserSignedOut(() => console.log("** user signed out"));
    events.addUserUnloaded(() => console.log("** user unloaded"));
  }, [events]);

  useEffect(() => {
    console.log("calling setUser");
    setUser(oidcUser, login, logout);
  }, [oidcUser, login, logout, setUser]);
  return null;
};

export default OIDCLibIntegration;
