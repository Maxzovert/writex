import axios from "axios";
import { createContext, useCallback, useContext, useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_BASE_URL;
axios.defaults.baseURL = API_URL;

// Axios interceptor to attach JWT from localStorage
axios.interceptors.request.use(
  (config) => {
    const headers = config.headers || {};
    const hasAuthHeader =
      headers.Authorization || headers.authorization;
    if (!hasAuthHeader) {
      const token = localStorage.getItem("token");
      if (token) {
        headers.Authorization = `Bearer ${token}`;
        config.headers = headers;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setUser(null);
      return null;
    }

    try {
      const response = await axios.get("/users/profile-stats");
      const nextUser = response.data?.user ?? null;
      setUser(nextUser);
      return nextUser;
    } catch (error) {
      console.error("Failed to refresh user:", error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem("token");
        setUser(null);
      }
      throw error;
    }
  }, []);

  const syncFromAuth0 = useCallback(
    async (idToken, { rememberMe = true } = {}) => {
      const response = await axios.post(
        "/users/auth0/sync",
        { rememberMe },
        {
          headers: { Authorization: `Bearer ${idToken}` },
        }
      );

      const appToken = response.data.token;
      localStorage.setItem("token", appToken);
      axios.defaults.headers.common["Authorization"] = `Bearer ${appToken}`;

      try {
        const nextUser = await refreshUser();
        if (nextUser) {
          return { ...response.data, user: nextUser };
        }
      } catch (error) {
        console.error("profile-stats after Auth0 sync failed:", error);
      }

      // Fallback so PrivateRoute is not stuck without a user object
      const fallbackUser = {
        _id: response.data._id,
        username: response.data.username,
        email: response.data.email,
        authProviders: response.data.authProviders,
      };
      setUser(fallbackUser);
      return { ...response.data, user: fallbackUser };
    },
    [refreshUser]
  );

  const clearLocalSession = useCallback(() => {
    localStorage.removeItem("token");
    delete axios.defaults.headers.common["Authorization"];
    setUser(null);
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await refreshUser();
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, [refreshUser]);

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        setLoading,
        refreshUser,
        syncFromAuth0,
        clearLocalSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
