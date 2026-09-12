import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Crown, Link2, MessageSquare, Play, Radio, Users, Video } from "lucide-react";
import { Logo } from "@/components/logo";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
  openGraph: { url: "/" },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      name: site.name,
      url: site.url,
      description: site.description,
    },
    {
      "@type": "WebApplication",
      name: site.name,
      url: site.url,
      description: site.description,
      applicationCategory: "EntertainmentApplication",
      operatingSystem: "Any",
      browserRequirements: "Requires a modern web browser",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      featureList: [
        "Synchronised video playback",
        "Host-controlled play, pause and seek",
        "Live chat",
        "Shareable room links",
      ],
    },
    {
      "@type": "HowTo",
      name: `How to watch together with ${site.name}`,
      step: [
        { "@type": "HowToStep", name: "Create a room", text: "One click. No account, no install." },
        {
          "@type": "HowToStep",
          name: "Share the link",
          text: "Send it to whoever you're watching with.",
        },
        {
          "@type": "HowToStep",
          name: "Paste a video",
          text: "YouTube, Vimeo or a direct .mp4 — then hit play.",
        },
      ],
    },
  ],
};

const features = [
  {
    icon: Radio,
    title: "Always in sync",
    body: "Everyone sees the same frame. Late joiners land exactly where the host is, and drift is corrected automatically.",
  },
  {
    icon: Crown,
    title: "Host stays in control",
    body: "Only the host can play, pause or seek. No more “wait, go back” — one remote for the whole room.",
  },
  {
    icon: MessageSquare,
    title: "Chat alongside",
    body: "React in real time without leaving the room. See who’s watching and who just joined.",
  },
];

const steps = [
  { n: "01", title: "Create a room", body: "One click. No account, no install." },
  { n: "02", title: "Share the link", body: "Send it to whoever you’re watching with." },
  { n: "03", title: "Paste a video", body: "YouTube, Vimeo or a direct .mp4 — then hit play." },
];

