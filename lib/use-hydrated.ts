"use client";

import { useSyncExternalStore } from "react";

function subscribe() {
  return () => undefined;
}

function getSnapshot() {
  return true;
}

function getServerSnapshot() {
  return false;
}

/** True only after the client has mounted (safe for persisted store / theme UI). */
export function useHydrated() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
