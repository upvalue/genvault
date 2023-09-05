import { z } from "zod";

export const workspaceProperties = z.object({
  name: z.string(),
  description: z.string(),
});

export type WorkspaceProperties = z.infer<typeof workspaceProperties>;

export const imageProperties = z.object({
  backend: z.enum(["replicate"]),
  model: z.string(),
  modelVersion: z.string(),
  prompt: z.string(),
  imagePath: z.string(),
  generationUrl: z.string(),
  generatedAt: z.string(),
  tags: z.array(z.string()),
  workbook: z.boolean(),
});

export type ImageProperties = z.infer<typeof imageProperties>;
