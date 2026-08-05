import { useState } from "react";
import { vw } from "@/lib/utils";
import CallingCard from "@/components/ui/reusable-ui/CallingCard";
import Image from "next/image";

export default function Contact() {
  const [flipped, setFlipped] = useState(false);

  return (
    <section
      className="flex flex-col"
      style={{ height: "100%", gap: vw(16) }}
    >
      <h1 className="font-league-gothic m-0" style={{ fontSize: vw(64) }}>
        CONTACT ME
      </h1>

      <div
        className="flex flex-col items-center justify-center"
        style={{ flex: "1 1 0", minHeight: 0 }}
      >
        <CallingCard
            onFlipChange={setFlipped}
            style={{ width: vw(580), height: vw(348) }}
            front={
              <div className="relative h-full w-full">
                <Image
                  src="/assets/contacts/Front Card 2.png"
                  alt="Contact card front"
                  fill
                  className="rounded-[inherit] object-cover"
                  sizes="(max-width: 768px) 90vw, 580px"
                />
              </div>
            }
            back={
              <div className="relative h-full w-full">
                <Image
                  src="/assets/contacts/Back Card 2.png"
                  alt="Contact card back"
                  fill
                  className="rounded-[inherit] object-cover"
                  sizes="(max-width: 768px) 90vw, 580px"
                />
              </div>
            }
          />

          {/* ── Action buttons ── */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: vw(12),
              marginTop: vw(24),
            }}
          >
            <a
              href="/assets/contacts/Quinto-BackCard.png"
              download
              aria-label="Download contact card"
              className="group/download border border-border hover:border-foreground/30 hover:bg-foreground/5 flex items-center justify-center transition-colors duration-300"
              style={{
                width: vw(74),
                height: vw(74),
                borderRadius: vw(8),
                background: "transparent",
              }}
            >
              <Image
                src="/assets/misc/download-icon.png"
                alt=""
                width={40}
                height={40}
                className="opacity-60 transition-opacity duration-300 group-hover/download:opacity-100"
                style={{ width: vw(40), height: vw(40) }}
              />
            </a>

            <button
              aria-label="View QR code"
              className="group/qr border border-border hover:border-foreground/30 hover:bg-foreground/5 flex items-center justify-center transition-colors duration-300"
              style={{
                width: vw(74),
                height: vw(74),
                borderRadius: vw(8),
                background: "transparent",
                cursor: "pointer",
              }}
            >
              <Image
                src="/assets/misc/qr-icon.png"
                alt=""
                width={24}
                height={24}
                className="opacity-60 transition-opacity duration-300 group-hover/qr:opacity-100"
                style={{ width: vw(40), height: vw(40) }}
              />
            </button>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            paddingTop: vw(24),
          }}
        >
          <span
            className="font-rajdhani text-muted-foreground"
            style={{ fontSize: vw(24) }}
          >
            {flipped ? "— Click to view front side —" : "— Click to view back side —"}
          </span>
        </div>
    </section>
  );
}
