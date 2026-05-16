"use client";

import { useMemo, useState } from "react";

type FeedbackItem = {
  itemId: string;
  ideaText: string;
  feedbackText: string;
};

type FeedbackVersions = Record<string, readonly FeedbackItem[]>;

type FeedbackAnswer = {
  preVerdict?: string;
  preInvestment?: string;
  postVerdict?: string;
  postInvestment?: string;
  fatalFlawClear?: string;
  overEncouraging?: string;
  helpful?: string;
  comment?: string;
};

type SubmitStatus =
  | { type: "idle"; message: string }
  | { type: "success"; message: string }
  | { type: "error"; message: string };

const verdictChoices = ["STOP", "REVISE", "GO", "UNSURE"].map((value) => ({
  value,
  label: value,
}));

const investmentChoices = [
  { value: "0_days", label: "0 days" },
  { value: "2_days", label: "2 days" },
  { value: "1_week", label: "1 week" },
  { value: "1_month_plus", label: "1 month+" },
];

const clarityChoices = [
  { value: "yes", label: "Yes" },
  { value: "partly", label: "Partly" },
  { value: "no", label: "No" },
  { value: "unsure", label: "Unsure" },
];

const scaleChoices = ["1", "2", "3", "4", "5"].map((value) => ({
  value,
  label: value,
}));

