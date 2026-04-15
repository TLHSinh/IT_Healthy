// src/hooks/useAuthAdmin.js
import { clearAdminSession, getAdminInfo, isAdminAuthenticated, setAdminSession } from "../utils/adminAuth";

export function useAuthAdmin() {
  const admin = getAdminInfo();

  const login = (data) => {
    setAdminSession(data);
  };

  const logout = () => {
    clearAdminSession();
  };

  return { admin, isAuthenticated: isAdminAuthenticated(), login, logout };
}
