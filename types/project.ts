export interface Project {
  id: string
  name: string
  ownerId: string
  description: string | null
  status: "DRAFT" | "ARCHIVED"
  canvasJsonPath: string | null
  createdAt: Date
  updatedAt: Date
}
