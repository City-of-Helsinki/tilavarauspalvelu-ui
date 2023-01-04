import axios from "axios";
import { NextApiRequest, NextApiResponse } from "next";
import NextAuth, { NextAuthOptions, Session, Awaitable, User } from "next-auth";
import { JWT } from "next-auth/jwt";
import getConfig from "next/config";

type TunnistamoAccount = {
  provider: string;
  type: "oauth";
  providerAccountId: string;
  access_token: string;
  refresh_token: string;
  token_type: "bearer";
  expires_at: number;
  id_token: string;
};

type TunnistamoProfile = {
  iss: string;
  sub: string;
  aud: string;
  exp: number;
  iat: number;
  auth_time: number;
  at_hash: string;
  name: string;
  given_name: string;
  family_name: string;
  nickname: string;
  email: string;
  email_verified: boolean;
  azp: string;
  sid: string;
  amr: string;
  loa: string;
};

type TilavarauspalveluUser = Omit<User, "image"> & {
  id: string;
  name: string;
  given_name: string;
  family_name: string;
  nickname: string;
  email: string;
  email_verified: boolean;
};

type APITokens = {
  tilavaraus: string;
  profile: string;
};

type ExtendedJWT = JWT & {
  accessToken: string;
  accessTokenExpires: number;
  refreshToken: string;
  user: TilavarauspalveluUser;
  apiTokens: APITokens;
};

type JwtParams = {
  token: ExtendedJWT;
  user: TilavarauspalveluUser;
  account: TunnistamoAccount;
};

type ExtendedSession = Session & {
  accessToken: string;
  accessTokenExpires: number;
  user: TilavarauspalveluUser;
  apiTokens: APITokens;
};

type SessionParams = {
  token: ExtendedJWT;
  user: TilavarauspalveluUser;
  session: ExtendedSession;
};

const clientId = process.env.NEXT_PUBLIC_OIDC_CLIENT_ID;
const clientSecret = process.env.NEXT_PUBLIC_AUTH_SECRET;
const issuer = process.env.NEXT_PUBLIC_OIDC_URL;
const tokenUrl = process.env.NEXT_PUBLIC_OIDC_TOKEN_URL;
const accessTokenUrl = process.env.NEXT_PUBLIC_OIDC_ACCESS_TOKEN_URL;
const profileUrl = process.env.NEXT_PUBLIC_PROFILE_API_SCOPE;
const scope = process.env.NEXT_PUBLIC_OIDC_SCOPE;
const callbackUrl = process.env.NEXT_PUBLIC_OIDC_CALLBACK_URL;

const {
  publicRuntimeConfig: { apiScope, profileApiScope },
} = getConfig();

const getApiAccessTokens = async (accessToken: string | undefined) => {
  if (!accessToken) {
    throw new Error("Access token not available. Cannot update");
  }
  if (!apiScope) {
    throw new Error("Application configuration error, illegal api scope.");
  }
  const response = await axios.request({
    responseType: "json",
    method: "POST",
    url: accessTokenUrl,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });

  const { data } = response;

  if (!data) {
    throw new Error("No api-tokens present");
  }

  const apiAccessToken: string = data[apiScope];
  const profileApiAccessToken: string = data[profileApiScope];

  return [apiAccessToken, profileApiAccessToken];
};

const refreshAccessToken = async (token: ExtendedJWT) => {
  try {
    const searchParams =
      clientId &&
      clientSecret &&
      new URLSearchParams({
        refresh_token: token.refreshToken,
      });
    const url = `${tokenUrl}?${searchParams}`;

    const response = await axios.request({
      url: tokenUrl,
      method: "POST",
      data: {
        client_id: clientId,
        grant_type: "refresh_token",
        refresh_token: token.refreshToken,
      },
      headers: {
        /* eslint-disable @typescript-eslint/naming-convention */
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Bearer ${token.accessToken}`,
      },
    });

    const { data } = response;

    if (!data) {
      throw new Error("Unable to refresh tokens");
    }

    const [tilavarausAPIToken, profileAPIToken] = await getApiAccessTokens(
      data.access_token
    );

    return {
      ...token,
      accessToken: data.access_token,
      accessTokenExpires: Date.now() + data.expires_in * 1000,
      refreshToken: data.refresh_token ?? token.refreshToken, // Fall back to old refresh token
      apiTokens: {
        tilavaraus: tilavarausAPIToken,
        profile: profileAPIToken,
      },
    };
  } catch (error) {
    console.error(error);

    return {
      ...token,
      error: "RefreshAccessTokenError",
    };
  }
};

const options = (): NextAuthOptions => {
  const wellKnownUrl = `${issuer}/.well-known/openid-configuration`;

  return {
    providers: [
      {
        id: "tunnistamo",
        name: "Tunnistamo OIDC",
        type: "oauth",
        issuer,
        clientId,
        clientSecret,
        idToken: true,
        checks: ["pkce", "state"],
        wellKnown: wellKnownUrl,
        accessTokenUrl,
        token: tokenUrl,
        profileUrl,
        authorization: {
          params: {
            scope,
            response_type: "code",
            redirect_uri: callbackUrl,
          },
        },
        profile(profile: TunnistamoProfile): Awaitable<TilavarauspalveluUser> {
          return {
            id: profile.sub,
            ...profile,
          };
        },
      },
    ],
    secret: clientSecret,
    session: {
      strategy: "jwt",
    },
    callbacks: {
      async jwt({ token, user, account }: JwtParams): Promise<ExtendedJWT> {
        // Initial sign in
        if (account && user) {
          const [tilavarausAPIToken, profileAPIToken] =
            await getApiAccessTokens(account.access_token);
          return {
            accessToken: account.access_token,
            accessTokenExpires: account.expires_at * 1000,
            refreshToken: account.refresh_token,
            user,
            apiTokens: {
              tilavaraus: tilavarausAPIToken,
              profile: profileAPIToken,
            },
          };
        }

        if (Date.now() < token.accessTokenExpires) {
          return token;
        }

        return refreshAccessToken(token);
      },
      async session({
        session,
        token,
      }: SessionParams): Promise<ExtendedSession> {
        const { accessToken, accessTokenExpires, user, apiTokens } = token;

        return { ...session, accessToken, accessTokenExpires, user, apiTokens };
      },
      async redirect({ url, baseUrl }) {
        return url.startsWith(baseUrl)
          ? Promise.resolve(url)
          : Promise.resolve(baseUrl);
      },
    },
    pages: {
      signIn: `${process.env.NEXT_PUBLIC_BASE_URL}/`,
      signOut: "",
    },
  };
};

export default function nextAuthApiHandler(
  req: NextApiRequest,
  res: NextApiResponse
): ReturnType<typeof NextAuth> {
  if (
    !clientId ||
    !clientSecret ||
    !issuer ||
    !tokenUrl ||
    !accessTokenUrl ||
    !scope ||
    !callbackUrl
  ) {
    throw new Error("Invalid configuration");
  }

  return NextAuth(req, res, options());
}

export type { ExtendedSession };
