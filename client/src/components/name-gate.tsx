"use client";

import { useState } from "react";
import { Logo } from "@/components/logo";
import { nameSchema, validate } from "@/lib/schemas";

interface Props {
  roomName: string | null;
  onSubmit: (name: string) => void;
}

export function NameGate({ roomName, onSubmit }: Props) {
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const submit = () => {
    const checked = validate(nameSchema, name);
    if (!checked.ok) {
      setError(checked.error);
      return;
    }
    onSubmit(checked.data);
  };

  return (
    <main className="flex flex-1 items-center justify-center px-4">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
        className="w-full max-w-sm space-y-5 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6"
      >
        <div className="flex items-center gap-3">
          <Logo withText={false} />
          <div>
            <p className="text-xs text-zinc-500">You&apos;re joining</p>
            <h1 className="text-sm font-semibold text-zinc-50">{roomName ?? "a room"}</h1>
          </div>
        </div>

        <label className="block space-y-1.5">
          <span className="text-xs font-medium text-zinc-300">Your name</span>
          <input
            autoFocus
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setError(null);
            }}
            maxLength={32}
            placeholder="e.g. Sam"
            className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-sm text-zinc-50 placeholder:text-zinc-500 focus:border-violet-400 focus:ring-2 focus:ring-violet-500/25 focus:outline-none"
          />
        </label>

        {error && <p className="text-xs text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={!name.trim()}
          className="w-full rounded-xl bg-violet-600 py-2.5 text-sm font-medium text-white shadow-lg shadow-violet-600/25 transition hover:bg-violet-500 disabled:opacity-40"
        >
          Join room
        </button>
      </form>
    </main>
  );
}
