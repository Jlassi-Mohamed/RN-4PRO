import {jwtDecode} from "jwt-decode"

export type UserPayload = {
  username: string;
  apps: string[];
  exp: number;
};

export function getAllowedApps(): string[] {
  const token = localStorage.getItem("access_token");
  if (!token) return [];
  try {
    const decoded = jwtDecode<UserPayload>(token);
    return decoded.apps;
  } catch {
    return [];
  }
}
