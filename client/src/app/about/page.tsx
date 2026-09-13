import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Logo } from "@/components/logo";
import { site } from "@/lib/site";

const title = "About";
const description = `${site.name} is a free, no-sign-up way to watch videos together in perfect sync — host-controlled playback, live chat and shareable room links.`;

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/about" },
  openGraph: { title: `${title} · ${site.name}`, description, url: "/about" },
  twitter: { title: `${title} · ${site.name}`, description },
};

const facts = [
  { label: "Cost", value: "Free" },
  { label: "Account", value: "None needed" },
  { label: "Sources", value: "YouTube, Vimeo, .mp4, HLS" },
  { label: "Room size", value: "Unlimited" },
];

export default function AboutPage() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5">
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
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-16">
        <p className="text-xs font-medium tracking-wide text-violet-400 uppercase">About</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-50 sm:text-4xl">
          Movie night, without the “are you at 41:12 yet?”
        </h1>

        <div className="mt-8 space-y-5 text-base leading-relaxed text-zinc-400">
          <p>
            {site.name} started from a simple frustration: watching something with friends who
            aren&apos;t in the room usually means counting down on a call and hoping everyone hits
            play at the same time. It never quite works.
          </p>
          <p>
            So we built a room where the host holds the remote. Play, pause or skip ahead and every
            viewer follows instantly. If someone joins late, they land at the exact moment the host
            is watching. If a connection stutters, the player quietly catches back up.
          </p>
          <p>
            There&apos;s a chat on the side so you can react as it happens, and nothing to install
            or sign up for — a room is just a link.
          </p>
        </div>

        <dl className="mt-12 grid gap-4 sm:grid-cols-2">
          {facts.map((f) => (
            <div key={f.label} className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
              <dt className="text-xs font-medium text-zinc-500">{f.label}</dt>
              <dd className="mt-1 text-sm font-semibold text-zinc-50">{f.value}</dd>
            </div>
          ))}
        </dl>

        <section className="mt-12">
          <h2 className="text-lg font-semibold tracking-tight text-zinc-50">How sync works</h2>
          <p className="mt-3 text-sm leading-relaxed text-zinc-400">
            The host&apos;s player reports its position to the server whenever it plays, pauses or
            seeks, and every couple of seconds while playing. Each viewer compares that against its
            own player and nudges itself back into place if it drifts more than a second. No special
            clocks, no accounts — just a shared room state everyone follows.
          </p>
        </section>

        <div className="mt-12 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/create"
            className="flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-medium text-white shadow-lg shadow-violet-600/25 transition hover:bg-violet-500"
          >
            Create a room
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/"
            className="flex items-center justify-center rounded-xl border border-zinc-700 px-5 py-3 text-sm font-medium text-zinc-200 transition hover:bg-zinc-800"
          >
            Back to home
          </Link>
        </div>
      </main>

      <footer className="border-t border-zinc-800">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-3 px-6 py-6 text-xs text-zinc-500 sm:flex-row">
          <Logo withText={false} />
          <p>Movie Mate · Watch together, perfectly in sync.</p>
        </div>
      </footer>
    </div>
  );
}
