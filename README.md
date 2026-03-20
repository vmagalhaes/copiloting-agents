# Copilot Sessions Dashboard

> **Real-time web UI for monitoring agentic coding sessions in the Copilot CLI** — track active agents, sub-agent orchestration, tool calls, plans, and todos from a single browser tab.

A local web dashboard for [Copilot CLI](https://github.com/github/copilot-cli) that gives you full visibility into what your AI coding agent is doing. Whether you're running multi-agent workflows, waiting for plan approval, or just checking whether a long task is still in progress — this dashboard surfaces it all without touching your terminal.

**Keywords:** agentic coding dashboard · Copilot CLI UI · AI coding agent monitor · multi-agent orchestration viewer · Claude Code sessions UI · LLM agent task tracker · sub-agent workflow visualization · AI pair programming dashboard

<img width="1911" height="934" alt="Screenshot 2026-03-19 at 18 22 24" src="https://github.com/user-attachments/assets/b1d6a93a-8e06-4d98-940b-eece7f47574f" />

<img width="1911" height="932" alt="Screenshot 2026-03-19 at 18 21 45" src="https://github.com/user-attachments/assets/6ce86d56-bd4c-437c-9eb9-d8789d27b049" />

## Features

### Session monitoring
- **Live session list** — all active Copilot CLI sessions with real-time status badges
- **List / grid toggle** — switch between a compact table view and a bento-style card grid; choice persists across reloads
- **Desktop notifications** — browser push alert when any session needs your attention or completes a task, even with the tab in the background

**List view**
```
┌─────────────────────────────────────────────────┐
│ ● Search for Apigee gateway documentation       │  ← 🟡 needs attention
│   copiloting-agents · main · 23m · 2 msgs       │
│   [Plan review]                                 │
│   └ ≡ Read · explore-cmt-job-flow          Done │
│   └ ≡ Read · explore-cmt-entities-tests    Done │
├─────────────────────────────────────────────────┤
│ ● Implement REST client migration               │  ← 🟢 working
│   one-web · feature/rest-client · 41m · 3 msgs  │
│   [Working]  ≡ 1 sub-agent running             │
├─────────────────────────────────────────────────┤
│ ● Fix N+1 translation query performance         │  ← 🟢 task complete
│   one-api · main · 1h 12m · 4 msgs             │
│   [✓ Task complete]                             │
├─────────────────────────────────────────────────┤
│ ● Update notification stream service            │  ← ⚫ idle
│   one-web · main · 2h 30m · 7 msgs             │
│   [Idle]                                        │
├─────────────────────────────────────────────────┤
│ ● Scaffold K8s executor service                 │  ← 🔴 aborted
│   k8s-tools · feature/executor · 3h · 2 msgs   │
│   [Aborted]                                     │
└─────────────────────────────────────────────────┘
```

**Grid view** — each card shows a preview of the last message as a chat bubble, color-coded tool chips, and active sub-agent badges:
```
┌─────────────────────────────┐  ┌─────────────────────────────┐
│ Search for Apigee docs      │  │ Implement REST client        │
│ copiloting-agents · main    │  │ one-web · feature/rest · 41m │
│ · 23m · [Plan review]       │  │ · [Working]                  │
│─────────────────────────────│  │─────────────────────────────│
│ C  "Here is the evaluation  │  │ C  ┌─────────────────────┐  │
│    plan I've drafted…"      │  │    │ • bash  • edit ×3   │  │
│─────────────────────────────│  │    └─────────────────────┘  │
│ ≡ Read · explore-cmt   2m   │  │─────────────────────────────│
└─────────────────────────────┘  │ ● Explore   just now        │
                                  └─────────────────────────────┘
```

### Conversation & tool calls
- **Full message history** — complete conversation thread per session with timestamps
- **Syntax-highlighted tool calls** — collapsible blocks for `bash`, `edit`, `read`, `write`, `web_fetch` with inputs and outputs
- **Intent labels** — `report_intent` calls shown inline as readable action labels
- **Ask user blocks** — pending questions and chosen answers rendered with choice UI

### Sub-agent orchestration
- **Sub-agent tabs** — every spawned sub-agent (Explore, Read, task-based workers) gets its own message tab inside the session detail
- **Sub-agent status** — running agents pulse green; completed agents shown with a grey dot
- **Parallel agents** — multiple sub-agents from the same interaction are listed newest-first
- **Read agents** — `read_agent` tool calls tracked and surfaced as "Read · {agent-id}" tabs

### Plan mode
- **Plan tab** — view the full `plan.md` content with styled markdown (headings, checkboxes, code blocks, tables)
- **Needs attention detection** — session automatically flagged when `exit_plan_mode` is pending approval
- **Auto-focus** — dashboard switches to the Plan tab when a new plan is awaiting your approval
- **Approval banner** — amber notice with instructions when plan is pending

### Todo tracking
- **Todos tab** — live task list read from the agent's `session.db` SQLite database
- **Status groups** — tasks organised into In Progress, Blocked, Pending, and Done sections
- **Dependency display** — expandable rows show task description and upstream dependencies

### Zero cloud dependency
- Reads `~/.copilot/session-state/` directly from disk — no API calls, no internet required
- Polling every 5 seconds picks up new sessions and state changes automatically

## Prerequisites

- **Node.js** 20+
- **npm** 10+
- Copilot CLI installed and has created at least one session under `~/.copilot/session-state/`

## Installation

```bash
# Clone the repo
git clone <repo-url>
cd copiloting-agents

# Install all dependencies (root + server + client workspaces)
npm install
```

## Starting the Dev Server

```bash
npm run dev
```

This starts both services concurrently:

| Service | URL |
|---------|-----|
| API server | http://localhost:3001 |
| Web client | http://localhost:5173 |

Open **http://localhost:5173** in your browser.

## How It Works

The dashboard reads session state directly from `~/.copilot/session-state/` on your machine — no Copilot API calls, no internet required. The client polls the API every 5 seconds to pick up new sessions and state changes.

### Session States

| State | Meaning |
|-------|---------|
| 🟡 **Needs attention** | Waiting for your input — pending `ask_user` or plan approval |
| 🟢 **Working** | Agent has an active turn in progress |
| 🟢 **Task complete** | Last task finished successfully |
| ⚫ **Idle** | Turn ended cleanly, waiting for your next message |
| 🔴 **Aborted** | Last action was cancelled and agent did not recover |

### Session Detail & Sub-agent Orchestration

Each session opens into a tabbed detail view. When the agent spawns sub-agents (Explore, Read, or task workers), each gets its own tab with its own message thread:

```
 Main │ 📖 Plan ● │ ☑ Todos │ ≡ Read · explore-cmt-job-flow ● │ ≡ Read · explore-cmt-entities ●
──────┴───────────┴─────────┴──────────────────────────────────┴──────────────────────────────────

 ⚠ Waiting for your approval · Review the plan below and approve or reject it in your terminal

 # API Gateway Evaluation Plan
 ──────────────────────────────
 ## Steps
   [✓] Research Apigee X capabilities and pricing model
   [✓] Research AWS API Gateway v2 — HTTP API tier
   [ ] Research Kong Gateway (Orbit team's existing deployment)
   [ ] Produce comparison matrix with weighted scoring
   [ ] Provide final recommendation with migration path

 ## Constraints
   › Must support OAuth 2.0 / OIDC natively
   › Monthly budget ceiling: $3,000
   › Zero-downtime migration required
```

Sub-agents run in parallel and are listed newest-first. A pulsing dot marks agents still running; a grey dot marks completed ones.

### Browser Notifications

Click **Enable notifications** in the header to receive desktop notifications when a session transitions to "Needs attention" or "Task complete" — even when the tab is in the background.

> **macOS:** If notifications don't appear, check **System Settings → Notifications → [your browser]** and ensure it's set to Alerts or Banners.

## Running without cloning (npx)

If the package is published to npm, anyone can run it with no installation step:

```bash
npx copiloting-agents
```

This downloads the pre-built package and starts the server at **http://localhost:3001**.

To use a different port:

```bash
PORT=8080 npx copiloting-agents
```

## Production mode (from source)

Run a single command after `npm install` — no `npm run dev`, no separate client server:

```bash
npm install   # one-time setup
npm start     # build + serve on http://localhost:3001
```

`npm start` compiles the TypeScript server, builds the Vite client, then launches Express which serves the built client as static files alongside the API. Everything runs on a single port.

### Manual build steps

If you want to build and start separately (e.g. in a container):

```bash
npm run build              # compiles server (tsc) + client (vite build)
node server/dist/index.js  # starts the server; client/dist/ is served automatically
```


## Project Structure

```
copiloting-agents/
├── server/          # Express API — reads ~/.copilot/session-state/
├── client/          # React + Vite + Tailwind CSS dashboard
└── docs/            # Architecture docs
    ├── client.md
    ├── server.md
    └── session-model.md
```

See [AGENTS.md](AGENTS.md) for development conventions.
