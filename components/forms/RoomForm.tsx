"use client";

import { type ChangeEvent, type FormEvent, type KeyboardEvent, useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Camera, ChevronLeft, ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NotifyPopup } from "@/components/ui/notify-popup";
import { createRoom, type RoomDataResponse, updateRoom, uploadTenantFile } from "@/lib/tenant-api";
import { useAuthStore } from "@/store/auth-store";
import { useTenantStore } from "@/store/tenant-store";

const fieldClassName =
  "mt-2 flex h-11 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-slate-950 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50 dark:placeholder:text-slate-500 dark:focus:border-slate-300";

const initialForm = {
  name: "",
  capacity: "",
  price: "",
  availableRooms: "",
  airConditioning: "ac",
  status: "available",
  description: "",
};

type RoomImage = {
  id: string;
  name: string;
  src: string;
  path?: string;
  url?: string;
  status: "uploading" | "uploaded" | "failed";
  error?: string;
};

type RoomFormProps = {
  mode?: "create" | "edit";
  room?: RoomDataResponse;
};

function getInitialForm(room?: RoomDataResponse) {
  if (!room) {
    return initialForm;
  }

  return {
    name: room.room_name ?? "",
    capacity: room.capacity ?? "",
    price: room.rate ?? "",
    availableRooms: room.available_rooms ?? "",
    airConditioning: room.room_type ?? "ac",
    status: room.status ?? "available",
    description: room.description ?? "",
  };
}

function getInitialRoomImages(room?: RoomDataResponse): RoomImage[] {
  const urls = room?.image_urls ?? room?.images ?? [];

  return urls.map((url, index) => ({
    id: `${room?.id ?? "room"}-${index}-${url}`,
    name: `Room image ${index + 1}`,
    src: url,
    url,
    status: "uploaded",
  }));
}