const chatPreview = [
  { name: "Maya", text: "ok everyone ready?" },
  { name: "Dev", text: "yes!! 🍿" },
  { name: "Sam", text: "pressing play" },
];

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5">
        <Logo />
        <nav className="flex items-center gap-2">
          <Link
            href="/about"
            className="rounded-lg px-3 py-2 text-sm text-blue-700 transition hover:text-blue-950"
          >
            About
          </Link>
          <Link
            href="/upload"
            className="rounded-lg px-3 py-2 text-sm text-blue-700 transition hover:text-blue-950"
          >
            Upload
          </Link>
          <Link
            href="/join"
            className="rounded-lg px-3 py-2 text-sm text-blue-700 transition hover:text-blue-950"
          >
            Join a room
          </Link>
          <Link
            href="/create"
            className="rounded-lg bg-blue-700 px-3.5 py-2 text-sm font-medium text-white transition hover:bg-blue-800"
          >
            Create a room
          </Link>
        </nav>
      </header>

      <main className="flex-1">
        <section className="relative overflow-hidden">
          <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-128 bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.18),transparent_60%)]" />

          <div className="mx-auto grid w-full max-w-6xl items-center gap-14 px-6 pt-16 pb-20 lg:grid-cols-2 lg:pt-24">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs text-blue-800">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                Free · No sign-up
              </span>

              <h1 className="mt-6 text-4xl font-semibold tracking-tight text-blue-950 sm:text-5xl lg:text-6xl">
                Watch together,
                <br />
                <span className="text-blue-600">perfectly in sync.</span>
              </h1>

              <p className="mt-6 max-w-md text-base leading-relaxed text-slate-600 sm:text-lg">
                Create a room, share the link, paste a video. Everyone watches the same moment while
                the host holds the remote.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/create"
                  className="flex items-center justify-center gap-2 rounded-xl bg-blue-700 px-5 py-3 text-sm font-medium text-white transition hover:bg-blue-800"
                >
                  Create a room
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/join"
                  className="flex items-center justify-center gap-2 rounded-xl border border-blue-200 px-5 py-3 text-sm font-medium text-blue-900 transition hover:bg-blue-50"
                >
                  <Link2 className="h-4 w-4" />
                  Join with a link
                </Link>
              </div>
            </div>

            <div className="relative">
              <div className="overflow-hidden rounded-2xl border border-blue-200 bg-white shadow-2xl shadow-blue-900/10">
                <div className="flex items-center gap-2 border-b border-blue-100 px-4 py-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-700 text-white">
                    <Video className="h-3 w-3" />
                  </span>
                  <span className="text-xs font-medium text-blue-950">Friday movie night</span>
                  <span className="ml-auto flex items-center gap-1.5 rounded-full border border-blue-200 px-2 py-0.5 text-[11px] text-blue-700">
                    <Users className="h-3 w-3" />3
                  </span>
                </div>

                <div className="grid sm:grid-cols-[1fr_9rem]">
                  <div className="relative aspect-video bg-[linear-gradient(135deg,#1e3a8a,#172554)]">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-blue-900">
                        <Play className="ml-0.5 h-5 w-5" fill="currentColor" />
                      </span>
                    </div>
                    <div className="absolute inset-x-0 bottom-0 px-4 pb-3">
                      <div className="h-1 w-full rounded-full bg-white/20">
                        <div className="h-1 w-2/5 rounded-full bg-blue-300" />
                      </div>
                      <div className="mt-1.5 flex justify-between text-[10px] text-blue-200 tabular-nums">
                        <span>41:12</span>
                        <span>1:43:00</span>
                      </div>
                    </div>
                  </div>

                  <div className="hidden flex-col gap-2 border-l border-blue-100 bg-blue-50 p-3 sm:flex">
                    {chatPreview.map((m) => (
                      <div key={m.name} className="text-[11px]">
                        <p className="font-medium text-blue-900">{m.name}</p>
                        <p className="text-slate-500">{m.text}</p>
                      </div>
                    ))}
                    <div className="mt-auto h-6 rounded-md border border-blue-200 bg-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-6 py-16">
          <div className="grid gap-4 md:grid-cols-3">
            {features.map(({ icon: Icon, title, body }) => (
              <div key={title} className="rounded-2xl border border-blue-200 bg-blue-50 p-6">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-blue-700 ring-1 ring-blue-200">
                  <Icon className="h-4 w-4" />
                </span>
                <h2 className="mt-4 text-sm font-semibold text-blue-950">{title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-6 py-16">
          <div className="mb-10 max-w-md">
            <h2 className="text-2xl font-semibold tracking-tight text-blue-950">How it works</h2>
            <p className="mt-2 text-sm text-slate-600">Three steps, under a minute.</p>
          </div>
          <ol className="grid gap-8 md:grid-cols-3">
            {steps.map((s) => (
              <li key={s.n} className="border-t border-blue-200 pt-5">
                <span className="font-mono text-xs text-blue-500">{s.n}</span>
                <h3 className="mt-2 text-sm font-semibold text-blue-950">{s.title}</h3>
                <p className="mt-1 text-sm text-slate-600">{s.body}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="mx-auto w-full max-w-6xl px-6 pt-8 pb-24">
          <div className="flex flex-col items-start gap-6 rounded-2xl bg-blue-800 p-8 text-white sm:flex-row sm:items-center sm:justify-between sm:p-10">
            <div>
              <h2 className="text-xl font-semibold tracking-tight">Ready for movie night?</h2>
              <p className="mt-1 text-sm text-blue-200">
                Your room is one click away. No account needed.
              </p>
            </div>
            <Link
              href="/create"
              className="flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-medium text-blue-900 transition hover:bg-blue-50"
            >
              Create a room
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-blue-100">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-3 px-6 py-6 text-xs text-slate-500 sm:flex-row">
          <Logo withText={false} />
          <p>Movie Mate · Watch together, perfectly in sync.</p>
          <Link href="/about" className="text-blue-700 underline-offset-4 hover:underline">
            About
          </Link>
        </div>
      </footer>
    </div>
  );
}
