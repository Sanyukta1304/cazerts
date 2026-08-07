"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type Gender = "male" | "female";

type User = {
  phone: string;
  name?: string;
  gender?: Gender;
  avatarId?: string; // e.g. "female-3", "male-1"
};

type AuthContextType = {
  user: User | null;
  isLoggedIn: boolean;
  login: (phone: string) => void;
  updateProfile: (name: string, gender: Gender, avatarId: string) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = "cazerts_user";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        setUser(null);
      }
    }
  }, []);

  const login = (phone: string) => {
    const newUser = { phone };
    setUser(newUser);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
  };

  const updateProfile = (name: string, gender: Gender, avatarId: string) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, name, gender, avatarId };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <AuthContext.Provider value={{ user, isLoggedIn: !!user, login, updateProfile, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}