import { useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { toast } from "react-toastify";
import {
  AUTH0_LOGOUT_FLAG,
  clearAuth0BrowserCache,
  isAuth0Configured,
} from "@/lib/auth0-config";

export function Auth0SocialActions({ mode = "login" }) {
  if (!isAuth0Configured()) return null;
  return <Auth0SocialActionsInner mode={mode} />;
}

function Auth0SocialActionsInner({ mode }) {
  const { loginWithRedirect } = useAuth0();
  const [busy, setBusy] = useState(false);

  const loginWithGoogle = async () => {
    try {
      setBusy(true);
      // Fresh Google login should not be blocked by a prior logout flag
      sessionStorage.removeItem(AUTH0_LOGOUT_FLAG);
      clearAuth0BrowserCache();
      await loginWithRedirect({
        appState: { returnTo: "/dashboard" },
        authorizationParams: {
          connection: "google-oauth2",
          prompt: "select_account",
        },
      });
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Google sign-in failed");
      setBusy(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="relative py-1">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[var(--wx-line)]" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="rounded-sm bg-[var(--wx-elev)] px-3 text-[var(--wx-mute)]">
            or continue with
          </span>
        </div>
      </div>

      <button
        type="button"
        disabled={busy}
        onClick={loginWithGoogle}
        className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-[var(--wx-line)] bg-[var(--wx-elev)] px-4 py-2.5 text-sm font-semibold text-[var(--wx-text)] transition hover:bg-[var(--wx-soft)] disabled:opacity-60"
      >
        <GoogleIcon />
        {busy
          ? "Redirecting…"
          : mode === "signup"
            ? "Sign up with Google"
            : "Continue with Google"}
      </button>
    </div>
  );
}

export async function sendAuth0PasswordReset(email) {
  const trimmed = email?.trim();
  if (!trimmed) {
    toast.warning("Enter your email first, then try again");
    return false;
  }
  if (!isAuth0Configured()) {
    toast.error("Password reset is not configured");
    return false;
  }

  const domain = import.meta.env.VITE_AUTH0_DOMAIN;
  const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID;
  const connection =
    import.meta.env.VITE_AUTH0_DB_CONNECTION ||
    "Username-Password-Authentication";

  const response = await fetch(
    `https://${domain}/dbconnections/change_password`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: clientId,
        email: trimmed,
        connection,
      }),
    }
  );

  if (!response.ok) {
    throw new Error((await response.text()) || "Reset failed");
  }
  return true;
}

function GoogleIcon() {
  return (
    <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}
