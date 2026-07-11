import React, { createContext, useContext, useState, useEffect } from "react";
import { User, Student } from "../types";

interface AuthContextType {
  token: string | null;
  user: User | null;
  student: Student | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: any) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  apiFetch: (url: string, options?: RequestInit) => Promise<any>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(localStorage.getItem("placement_token"));
  const [user, setUser] = useState<User | null>(null);
  const [student, setStudent] = useState<Student | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Core API Fetch Proxy helper that automatically attaches JWT headers
  const apiFetch = async (url: string, options: RequestInit = {}) => {
    const headers = {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    };

    const res = await fetch(url, { ...options, headers });
    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      throw new Error(errBody.error || `HTTP error! status: ${res.status}`);
    }
    return res.json();
  };

  const refreshUser = async () => {
    if (!token) {
      setUser(null);
      setStudent(null);
      setIsLoading(false);
      return;
    }

    try {
      const data = await apiFetch("/api/auth/verify");
      setUser(data.user);
      setStudent(data.student);
    } catch (err) {
      console.error("Failed to verify token, logging out:", err);
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, [token]);

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || "Login failed" };
      }

      localStorage.setItem("placement_token", data.token);
      setToken(data.token);
      setUser(data.user);
      setStudent(data.student);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || "Network error occurred" };
    }
  };

  const register = async (formData: any) => {
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || "Registration failed" };
      }

      localStorage.setItem("placement_token", data.token);
      setToken(data.token);
      setUser(data.user);
      setStudent(data.student);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || "Network error occurred" };
    }
  };

  const logout = () => {
    localStorage.removeItem("placement_token");
    setToken(null);
    setUser(null);
    setStudent(null);
    setIsLoading(false);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        student,
        isLoading,
        login,
        register,
        logout,
        refreshUser,
        apiFetch,
      }}
    >
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
