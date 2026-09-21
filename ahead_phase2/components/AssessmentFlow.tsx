"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { AssessmentAnswers, LearningPreferences } from "@/lib/types";

const steps = [
  { id: "careerStage", type: "single", title: "First, where are you now?", lead: "Pick the option that best describes your current career stage.", options: ["Student","Early career / graduate","Individual contributor","Manager","Senior Manager / Head of","Director / VP","Executive / C-suite","Founder / business owner"] },
  { id: "jobBasics", type: "form", title: "Tell us about your current work.", lead: "We care more about what you actually do than the wording on your job description." },
  { id: "aiFrequency", type: "single", title: "How much is AI already part of your work?", lead: "No judgement — we want an accurate starting point.", options: ["Never used it","Tried it a few times","A few times a month","A few times a week","Every day","AI is embedded into how I work"] },
  { id: "aiActivities", type: "multi", title: "What have you actually done with AI?", lead: "Pick everything you’ve genuinely done — not what you think you should have done.", options: ["Asked ChatGPT / Claude questions","AI writing / rewriting","Research","Document analysis","Spreadsheet / data analysis","Reusable prompts","Automations","Zapier / Make / n8n","AI coding","Python / SQL / code","APIs","AI agents","Built an app / product"] },
  { id: "technicalSkills", type: "multi", title: "What can you currently use confidently?", lead: "This helps us avoid teaching you tools you already know — or pushing you into technical skills you don’t need.", options: ["Excel / Google Sheets","Advanced spreadsheets","Power BI / Tableau","SQL","Python","JavaScript / TypeScript","APIs","Automation tools","CRM / business systems","CAD","MATLAB","None yet"] },
  { id: "technicalDepth", type: "single", title: "How technical do you want to become?", lead: "You don’t need to become a developer unless your career actually benefits from it.", options: ["Use AI brilliantly without becoming technical","Learn enough technical skills to build useful things","Build automations and simple products","Become highly technical","You tell me what my career actually needs"] },
  { id: "careerGoal", type: "goal", title: "Now forget your current job for a second.", lead: "In 2–5 years, what would you love to be doing?" },
  { id: "priorities", type: "multiLimit", limit: 3, title: "What matters most to you?", lead: "Choose up to three.", options: ["Earn more","Get promoted","Change careers","Future-proof myself","Become exceptional at my current job","Become more technical","Build things","Lead bigger teams","Own revenue / P&L","Start a business","Build AI products","Build a stronger CV / portfolio","Prepare for graduate roles"] },
  { id: "gaps", type: "multiLimit", limit: 5, title: "Where do you currently feel least confident?", lead: "Ahead may challenge this if we think something else matters more.", options: ["Understanding AI","Using AI effectively","Automation / agents","Technical skills","Data analysis","Commercial / finance","Product thinking","Strategy","Leadership","Communication","Customer / sales","Domain expertise","Building things","Career direction"] },
  { id: "learning", type: "learning", title: "Let’s make this realistic.", lead: "A plan only works if it fits your actual life." },
  { id: "cvIntent", type: "single", title: "Want Ahead to understand you properly?", lead: "CV upload lands in the next build. For now, tell us whether you’d use it.", options: ["Yes — I’d upload my CV","Maybe","No"] },
  { id: "outcome", type: "outcome", title: "One last thing.", lead: "If the next 10 weeks worked brilliantly, what would be different for you at the end?" },
] as const;

const initialLearning: LearningPreferences = { minutes: "60 minutes", days: "7", styles: ["Learning by doing"], intensity: "Challenge me" };

