"use client";

import { useState, type FormEvent } from "react";
import { modelPlanSchema, type Plan } from "../lib/contracts";

export default function Home() {
  const [plan, setPlan] = useState<Plan | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [reflection, setReflection] = useState("");

  async function generate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setBusy(true); setMessage(""); setPlan(null); setReflection("");
    try {
      const response = await fetch("/api/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          minutes: Number(form.get("minutes")),
          space: form.get("space"), goal: form.get("goal"), mobility: form.get("mobility"),
        }),
        signal: AbortSignal.timeout(130000),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Generation failed.");
      setPlan(data as Plan);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Something went wrong.");
    } finally { setBusy(false); }
  }

  function save() {
    if (!plan) return;
    try {
      localStorage.setItem("stepout:last", JSON.stringify({ plan, reflection }));
      setMessage("Saved in this browser. Download the card to take it outside.");
    } catch { setMessage("Browser storage is unavailable. Download the card instead."); }
  }

  function load() {
    try {
      const saved = localStorage.getItem("stepout:last");
      if (!saved) { setMessage("No saved plan in this browser yet."); return; }
      const value = JSON.parse(saved);
      const { minutes, phases, model, elapsedMs, ...core } = value.plan;
      modelPlanSchema.parse(core);
      if (!Number.isFinite(minutes) || !Array.isArray(phases) ||
          !phases.every((p) => typeof p.label === "string" && Number.isFinite(p.minutes)) ||
          typeof model !== "string" || !Number.isFinite(elapsedMs)) throw new Error("Invalid saved plan");
      setPlan(value.plan as Plan);
      setReflection(typeof value.reflection === "string" ? value.reflection : "");
      setMessage("Loaded your saved plan.");
    } catch { setMessage("Could not read the saved plan. Generate a new one."); }
  }

  function download() {
    if (!plan) return;
    const text = ["STEP OUT", plan.title, `Total: ${plan.minutes} minutes`,
      ...plan.phases.map((p) => `${p.minutes} min: ${p.label}`),
      "", plan.instruction, "", "Use a familiar suitable outdoor spot. Check conditions yourself.",
      "", plan.reflection, reflection].join("\n");
    const url = URL.createObjectURL(new Blob([text], { type: "text/plain;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url; link.download = "step-out-activity.txt";
    document.body.appendChild(link); link.click(); link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return <main>
    <header>
      <img
        src="/brand/step-out-logo-transparent.png"
        alt="Step Out"
        style={{ width: 220, height: "auto", marginBottom: 12 }}
      />
      <h1>A little outside time, around your real life.</h1>
      <p>Choose your time and a familiar outdoor space. Get one short plan, then put your screen away.</p>
    </header>
    <form onSubmit={generate}>
      <fieldset disabled={busy}>
        <legend>Plan your break</legend>
        <label htmlFor="minutes">How much time do you have?</label>
        <select id="minutes" name="minutes" defaultValue="10">
          {[5, 10, 15, 20].map((n) => <option key={n} value={n}>{n} minutes</option>)}
        </select>
        <label htmlFor="space">Which familiar outdoor space can you use?</label>
        <select id="space" name="space">
          <option value="compound">My compound or courtyard</option>
          <option value="street">A familiar street</option>
          <option value="seating">An outdoor seating area</option>
        </select>
        <label htmlFor="goal">What would you like?</label>
        <select id="goal" name="goal"><option value="quiet">A quiet pause</option>
          <option value="movement">Some gentle movement</option><option value="notice">Notice my surroundings</option></select>
        <label htmlFor="mobility">How would you like to do it?</label>
        <select id="mobility" name="mobility"><option value="walking">Walking or standing is comfortable</option>
          <option value="seated">Keep the activity seated</option></select>
        <p className="small">Choose somewhere you can reach within one minute. The app does not check weather, traffic or access.</p>
        <button type="submit">{busy ? "Creating your plan…" : "Plan my break"}</button>
      </fieldset>
    </form>
    <p role="status" aria-live="polite">{message || (busy ? "Your computer is generating the plan. The first request may take longer." : "")}</p>
    <button className="secondary" onClick={load} disabled={busy}>Load saved plan</button>
    {plan && <section className="card" aria-labelledby="plan-title">
      <p className="small">{plan.minutes} minute outdoor break</p><h2 id="plan-title">{plan.title}</h2>
      <ol>{plan.phases.map((phase) => <li key={phase.label}><strong>{phase.minutes} min</strong> — {phase.label}</li>)}</ol>
      <p>{plan.instruction}</p>
      <p>Use a familiar suitable spot and check conditions yourself. Download your card, then put the screen away.</p>
      <div className="actions"><button onClick={save}>Save in this browser</button>
        <button className="secondary" onClick={download}>Download card</button></div>
      <details><summary>When you return</summary><label htmlFor="reflection">{plan.reflection}</label>
        <textarea id="reflection" value={reflection} onChange={(e) => setReflection(e.target.value)} maxLength={1000} />
        <button onClick={save}>Save reflection</button></details>
      <details><summary>Generation details</summary><p className="small">Model: {plan.model}. Request time: {(plan.elapsedMs / 1000).toFixed(1)} seconds.</p></details>
    </section>}
    <footer><p>For outdoor spaces you already know. No account or exact location required.</p></footer>
  </main>;
}
