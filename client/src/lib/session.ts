"use client";

import { useSyncExternalStore } from "react";

const NAME_KEY = "mm:name";
const hostKeyFor = (roomId: string) => `mm:host:${roomId}`;
const CHANGE_EVENT = "mm:session-change";

const read = (key: string): string | null => {
  try {
    return window.sessionStorage.getItem(key);
  } catch {
    return null;
  }
};

const write = (key: string, value: string): void => {
  try {
    window.sessionStorage.setItem(key, value);
    window.dispatchEvent(new Event(CHANGE_EVENT));
  } catch {}
};

export const session = {
  getName: () => read(NAME_KEY),
  setName: (name: string) => write(NAME_KEY, name),
  getHostKey: (roomId: string) => read(hostKeyFor(roomId)),
  setHostKey: (roomId: string, key: string) => write(hostKeyFor(roomId), key),
};

const subscribe = (cb: () => void) => {
  window.addEventListener(CHANGE_EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(CHANGE_EVENT, cb);
    window.removeEventListener("storage", cb);
  };
};

export const useSavedName = (): string | null =>
  useSyncExternalStore(subscribe, session.getName, () => null);

export const useHydrated = (): boolean =>
  useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
