"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, Check, CloudUpload, Copy, FileVideo, X } from "lucide-react";
import { api } from "@/lib/api";
import { detectVideoType, formatBytes, putFile, type UploadHandle } from "@/lib/upload";

type Config = { enabled: boolean; maxBytes: number; acceptedTypes: string[] };

type Stage =
  | { kind: "idle" }
  | { kind: "uploading"; fraction: number }
  | { kind: "done"; url: string }
  | { kind: "error"; message: string };

const PLAYABLE = new Set(["video/mp4", "video/webm", "video/x-m4v", "video/ogg"]);

export function UploadForm() {
  const [config, setConfig] = useState<Config | null>(null);
  const [configError, setConfigError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [stage, setStage] = useState<Stage>({ kind: "idle" });
  const [dragging, setDragging] = useState(false);
  const [copied, setCopied] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const handleRef = useRef<UploadHandle | null>(null);

  useEffect(() => {
    let cancelled = false;

    api
      .getUploadConfig()
      .then((c) => !cancelled && setConfig(c))
      .catch((err: Error) => !cancelled && setConfigError(err.message));

    return () => {
      cancelled = true;
    };
  }, []);

  const contentType = file ? detectVideoType(file) : null;
  const tooLarge = file !== null && config !== null && file.size > config.maxBytes;
  const notVideo = file !== null && contentType === null;
  const canUpload =
    file && contentType && !tooLarge && config?.enabled && stage.kind !== "uploading";

  const pick = (list: FileList | null) => {
    const next = list?.[0] ?? null;
    setFile(next);
    setStage({ kind: "idle" });
    setCopied(false);
  };

  const reset = () => {
    handleRef.current?.abort();
    handleRef.current = null;
    if (inputRef.current) inputRef.current.value = "";
    pick(null);
  };

  const upload = async () => {
    if (!file || !contentType) return;
    setStage({ kind: "uploading", fraction: 0 });

    try {
      const { uploadUrl, publicUrl } = await api.presignUpload({
        filename: file.name,
        contentType,
        size: file.size,
      });

      const handle = putFile(uploadUrl, file, contentType, (fraction) =>
        setStage({ kind: "uploading", fraction }),
      );

      handleRef.current = handle;

      await handle.done;
      setStage({ kind: "done", url: publicUrl });
    } catch (err) {
      setStage({ kind: "error", message: err instanceof Error ? err.message : "Upload failed" });
    } finally {
      handleRef.current = null;
    }
  };

  const copy = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {}
  };

  if (configError) {
    return <p className="text-sm text-red-400">Couldn&apos;t reach the server: {configError}</p>;
  }

  if (config && !config.enabled) {
    return (
      <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5 text-sm text-amber-100">
        <p className="font-medium">Uploads aren&apos;t enabled on this server.</p>
        <p className="mt-1 text-amber-300">
          Set the <code className="font-mono">R2_*</code> variables in{" "}
          <code className="font-mono">server/.env</code> and restart the server to turn this page
          on.
        </p>
      </div>
    );
  }

  if (stage.kind === "done") {
    return (
      <div className="space-y-5 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-600 text-white">
            <Check className="h-5 w-5" />
          </span>
          <div>
            <p className="text-sm font-semibold text-zinc-50">Upload complete</p>
            <p className="text-xs text-zinc-500">{file?.name}</p>
          </div>
        </div>

        <label className="block space-y-1.5">
          <span className="text-xs font-medium text-zinc-300">Video link</span>
          <div className="flex gap-2">
            <input
              readOnly
              value={stage.url}
              onFocus={(e) => e.currentTarget.select()}
              className="min-w-0 flex-1 rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2.5 font-mono text-xs text-zinc-50 focus:outline-none"
            />
            <button
              type="button"
              onClick={() => void copy(stage.url)}
              className="flex shrink-0 items-center gap-1.5 rounded-xl bg-violet-600 px-3 py-2.5 text-xs font-medium text-white transition hover:bg-violet-500"
            >
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
        </label>

        <p className="text-xs text-zinc-400">
          Paste this link into your room&apos;s video box. It may take a few seconds to become
          available.
        </p>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Link
            href="/create"
            className="flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-violet-600/25 transition hover:bg-violet-500"
          >
            Create a room
            <ArrowRight className="h-4 w-4" />
          </Link>
          <button
            type="button"
            onClick={reset}
            className="rounded-xl border border-zinc-700 px-4 py-2.5 text-sm font-medium text-zinc-200 transition hover:bg-zinc-800"
          >
            Upload another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <label
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          pick(e.dataTransfer.files);
        }}
        className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-6 py-12 text-center transition ${
          dragging
            ? "border-violet-400 bg-violet-500/10"
            : "border-zinc-700 bg-zinc-900/60 hover:bg-zinc-800"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="video/*,.mkv,.mov,.avi,.m4v"
          className="sr-only"
          onChange={(e) => pick(e.target.files)}
          disabled={stage.kind === "uploading"}
        />
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-violet-500/10 text-violet-400 ring-1 ring-violet-500/20">
          <CloudUpload className="h-5 w-5" />
        </span>
        <div>
          <p className="text-sm font-medium text-zinc-50">
            Drop a video here, or{" "}
            <span className="text-violet-400 underline underline-offset-4">browse</span>
          </p>
          <p className="mt-1 text-xs text-zinc-500">
            {config ? `Up to ${formatBytes(config.maxBytes)}` : "Checking limits…"} · MP4 or WebM
            play everywhere
          </p>
        </div>
      </label>

      {file && (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-500/10 text-violet-400">
              <FileVideo className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-zinc-50">{file.name}</p>
              <p className="text-xs text-zinc-500">
                {formatBytes(file.size)}
                {contentType && <span className="text-zinc-600"> · {contentType}</span>}
              </p>
            </div>
            <button
              type="button"
              onClick={reset}
              className="rounded-lg p-1.5 text-zinc-600 transition hover:bg-zinc-800 hover:text-zinc-200"
              aria-label="Remove file"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {notVideo && (
            <p className="mt-3 text-xs text-red-400">That doesn&apos;t look like a video file.</p>
          )}
          {tooLarge && config && (
            <p className="mt-3 text-xs text-red-400">
              Too large — the limit is {formatBytes(config.maxBytes)}.
            </p>
          )}
          {contentType && !PLAYABLE.has(contentType) && !notVideo && (
            <p className="mt-3 text-xs text-amber-300">
              Heads up: browsers can&apos;t play {contentType.replace("video/", "").toUpperCase()}{" "}
              natively. Convert to MP4 (H.264/AAC) or WebM for the best result.
            </p>
          )}

          {stage.kind === "uploading" && (
            <div className="mt-4">
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-800">
                <div
                  className="h-full rounded-full bg-violet-500 transition-[width] duration-200"
                  style={{ width: `${Math.round(stage.fraction * 100)}%` }}
                />
              </div>
              <p className="mt-1.5 text-xs text-zinc-500 tabular-nums">
                Uploading… {Math.round(stage.fraction * 100)}%
              </p>
            </div>
          )}

          {stage.kind === "error" && <p className="mt-3 text-xs text-red-400">{stage.message}</p>}

          <div className="mt-4 flex gap-2">
            {stage.kind === "uploading" ? (
              <button
                type="button"
                onClick={reset}
                className="rounded-xl border border-zinc-700 px-4 py-2.5 text-sm font-medium text-zinc-200 transition hover:bg-zinc-800"
              >
                Cancel
              </button>
            ) : (
              <button
                type="button"
                onClick={() => void upload()}
                disabled={!canUpload}
                className="flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-violet-600/25 transition hover:bg-violet-500 disabled:opacity-40"
              >
                <CloudUpload className="h-4 w-4" />
                {stage.kind === "error" ? "Try again" : "Upload"}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
