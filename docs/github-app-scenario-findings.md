# GitHub App — behavioural scenario run (S1–S8)

**Status: BLOCKED before Step 0. No scenario was executed.**

Date of run: 2026-08-21 (prerequisite audit)
Updated: 2026-08-21 07:30 UTC — blocker C (ngrok) resolved by the human and
re-verified; blockers A and B stand.
Workspace: `owner_id = 71`
Installation: `155380753` (`romanmarabyan-code`)
Test repository clone: `/var/www/html/brwererb`
Application under test: `/var/www/html/webwork-tracker` (branch `master`, HEAD `ae8170e05d`)

The protocol says to stop and report if a prerequisite is missing, and not to work
around it. Three prerequisites were missing at audit time, one of them structural.
One (ngrok) has since been fixed; two remain. This document
is the prerequisite audit and the list of what has to be true before the eight
scenarios can produce meaningful observations.

Nothing in the ingestion path was modified. The only write performed against any
system was one empty commit pushed to the test repository (`prereq reachability
probe`) to determine whether webhook deliveries still arrive; see §2.

---

## 1. Prerequisite audit

| # | Prerequisite | Verdict | Evidence |
|---|---|---|---|
| 1 | GitHub App installed on a test repository, repository **active** in the workspace | ❌ **FAIL** | App installed and synced, but **no repository is active** — all four `github_app_repositories` rows have `is_active = 0` |
| 2 | `ngrok` running, webhook deliveries reaching the app | ✅ **PASS** (fixed 07:30 UTC) | Was `403 ERR_NGROK_725` (monthly bandwidth exhausted). New tunnel `cadmium-armchair-anymore.ngrok-free.dev`; re-verified end to end — see §2 blocker C |
| 3 | `php artisan queue:work` running, driver not `sync` | ⚠️ **PASS (fragile)** | `QUEUE_CONNECTION=database`; worker running; job executed 2s after delivery. Works only by accident — see §5.1 |
| 4 | Commit ingestion implemented — commits from a push are stored | ❌ **FAIL** | `ProcessGithubAppWebhook` explicitly logs and discards `push`. The ingestion code exists only inside `git stash@{0}` |
| 5 | Task linking implemented | ❌ **FAIL** | Same stash. No code in the working tree references `github_commits` or `github_commit_task` |
| 6 | Two projects with distinct keys, tasks that exist | ✅ **PASS** | 102 projects / 97 distinct identifiers; 144 tasks carry identifiers across 14 project keys. See §3 for substitutions |
| 7 | Local clone of the test repository | ✅ **PASS** | `/var/www/html/brwererb` → `romanmarabyan-code/brwererb` |

Additionally, **all four Step 0 inspection commands are absent** (`gh:commits`,
`gh:sessions`, `gh:payload`, `gh:replay`), and `gh:payload` cannot be built
against the current schema at all — see §5.4.

---

## 2. The three blockers in detail

### Blocker A — commit ingestion is not implemented (structural)

`app/Jobs/ProcessGithubAppWebhook.php` states this in its own docblock:

```
 * Only lifecycle events are acted on. push / issues / pull_request are received,
 * verified and deduplicated by the controller, then logged and discarded here —
 * ingestion is a later phase and deliberately not implemented.
```

and in the switch:

```php
case 'push':
case 'issues':
case 'pull_request':
    Log::debug('GITHUB APP WEBHOOK EVENT NOT INGESTED', [...]);
    break;
```

Confirmed live in `storage/logs/laravel.log` for the two pushes that did arrive
today before the tunnel died:

```
[2026-08-21T06:42:23] local.DEBUG: GITHUB APP WEBHOOK EVENT NOT INGESTED
  {"event":"push","action":"","installation_id":155380753,"delivery":"75635ff2-9d2b-11f1-8bef-392049fc9618"}
[2026-08-21T06:45:06] local.DEBUG: GITHUB APP WEBHOOK EVENT NOT INGESTED
  {"event":"push","action":"","installation_id":155380753,"delivery":"d5d828f4-9d2b-11f1-8320-fed4217c2554"}
```

