"use client";

import { useEffect, useRef, useState } from "react";
import { SendHorizontal } from "lucide-react";
import { formatClock } from "@/lib/format";
import { chatTextSchema, validate } from "@/lib/schemas";
import type { ChatMessage } from "@/lib/types";

interface Props {
  messages: ChatMessage[];
  selfId: string | null;
  disabled?: boolean;
  onSend: (text: string) => Promise<{ ok: boolean; error?: string }>;
}

export function Chat({ messages, selfId, disabled, onSend }: Props) {
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const list = listRef.current;
    if (list) list.scrollTop = list.scrollHeight;
  }, [messages.length]);

  const submit = async () => {
    if (sending) return;

    const checked = validate(chatTextSchema, text);
    if (!checked.ok) {
      setError(checked.error);
      return;
    }

    setSending(true);
    setError(null);
    const res = await onSend(checked.data);
    setSending(false);
    if (res.ok) setText("");
    else setError(res.error ?? "Could not send message");
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
        {messages.length === 0 && (
          <p className="py-8 text-center text-sm text-zinc-500">No messages yet. Say hi 👋</p>
        )}
        {messages.map((m) =>
          m.kind === "system" ? (
            <p key={m.id} className="text-center text-xs text-zinc-600">
              {m.text}
            </p>
          ) : (
            <div key={m.id} className="text-sm">
              <div className="mb-0.5 flex items-baseline gap-2">
                <span
                  className={`font-medium ${m.senderId === selfId ? "text-violet-400" : "text-zinc-50"}`}
                >
                  {m.senderId === selfId ? "You" : m.senderName}
                </span>
                <span className="text-[11px] text-zinc-600">{formatClock(m.sentAt)}</span>
              </div>
              <p className="wrap-break-word text-zinc-200">{m.text}</p>
            </div>
          ),
        )}
      </div>

      {error && <p className="px-4 pb-1 text-xs text-red-400">{error}</p>}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          void submit();
        }}
        className="flex shrink-0 items-center gap-2 border-t border-zinc-800 p-3"
      >
        <input
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            setError(null);
          }}
          placeholder={disabled ? "Reconnecting…" : "Message"}
          disabled={disabled}
          maxLength={500}
          className="min-w-0 flex-1 rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-50 placeholder:text-zinc-500 focus:border-violet-400 focus:ring-2 focus:ring-violet-500/25 focus:outline-none disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={disabled || !text.trim() || sending}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-600 text-white transition hover:bg-violet-500 disabled:opacity-40"
          aria-label="Send"
        >
          <SendHorizontal className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
