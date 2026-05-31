import { readFileSync } from "node:fs";
import { test } from "node:test";
import assert from "node:assert/strict";

const bookingDetailSource = readFileSync(
  new URL("../app/(admin)/admin/bookings/[booking]/page.tsx", import.meta.url),
  "utf8"
);

test("nid number summary card is not rendered above action controls", () => {
  assert.match(
    bookingDetailSource,
    /<div className="mt-5 space-y-5">/,
    "Action controls should remain in a full-width section."
  );
  assert.doesNotMatch(
    bookingDetailSource,
    /NID number/,
    "The separate NID number card should not be rendered in the booking action area."
  );
  assert.doesNotMatch(
    bookingDetailSource,
    /mt-5 grid gap-5 lg:grid-cols-\[220px_1fr\]/,
    "The old lg split squeezed the action area on admin pages with side panels."
  );
});

test("booking status, room assignment, and guest document share one row", () => {
  assert.match(
    bookingDetailSource,
    /<div className="grid gap-4 xl:grid-cols-3">/,
    "The three booking action cards should sit in one row on wide screens."
  );
  assert.match(
    bookingDetailSource,
    /Booking status[\s\S]*Room assignment[\s\S]*Guest document/,
    "Booking status, room assignment, and guest document should be rendered in the same action group."
  );
  assert.match(
    bookingDetailSource,
    /className="min-w-0 overflow-hidden rounded-3xl border border-slate-200/,
    "Booking status card should allow shrinking without overflowing inside the row."
  );
  assert.match(
    bookingDetailSource,
    /className="min-w-0 overflow-hidden rounded-3xl border border-cyan-100/,
    "Room assignment card should allow shrinking without overflowing inside the full row."
  );
  assert.match(
    bookingDetailSource,
    /className="min-w-0 overflow-hidden rounded-3xl border border-emerald-100/,
    "NID upload card should allow shrinking without overflowing inside the full row."
  );
  assert.doesNotMatch(
    bookingDetailSource,
    /mt-4 grid gap-4 (?:lg|xl|2xl):grid-cols-2/,
    "Action cards should not use two-column shortcuts when the requirement is one row of three."
  );
});

test("form controls keep readable widths inside action cards", () => {
  assert.match(
    bookingDetailSource,
    /md:grid-cols-\[minmax\(0,1fr\)_auto\]/,
    "Room input should only share a row with the button when there is enough width."
  );
  assert.match(
    bookingDetailSource,
    /md:grid-cols-\[140px_minmax\(0,1fr\)\]/,
    "NID preview and file input should keep a fixed preview width and flexible input area."
  );
  assert.match(
    bookingDetailSource,
    /className="w-full md:w-auto"/,
    "Room assignment button should be full width on narrow screens."
  );
});

test("room number sentinel text is normalized away", () => {
  assert.match(
    bookingDetailSource,
    /trimmedRoomNumber\.toLowerCase\(\) === "to be assigned" \? "" : trimmedRoomNumber/,
    "The API sentinel value should not be displayed as an assigned room number."
  );
  assert.match(
    bookingDetailSource,
    /roomNumber \?\? normalizeRoomNumber\(booking\?\.assigned_room_number\)/,
    "Booking room number display should pass through the sentinel normalizer."
  );
});

test("guest document preview uses saved nid image when present", () => {
  assert.match(
    bookingDetailSource,
    /selectedNidPreviewUrl \|\| uploadedNidImageUrl \|\| booking\?\.nid_image_url \|\| ""/,
    "Guest document preview should fall back to the saved booking NID image."
  );
  assert.match(
    bookingDetailSource,
    /src=\{currentNidPreviewUrl\}/,
    "Guest document image should render from the resolved preview URL."
  );
});
