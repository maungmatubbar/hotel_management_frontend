import type {
  BookingDataResponse as GeneratedBookingDataResponse,
  BookingInvoiceDataResponse,
  BookingPaymentDataResponse,
  BookingReceiptDataResponse,
  BookingStatus,
} from "@/generated/generated";

const DEFAULT_API_BASE_URL = "http://localhost:8084/api";
const API_BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? process.env.BACKEND_URL ?? DEFAULT_API_BASE_URL;

export type TenantUserRole = "admin" | "staff";

export type CreateTenantPayload = {
  id: string;
  name: string;
  domain: string;
};

export type TenantDataResponse = {
  readonly id: string;
  readonly name: string;
  readonly domains: string[];
};

export type CreateTenantUserPayload = {
  name: string;
  email: string;
  phone_number: string;
  password: string;
  role: TenantUserRole;
};

export type TenantUserDataResponse = {
  readonly id: number;
  readonly tenant_id: string;
  readonly name: string;
  readonly email: string;
  readonly phone_number: string | null;
  readonly roles: {
    readonly id: number;
    readonly name: string;
    readonly guard_name: string;
    readonly permissions: {
      readonly id: number;
      readonly name: string;
      readonly guard_name: string;
    }[];
  }[];
};

export type TenantFileUploadResponse = {
  readonly path: string;
  readonly url: string;
};

export type RoomPayload = {
  room_name: string;
  room_type: string;
  capacity: string;
  rate: string;
  available_rooms: string;
  status: string;
  amenities: string[];
  description: string;
  images: string[];
};

export type RoomDataResponse = RoomPayload & {
  readonly id: string | number;
  readonly image_urls?: string[];
};

export type BookingPayload = {
  guest_name: string;
  guest_phone: string;
  guest_email: string;
  guest_address: string;
  room_id: string | number;
  assigned_room_number: string;
  nid_number: string;
  nid_image_url: string;
  room_quantity: number;
  discount: number;
  promo_code: string;
  check_in: string;
  check_out: string;
};

export type PublicBookingPayload = {
  customer_name: string;
  phone_number: string;
  email?: string;
  address: string;
  guest_name: string;
  guest_phone: string;
  guest_email?: string;
  guest_address: string;
  guests: number;
  room_id: string | number;
  room_quantity: number;
  check_in: string;
  check_out: string;
  payment_option: "pay_now" | "pay_later";
  stay_nights: number;
  total_amount: number;
};

export type PublicBookingResponse = {
  readonly booking: BookingDataResponse;
  readonly payment: {
    readonly payment_url: string;
    readonly transaction_id: string;
  } | null;
};

export type { BookingInvoiceDataResponse, BookingPaymentDataResponse, BookingReceiptDataResponse, BookingStatus };

export type BookingInvoiceResponse = BookingInvoiceDataResponse;
export type BookingPaymentResponse = BookingPaymentDataResponse;
export type BookingReceiptResponse = BookingReceiptDataResponse;

export type BookingPaymentPayload = {
  amount: string;
  type: "full_payment" | "down_payment";
  method: string;
  reference?: string;
  paid_at: string;
};

export type BookingStatusPayload = {
  status: BookingStatus;
};

export type BookingRoomAssignmentPayload = {
  room_id: string | number;
  assigned_room_number: string;
};

export type BookingNidImagePayload = {
  nid_image_url: string;
};

/** API booking shape from generated types, plus optional legacy list/detail fields. */
export type BookingDataResponse = GeneratedBookingDataResponse & {
  readonly id: string | number;
  readonly discount?: string | number;
  readonly total?: string | number;
  readonly total_price?: string | number;
  readonly email?: string;
  readonly phone_number?: string | null;
  readonly check_in_date?: string;
  readonly check_out_date?: string;
  readonly address?: string;
};

export type PaginatedResponse<T> = {
  readonly current_page: number;
  readonly data: T[];
  readonly first_page_url: string | null;
  readonly from: number | null;
  readonly last_page: number;
  readonly last_page_url: string | null;
  readonly next_page_url: string | null;
  readonly path: string;
  readonly per_page: number;
  readonly prev_page_url: string | null;
  readonly to: number | null;
  readonly total: number;
};

