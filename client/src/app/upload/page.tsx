import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/logo";
import { UploadForm } from "@/components/upload-form";
import { site } from "@/lib/site";

const title = "Upload a video";
const description =
  "Upload your own video file and get a link you can paste straight into a Movie Mate room. Uploads go directly from your browser to storage.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/upload" },
  openGraph: { title: `${title} · ${site.name}`, description, url: "/upload" },
  twitter: { title: `${title} · ${site.name}`, description },
};

export default function UploadPage() {
  return (
    <main className="flex flex-1 flex-col px-4 py-6 sm:px-6">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between">
        <Logo />
        <nav className="flex items-center gap-2">
          <Link
            href="/join"
            className="rounded-lg px-3 py-2 text-sm text-zinc-400 transition hover:text-white"
          >
            Join a room
          </Link>
          <Link
            href="/create"
            className="rounded-lg bg-violet-600 px-3.5 py-2 text-sm font-medium text-white shadow-lg shadow-violet-600/25 transition hover:bg-violet-500"
          >
            Create a room
          </Link>
        </nav>
      </div>

      <div className="mx-auto w-full max-w-xl flex-1 py-12">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-50">{title}</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Your file goes straight from this browser to storage — it never passes through our
            server. You&apos;ll get a link to paste into any room.
          </p>
        </div>

        <UploadForm />
      </div>
    </main>
  );
}
