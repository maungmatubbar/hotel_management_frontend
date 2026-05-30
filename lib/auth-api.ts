import type { AuthDataResponse, UserDataResponse } from "@/generated/generated";

const DEFAULT_BACKEND_URL = "http://localhost:8084/api";
const BACKEND_URL = (process.env.NEXT_PUBLIC_BACKEND_URL ?? DEFAULT_BACKEND_URL).replace(
  /\/$/,
  ""
);
const TENANT_API_URL = (
  process.env.NEXT_PUBLIC_TENANT_API_URL ?? `${BACKEND_URL}/tenants`
).replace(/\/$/, "");
const TENANT_ID = process.env.NEXT_PUBLIC_TENANT_ID;

type LoginPayload = {
  identifier: string;
  password: string;
};

type AuthRequestOptions = {
  tenantId?: string;
};

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
  response_code?: string;
};

function getAuthHeaders(token?: string, tenantId?: string): HeadersInit {
  return {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(tenantId ? { "X-Tenant-Id": tenantId } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function parseApiResponse<T>(response: Response): Promise<T> {
  const json = (await response.json().catch(() => null)) as ApiResponse<T> | null;

  if (!response.ok) {
    throw new Error(json?.message || "Request failed");
  }

  if (!json?.success) {
    throw new Error(json?.message || "Request failed");
  }

  return json.data;
}

function getLoginUrl(): string {
  if (TENANT_ID) {
    return `${TENANT_API_URL}/${encodeURIComponent(TENANT_ID)}/login`;
  }

  return `${BACKEND_URL}/auth/login`;
}

function getCurrentUserUrl(): string {
  if (TENANT_ID) {
    return `${TENANT_API_URL}/${encodeURIComponent(TENANT_ID)}/me`;
  }

  return `${BACKEND_URL}/auth/me`;
}

export async function login(
  payload: LoginPayload,
  options?: AuthRequestOptions
): Promise<AuthDataResponse> {
  const response = await fetch(getLoginUrl(), {
    method: "POST",
    headers: getAuthHeaders(undefined, options?.tenantId),
    body: JSON.stringify(payload),
  });

  return parseApiResponse<AuthDataResponse>(response);
}

export async function getCurrentUser(
  token: string,
  options?: AuthRequestOptions
): Promise<UserDataResponse> {
  const response = await fetch(getCurrentUserUrl(), {
    method: "GET",
    headers: getAuthHeaders(token, options?.tenantId),
  });

  return parseApiResponse<UserDataResponse>(response);
}
