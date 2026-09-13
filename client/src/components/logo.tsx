import Link from "next/link";
import { Clapperboard } from "lucide-react";

interface Props {
  withText?: boolean;
}

export function Logo({ withText = true }: Props) {
  return (
    <Link href="/" className="flex items-center gap-2.5 text-zinc-50" aria-label="Movie Mate home">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br from-violet-500 to-fuchsia-600 text-white shadow-lg shadow-violet-500/30">
        <Clapperboard className="h-4 w-4" />
      </span>
      {withText && <span className="text-sm font-semibold tracking-tight">Movie Mate</span>}
    </Link>
  );
}
