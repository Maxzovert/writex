export const isAuth0Configured = () =>
  Boolean(
    import.meta.env.VITE_AUTH0_DOMAIN && import.meta.env.VITE_AUTH0_CLIENT_ID
  );

export const AUTH0_RETURN_TO_KEY = "writex_auth0_return_to";
/** Set before Auth0 logout so SessionBridge does not immediately re-sync. */
export const AUTH0_LOGOUT_FLAG = "writex_auth0_logout";

/**
 * Drop stale Auth0 SPA cache (bad refresh tokens cause 403 on /oauth/token).
 */
export const clearAuth0BrowserCache = () => {
  if (typeof localStorage === "undefined") return;

  const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID || "";
  const toRemove = [];

  for (let i = 0; i < localStorage.length; i += 1) {
    const key = localStorage.key(i);
    if (!key) continue;
    const lower = key.toLowerCase();
    if (
      lower.includes("auth0") ||
      lower.includes("a0.spajs") ||
      (clientId && key.includes(clientId))
    ) {
      toRemove.push(key);
    }
  }

  toRemove.forEach((key) => localStorage.removeItem(key));
};

export const getAuth0Config = () => {
  const domain = import.meta.env.VITE_AUTH0_DOMAIN;
  const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID;
  const audience = import.meta.env.VITE_AUTH0_AUDIENCE;
  const useAudience =
    import.meta.env.VITE_AUTH0_USE_AUDIENCE === "true" && Boolean(audience);
  const redirectUri =
    import.meta.env.VITE_AUTH0_REDIRECT_URI || window.location.origin;

  return {
    domain,
    clientId,
    authorizationParams: {
      redirect_uri: redirectUri,
      ...(useAudience ? { audience } : {}),
      scope: "openid profile email",
    },
    cacheLocation: "memory",
    useRefreshTokens: false,
  };
};

export const AUTH0_DB_CONNECTION =
  import.meta.env.VITE_AUTH0_DB_CONNECTION || "Username-Password-Authentication";
