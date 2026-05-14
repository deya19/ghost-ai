# Progress Tracker



Update this file after every meaningful implementation

change.



## Current Phase



- In progress



## Current Goal

- 29-spec-ui-integration complete: Integrate spec generation results into editor sidebar with list, preview modal, and download



## Completed



- Boilerplate cleanup (globals.css, page.tsx, removed SVGs)

- Design System: shadcn/ui initialized with components (Button, Card, Dialog, Input, Tabs, Textarea, ScrollArea)

- Installed lucide-react

- Created lib/utils.ts with cn() helper

- Configured dark mode as default

- 02-editor-chrome: Editor Navbar, Project Sidebar, Dialog Pattern ready for future use

- 03-auth: Clerk integration with sign-in/sign-up pages, route protection, UserButton in navbar

- 04-project-dialogs: Editor home screen, Create/Rename/Delete dialogs, sidebar actions with mock data, mobile backdrop

- 05-prisma: Project/ProjectCollaborator schema, Prisma client singleton (pg adapter / Accelerate branch), migration applied

- 06-project-apis: REST endpoints for list/create/rename/delete projects with owner auth (401/403)

- 07-wire-editor-home: Editor home uses server-side project fetch; sidebar + dialogs wired to real project API; create navigates to workspace; rename/delete refresh/redirect

- 08-editor-workspace-shell: Server-side workspace access checks, AccessDenied state, active sidebar highlighting, project-name navbar actions, canvas placeholder, and AI sidebar placeholder

- 09-share-dialog: Share dialog with collaborator invite/remove, owner/collaborator permissions, Clerk user enrichment via /api/users/lookup

