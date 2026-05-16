"use client";

import { useMemo, useState } from "react";

type GoldItem = {
  itemId: string;
  ideaId: string;
  domain: string;
  ideaText: string;
};

type GoldBatches = Record<string, readonly GoldItem[]>;

type GoldAnswer = {
  verdict?: string;
  fatalFlawPresent?: string;
  confidence?: string;
  rationale?: string;
  minimumRevision?: string;
};

type SubmitStatus =
  | { type: "idle"; message: string }
  | { type: "success"; message: string }
  | { type: "error"; message: string };

const verdictChoices = ["STOP", "REVISE", "GO", "UNSURE"].map((value) => ({
  value,
  label: value,
}));

const yesNoChoices = [
  { value: "yes", label: "Yes" },
  { value: "partly", label: "Partly" },
  { value: "no", label: "No" },
  { value: "unsure", label: "Unsure" },
];

const confidenceChoices = ["1", "2", "3", "4", "5"].map((value) => ({
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

export default function GoldSurvey({
  initialBatch,
  batches,
}: {
  initialBatch: string;
  batches: GoldBatches;
}) {
  const batchKeys = useMemo(() => Object.keys(batches), [batches]);
  const [batch, setBatch] = useState(initialBatch);
  const [participantId, setParticipantId] = useState("");
  const [startedAt] = useState(() => new Date().toISOString());
  const [answers, setAnswers] = useState<Record<string, GoldAnswer>>({});
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<SubmitStatus>({
    type: "idle",
    message: "",
  });

  const items = batches[batch] || [];

  function resetForBatch(nextBatch: string) {
    setBatch(nextBatch);
    setAnswers({});
    setStatus({ type: "idle", message: "" });
  }

  function updateAnswer(itemId: string, patch: Partial<GoldAnswer>) {
    setAnswers((current) => ({
      ...current,
      [itemId]: {
        ...current[itemId],
        ...patch,
      },
    }));
  }

  function isComplete(itemId: string) {
    const answer = answers[itemId] || {};
    return Boolean(
      answer.verdict &&
        answer.fatalFlawPresent &&
        answer.confidence &&
        answer.rationale?.trim(),
    );
  }

  const completed = items.filter((item) => isComplete(item.itemId)).length;
  const progress = items.length > 0 ? Math.round((completed / items.length) * 100) : 0;

  function rowsForExport() {
    return items.map((item, index) => ({
      survey_type: "gold",
      participant_id: participantId,
      batch,
      order: index + 1,
      item_id: item.itemId,
      idea_id: item.ideaId,
      domain: item.domain,
      verdict: answers[item.itemId]?.verdict || "",
      fatal_flaw_present: answers[item.itemId]?.fatalFlawPresent || "",
      confidence: answers[item.itemId]?.confidence || "",
      rationale: answers[item.itemId]?.rationale || "",
      minimum_revision: answers[item.itemId]?.minimumRevision || "",
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
          surveyType: "gold",
          participantId: participantId.trim(),
          batch,
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
          <div className="eyebrow">Gold Label Study</div>
          <h1>盲标 research idea 的可投入性</h1>
          <p className="lead">
            请只根据 idea 本身判断，不参考模型反馈。允许选择 UNSURE；不确定本身也是有价值的标注信号。
          </p>
        </div>
        <aside className="panel compact">
          <div className="field">
            <label htmlFor="participant-id">匿名编号</label>
            <input
              id="participant-id"
              value={participantId}
              onChange={(event) => setParticipantId(event.target.value)}
              placeholder="例如 G01 或 initials"
            />
          </div>
          <div className="field" style={{ marginTop: 12 }}>
            <label htmlFor="batch">标注批次</label>
            <select
              id="batch"
              value={batch}
              onChange={(event) => resetForBatch(event.target.value)}
            >
              {batchKeys.map((key) => (
                <option key={key} value={key}>
                  Batch {key}
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
          return (
            <article className="item-card" key={item.itemId}>
              <div className="item-head">
                <h2>
                  Item {index + 1}
                  <span className="tag" style={{ marginLeft: 10 }}>
                    {item.itemId}
                  </span>
                </h2>
                <span className="tag">{item.domain}</span>
              </div>
              <p className="idea-text">{item.ideaText}</p>

              <div className="field-row">
                <ChoiceGroup
                  label="你对这个 idea 的总体判断是？"
                  value={answer.verdict}
                  options={verdictChoices}
                  onChange={(value) => updateAnswer(item.itemId, { verdict: value })}
                />
                <ChoiceGroup
                  label="是否存在不解决就很难成立的硬伤？"
                  value={answer.fatalFlawPresent}
                  options={yesNoChoices}
                  onChange={(value) =>
                    updateAnswer(item.itemId, { fatalFlawPresent: value })
                  }
                />
              </div>

              <ChoiceGroup
                label="你的判断置信度：1=很不确定，5=很确定"
                value={answer.confidence}
                options={confidenceChoices}
                onChange={(value) => updateAnswer(item.itemId, { confidence: value })}
              />

              <div className="field-row" style={{ marginTop: 16 }}>
                <div className="field">
                  <label htmlFor={`${item.itemId}-rationale`}>
                    主要理由或关键硬伤
                  </label>
                  <textarea
                    id={`${item.itemId}-rationale`}
                    value={answer.rationale || ""}
                    onChange={(event) =>
                      updateAnswer(item.itemId, { rationale: event.target.value })
                    }
                    placeholder="一句话即可。"
                  />
                </div>
                <div className="field">
                  <label htmlFor={`${item.itemId}-revision`}>
                    最小可行修改路径，可选
                  </label>
                  <textarea
                    id={`${item.itemId}-revision`}
                    value={answer.minimumRevision || ""}
                    onChange={(event) =>
                      updateAnswer(item.itemId, {
                        minimumRevision: event.target.value,
                      })
                    }
                    placeholder="如果你觉得可以改活，写最小修改。"
                  />
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <div className="button-row">
        <button className="btn" type="button" disabled={submitting} onClick={submitSurvey}>
          {submitting ? "提交中..." : "提交标注"}
        </button>
        <button
          className="btn secondary"
          type="button"
          onClick={() => downloadCsv(`mentorsyc_gold_${batch}.csv`, rowsForExport())}
        >
          下载 CSV 备份
        </button>
      </div>
      {status.message && <div className={`status ${status.type}`}>{status.message}</div>}
    </section>
  );
}
