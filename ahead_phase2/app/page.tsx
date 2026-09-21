import Link from "next/link";

export default function HomePage() {
  return (
    <div className="shell">
      <nav className="nav">
        <Link href="/" className="brand">Ahead<span className="dot">.</span></Link>
        <div className="nav-right">Personalised AI career development</div>
      </nav>

      <main>
        <section className="hero">
          <div>
            <div className="eyebrow">✦ Personalised to your career</div>
            <h1>Build the skills your <span className="gradient-text">next career</span> needs.</h1>
            <p>
              Tell us where you are, where you want to go and how you currently use AI.
              Ahead builds you a personalised 10-week programme around your actual career.
            </p>
            <div className="cta-row">
              <Link className="primary-btn button-link" href="/assessment">Build my plan →</Link>
              <a className="secondary-btn button-link" href="#examples">See examples</a>
            </div>
            <div className="micro">Free · Takes about 5 minutes · No generic AI courses</div>
          </div>

          <div className="path-card">
            <div className="path-step"><div className="path-label">You are here</div><div className="path-value">Operations Manager</div></div>
            <div className="arrow">↓</div>
            <div className="path-step"><div className="path-label">Where you want to go</div><div className="path-value">Operations Director</div></div>
            <div className="arrow">↓</div>
            <div className="path-step"><div className="path-label">Ahead identifies</div><div className="path-value">AI workflows + data + leadership</div></div>
            <div className="arrow">↓</div>
            <div className="path-step"><div className="path-label">Your path</div><div className="path-value">10 weeks built around you</div></div>
          </div>
        </section>

        <section className="examples" id="examples">
          <h2>Same product. Completely different plan.</h2>
          <div className="example-grid">
            <div className="example-card"><strong>Marine Engineering student</strong><span>AI fundamentals → MATLAB → modelling → technical portfolio.</span></div>
            <div className="example-card"><strong>Commercial leader</strong><span>AI systems → financial fluency → customer insight → broader ownership.</span></div>
            <div className="example-card"><strong>Marketing leader</strong><span>AI systems → customer insight → creative workflows → commercial growth.</span></div>
          </div>
        </section>
      </main>
    </div>
  );
}
