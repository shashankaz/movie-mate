import Link from "next/link";
import { Clapperboard } from "lucide-react";

interface Props {
  withText?: boolean;
}

export function Logo({ withText = true }: Props) {
  return (
    <Link href="/" className="flex items-center gap-2.5 text-blue-950" aria-label="Movie Mate home">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-700 text-white">
        <Clapperboard className="h-4 w-4" />
      </span>
      {withText && <span className="text-sm font-semibold tracking-tight">Movie Mate</span>}
    </Link>
  );
}
