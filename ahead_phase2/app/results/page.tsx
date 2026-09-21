import Link from "next/link";
import ResultsClient from "@/components/ResultsClient";

export default function ResultsPage() {
  return (
    <div className="shell">
      <nav className="nav"><Link href="/" className="brand">Ahead<span className="dot">.</span></Link><div className="nav-right">Your personalised path</div></nav>
      <ResultsClient />
    </div>
  );
}
