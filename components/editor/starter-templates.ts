import type { CanvasNode, CanvasEdge } from "@/types/canvas"

export interface CanvasTemplate {
  id: string
  name: string
  description: string
  nodes: CanvasNode[]
  edges: CanvasEdge[]
}

function n(
  id: string,
  x: number,
  y: number,
  label: string,
  shape: string,
  color: string,
  bgColor: string,
  textColor: string,
  w: number,
  h: number
): CanvasNode {
  return {
    id,
    type: "canvasNode",
    position: { x, y },
    data: { label, color, shape, bgColor, textColor },
    style: { width: w, height: h },
  }
}

function e(id: string, source: string, target: string): CanvasEdge {
  return { id, source, target, type: "canvasEdge", data: {} }
}

export const CANVAS_TEMPLATES: CanvasTemplate[] = [
  {
    id: "microservices",
    name: "Microservice Architecture",
    description:
      "API gateway pattern with service decomposition and dedicated data stores.",
    nodes: [
      n("api-gw",      300,  20, "API Gateway",     "rectangle", "#52A8FF", "#10233D", "#52A8FF", 160, 70),
      n("auth-svc",     20, 160, "Auth Service",     "pill",      "#BF7AF0", "#2E1938", "#BF7AF0", 140, 70),
      n("user-svc",    220, 160, "User Service",     "rectangle", "#62C073", "#0F2E18", "#62C073", 140, 70),
      n("order-svc",   440, 160, "Order Service",    "rectangle", "#FF990A", "#331B00", "#FF990A", 140, 70),
      n("pay-svc",     660, 160, "Payment Service",  "rectangle", "#F75F8F", "#3A1726", "#F75F8F", 140, 70),
      n("user-db",     260, 320, "User DB",          "cylinder",  "#EDEDED", "#1F1F1F", "#EDEDED", 120, 80),
      n("order-db",    480, 320, "Order DB",         "cylinder",  "#EDEDED", "#1F1F1F", "#EDEDED", 120, 80),
    ],
    edges: [
      e("e1", "api-gw", "auth-svc"),
      e("e2", "api-gw", "user-svc"),
      e("e3", "api-gw", "order-svc"),
      e("e4", "api-gw", "pay-svc"),
      e("e5", "user-svc", "user-db"),
      e("e6", "order-svc", "order-db"),
    ],
  },
  {
    id: "cicd",
    name: "CI/CD Pipeline",
    description:
      "Continuous integration and deployment flow from source code to production.",
    nodes: [
      n("source",  40, 160, "Source Code", "rectangle", "#52A8FF", "#10233D", "#52A8FF", 130, 70),
      n("build",  230, 160, "Build",       "rectangle", "#0AC7B4", "#062822", "#0AC7B4", 120, 70),
      n("test",   420, 120, "Test",        "diamond",   "#62C073", "#0F2E18", "#62C073", 110, 110),
      n("deploy", 590, 160, "Deploy",      "rectangle", "#FF990A", "#331B00", "#FF990A", 120, 70),
      n("prod",   780, 160, "Production",  "circle",    "#FF6166", "#3C1618", "#FF6166", 100, 100),
    ],
    edges: [
      e("e1", "source", "build"),
      e("e2", "build",  "test"),
      e("e3", "test",   "deploy"),
      e("e4", "deploy", "prod"),
    ],
  },
  {
    id: "event-driven",
    name: "Event-Driven System",
    description:
      "Producer–consumer pattern with a central message broker and event store.",
    nodes: [
      n("producer",   40, 200, "Producer",   "rectangle", "#52A8FF", "#10233D", "#52A8FF", 130, 70),
      n("broker",    280, 200, "Event Bus",  "pill",      "#BF7AF0", "#2E1938", "#BF7AF0", 150, 70),
      n("consumer-a",520, 100, "Consumer A", "rectangle", "#62C073", "#0F2E18", "#62C073", 130, 70),
      n("consumer-b",520, 300, "Consumer B", "rectangle", "#0AC7B4", "#062822", "#0AC7B4", 130, 70),
      n("store",     300, 360, "Event Store","cylinder",  "#EDEDED", "#1F1F1F", "#EDEDED", 130, 80),
    ],
    edges: [
      e("e1", "producer",   "broker"),
      e("e2", "broker",     "consumer-a"),
      e("e3", "broker",     "consumer-b"),
      e("e4", "broker",     "store"),
    ],
  },
]
