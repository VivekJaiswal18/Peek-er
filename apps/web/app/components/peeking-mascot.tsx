"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

const KEY_SOURCE = "/mascot/peek-source.png";

function drawKeyedImage(
  canvas: HTMLCanvasElement,
  image: HTMLImageElement,
  crop: { x: number; y: number; width: number; height: number },
  output: { width: number; height: number },
) {
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) return;

  canvas.width = output.width;
  canvas.height = output.height;
  context.drawImage(
    image,
    crop.x,
    crop.y,
    crop.width,
    crop.height,
    0,
    0,
    output.width,
    output.height,
  );

  const frame = context.getImageData(0, 0, output.width, output.height);
  for (let index = 0; index < frame.data.length; index += 4) {
    const red = frame.data[index] ?? 0;
    const green = frame.data[index + 1] ?? 0;
    const blue = frame.data[index + 2] ?? 0;
    const dominance = green - Math.max(red, blue);

    if (green > 125 && dominance > 24) {
      const edgeAlpha = Math.max(0, Math.min(1, (62 - dominance) / 38));
      frame.data[index + 3] = Math.round(255 * edgeAlpha);
      frame.data[index + 1] = Math.min(green, Math.max(red, blue) + 8);
    }
  }
  context.putImageData(frame, 0, 0);
}

export function PeekingMascot() {
  const pathname = usePathname();
  const isLandingPage = pathname === "/";
  const fullCanvas = useRef<HTMLCanvasElement>(null);
  const hidingRef = useRef(false);
  const [ready, setReady] = useState(false);
  const [hiding, setHiding] = useState(false);

  useEffect(() => {
    const image = new Image();
    image.src = KEY_SOURCE;
    image.onload = () => {
      if (fullCanvas.current) {
        drawKeyedImage(
          fullCanvas.current,
          image,
          { x: 180, y: 18, width: 920, height: 1240 },
          { width: 460, height: 620 },
        );
      }
      setReady(true);
    };
  }, []);

  useEffect(() => {
    const onPointerMove = (event: PointerEvent) => {
      const centerY = window.innerHeight * (isLandingPage ? 0.58 : 0.725);
      const horizontalDistance = window.innerWidth - event.clientX;
      const verticalDistance = Math.abs(event.clientY - centerY);
      const shouldHide = hidingRef.current
        ? horizontalDistance < 190 && verticalDistance < 185
        : horizontalDistance < 140 && verticalDistance < 145;

      if (shouldHide !== hidingRef.current) {
        hidingRef.current = shouldHide;
        setHiding(shouldHide);
      }
    };
    const onPointerLeave = () => {
      hidingRef.current = false;
      setHiding(false);
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onPointerLeave);
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      document.documentElement.removeEventListener("pointerleave", onPointerLeave);
    };
  }, [isLandingPage]);

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none fixed right-0 z-50 hidden -translate-y-1/2 select-none md:block ${ready ? "opacity-100" : "opacity-0"}`}
      style={{
        top: isLandingPage ? "58%" : "82.5%",
        transition: "opacity 500ms ease",
      }}
    >
      <span className={`absolute right-0 top-1/2 z-40 w-[3px] -translate-y-1/2 rounded-full bg-[#ff5a1f] shadow-[0_0_8px_rgba(255,90,31,.3)] ${isLandingPage ? "h-[clamp(130px,22vh,190px)]" : "h-[clamp(92px,15.5vh,136px)]"}`} />
      <canvas
        className={`relative z-20 h-auto drop-shadow-[0_12px_18px_rgba(0,0,0,.17)] transition-transform motion-reduce:transition-none ${isLandingPage ? "w-[clamp(102px,7.5vw,142px)]" : "w-[clamp(73px,5.3vw,102px)]"} ${hiding ? "translate-x-[80%] rotate-[6deg] scale-[.99] duration-[260ms]" : "translate-x-[35%] rotate-0 scale-100 duration-[420ms]"}`}
        ref={fullCanvas}
        style={{
          transformOrigin: "65% 70%",
          transitionTimingFunction: "cubic-bezier(0,.75,.25,1)",
        }}
      />
    </div>
  );
}
