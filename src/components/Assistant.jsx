import { useEffect, useRef, useState } from "react";
import { Mic, MicOff, SendHorizontal, RotateCcw, Volume2, VolumeX, Sparkles, Square } from "lucide-react";
import { QUICK_ASKS } from "../lib/assistantPrompt";
import { SOLUTIONS } from "../content/mrakee";
import AssistantAvatar from "./AssistantAvatar";
import { canListen, canSpeak, speak, stopSpeaking, SPEECH_ERRORS } from "../lib/speech";
import { createVoiceSession } from "../lib/voice/session.js";

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
  /* Speaking replies aloud is OFF until someone actually uses the
     microphone. If you type, it stays silent; if you talk to it, it
     talks back. Sound that starts on its own is the fastest way to make
     someone close a tab, and WCAG 1.4.2 requires a way to stop any
     audio running past three seconds — which is the toggle below. */
  const [voice, setVoice] = useState(false);
  const [heard, setHeard] = useState("");
  /* 0..1, driven by the audio that is actually playing. Kept in a ref
     as well: the rAF driver writes it up to 60 times a second and the
     ref is what the barge-in path zeroes without waiting for a render. */
  const [mouth, setMouth] = useState(0);
  /* The current mouth SHAPE, when the provider gave us alignment.
     null means no alignment and the amplitude path is driving. */
  const [viseme, setViseme] = useState(null);
  /* THE SESSION, which is a different thing from the turn.

     sessionActive says the microphone is open and the conversation is
     running. `state` says what is happening in THIS turn — listening,
     thinking, answering. A session survives every one of those; only
     End ends it.

     Mirrored into refs because the turn loop is rebuilt inside async
     callbacks, where a captured value would be whatever it was when the
     turn started rather than what it is now. */
  const [session, setSession] = useState(false);
  const [muted, setMuted] = useState(false);
  const sessionRef = useRef(null);
  const sessionOn = useRef(false);
  /* ask() through a ref, and this is load-bearing rather than tidy.
     The session's callbacks are created ONCE, when the session starts,
     so a direct reference to ask() would be the one from that render —
     capturing `turns` as it was then. Every later turn would rebuild
     the transcript from the first render's history and overwrite
     everything since. Measured: five utterances, one turn in the log. */
  const askRef = useRef(null);

  askRef.current = ask;

  /* STICK TO THE BOTTOM, BUT DO NOT FIGHT THE VISITOR.

     The old effect scrolled to the bottom on every turn and every state
     change, so reading back through the conversation was impossible —
     one "Thinking" tick and you were yanked to the end again.

     `stick` is true while the visitor is at the bottom, which is where
     they start. Scrolling up more than a screen's tail turns it off and
     they are left alone; scrolling back down turns it on again. Sending
     a message always turns it back on, because asking something is a
     statement that you want to see the answer. */
  const stick = useRef(true);
  /* Rendered state, so the "new message" pill can appear. `stick` stays
     a ref because the scroll handler reads it on every frame and must
     not re-render the transcript to do so. */
  const [atBottom, setAtBottom] = useState(true);
  const [unseen, setUnseen] = useState(false);

  function onLogScroll(e) {
    const el = e.currentTarget;
    const near = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
    stick.current = near;
    setAtBottom((was) => (was === near ? was : near));
    if (near) setUnseen(false);
  }

  function jumpToLatest() {
    const el = logRef.current;
    if (!el) return;
    stick.current = true;
    setUnseen(false);
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }

  useEffect(() => {
    const el = logRef.current;
    /* Reading older messages is a decision, so it is respected: a new
       turn arriving while scrolled up raises the pill instead of
       dragging the visitor back down. */
    if (el && !stick.current) setUnseen(true);
    if (!el || !stick.current) return;
    /* Two frames: the first lets React paint the new turn, the second
       measures a scrollHeight that includes it. Scrolling on the same
       frame lands short of the bottom by exactly the height of the
       message that was just added. */
    const id = requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
      })
    );
    return () => cancelAnimationFrame(id);
  }, [turns, state]);

  async function ask(text) {
    const question = text.trim();
    if (!question || state === "thinking") return;

    stopSpeaking();
    /* Recognition off while the answer is being fetched. The microphone
       stays open, but a recogniser left running here picks up room
       noise and the tail of the visitor's own sentence, and queues a
       second question nobody asked. It comes back on when the reply
       finishes speaking. */
    sessionRef.current?.pause();
    const history = [...turns, { role: "user", content: question }];
    stick.current = true; // you asked, so you want to see the answer
    setUnseen(false);
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
      if ((voice || sessionOn.current) && canSpeak) {
        speak(data.reply, {
          onMouth: setMouth,
          onViseme: setViseme,
          onStart: () => {
            const s = sessionRef.current;
            if (!s) return;
            /* Recognition off, microphone still open. This is the line
               that stops the assistant answering itself: left running,
               it transcribes its own voice and replies to that,
               forever. The stream stays live underneath, which is what
               lets barge-in watch the same device without a second
               getUserMedia. */
            s.pause();
            s.watchBargeIn(() => {
              stopSpeaking();
              setMouth(0);
              setViseme(null);
              s.stopBargeIn();
              /* Straight back to listening rather than waiting for the
                 sentence to finish — not waiting is the entire point. */
              setState("listening");
              s.listen();
            });
          },
          onEnd: () => {
            setMouth(0);
            setViseme(null);
            const s = sessionRef.current;
            s?.stopBargeIn();
            /* THE FIX. The audio finishing is the cue to listen again,
               not the cue to stop. No click between turns. */
            if (sessionOn.current && s) {
              setState("listening");
              s.listen();
            } else {
              setState((st) => (st === "answering" ? "idle" : st));
            }
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

  /* ---- the session ---- */

  async function startSession() {
    if (sessionOn.current) return;
    setError(null);
    setHeard("");
    setVoice(true);

    const s = createVoiceSession({
      onPartial: setHeard,
      onUtterance: (text) => {
        setHeard("");
        askRef.current?.(text);
      },
      onListening: () => {
        /* Only claim to be listening if that is actually what is
           happening. Recognition restarting mid-answer must not
           overwrite "Speaking". */
        setState((st) => (st === "thinking" || st === "answering" ? st : "listening"));
      },
      onError: ({ code, message }) => {
        /* A session that has genuinely stopped must never leave the
           interface saying "Listening". */
        if (code === "not-allowed" || code === "audio-capture" || code === "recognition-unstable") {
          endSession();
          setState("error");
          setError({ text: SPEECH_ERRORS[code] || message, offerEnquiry: false });
        }
      },
    });

    sessionRef.current = s;
    const ok = await s.start(); // the ONLY permission request of the session
    if (!ok) { sessionRef.current = null; return; }

    sessionOn.current = true;
    setSession(true);
    setState("listening");
    s.listen();
  }

  function endSession() {
    sessionOn.current = false;
    setSession(false);
    setMuted(false);
    sessionRef.current?.stop(); // the only place the device is released
    sessionRef.current = null;
    stopSpeaking();
    setMouth(0);
    setViseme(null);
    setHeard("");
    setState("idle");
  }

  /* Mute stops the input, not the session. The stream stays open, the
     conversation stays alive, and unmuting resumes without another
     permission prompt. */
  function toggleMute() {
    const s = sessionRef.current;
    if (!s) return;
    setMuted(s.setMuted(!s.muted));
  }

  // never leave a microphone open or a voice talking to an empty page
  useEffect(() => () => { sessionOn.current = false; sessionRef.current?.stop(); stopSpeaking(); }, []);

  const reset = () => {
    endSession();
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
        {/* HEADER: identity only. It used to carry the avatar, the
            status line, Talk to us, Sound and Start again all at once
            — 160px of stacked controls, with its own "Talk to us"
            sitting directly under the site's gold one in the nav. The
            avatar moved to the stage below, where it can be seen, and
            the actions moved to the foot. */}
        <div className="kiosk__head">
          {/* THE AVATAR, small and on the LEFT of the header.

              It used to be a 330px portrait in the middle of the panel,
              which pushed the conversation below the fold and made the
              assistant read as a modal. It is identity here, not the
              subject: the conversation is the subject. The component is
              unchanged and still receives mouth and viseme, so lip-sync
              plays exactly as before — at 64px rather than 330. */}
          <AssistantAvatar
            className="avatar--chip"
            state={pose}
            size={64}
            mouth={mouth}
            viseme={viseme}
          />

          <div className="kiosk__intro">
            <p className="kiosk__name">MRAKEE AI</p>
            <p className="kiosk__role">Voice assistant</p>
            {/* One line, always in the same place, so the state never
                moves as the transcript grows. */}
            <span className={`kiosk__live kiosk__live--${state}`}>
              <span className={`kiosk__dot kiosk__dot--${state}`} aria-hidden="true" />
              {session
                ? muted
                  ? "Muted"
                  : state === "thinking"
                  ? "Thinking"
                  : state === "answering"
                  ? "Speaking"
                  : "Listening"
                : "Online"}
            </span>
          </div>

          {turns.length > 0 && !session && (
            <button type="button" className="kiosk__reset" onClick={reset} title="Clear the conversation">
              <RotateCcw size={15} aria-hidden="true" />
              Start again
            </button>
          )}
        </div>

        <div
          className="kiosk__log"
          ref={logRef}
          onScroll={onLogScroll}
          role="log"
          aria-live="polite"
          aria-label="Conversation"
          /* THE FIX FOR "I HAVE TO DRAG THE SCROLLBAR".

             Lenis runs the page's smooth scrolling and takes wheel and
             touch events on the whole document — measured: a wheel over
             this list came back defaultPrevented, so the gesture was
             being spent scrolling the PAGE and the conversation never
             moved. The scrollbar was the only thing left that worked.

             data-lenis-prevent is Lenis's own opt-out: it walks up from
             the event target and leaves anything carrying it alone, so
             the wheel, the trackpad and a finger all reach this element
             and scroll it natively. */
          data-lenis-prevent=""
        >
          {!turns.length && (
            <div className="kiosk__welcome">
              <p className="kiosk__welcomeLead">Hi &#128075; I&rsquo;m MRAKEE AI.</p>
              <p className="kiosk__welcomeSub">How can I help you today?</p>
            </div>
          )}
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

          {/* Quick actions live in the conversation, not in a rail
              under it — they are the assistant's opening offer, so they
              belong with the message that makes it, and they scroll
              away with it once the conversation starts. */}
          {turns.length === 0 && (
            <ul className="kiosk__chips">
              {QUICK_ASKS.map((q) => (
                <li key={q}>
                  <button type="button" onClick={() => ask(q)}>{q}</button>
                </li>
              ))}
            </ul>
          )}

          {speaking && (
            <p className="kiosk__thinking" aria-label="MRAKEE AI is typing">
              <span className="kiosk__typingWho">MRAKEE AI is typing</span>
              <i /><i /><i />
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

        {unseen && !atBottom && (
          <button type="button" className="kiosk__jump" onClick={jumpToLatest}>
            <span aria-hidden="true">&#8595;</span> New message
          </button>
        )}

        {/* THE CONTROLS, at the foot where a phone call puts them,
            rather than crowded into the header over the avatar. Mute
            and End only exist while a session does. */}
        <div className="kiosk__controls">
          {!session && canListen && (
            <button type="button" className="kiosk__start" onClick={startSession}>
              <Sparkles size={16} aria-hidden="true" />
              Talk to us
            </button>
          )}
          {session && (
            <>
              <button
                type="button"
                className={`kiosk__ctrl${muted ? " is-muted" : ""}`}
                onClick={toggleMute}
                aria-pressed={muted}
              >
                {muted ? <MicOff size={15} aria-hidden="true" /> : <Mic size={15} aria-hidden="true" />}
                {muted ? "Unmute" : "Mute"}
              </button>
              <button type="button" className="kiosk__ctrl kiosk__ctrl--end" onClick={endSession}>
                <Square size={13} aria-hidden="true" />
                End
              </button>
            </>
          )}
          {voice && canSpeak && !session && (
            <button
              type="button"
              className="kiosk__ctrl"
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
        </div>

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
          {/* One control, two jobs, and never "record one sentence".
              With no session it starts one; during a session it mutes
              and unmutes, which leaves the session and the microphone
              stream alive. */}
          <button
            type="button"
            className={`kiosk__mic${session && !muted ? " is-live" : ""}${muted ? " is-muted" : ""}`}
            onClick={session ? toggleMute : startSession}
            disabled={!canListen}
            title={
              !canListen
                ? "Voice input is not supported in this browser"
                : session
                ? muted ? "Unmute the microphone" : "Mute the microphone"
                : "Start a voice conversation"
            }
            aria-label={
              session ? (muted ? "Unmute the microphone" : "Mute the microphone") : "Start a voice conversation"
            }
            aria-pressed={session && !muted}
          >
            {!canListen || muted ? <MicOff size={18} aria-hidden="true" /> : <Mic size={18} aria-hidden="true" />}
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