**Where the ingestion code actually is.** The commit-ingestion and task-linking
work is not deleted — it is sitting in a git stash:

```
stash@{0}: On master: zzzzzz github
```

That stash contains, among others:

```
app/Models/GithubCommit.php
app/Models/GithubCommitTask.php
app/Models/CommitAuthorAlias.php
app/Jobs/ProcessGithubActivityWebhook.php
app/Services/Integrations/GithubActivityService.php
app/Services/Integrations/GithubApp.php
database/migrations/2026_08_18_000100_create_github_commits_table.php
database/migrations/2026_08_20_000000_create_github_commit_task_table.php
database/migrations/2026_08_20_000100_add_author_identity_to_github_commits_table.php
database/migrations/2026_08_20_000200_create_commit_author_aliases_table.php
```

The stashed `ProcessGithubAppWebhook` *does* handle `push`, `pull_request`,
`pull_request_review` and `create`. So the remedy is not "write ingestion" — it is
"restore or land the stash". That is a decision for the human, not something to do
silently mid-audit.

**Schema drift left behind.** The migrations from that stash were *applied* to the
local database (`migrations` table, batches 407–412), so the tables exist:

| Table | Rows | Referenced by any code in the working tree |
|---|---|---|
| `github_commits` | 0 | no |
| `github_commit_task` | 0 | no |
| `commit_author_aliases` | 0 | no |
| `github_pull_requests` | 0 | no |
| `github_pull_request_reviews` | 0 | no |

`grep -rn "github_commits\|GithubCommit\|commit_author_aliases" app/ Modules/ database/ routes/ config/`
returns **zero hits**. The database and the codebase disagree about what exists.
See §5.2.

### Blocker B — no active repository

```
id=2122  romanmarabyan-code/new-repo-2   is_active=0
id=2777  romanmarabyan-code/brwererb     is_active=0
id=2916  romanmarabyan-code/brwererb     is_active=0
id=2917  romanmarabyan-code/new-repo-2   is_active=0
```

Every synced repository is inactive. S1–S6 and S8 all require an **active**
repository; S7 requires an **inactive** one. Right now only the S7 condition can
be satisfied — and S7 cannot be distinguished from a pass anyway, because with
ingestion absent *every* repository produces zero commit rows. S7 would report a
false pass.

Note also the duplicate rows: `brwererb` appears twice (2777, 2916) and
`new-repo-2` twice (2122, 2917), spanning the deleted installation 155209089 and
the live one 155380753. Worth a look, but not a blocker — see §5.3.

### Blocker C — ngrok bandwidth exhausted — **RESOLVED 2026-08-21 07:30 UTC**

The tunnel is alive and the agent reports 3108 requests served:

```
https://lingeringly-unadvantageous-muriel.ngrok-free.dev -> http://localhost:8000
```

but every request through it is now rejected by ngrok itself, before reaching
Laravel:

```
$ curl -X POST https://lingeringly-unadvantageous-muriel.ngrok-free.dev/app/integrations/github_app/webhook
HTTP/2 403
ngrok-error-code: ERR_NGROK_725
→ "This ngrok account has reached its network bandwidth limit for the month."
```

The same request straight to the app returns `401` — i.e. the endpoint is healthy
and the signature check is doing its job:

```
$ curl -X POST http://localhost:8000/app/integrations/github_app/webhook -d '{}'
HTTP 401
```

Empirical confirmation: an empty commit pushed to `brwererb` at ~`07:03 UTC`
produced **no new delivery row** — count stayed at 15, newest still
`issues @ 06:46:26`. The last delivery of any kind was `06:46:26 UTC`; the
merge-strategy pushes I made at `06:49–06:51 UTC` never arrived.

