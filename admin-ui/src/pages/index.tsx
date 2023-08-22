import React, { useEffect } from "react";

import { useSession, signIn } from "next-auth/react";
import MainLander from "app/component/MainLander";
import ClientOnly from "common/src/ClientOnly";
import Layout from "./layout";
import App from "../App";

// TODO we should permiate the user into other places and maybe initialise the Apollo cache from it too
// because here it makes no sense to check the user ACLs, we need to block that on route / page level
// but routes are inside the SPA (not Next)
// Still this avoids the flash of the login page
export default function Index() {
  const { data: session } = useSession();

  useEffect(() => {
    if (session?.error === "RefreshAccessTokenError") {
      console.warn("Refreshing access token failed, forcing sign in");
      signIn("tunnistamo"); // Force sign in to hopefully resolve error
    }
  }, [session]);

  return (
    <Layout>
      {session?.user != null ? (
        <ClientOnly>
          <App />
        </ClientOnly>
      ) : (
        <MainLander />
      )}
    </Layout>
  );
}
