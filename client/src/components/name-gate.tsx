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
        className="w-full max-w-sm space-y-5 rounded-2xl border border-blue-200 bg-blue-50 p-6"
      >
        <div className="flex items-center gap-3">
          <Logo withText={false} />
          <div>
            <p className="text-xs text-slate-500">You&apos;re joining</p>
            <h1 className="text-sm font-semibold text-blue-950">{roomName ?? "a room"}</h1>
          </div>
        </div>

        <label className="block space-y-1.5">
          <span className="text-xs font-medium text-blue-800">Your name</span>
          <input
            autoFocus
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setError(null);
            }}
            maxLength={32}
            placeholder="e.g. Sam"
            className="w-full rounded-xl border border-blue-200 bg-white px-3 py-2.5 text-sm text-blue-950 placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
          />
        </label>

        {error && <p className="text-xs text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={!name.trim()}
          className="w-full rounded-xl bg-blue-700 py-2.5 text-sm font-medium text-white transition hover:bg-blue-800 disabled:opacity-40"
        >
          Join room
        </button>
      </form>
    </main>
  );
}