export type BookingFilters = {
  booking_number?: string;
  customer_name?: string;
  phone_number?: string;
  customer_email?: string;
};

export type BookingListParams = {
  page?: number;
  filters?: BookingFilters;
};

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
  response_code?: string;
};

function getAuthHeaders(token: string): HeadersInit {
  return {
    "Content-Type": "application/json",
    Accept: "application/json",
    Authorization: `Bearer ${token}`,
  };
}

function getFileUploadHeaders(token: string): HeadersInit {
  return {
    Accept: "application/json",
    Authorization: `Bearer ${token}`,
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

function normalizeUploadedFile(
  item: TenantFileUploadResponse | null | undefined
): TenantFileUploadResponse {
  if (!item?.url) {
    throw new Error("Invalid file upload response");
  }

  return item;
}

async function parseFileUploadResponse(response: Response): Promise<TenantFileUploadResponse> {
  const json = (await response.json().catch(() => null)) as
    | ApiResponse<TenantFileUploadResponse | TenantFileUploadResponse[]>
    | TenantFileUploadResponse
    | TenantFileUploadResponse[]
    | null;

  if (!response.ok) {
    throw new Error(json && "message" in json ? json.message : "File upload failed");
  }

  if (json && "success" in json) {
    if (!json.success) {
      throw new Error(json.message || "File upload failed");
    }

    if (Array.isArray(json.data)) {
      return normalizeUploadedFile(json.data[0]);
    }

    return normalizeUploadedFile(json.data);
  }

  if (Array.isArray(json)) {
    return normalizeUploadedFile(json[0]);
  }

  if (json && "path" in json && "url" in json) {
    return normalizeUploadedFile(json);
  }

  throw new Error("Invalid file upload response");
}

export async function getTenants(token: string): Promise<TenantDataResponse[]> {
  const response = await fetch(`${API_BASE_URL}/tenants`, {
    method: "GET",
    headers: getAuthHeaders(token),
  });

  return parseApiResponse<TenantDataResponse[]>(response);
}

export async function createTenant(
  token: string,
  payload: CreateTenantPayload
): Promise<TenantDataResponse> {
  const response = await fetch(`${API_BASE_URL}/tenants`, {
    method: "POST",
    headers: getAuthHeaders(token),
    body: JSON.stringify(payload),
  });

  return parseApiResponse<TenantDataResponse>(response);
}

export async function getTenantUsers(
  token: string,
  tenant: string
): Promise<TenantUserDataResponse[]> {
  const response = await fetch(`${API_BASE_URL}/tenants/${encodeURIComponent(tenant)}/users`, {
    method: "GET",
    headers: getAuthHeaders(token),
  });

  return parseApiResponse<TenantUserDataResponse[]>(response);
}

export async function getAllTenantUsers(token: string): Promise<TenantUserDataResponse[]> {
  const tenants = await getTenants(token);

  if (!tenants.length) {
    return [];
  }

  const usersByTenant = await Promise.all(
    tenants.map((tenant) => getTenantUsers(token, tenant.id))
  );

  return usersByTenant.flat();
}

export async function createTenantUser(
  token: string,
  tenant: string,
  payload: CreateTenantUserPayload
): Promise<TenantUserDataResponse> {
  const response = await fetch(`${API_BASE_URL}/tenants/${encodeURIComponent(tenant)}/users`, {
    method: "POST",
    headers: getAuthHeaders(token),
    body: JSON.stringify(payload),
  });

  return parseApiResponse<TenantUserDataResponse>(response);
}

export async function uploadTenantFile(
  token: string,
  tenant: string,
  file: File
): Promise<TenantFileUploadResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(
    `${API_BASE_URL}/tenants/${encodeURIComponent(tenant)}/files/upload`,
    {
      method: "POST",
      headers: getFileUploadHeaders(token),
      body: formData,
    }
  );

  return parseFileUploadResponse(response);
}

export async function createRoom(
  token: string,
  tenant: string,
  payload: RoomPayload
): Promise<RoomDataResponse> {
  const response = await fetch(`${API_BASE_URL}/tenants/${encodeURIComponent(tenant)}/rooms`, {
    method: "POST",
    headers: getAuthHeaders(token),
    body: JSON.stringify(payload),
  });

  return parseApiResponse<RoomDataResponse>(response);
}

export async function getTenantRooms(
  token: string,
  tenant: string
): Promise<RoomDataResponse[]> {
  const response = await fetch(`${API_BASE_URL}/tenants/${encodeURIComponent(tenant)}/rooms`, {
    method: "GET",
    headers: getAuthHeaders(token),
  });

  return parseApiResponse<RoomDataResponse[]>(response);
}

export async function getTenantWebsiteRooms(
  tenant: string,
  token?: string | null
): Promise<RoomDataResponse[]> {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  const response = await fetch(`${API_BASE_URL}/tenants/${encodeURIComponent(tenant)}/rooms`, {
    method: "GET",
    headers,
  });

  return parseApiResponse<RoomDataResponse[]>(response);
}

export async function createBooking(
  token: string,
  tenant: string,
  payload: BookingPayload
): Promise<BookingDataResponse> {
  const response = await fetch(`${API_BASE_URL}/tenants/${encodeURIComponent(tenant)}/bookings`, {
    method: "POST",
    headers: getAuthHeaders(token),
    body: JSON.stringify(payload),
  });

  return parseApiResponse<BookingDataResponse>(response);
}

export async function createPublicBooking(
  tenant: string,
  payload: PublicBookingPayload
): Promise<PublicBookingResponse> {
  const response = await fetch(`${API_BASE_URL}/tenants/${encodeURIComponent(tenant)}/public-bookings`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  });

  return parseApiResponse<PublicBookingResponse>(response);
}

