// src/hooks/useAuthAdmin.js
import { useState } from "react";

export function useAuthAdmin() {
  const [admin, setAdmin] = useState(() => {
    const saved = localStorage.getItem("admin");
    return saved ? JSON.parse(saved) : null;
  });

  const login = (data) => {
    localStorage.setItem("token", data.AccessToken);
    localStorage.setItem("admin", JSON.stringify(data.Staff));
    setAdmin(data.Staff);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("admin");
    setAdmin(null);
  };

  return { admin, login, logout };
}
