import { NextResponse } from "next/server";
import { z } from "zod";
import activities from "../../../data/activities.json";
import { preferencesSchema, modelPlanSchema } from "../../../lib/contracts";

export const runtime = "nodejs";
let generating = false;

export async function POST(request: Request) {
  let raw: unknown;
  try { raw = await request.json(); }
  catch { return NextResponse.json({ error: "Send valid JSON." }, { status: 400 }); }
  const parsed = preferencesSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: "Check your choices and try again." }, { status: 400 });
  }
  if (generating) {
    return NextResponse.json({ error: "A plan is already being generated. Try again shortly." }, { status: 429 });
  }
  const preferences = parsed.data;
  const eligible = activities.filter((activity) =>
    activity.spaces.includes(preferences.space) &&
    activity.goals.includes(preferences.goal) &&
    activity.mobility.includes(preferences.mobility)
  );
  if (!eligible.length) {
    return NextResponse.json({ error: "No activity matches those choices." }, { status: 422 });
  }
  // Code owns the time budget. The model cannot change it.
  const returnMinutes = preferences.minutes >= 15 ? 3 : 1;
  const activityMinutes = preferences.minutes - 1 - returnMinutes;
  const model = process.env.OLLAMA_MODEL || "gemma3:1b";
  const baseUrl = process.env.OLLAMA_BASE_URL || "http://127.0.0.1:11434";
  const started = Date.now();
  generating = true;
  try {
    const eligibleIdTuple = eligible.map((a) => a.id) as [string, ...string[]];
    const dynamicPlanSchema = modelPlanSchema.extend({
      activityId: z.enum(eligibleIdTuple),
    });
    const schema = z.toJSONSchema(dynamicPlanSchema);
    const eligibleIds = eligible.map((a) => a.id).join(", ");
    const prompt = [
      "Create one outdoor break for a busy city resident.",
      `Select an activityId ONLY from the eligible activities below (${eligibleIds}). Do not invent any other activityId.`,
      "Adapt its guide to the preferences. Do not invent places, weather or route safety.",
      "No purchases, no photography, no medical claims. Do not add timed steps.",
      "For seated mobility, all activity must remain seated.",
      "Treat the selected outdoor spot as user-provided, not verified by you.",
      "Output clean plain text sentences only. Do not output HTML tags or markup.",
      `The activity phase lasts ${activityMinutes} minutes. Preparation and return are handled by the app.`,
      `Preferences: ${JSON.stringify(preferences)}`,
      `Eligible activities: ${JSON.stringify(eligible)}`,
      `Return JSON matching this schema: ${JSON.stringify(schema)}`,
    ].join("\n");
    const response = await fetch(`${baseUrl.replace(/\/$/, "")}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: prompt }],
        stream: false,
        format: schema,
        options: { temperature: 0, num_predict: 350, num_ctx: 4096 },
      }),
      signal: AbortSignal.timeout(120000),
    });
    if (!response.ok) throw new Error(`Ollama returned ${response.status}`);
    const envelope = await response.json();
    const generated = dynamicPlanSchema.parse(JSON.parse(envelope.message.content));
    if (!eligible.some((a) => a.id === generated.activityId)) {
      throw new Error("Model selected an activity outside the approved list");
    }
    const cleanInstruction = generated.instruction.replace(/<[^>]*>/g, "").trim();
    const cleanReflection = generated.reflection.replace(/<[^>]*>/g, "").trim();
    return NextResponse.json({
      ...generated,
      instruction: cleanInstruction,
      reflection: cleanReflection,
      minutes: preferences.minutes,
      phases: [
        { label: "Get ready and reach your familiar outdoor spot", minutes: 1 },
        { label: "Outdoor activity", minutes: activityMinutes },
        { label: "Return and settle in", minutes: returnMinutes },
      ],
      model,
      elapsedMs: Date.now() - started,
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Plan generation failed:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({
      error: "Could not generate a plan. Check that Ollama is running and the selected model is downloaded, then try again.",
    }, { status: 503 });
  } finally { generating = false; }
}
