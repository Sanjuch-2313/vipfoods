/* eslint-disable react/only-export-components */

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const AuthContext = createContext(null);

const USER_STORAGE_KEY = "vipfoods_user";
const TOKEN_STORAGE_KEY = "vipfoods_token";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  /*
   * Restore authentication data when the application loads.
   */
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem(USER_STORAGE_KEY);
      const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY);

      if (storedUser && storedToken) {
        const parsedUser = JSON.parse(storedUser);

        setUser(parsedUser);
        setToken(storedToken);
      } else {
        /*
         * If either the user or token is missing,
         * clear incomplete authentication data.
         */

        localStorage.removeItem(USER_STORAGE_KEY);
        localStorage.removeItem(TOKEN_STORAGE_KEY);

        setUser(null);
        setToken(null);
      }
    } catch (error) {
      console.error("AUTH RESTORE ERROR:", error);

      localStorage.removeItem(USER_STORAGE_KEY);
      localStorage.removeItem(TOKEN_STORAGE_KEY);

      setUser(null);
      setToken(null);
    } finally {
      setAuthLoading(false);
    }
  }, []);

  /*
   * Call this ONLY after the backend successfully
   * validates email/password and returns a JWT.
   *
   * Example:
   *
   * login(response.data.user, response.data.token);
   */
  const login = (authenticatedUser, jwtToken) => {
    if (!authenticatedUser || !jwtToken) {
      console.error(
        "LOGIN ERROR: User and JWT token are required"
      );

      return false;
    }

    setUser(authenticatedUser);
    setToken(jwtToken);

    localStorage.setItem(
      USER_STORAGE_KEY,
      JSON.stringify(authenticatedUser)
    );

    localStorage.setItem(
      TOKEN_STORAGE_KEY,
      jwtToken
    );

    return true;
  };

  /*
   * Remove local authentication data.
   */
  const logout = () => {
    setUser(null);
    setToken(null);

    localStorage.removeItem(USER_STORAGE_KEY);
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  };

  /*
   * Helper for authenticated API requests.
   *
   * Example:
   *
   * fetch("/api/orders", {
   *   headers: getAuthHeaders(),
   * });
   */
  const getAuthHeaders = () => {
    if (!token) {
      return {};
    }

    return {
      Authorization: `Bearer ${token}`,
    };
  };

  const value = useMemo(
    () => ({
      user,

      token,

      isLoggedIn: Boolean(user && token),

      authLoading,

      login,

      logout,

      getAuthHeaders,
    }),
    [user, token, authLoading]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used within AuthProvider"
    );
  }

  return context;
}