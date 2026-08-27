import { useEffect, useRef, useState } from "react";
import { X, MessageSquare } from "lucide-react";
import Assistant from "./Assistant";
import AssistantAvatar from "./AssistantAvatar";
import { stopSpeaking } from "../lib/speech";

/* ================================================================
   The assistant, docked — available everywhere instead of parked in
   one band of one page.

   It was a section, which meant it only existed if you scrolled to it
   and stopped existing when you scrolled past. A launcher pinned to the
   viewport is the pattern every visitor already knows, and it puts the
   avatar on screen for the whole visit rather than for one screenful.

   MOUNTED ONCE, and only from here. The same component in two places
   would be two conversations, two microphones and two voices talking
   over each other — the reason the band was removed rather than kept
   alongside this.

   The panel is mounted lazily on the first open and then only HIDDEN,
   never unmounted, so a visitor who closes it mid-conversation and
   comes back finds their answers still there.
   ================================================================ */

/* A full-figure greeter if one has been supplied, the circular bust if
   not.

   The two are different objects, not two sizes of one. A 64px circle
   crops to the face and throws the hands away, so a namaste — the
   greeting the client asked for, and what the kiosk in their reference
   does — cannot exist at that size. Showing it means an uncropped
   figure tall enough for the gesture to read, which is why this probes
   for its own file rather than reusing avatar-idle.png: that one is
   framed head-and-shoulders for the panel header, and the two framings
   cannot be the same picture. */
const GREETER_SRCS = ["assistant/greeter.webp", "assistant/greeter.png"];

export default function AssistantDock() {
  const [open, setOpen] = useState(false);
  const [greeter, setGreeter] = useState(null);
  const [mounted, setMounted] = useState(false);
  const panelRef = useRef(null);
  const launcherRef = useRef(null);

  function toggle() {
    if (open) {
      close();
      return;
    }
    setMounted(true);
    setOpen(true);
  }

  function close() {
    setOpen(false);
    /* Silence it on the way out. A voice still finishing its sentence
       from a panel that is no longer on screen is the single most
       alarming thing this component could do. */
    stopSpeaking();
    launcherRef.current?.focus();
  }

  useEffect(() => {
    let alive = true;
    const tryOne = (i) => {
      if (!alive || i >= GREETER_SRCS.length) { if (alive) setGreeter(null); return; }
      const probe = new Image();
      probe.onload = () => {
        if (!alive) return;
        if (probe.naturalWidth > 1) setGreeter(GREETER_SRCS[i]);
        else tryOne(i + 1);
      };
      probe.onerror = () => tryOne(i + 1);
      probe.src = GREETER_SRCS[i];
    };
    tryOne(0);
    return () => { alive = false; };
  }, []);

  // Escape closes, from anywhere — including from inside the panel.
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === "Escape") close(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // Move focus in on open, so a keyboard visitor lands in the panel
  // rather than continuing through the page behind it.
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => {
      panelRef.current?.querySelector("input, button")?.focus();
    }, 60);
    return () => clearTimeout(t);
  }, [open]);

  return (
    <div className="dock">
      {mounted && (
        <div
          className={`dock__panel${open ? " is-open" : ""}`}
          ref={panelRef}
          role="dialog"
          aria-label="MRAKEE assistant"
          /* Not aria-modal: the page behind stays readable and usable,
             which is the point of docking it rather than putting it in
             a lightbox. */
          hidden={!open}
        >
          <button
            type="button"
            className="dock__close"
            onClick={close}
            aria-label="Close the assistant"
          >
            <X size={16} aria-hidden="true" />
          </button>
          <Assistant compact />
        </div>
      )}

      <button
        type="button"
        className={`dock__launcher${open ? " is-open" : ""}${greeter && !open ? " dock__launcher--figure" : ""}`}
        onClick={toggle}
        ref={launcherRef}
        aria-expanded={open}
        aria-label={open ? "Close the assistant" : "Ask the MRAKEE assistant"}
      >
        {/* The avatar IS the launcher. It is the one place it is visible
            for the whole visit, so whatever replaces the drawn figure —
            the 3D render being made — lands here first. */}
        <span className="dock__face" aria-hidden="true">
          {open ? (
            <MessageSquare size={22} />
          ) : greeter ? (
            <img className="dock__figure" src={greeter} alt="" />
          ) : (
            <AssistantAvatar state="idle" size={56} />
          )}
        </span>
      </button>
    </div>
  );
}
