# MentorSyc Survey Site

This repository hosts the survey portal for `jianglixin.online`.

## What It Does

- `/feedback?version=A` to `/feedback?version=F`: decision study for LLM research mentorship feedback.
- `/gold?batch=A` and `/gold?batch=B`: blind gold-label annotation for research ideas.
- `POST /api/submit`: stores each completed survey as a JSON file through the GitHub Contents API.

## Vercel Environment Variables

Set these in the Vercel project settings:

```text
GITHUB_TOKEN=your_github_fine_grained_token
GITHUB_OWNER=facty7
GITHUB_REPO=personal_website
GITHUB_BRANCH=main
GITHUB_SUBMISSIONS_DIR=data/submissions
```

The GitHub token needs Contents read/write permission for this repository. If this repository is public, collected submissions written to `main` are also public. For anonymous pilots, use non-identifying participant IDs.

## Local Development

```bash
cd frontend
npm install
npm run dev
```

Without `GITHUB_TOKEN`, local submissions are saved under `frontend/collected_responses/`.
