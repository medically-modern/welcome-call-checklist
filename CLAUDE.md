# Welcome Call Checklist — Developer Guide

## What This App Does

Internal tool for Medically Modern. Template dashboard that reads patient data from a Monday.com board, presents a checklist UI, and writes results back to Monday.

## Stack

React + Vite + TypeScript + Tailwind CSS + shadcn/ui. Deployed to **GitHub Pages** via GitHub Actions.

- Repo: `https://github.com/medically-modern/welcome-call-checklist`
- Live: `https://medically-modern.github.io/welcome-call-checklist/`
- Branch: `main` (push triggers deploy)

## Monday.com Board

**Board ID:** `TODO` — set in `src/lib/mondayApi.ts`

**API setup:** GraphQL endpoint `https://api.monday.com/v2`, POST, header `API-Version: 2024-10`. Token baked in at build time via `VITE_MONDAY_API_TOKEN` env var (set as a GitHub repo secret).

## Setup

1. Set your Monday board ID in `src/lib/mondayApi.ts`
2. Map your columns in `src/lib/mondayApi.ts` (COL object)
3. Update `src/lib/mondayMapping.ts` to parse Monday items into Patient objects
4. Define your checklist items in `src/lib/workflow.ts`
5. Build out the UI panels in `src/components/dashboard/`
6. Implement write-back logic in `src/lib/mondayWrite.ts`
7. Add your Monday API token as a GitHub secret: `VITE_MONDAY_API_TOKEN`

## Key Files

| File | Purpose |
|---|---|
| `src/lib/mondayApi.ts` | Board ID, column IDs, GraphQL client |
| `src/lib/mondayMapping.ts` | Monday item → Patient conversion |
| `src/lib/mondayWrite.ts` | Patient → Monday write-back |
| `src/lib/workflow.ts` | Data model, checklist items, types |
| `src/hooks/useMondayPatients.ts` | React hook: fetch + poll + local overlay |
| `src/pages/Index.tsx` | Main page layout |
| `src/components/dashboard/` | UI panels |
