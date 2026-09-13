"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Check, Copy, Mail, Share2, X } from "lucide-react";
import { site } from "@/lib/site";

interface Props {
  open: boolean;
  roomId: string;
  roomName: string;
  onClose: () => void;
}

const WhatsAppIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
    <path d="M17.5 14.4c-.3-.1-1.8-.9-2-1-.3-.1-.5-.1-.7.1-.2.3-.8 1-.9 1.2-.2.2-.3.2-.6.1-.3-.1-1.3-.5-2.4-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.6l.5-.6c.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5l-.9-2.2c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.1.2 2.1 3.2 5.1 4.5 2.5 1 3 .8 3.6.7.5-.1 1.8-.7 2-1.4.2-.7.2-1.3.2-1.4-.1-.2-.3-.2-.6-.3ZM12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.3c-1.5 0-3-.4-4.3-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.3 8.3 0 1 1 12 20.3Z" />
  </svg>
);

const TelegramIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
    <path d="M21.9 4.3 18.7 19.6c-.2 1.1-.9 1.3-1.8.8l-4.9-3.6-2.4 2.3c-.3.3-.5.5-1 .5l.4-5 9.1-8.2c.4-.4-.1-.5-.6-.2L6.2 13.3l-4.8-1.5c-1-.3-1.1-1 .2-1.5L20.5 3c.9-.3 1.6.2 1.4 1.3Z" />
  </svg>
);

const XIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
    <path d="M18.2 2h3.4l-7.4 8.5L23 22h-6.8l-5.3-7-6.1 7H1.4l7.9-9.1L1 2h7l4.8 6.4L18.2 2Zm-1.2 18h1.9L7.1 3.9H5.1L17 20Z" />
  </svg>
);

const noop = () => () => {};
const useOrigin = () =>
  useSyncExternalStore(
    noop,
    () => window.location.origin,
    () => "",
  );
const useCanShare = () =>
  useSyncExternalStore(
    noop,
    () => typeof navigator.share === "function",
    () => false,
  );

export function ShareDialog({ open, roomId, roomName, onClose }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const origin = useOrigin();
  const canShare = useCanShare();
  const [copied, setCopied] = useState(false);
  const link = origin ? `${origin}/room/${roomId}` : "";

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    else if (!open && el.open) el.close();
  }, [open]);

  const message = `Join me on ${site.name} — "${roomName}". Let's watch together:`;
  const encodedLink = encodeURIComponent(link);
  const encodedMessage = encodeURIComponent(message);

  const targets = [
    {
      label: "WhatsApp",
      href: `https://wa.me/?text=${encodeURIComponent(`${message} ${link}`)}`,
      icon: WhatsAppIcon,
      className: "bg-[#25D366]/15 text-[#25D366] hover:bg-[#25D366]/25",
    },
    {
      label: "Telegram",
      href: `https://t.me/share/url?url=${encodedLink}&text=${encodedMessage}`,
      icon: TelegramIcon,
      className: "bg-[#26A5E4]/15 text-[#26A5E4] hover:bg-[#26A5E4]/25",
    },
    {
      label: "X",
      href: `https://twitter.com/intent/tweet?text=${encodedMessage}&url=${encodedLink}`,
      icon: XIcon,
      className: "bg-zinc-100/10 text-zinc-100 hover:bg-zinc-100/20",
    },
    {
      label: "Email",
      href: `mailto:?subject=${encodeURIComponent(`Watch with me on ${site.name}`)}&body=${encodeURIComponent(`${message}\n\n${link}`)}`,
      icon: Mail,
      className: "bg-violet-500/15 text-violet-300 hover:bg-violet-500/25",
    },
  ];

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {}
  };

  const nativeShare = async () => {
    try {
      await navigator.share({ title: site.name, text: message, url: link });
    } catch {}
  };

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="m-auto w-[calc(100%-2rem)] max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-0 text-zinc-50 shadow-2xl shadow-black/60 backdrop:bg-black/70 backdrop:backdrop-blur-sm open:animate-dialog-in"
    >
      <div className="space-y-5 p-6">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-violet-500/10 text-violet-400 ring-1 ring-violet-500/20">
            <Share2 className="h-4.5 w-4.5" />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="text-base font-semibold">Your room is ready</h2>
            <p className="mt-0.5 text-sm text-zinc-400">
              Invite friends to <span className="text-zinc-200">{roomName}</span>. Anyone with the
              link can join.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="-mt-2 -mr-2 rounded-lg p-2 text-zinc-500 transition hover:bg-zinc-800 hover:text-zinc-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <input
            readOnly
            value={link}
            onFocus={(e) => e.currentTarget.select()}
            className="h-10 min-w-0 flex-1 truncate rounded-xl border border-zinc-700 bg-zinc-950 px-3 font-mono text-xs text-zinc-300 focus:border-violet-400 focus:ring-2 focus:ring-violet-500/25 focus:outline-none"
          />
          <button
            type="button"
            onClick={copyLink}
            className="flex h-10 shrink-0 items-center gap-1.5 rounded-xl bg-violet-600 px-3.5 text-sm font-medium text-white shadow-lg shadow-violet-600/25 transition hover:bg-violet-500"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>

        <div className="space-y-2.5">
          <p className="text-xs font-medium tracking-wide text-zinc-500 uppercase">Share via</p>
          <div className="grid grid-cols-4 gap-2">
            {targets.map(({ label, href, icon: Icon, className }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Share on ${label}`}
                title={label}
                className={`flex items-center justify-center rounded-xl py-3 transition ${className}`}
              >
                <Icon className="h-5 w-5" />
              </a>
            ))}
          </div>
          {canShare && (
            <button
              type="button"
              onClick={nativeShare}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-700 py-2.5 text-sm text-zinc-300 transition hover:bg-zinc-800"
            >
              <Share2 className="h-4 w-4" />
              More options
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full rounded-xl bg-zinc-800 py-2.5 text-sm font-medium text-zinc-200 transition hover:bg-zinc-700"
        >
          Done
        </button>
      </div>
    </dialog>
  );
}
