import type { NextApiRequest, NextApiResponse } from "next";
import { getToken } from "next-auth/jwt";
import getConfig from "next/config";
import { ExtendedJWT } from "./[...nextauth]";

const {
  publicRuntimeConfig: { baseUrl, oidcEndSessionUrl },
} = getConfig();

const federatedLogOut = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const token = (await getToken({ req })) as ExtendedJWT;
    if (!token) {
      return res.redirect(baseUrl);
    }

    const redirectURL = `${baseUrl}/logout`;
    const endSessionParams = new URLSearchParams({
      post_logout_redirect_uri: redirectURL,
    });
    const fullUrl = `${oidcEndSessionUrl}?${endSessionParams.toString()}`;

    return res.redirect(fullUrl);
  } catch (error) {
    res.redirect(baseUrl);
  }
};

export default federatedLogOut;
