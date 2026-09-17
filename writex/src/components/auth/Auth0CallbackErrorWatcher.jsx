import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { AUTH0_RETURN_TO_KEY } from "@/lib/auth0-config";

/**
 * Auth0 returns failures as ?error=&error_description= on the redirect URI.
 * Surface them once, then clean the URL.
 */
export function Auth0CallbackErrorWatcher() {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const error = params.get("error");
    const description = params.get("error_description");
    if (!error) return;

    const message = description
      ? decodeURIComponent(description.replace(/\+/g, " "))
      : error;

    console.error("Auth0 callback error:", error, message);
    toast.error(message);
    sessionStorage.removeItem(AUTH0_RETURN_TO_KEY);

    params.delete("error");
    params.delete("error_description");
    params.delete("state");
    const clean = `${window.location.pathname}${
      params.toString() ? `?${params}` : ""
    }${window.location.hash || ""}`;
    navigate(clean || "/login", { replace: true });
  }, [navigate]);

  return null;
}
