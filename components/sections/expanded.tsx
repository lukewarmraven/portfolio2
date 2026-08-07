"use client";

import {
  type ReactNode,
  useState,
  useRef,
  useEffect,
  useCallback,
} from "react";
import { createPortal } from "react-dom";
import { vw } from "@/lib/utils";
import ImageCarousel from "@/components/ui/reusable-ui/ImageCarousel";

const DEMO_IMAGES = [
  "/assets/projects/resbac/web0.png",
  "/assets/projects/resbac/web1.png",
  "/assets/projects/resbac/web2.png",
  "/assets/projects/resbac/web3.png",
  "/assets/projects/resbac/mob0.jpg",
  "/assets/projects/resbac/mob1.jpg",
];

export interface ExpandedProps {
  title: string;
  body: string;
  onBack?: () => void;
  children?: ReactNode;
  className?: string;
}

/*  Shared DNA with CallingCard                                     */

const FLIP_MS = 400;
const EASE = "cubic-bezier(0.16, 1, 0.3, 1)";

/*  Component                                                        */

export default function Expanded({
  title,
  body,
  onBack,
  children,
  className,
}: ExpandedProps) {
  const images = DEMO_IMAGES;

  /* ── Modal state ── */
  const [modalIndex, setModalIndex] = useState<number | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [imgVisible, setImgVisible] = useState(true);
  const flipLockRef = useRef(false);
  const swipeRef = useRef<{ x: number; y: number } | null>(null);

  /* ── Open: flip tile → portal modal ── */
  const openModal = useCallback(
    (index: number, _el: HTMLElement) => {
      if (flipLockRef.current) return;
      flipLockRef.current = true;

      setModalIndex(index);
      setModalOpen(false);
      setImgVisible(true);

      // Let the tile flip start, then fade the modal in right behind it
      requestAnimationFrame(() => {
        // Modal backdrop + chrome fades in while the tile is mid-flip
        setTimeout(() => setModalOpen(true), 80);
        setTimeout(() => {
          flipLockRef.current = false;
        }, FLIP_MS);
      });
    },
    [],
  );

  /* ── Close: fade modal → flip tile back ── */
  const closeModal = useCallback(() => {
    if (flipLockRef.current) return;
    flipLockRef.current = true;

    setModalOpen(false);

    // Wait for the modal fade-out, then flip the tile back into view
    setTimeout(() => {
      setModalIndex(null);
      setTimeout(() => {
        flipLockRef.current = false;
      }, FLIP_MS);
    }, 250);
  }, []);

  /* ── Navigate within modal (crossfade image) ── */
  const goTo = useCallback(
    (next: number) => {
      if (modalIndex === null || next === modalIndex) return;
      if (next < 0 || next >= images.length) return;
      setImgVisible(false);
      setTimeout(() => {
        setModalIndex(next);
        setImgVisible(true);
      }, 150);
    },
    [modalIndex, images.length],
  );

  const navigate = useCallback(
    (dir: -1 | 1) => {
      if (modalIndex === null) return;
      goTo(modalIndex + dir);
    },
    [modalIndex, goTo],
  );

  /* ── Keyboard ── */
  useEffect(() => {
    if (modalIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
      else if (e.key === "ArrowLeft") navigate(-1);
      else if (e.key === "ArrowRight") navigate(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [modalIndex, closeModal, navigate]);

  /* ── Lock body scroll while modal is up ── */
  useEffect(() => {
    if (modalIndex === null) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [modalIndex]);

  const isModalUp = modalIndex !== null;

  return (
    <section
      className={`flex flex-col ${className ?? ""}`}
      style={{ height: "100%", gap: vw(32) }}
    >
      {/* ── Title ── */}
      <h1
        className="text-center font-rajdhani m-0 uppercase"
        style={{
          fontSize: vw(32),
          fontWeight: "bold",
        }}
      >
        {title}
      </h1>

      {/* ── Scrollable content ── */}
      <div
        className="no-scrollbar"
        style={{
          overflowY: "auto",
          flex: "1 1 0",
          minHeight: 0,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: vw(32),
          }}
        >
          {/* Text body */}
          <div
            className="no-scrollbar"
            style={{ overflowY: "auto", maxHeight: vw(210) }}
          >
            <p
              className="font-rajdhani m-0 text-justify"
              style={{ fontSize: vw(32) }}
            >
              {body}
            </p>
          </div>

          {/* Image gallery — activeIndex drives the flip on the selected tile */}
          {children ?? (
            <ImageCarousel
              images={images}
              onImageClick={openModal}
              activeIndex={modalIndex}
            />
          )}

          {onBack && (
            <button
              onClick={onBack}
              className="font-rajdhani text-muted-foreground text-center"
              style={{ fontSize: vw(32) }}
            >
              ← Back
            </button>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          CARD-FLIP MODAL  —  portalled to <body> (same DNA as
          CallingCard: perspective + rotateY + backface-visibility)
          ══════════════════════════════════════════════════════════════ */}
      {isModalUp &&
        createPortal(
          <div
            onClick={closeModal}
            onPointerDown={(e) => {
              swipeRef.current = { x: e.clientX, y: e.clientY };
            }}
            onPointerUp={(e) => {
              if (!swipeRef.current) return;
              const dx = e.clientX - swipeRef.current.x;
              const dy = e.clientY - swipeRef.current.y;
              if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50) {
                e.stopPropagation();
                navigate(dx > 0 ? -1 : 1);
              }
              swipeRef.current = null;
            }}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 9999,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            {/* ── Gradient-vignette backdrop (clear centre → tinted edges) ── */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "radial-gradient(ellipse at center, transparent 35%, rgba(250, 248, 243, 0.78) 100%)",
                backdropFilter: "blur(28px)",
                WebkitBackdropFilter: "blur(28px)",
                opacity: modalOpen ? 1 : 0,
                transition: `opacity 300ms ${EASE}`,
              }}
            />

            {/* ── Image card (glass plate) ── */}
            <div
              style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                maxWidth: "92vw",
                maxHeight: "88vh",
                opacity: modalOpen ? 1 : 0,
                transform: modalOpen
                  ? "scale(1) translateY(0)"
                  : "scale(0.92) translateY(12px)",
                transition: `opacity 300ms ${EASE}, transform 350ms ${EASE}`,
              }}
            >
              <img
                key={modalIndex}
                src={images[modalIndex]}
                alt=""
                draggable={false}
                onClick={(e) => e.stopPropagation()}
                style={{
                  display: "block",
                  maxWidth: "100%",
                  maxHeight: "88vh",
                  objectFit: "contain",
                  borderRadius: vw(12),
                  boxShadow:
                    "0 0 0 1px rgba(0,0,0,0.06), 0 4px 24px rgba(0,0,0,0.1), 0 12px 48px rgba(0,0,0,0.06)",
                  opacity: imgVisible ? 1 : 0,
                  transition: `opacity 0.15s ease`,
                }}
              />
            </div>

            {/* ── Chrome ── */}

            {/* Close button */}
            <Button
              onClick={closeModal}
              style={{
                position: "fixed",
                top: vw(16),
                right: vw(16),
                width: vw(60),
                height: vw(60),
                fontSize: vw(40),
                opacity: modalOpen ? 1 : 0,
                transition: `opacity 300ms ${EASE}`,
              }}
              label="Close"
            >
              ✕
            </Button>

            {/* Counter */}
            <div
              className="font-rajdhani"
              style={{
                position: "fixed",
                top: vw(20),
                left: "50%",
                transform: "translateX(-50%)",
                color: "var(--color-muted-foreground, rgba(0,0,0,0.45))",
                fontSize: vw(32),
                fontWeight: 500,
                letterSpacing: "0.04em",
                opacity: modalOpen ? 1 : 0,
                transition: `opacity 300ms ${EASE}`,
              }}
            >
              {modalIndex + 1}&nbsp;/&nbsp;{images.length}
            </div>

            {/* Previous arrow */}
            {modalIndex > 0 && (
              <NavArrow
                direction="left"
                onClick={() => navigate(-1)}
                visible={modalOpen}
              />
            )}

            {/* Next arrow */}
            {modalIndex < images.length - 1 && (
              <NavArrow
                direction="right"
                onClick={() => navigate(1)}
                visible={modalOpen}
              />
            )}

            {/* Dot indicators */}
            {images.length > 1 && (
              <div
                style={{
                  position: "fixed",
                  bottom: vw(28),
                  left: "50%",
                  transform: "translateX(-50%)",
                  display: "flex",
                  gap: vw(8),
                  opacity: modalOpen ? 1 : 0,
                  transition: `opacity 300ms ${EASE}`,
                }}
              >
                {images.map((_, i) => (
                  <button
                    key={i}
                    onClick={(e) => {
                      e.stopPropagation();
                      goTo(i);
                    }}
                    aria-label={`Image ${i + 1}`}
                    style={{
                      width: i === modalIndex ? vw(10) : vw(7),
                      height: i === modalIndex ? vw(10) : vw(7),
                      borderRadius: "50%",
                      border: "none",
                      padding: 0,
                      cursor: "pointer",
                      background:
                        i === modalIndex
                          ? "var(--color-foreground, #1a1a1a)"
                          : "rgba(0,0,0,0.2)",
                      transform: i === modalIndex ? "scale(1)" : "scale(1)",
                      transition: "background 0.3s, width 0.3s, height 0.3s",
                    }}
                  />
                ))}
              </div>
            )}
          </div>,
          document.body,
        )}
    </section>
  );
}

/* ── Glass chrome button ── */

function Button({
  onClick,
  style,
  label,
  children,
}: {
  onClick: (e: React.MouseEvent) => void;
  style: React.CSSProperties;
  label: string;
  children: ReactNode;
}) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick(e);
      }}
      aria-label={label}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.04)",
        border: "1px solid rgba(0,0,0,0.08)",
        borderRadius: "50%",
        color: "var(--color-foreground, #1a1a1a)",
        cursor: "pointer",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        ...style,
      }}
    >
      {children}
    </button>
  );
}

/* ── Nav arrow ── */

function NavArrow({
  direction,
  onClick,
  visible,
}: {
  direction: "left" | "right";
  onClick: () => void;
  visible: boolean;
}) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      aria-label={direction === "left" ? "Previous image" : "Next image"}
      style={{
        position: "fixed",
        [direction]: vw(12),
        top: "50%",
        marginTop: vw(-28),
        width: vw(56),
        height: vw(56),
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.04)",
        border: "1px solid rgba(0,0,0,0.08)",
        borderRadius: "50%",
        color: "var(--color-foreground, #1a1a1a)",
        fontSize: vw(40),
        lineHeight: 1,
        cursor: "pointer",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        opacity: visible ? 1 : 0,
        transition: `opacity 300ms ${EASE}, background 0.2s`,
      }}
    >
      <span style={{ display: "block", transform: "translateY(-0.08em)" }}>
        {direction === "left" ? "‹" : "›"}
      </span>
    </button>
  );
}
