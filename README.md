# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.

## Environment variables

Set in Vercel → Project → Settings → Environment Variables, for
Production (and Preview if you want the previews to talk too). Nothing
here is read by the browser: every one of these is used only inside
`api/`, and the built client bundle contains no key material.

| Variable | Required? | What it does |
|---|---|---|
| `ANTHROPIC_API_KEY` | **Yes** | Claude answers every question. Without it the assistant cannot reply at all. Already configured. |
| `ELEVENLABS_API_KEY` | Optional | The natural female voice. First choice — this is the one most listeners will not identify as synthetic. |
| `OPENAI_API_KEY` | Optional | Second-choice voice. Cheaper than ElevenLabs and close in quality. **Used only for speech.** Claude remains the brain. |

Claude is the brain in every configuration. The voice keys change what
the answer sounds like, never what it says.

### If you set neither voice key

The assistant still speaks, using the browser's own `speechSynthesis` —
free, instant, and audibly synthetic. Nothing breaks; it is a downgrade,
not a failure.

### Choosing a voice

Everything about the voice lives in `src/lib/voiceConfig.js` — the
provider order, the voice, the model, the delivery instruction. No
provider or voice name appears anywhere else in the app.

`VOICE.order` is tried in sequence and the first provider whose key is
present on the server wins, so you can add `ELEVENLABS_API_KEY` later
and it takes over from OpenAI on the next reply with no code change.

For ElevenLabs, leaving `voiceId` empty makes the server pick a female
voice from your own account's library on first use and cache it. Set it
to pin a specific one.
