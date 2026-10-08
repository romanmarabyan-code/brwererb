# brwererb

Scratch repository used for exercising git and GitHub App workflows —
branch shapes, merge strategies, and pull request behavior. There is no
application to build or run here; the HTML files are placeholders that
exist so commits have something to touch.

## Contents

| Path | What it is |
| --- | --- |
| `index.html` | Placeholder page. |
| `hghghghg.html` | Placeholder page added on `BER-2/fix`. |
| `test-*.txt` | Fixtures for email/identity matching scenarios. |
| `demo/` | Short fixtures named after merge strategies (`mc`, `rb`, `sq`). |
| `docs/` | Written notes — see below. |
| `notes.md` | Working notes for the current branch. |

## Docs

- [`docs/branch-workflow.md`](docs/branch-workflow.md) — branch naming,
  commit message rules, and how a branch reaches `main`.
- [`docs/github-app-scenario-findings.md`](docs/github-app-scenario-findings.md)
  — findings from the GitHub App prerequisite audit.

## Working here

`main` takes no direct pushes; everything lands through a pull request.
See the branch workflow doc for the details.