export function RoomForm({ mode = "create", room }: RoomFormProps) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const token = useAuthStore((state) => state.token);
  const tenant = useTenantStore((state) => state.tenant);
  const [form, setForm] = useState(() => getInitialForm(room));
  const [roomImages, setRoomImages] = useState<RoomImage[]>(() => getInitialRoomImages(room));
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [amenityInput, setAmenityInput] = useState("");
  const [amenities, setAmenities] = useState<string[]>(room?.amenities ?? []);
  const [message, setMessage] = useState("");
  const [isNotifyOpen, setIsNotifyOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);

  useEffect(() => {
    setForm(getInitialForm(room));
    setRoomImages(getInitialRoomImages(room));
    setActiveImageIndex(0);
    setAmenityInput("");
    setAmenities(room?.amenities ?? []);
    setMessage("");
    setIsNotifyOpen(false);
    setErrorMessage("");
  }, [room]);

  function resetForm() {
    setForm(getInitialForm(room));
    setRoomImages(getInitialRoomImages(room));
    setActiveImageIndex(0);
    setAmenityInput("");
    setAmenities(room?.amenities ?? []);
    setMessage("");
    setIsNotifyOpen(false);
    setErrorMessage("");
    setIsCreatingRoom(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function readImageFile(file: File): Promise<RoomImage> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve({
          id: `${file.name}-${file.lastModified}-${file.size}-${Math.random().toString(36).slice(2)}`,
          name: file.name,
          src: typeof reader.result === "string" ? reader.result : "",
          status: "uploading",
        });
      };
      reader.readAsDataURL(file);
    });
  }

  async function uploadRoomImage(imageId: string, file: File) {
    if (!token) {
      setRoomImages((current) =>
        current.map((image) =>
          image.id === imageId
            ? { ...image, status: "failed", error: "Missing auth token" }
            : image
        )
      );
      return;
    }

    try {
      const uploadedFile = await uploadTenantFile(token, tenant.id, file);

      setRoomImages((current) =>
        current.map((image) =>
          image.id === imageId
            ? {
                ...image,
                path: uploadedFile.path,
                url: uploadedFile.url,
                status: "uploaded",
              }
            : image
        )
      );
    } catch (error) {
      setRoomImages((current) =>
        current.map((image) =>
          image.id === imageId
            ? {
                ...image,
                status: "failed",
                error: error instanceof Error ? error.message : "Upload failed",
              }
            : image
        )
      );
    }
  }

  function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);

    if (files.length === 0) {
      return;
    }

    void Promise.all(files.map(readImageFile)).then((images) => {
      const validImages = images.filter((image) => image.src);

      setRoomImages((current) => {
        if (current.length === 0 && validImages.length > 0) {
          setActiveImageIndex(0);
        }

        return [...current, ...validImages];
      });
      validImages.forEach((image, index) => {
        void uploadRoomImage(image.id, files[index]);
      });

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    });
  }

  function removeImage(imageId: string) {
    setRoomImages((current) => {
      const nextImages = current.filter((image) => image.id !== imageId);
      setActiveImageIndex((currentIndex) => Math.min(currentIndex, Math.max(nextImages.length - 1, 0)));
      return nextImages;
    });
  }

  function showPreviousImage() {
    setActiveImageIndex((current) => (current === 0 ? roomImages.length - 1 : current - 1));
  }

  function showNextImage() {
    setActiveImageIndex((current) => (current === roomImages.length - 1 ? 0 : current + 1));
  }

  function addAmenity(value: string) {
    const amenity = value.trim();

    if (!amenity) {
      return;
    }

    setAmenities((current) =>
      current.some((item) => item.toLowerCase() === amenity.toLowerCase()) ? current : [...current, amenity]
    );
    setAmenityInput("");
  }

  function handleAmenityChange(event: ChangeEvent<HTMLInputElement>) {
    const value = event.target.value;

    if (value.includes(",")) {
      const parts = value.split(",");
      parts.slice(0, -1).forEach(addAmenity);
      setAmenityInput(parts.at(-1) ?? "");
      return;
    }

    setAmenityInput(value);
  }

  function handleAmenityKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      addAmenity(amenityInput);
    }
  }

  function removeAmenity(amenity: string) {
    setAmenities((current) => current.filter((item) => item !== amenity));
  }

  function getAmenitiesPayload() {
    const pendingAmenity = amenityInput.trim();

    if (!pendingAmenity) {
      return amenities;
    }

    return amenities.some((item) => item.toLowerCase() === pendingAmenity.toLowerCase())
      ? amenities
      : [...amenities, pendingAmenity];
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");

    if (!token) {
      setErrorMessage("Missing auth token");
      return;
    }

    const uploadedImageUrls = roomImages
      .map((image) => image.url)
      .filter((url): url is string => Boolean(url));
    const nextAmenities = getAmenitiesPayload();

    if (roomImages.length > 0 && uploadedImageUrls.length !== roomImages.length) {
      setErrorMessage("Image upload complete hoy nai. Failed image remove kore abar upload korun.");
      return;
    }

    setIsCreatingRoom(true);

    try {
      const payload = {
        room_name: form.name,
        room_type: form.airConditioning.toLowerCase(),
        capacity: form.capacity,
        rate: form.price,
        available_rooms: form.availableRooms,
        status: form.status.toLowerCase() || "available",
        amenities: nextAmenities,
        description: form.description,
        images: uploadedImageUrls,
      };
      const savedRoom =
        mode === "edit" && room
          ? await updateRoom(token, tenant.id, room.id, payload)
          : await createRoom(token, tenant.id, payload);

      setMessage(`${savedRoom.room_name || form.name} ${mode === "edit" ? "updated" : "created"} successfully.`);
      setIsNotifyOpen(true);
      void queryClient.invalidateQueries({ queryKey: ["rooms", token, tenant.id] });
      if (mode === "edit" && room) {
        void queryClient.invalidateQueries({ queryKey: ["rooms", "detail", token, tenant.id, String(room.id)] });
      }
      if (mode === "create") {
        setForm(initialForm);
        setRoomImages([]);
        setActiveImageIndex(0);
        setAmenityInput("");
        setAmenities([]);
      }

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : `Room ${mode === "edit" ? "update" : "create"} failed`);
    } finally {
      setIsCreatingRoom(false);
    }
  }

  const activeImage = roomImages[activeImageIndex] ?? roomImages[0];
  const isUploadingImages = roomImages.some((image) => image.status === "uploading");
  const isSubmitDisabled = isUploadingImages || isCreatingRoom;

  return (
    <>
    <Card id="create-room" className="p-5 sm:p-6">
      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-700 dark:text-cyan-300">
          {mode === "edit" ? "Update room type" : "New room type"}
        </p>
        <h3 className="text-xl font-semibold text-slate-950 dark:text-slate-50">
          {mode === "edit" ? "Edit room" : "Create room"}
        </h3>
        <p className="max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
          {mode === "edit"
            ? "Update room details, rate, inventory, and guest-facing amenities."
            : "Add room details, nightly rate, inventory count, and guest-facing amenities."}
        </p>
      </div>

      <form className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_24rem]" onSubmit={onSubmit}>
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
          <div>
            <Label htmlFor="room-name">Room name</Label>
            <Input
              id="room-name"
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              placeholder="Deluxe King Suite"
              className="mt-2"
              required
            />
          </div>
          <div>
            <Label htmlFor="room-capacity">Capacity</Label>
            <Input
              id="room-capacity"
              value={form.capacity}
              onChange={(event) => setForm((current) => ({ ...current, capacity: event.target.value }))}
              placeholder="2 adults"
              className="mt-2"
              required
            />
          </div>
          <div>
            <Label htmlFor="room-price">Nightly rate (TK)</Label>
            <Input
              id="room-price"
              value={form.price}
              onChange={(event) => setForm((current) => ({ ...current, price: event.target.value }))}
              placeholder="TK 12,000"
              className="mt-2"
              required
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <Label htmlFor="room-inventory">Available rooms</Label>
            <Input
              id="room-inventory"
              type="number"
              min="0"
              value={form.availableRooms}
              onChange={(event) =>
                setForm((current) => ({ ...current, availableRooms: event.target.value }))
              }
              placeholder="12"
              className="mt-2"
              required
            />
          </div>
          <div>
            <Label htmlFor="room-air-conditioning">Room AC type</Label>
            <select
              id="room-air-conditioning"
              value={form.airConditioning}
              onChange={(event) =>
                setForm((current) => ({ ...current, airConditioning: event.target.value }))
              }
              className={fieldClassName}
            >
              <option value="ac">AC</option>
              <option value="non_ac">Non AC</option>
            </select>
          </div>
          <div>
            <Label htmlFor="room-status">Status</Label>
            <select
              id="room-status"
              value={form.status}
              onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))}
              className={fieldClassName}
            >
              <option value="available">Available</option>
              <option value="few_left">Few left</option>
              <option value="paused">Paused</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </div>
        </div>

        <div>
          <Label htmlFor="room-amenities">Amenities</Label>
          <div className="mt-2 min-h-11 rounded-xl border border-slate-200 bg-white px-3 py-2 transition focus-within:border-slate-950 dark:border-slate-700 dark:bg-slate-950 dark:focus-within:border-slate-300">
            <div className="flex flex-wrap items-center gap-2">
              {amenities.map((amenity) => (
                <span
                  key={amenity}
                  className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200"
                >
                  {amenity}
                  <button
                    type="button"
                    onClick={() => removeAmenity(amenity)}
                    className="text-slate-400 transition hover:text-red-600 dark:hover:text-red-300"
                    aria-label={`Remove ${amenity}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
              <input
                id="room-amenities"
                value={amenityInput}
                onChange={handleAmenityChange}
                onKeyDown={handleAmenityKeyDown}
                onBlur={() => addAmenity(amenityInput)}
                placeholder={amenities.length > 0 ? "Add more..." : "King bed, Sea view, Breakfast"}
                className="min-w-36 flex-1 bg-transparent py-1 text-sm outline-none placeholder:text-slate-400 dark:text-slate-50 dark:placeholder:text-slate-500"
              />
            </div>
          </div>
        </div>

        <div>
          <Label htmlFor="room-description">Description</Label>
          <textarea
            id="room-description"
            value={form.description}
            onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
            placeholder="Short room description for guests and internal staff."
            className={`${fieldClassName} min-h-28 resize-none`}
          />
        </div>

        </div>

        <aside className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/60 dark:border-slate-800 dark:bg-slate-900/80 dark:shadow-black/20">
          <div className="flex items-center justify-between gap-3">
            <div>
              <Label>Room images</Label>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Upload multiple photos and preview them here.
              </p>
            </div>
            {roomImages.length > 0 ? (
              <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600 shadow-sm dark:bg-slate-900 dark:text-slate-300">
                {activeImageIndex + 1}/{roomImages.length}
              </span>
            ) : null}
          </div>

          <div
            className="group relative mt-4 flex min-h-80 items-end overflow-hidden rounded-3xl border border-slate-200 bg-linear-to-br from-cyan-100 via-slate-100 to-amber-100 bg-cover bg-center p-4 dark:border-slate-800 dark:from-cyan-950 dark:via-slate-900 dark:to-amber-950"
            style={activeImage ? { backgroundImage: `url(${activeImage.src})` } : undefined}
          >
            <div className="absolute inset-0 bg-linear-to-t from-slate-950/75 via-slate-950/10 to-transparent" />
            {activeImage ? (
              <>
                {roomImages.length > 1 ? (
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
                <button
                  type="button"
                  onClick={() => removeImage(activeImage.id)}
                  className="absolute right-3 top-3 rounded-full bg-white/90 p-2 text-slate-500 shadow-lg transition hover:text-red-600 dark:bg-slate-950/85 dark:text-slate-300 dark:hover:text-red-300"
                  aria-label={`Remove ${activeImage.name}`}
                >
                  <X className="h-4 w-4" />
                </button>
                <div className="absolute right-3 bottom-3 max-w-[calc(100%-1.5rem)] rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-700 shadow-lg dark:bg-slate-950/85 dark:text-slate-200">
                  {activeImage.status === "uploading" ? "Uploading..." : null}
                  {activeImage.status === "uploaded" ? "Uploaded" : null}
                  {activeImage.status === "failed" ? activeImage.error || "Upload failed" : null}
                </div>
              </>
            ) : (
              <div className="absolute inset-0 grid place-items-center p-6 text-center text-slate-500 dark:text-slate-400">
                <div>
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/80 text-slate-600 shadow-sm dark:bg-slate-900/80 dark:text-slate-300">
                    <Camera className="h-6 w-6" />
                  </div>
                  <p className="mt-4 text-sm font-semibold text-slate-700 dark:text-slate-300">
                    No image selected
                  </p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    JPG, PNG, or WebP works best.
                  </p>
                </div>
              </div>
            )}

            <div className="relative w-full">
              {roomImages.length > 1 ? (
                <div className="flex gap-1.5">
                  {roomImages.map((image, index) => (
                    <button
                      key={image.id}
                      type="button"
                      onClick={() => setActiveImageIndex(index)}
                      className={`h-1.5 rounded-full transition ${
                        index === activeImageIndex ? "w-8 bg-white" : "w-3 bg-white/50"
                      }`}
                      aria-label={`Show room image ${index + 1}`}
                    />
                  ))}
                </div>
              ) : null}
            </div>
          </div>

          <label className="mt-4 flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800">
            <Camera className="h-4 w-4" />
            Upload room images
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="sr-only"
              onChange={handleImageChange}
            />
          </label>
          {roomImages.length > 0 ? (
            <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
              {roomImages.filter((image) => image.status === "uploaded").length} uploaded URL
              {roomImages.filter((image) => image.status === "uploaded").length === 1 ? "" : "s"} ready for{" "}
              <code className="rounded bg-white px-1 py-0.5 dark:bg-slate-900">images</code> payload.
            </p>
          ) : null}

          {roomImages.length > 0 ? (
            <div className="mt-4 grid grid-cols-4 gap-2">
              {roomImages.map((image, index) => (
                <button
                  key={image.id}
                  type="button"
                  onClick={() => setActiveImageIndex(index)}
                  className={`relative h-16 overflow-hidden rounded-xl border transition ${
                    index === activeImageIndex
                      ? "border-slate-950 ring-2 ring-slate-950/20 dark:border-slate-100 dark:ring-slate-100/20"
                      : "border-slate-200 opacity-70 hover:opacity-100 dark:border-slate-800"
                  }`}
                  aria-label={`Show ${image.name}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element -- Upload previews can be data URLs or tenant storage URLs. */}
                  <img src={image.src} alt={image.name} className="h-full w-full object-cover" />
                  {image.status === "uploading" ? (
                    <span className="absolute inset-x-1 bottom-1 rounded-full bg-white/90 px-1 py-0.5 text-[10px] font-semibold text-slate-600">
                      Uploading
                    </span>
                  ) : null}
                  {image.status === "failed" ? (
                    <span className="absolute inset-x-1 bottom-1 rounded-full bg-red-50 px-1 py-0.5 text-[10px] font-semibold text-red-600">
                      Failed
                    </span>
                  ) : null}
                </button>
              ))}
            </div>
          ) : null}
        </aside>

        <div className="flex flex-wrap items-center gap-3 xl:col-span-2">
          <Button type="submit" className="rounded-full" disabled={isSubmitDisabled}>
            {isUploadingImages ? "Uploading images..." : null}
            {!isUploadingImages && isCreatingRoom ? `${mode === "edit" ? "Updating" : "Creating"} room...` : null}
            {!isUploadingImages && !isCreatingRoom ? `${mode === "edit" ? "Update" : "Create"} room` : null}
          </Button>
          <Button type="button" variant="outline" className="rounded-full" onClick={resetForm}>
            Clear
          </Button>
          {errorMessage ? (
            <p className="text-sm font-medium text-red-600 dark:text-red-300">{errorMessage}</p>
          ) : null}
        </div>
      </form>
    </Card>
    <NotifyPopup
      isOpen={isNotifyOpen}
      title={mode === "edit" ? "Room updated" : "Room saved"}
      message={message}
      onClose={() => setIsNotifyOpen(false)}
    />
    </>
  );
}
