import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect } from "react";

// Quick and dirty hook to throw the user out of protected route after logout
// Other alternatives would be to do route.replace('..') (or something similar)
// till we find a page that doesn't block
// or render login / empty pages for unauthorized without modifying the route.
export const useRedirectUnauthorized = () => {
  const router = useRouter();
  const session = useSession();
  useEffect(() => {
    if (session.status !== "authenticated") {
      router.replace("/");
    }
  }, [session, router]);
};
