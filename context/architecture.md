# Architecture Context

## Stack

| Layer | Technology | Role |
| :--- | :--- | :--- |
| Framework | Next.js 16 + TypeScript | Full-stack app with server/client boundaries |
| UI | Tailwind + shadcn/ui | Component composition and styling |
| Auth | Clerk | User identity and route protection |
| Database | Prisma + PostgreSQL | Relational metadata: projects, collaborators, specs, task runs |
| Canvas | Liveblocks + React Flow | Real-time collaborative canvas, presence, and cursors |
| Background tasks | Trigger.dev | Durable AI generation workflows |
| Artifact storage | Vercel Blob | Canvas snapshots and generated Markdown specs |

## System Boundaries

- `app/api` — Authenticated request handlers: input validation, ownership checks, task triggering, and persistence.
- `trigger` — Long-running background jobs: AI design generation and spec generation.
- `lib` — Shared infrastructure: Prisma client, access control helpers, and utilities.
- `components` — UI composition: canvas surfaces, sidebars, dialogs, and interactive elements.
- `prisma` — Database schema and generated client output.
- `data` — Legacy local directory. Not used for new artifacts.

## Storage Model

- **Database**: Metadata, ownership, relationships, and task run records. Project records, spec records, and task records belong in PostgreSQL.
- **Vercel Blob**: Generated artifacts — canvas snapshots at `canvas/{projectId}.json` and specs at `specs/{projectId}/{specId}.md`.
- **Reference**: The blob URL is stored in the database (`canvasJsonPath`, `filePath`) as the reference to the artifact.

## Auth and Collaboration Model

- Every project has a single owner (Clerk user ID).
- Projects can include additional collaborators.
- Only authenticated users can access protected routes.
- Only the owner or a collaborator can mutate project resources.
- Liveblocks room tokens are issued only after verifying project membership.

## Invariants

1. Request handlers do not run long-lived AI work — that belongs in background tasks.
2. Metadata and large generated artifacts are stored in separate layers.
3. Auth and ownership are enforced at every mutation boundary.
4. Client components are used only where browser interactivity or real-time state requires them.
5. The canvas schema must remain consistent between user-created content and imported templates.