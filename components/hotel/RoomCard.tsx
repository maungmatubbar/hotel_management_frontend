"use client";

import { useState } from "react";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Eye, Images, Pencil, Trash2, Users, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { NotifyPopup } from "@/components/ui/notify-popup";
import { deleteRoom } from "@/lib/tenant-api";
import { cn, formatCurrencyAmount } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";
import { useTenantStore } from "@/store/tenant-store";

type RoomCardProps = {
  room: {
    id?: string | number;
    name?: string;
    room_name?: string;
    capacity: string;
    price?: string;
    rate?: string;
    status: string;
    amenities: string[];
    images?: string[];
    image_urls?: string[];
    room_type?: string;
    available_rooms?: string;
  };
};

function formatRoomType(roomType?: string) {
  if (!roomType) {
    return "";
  }

  if (roomType === "ac") {
    return "AC";
  }

  if (roomType === "non_ac") {
    return "Non AC";
  }

  return roomType.replaceAll("_", " ");
}

function formatCapacity(capacity: string) {
  if (!capacity) {
    return "";
  }

  return /\D/.test(capacity) ? capacity : `${capacity} guest${capacity === "1" ? "" : "s"}`;
}

export function RoomCard({ room }: RoomCardProps) {
  const queryClient = useQueryClient();
  const token = useAuthStore((state) => state.token);
  const tenant = useTenantStore((state) => state.tenant);
  const images = room.image_urls?.length ? room.image_urls : room.images ?? [];
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [modalImageIndex, setModalImageIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleteNotifyOpen, setIsDeleteNotifyOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const roomName = room.room_name ?? room.name ?? "Room";
  const roomRate = formatCurrencyAmount(room.rate ?? room.price);
  const coverImage = images[activeImageIndex];
  const modalImage = images[modalImageIndex];
  const statusLabel = room.status.replaceAll("_", " ");
  const roomTypeLabel = formatRoomType(room.room_type);
  const capacityLabel = formatCapacity(room.capacity);
  const availableRoomsLabel = room.available_rooms
    ? `${room.available_rooms} room${room.available_rooms === "1" ? "" : "s"} available`
    : "";
  const canSlide = images.length > 1;

  function showPreviousImage() {
    setActiveImageIndex((current) => (current === 0 ? images.length - 1 : current - 1));
  }

  function showNextImage() {
    setActiveImageIndex((current) => (current === images.length - 1 ? 0 : current + 1));
  }

  function openImageModal(index: number) {
    setModalImageIndex(index);
    setIsModalOpen(true);
  }

  function showPreviousModalImage() {
    setModalImageIndex((current) => (current === 0 ? images.length - 1 : current - 1));
  }

  function showNextModalImage() {
    setModalImageIndex((current) => (current === images.length - 1 ? 0 : current + 1));
  }

  async function handleDeleteRoom() {
    if (!token || !room.id) {
      return;
    }

    setIsDeleting(true);

    try {
      await deleteRoom(token, tenant.id, room.id);
      setIsDeleteModalOpen(false);
      setIsDeleteNotifyOpen(true);
    } finally {
      setIsDeleting(false);
    }
  }

  function closeDeleteNotify() {
    setIsDeleteNotifyOpen(false);
    void queryClient.invalidateQueries({ queryKey: ["rooms", token, tenant.id] });
  }

  return (
    <>
      <Card className="group overflow-hidden p-4 transition duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/70 dark:hover:shadow-black/20 sm:p-5">
        <div
          className="relative flex h-72 items-end overflow-hidden rounded-3xl bg-linear-to-br from-cyan-100 via-slate-100 to-amber-100 bg-cover bg-center p-4 dark:from-cyan-950 dark:via-slate-900 dark:to-amber-950"
          style={coverImage ? { backgroundImage: `url(${coverImage})` } : undefined}
        >
          <div className="absolute inset-0 bg-linear-to-t from-slate-950/70 via-slate-950/10 to-transparent" />
          {!coverImage ? (
            <div className="absolute inset-0 grid place-items-center text-slate-500 dark:text-slate-400">
              <div className="text-center">
                <Images className="mx-auto h-8 w-8" />
                <p className="mt-2 text-sm font-medium">No room image</p>
              </div>
            </div>
          ) : null}

          <div className="absolute left-4 top-4 flex gap-2">
            <Badge className="bg-white/90 capitalize shadow-sm dark:bg-slate-950/80">
              {statusLabel}
            </Badge>
          </div>

          {canSlide ? (
            <div className="absolute inset-x-3 top-1/2 flex -translate-y-1/2 justify-between opacity-0 transition group-hover:opacity-100">
              <button
                type="button"
                onClick={showPreviousImage}
                className="rounded-full bg-white/90 p-2 text-slate-700 shadow-lg transition hover:bg-white dark:bg-slate-950/85 dark:text-slate-200"
                aria-label="Show previous room image"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={showNextImage}
                className="rounded-full bg-white/90 p-2 text-slate-700 shadow-lg transition hover:bg-white dark:bg-slate-950/85 dark:text-slate-200"
                aria-label="Show next room image"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          ) : null}

          {coverImage ? (
            <button
              type="button"
              onClick={() => openImageModal(activeImageIndex)}
              className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow-sm transition hover:bg-white dark:bg-slate-950/80 dark:text-slate-200"
              aria-label="View room images"
            >
              <Eye className="h-4 w-4" />
            </button>
          ) : null}

          <div className="relative w-full">
            {images.length > 1 ? (
              <div className="flex gap-1.5">
                {images.map((image, index) => (
                  <button
                    key={image}
                    type="button"
                    onClick={() => setActiveImageIndex(index)}
                    className={cn(
                      "h-1.5 rounded-full transition",
                      index === activeImageIndex ? "w-8 bg-white" : "w-3 bg-white/50"
                    )}
                    aria-label={`Show room image ${index + 1}`}
                  />
                ))}
              </div>
            ) : null}
          </div>
        </div>

        <div className="mt-5">
          <h3 className="text-xl font-semibold text-slate-950 dark:text-slate-50">{roomName}</h3>

          {roomTypeLabel || capacityLabel || availableRoomsLabel || roomRate ? (
            <div className="mt-4 mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-slate-50 p-3 dark:bg-slate-900">
              <p className="inline-flex flex-wrap items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-200">
                {roomTypeLabel ? <span>{roomTypeLabel}</span> : null}
                {roomTypeLabel && capacityLabel ? <span className="text-slate-400">•</span> : null}
                {capacityLabel ? (
                  <span className="inline-flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5" />
                    {capacityLabel}
                  </span>
                ) : null}
                {(roomTypeLabel || capacityLabel) && availableRoomsLabel ? (
                  <span className="text-slate-400">•</span>
                ) : null}
                {availableRoomsLabel ? <span>{availableRoomsLabel}</span> : null}
              </p>
              {roomRate ? (
                <p className="rounded-xl bg-white px-3 py-2 text-sm font-bold text-slate-950 shadow-sm dark:bg-slate-950 dark:text-slate-50">
                  {roomRate}
                </p>
              ) : null}
            </div>
          ) : null}

          <div className="flex flex-wrap gap-2">
            {room.amenities.slice(0, 4).map((amenity) => (
              <Badge key={amenity} className="font-medium">
                {amenity}
              </Badge>
            ))}
            {room.amenities.length > 4 ? (
              <Badge className="font-medium">+{room.amenities.length - 4} more</Badge>
            ) : null}
          </div>

          <div className="mt-5 grid grid-cols-2 gap-2">
            {room.id ? (
              <Link
                href={`/admin/rooms/${room.id}/edit`}
                className={cn(buttonVariants({ variant: "outline" }), "rounded-xl")}
              >
                <Pencil className="h-4 w-4" />
                Edit
              </Link>
            ) : null}
            <Button
              type="button"
              variant="outline"
              className="rounded-xl text-red-600 hover:text-red-700 dark:text-red-300"
              disabled={isDeleting || !room.id}
              onClick={() => setIsDeleteModalOpen(true)}
            >
              <Trash2 className="h-4 w-4" />
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </div>
      </Card>

      {isDeleteModalOpen ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/70 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={`delete-room-title-${room.id ?? "unknown"}`}
            className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-950"
          >
            <div className="flex items-start gap-4">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-300">
                <Trash2 className="h-5 w-5" />
              </div>
              <div>
                <h3
                  id={`delete-room-title-${room.id ?? "unknown"}`}
                  className="text-lg font-semibold text-slate-950 dark:text-slate-50"
                >
                  Delete room?
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                  Are you sure you want to delete {roomName}? This action cannot be undone.
                </p>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant="outline"
                className="rounded-xl"
                disabled={isDeleting}
                onClick={() => setIsDeleteModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                className="rounded-xl bg-red-600 text-white hover:bg-red-700"
                disabled={isDeleting}
                onClick={handleDeleteRoom}
              >
                {isDeleting ? "Deleting..." : "Confirm delete"}
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      <NotifyPopup
        isOpen={isDeleteNotifyOpen}
        title="Room deleted"
        message={`${roomName} deleted successfully.`}
        onClose={closeDeleteNotify}
      />

      {isModalOpen && modalImage ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/85 p-4">
          <div className="relative w-full max-w-5xl overflow-hidden rounded-3xl bg-slate-950 shadow-2xl">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="absolute right-4 top-4 z-10 rounded-full bg-white/90 p-2 text-slate-700 shadow-lg transition hover:bg-white"
              aria-label="Close room image gallery"
            >
              <X className="h-5 w-5" />
            </button>
            <div
              className="relative h-[75vh] bg-contain bg-center bg-no-repeat"
              style={{ backgroundImage: `url(${modalImage})` }}
            >
              {canSlide ? (
                <div className="absolute inset-x-4 top-1/2 flex -translate-y-1/2 justify-between">
                  <button
                    type="button"
                    onClick={showPreviousModalImage}
                    className="rounded-full bg-white/90 p-3 text-slate-700 shadow-lg transition hover:bg-white"
                    aria-label="Show previous modal image"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    onClick={showNextModalImage}
                    className="rounded-full bg-white/90 p-3 text-slate-700 shadow-lg transition hover:bg-white"
                    aria-label="Show next modal image"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              ) : null}
            </div>
            <div className="flex items-center justify-between gap-4 border-t border-white/10 p-4 text-sm text-white">
              <span>{roomName}</span>
              <span>
                {modalImageIndex + 1}/{images.length}
              </span>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
