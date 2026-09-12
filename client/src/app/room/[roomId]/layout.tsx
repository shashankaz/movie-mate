import type { Metadata } from "next";
import { roomInfoResponseSchema } from "@/lib/schemas";
import { site } from "@/lib/site";
import { SERVER_URL } from "@/lib/socket";

const fetchRoomName = async (roomId: string): Promise<string | null> => {
  try {
    const res = await fetch(`${SERVER_URL}/api/rooms/${encodeURIComponent(roomId)}`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    const parsed = roomInfoResponseSchema.safeParse(await res.json());
    return parsed.success ? parsed.data.name : null;
  } catch {
    return null;
  }
};

interface Props {
  children: React.ReactNode;
  params: Promise<{ roomId: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { roomId } = await params;
  const roomName = await fetchRoomName(roomId);

  const title = roomName ?? "Watch room";
  const description = roomName
    ? `You're invited to "${roomName}" on ${site.name}. Enter your name to watch together in sync.`
    : `Join this ${site.name} room to watch together in perfect sync.`;

  return {
    title,
    description,
    robots: { index: false, follow: false },
    alternates: { canonical: `/room/${roomId}` },
    openGraph: { title: `${title} · ${site.name}`, description, url: `/room/${roomId}` },
    twitter: { title: `${title} · ${site.name}`, description },
  };
}

export default function RoomLayout({ children }: Props) {
  return children;
}
