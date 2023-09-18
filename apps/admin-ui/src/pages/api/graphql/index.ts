import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { apiBaseUrl } from "app/common/const";
// eslint-disable-next-line import/extensions
import { authOptions } from "app/pages/api/auth/[...nextauth]";

/// Mask graphql endpoint for the client so we can drop cookies
/// otherwise the large request size causes a 502
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);
  if (req.method !== "POST" && req.method !== "OPTIONS") {
    return res.status(405).send("Only POST is allowed");
  }

  const contentType = req.headers["content-type"];

  const uri = `${apiBaseUrl}/graphql/`;
  const response = await fetch(uri, {
    method: "POST",
    headers: {
      "Content-Type": contentType || "application/json",
      ...(session?.apiTokens?.tilavaraus
        ? { authorization: `Bearer ${session.apiTokens.tilavaraus}` }
        : {}),
    },
    body:
      contentType === "application/json" ? JSON.stringify(req.body) : req.body,
  });

  return res.status(response.status).json(await response.json());
}
