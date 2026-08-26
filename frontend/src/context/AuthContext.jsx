"use client";

import { createContext, useContext, useState, useEffect } from "react";
import Cookies from "js-cookie";

const AuthContext = createContext(null);

const STRAPI_URL = "http://localhost:1337";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = Cookies.get("user");
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        Cookies.remove("user");
      }
    }
    setLoading(false);
  }, []);

  const login = async (identifier, password) => {
    // Step 1: Login
    const loginRes = await fetch(`${STRAPI_URL}/api/auth/local`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier, password }),
    });

    if (!loginRes.ok) {
      throw new Error("Login failed");
    }

    const loginData = await loginRes.json();
    const { jwt, user: userData } = loginData;

    // Step 2: user with role
    const meRes = await fetch(`${STRAPI_URL}/api/users/me?populate=role`, {
      headers: { Authorization: `Bearer ${jwt}` },
    });

    const fullUser = await meRes.json();

    // Step 3: save in the cookies
    Cookies.set("jwt", jwt, { expires: 7 });
    Cookies.set("user", JSON.stringify(fullUser), { expires: 7 });
    setUser(fullUser);

    return fullUser;
  };

  const logout = () => {
    Cookies.remove("jwt");
    Cookies.remove("user");
    setUser(null);
  };

  const register = async (username, email, password) => {
    const res = await fetch(`${STRAPI_URL}/api/auth/local/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw { response: { data: err } };
    }

    return await res.json();
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);