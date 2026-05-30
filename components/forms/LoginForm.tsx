"use client";

import { type FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { UserDataResponse } from "@/generated/generated";
import { login } from "@/lib/auth-api";
import { useHydrated } from "@/lib/use-hydrated";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useAuthStore } from "@/store/auth-store";
import { useTenantStore } from "@/store/tenant-store";

function getDashboardPath(user: UserDataResponse): string {
  const roleNames = user.roles.map((role) => role.name.toLowerCase());

  if (roleNames.includes("super admin")) {
    return "/super-admin/dashboard";
  }

  if (roleNames.includes("admin")) {
    return "/admin/dashboard";
  }

  return "/customer/dashboard";
}

export function LoginForm() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const hydrated = useHydrated();
  const { identifier, loginMethod, setIdentifier, setLoginMethod, setSession } = useAuthStore();
  const tenantId = useTenantStore((state) => state.tenant.id);
  const isOtp = hydrated && loginMethod === "otp";
  const [password, setPassword] = useState("");

  const loginMutation = useMutation({
    mutationFn: () => login({ identifier, password }, { tenantId }),
    onSuccess: (data) => {
      setSession({ token: data.token, user: data.user });
      queryClient.setQueryData(["auth", "user", data.token, tenantId], data.user);
      router.push(getDashboardPath(data.user));
    },
  });

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isOtp) {
      router.push("/verify-otp");
      return;
    }

    loginMutation.mutate();
  }

  return (
    <Card className="p-6 shadow-xl shadow-slate-200/70">
      <form className="space-y-5" onSubmit={onSubmit}>
      <div>
        <Label htmlFor="identifier">
          Email or phone number
        </Label>
        <Input
          id="identifier"
          type="text"
          value={hydrated ? identifier : ""}
          onChange={(event) => setIdentifier(event.target.value)}
          placeholder="name@example.com or +880 1XXXXXXXXX"
          className="mt-2"
          suppressHydrationWarning
        />
      </div>

      {!isOtp ? (
      <div>
        <div className="flex items-center justify-between">
          <Label htmlFor="password">
            Password
          </Label>
          <Button type="button" variant="ghost" size="sm" className="h-auto px-0 py-0 text-xs">
            Forgot password?
          </Button>
        </div>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Enter your password"
          className="mt-2"
        />
      </div>
      ) : null}

      {loginMutation.isError ? (
        <p className="text-sm text-red-600">Login failed. Please check your credentials and try again.</p>
      ) : null}

      <Button className="w-full" disabled={loginMutation.isPending}>
        {isOtp ? "Send OTP" : loginMutation.isPending ? "Logging in..." : "Login"}
      </Button>

      <div className="flex items-center gap-3">
        <Separator className="flex-1" />
        <span className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">or</span>
        <Separator className="flex-1" />
      </div>

      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={() => setLoginMethod(isOtp ? "password" : "otp")}
      >
        {isOtp ? "Login with password" : "Login with phone OTP"}
      </Button>

      <p className="text-center text-xs leading-5 text-slate-500">
        {isOtp
          ? "OTP login is available for phone numbers only."
          : "Customers, hotel admins, and super admins can login with email/phone and password."}
      </p>
      </form>
    </Card>
  );
}
