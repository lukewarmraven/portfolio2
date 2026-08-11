import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { vw } from "@/lib/utils";
import CallingCard from "@/components/ui/reusable-ui/CallingCard";
import Image from "next/image";
import { CONTACT_INFO, CONTACT_ASSETS, UI_STRINGS } from "@/lib/content";

export default function Contact() {
  const [flipped, setFlipped] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const [cardRect, setCardRect] = useState<DOMRect | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const copiedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const copyToClipboard = useCallback(async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      if (copiedTimer.current) clearTimeout(copiedTimer.current);
      setCopied(label);
      copiedTimer.current = setTimeout(() => setCopied(null), 1500);
    } catch {
      // clipboard unavailable — silently ignore
    }
  }, []);

  useEffect(() => {
    if (showQR && cardRef.current) {
      setCardRect(cardRef.current.getBoundingClientRect());
    } else {
      setCardRect(null);
    }
  }, [showQR]);

  const closeQR = useCallback(() => setShowQR(false), []);

  return (
    <section className="flex flex-col" style={{ height: "100%", gap: vw(16) }}>
      <h1 className="font-league-gothic m-0" style={{ fontSize: vw(64) }}>CONTACT ME</h1>

      <div className="flex flex-col items-center justify-center" style={{ flex: "1 1 0", minHeight: 0 }}>
        <div ref={cardRef} style={{ position: "relative" }}>
          <CallingCard
            onFlipChange={setFlipped}
            previewEnabled
            previewFrontSrc={CONTACT_ASSETS.frontCard}
            previewBackSrc={CONTACT_ASSETS.backCard}
            style={{ width: vw(580), height: vw(348) }}
            front={
              <div className="relative h-full w-full">
                <Image src={CONTACT_ASSETS.frontCard} alt="Contact card front" fill className="rounded-[inherit] object-cover" sizes="(max-width: 768px) 90vw, 580px" />
              </div>
            }
            back={
              <div className="relative h-full w-full">
                <Image src={CONTACT_ASSETS.backCard} alt="Contact card back" fill className="rounded-[inherit] object-cover" sizes="(max-width: 768px) 90vw, 580px" />
              </div>
            }
          />
        </div>

        {/* Action buttons */}
        <div style={{ display: "flex", justifyContent: "center", gap: vw(12), marginTop: vw(24), visibility: flipped ? "visible" : "hidden" }}>
          <a href={CONTACT_ASSETS.backCard} download aria-label="Download contact card"
            className="group/download border border-border hover:border-foreground/30 hover:bg-foreground/5 flex items-center justify-center transition-colors duration-300"
            style={{ width: vw(74), height: vw(74), borderRadius: vw(8), background: "transparent" }}>
            <Image src={CONTACT_ASSETS.downloadIcon} alt="" width={40} height={40} className="opacity-60 transition-opacity duration-300 group-hover/download:opacity-100" style={{ width: vw(40), height: vw(40) }} />
          </a>
          <button onClick={() => setShowQR((v) => !v)} aria-label="View QR code"
            className="group/qr border border-border hover:border-foreground/30 hover:bg-foreground/5 flex items-center justify-center transition-colors duration-300"
            style={{ width: vw(74), height: vw(74), borderRadius: vw(8), background: "transparent", cursor: "pointer" }}>
            <Image src={CONTACT_ASSETS.qrIcon} alt="" width={24} height={24} className="opacity-60 transition-opacity duration-300 group-hover/qr:opacity-100" style={{ width: vw(40), height: vw(40) }} />
          </button>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "center", paddingTop: vw(24) }}>
        <span className="font-rajdhani text-muted-foreground" style={{ fontSize: vw(32) }}>
          {flipped ? "— Click to view front side —" : "— Click to view back side —"}
        </span>
      </div>

      {/* QR + contact overlay */}
      {showQR && cardRect && createPortal(
        <div onClick={closeQR} style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.45)", cursor: "pointer" }}>
          <div onClick={(e) => e.stopPropagation()}
            style={{ position: "fixed", left: cardRect.left + cardRect.width / 2, top: cardRect.top + cardRect.height / 2,
              transform: "translate(-50%, -50%)", display: "flex", alignItems: "center", gap: vw(48),
              background: "white", borderRadius: vw(16), padding: vw(32),
              boxShadow: "0 8px 48px rgba(0,0,0,0.35), 0 16px 64px rgba(0,0,0,0.2)", cursor: "default" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: vw(16) }}>
              {CONTACT_INFO.map(({ icon, value, copyValue, label }) => (
                <button key={label} onClick={() => copyToClipboard(copyValue, label)}
                  className="font-rajdhani hover:opacity-70 transition-opacity duration-200"
                  style={{ display: "flex", alignItems: "center", gap: vw(10), background: "none", border: "none",
                    cursor: "pointer", padding: 0, fontSize: vw(32), color: "#1a1a1a", textAlign: "left" as const }}
                  title={`Copy ${label}`}>
                  <span style={{ fontWeight: 700 }}>{icon}</span>
                  <span style={{ display: "grid", overflow: "hidden", width: vw(420) }}>
                    <span style={{ gridArea: "1 / 1", transform: copied === label ? "translateY(100%)" : "translateY(0)",
                      opacity: copied === label ? 0 : 1, transition: "transform 0.3s ease, opacity 0.3s ease" }}>{value}</span>
                    <span style={{ gridArea: "1 / 1", transform: copied === label ? "translateY(0)" : "translateY(-100%)",
                      opacity: copied === label ? 1 : 0, transition: "transform 0.5s ease, opacity 0.5s ease" }}>{UI_STRINGS.copied}</span>
                  </span>
                </button>
              ))}
            </div>
            <Image src={CONTACT_ASSETS.qrCode} alt="Portfolio QR code" width={200} height={200}
              style={{ width: vw(200), height: vw(200), borderRadius: vw(8) }} />
          </div>
        </div>, document.body)}
    </section>
  );
}
