import { rest } from "msw";

const currentUser = rest.get(
  "http://localhost:8000/v1/users/current",
  (req, res, ctx) => {
    return res(
      ctx.json({
        id: 1,
        firstName: "Test",
        lastName: "User",
        email: "",
      })
    );
  }
);

export const userHandlers = [currentUser];
