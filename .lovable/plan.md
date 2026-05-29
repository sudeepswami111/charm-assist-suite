# NOVA — AI Assistant Web App

A web-based reinterpretation of the Jarvis spec from the README. Voice in, voice out, AI brain, persistent memory, and a HUD-inspired interface. Built on what runs cleanly in a browser (the README's Python desktop bits like `os.subprocess`, `pyautogui`, and smart home control don't apply here — those are replaced by web-native equivalents).

## Identity

- **Name:** NOVA
- **Look:** "Arc Reactor" — deep navy `#05070d` / `#0a1628`, electric cyan `#00d4ff` and violet `#7c3aed` accents, soft glow, glass panels, Iron Man HUD energy
- **Type:** Space Grotesk (display) + Inter (body), with JetBrains Mono for status readouts

## What it does

1. **Threaded chat** with NOVA — sidebar of conversations, create / rename / delete, each at its own URL `/c/$threadId`
2. **Voice in / voice out** — push-to-talk mic using the browser's Web Speech API; replies spoken back with Speech Synthesis (toggleable)
3. **AI brain** — Lovable AI Gateway (`google/gemini-3-flash-preview`) streamed via AI SDK
4. **Tools the assistant can call:**
   - `web_search` — answer current-events questions
   - `open_url` — surface a link/button the user clicks (we never auto-navigate)
   - `remember` / `recall` — persistent user memory (preferences, facts) stored per-user
   - `summarize_text` — paste-and-summarize
   - `get_time` — date/time/timezone
5. **Memory panel** — view and edit what NOVA remembers about you
6. **Auth** — email/password + Google sign-in via Lovable Cloud
7. **Safety** — risky tool calls (anything mutating memory) show a one-line confirmation chip inline before executing

## UI layout

```text
┌─────────────────────────────────────────────────────────────┐
│  NOVA ◉                                    [user avatar ▾]  │
├──────────┬──────────────────────────────────────────────────┤
│ + New    │                                                  │
│          │     ┌─ assistant message (no bubble) ──┐         │
│ ◉ Today  │     │  glowing cyan orb avatar         │         │
│  • Trip  │     │  streamed markdown reply         │         │
│  • Code  │     └──────────────────────────────────┘         │
│          │                                                  │
│ ◉ Older  │              ┌─ user bubble (cyan→violet) ─┐    │
│  • Idea  │              │  your message               │    │
│          │              └─────────────────────────────┘    │
│ ── Memory│                                                  │
│ ── Tools │     [▢ tool: web_search · 0.4s ▾ collapsed]      │
│          │                                                  │
│          │  ┌────────────────────────────────────────────┐  │
│          │  │ Ask NOVA…                      [🎤] [↑]    │  │
│          │  └────────────────────────────────────────────┘  │
└──────────┴──────────────────────────────────────────────────┘
```

- Animated arc-reactor orb in the header (subtle pulse; spins faster while streaming)
- Assistant text renders directly on the dark surface, no bubble
- User bubble uses a cyan→violet gradient with white text (high contrast)
- Tool calls render as collapsed accordion chips inside the assistant turn
- Mobile: sidebar becomes a sheet behind the menu icon

## Routes

```text
src/routes/
  __root.tsx                       shell + auth listener + query invalidation
  index.tsx                        public landing → CTA to /login or /c
  login.tsx                        email/password + Google
  _authenticated.tsx               session gate (redirects to /login)
  _authenticated/c.tsx             chat layout: sidebar + <Outlet/>
  _authenticated/c.index.tsx       creates a new thread, navigates to /c/$id
  _authenticated/c.$threadId.tsx   the conversation page
  _authenticated/memory.tsx        memory manager
  api/chat.ts                      streaming AI endpoint
```

## Data model (Lovable Cloud)

- `profiles` (id → auth.users, display_name, voice_enabled, voice_name)
- `threads` (id, user_id, title, created_at, updated_at) — RLS: owner only
- `messages` (id uuid pk, thread_id, role, parts jsonb, created_at) — RLS: scoped via thread ownership; stores AI SDK `UIMessage` parts so tool calls and streamed text round-trip cleanly
- `memories` (id, user_id, key, value, created_at, updated_at) — RLS: owner only

Each table gets explicit `GRANT`s to `authenticated` + `service_role` and RLS policies scoped to `auth.uid()`.

## Tech notes

- **AI Elements** installed first: `conversation`, `message`, `prompt-input`, `shimmer`, `tool`. UI composed from these primitives.
- **Streaming**: server route `src/routes/api/chat.ts` uses `streamText` + `toUIMessageStreamResponse({ originalMessages, onFinish })`; `onFinish` persists the assistant `UIMessage` via `supabaseAdmin` scoped to the verified `threadId`/`userId`.
- **User message persistence**: written from the client right before `sendMessage` (or in `onFinish` alongside the assistant message) using a `createServerFn` protected by `requireSupabaseAuth`.
- **Voice**: browser `SpeechRecognition` (Chrome/Edge) for mic input with a graceful "voice unavailable" fallback; `speechSynthesis` for replies, gated by the profile toggle.
- **Tool calls**: defined with AI SDK `tool({ inputSchema, execute })` server-side. `remember` uses `needsApproval` so the user confirms inline before NOVA writes to memory.
- **System prompt**: gives NOVA the rule "AI should think. Tools should act. Safety should approve risky actions." and injects the user's stored memories.
- **No Edge Functions** — all server logic is `createServerFn` + the `/api/chat` server route.
- **SEO**: per-route `head()` metadata; landing page has H1, meta description, og tags.

## Build order

1. Enable Lovable Cloud, create tables + RLS + GRANTs
2. Auth (login page, `_authenticated` gate, root `onAuthStateChange`)
3. Design tokens in `src/styles.css` (Arc Reactor palette, glow shadows, fonts)
4. Install AI Elements, build chat shell + sidebar
5. Streaming `/api/chat` route with persistence in `onFinish`
6. Thread CRUD server fns + dedicated thread routes
7. Tools: `web_search`, `get_time`, `summarize_text`, `remember`/`recall` (with approval)
8. Voice in/out + memory page
9. Animated arc-reactor orb, polish, landing page

## Out of scope (vs the README)

The README is a Python desktop spec. These items can't run in a browser sandbox and are intentionally dropped: launching native apps, file-system access beyond uploads, wake-word detection, smart-home / Home Assistant control, email-sending without an integration. If you want any of these later, we'd add them as separate integrations.

Reply **"Approve plan"** to start building, or tell me what to change.