function ChoiceGroup({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value?: string;
  options: readonly { value: string; label: string }[];
  onChange: (value: string) => void;
}) {
  return (
    <div className="question-block">
      <div className="label">{label}</div>
      <div className="choice-group">
        {options.map((option) => (
          <button
            className={`choice ${value === option.value ? "active" : ""}`}
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function csvEscape(value: unknown) {
  const text = String(value ?? "");
  return `"${text.replace(/"/g, '""')}"`;
}

function downloadCsv(filename: string, rows: Record<string, unknown>[]) {
  if (rows.length === 0) return;
  const headers = Object.keys(rows[0]);
  const csv = [
    headers.map(csvEscape).join(","),
    ...rows.map((row) => headers.map((header) => csvEscape(row[header])).join(",")),
  ].join("\n");
  const blob = new Blob([`\ufeff${csv}`], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export default function FeedbackSurvey({
  initialVersion,
  versions,
}: {
  initialVersion: string;
  versions: FeedbackVersions;
}) {
  const versionKeys = useMemo(() => Object.keys(versions), [versions]);
  const [version, setVersion] = useState(initialVersion);
  const [participantId, setParticipantId] = useState("");
  const [startedAt] = useState(() => new Date().toISOString());
  const [answers, setAnswers] = useState<Record<string, FeedbackAnswer>>({});
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<SubmitStatus>({
    type: "idle",
    message: "",
  });

  const items = versions[version] || [];

  function resetForVersion(nextVersion: string) {
    setVersion(nextVersion);
    setAnswers({});
    setRevealed({});
    setStatus({ type: "idle", message: "" });
  }

  function updateAnswer(itemId: string, patch: Partial<FeedbackAnswer>) {
    setAnswers((current) => ({
      ...current,
      [itemId]: {
        ...current[itemId],
        ...patch,
      },
    }));
  }

  function canReveal(itemId: string) {
    const answer = answers[itemId] || {};
    return Boolean(answer.preVerdict && answer.preInvestment);
  }

  function isComplete(itemId: string) {
    const answer = answers[itemId] || {};
    return Boolean(
      answer.preVerdict &&
        answer.preInvestment &&
        revealed[itemId] &&
        answer.postVerdict &&
        answer.postInvestment &&
        answer.fatalFlawClear &&
        answer.overEncouraging &&
        answer.helpful,
    );
  }

  const completed = items.filter((item) => isComplete(item.itemId)).length;
  const progress = items.length > 0 ? Math.round((completed / items.length) * 100) : 0;

  function rowsForExport() {
    return items.map((item, index) => ({
      survey_type: "feedback",
      participant_id: participantId,
      version,
      order: index + 1,
      item_id: item.itemId,
      pre_verdict: answers[item.itemId]?.preVerdict || "",
      pre_investment: answers[item.itemId]?.preInvestment || "",
      post_verdict: answers[item.itemId]?.postVerdict || "",
      post_investment: answers[item.itemId]?.postInvestment || "",
      fatal_flaw_clear: answers[item.itemId]?.fatalFlawClear || "",
      over_encouraging: answers[item.itemId]?.overEncouraging || "",
      helpful: answers[item.itemId]?.helpful || "",
      comment: answers[item.itemId]?.comment || "",
    }));
  }

  async function submitSurvey() {
    if (!participantId.trim()) {
      setStatus({ type: "error", message: "请先填写一个匿名编号。" });
      return;
    }
    if (completed !== items.length) {
      setStatus({
        type: "error",
        message: `还有 ${items.length - completed} 题没有完成。`,
      });
      return;
    }

    setSubmitting(true);
    setStatus({ type: "idle", message: "" });

    try {
      const response = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          surveyType: "feedback",
          participantId: participantId.trim(),
          version,
          startedAt,
          submittedAt: new Date().toISOString(),
          responses: rowsForExport(),
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error || "提交失败");
      }
      setStatus({
        type: "success",
        message: `已提交，submission id: ${data.submissionId}`,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "提交失败";
      setStatus({
        type: "error",
        message: `${message}。可以先点击“下载 CSV 备份”。`,
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="page">
      <div className="survey-header">
        <div>
          <div className="eyebrow">Feedback Decision Study</div>
          <h1>反馈是否改变科研投入判断？</h1>
          <p className="lead">
            每题先判断 idea 本身，再阅读模型反馈，最后重新判断。核心指标是反馈前后的投入意愿变化。
          </p>
        </div>
        <aside className="panel compact">
          <div className="field">
            <label htmlFor="participant-id">匿名编号</label>
            <input
              id="participant-id"
              value={participantId}
              onChange={(event) => setParticipantId(event.target.value)}
              placeholder="例如 S01 或 wx-name-initials"
            />
          </div>
          <div className="field" style={{ marginTop: 12 }}>
            <label htmlFor="version">问卷版本</label>
            <select
              id="version"
              value={version}
              onChange={(event) => resetForVersion(event.target.value)}
            >
              {versionKeys.map((key) => (
                <option key={key} value={key}>
                  Version {key}
                </option>
              ))}
            </select>
          </div>
          <div className="question-block">
            <div className="label">
              完成进度 {completed}/{items.length}
            </div>
            <div className="progress" aria-label="Progress">
              <span style={{ width: `${progress}%` }} />
            </div>
          </div>
        </aside>
      </div>

      <div className="items">
        {items.map((item, index) => {
          const answer = answers[item.itemId] || {};
          const shown = Boolean(revealed[item.itemId]);
          return (
            <article className="item-card" key={item.itemId}>
              <div className="item-head">
                <h2>
                  Item {index + 1}
                  <span className="tag" style={{ marginLeft: 10 }}>
                    {item.itemId}
                  </span>
                </h2>
                <span className="tag">{isComplete(item.itemId) ? "completed" : "open"}</span>
              </div>

              <p className="idea-text">{item.ideaText}</p>

              <div className="field-row">
                <ChoiceGroup
                  label="阅读反馈前：你会建议作者怎么做？"
                  value={answer.preVerdict}
                  options={verdictChoices}
                  onChange={(value) => updateAnswer(item.itemId, { preVerdict: value })}
                />
                <ChoiceGroup
                  label="阅读反馈前：你建议投入多少时间？"
                  value={answer.preInvestment}
                  options={investmentChoices}
                  onChange={(value) => updateAnswer(item.itemId, { preInvestment: value })}
                />
              </div>

              <div className="button-row">
                <button
                  className="btn secondary"
                  type="button"
                  disabled={!canReveal(item.itemId)}
                  onClick={() =>
                    setRevealed((current) => ({ ...current, [item.itemId]: true }))
                  }
                >
                  显示模型反馈
                </button>
                {!canReveal(item.itemId) && (
                  <span className="meta">先完成反馈前判断，再显示反馈。</span>
                )}
              </div>

              {shown && (
                <>
                  <hr className="divider" />
                  <h3>模型反馈</h3>
                  <p className="feedback-text">{item.feedbackText}</p>

                  <div className="field-row">
                    <ChoiceGroup
                      label="阅读反馈后：你会建议作者怎么做？"
                      value={answer.postVerdict}
                      options={verdictChoices}
                      onChange={(value) => updateAnswer(item.itemId, { postVerdict: value })}
                    />
                    <ChoiceGroup
                      label="阅读反馈后：你建议投入多少时间？"
                      value={answer.postInvestment}
                      options={investmentChoices}
                      onChange={(value) =>
                        updateAnswer(item.itemId, { postInvestment: value })
                      }
                    />
                  </div>

                  <div className="field-row">
                    <ChoiceGroup
                      label="反馈是否清楚指出了关键硬伤？"
                      value={answer.fatalFlawClear}
                      options={clarityChoices}
                      onChange={(value) =>
                        updateAnswer(item.itemId, { fatalFlawClear: value })
                      }
                    />
                    <ChoiceGroup
                      label="反馈是否过度鼓励？1=完全没有，5=明显过度"
                      value={answer.overEncouraging}
                      options={scaleChoices}
                      onChange={(value) =>
                        updateAnswer(item.itemId, { overEncouraging: value })
                      }
                    />
                  </div>

                  <ChoiceGroup
                    label="整体帮助性：1=没帮助，5=很有帮助"
                    value={answer.helpful}
                    options={scaleChoices}
                    onChange={(value) => updateAnswer(item.itemId, { helpful: value })}
                  />

                  <div className="field" style={{ marginTop: 16 }}>
                    <label htmlFor={`${item.itemId}-comment`}>可选备注</label>
                    <textarea
                      id={`${item.itemId}-comment`}
                      value={answer.comment || ""}
                      onChange={(event) =>
                        updateAnswer(item.itemId, { comment: event.target.value })
                      }
                      placeholder="例如：为什么反馈让你更想或更不想继续做。"
                    />
                  </div>
                </>
              )}
            </article>
          );
        })}
      </div>

      <div className="button-row">
        <button className="btn" type="button" disabled={submitting} onClick={submitSurvey}>
          {submitting ? "提交中..." : "提交问卷"}
        </button>
        <button
          className="btn secondary"
          type="button"
          onClick={() => downloadCsv(`mentorsyc_feedback_${version}.csv`, rowsForExport())}
        >
          下载 CSV 备份
        </button>
      </div>
      {status.message && <div className={`status ${status.type}`}>{status.message}</div>}
    </section>
  );
}
