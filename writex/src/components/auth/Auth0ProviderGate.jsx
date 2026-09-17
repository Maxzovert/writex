import { Auth0Provider } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";
import {
  AUTH0_RETURN_TO_KEY,
  getAuth0Config,
  isAuth0Configured,
} from "@/lib/auth0-config";

/**
 * Wraps the app with Auth0 when env vars are present; otherwise renders children as-is
 * so legacy email/password login still works.
 */
export function Auth0ProviderGate({ children }) {
  const navigate = useNavigate();

  if (!isAuth0Configured()) {
    return children;
  }

  const config = getAuth0Config();

  const onRedirectCallback = (appState) => {
    // Stay on a public route until Writex JWT sync finishes.
    const returnTo = appState?.returnTo || "/dashboard";
    sessionStorage.setItem(AUTH0_RETURN_TO_KEY, returnTo);
    navigate("/login", { replace: true });
  };

  return (
    <Auth0Provider
      domain={config.domain}
      clientId={config.clientId}
      authorizationParams={config.authorizationParams}
      cacheLocation={config.cacheLocation}
      useRefreshTokens={config.useRefreshTokens}
      onRedirectCallback={onRedirectCallback}
    >
      {children}
    </Auth0Provider>
  );
}
