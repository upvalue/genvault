import { z } from "zod";

export const sdSchema = z.object({
  prompt: z.string(),
});