export async function getPublicInvoice(
  tenant: string,
  invoiceId: string | number
): Promise<BookingInvoiceDataResponse> {
  const response = await fetch(
    `${API_BASE_URL}/tenants/${encodeURIComponent(tenant)}/public/invoices/${encodeURIComponent(String(invoiceId))}`,
    {
      headers: {
        Accept: "application/json",
      },
    }
  );

  return parseApiResponse<BookingInvoiceDataResponse>(response);
}

export async function getPublicInvoiceSslcommerzSuccess(
  tenant: string,
  invoiceNumber: string | number
): Promise<BookingInvoiceDataResponse> {
  const response = await fetch(
    `${API_BASE_URL}/tenants/${encodeURIComponent(tenant)}/public/invoices/${encodeURIComponent(
      String(invoiceNumber)
    )}`,
    {
      headers: {
        Accept: "application/json",
      },
    }
  );

  return parseApiResponse<BookingInvoiceDataResponse>(response);
}

export function isPublicInvoicePaid(invoice: BookingInvoiceDataResponse) {
  const status = invoice.status?.toLowerCase();

  if (status === "paid" || status === "completed" || status === "success") {
    return true;
  }

  const amountDue = Number.parseFloat(invoice.amount_due ?? "0");
  const amountPaid = Number.parseFloat(invoice.amount_paid ?? "0");
  const totalAmount = Number.parseFloat(invoice.total_amount ?? "0");

  if (!Number.isNaN(amountDue) && amountDue <= 0 && amountPaid > 0) {
    return true;
  }

  if (!Number.isNaN(totalAmount) && totalAmount > 0 && amountPaid >= totalAmount) {
    return true;
  }

  return false;
}

export async function getTenantBookings(
  token: string,
  tenant: string,
  params: BookingListParams = {}
): Promise<PaginatedResponse<BookingDataResponse>> {
  const searchParams = new URLSearchParams();

  if (params.page && params.page > 1) {
    searchParams.set("page", String(params.page));
  }

  Object.entries(params.filters ?? {}).forEach(([key, value]) => {
    const filterValue = value?.trim();

    if (filterValue) {
      searchParams.set(`filter[${key}]`, filterValue);
    }
  });

  const queryString = searchParams.toString();
  const response = await fetch(`${API_BASE_URL}/tenants/${encodeURIComponent(tenant)}/bookings${queryString ? `?${queryString}` : ""}`, {
    method: "GET",
    headers: getAuthHeaders(token),
  });

  return parseApiResponse<PaginatedResponse<BookingDataResponse>>(response);
}

