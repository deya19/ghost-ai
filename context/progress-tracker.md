# Progress Tracker



Update this file after every meaningful implementation

change.



## Current Phase



- In progress



## Current Goal

- 10-liveblocks-setup complete: realtime auth endpoint ready for workspace integration



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



## Next Up

- 22-ai-generation: AI architecture generation from natural language prompts



## Open Questions



- None



## Architecture Decisions



- [Decisions made that affect the system design or

  data model — include why the decision was made]



## Session Notes



- 08-editor-workspace-shell intentionally excludes canvas, Liveblocks, sharing behavior, and real AI chat per feature spec.

