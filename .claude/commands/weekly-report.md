---
description: Draft the weekly report issue (Resumo da semana) for PUCTech/rayume and open it on GitHub
argument-hint: "[YYYY-MM-DD YYYY-MM-DD] (default: this Monday to Sunday)"
---

Write the weekly report issue for `PUCTech/rayume`. It is for the whole team, interns included: write it in **Portuguese (pt-BR)**, plain and short, like issue #6, the first one (`gh issue view 6`). Match its tone and level of detail.

## 1. Gather

- **Range**: `$ARGUMENTS` if given, else Monday to Sunday of the current week (`date`). Check the last report with `gh issue list --state all --search "Resumo da semana in:title"` and start the day after its range, so no days fall through the gap.
- **PRs merged into `main` in the range**: `gh pr list --state merged --base main --search "merged:<start>..<end>" --json number,title,author,body,url`.
- **Direct commits to `main`** (not from a PR): `git fetch origin main` then `git log origin/main --first-parent --since=<start> --until="<end> 23:59" --oneline`.
- **The why**: session reports in `docs/sessions/` dated in the range (Summary, Decisions, Problems found, Open). Those are the source for decisions and next steps; PR bodies and commits only say what changed.
- **Who**: `gh pr list` authors and `git shortlog -sn origin/main --since=<start>`. Credit everyone who merged something.
- **Still open**: `gh pr list --state open` and `gh issue list --state open` (to mention work in flight, not to list every issue).

## 2. Layout

Title: `Resumo da semana: <2 or 3 themes> (<d> a <d> de <mês>)`, e.g. `Resumo da semana: editor, chatbot e backend (9 a 15 de nov)`.

```markdown
Resumo do que entrou na `main` entre <d> e <d> de <mês>.

## O que foi feito

| PR | Quem | O quê |
|---|---|---|
| #N | @login | **Bold headline**: one line on what it gives the user or the team |
| #10, #12, #13 | @login | **Polimento do frontend**: one merged row for a group (see below) |
| `abc1234` | @login | direct commits to main, same format |

## <Theme section, one per big theme, 2 to 4 of them>

What changed and why, in a short paragraph or bullets, from the user's point of view.
Add a mermaid diagram when it explains a flow or structure better than prose
(data model, request flow, pipeline), and a screenshot when the change is visual.
Link the docs: [`docs/x/README.md`](../blob/main/docs/x/README.md).

## Decisões

| Decisão | Por quê |
|---|---|
| Only the ones the team needs to know about (conventions, architecture, tooling) | ... |

## Problemas e riscos

Bugs found, things that broke, debt or risk someone should know about. Omit if none.

## Em andamento

Open PRs and branches, one line each. Omit if none.

## Próximos passos

- What comes next, concrete enough that someone could pick it up.
```

### Merging PRs into one row

Several PRs often polish the same area across the week (`feat/polish`, `feat/frontend-polish`, `feat/ultramarine-responsive`...). Collapse them into one row so the table reads as what changed, not how many branches it took:

1. For each PR get its branch and files: `gh pr view <n> --json headRefName,files,title`.
2. Put PRs in the same group when they share a purpose **and** an area:
   - Purpose: the branch or title says polish, fix, tweak, responsive, refactor, redesign, or continues an earlier PR's work.
   - Area: most of their files sit under the same part of the app (e.g. `frontend/app/resumes/`, `frontend/app/templates/`, the landing, `backend/`).
3. Keep a PR on its own row when it adds something someone would look for by name (a new page, a new feature, an endpoint, a schema change), even if a polish PR touched the same files. Polish that comes after a feature folds into that feature's row ("Editor de currículo: ... e três rodadas de ajustes").
4. A group's row lists every PR number in order, names one headline for the whole group, and sums up the result (the end state, not the PR-by-PR history). Its theme section can name the PRs where a detail matters.
5. In the draft, list the groups under the table (`#10 + #12 + #13: mesmo tema (polish de templates)`) so I can split or merge them before publishing. That list is for me only: leave it out of the issue body.

Rules:
- Group by theme, not by PR or by day. Leave out chores (formatting, typo fixes, session reports) unless they matter to someone.
- Images only from files already on `main`, as `https://github.com/PUCTech/rayume/blob/main/<path>?raw=true`. Never link a file that only exists on a branch. If a visual change has no screenshot on `main`, say so in the draft and skip the image.
- Links to repo files use `../blob/main/<path>` like issue #6.
- No emoji, no filler, no "this week we worked hard on". Mention people as `@login` only in the table.

## 3. Publish

1. Write the body to the scratchpad and show me the title and the full body.
2. **Wait for my OK.** Creating the issue notifies everyone in the repo.
3. `gh issue create --repo PUCTech/rayume --title "<title>" --body-file <file>`.
4. Reply with the issue URL. Ask whether to close the previous week's report issue.

If nothing was merged into `main` in the range, say so and ask before writing anything.
