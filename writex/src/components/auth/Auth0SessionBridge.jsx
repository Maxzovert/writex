import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/authContext";
import {
  AUTH0_LOGOUT_FLAG,
  AUTH0_RETURN_TO_KEY,
  clearAuth0BrowserCache,
  isAuth0Configured,
} from "@/lib/auth0-config";
import { toast } from "react-toastify";

const Auth0SyncContext = createContext({
  syncing: false,
  error: null,
});

export function useAuth0Sync() {
  return useContext(Auth0SyncContext);
}

/**
 * After Auth0 redirect login, exchange the Auth0 ID token for a Writex app JWT
 * and load the Mongo-backed user (linked by email / auth0Sub).
 */
export function Auth0SessionBridge({ children }) {
  if (!isAuth0Configured()) {
    return (
      <Auth0SyncContext.Provider value={{ syncing: false, error: null }}>
        {children}
      </Auth0SyncContext.Provider>
    );
  }

  return <Auth0SessionBridgeInner>{children}</Auth0SessionBridgeInner>;
}

function Auth0SessionBridgeInner({ children }) {
  const {
    isAuthenticated,
    isLoading: auth0Loading,
    getIdTokenClaims,
    error: auth0Error,
  } = useAuth0();
  const { user, syncFromAuth0, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState(null);
  const inFlightRef = useRef(false);
  const didRedirectRef = useRef(false);

  useEffect(() => {
    if (!auth0Error) return;

    console.error("Auth0 SDK error:", auth0Error);
    const raw = auth0Error.message || "Auth0 login failed";
    setSyncing(false);
    inFlightRef.current = false;

    if (/refresh token/i.test(raw)) {
      clearAuth0BrowserCache();
      setError(raw);
      toast.error("Google session expired. Click Continue with Google again.");
      return;
    }

    setError(raw);
    toast.error(raw);
  }, [auth0Error]);

  // Never leave the app stuck on the bootstrap spinner
  useEffect(() => {
    if (user && localStorage.getItem("token")) {
      setSyncing(false);
      inFlightRef.current = false;
    }
  }, [user]);

  useEffect(() => {
    if (auth0Loading || authLoading) return;

    // User just logged out — wait until Auth0 session is gone, then clear flag
    if (sessionStorage.getItem(AUTH0_LOGOUT_FLAG)) {
      setSyncing(false);
      inFlightRef.current = false;
      if (!isAuthenticated) {
        sessionStorage.removeItem(AUTH0_LOGOUT_FLAG);
      }
      return;
    }

    if (!isAuthenticated) {
      setSyncing(false);
      inFlightRef.current = false;
      return;
    }

    if (user && localStorage.getItem("token")) {
      const returnTo = sessionStorage.getItem(AUTH0_RETURN_TO_KEY);
      if (returnTo && !didRedirectRef.current) {
        didRedirectRef.current = true;
        sessionStorage.removeItem(AUTH0_RETURN_TO_KEY);
        navigate(returnTo, { replace: true });
      }
      setSyncing(false);
      return;
    }

    if (inFlightRef.current) return;

    let alive = true;
    inFlightRef.current = true;
    setSyncing(true);
    setError(null);

    (async () => {
      try {
        const claims = await getIdTokenClaims();
        if (!alive) return;

        const idToken = claims?.__raw;
        if (!idToken) {
          throw new Error("Missing Auth0 ID token");
        }

        await syncFromAuth0(idToken);
        if (!alive) return;

        toast.success("Signed in");
        const returnTo =
          sessionStorage.getItem(AUTH0_RETURN_TO_KEY) || "/dashboard";
        sessionStorage.removeItem(AUTH0_RETURN_TO_KEY);
        didRedirectRef.current = true;
        navigate(returnTo, { replace: true });
      } catch (err) {
        if (!alive) return;
        console.error("Auth0 session bridge failed:", err);
        const message =
          err.response?.data?.message ||
          err.message ||
          "Could not finish Auth0 sign-in";
        setError(message);
        toast.error(message);
        sessionStorage.removeItem(AUTH0_RETURN_TO_KEY);
      } finally {
        inFlightRef.current = false;
        // Always clear — StrictMode cancel must not leave syncing=true forever
        setSyncing(false);
      }
    })();

    return () => {
      alive = false;
      // Allow a remount (StrictMode) to start a fresh sync
      inFlightRef.current = false;
    };
  }, [
    isAuthenticated,
    auth0Loading,
    authLoading,
    user,
    getIdTokenClaims,
    syncFromAuth0,
    navigate,
  ]);

  const needsSync =
    isAuthenticated &&
    !user &&
    !localStorage.getItem("token") &&
    !sessionStorage.getItem(AUTH0_LOGOUT_FLAG);

  const value = {
    syncing: Boolean(syncing || (needsSync && (auth0Loading || authLoading))),
    error,
  };

  return (
    <Auth0SyncContext.Provider value={value}>
      {children}
    </Auth0SyncContext.Provider>
  );
}