export async function getTenantBooking(
  token: string,
  tenant: string,
  booking: string | number
): Promise<BookingDataResponse> {
  const response = await fetch(
    `${API_BASE_URL}/tenants/${encodeURIComponent(tenant)}/bookings/${encodeURIComponent(String(booking))}`,
    {
      method: "GET",
      headers: getAuthHeaders(token),
    }
  );

  return parseApiResponse<BookingDataResponse>(response);
}

export async function payBookingInvoice(
  token: string,
  tenant: string,
  booking: string | number,
  payload: BookingPaymentPayload
): Promise<BookingDataResponse> {
  const response = await fetch(
    `${API_BASE_URL}/tenants/${encodeURIComponent(tenant)}/bookings/${encodeURIComponent(String(booking))}/payments`,
    {
      method: "POST",
      headers: getAuthHeaders(token),
      body: JSON.stringify(payload),
    }
  );

  return parseApiResponse<BookingDataResponse>(response);
}

export async function updateBookingStatus(
  token: string,
  tenant: string,
  booking: string | number,
  payload: BookingStatusPayload
): Promise<BookingDataResponse> {
  const response = await fetch(
    `${API_BASE_URL}/tenants/${encodeURIComponent(tenant)}/bookings/${encodeURIComponent(String(booking))}/status`,
    {
      method: "PATCH",
      headers: getAuthHeaders(token),
      body: JSON.stringify(payload),
    }
  );

  return parseApiResponse<BookingDataResponse>(response);
}

export async function assignBookingRoom(
  token: string,
  tenant: string,
  booking: string | number,
  payload: BookingRoomAssignmentPayload
): Promise<BookingDataResponse> {
  const response = await fetch(
    `${API_BASE_URL}/tenants/${encodeURIComponent(tenant)}/bookings/${encodeURIComponent(String(booking))}/assign-room`,
    {
      method: "PATCH",
      headers: getAuthHeaders(token),
      body: JSON.stringify(payload),
    }
  );

  return parseApiResponse<BookingDataResponse>(response);
}

export async function updateBookingNidImage(
  token: string,
  tenant: string,
  booking: string | number,
  payload: BookingNidImagePayload
): Promise<BookingDataResponse> {
  const response = await fetch(
    `${API_BASE_URL}/tenants/${encodeURIComponent(tenant)}/bookings/${encodeURIComponent(String(booking))}/nid-image`,
    {
      method: "PATCH",
      headers: getAuthHeaders(token),
      body: JSON.stringify(payload),
    }
  );

  return parseApiResponse<BookingDataResponse>(response);
}

export async function getRoom(
  token: string,
  tenant: string,
  room: string | number
): Promise<RoomDataResponse> {
  const response = await fetch(
    `${API_BASE_URL}/tenants/${encodeURIComponent(tenant)}/rooms/${encodeURIComponent(String(room))}`,
    {
      method: "GET",
      headers: getAuthHeaders(token),
    }
  );

  return parseApiResponse<RoomDataResponse>(response);
}

export async function updateRoom(
  token: string,
  tenant: string,
  room: string | number,
  payload: RoomPayload
): Promise<RoomDataResponse> {
  const response = await fetch(
    `${API_BASE_URL}/tenants/${encodeURIComponent(tenant)}/rooms/${encodeURIComponent(String(room))}`,
    {
      method: "PUT",
      headers: getAuthHeaders(token),
      body: JSON.stringify(payload),
    }
  );

  return parseApiResponse<RoomDataResponse>(response);
}

export async function deleteRoom(
  token: string,
  tenant: string,
  room: string | number
): Promise<void> {
  const response = await fetch(
    `${API_BASE_URL}/tenants/${encodeURIComponent(tenant)}/rooms/${encodeURIComponent(String(room))}`,
    {
      method: "DELETE",
      headers: getAuthHeaders(token),
    }
  );

  await parseApiResponse<unknown>(response);
}
