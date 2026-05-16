import Link from "next/link";
import { feedbackVersions, goldBatches } from "@/lib/surveyData";

const feedbackKeys = Object.keys(feedbackVersions);
const goldKeys = Object.keys(goldBatches);

export default function HomePage() {
  return (
    <main className="site-shell">
      <header className="topbar">
        <div className="topbar-inner">
          <Link href="/" className="brand">
            <span className="brand-mark">MS</span>
            <span>MentorSyc Survey</span>
          </Link>
          <nav className="nav-links" aria-label="Survey navigation">
            <Link href="/feedback">Feedback study</Link>
            <Link href="/gold">Gold label study</Link>
          </nav>
        </div>
      </header>

      <section className="page">
        <div className="hero">
          <div>
            <div className="eyebrow">LLM Research Mentorship</div>
            <h1>Critique Cushioning Human Study</h1>
            <p className="lead">
              这个页面用于收集 LLM 科研导师反馈实验的人类判断。请使用研究者给你的版本链接填写；
              不需要实名，填写自定义编号即可。
            </p>
          </div>
          <aside className="notice">
            <h2>填写说明</h2>
            <p>
              反馈问卷会先让你判断 idea 是否值得继续投入，再展示一段模型反馈，并记录反馈是否改变你的投入判断。
              Gold 标注问卷用于校验 idea 本身的质量标签。
            </p>
          </aside>
        </div>

        <div className="grid">
          <section className="panel">
            <h2>Feedback Decision Study</h2>
            <p className="meta">
              每个版本 24 题。用于估计模型反馈是否导致 research investment miscalibration。
            </p>
            <div className="link-grid" aria-label="Feedback versions">
              {feedbackKeys.map((key) => (
                <Link className="link-tile" href={`/feedback?version=${key}`} key={key}>
                  <strong>Version {key}</strong>
                  <span className="meta">24 items</span>
                </Link>
              ))}
            </div>
          </section>

          <section className="panel">
            <h2>Gold Label Study</h2>
            <p className="meta">
              每个 batch 24 题。用于盲标 GO / REVISE / STOP、置信度和关键理由。
            </p>
            <div className="link-grid" aria-label="Gold batches">
              {goldKeys.map((key) => (
                <Link className="link-tile" href={`/gold?batch=${key}`} key={key}>
                  <strong>Batch {key}</strong>
                  <span className="meta">24 items</span>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
