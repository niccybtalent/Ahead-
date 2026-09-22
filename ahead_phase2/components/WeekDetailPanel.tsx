"use client";

import type { WeekDetail, WeekResource } from "@/lib/types";

function hostOf(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function ResourceCard({ resource }: { resource: WeekResource }) {
  return (
    <a className="resource-card" href={resource.url} target="_blank" rel="noopener noreferrer">
      <div className="resource-head">
        <span className={`tag tag-${resource.format}`}>{resource.format}</span>
        <span className={`tag tag-cost tag-${resource.cost}`}>{resource.cost}</span>
        {resource.use_in_session !== null && <span className="tag tag-day">Day {resource.use_in_session}</span>}
      </div>
      <strong>{resource.title}</strong>
      <p>{resource.why_this_one}</p>
      <div className="resource-foot">
        <span>{resource.source || hostOf(resource.url)}</span>
        <span>{resource.time_required}</span>
      </div>
    </a>
  );
}

export default function WeekDetailPanel({ detail }: { detail: WeekDetail }) {
  const totalMinutes = detail.sessions.reduce((sum, s) => sum + (s.minutes || 0), 0);

  return (
    <div className="week-detail">
      <p className="week-intro">{detail.intro}</p>

      {detail.capability_focus.length > 0 && (
        <div className="chip-row">
          {detail.capability_focus.map((c) => (
            <span className="chip" key={c}>{c}</span>
          ))}
        </div>
      )}

      <div className="detail-section">
        <div className="detail-head">
          <h4>Your sessions</h4>
          <span className="detail-meta">
            {detail.sessions.length} sessions · about {Math.round(totalMinutes / 60 * 10) / 10} hours this week
          </span>
        </div>
        <ol className="session-list">
          {detail.sessions.map((session) => (
            <li className="session-card" key={session.day}>
              <div className="session-head">
                <span className="session-day">Day {session.day}</span>
                <h5>{session.title}</h5>
                <span className="session-mins">{session.minutes} min</span>
              </div>
              <p className="session-focus">{session.focus}</p>
              <ul className="session-steps">
                {session.steps.map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ul>
              <div className="session-done">
                <strong>Done when</strong> {session.done_when}
              </div>
            </li>
          ))}
        </ol>
      </div>

      {detail.resources.length > 0 && (
        <div className="detail-section">
          <div className="detail-head">
            <h4>Resources</h4>
            <span className="detail-meta">Found on the live web · every link checked</span>
          </div>
          <div className="resource-grid">
            {detail.resources.map((r) => (
              <ResourceCard resource={r} key={r.url} />
            ))}
          </div>
        </div>
      )}

      <div className="deliverable-box">
        <h4>What you’ll produce</h4>
        <p>{detail.deliverable.brief}</p>
        {detail.deliverable.what_good_looks_like.length > 0 && (
          <>
            <strong className="deliverable-label">Good looks like</strong>
            <ul>
              {detail.deliverable.what_good_looks_like.map((x, i) => (
                <li key={i}>{x}</li>
              ))}
            </ul>
          </>
        )}
        <div className="deliverable-use">
          <strong>Use it for</strong> {detail.deliverable.how_to_use_it}
        </div>
      </div>

      <div className="checkpoint-box">
        <strong>Ready for next week when</strong> {detail.checkpoint}
      </div>

      <div className="footer-note">
        {detail.meta.sources_considered} sources searched
        {detail.meta.resources_dropped > 0 && ` · ${detail.meta.resources_dropped} unverified link${detail.meta.resources_dropped === 1 ? "" : "s"} removed`}
        {" · "}
        {new Date(detail.meta.searched_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
      </div>
    </div>
  );
}
