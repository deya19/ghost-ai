import { task } from "@trigger.dev/sdk/v3";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";
import { z } from "zod";
import { put } from "@vercel/blob";
import { prisma } from "@/lib/prisma";

const SpecInputSchema = z.object({
  projectId: z.string(),
  roomId: z.string(),
  chatHistory: z.array(
    z.object({
      sender: z.string(),
      role: z.enum(["user", "assistant"]),
      content: z.string(),
      timestamp: z.number().optional(),
    })
  ).optional().default([]),
  nodes: z.array(z.record(z.string(), z.any())).optional().default([]),
  edges: z.array(z.record(z.string(), z.any())).optional().default([]),
  userId: z.string(),
});

function buildSpecPrompt(params: {
  chatHistory: Array<{ sender: string; role: string; content: string }>;
  nodes: Array<Record<string, unknown>>;
  edges: Array<Record<string, unknown>>;
}): string {
  const nodeDescriptions = params.nodes
    .map((node, i) => {
      const data = (node.data as Record<string, unknown>) ?? {};
      const label = String(data.label ?? `Node ${i + 1}`);
      const shape = String(data.shape ?? "rectangle");
      return `- ${label} (${shape})`;
    })
    .join("\n");

  const edgeDescriptions = params.edges
    .map((edge) => {
      const source = String(edge.source ?? "?");
      const target = String(edge.target ?? "?");
      const label = (edge.data as Record<string, unknown>)?.label;
      return label
        ? `- ${source} → ${target} (${label})`
        : `- ${source} → ${target}`;
    })
    .join("\n");

  const chatContext = params.chatHistory
    .map((msg) => `${msg.sender} (${msg.role}): ${msg.content}`)
    .join("\n\n");

  return `You are Ghost AI, an expert technical writer that generates system architecture specifications.

Generate a comprehensive Markdown technical specification based on the following canvas architecture and chat context.

## Canvas Architecture

### Nodes (System Components)
${nodeDescriptions || "- No nodes on canvas"}

### Edges (Data Flow / Connections)
${edgeDescriptions || "- No edges on canvas"}

## Chat Context
${chatContext || "- No chat history provided"}

## Instructions

Write a professional technical specification that includes:

1. **Overview** — A high-level summary of the system (2-3 paragraphs)
2. **Architecture Diagram Description** — Describe the components and their relationships based on the nodes and edges
3. **Component Details** — For each major component, describe its responsibility, inputs, outputs, and any notable characteristics
4. **Data Flow** — Explain how data moves through the system, referencing the edges/connections
5. **Technology Recommendations** — Suggest appropriate technologies, frameworks, or patterns for implementing this architecture
6. **Scalability Considerations** — Brief notes on how this architecture can scale

Format the entire response as clean Markdown. Use proper headings (# ## ###), bullet points, and code blocks where appropriate. Do not include any conversational preamble or closing remarks — output only the spec document.`;
}

export const generateSpec = task({
  id: "generate-spec",
  retry: { maxAttempts: 2 },
  run: async (payload: unknown) => {
    const parseResult = SpecInputSchema.safeParse(payload);
    if (!parseResult.success) {
      console.error("[generate-spec] Invalid payload:", parseResult.error.flatten());
      throw new Error(`Invalid payload: ${parseResult.error.message}`);
    }

    const { chatHistory, nodes, edges } = parseResult.data;

    console.log("[generate-spec] Starting spec generation", {
      nodeCount: nodes.length,
      edgeCount: edges.length,
      chatMessageCount: chatHistory.length,
    });

    const google = createGoogleGenerativeAI({
      apiKey: process.env.GOOGLE_AI_API_KEY,
    });

    const prompt = buildSpecPrompt({ chatHistory, nodes, edges });

    try {
      const { text } = await generateText({
        model: google("gemini-2.5-flash"),
        system:
          "You are Ghost AI, an expert system architect and technical writer. You generate clean, professional Markdown technical specifications from system architecture diagrams and chat context. Be concise but thorough.",
        prompt,
      });

      console.log("[generate-spec] Spec generation completed", {
        outputLength: text.length,
      });

      // Upload spec to Vercel Blob
      const blobPath = `projects/${parseResult.data.projectId}/specs/${Date.now()}.md`;
      const blob = await put(blobPath, text, {
        access: "private",
        contentType: "text/markdown",
      });

      // Persist metadata in Prisma
      const specRecord = await prisma.projectSpec.create({
        data: {
          projectId: parseResult.data.projectId,
          filePath: blob.url,
        },
      });

      console.log("[generate-spec] Spec persisted to blob and Prisma", {
        specId: specRecord.id,
        blobUrl: blob.url,
      });

      return {
        spec: text,
        specId: specRecord.id,
        filePath: blob.url,
        generatedAt: Date.now(),
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error("[generate-spec] Spec generation or persistence failed:", message, err);
      throw new Error(`Spec generation failed: ${message}`);
    }
  },
});
