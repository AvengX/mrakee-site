import { useEffect, useRef, useState } from "react";
import { Mic, SendHorizontal, RotateCcw } from "lucide-react";
import { QUICK_ASKS } from "../lib/assistantPrompt";
import { SOLUTIONS } from "../content/mrakee";
import AssistantAvatar from "./AssistantAvatar";

/* ================================================================
   THE ASSISTANT — built as a kiosk, not a chat bubble

   The reference is an airport concierge: avatar, "tap to speak", quick
   chips, then an answer with result cards you can act on. Rebuilt for
   this client, where the result cards are the nine solution portfolios
   and the action is the enquiry form rather than walking directions.

   Why a kiosk and not a corner bubble: for an AV integrator this is a
   product demonstration as much as a support tool. A facilities manager
   does not need a bot to read nine portfolios aloud — but showing them
   the kind of interactive surface MRAKEE builds is worth having on the
   page. A chat bubble says "support"; a kiosk says "this is what we
   make".

   Step 1 of the build: everything the reference does except the voice.
   The microphone is visible but disabled, so the shape of the finished
   thing is on the page and the wiring for it lands next.
   ================================================================ */

const GREETING =
  "Ask me what MRAKEE can build for your space — meeting rooms, control rooms, signage, classrooms.";

export default function Assistant() {
  const [turns, setTurns] = useState([]);
  const [draft, setDraft] = useState("");
  const [state, setState] = useState("idle"); // idle · thinking · error
  const [error, setError] = useState(null);
  const logRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    // keep the newest answer in view without yanking the whole page
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: "smooth" });
  }, [turns, state]);

  async function ask(text) {
    const question = text.trim();
    if (!question || state === "thinking") return;

    const history = [...turns, { role: "user", content: question }];
    setTurns(history);
    setDraft("");
    setState("thinking");
    setError(null);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: history.map((t) => ({ role: t.role, content: t.content })),
        }),
      });
      /* Never let a parse failure reach the screen as itself. When the
         endpoint is missing or a proxy returns an HTML error page, the
         raw exception reads "Failed to execute 'json' on 'Response'",
         which is developer text in front of a customer. */
      let data = null;
      try {
        data = await res.json();
      } catch {
        throw new Error(
          res.status === 404
            ? "The assistant is not switched on yet."
            : "The assistant did not respond properly."
        );
      }
      if (!res.ok) throw new Error(data?.error || "That did not go through.");

      setTurns((t) => [
        ...t,
        {
          role: "assistant",
          content: data.reply,
          matches: data.matches || [],
          handoff: !!data.handoff,
        },
      ]);
      // hold the presenting pose while the answer is new, then settle
      setState("answering");
      setTimeout(() => setState((st) => (st === "answering" ? "idle" : st)), 2600);
    } catch (e) {
      setError(e.message);
      setState("error");
    }
  }

  const reset = () => {
    setTurns([]);
    setError(null);
    setState("idle");
    inputRef.current?.focus();
  };

  const speaking = state === "thinking";
  const pose = state === "thinking" ? "thinking" : state === "answering" ? "answering" : "idle";

  return (
    <div className="kiosk">
      <div className="kiosk__frame">
        <div className="kiosk__head">
          <AssistantAvatar state={pose} />
          <div className="kiosk__intro">
            <p className="kiosk__name">MRAKEE Assistant</p>
            <p className="kiosk__hint">
              {turns.length ? "Ask me anything else about what we build." : GREETING}
            </p>
          </div>
          {turns.length > 0 && (
            <button type="button" className="kiosk__reset" onClick={reset}>
              <RotateCcw size={15} aria-hidden="true" />
              Start again
            </button>
          )}
        </div>

        <div
          className="kiosk__log"
          ref={logRef}
          role="log"
          aria-live="polite"
          aria-label="Conversation"
        >
          {turns.map((t, i) =>
            t.role === "user" ? (
              <p className="kiosk__ask" key={i}>{t.content}</p>
            ) : (
              <div className="kiosk__answer" key={i}>
                <p>{t.content}</p>
                {t.matches?.length > 0 && (
                  <ul className="kiosk__cards">
                    {t.matches.map((title) => {
                      const s = SOLUTIONS.find((x) => x.t === title);
                      if (!s) return null;
                      return (
                        <li key={title}>
                          <a href="#solutions">
                            <span
                              className="kiosk__cardImg"
                              style={{ backgroundImage: `url(${s.fallback})` }}
                              aria-hidden="true"
                            />
                            <span className="kiosk__cardBody">
                              <b>{s.t}</b>
                              <i>{s.quote}</i>
                            </span>
                          </a>
                        </li>
                      );
                    })}
                  </ul>
                )}
                {t.handoff && (
                  <a className="kiosk__handoff" href="#contact">
                    Ask the team directly
                    <span className="arrow" aria-hidden="true">→</span>
                  </a>
                )}
              </div>
            )
          )}

          {speaking && (
            <p className="kiosk__thinking">
              <i /><i /><i />
              <span className="sr-only">Thinking</span>
            </p>
          )}

          {state === "error" && (
            <p className="kiosk__error" role="alert">
              {error}{" "}
              <a href="#contact">Send us an enquiry instead</a>.
            </p>
          )}
        </div>

        {turns.length === 0 && (
          <ul className="kiosk__chips">
            {QUICK_ASKS.map((q) => (
              <li key={q}>
                <button type="button" onClick={() => ask(q)}>{q}</button>
              </li>
            ))}
          </ul>
        )}

        <form
          className="kiosk__bar"
          onSubmit={(e) => {
            e.preventDefault();
            ask(draft);
          }}
        >
          {/* Visible and disabled on purpose: voice is the next step, and
              a control that appears then vanishes is worse than one that
              is plainly not ready yet. */}
          <button
            type="button"
            className="kiosk__mic"
            disabled
            title="Voice input is coming next"
            aria-label="Voice input — not available yet"
          >
            <Mic size={18} aria-hidden="true" />
          </button>
          <input
            ref={inputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Type your question…"
            maxLength={600}
            aria-label="Ask the MRAKEE assistant"
            disabled={state === "thinking"}
          />
          <button
            type="submit"
            className="kiosk__send"
            disabled={!draft.trim() || state === "thinking"}
            aria-label="Send"
          >
            <SendHorizontal size={18} aria-hidden="true" />
          </button>
        </form>

        <p className="kiosk__fine">
          Answers come from MRAKEE's own published information. For pricing,
          timelines or anything specific to your site, the team will reply directly.
        </p>
      </div>
    </div>
  );
}