export default function AssessmentFlow() {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<AssessmentAnswers>(() => {
    if (typeof window === "undefined") return {};
    try { return JSON.parse(localStorage.getItem("aheadAssessment") || "{}"); } catch { return {}; }
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const step = steps[index];
  const progress = Math.round((index / steps.length) * 100);

  function commit(next: AssessmentAnswers) {
    setAnswers(next);
    localStorage.setItem("aheadAssessment", JSON.stringify(next));
  }

  function setSingle(id: keyof AssessmentAnswers, value: string) {
    commit({ ...answers, [id]: value });
  }

  function toggleArray(id: "aiActivities" | "technicalSkills" | "priorities" | "gaps", value: string, limit?: number) {
    const current = answers[id] || [];
    const exists = current.includes(value);
    let next = exists ? current.filter((x) => x !== value) : [...current, value];
    if (limit && next.length > limit) return;
    commit({ ...answers, [id]: next });
  }

  function updateLearning(patch: Partial<LearningPreferences>) {
    commit({ ...answers, learning: { ...(answers.learning || initialLearning), ...patch } });
  }

  function toggleStyle(style: string) {
    const current = answers.learning?.styles || initialLearning.styles;
    const next = current.includes(style) ? current.filter((x) => x !== style) : [...current, style];
    updateLearning({ styles: next });
  }

  const canContinue = useMemo(() => {
    if (step.id === "careerStage") return !!answers.careerStage;
    if (step.id === "jobBasics") return !!answers.jobBasics?.jobTitle && !!answers.jobBasics?.actualWork;
    if (step.id === "aiFrequency") return !!answers.aiFrequency;
    if (step.id === "aiActivities") return (answers.aiActivities?.length || 0) > 0;
    if (step.id === "technicalSkills") return (answers.technicalSkills?.length || 0) > 0;
    if (step.id === "technicalDepth") return !!answers.technicalDepth;
    if (step.id === "careerGoal") return !!answers.careerGoal?.goalText;
    if (step.id === "priorities") return (answers.priorities?.length || 0) > 0;
    if (step.id === "gaps") return (answers.gaps?.length || 0) > 0;
    if (step.id === "learning") return true;
    if (step.id === "cvIntent") return !!answers.cvIntent;
    if (step.id === "outcome") return !!answers.outcome && answers.outcome.trim().length > 20;
    return true;
  }, [answers, step.id]);

  async function next() {
    if (!canContinue || busy) return;
    if (index < steps.length - 1) {
      setIndex(index + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setBusy(true);
    setError("");
    try {
      localStorage.setItem("aheadAssessment", JSON.stringify(answers));
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assessment: answers }),
      });
      // The server can reply with a non-JSON error page (for example a Vercel
      // timeout), so read the body as text first and surface it usefully
      // instead of failing with an opaque JSON parse error.
      const body = await response.text();
      let payload: { error?: string } & Record<string, unknown>;
      try {
        payload = JSON.parse(body);
      } catch {
        if (response.status === 504 || /timed? ?out/i.test(body)) {
          throw new Error(
            "The server timed out while building your plan. Your answers are saved — please press the button again."
          );
        }
        throw new Error(
          `The server returned an unexpected response (${response.status}). ${body.slice(0, 160)}`
        );
      }
      if (!response.ok) throw new Error(payload.error || "We couldn’t build your plan.");
      localStorage.setItem("aheadGeneratedPlan", JSON.stringify(payload));
      router.push("/results");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setBusy(false);
    }
  }

  function previous() {
    if (index > 0 && !busy) setIndex(index - 1);
  }

  return (
    <>
      {busy ? <Generating /> : (
        <main className="assessment-wrap">
          <div className="progress-wrap">
            <div className="progress-meta"><span>Step {index + 1} of {steps.length}</span><span>{progress}%</span></div>
            <div className="progress"><div style={{ width: `${progress}%` }} /></div>
          </div>

          <section className="question-card">
            <h1>{step.title}</h1>
            <p className="lead">{step.lead}</p>

            {(step.type === "single") && (
              <div className="options">
                {step.options?.map((option) => {
                  const selected = answers[step.id as keyof AssessmentAnswers] === option;
                  return <button key={option} className={`option ${selected ? "selected" : ""}`} onClick={() => setSingle(step.id as keyof AssessmentAnswers, option)}><span>{option}</span>{selected && <strong>✓</strong>}</button>;
                })}
              </div>
            )}

            {(step.type === "multi" || step.type === "multiLimit") && (
              <div className="options">
                {step.options?.map((option) => {
                  const id = step.id as "aiActivities" | "technicalSkills" | "priorities" | "gaps";
                  const selected = (answers[id] || []).includes(option);
                  return <button key={option} className={`option ${selected ? "selected" : ""}`} onClick={() => toggleArray(id, option, "limit" in step ? step.limit : undefined)}><span>{option}</span>{selected && <strong>✓</strong>}</button>;
                })}
              </div>
            )}

            {step.type === "form" && (
              <>
                <div className="field"><label>Job title</label><input className="input" value={answers.jobBasics?.jobTitle || ""} onChange={(e) => commit({ ...answers, jobBasics: { jobTitle: e.target.value, industry: answers.jobBasics?.industry || "", actualWork: answers.jobBasics?.actualWork || "" } })} placeholder="e.g. Operations Manager" /></div>
                <div className="field"><label>Industry</label><input className="input" value={answers.jobBasics?.industry || ""} onChange={(e) => commit({ ...answers, jobBasics: { jobTitle: answers.jobBasics?.jobTitle || "", industry: e.target.value, actualWork: answers.jobBasics?.actualWork || "" } })} placeholder="e.g. Technology, healthcare, construction" /></div>
                <div className="field"><label>What do you actually spend most of your time doing?</label><textarea value={answers.jobBasics?.actualWork || ""} onChange={(e) => commit({ ...answers, jobBasics: { jobTitle: answers.jobBasics?.jobTitle || "", industry: answers.jobBasics?.industry || "", actualWork: e.target.value } })} placeholder="Skip the formal job description. Tell us what your week actually looks like." /><div className="helper">Specific examples give Ahead much better signal than a polished job description.</div></div>
              </>
            )}

            {step.type === "goal" && (
              <>
                <div className="field"><label>In 2–5 years, what would you love to be doing?</label><textarea value={answers.careerGoal?.goalText || ""} onChange={(e) => commit({ ...answers, careerGoal: { goalText: e.target.value, targetRole: answers.careerGoal?.targetRole || "" } })} placeholder="Think about the work, responsibility, money, freedom or impact you want — not just the title." /></div>
                <div className="field"><label>Specific target role (optional)</label><input className="input" value={answers.careerGoal?.targetRole || ""} onChange={(e) => commit({ ...answers, careerGoal: { goalText: answers.careerGoal?.goalText || "", targetRole: e.target.value } })} placeholder="e.g. General Manager, CMO, Engineering Lead" /></div>
              </>
            )}

            {step.type === "learning" && (
              <>
                <div className="field"><label>Time per day</label><select className="input" value={answers.learning?.minutes || initialLearning.minutes} onChange={(e) => updateLearning({ minutes: e.target.value })}>{["30 minutes","45 minutes","60 minutes","90 minutes"].map((x) => <option key={x}>{x}</option>)}</select></div>
                <div className="field"><label>Days per week</label><select className="input" value={answers.learning?.days || initialLearning.days} onChange={(e) => updateLearning({ days: e.target.value })}>{["3","4","5","6","7"].map((x) => <option key={x}>{x}</option>)}</select></div>
                <div className="field"><label>How do you learn best?</label><div className="options">{["Learning by doing","Building projects","Reading","Videos","Exercises / quizzes","Talking things through with AI","Real work examples"].map((x) => { const selected=(answers.learning?.styles || initialLearning.styles).includes(x); return <button key={x} className={`option ${selected ? "selected" : ""}`} onClick={() => toggleStyle(x)}><span>{x}</span>{selected && <strong>✓</strong>}</button>; })}</div></div>
                <div className="field"><label>How hard should we push you?</label><select className="input" value={answers.learning?.intensity || initialLearning.intensity} onChange={(e) => updateLearning({ intensity: e.target.value })}>{["Start gently","Challenge me","Push me hard"].map((x) => <option key={x}>{x}</option>)}</select></div>
              </>
            )}

            {step.type === "outcome" && (
              <div className="field"><label>If this worked brilliantly...</label><textarea value={answers.outcome || ""} onChange={(e) => commit({ ...answers, outcome: e.target.value })} placeholder="e.g. I’d understand AI properly, have built useful things myself and feel credible moving into a broader operating role." /><div className="helper">This becomes an explicit outcome constraint for your programme.</div></div>
            )}

            {error && <div className="error-box">{error}</div>}
            <div className="actions">
              <button className="secondary-btn" onClick={previous} disabled={index === 0}>← Back</button>
              <button className="primary-btn" onClick={next} disabled={!canContinue}>{index === steps.length - 1 ? "Build my Ahead plan →" : "Continue →"}</button>
            </div>
          </section>
        </main>
      )}
    </>
  );
}

function Generating() {
  return (
    <main className="loading-page">
      <div className="loading-orb" />
      <h1>Building your path Ahead.</h1>
      <p className="lead muted-copy">We’re diagnosing the gap, then building the 10-week architecture around it.</p>
      <div className="loading-list">
        <div className="loading-item done">Understanding where you are…</div>
        <div className="loading-item done">Working out where you’re heading…</div>
        <div className="loading-item">Finding the gaps that actually matter…</div>
        <div className="loading-item">Ignoring skills you don’t need…</div>
        <div className="loading-item">Building your 10-week path…</div>
      </div>
    </main>
  );
}
