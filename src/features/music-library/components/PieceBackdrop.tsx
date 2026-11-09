import { useState } from "react";
import bg002 from "@/assets/image/bg002.webp";
import bg003 from "@/assets/image/bg003.webp";

const BACKGROUNDS = [bg002, bg003];

function pickBackground() {
  return BACKGROUNDS[Math.floor(Math.random() * BACKGROUNDS.length)];
}

export function PieceBackdrop() {
  const [src] = useState(pickBackground);

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
      <div className="sticky top-0 h-dvh w-full overflow-hidden">
        <img src={src} alt="" className="size-full object-cover object-[85%_50%] lg:object-center" />
        <div className="absolute inset-0 bg-white/50" />
      </div>
    </div>
  );
}
