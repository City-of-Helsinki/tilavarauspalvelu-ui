import { getSignOutUrl, getSignInUrl } from "~/modules/const";
import { useCurrentUser } from "../user";

// Redirect the user to the sign in dialog and return to returnUrl (or
// current url if none is provided) after sign in
export function signIn(returnUrl?: string) {
  const returnTo = returnUrl ?? window.location.href;
  const url = getSignInUrl(returnTo);
  window.location.href = url;
}

// Log the user out and redirect to route /logout
export function signOut() {
  window.location.href = getSignOutUrl();
}

export function useSession() {
  const { currentUser, loading, error } = useCurrentUser();
  const isAuthenticated = currentUser != null;
  return { isAuthenticated, user: currentUser, loading, error };
}
