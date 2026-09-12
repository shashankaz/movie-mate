import type { Metadata } from "next";
import { RoomForm } from "@/components/room-form";

const title = "Join a room";
const description =
  "Got a Movie Mate link? Enter your name and jump straight into the room — you'll be synced with the host instantly.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/join" },
  openGraph: { title, description, url: "/join" },
  twitter: { title, description },
};

export default function JoinPage() {
  return <RoomForm mode="join" />;
}
