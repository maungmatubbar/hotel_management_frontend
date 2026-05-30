"use client";

import { type ChangeEvent, type FormEvent, useMemo, useState } from "react";
import Image from "next/image";
import { Camera, CheckCircle2, KeyRound, Mail, Phone, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/store/auth-store";

type ProfileSettingsFormProps = {
  panelLabel: string;
};

function getInitials(name?: string | null): string {
  const words = name?.trim().split(/\s+/).filter(Boolean) ?? [];

  if (words.length === 0) {
    return "HM";
  }

  return words
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

export function ProfileSettingsForm({ panelLabel }: ProfileSettingsFormProps) {
  const user = useAuthStore((state) => state.user);
  const profilePhoto = useAuthStore((state) => state.profilePhoto);
  const setUser = useAuthStore((state) => state.setUser);
  const setProfilePhoto = useAuthStore((state) => state.setProfilePhoto);
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [phoneNumber, setPhoneNumber] = useState(user?.phone_number ?? "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [profileMessage, setProfileMessage] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const roles = useMemo(() => user?.roles.map((role) => role.name).join(", ") || panelLabel, [panelLabel, user]);

  function handlePhotoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setProfilePhoto(typeof reader.result === "string" ? reader.result : null);
      setProfileMessage("Profile photo updated.");
    };
    reader.readAsDataURL(file);
  }

  function handleProfileSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!user) {
      setProfileMessage("Please login again to update profile details.");
      return;
    }

    setUser({
      ...user,
      name,
      email,
      phone_number: phoneNumber || null,
    });
    setProfileMessage("Profile details saved.");
  }

  function handlePasswordSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordMessage("Please fill all password fields.");
      return;
    }

    if (newPassword.length < 8) {
      setPasswordMessage("New password must be at least 8 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordMessage("New password and confirm password do not match.");
      return;
    }

    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setPasswordMessage("Password reset request is ready.");
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[0.36fr_0.64fr]">
      <Card className="relative overflow-hidden p-6">
        <div className="absolute -right-16 -top-16 h-44 w-44 rounded-full bg-cyan-100 blur-3xl dark:bg-cyan-950/60" />
        <div className="relative">
          <div className="relative mx-auto flex h-28 w-28 overflow-hidden rounded-3xl bg-linear-to-br from-slate-950 to-cyan-700 text-3xl font-semibold text-white shadow-xl shadow-cyan-950/20 dark:from-slate-100 dark:to-cyan-200 dark:text-slate-950">
            {profilePhoto ? (
              <Image src={profilePhoto} alt={name || "Profile photo"} fill className="object-cover" />
            ) : (
              <span className="grid h-full w-full place-items-center">{getInitials(name)}</span>
            )}
          </div>
          <label className="mx-auto mt-4 flex w-fit cursor-pointer items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800">
            <Camera className="h-4 w-4" />
            Change photo
            <input type="file" accept="image/*" className="sr-only" onChange={handlePhotoChange} />
          </label>

          <div className="mt-6 text-center">
            <h2 className="text-2xl font-semibold text-slate-950 dark:text-slate-50">
              {name || user?.name || "Profile"}
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{roles}</p>
          </div>

          <div className="mt-8 space-y-3">
            {[
              { icon: Mail, label: email || "No email added" },
              { icon: Phone, label: phoneNumber || "No phone number added" },
              { icon: UserRound, label: panelLabel },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-medium text-slate-700 dark:border-slate-800 dark:bg-slate-950/70 dark:text-slate-300"
              >
                <item.icon className="h-4 w-4 text-cyan-700 dark:text-cyan-300" />
                <span className="truncate">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </Card>

      <div className="space-y-6">
        <Card className="p-5 sm:p-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-700 dark:text-cyan-300">
              Account details
            </p>
            <h2 className="mt-2 text-xl font-semibold text-slate-950 dark:text-slate-50">
              Update profile information
            </h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Change your display name, email address, and phone number.
            </p>
          </div>

          <form className="mt-6 grid gap-4 sm:grid-cols-2" onSubmit={handleProfileSubmit}>
            <div className="sm:col-span-2">
              <Label htmlFor="profile-name">Full name</Label>
              <Input id="profile-name" className="mt-2" value={name} onChange={(event) => setName(event.target.value)} />
            </div>
            <div>
              <Label htmlFor="profile-email">Email</Label>
              <Input
                id="profile-email"
                type="email"
                className="mt-2"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="profile-phone">Phone number</Label>
              <Input
                id="profile-phone"
                className="mt-2"
                value={phoneNumber}
                onChange={(event) => setPhoneNumber(event.target.value)}
              />
            </div>
            <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
              <Button type="submit">Save profile</Button>
              {profileMessage ? (
                <p className="flex items-center gap-2 text-sm font-medium text-emerald-600 dark:text-emerald-300">
                  <CheckCircle2 className="h-4 w-4" />
                  {profileMessage}
                </p>
              ) : null}
            </div>
          </form>
        </Card>

        <Card className="p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-white dark:bg-slate-50 dark:text-slate-950">
              <KeyRound className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-950 dark:text-slate-50">Reset password</h2>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Use a strong password with at least 8 characters.
              </p>
            </div>
          </div>

          <form className="mt-6 grid gap-4 sm:grid-cols-3" onSubmit={handlePasswordSubmit}>
            <div>
              <Label htmlFor="current-password">Current password</Label>
              <Input
                id="current-password"
                type="password"
                className="mt-2"
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="new-password">New password</Label>
              <Input
                id="new-password"
                type="password"
                className="mt-2"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="confirm-password">Confirm password</Label>
              <Input
                id="confirm-password"
                type="password"
                className="mt-2"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
              />
            </div>
            <div className="flex flex-wrap items-center gap-3 sm:col-span-3">
              <Button type="submit" variant="secondary">
                Reset password
              </Button>
              {passwordMessage ? (
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300">{passwordMessage}</p>
              ) : null}
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
