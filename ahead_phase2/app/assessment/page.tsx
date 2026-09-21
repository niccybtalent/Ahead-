import Link from "next/link";
import AssessmentFlow from "@/components/AssessmentFlow";

export default function AssessmentPage() {
  return (
    <div className="shell">
      <nav className="nav">
        <Link href="/" className="brand">Ahead<span className="dot">.</span></Link>
        <div className="nav-right">Let’s work out what actually matters</div>
      </nav>
      <AssessmentFlow />
    </div>
  );
}
