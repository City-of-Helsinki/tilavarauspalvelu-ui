import { useQuery } from "@apollo/client";
import { type Query } from "common/types/gql-types";
import { CURRENT_USER } from "app/context/queries";
import { getSignOutUrl, getSignInUrl } from "@/common/const";

// Redirect the user to the sign in dialog and return to the current url after sign in
export function signIn() {
  const currentUrl = window.location.href;
  const url = getSignInUrl(currentUrl);
  window.location.href = url;
}

// Log the user out and redirect to route /logout
export function signOut() {
  window.location.href = getSignOutUrl();
}

export function useSession() {
  const { data, error } = useQuery<Query>(CURRENT_USER);
  const user = data?.currentUser ?? undefined;

  return { isAuthenticated: user != null, user, error };
}
