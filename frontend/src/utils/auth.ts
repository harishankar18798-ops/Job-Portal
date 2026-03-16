import { jwtDecode } from "jwt-decode";

type TokenPayload = {
  id: number;
  email: string;
  role: "admin" | "user";
};

function getToken() {
  return localStorage.getItem("accessToken");
}

export function getUser(): TokenPayload | null {
  const token = getToken();
  if (!token) return null;

  try {
    return jwtDecode<TokenPayload>(token);
  } catch {
    return null;
  }
}

export function getUserId(): number | null {
  return getUser()?.id ?? null;
}

export function getUserEmail(): string | null {
  return getUser()?.email ?? null;
}

export function getUserRole(): string | null {
  return getUser()?.role ?? null;
}