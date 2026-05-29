<p align="center">
  <img src="https://img.shields.io/badge/NOVA-AI%20Assistant-00b4d8?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiNmZmYiIHN0cm9rZS13aWR0aD0iMiI+PGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMTAiLz48L3N2Zz4=&logoColor=white" alt="NOVA Badge" />
  <img src="https://img.shields.io/badge/React_19-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Supabase-3FCF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase" />
  <img src="https://img.shields.io/badge/TanStack_Start-FF4154?style=for-the-badge&logo=react-query&logoColor=white" alt="TanStack" />
  <img src="https://img.shields.io/badge/Vite_7-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
</p>

# NOVA — Your AI Assistant

> A full-stack, voice-ready AI assistant web app with persistent memory, threaded conversations, and tool use — built on TanStack Start, Supabase, and the Vercel AI SDK.

NOVA listens, thinks, and remembers. Each conversation lives at its own URL with full history. Voice input and output work in any modern browser via the Web Speech API. Auth-gated with row-level security — your data, your account.

---

## ✨ Features

| Feature                    | Description                                                                                              |
| -------------------------- | -------------------------------------------------------------------------------------------------------- |
| **Threaded Conversations** | Each chat has a unique URL (`/c/:threadId`) with full message history persisted to Supabase              |
| **Long-Term Memory**       | NOVA remembers user preferences and facts across sessions via a `remember` / `recall` tool system        |
| **Voice Input**            | Press-to-talk microphone input using the Web Speech Recognition API                                      |
| **Voice Output**           | Toggle speech synthesis to hear NOVA's responses read aloud                                              |
| **AI Tools**               | Built-in tools: `get_time`, `remember`, `recall`, `summarize_text` — with automatic multi-step reasoning |
| **Streaming Responses**    | Real-time token streaming with markdown rendering (code blocks, lists, links)                            |
| **Authentication**         | Email/password and Google OAuth sign-in via Supabase Auth + Lovable Cloud                                |
| **Row-Level Security**     | All data (threads, messages, memories) is scoped to the authenticated user at the database level         |
| **Memory Management UI**   | Dedicated `/memory` page to view, add, edit, and delete stored memories                                  |
| **Dark Theme**             | Sleek "Arc Reactor" dark theme with glassmorphism, cyan/violet glow effects, and custom typography       |
| **SSR & Edge Ready**       | Server-side rendering via TanStack Start with Nitro, deployable to Cloudflare Workers                    |

---

## 🏗️ Tech Stack