- 10-liveblocks-setup: liveblocks.config.ts with Presence/UserMeta types, cached Liveblocks node client, deterministic cursor color helper, POST /api/liveblocks-auth route with Clerk auth, project access verification, room creation, and user metadata token issuance
- 11-base-canvas: Collaborative React Flow canvas with LiveblocksProvider, RoomProvider, useLiveblocksFlow, shared canvas types, dot-pattern background, MiniMap, fitView, loose connections, cursors, and error/loading fallbacks
- 12-shape-panel: Floating pill-shaped shape toolbar with draggable rectangle/diamond/circle/pill/cylinder/hexagon icons, drag-and-drop node creation, custom canvasNode renderer with handles
- 13-node-shape: Proper shape rendering (CSS for rectangle/pill/circle, SVG for diamond/hexagon/cylinder), selected border highlighting, drag ghost preview
- 14-node-editing: NodeResizer with min 60x40 constraints and subtle dark handles, inline label editing on double-click with textarea overlay, blur/Escape close, nodrag/nopan on textarea, placeholder for empty labels
- 15-node-color-toolbar: Floating color toolbar above selected nodes with 8 predefined bg/text color pairs, swatch selection updates node background and text color via updateNodeData, active swatch indicator, nodrag/nopan on toolbar
- 16-edge-behavior: Custom canvas edge renderer with right-angle routing (getSmoothStepPath), arrowhead marker, dimmed/rest brightened on hover/selected, invisible wider hit area, inline label editing via EdgeLabelRenderer at path midpoint, pill badge labels with faint hint when empty, four-side connection handles on nodes (subtle white dots, hover-fade)
- 17-canvas-ergonomics: Floating pill-shaped control bar at bottom-left with zoom (in/out/fit), undo/redo wired to Liveblocks history, disabled buttons dimmed when no history, thin divider between zoom and history groups, keyboard shortcuts (+/= zoom in, - zoom out, Ctrl/Cmd+Z undo, Ctrl/Cmd+Shift+Z/Ctrl+Y redo) via useKeyboardShortcuts hook that ignores shortcuts while typing in editable fields
- 18-starter-templates: CanvasTemplate type and CANVAS_TEMPLATES array (microservices, CI/CD pipeline, event-driven system), StarterTemplatesModal with 3-column scrollable grid and lightweight SVG previews (bounds-fit, shape-aware, edge lines), two-step flow (select → confirm), import adds template nodes/edges on top of existing canvas via addNodes/addEdges + fitView, navbar LayoutTemplate button, kept inside existing collaborative canvas state
- 19-presence-avatars-cursors: Presence type with cursor/position and thinking flag, live cursor broadcast via ReactFlow onMouseMove/onMouseLeave, Cursors component renders other participants' pointers with name badges, PresenceAvatars component in top-right corner of canvas showing up to 5 collaborator avatars with overflow chip, initials fallback, dark ring border, filtered to exclude current Clerk user, divider between collaborators and Clerk UserButton, navbar unchanged
- 20-ai-sidebar-shell: Extracted AI sidebar into its own AiSidebar component with open/close state controlled by parent, preserved floating slide-in behavior from the right, added header with "AI Workspace" title, bot icon, and close button, added shadcn Tabs with AI Architect and Specs tabs using active accent styling, AI Architect tab includes scrollable chat area with demo messages (user right-aligned with brand-dim styling, assistant left-aligned with elevated card styling), empty state with starter prompt chips, auto-resizing textarea input with Enter-to-send and Shift+Enter newline, send button with primary accent styling, Specs tab includes Generate Spec button and static demo spec card with file icon, title, snippet, and disabled download action
- 21-canvas-autosave: Installed @vercel/blob, reused existing Project.canvasJsonPath field for blob URL storage, created PUT /api/projects/[projectId]/canvas route that uploads canvas JSON to Vercel Blob and stores URL in Prisma, created GET /api/projects/[projectId]/canvas route that fetches saved canvas JSON from blob URL (owner + collaborator access via getAccessibleProject), created useCanvasAutosave hook that watches nodes/edges, debounces saves with 3s delay, tracks saving/saved/error status using useMemo + useState (no ref mutations during render), loads saved canvas on mount only if Liveblocks room is empty (hasLoadedRef guard), added save status indicator to CanvasControlBar (spinner + Saving, check + Saved, alert + Error)
- 22-design-agent-api: Added TaskRun Prisma model (runId unique, projectId, userId, createdAt, indexes on runId and userId+projectId), created POST /api/ai/design route that verifies project access, triggers design-agent task via Trigger.dev tasks.trigger(), persists TaskRun record, and returns runId, created POST /api/ai/design/token route that verifies TaskRun ownership and generates a run-scoped public token via triggerAuth.createPublicToken(), stripped trigger/design-agent.ts to minimal task that logs payload and echoes it back (no AI logic yet)
- 23-design-agent-logic: Updated liveblocks.config.ts with RoomEvent types for ai-status and ai-cursor events. Rewrote trigger/design-agent.ts with full AI integration: uses Gemini via @ai-sdk/google with generateText and tool-calling, defines canvas tools (addNode, moveNode, resizeNode, updateNodeData, deleteNode, addEdge, deleteEdge, finalizeDesign), reads existing canvas state via getStorageDocument, generates architecture from user prompt, applies mutations via mutateStorage using existing collaborative flow, broadcasts status messages via broadcastEvent at start/thinking/complete/error steps, sets AI presence (thinking state) via setPresence, clears presence on finish, handles errors gracefully without breaking canvas
- 24-ai-presence-state: Created types/tasks.ts with AiStatusFeedPayload schema and isValidAiStatusPayload validator. Updated liveblocks.config.ts to add optional text field to ai-status RoomEvent. Restructured canvas.tsx and workspace-layout.tsx so AiSidebar renders inside RoomProvider (required for Liveblocks hooks). Updated AiSidebar with useEventListener to subscribe to ai-status events, validated payloads, tracks latest status, shows shared AI status indicator bar (spinner + message during generation, static message after), disables textarea and shows loading spinner on send button during generation, disables starter chips during generation, keeps rest of sidebar fully usable. Updated LiveCursors to show Loader2 spinner in name badge when other.presence.thinking is true
- 25-sidebar-chat-feed: Added AiChatMessagePayload schema (sender, role, content, timestamp) and isValidAiChatMessage validator to types/tasks.ts. Updated AiSidebar to use Liveblocks ai-chat feed: subscribes via useFeedMessages, sends messages via useCreateFeedMessage with current user name from useSelf, validates all feed messages before rendering, shows sender name and formatted timestamp above each bubble, displays send errors inline below input with AlertCircle icon, keeps starter chips as empty state when no messages, keeps ai-status indicator separate from chat feed
- 26-ai-chat-functional: Updated POST /api/ai/design route to generate and return a run-scoped publicToken alongside runId. Passed roomId prop to AiSidebar from canvas.tsx. Rewrote AiSidebar with useRealtimeRun from @trigger.dev/react-hooks (via RunTracker child component) to track task run status in real time. On submit: pushes user message to ai-chat feed, calls /api/ai/design, stores runId + publicToken, RunTracker monitors run and calls handleRunComplete on COMPLETED/FAILED/CANCELED. handleRunComplete pushes AI completion or error message to ai-chat and resets run state. isGenerating derived from isSubmitting + ai-status events. Disabled chat input and send button during active runs. Send button shows spinner while generating. Updated chat bubble colors: user messages use green accent bg (#62C073) with dark text, AI messages use dark bg (#18181c) with light text. Status strip shows compact dark bar with green accent (#62C073) spinner and text only during active runs. Errors from the API are pushed as assistant messages in the ai-chat feed
- Bug fix (setLocal error): Fixed `node.setLocal is not a function` runtime error caused by the design agent storing React Flow local-only properties (`selected`, `dragging`, `measured`, `resizing` on nodes; `selected` on edges) in Liveblocks shared storage via `mutateStorage`. These properties should only exist as local client state, not shared CRDT state. Updated `trigger/design-agent.ts` to import `LiveObject` from `@liveblocks/node`, wrap all nodes and edges in `LiveObject`, wrap nested `data` and `style` objects in `LiveObject`, and remove all local-only properties from the stored shape. Updated `resizeNode` tool to mutate `style.width`/`style.height` to match the new node structure. Also updated `canvas.tsx` autosave load logic to strip local-only properties from loaded nodes and edges before calling `addNodes`/`addEdges`, preventing stale saved data from re-introducing the issue. Additionally, added client-side storage cleanup mutation in `canvas.tsx` that detects corrupted nodes/edges stored as `LiveRegister` (from the old design agent passing plain objects to `LiveMap.set`) and converts them to proper `LiveObject`s with `new LiveObject()`. Wrapped `onNodesChange` and `onEdgesChange` in try-catch handlers to gracefully ignore `setLocal` errors during the cleanup transition. Removed incorrect `initialStorage={{ nodes: [] }}` from `RoomProvider` since `useLiveblocksFlow` handles initialization itself
- 27-spec-generation-flow: Created `POST /api/ai/spec` route that accepts `roomId`, `chatHistory`, `nodes`, `edges`, authenticates the user, resolves project access from `roomId` (not trusting client-supplied projectId), triggers the `generate-spec` task via Trigger.dev, persists a `TaskRun` record in Prisma for ownership/access control, and returns the `runId`. Created `POST /api/ai/spec/token` route that accepts `runId`, authenticates the user, verifies the `TaskRun` belongs to the requesting user, issues a Trigger.dev public access token scoped to that run with 1-hour expiration, and returns the token. Created `trigger/generate-spec.ts` task that validates input with Zod (`projectId`, `roomId`, `chatHistory`, `nodes`, `edges`, `userId`), uses Gemini via `@ai-sdk/google` and `generateText` to generate a Markdown technical spec from the canvas architecture and chat context, builds a structured prompt with node/edge descriptions and chat history, and returns the generated spec content as task output. Follows existing auth, Prisma, Trigger.dev, and Gemini patterns
- 28-spec-persistence-download: Added `ProjectSpec` Prisma model with `id`, `projectId` (relation to Project with `onDelete: Cascade`), `filePath`, `createdAt` and `@@index([projectId, createdAt])`. Updated `trigger/generate-spec.ts` to upload generated Markdown to Vercel Blob with private access and `text/markdown` content type, then persist metadata via `prisma.projectSpec.create()` linking the Blob URL to the project. The task output now includes `specId` and `filePath` alongside the spec content. Created `GET /api/projects/[projectId]/specs/[specId]/download` route that authenticates the user via Clerk, verifies project access with `getAccessibleProject`, validates the spec belongs to the requested project, fetches the file from Vercel Blob using `BLOB_READ_WRITE_TOKEN`, and returns it as a downloadable Markdown attachment with `Content-Disposition: attachment; filename="spec-{specId}.md"`. Properly handles 401 (unauthenticated), 403 (forbidden/denied), 404 (not found), and 500 (blob fetch failure) cases. Database schema synced via `prisma db push`
- 29-spec-ui-integration: Created `GET /api/projects/[projectId]/specs` list endpoint that authenticates the user, verifies project access with `getAccessibleProject`, queries `prisma.projectSpec.findMany` ordered by `createdAt desc`, and returns metadata (id, projectId, filePath, createdAt). Installed `react-markdown` and `remark-gfm` for Markdown rendering. Updated `components/editor/ai-sidebar.tsx` Specs tab: replaced static demo card with dynamic spec list fetched from the new endpoint on mount, shows loading spinner during fetch, empty state with FileText icon when no specs exist. Each spec item displays a generated filename (`Spec {date}`) and timestamp, with eye (preview) and download icon buttons. Preview opens a shadcn Dialog that fetches the spec content via the download endpoint and renders it with `ReactMarkdown` using `remark-gfm` inside a `prose prose-sm prose-invert` styled container within a `ScrollArea`. Download triggers a browser file download via a temporary anchor element pointing to the download endpoint. Added `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle` imports from `@/components/ui/dialog`, `Eye` icon from `lucide-react`, and `ReactMarkdown`/`remarkGfm` imports. Kept existing sidebar layout and tabs unchanged per scope limits



## Next Up

- 30-generate-spec-trigger: Wire AI sidebar Generate Spec button to POST /api/ai/spec, track run with useRealtimeRun, refresh spec list on completion



## Open Questions



- None



## Architecture Decisions



- [Decisions made that affect the system design or

  data model — include why the decision was made]



## Session Notes

- 08-editor-workspace-shell intentionally excludes canvas, Liveblocks, sharing behavior, and real AI chat per feature spec.
- Trigger.dev installed: `@trigger.dev/sdk` + `@trigger.dev/build`, `trigger.config.ts` created, `trigger/` dir with example task, `npm run trigger:dev` script added. Pending: user must set TRIGGER_SECRET_KEY env var and update project ref in config.

