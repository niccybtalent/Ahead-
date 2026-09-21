"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { AssessmentAnswers, GeneratedPlan } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";

export default function ResultsClient() {
  const [plan, setPlan] = useState<GeneratedPlan | null>(null);
  const [assessment, setAssessment] = useState<AssessmentAnswers | null>(null);
  const [saveState, setSaveState] = useState("");

  useEffect(() => {
    try {
      const storedPlan = localStorage.getItem("aheadGeneratedPlan");
      const storedAssessment = localStorage.getItem("aheadAssessment");
      if (storedPlan) setPlan(JSON.parse(storedPlan));
      if (storedAssessment) setAssessment(JSON.parse(storedAssessment));
    } catch {}
  }, []);

  async function savePlan() {
    if (!plan || !assessment) return;
    setSaveState("Saving…");
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        window.location.href = "/login?next=/results";
        return;
      }

      const { data: assessmentRow, error: assessmentError } = await supabase.from("assessments").insert({ user_id: user.id, answers: assessment }).select("id").single();
      if (assessmentError) throw assessmentError;

      const { data: diagnosisRow, error: diagnosisError } = await supabase.from("diagnoses").insert({
        user_id: user.id,
        assessment_id: assessmentRow.id,
        diagnosis: plan.diagnosis,
        model: plan.meta.model,
        prompt_version: plan.meta.diagnosis_prompt_version,
      }).select("id").single();
      if (diagnosisError) throw diagnosisError;

      const { error: programmeError } = await supabase.from("programmes").insert({
        user_id: user.id,
        diagnosis_id: diagnosisRow.id,
        programme: plan.curriculum,
        model: plan.meta.model,
        prompt_version: plan.meta.curriculum_prompt_version,
      });
      if (programmeError) throw programmeError;

      setSaveState("Saved ✓");
    } catch (error) {
      setSaveState(error instanceof Error ? error.message : "Couldn’t save your plan.");
    }
  }

  if (!plan) {
    return (
      <main className="assessment-wrap narrow">
        <section className="question-card">
          <h1>No plan here yet.</h1>
          <p className="lead">Complete the Ahead assessment first and we’ll build it.</p>
          <Link className="primary-btn button-link" href="/assessment">Start assessment →</Link>
        </section>
      </main>
    );
  }

  const { diagnosis, curriculum } = plan;
  const strengths = diagnosis.strengths.slice(0, 4);
  const priorityRank = { high: 0, medium: 1, low: 2 } as const;
  const gaps = [...diagnosis.capability_gaps]
    .sort((a, b) => priorityRank[a.priority] - priorityRank[b.priority])
    .slice(0, 4);
  const deprioritise = diagnosis.deprioritise.slice(0, 4);

  return (
    <main className="result-wrap">
      <section className="result-hero">
        <div className="eyebrow">✦ Your Ahead diagnosis</div>
        <h1>This is what actually matters next.</h1>
        <p>Your plan was generated from your assessment using Ahead’s diagnosis → curriculum architecture.</p>
      </section>

      <div className="now-next">
        <div className="state-card"><div className="label">Today</div><div className="big">{diagnosis.current_profile.summary}</div></div>
        <div className="state-arrow">→</div>
        <div className="state-card"><div className="label">Where you’re heading</div><div className="big">{diagnosis.target_profile.summary}</div></div>
      </div>

      <div className="insight-grid">
        <div className="insight-card"><strong>Your advantage</strong><ul>{strengths.map((x) => <li key={x.name}>{x.name}</li>)}</ul></div>
        <div className="insight-card"><strong>Biggest gaps</strong><ul>{gaps.map((x) => <li key={x.capability}>{x.capability}</li>)}</ul></div>
        <div className="insight-card"><strong>Useful depth</strong><ul><li>{diagnosis.current_profile.ai_maturity}</li><li>{diagnosis.current_profile.builder_maturity}</li><li>{diagnosis.target_profile.responsibility_shift}</li></ul></div>
        <div className="insight-card"><strong>Don’t waste time on</strong><ul>{deprioritise.map((x) => <li key={x.skill}>{x.skill}</li>)}</ul></div>
      </div>

      <div className="think-box">
        <h2>What we think</h2>
        <p>{diagnosis.development_strategy}</p>
      </div>

      <section className="roadmap">
        <div className="roadmap-head">
          <div><div className="eyebrow">{curriculum.programme_title}</div><h2>Your 10 weeks Ahead</h2><p className="roadmap-intro">{curriculum.programme_strategy}</p></div>
          <button className="secondary-btn" onClick={savePlan}>{saveState || "Save my plan"}</button>
        </div>
        <div className="week-list">
          {curriculum.weeks.map((week) => (
            <div className="week-card" key={week.week_number}>
              <div className="week-num">{String(week.week_number).padStart(2, "0")}</div>
              <div><h3>{week.title}</h3><p>{week.why_this_matters_for_you}</p></div>
              <div className="week-output"><strong>You’ll finish with</strong>{week.output}</div>
            </div>
          ))}
        </div>
        <div className="cta-row centre-row"><button className="primary-btn" onClick={() => alert("Next build: detailed Week 1 → day-by-day sessions + resource library.")}>Start Week 1 →</button></div>
        <div className="footer-note">Generated with {plan.meta.model} · {plan.meta.diagnosis_prompt_version} · {plan.meta.curriculum_prompt_version}</div>
      </section>
    </main>
  );
}
