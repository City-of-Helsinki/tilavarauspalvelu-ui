import { LoadingSpinner } from "hds-react";
import { signOut } from "next-auth/react";
import getConfig from "next/config";
import { useRouter } from "next/router";
import React, { useEffect } from "react";

const {
  publicRuntimeConfig: { baseUrl },
} = getConfig();

const LogoutPage = () => {
  const router = useRouter();

  useEffect(() => {
    signOut({ redirect: false }).then(() => {
      router.push(baseUrl);
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <LoadingSpinner />;
};

export default LogoutPage;
