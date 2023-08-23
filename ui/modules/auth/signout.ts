import { signOut as signOutAuth } from "next-auth/react";
import { type Session } from "next-auth";

export default function signOut({ session }: { session?: Session }) {
  return signOutAuth({ callbackUrl: "/logout" });
};
