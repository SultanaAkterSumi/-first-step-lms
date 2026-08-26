"use client";

import { createContext, useContext, useState, useEffect } from "react";
import Cookies from "js-cookie";
import api from "@/lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Page refresh -> user from cookie
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
    // Login in Strapi
    const res = await api.post("/auth/local", { identifier, password });
    const { jwt, user: userData } = res.data;

    // Get user data with role
    const roleRes = await api.get("/users/me?populate=role", {
      headers: { Authorization: `Bearer ${jwt}` },
    });

    const fullUser = roleRes.data;

    // Save in cookie and state
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
    const res = await api.post("/auth/local/register", {
      username,
      email,
      password,
    });
    return res.data;
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);