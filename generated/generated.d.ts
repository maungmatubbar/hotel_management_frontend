export type AuthDataResponse = {
  readonly token: string;
  readonly token_type: string;
  readonly user: UserDataResponse;
};
export type BookingDataResponse = {
  readonly id: number;
  readonly booking_number: string | null;
  readonly tenant_id: string | null;
  readonly user_id: number;
  readonly room_id: number | null;
  readonly guest_name: string;
  readonly guest_phone: string | null;
  readonly guest_email: string | null;
  readonly guest_address: string | null;
  readonly room: string;
  readonly assigned_room_number: string;
  readonly nid_number: string | null;
  readonly nid_image_url: string | null;
  readonly room_quantity: number;
  readonly discount: string;
  readonly promo_code: string | null;
  readonly check_in: string;
  readonly check_out: string;
  readonly status: string;
  readonly invoice: BookingInvoiceDataResponse | null;
};
export type BookingInvoiceDataResponse = {
  readonly id: number;
  readonly invoice_number: string;
  readonly subtotal: string;
  readonly discount: string;
  readonly total_amount: string;
  readonly amount_paid: string;
  readonly amount_due: string;
  readonly status: string;
  readonly issued_at: string;
  readonly due_at: string | null;
  readonly download_url: string;
  readonly payments: BookingPaymentDataResponse[];
};
export type BookingPaymentDataResponse = {
  readonly id: number;
  readonly amount: string;
  readonly type: string;
  readonly method: string;
  readonly reference: string | null;
  readonly paid_at: string;
  readonly receipt: BookingReceiptDataResponse | null;
};
export type BookingReceiptDataResponse = {
  readonly id: number;
  readonly receipt_number: string;
  readonly issued_at: string;
  readonly download_url: string;
};
export type BookingStatus =
  | "pending"
  | "confirmed"
  | "check_in"
  | "check_out"
  | "completed"
  | "cancelled";
export type PermissionDataResponse = {
  readonly id: number;
  readonly name: string;
  readonly guard_name: string;
};
export type RoleDataResponse = {
  readonly id: number;
  readonly name: string;
  readonly guard_name: string;
  readonly permissions: PermissionDataResponse[];
};
export type RoomDataResponse = {
  readonly id: number;
  readonly tenant_id: string | null;
  readonly room_name: string;
  readonly room_type: string;
  readonly capacity: number;
  readonly rate: string;
  readonly available_rooms: number;
  readonly status: string;
  readonly amenities: string[];
  readonly images: string[];
  readonly image_urls: string[];
  readonly description: string | null;
};
export type TenantUserDataResponse = {
  readonly id: number;
  readonly tenant_id: string;
  readonly name: string;
  readonly email: string;
  readonly phone_number: string | null;
  readonly roles: RoleDataResponse[];
};
export type UserDataResponse = {
  readonly id: number;
  readonly name: string;
  readonly email: string;
  readonly email_verified_at: string | null;
  readonly phone_number: string | null;
  readonly roles: RoleDataResponse[];
  readonly permissions: PermissionDataResponse[];
};
