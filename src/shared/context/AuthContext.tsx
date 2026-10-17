"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { authApi } from "@/features/auth/api/authApi";

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
    let isMounted = true;
    const restoreSession = async () => {
      try {
        const { data } = await authApi.refresh();
        localStorage.setItem("accessToken", data.data.accessToken);
        const me = await authApi.getMe();
        if (isMounted) setUserState(me.data.data);
      } catch {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");
        if (isMounted) setUserState(null);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    void restoreSession();
    return () => { isMounted = false; };
  }, []);

  const setUser = (nextUser: UserInfo | null) => {
    if (!nextUser) {
      for (const key of Object.keys(sessionStorage)) {
        if (key.startsWith('audio-evaluation:')) sessionStorage.removeItem(key);
      }
    }
    setUserState(nextUser);
    localStorage.removeItem("user");
  };

  const hasRole = (role: number) => user?.role === role;
  const hasAnyRole = (roles: number[]) => user ? roles.includes(user.role) : false;

  const logout = async () => {
    try {
      await authApi.logout();
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
