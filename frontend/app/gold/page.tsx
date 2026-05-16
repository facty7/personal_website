import Link from "next/link";
import GoldSurvey from "@/components/GoldSurvey";
import { goldBatches } from "@/lib/surveyData";

type GoldBatches = Record<
  string,
  readonly {
    itemId: string;
    ideaId: string;
    domain: string;
    ideaText: string;
  }[]
>;

export default function GoldPage({
  searchParams,
}: {
  searchParams?: { batch?: string };
}) {
  const batches = goldBatches as unknown as GoldBatches;
  const requested = (searchParams?.batch || "A").toUpperCase();
  const initialBatch = batches[requested] ? requested : "A";

  return (
    <main className="site-shell">
      <header className="topbar">
        <div className="topbar-inner">
          <Link href="/" className="brand">
            <span className="brand-mark">MS</span>
            <span>Gold Label Study</span>
          </Link>
          <nav className="nav-links" aria-label="Survey navigation">
            <Link href="/">Home</Link>
            <Link href="/feedback">Feedback study</Link>
          </nav>
        </div>
      </header>
      <GoldSurvey initialBatch={initialBatch} batches={batches} />
    </main>
  );
}
