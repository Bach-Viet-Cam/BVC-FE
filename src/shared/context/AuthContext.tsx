"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { axiosClient } from "@/shared/api/axiosClient";

export type UserInfo = {
  userId: string;
  username: string;
  email: string;
  role: number;
};

type AuthContextType = {
  user: UserInfo | null;
  setUser: (user: UserInfo | null) => void;
  hasRole: (role: number) => boolean;
  hasAnyRole: (roles: number[]) => boolean;
  logout: () => Promise<void>;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUserState(JSON.parse(storedUser) as UserInfo);
      } catch {
        localStorage.removeItem("user");
      }
    }
    setIsLoading(false);
  }, []);

  const setUser = (nextUser: UserInfo | null) => {
    setUserState(nextUser);
    if (nextUser) {
      localStorage.setItem("user", JSON.stringify(nextUser));
      return;
    }
    localStorage.removeItem("user");
  };

  const hasRole = (role: number) => user?.role === role;
  const hasAnyRole = (roles: number[]) => user ? roles.includes(user.role) : false;

  const logout = async () => {
    try {
      await axiosClient.post("/auth/logout");
    } finally {
      setUser(null);
      localStorage.removeItem("accessToken");
      window.location.href = "/login";
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, hasRole, hasAnyRole, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth phải được sử dụng bên trong AuthProvider");
  }
  return context;
}