**Only the human can fix this** (ngrok plan, new account, or a different tunnel).

**Resolution.** Fixed by the human. The tunnel is now
`https://cadmium-armchair-anymore.ngrok-free.dev` — a *different* hostname from the
exhausted one, and the GitHub App's webhook URL was updated to match, since
deliveries arrive again. Re-verified end to end at 07:30 UTC:

```
$ curl -X POST https://cadmium-armchair-anymore.ngrok-free.dev/app/integrations/github_app/webhook -d '{}'
HTTP 401                                    # reachable, signature check alive

$ git -C /var/www/html/brwererb push origin main      # one empty commit
deliveries: 17 -> 19
  push         2026-08-21 07:30:11
  check_suite  2026-08-21 07:30:12

storage/logs/laravel.log:
  DEBUG: GITHUB APP WEBHOOK EVENT NOT INGESTED
    {"event":"push","installation_id":155380753,"delivery":"2474a2ac-9d32-11f1-8d93-91f61fe10756"}
```

The whole transport path — tunnel, signature verification, delivery ledger, queue
dispatch, job execution — is confirmed working. The job then discards the push,
which is blocker A.

Caveat for the next session: this is a free ngrok tunnel, so the hostname changes
on every agent restart, and the GitHub App webhook URL has to be updated each time.
Any delivery gap in the ledger should be checked against that first.

---

## 3. Reference substitution — `WW-1234` / `EVI-77` do not exist

There is no `WW` or `EVI` project key in this workspace. The two project keys that
map to the actual test repositories are:

| Placeholder in the brief | Real project key | Project name | Project id | Usable task refs |
|---|---|---|---|---|
| `WW-1234` | **`BER`** | `brwererb` | 289380 | `BER-1`, `BER-2`, `BER-3` |
| `EVI-77` | **`NRW`** | `new-repo-2` | 289381 | `NRW-1` … `NRW-100` (74 tasks) |

A trap worth flagging: tasks `BER-2` and `BER-3` are literally **titled**
`WW-1234` and `EVI-77`. Their real references are `BER-2` and `BER-3`. A commit
message saying `WW-1234` will not resolve to task 130165 — it resolves to nothing.
Anyone re-running this brief verbatim would be writing references that cannot
link, and would then record "task linking is broken" as a finding. It is not; the
reference is simply wrong.

Recommended substitution for the scenario scripts: `BER-2` everywhere the brief
says `WW-1234`, and `NRW-30` everywhere it says `EVI-77`.

---

## 4. Scenario status

Every scenario is blocked. The "blocked on" column lists only what is *additionally*
required beyond blockers A, B and C, which apply to all of them.

| Scenario | Expected | Actual | Status | Also blocked on |
|---|---|---|---|---|
| S1 backdated + session detection | two sessions at 120m gap | not run | **blocked** | `gh:sessions` does not exist; and see §5.5 — the schema has no `authored_at` column, so the first check cannot pass as written |
| S2 midnight boundary | day attribution defined and consistent | not run | **blocked** | no daily grouping code exists to observe |
| S3 amend + force push | `payload.forced` handled, no double count | not run | **blocked** | no commit rows exist to supersede |
| S4 large push (60 commits) | truncation handled, per-commit API cost known | not run | **blocked** | no per-commit API call exists to measure |
| S5 tag / branch-create / branch-delete | zero rows, zero errors | not run | **blocked** | would trivially "pass" for the wrong reason |
| S6 bot commits | bot detected, not attributed to a member | not run | **blocked** | requires a workflow run, which requires the tunnel |
| S7 inactive repository | quiet no-op | not run | **blocked** | would produce a false pass — every repo is inactive *and* nothing ingests |
| S8a duplicate delivery, same ID | accepted, no job dispatched | not run | **blocked** | mechanism exists in the controller (see below) but `gh:replay` does not |
| S8b duplicate delivery, new ID | no duplicate commit rows | not run | **blocked** | second line of defence **cannot exist** — there is no commit table in use to be unique on |

