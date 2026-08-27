import { useEffect, useRef, useState } from "react";
import { Mic, MicOff, SendHorizontal, RotateCcw, Volume2, VolumeX, Radio, Square } from "lucide-react";
import { QUICK_ASKS } from "../lib/assistantPrompt";
import { SOLUTIONS } from "../content/mrakee";
import AssistantAvatar from "./AssistantAvatar";
import { canListen, canSpeak, listen, speak, stopSpeaking, SPEECH_ERRORS, ensureMicPermission } from "../lib/speech";

/* ================================================================
   THE ASSISTANT — built as a kiosk, not a chat bubble

   The reference is an airport concierge: avatar, "tap to speak", quick
   chips, then an answer with result cards you can act on. Rebuilt for
   this client, where the result cards are the nine solution portfolios
   and the action is the enquiry form rather than walking directions.

   Why a kiosk and not a corner bubble: for a systems integrator this is a
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

export default function Assistant({ compact = false }) {
  const [turns, setTurns] = useState([]);
  const [draft, setDraft] = useState("");
  const [state, setState] = useState("idle"); // idle · thinking · error
  // { text, offerEnquiry } — a blocked microphone is a local problem
  // the visitor can solve by typing, so it must not also tell them to
  // go and fill in a form.
  const [error, setError] = useState(null);
  const logRef = useRef(null);
  const inputRef = useRef(null);
  const micRef = useRef(null);
  /* Speaking replies aloud is OFF until someone actually uses the
     microphone. If you type, it stays silent; if you talk to it, it
     talks back. Sound that starts on its own is the fastest way to make
     someone close a tab, and WCAG 1.4.2 requires a way to stop any
     audio running past three seconds — which is the toggle below. */
  const [voice, setVoice] = useState(false);
  const [heard, setHeard] = useState("");
  /* Hands-free mode: listen, answer, speak, listen again, until it is
     stopped. Driven from refs rather than state because the loop is
     rebuilt inside async callbacks, where a captured `convo` would be
     whatever it was when the turn started. */
  const [convo, setConvo] = useState(false);
  const convoRef = useRef(false);
  const silentRef = useRef(0);
  /* True from the moment the mic is asked for until it is stopped. The
     permission prompt is awaited, and a visitor can dismiss the whole
     assistant while it is open — without this the recogniser would then
     start against an interface that is gone. */
  const micLive = useRef(false);

  useEffect(() => {
    // keep the newest answer in view without yanking the whole page
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: "smooth" });
  }, [turns, state]);

  async function ask(text) {
    const question = text.trim();
    if (!question || state === "thinking") return;

    stopSpeaking();
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
      // Hold the presenting pose while the answer is new. When it is
      // being spoken, hold it until the voice actually stops rather
      // than guessing a duration.
      setState("answering");
      if ((voice || convoRef.current) && canSpeak) {
        speak(data.reply, {
          onEnd: () => {
            setState((st) => (st === "answering" ? "idle" : st));
            /* Only reopen the microphone once the voice has actually
               stopped. Listening while it is still speaking means it
               transcribes itself and answers its own reply. */
            if (convoRef.current) setTimeout(() => startListening(), 400);
          },
        });
      } else {
        setTimeout(() => setState((st) => (st === "answering" ? "idle" : st)), 2600);
      }
    } catch (e) {
      setError({ text: e.message, offerEnquiry: true });
      setState("error");
    }
  }

  async function startListening(lang) {
    if (!canListen || state === "thinking") return;
    stopSpeaking();
    setError(null);
    setHeard("");
    setState("listening");
    setVoice(true);
    micLive.current = true;

    /* Settle the permission question first, so the prompt cannot eat
       the visitor's first sentence. Once granted this resolves without
       a prompt, so it costs a tick on every later turn and a round of
       confusion only on the first. */
    try {
      await ensureMicPermission();
    } catch (e) {
      micLive.current = false;
      endConversation();
      setState("error");
      setError({
        text: SPEECH_ERRORS[e?.name === "NotFoundError" ? "audio-capture" : "not-allowed"],
        offerEnquiry: false,
      });
      return;
    }
    if (!micLive.current) return; // stopped while the prompt was open

    const session = listen({ onPartial: setHeard, lang });
    micRef.current = session;
    session.start();

    session.promise
      .then((text) => {
        micRef.current = null;
        setHeard("");
        if (text) {
          silentRef.current = 0;
          ask(text);
          return;
        }
        setState("idle");
        heardNothing();
      })
      .catch((err) => {
        micRef.current = null;
        setHeard("");

        /* The visitor pressed stop. Not a failure, and not something to
           tell them about — they know. */
        if (err.code === "aborted") { setState("idle"); return; }

        /* en-IN is not in every browser's voice pack. Fall back once to
           en-US rather than reporting a failure the visitor cannot act
           on. */
        if (err.code === "language-not-supported" && lang !== "en-US") {
          startListening("en-US");
          return;
        }

        /* Silence is not an error condition, whatever the spec calls
           it: Chrome raises no-speech for a pause as ordinary as
           thinking about the question. It takes the same path as an
           empty result. */
        if (err.code === "no-speech") { setState("idle"); heardNothing(); return; }

        endConversation();
        setState("error");
        setError({
          text: SPEECH_ERRORS[err.code] || "The microphone could not be started. You can still type your question.",
          offerEnquiry: false,
        });
      });
  }

  /* Nothing came back. Say so — a microphone that opens, closes and
     leaves no trace is indistinguishable from one that is broken, which
     is exactly how this read to the client. */
  function heardNothing() {
    if (!convoRef.current) {
      setError({ text: SPEECH_ERRORS["no-speech"], offerEnquiry: false });
      return;
    }
    silentRef.current += 1;
    if (silentRef.current >= 3) endConversation();
    else setTimeout(() => startListening(), 300);
  }

  function stopListening() {
    micLive.current = false;
    micRef.current?.stop();
  }

  function beginConversation() {
    if (!canListen) return;
    convoRef.current = true;
    silentRef.current = 0;
    setConvo(true);
    setVoice(true);
    startListening(undefined);
  }

  function endConversation() {
    micLive.current = false;
    convoRef.current = false;
    setConvo(false);
    micRef.current?.abort();
    stopSpeaking();
    setState("idle");
  }

  // never leave a microphone open or a voice talking to an empty page
  useEffect(() => () => { convoRef.current = false; micRef.current?.abort(); stopSpeaking(); }, []);

  const reset = () => {
    endConversation();
    setTurns([]);
    setError(null);
    setState("idle");
    inputRef.current?.focus();
  };

  const listening = state === "listening";
  const speaking = state === "thinking";
  const pose =
    state === "listening" ? "listening"
    : state === "thinking" ? "thinking"
    : state === "answering" ? "answering"
    : "idle";

  return (
    <div className={`kiosk${compact ? " kiosk--compact" : ""}`}>
      <div className="kiosk__frame">
        <div className="kiosk__head">
          <AssistantAvatar state={pose} size={compact ? 44 : 84} />
          <div className="kiosk__intro">
            <p className="kiosk__name">MRAKEE Assistant</p>
            <p className="kiosk__hint">
              {convo
                ? state === "listening"
                  ? "Listening — just speak."
                  : state === "thinking"
                  ? "Thinking…"
                  : state === "answering"
                  ? "Speaking — I'll listen again when I finish."
                  : "Conversation on."
                : listening
                ? "Listening — ask about a room, a space or a solution."
                : turns.length
                ? "Ask me anything else about what we build."
                : GREETING}
            </p>
          </div>
          {canListen && (
            <button
              type="button"
              className={`kiosk__convo${convo ? " is-live" : ""}`}
              onClick={convo ? endConversation : beginConversation}
              aria-pressed={convo}
              title={convo ? "End the conversation" : "Talk to it hands-free"}
            >
              {convo
                ? <><Square size={13} aria-hidden="true" />End</>
                : <><Radio size={15} aria-hidden="true" />Talk</>}
            </button>
          )}
          {voice && canSpeak && !convo && (
            <button
              type="button"
              className="kiosk__mute"
              onClick={() => {
                stopSpeaking();
                setVoice((v) => !v);
                setState((st) => (st === "answering" ? "idle" : st));
              }}
              aria-pressed={!voice}
              title={voice ? "Stop speaking answers" : "Speak answers aloud"}
            >
              {voice ? <Volume2 size={15} aria-hidden="true" /> : <VolumeX size={15} aria-hidden="true" />}
              {voice ? "Sound on" : "Sound off"}
            </button>
          )}
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
              {error?.text}
              {error?.offerEnquiry && (
                <>
                  {" "}
                  <a href="#contact">Send us an enquiry instead</a>.
                </>
              )}
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
          {/* Disabled rather than hidden where the browser has no
              recognition — Firefox has none and iOS Safari is
              unreliable — so the control does not appear and vanish
              between machines. The typed path never depends on it. */}
          <button
            type="button"
            className={`kiosk__mic${listening ? " is-live" : ""}`}
            onClick={listening ? stopListening : startListening}
            disabled={!canListen || state === "thinking"}
            title={canListen ? (listening ? "Stop listening" : "Ask by voice") : "Voice input is not supported in this browser"}
            aria-label={listening ? "Stop listening" : "Ask by voice"}
            aria-pressed={listening}
          >
            {canListen ? <Mic size={18} aria-hidden="true" /> : <MicOff size={18} aria-hidden="true" />}
          </button>
          <input
            ref={inputRef}
            value={listening ? heard : draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={listening ? "Listening…" : "Type your question…"}
            readOnly={listening}
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
