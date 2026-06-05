# UKFinnovator 2026 — Smooth Criminals
**Imperial College London | 13–14 June 2026**

Pre-prepared specs for two challenge scenarios. Read the relevant one on the day once challenges are assigned.

---

## Challenge priority
1. **Maxwell Data** — ESG / Sustainable Finance → `/maxwell/`
2. **Cambridge Spark** — RegTech / AI → `/cambridge-spark/`

## Repo structure
```
/maxwell/          — ESG gap-scoring tool spec + data sources + architecture
/cambridge-spark/  — Regulatory perimeter scanner spec + architecture  
/shared/           — Stack decisions, API keys needed, day-of workflow
```

## Day-of workflow (read this first)
See `/shared/DAY_OF.md`

## Stack (pre-decided, don't debate this on the day)
- **Frontend**: React + TypeScript + Tailwind
- **Backend**: Python (FastAPI) or Next.js API routes
- **Database**: Supabase (free tier, instant setup)
- **LLM calls**: Claude API (Anthropic) via `claude-sonnet-4-20250514`
- **Deployment**: Vercel (free, instant)
- **Data**: All free/public APIs listed per challenge

## Team split (suggested)
| Role | People | Responsibility |
|---|---|---|
| Tech lead | 1 | Architecture, core pipeline, data ingestion |
| Frontend | 1–2 | UI, visualisations, demo polish |
| Backend/data | 1 | API integrations, scoring logic |
| Finance/research | 2–3 | Methodology, pitch, judge Q&A |

Finance people: you are not decorative. The scoring methodology needs to be defensible. Judges will ask "why these weights?" and the answer needs to come from you.
# finnovator
