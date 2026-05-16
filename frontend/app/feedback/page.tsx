import Link from "next/link";
import FeedbackSurvey from "@/components/FeedbackSurvey";
import { feedbackVersions } from "@/lib/surveyData";

type FeedbackVersions = Record<
  string,
  readonly {
    itemId: string;
    ideaText: string;
    feedbackText: string;
  }[]
>;

export default function FeedbackPage({
  searchParams,
}: {
  searchParams?: { version?: string };
}) {
  const versions = feedbackVersions as unknown as FeedbackVersions;
  const requested = (searchParams?.version || "A").toUpperCase();
  const initialVersion = versions[requested] ? requested : "A";

  return (
    <main className="site-shell">
      <header className="topbar">
        <div className="topbar-inner">
          <Link href="/" className="brand">
            <span className="brand-mark">MS</span>
            <span>Feedback Study</span>
          </Link>
          <nav className="nav-links" aria-label="Survey navigation">
            <Link href="/">Home</Link>
            <Link href="/gold">Gold label study</Link>
          </nav>
        </div>
      </header>
      <FeedbackSurvey initialVersion={initialVersion} versions={versions} />
    </main>
  );
}