| Layer                | Technology                                                                                       |
| -------------------- | ------------------------------------------------------------------------------------------------ |
| **Framework**        | [TanStack Start](https://tanstack.com/start) (React 19 + SSR)                                    |
| **Language**         | TypeScript 5.8                                                                                   |
| **Build Tool**       | Vite 7                                                                                           |
| **Styling**          | Tailwind CSS 4 + shadcn/ui (New York style)                                                      |
| **AI**               | [Vercel AI SDK](https://sdk.vercel.ai/) via Lovable AI Gateway (`google/gemini-3-flash-preview`) |
| **Database**         | [Supabase](https://supabase.com) (PostgreSQL + Auth + RLS)                                       |
| **State Management** | TanStack Query v5 + TanStack Router                                                              |
| **UI Components**    | Radix UI primitives, Lucide icons, Sonner toasts                                                 |
| **Fonts**            | Space Grotesk (display), Inter (body), JetBrains Mono (code)                                     |
| **Deployment**       | Nitro → Cloudflare Workers (default target)                                                      |

---

## 📁 Project Structure

```text
charm-assist-suite-main/
├── .env                          # Environment variables (Supabase keys)
├── .lovable/                     # Lovable platform config
├── package.json                  # Dependencies & scripts
├── vite.config.ts                # Vite + TanStack Start config
├── tsconfig.json                 # TypeScript config
├── components.json               # shadcn/ui config
│
├── supabase/
│   └── migrations/               # SQL migrations (profiles, threads, messages, memories)
│
└── src/
    ├── styles.css                # Global theme: colors, fonts, glow utilities, animations
    ├── router.tsx                # TanStack Router setup
    ├── start.ts                  # TanStack Start entry
    ├── server.ts                 # SSR entry with error handling wrapper
    ├── routeTree.gen.ts          # Auto-generated route tree
    │
    ├── routes/
    │   ├── __root.tsx            # Root layout: HTML shell, QueryClient, AuthListener, meta tags
    │   ├── index.tsx             # Landing page (public)
    │   ├── login.tsx             # Auth page (email/password + Google OAuth)
    │   ├── _authenticated.tsx    # Auth guard — redirects to /login if not signed in
    │   ├── _authenticated/
    │   │   ├── c.tsx             # Chat layout with sidebar
    │   │   ├── c/
    │   │   │   ├── index.tsx     # Auto-creates a new thread and redirects
    │   │   │   └── $threadId.tsx # Individual chat thread page
    │   │   └── memory.tsx        # Memory management page
    │   └── api/
    │       └── chat.ts           # POST /api/chat — streaming AI endpoint with tools
    │
    ├── components/
    │   ├── nova-orb.tsx          # Animated orb logo component (CSS animations)
    │   ├── chat-window.tsx       # Main chat UI: messages, voice I/O, streaming
    │   ├── chat-sidebar.tsx      # Thread list sidebar with CRUD
    │   ├── ai-elements/          # Reusable chat UI primitives
    │   │   ├── conversation.tsx  # Conversation container & scroll
    │   │   ├── message.tsx       # Message bubble component
    │   │   ├── prompt-input.tsx  # Text input with submit button
    │   │   ├── code-block.tsx    # Syntax-highlighted code blocks
    │   │   ├── shimmer.tsx       # Loading shimmer animation
    │   │   └── tool.tsx          # Tool call/result display
    │   └── ui/                   # shadcn/ui components (Button, Input, Label, etc.)
    │
    ├── lib/
    │   ├── ai-gateway.server.ts  # Lovable AI Gateway provider (server-only)
    │   ├── config.server.ts      # Server-side configuration
    │   ├── threads.functions.ts  # Server functions: CRUD for threads & messages
    │   ├── memories.functions.ts # Server functions: CRUD for memories
    │   ├── utils.ts              # Shared utility (cn)
    │   ├── error-capture.ts      # Error capture for SSR
    │   ├── error-page.ts         # Error page HTML generator
    │   └── lovable-error-reporting.ts
    │
    ├── hooks/
    │   └── use-mobile.tsx        # Mobile breakpoint detection hook
    │
    └── integrations/
        ├── lovable/              # Lovable Cloud auth integration
        └── supabase/
            ├── client.ts         # Browser Supabase client
            ├── client.server.ts  # Server-side Supabase admin client
            ├── auth-attacher.ts  # Auth token attacher
            ├── auth-middleware.ts# TanStack Start middleware for auth
            └── types.ts          # Auto-generated Supabase types
```

---

## 🗄️ Database Schema

Four tables with RLS enabled and automatic `updated_at` triggers:

```text
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   profiles   │     │   threads    │     │   messages   │
├──────────────┤     ├──────────────┤     ├──────────────┤
│ id (PK, FK)  │     │ id (PK)      │◄────│ thread_id FK │
│ display_name │     │ user_id (FK) │     │ role         │
│ voice_enabled│     │ title        │     │ parts (JSONB)│
│ voice_name   │     │ created_at   │     │ created_at   │
│ created_at   │     │ updated_at   │     └──────────────┘
│ updated_at   │     └──────────────┘
└──────────────┘
                      ┌──────────────┐
                      │   memories   │
                      ├──────────────┤
                      │ id (PK)      │
                      │ user_id (FK) │
                      │ key (UNIQUE) │
                      │ value        │
                      │ created_at   │
                      │ updated_at   │
                      └──────────────┘
```

- **profiles** — Auto-created on signup via database trigger; stores display name and voice preferences
- **threads** — Conversation containers, each owned by a user
- **messages** — Individual messages stored as AI SDK `UIMessage` parts (JSONB)
- **memories** — Key-value pairs per user, unique on `(user_id, key)`, used by the AI for long-term recall

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **npm**, **bun**, or **pnpm**
- A [Supabase](https://supabase.com) project (or the Lovable-managed one already configured)

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/charm-assist-suite.git
cd charm-assist-suite/charm-assist-suite-main
```

### 2. Install Dependencies

```bash
npm install
# or
bun install
```

### 3. Configure Environment Variables

Create a `.env` file in the project root (one may already exist):

```env
# Supabase (required)
VITE_SUPABASE_URL="https://your-project.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="your-anon-key"
VITE_SUPABASE_PROJECT_ID="your-project-id"

# Server-side Supabase (same values, different prefix for SSR)
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_PUBLISHABLE_KEY="your-anon-key"

# Supabase Service Role Key (server-only, bypasses RLS)
# Find in: Supabase Dashboard → Settings → API → service_role key
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# AI (required for chat to work)
LOVABLE_API_KEY="your-lovable-api-key"
```

> **⚠️ Never commit secrets to git.** The `.env` file is already in `.gitignore`.

### 4. Run Database Migrations

If using Supabase CLI:

```bash
npx supabase db push
```

Or apply the SQL files in `supabase/migrations/` manually via the Supabase dashboard SQL editor.

### 5. Start the Dev Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173` (or the port Vite assigns).

---

## 📜 Available Scripts

| Script              | Description                                      |
| ------------------- | ------------------------------------------------ |
| `npm run dev`       | Start the development server with hot-reload     |
| `npm run build`     | Build for production (Nitro + Cloudflare target) |
| `npm run build:dev` | Build in development mode                        |
| `npm run preview`   | Preview the production build locally             |
| `npm run lint`      | Run ESLint checks                                |
| `npm run format`    | Format code with Prettier                        |

---

## 🏛️ Architecture

```text
┌─────────────────────────────────────────────────────────┐
│                        Browser                          │
│  ┌──────────┐  ┌──────────┐  ┌────────────────────────┐ │
│  │  Landing  │  │  Login   │  │   Authenticated App    │ │
│  │  (/)      │  │ (/login) │  │  ┌─────────┐ ┌──────┐ │ │
│  │           │  │          │  │  │ Sidebar  │ │ Chat │ │ │
│  │           │  │          │  │  │ (threads)│ │Window│ │ │
│  └──────────┘  └──────────┘  │  └─────────┘ └──────┘ │ │
│                               │     /memory page      │ │
│                               └────────────────────────┘ │
│       Web Speech API (mic in / speech out)               │
└──────────────────┬──────────────────────────────────────┘
                   │ HTTP (streaming)
┌──────────────────▼──────────────────────────────────────┐
│              TanStack Start Server (Nitro)               │
│  ┌──────────────────────────────────────────────────┐   │
│  │  POST /api/chat                                   │   │
│  │  ┌─────────────┐  ┌─────────┐  ┌──────────────┐  │   │
│  │  │ Auth verify  │→ │ AI SDK  │→ │ Tool calls   │  │   │
│  │  │ (Supabase)   │  │ stream  │  │ (remember,   │  │   │
│  │  └─────────────┘  │ Text    │  │  recall,     │  │   │
│  │                    └─────────┘  │  get_time,   │  │   │
│  │                                  │  summarize)  │  │   │
│  │                                  └──────────────┘  │   │
│  └──────────────────────────────────────────────────┘   │
│  Server Functions: threads CRUD, memories CRUD           │
└──────────────────┬──────────────────────────────────────┘
                   │
┌──────────────────▼───────────┐  ┌────────────────────────┐
│         Supabase             │  │  Lovable AI Gateway    │
│  ┌──────────┐ ┌───────────┐  │  │  (google/gemini-3-     │
│  │PostgreSQL│ │   Auth    │  │  │   flash-preview)       │
│  │  (RLS)   │ │(email+G.) │  │  └────────────────────────┘
│  └──────────┘ └───────────┘  │
└──────────────────────────────┘
```

### Design Principles

```text
AI should think.       →  The LLM reasons about intent before acting.
Tools should act.      →  Structured tools (remember, recall, get_time) execute real actions.
Safety should approve. →  Auth + RLS + server-side validation at every layer.
```

---

## 🤖 AI Tools

The chat endpoint (`/api/chat`) exposes these tools to the AI:

| Tool             | Description                                                                                |
| ---------------- | ------------------------------------------------------------------------------------------ |
| `get_time`       | Returns current date/time in ISO and human-readable format (supports IANA timezones)       |
| `remember`       | Stores a long-term fact/preference as a `key: value` pair in the user's memory             |
| `recall`         | Lists all stored memories for the current user                                             |
| `summarize_text` | Instructs the AI to summarize provided text (up to 20K chars, configurable sentence count) |

The system prompt injects up to 50 existing user memories as context so NOVA can reference past preferences without an explicit `recall` call.

---

## 🎨 Design System

The app uses a custom **"Arc Reactor"** dark theme defined in `src/styles.css`:

- **Color space**: OKLCH for perceptually uniform colors
- **Primary**: Cyan glow (`oklch(0.78 0.16 220)`)
- **Accent**: Violet glow (`oklch(0.62 0.22 295)`)
- **Background**: Deep blue-grey radial gradient
- **Utilities**: `.glow-cyan`, `.glow-violet`, `.glass`, `.text-glow`
- **Animations**: `orb-spin` (8s rotation), `orb-pulse` (2.5s breathe)
- **Components**: Glassmorphism panels with `backdrop-blur` and subtle borders

---

## 🔐 Authentication Flow

1. **Landing page** (`/`) — Public, shows capabilities
2. **Login** (`/login`) — Email/password or Google OAuth via Lovable Cloud
3. **Auth guard** (`/_authenticated`) — Redirects to `/login` if no session
4. **Session listener** — `onAuthStateChange` invalidates queries and router on sign-in/out
5. **Server functions** — Middleware validates Supabase auth on every server function call
6. **Chat API** — Extracts and validates Bearer token from `Authorization` header

---

## 🗺️ Routes

| Route            | Auth     | Description                                |
| ---------------- | -------- | ------------------------------------------ |
| `/`              | Public   | Landing page with feature cards            |
| `/login`         | Public   | Sign in / Sign up form                     |
| `/c`             | Required | Creates a new thread and redirects to it   |
| `/c/:threadId`   | Required | Chat interface for a specific conversation |
| `/memory`        | Required | View and manage stored memories            |
| `POST /api/chat` | Required | Streaming AI chat endpoint                 |

---

## 🛠️ Development

### Code Quality

```bash
# Lint
npm run lint

# Format
npm run format
```

### Adding shadcn/ui Components

The project uses shadcn/ui with the New York style variant:

```bash
npx shadcn@latest add <component-name>
```

### Adding New AI Tools

1. Define the tool in `src/routes/api/chat.ts` using the `tool()` helper from the Vercel AI SDK
2. Provide a Zod schema for inputs and an `execute` function
3. The tool will automatically appear in the chat UI's tool call/result display

---

## 🚢 Deployment

The project is configured for **Cloudflare Workers** via Nitro:

```bash
npm run build
```

The build output is generated in `.output/` and can be deployed with `wrangler`:

```bash
npx wrangler deploy
```

For Lovable Cloud deployment, push to the connected repository — deployment is automatic.

---

## 📋 Environment Variables Reference

| Variable                        | Required | Description                                                                |
| ------------------------------- | -------- | -------------------------------------------------------------------------- |
| `VITE_SUPABASE_URL`             | ✅       | Supabase project URL (client-side)                                         |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | ✅       | Supabase anon key (client-side)                                            |
| `VITE_SUPABASE_PROJECT_ID`      | ✅       | Supabase project ID                                                        |
| `SUPABASE_URL`                  | ✅       | Supabase project URL (server-side)                                         |
| `SUPABASE_PUBLISHABLE_KEY`      | ✅       | Supabase anon key (server-side)                                            |
| `SUPABASE_SERVICE_ROLE_KEY`     | ✅       | Supabase service role key (server-only, bypasses RLS for admin operations) |
| `LOVABLE_API_KEY`               | ✅       | API key for Lovable AI Gateway (enables chat)                              |

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Conventions

- TypeScript strict mode enabled
- ESLint + Prettier for formatting
- Server-only code uses `.server.ts` suffix
- All database access goes through server functions (never direct client → Supabase for mutations)
- Zod schemas for all server function inputs

---

## 📄 License

This project is released under the [MIT License](LICENSE).

---

## 👤 Author

Created by **Sudeep Swami**.
