import { NextApiRequest } from "next";
import { getSession } from "next-auth/react";
import axios, { AxiosRequestConfig } from "axios";
import applyCaseMiddleware from "axios-case-converter";
import { PROFILE_TOKEN_HEADER } from "../const";
import { ExtendedSession } from "../../pages/api/auth/[...nextauth]";

const axiosOptions = {
  timeout: 20000,
  headers: {
    /* eslint-disable @typescript-eslint/naming-convention */
    "Content-Type": "application/json",
  },
};

const axiosClient = applyCaseMiddleware(axios.create(axiosOptions));

axiosClient.interceptors.request.use(
  async (req: AxiosRequestConfig & NextApiRequest) => {
    const session = (await getSession()) as ExtendedSession;

    if (session?.apiTokens?.tilavaraus) {
      req.headers.Authorization = `Bearer ${session.apiTokens.tilavaraus}`;
    }

    if (session?.apiTokens?.profile) {
      req.headers[PROFILE_TOKEN_HEADER] = `${session?.apiTokens.profile}`;
    }

    return req;
  }
);

export default axiosClient;
