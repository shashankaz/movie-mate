"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { NameGate } from "@/components/name-gate";
import { RoomView } from "@/components/room-view";
import { api } from "@/lib/api";
import { session, useHydrated, useSavedName } from "@/lib/session";

type RoomInfo =
  { status: "loading" } | { status: "ok"; name: string } | { status: "error"; message: string };

export default function RoomPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const hydrated = useHydrated();
  const savedName = useSavedName();
  const [info, setInfo] = useState<RoomInfo>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    api
      .getRoom(roomId)
      .then((r) => !cancelled && setInfo({ status: "ok", name: r.name }))
      .catch((err: Error) => !cancelled && setInfo({ status: "error", message: err.message }));
    return () => {
      cancelled = true;
    };
  }, [roomId]);

  if (!hydrated || info.status === "loading") {
    return (
      <main className="flex flex-1 items-center justify-center text-sm text-slate-500">
        Loading…
      </main>
    );
  }

  if (info.status === "error") {
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-2 px-4 text-center">
        <p className="text-lg font-semibold text-blue-950">{info.message}</p>
        <p className="text-sm text-slate-500">Check the link or ask the host for a new one.</p>
        <Link href="/" className="mt-2 text-sm text-blue-700 underline-offset-4 hover:underline">
          Back to home
        </Link>
      </main>
    );
  }

  if (!savedName) {
    return <NameGate roomName={info.name} onSubmit={session.setName} />;
  }

  return <RoomView roomId={roomId} name={savedName} hostKey={session.getHostKey(roomId)} />;
}
