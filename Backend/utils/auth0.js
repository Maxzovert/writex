import { createRemoteJWKSet, jwtVerify } from "jose";

let jwks;

const getJwks = () => {
  const domain = process.env.AUTH0_DOMAIN;
  if (!domain) {
    throw new Error("AUTH0_DOMAIN is not configured");
  }
  if (!jwks) {
    jwks = createRemoteJWKSet(
      new URL(`https://${domain}/.well-known/jwks.json`)
    );
  }
  return jwks;
};

/**
 * Verify an Auth0 ID token (openid) and read email / profile claims.
 * Prefer ID tokens for sync — custom API access tokens often lack email and cannot call /userinfo.
 */
export const verifyAuth0IdToken = async (idToken) => {
  const domain = process.env.AUTH0_DOMAIN;
  const clientId = process.env.AUTH0_CLIENT_ID;

  if (!domain || !clientId) {
    throw new Error("Auth0 is not configured on the server");
  }

  const issuer = `https://${domain}/`;

  const { payload } = await jwtVerify(idToken, getJwks(), {
    issuer,
    audience: clientId,
  });

  return {
    sub: payload.sub,
    email: payload.email,
    emailVerified: Boolean(payload.email_verified),
    name: payload.name || payload.nickname || "",
    picture: payload.picture || "",
  };
};

export const providersFromAuth0Sub = (sub = "") => {
  if (sub.startsWith("google-oauth2|")) return ["google"];
  if (sub.startsWith("auth0|")) return ["password"];
  if (sub.includes("|")) {
    const connection = sub.split("|")[0];
    if (connection === "google-oauth2") return ["google"];
    return [connection];
  }
  return ["auth0"];
};
