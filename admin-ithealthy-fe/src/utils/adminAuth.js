const ADMIN_TOKEN_KEY = "adminToken";
const ADMIN_INFO_KEY = "adminInfo";
const LEGACY_TOKEN_KEY = "token";
const LEGACY_ADMIN_KEY = "admin";
const ROLE_CLAIM = "http://schemas.microsoft.com/ws/2008/06/identity/claims/role";

function parseJson(value) {
  if (!value) return null;

  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function decodeBase64Url(value) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padding = normalized.length % 4;
  const base64 = padding ? normalized.padEnd(normalized.length + (4 - padding), "=") : normalized;

  try {
    return window.atob(base64);
  } catch {
    return null;
  }
}

function normalizeRole(role) {
  return typeof role === "string" ? role.trim().toLowerCase() : "";
}

export function parseJwt(token) {
  if (!token || typeof token !== "string") return null;

  const parts = token.split(".");
  if (parts.length !== 3) return null;

  const payload = decodeBase64Url(parts[1]);
  return parseJson(payload);
}

export function getAdminToken() {
  return (
    localStorage.getItem(ADMIN_TOKEN_KEY) ||
    sessionStorage.getItem(ADMIN_TOKEN_KEY) ||
    localStorage.getItem(LEGACY_TOKEN_KEY)
  );
}

export function getAdminInfo() {
  return (
    parseJson(localStorage.getItem(ADMIN_INFO_KEY)) ||
    parseJson(sessionStorage.getItem(ADMIN_INFO_KEY)) ||
    parseJson(localStorage.getItem(LEGACY_ADMIN_KEY))
  );
}

export function clearAdminSession() {
  [localStorage, sessionStorage].forEach((storage) => {
    storage.removeItem(ADMIN_TOKEN_KEY);
    storage.removeItem(ADMIN_INFO_KEY);
    storage.removeItem(LEGACY_TOKEN_KEY);
    storage.removeItem(LEGACY_ADMIN_KEY);
  });
}

export function setAdminSession(data) {
  const accessToken = data?.accessToken || data?.AccessToken;
  const staff = data?.staff || data?.Staff;

  clearAdminSession();

  if (!accessToken || !staff) return;

  localStorage.setItem(ADMIN_TOKEN_KEY, accessToken);
  localStorage.setItem(ADMIN_INFO_KEY, JSON.stringify(staff));
}

export function isAdminAuthenticated() {
  const token = getAdminToken();
  if (!token) return false;

  const payload = parseJwt(token);
  if (!payload) return false;

  const expiresAt = typeof payload.exp === "number" ? payload.exp * 1000 : 0;
  if (!expiresAt || Date.now() >= expiresAt) return false;

  const tokenRole = normalizeRole(payload.role || payload[ROLE_CLAIM]);
  const storedRole = normalizeRole(getAdminInfo()?.roleStaff);

  return tokenRole === "admin" || storedRole === "admin";
}
