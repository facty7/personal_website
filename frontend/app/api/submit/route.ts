import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type SurveyPayload = {
  surveyType?: string;
  participantId?: string;
  version?: string;
  batch?: string;
  startedAt?: string;
  submittedAt?: string;
  responses?: unknown[];
};

function sanitizeSegment(value: string) {
  return value.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 80) || "unknown";
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function validatePayload(payload: SurveyPayload) {
  if (!payload || typeof payload !== "object") {
    throw new Error("Invalid payload.");
  }
  if (payload.surveyType !== "feedback" && payload.surveyType !== "gold") {
    throw new Error("Invalid survey type.");
  }
  if (!payload.participantId || payload.participantId.length > 120) {
    throw new Error("Invalid participant id.");
  }
  if (!Array.isArray(payload.responses) || payload.responses.length === 0) {
    throw new Error("No responses found.");
  }
  if (payload.responses.length > 80) {
    throw new Error("Too many responses.");
  }
}

async function saveToGithub(enriched: Record<string, unknown>, submissionId: string) {
  const token = process.env.GITHUB_TOKEN;
  if (!token) return null;

  const owner = process.env.GITHUB_OWNER || "facty7";
  const repo = process.env.GITHUB_REPO || "personal_website";
  const branch = process.env.GITHUB_BRANCH || "main";
  const baseDir = process.env.GITHUB_SUBMISSIONS_DIR || "data/submissions";
  const surveyType = sanitizeSegment(String(enriched.surveyType || "survey"));
  const participant = sanitizeSegment(String(enriched.participantId || "anon"));
  const filePath = `${baseDir}/${surveyType}/${today()}/${submissionId}-${participant}.json`;
  const content = Buffer.from(`${JSON.stringify(enriched, null, 2)}\n`, "utf8").toString(
    "base64",
  );

  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "mentorsyc-survey-site",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: `survey: add ${surveyType} submission ${submissionId}`,
        content,
        branch,
      }),
    },
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`GitHub save failed: ${response.status} ${text.slice(0, 240)}`);
  }

  return {
    storage: "github",
    path: filePath,
  };
}

async function saveLocal(enriched: Record<string, unknown>, submissionId: string) {
  if (process.env.VERCEL) {
    throw new Error("GITHUB_TOKEN is not configured on Vercel.");
  }

  const surveyType = sanitizeSegment(String(enriched.surveyType || "survey"));
  const dir = path.join(process.cwd(), "collected_responses", surveyType, today());
  await mkdir(dir, { recursive: true });
  const filePath = path.join(dir, `${submissionId}.json`);
  await writeFile(filePath, `${JSON.stringify(enriched, null, 2)}\n`, "utf8");
  return {
    storage: "local",
    path: filePath,
  };
}

export async function POST(request: NextRequest) {
  try {
    const payload = (await request.json()) as SurveyPayload;
    validatePayload(payload);

    const submissionId = `${Date.now()}-${randomUUID().slice(0, 8)}`;
    const enriched = {
      ...payload,
      submissionId,
      receivedAt: new Date().toISOString(),
      schemaVersion: "2026-05-16",
      userAgent: request.headers.get("user-agent") || "",
    };

    const saved =
      (await saveToGithub(enriched, submissionId)) || (await saveLocal(enriched, submissionId));

    return NextResponse.json({
      ok: true,
      submissionId,
      ...saved,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error.";
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}
