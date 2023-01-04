import axios from "axios";
import { NextApiRequest, NextApiResponse } from "next";

const logoutUrl = process.env.NEXT_PUBLIC_OIDC_END_SESSION;
const authCallback = process.env.NEXT_PUBLIC_BASE_URL;
const clientId = process.env.NEXT_PUBLIC_OIDC_CLIENT_ID;

export default async function nextAuthLogoutHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const path = `${logoutUrl}?client_id=${clientId}`;
  const response = await axios.get(path);

  res.status(response.status).json({ path: authCallback });
}