**S8 is worth a specific note.** Variant A's mechanism is already implemented and
looks correct — `GithubAppWebhookController` dedupes by insert against
`github_app_webhook_deliveries`, catching `UniqueConstraintViolationException`
rather than doing select-then-insert, so two concurrent redeliveries cannot both
pass. Variant B, the important one, is the question the brief predicted: the
second line of defence does not exist today, because commits are not stored at
all. When ingestion lands, SHA uniqueness must land with it — see §6.

---

## 5. Bugs and defects found during the audit

These are defects, not decisions. All were found while verifying prerequisites.

### 5.1 The queue worker's arguments are malformed; it works by accident

The running worker is:

```
php artisan queue:work --queue=github,default, delayed_github
```

The space after the trailing comma splits this into `--queue=github,default,` plus
a **positional argument** `delayed_github`. `queue:work {connection?}` takes that
positional as the *connection*, so the worker runs:

- connection = `delayed_github`
- queues = `github`, `default`, `` (empty, from the trailing comma)

Jobs are nevertheless processed, and promptly — delivery at `06:42:21`, job logged
at `06:42:23`. The reason is `DatabaseQueue::getQueue()`:

```php
public function getQueue($queue)
{
    return $queue ?: $this->default;
}
```

The empty third queue name falls back to the `delayed_github` connection's default
queue, which is `delayed_github`. So the intended queue is consumed purely because
of a stray comma. Remove the space and it still works; remove the comma and
GitHub App webhook processing silently stops.

Correct invocation: `php artisan queue:work --queue=delayed_github,github,default`

Separately, `app/Console/Kernel.php:188` schedules
`queue:work --stop-when-empty --queue=delayed_github` every minute, but **no
scheduler is running** — no `schedule:work` process, no `schedule:run` in cron.
The manual worker is the only thing processing these jobs.

### 5.2 Applied migrations whose files no longer exist

`migrations` records batches 407–412 as run, but the corresponding files are not in
`database/migrations/` — they are only in `stash@{0}`. Consequences:

- `php artisan migrate:rollback` on this database will fail for those batches
- a fresh clone + `migrate` produces a database **without** `github_commits` et al,
  while this machine has them — so local behaviour is not reproducible elsewhere
- the tables are unreferenced, so nothing surfaces the drift

### 5.3 Duplicate repository rows across installations

`brwererb` and `new-repo-2` each appear twice in `github_app_repositories`, once
under soft-deleted installation `155209089` and once under live `155380753`.
Whether re-installing should reuse or duplicate repository rows is a real design
question — flagged here as an observation, since it affects any future
"is this repository active" lookup that does not scope by installation.

### 5.4 Raw payloads are not retained anywhere — `gh:payload` cannot be built

`github_app_webhook_deliveries` has exactly three columns:

```
delivery_id   varchar(64)
event         varchar(50)
received_at   timestamp
```

There is no payload column and no payload written to disk. `gh:payload {sha}`, as
specified, requires retaining raw payloads — that needs a schema change (a nullable
`payload` JSON/longtext column plus the config flag the brief describes,
defaulting off and enabled only in `local`). This is unavoidable extra work before
Step 0 can be completed, and it should be called out as scope rather than absorbed
silently.

### 5.5 `github_commits` has no `authored_at` column

From the live schema (the table created by the stashed migration):

```
sha, message, branch, author_github_id, author_email, author_name,
author_user_id, time_logged, committed_at, html_url, ...
```

There is `committed_at` but **no `authored_at`**. S1's first check —
"`authored_at` matches the backdated values, not the push time" — cannot pass
against this schema; there is nowhere to store it. Since git's author date and
committer date diverge on exactly the operations S1 and S3 exercise (backdating,
amend, rebase), and since the author date is the one that reflects when the work
was actually done, this is a schema gap that has to be closed *before* S1 is
meaningful, not a scenario failure to be recorded afterwards.

