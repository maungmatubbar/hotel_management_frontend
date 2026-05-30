const DEFAULT_API_BASE_URL = "http://localhost:8084/api";
const API_BASE_URL =
  process.env.BACKEND_URL ?? process.env.NEXT_PUBLIC_BACKEND_URL ?? DEFAULT_API_BASE_URL;
const TENANT_API_BASE_URL = (process.env.TENANT_API_URL ?? `${API_BASE_URL}/tenants`).replace(
  /\/$/,
  ""
);

function resolveTenantId(request: Request): string {
  const tenantFromHeader = request.headers.get("X-Tenant-Id");

  return process.env.TENANT_ID || tenantFromHeader || "";
}

export async function GET(request: Request) {
  try {
    const tenantId = resolveTenantId(request);

    if (!tenantId) {
      throw new Error("TENANT_ID is not configured");
    }

    const response = await fetch(`${TENANT_API_BASE_URL}/${encodeURIComponent(tenantId)}/me`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: request.headers.get("Authorization") ?? "",
      },
    });

    return new Response(await response.text(), {
      status: response.status,
      headers: {
        "Content-Type": response.headers.get("Content-Type") ?? "application/json",
      },
    });
  } catch (error) {
    return Response.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Current user request failed",
        data: null,
      },
      { status: 500 }
    );
  }
}
