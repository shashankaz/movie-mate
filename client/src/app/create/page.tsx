import type { Metadata } from "next";
import { RoomForm } from "@/components/room-form";

const title = "Create a room";
const description =
  "Start a watch party in one click. Create a room, share the link and control playback for everyone — no account needed.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/create" },
  openGraph: { title, description, url: "/create" },
  twitter: { title, description },
};

export default function CreatePage() {
  return <RoomForm mode="create" />;
}