Related: the merge-strategy investigation run earlier today against this same
repository showed that a rebase preserves the author date exactly
(`2026-08-21T10:49:56+04:00` on both the original and the rebased commit) while
rewriting the SHA and replacing the committer. Storing only `committed_at` throws
away the one field that survives a rebase intact.

---

## 6. Decisions still required (unchanged by this audit)

The brief asks for recommendations, not unilateral choices. None of these can be
settled by observation yet, so they are carried forward with what evidence does
exist:

| Question | What is known now | Still needed |
|---|---|---|
| Force-push handling: delete / orphan-flag / keep | Nothing stored, so nothing to supersede | S3, once ingestion exists |
| Midnight boundary: workspace tz vs author-local | No daily grouping code exists; `committed_at` is a `timestamp` (UTC), and there is no `authored_at` to group by | S2, plus the §5.5 schema fix |
| Bot detection rule | Not observable — no payload retention (§5.4) means the available author fields cannot even be enumerated | S6, plus payload retention |
| SHA-level dedup in addition to delivery-ID dedup | **Yes, required.** Delivery-ID dedup exists and is sound, but it cannot protect against the same commit arriving under a different delivery ID — which today's merge-strategy run demonstrated happens routinely: a merge-commit merge redelivers all three branch commits under their original SHAs in the `main` push. Without a SHA unique constraint every merged PR double-counts | Confirmation via S8b once commits are stored |

The last row is the one item this audit can answer with evidence rather than
speculation, and it should be treated as settled: `UNIQUE(repo, sha)` is not
optional.

## 7. Cost extrapolation

Not measurable. S4 was not run, and no per-commit API call exists to measure.

For reference, the only rate-limit figures observable today come from installation
sync, logged during the setup callback:

```
rate_limit_remaining: 4999 → 4998  (installation repo sync)
```

That is a 5000/hour installation token budget, consistent with GitHub's documented
limit for GitHub App installation tokens. A per-commit API call at that ceiling
would put a 200,000-commit backfill at 40 hours of pure rate-limit wall-clock
before any processing time — which is precisely why S4's "is there a per-commit
API call at all" question matters. But this is arithmetic on an assumption, not a
measurement, and should not be quoted as a finding until S4 actually runs.

## 8. Fixtures

None. `tests/Fixtures/GitHubApp/` was not created — no payload was captured,
because no delivery arrived after the tunnel hit its bandwidth limit, and no
payload is retained by the current schema in any case.

---

## 9. What is needed to unblock

**From the human (cannot be done from here):**

1. ~~**ngrok** — restore tunnel capacity.~~ **Done 2026-08-21 07:30 UTC.**
2. **Decide what to do with `stash@{0}`** — land it, or state that GitHub App
   ingestion is to be written fresh against the App path rather than the OAuth
   path. This is the structural blocker and everything else waits on it.
3. **Dependabot** — still needed if S6 is to be run in its original form rather
   than the workflow substitute.

**Configuration, once ingestion exists:**

4. Activate at least one repository in the workspace (`brwererb` for S1–S6/S8),
   and deliberately leave `new-repo-2` inactive for S7 — so S7's no-op can be
   distinguished from a global no-op.
5. Fix the queue worker invocation (§5.1) so that processing does not depend on a
   stray comma, and start a scheduler if the scheduled worker is meant to run.

**Scope that must be added before Step 0 completes:**

6. Payload retention + config flag (§5.4) — otherwise `gh:payload` and every saved
   fixture are impossible.
7. An `authored_at` column on the commits table (§5.5) — otherwise S1, S2 and S3
   test something other than what they claim to test.

Once 1–7 are in place, Step 0's four commands can be built and S1–S8 run as
specified, with `BER-2` / `NRW-30` substituted for `WW-1234` / `EVI-77`.
