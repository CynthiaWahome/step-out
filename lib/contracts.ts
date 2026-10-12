import { z } from "zod";

export const preferencesSchema = z.object({
  minutes: z.union([z.literal(5), z.literal(10), z.literal(15), z.literal(20)]),
  space: z.enum(["compound", "street", "seating"]),
  goal: z.enum(["quiet", "movement", "notice"]),
  mobility: z.enum(["walking", "seated"]),
}).strict();

export const modelPlanSchema = z.object({
  activityId: z.string().min(1).max(40),
  title: z.string().min(1).max(80),
  instruction: z.string().min(20).max(650),
  reflection: z.string().min(5).max(180),
}).strict();

export type Preferences = z.infer<typeof preferencesSchema>;
export type Plan = z.infer<typeof modelPlanSchema> & {
  minutes: number;
  phases: { label: string; minutes: number }[];
  model: string;
  elapsedMs: number;
};
