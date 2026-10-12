# AI Development Workflow — WhisperAct Website

## Workflow

**User → Codex scopes and prompts → Claude investigates and implements → Claude self-reviews and verifies → Codex assesses evidence → focused follow-up if needed → authorized commit → deployment validation → authorized publishing**

Codex turns the user's request into a focused task. Claude investigates, executes the authorized scope, self-reviews, verifies, and reports. Codex assesses the evidence and decides the next step. Sufficient evidence advances the work without a second full investigation or review.

The agent-specific contracts are [AGENTS.md](AGENTS.md) for Codex and [CLAUDE.md](CLAUDE.md) for Claude Code. This document defines shared process, not site architecture.

## Current repository

WhisperAct.com is a static site published through GitHub Pages. The repository root holds hand-written HTML pages, `menu.js`, images, video, `robots.txt`, `sitemap.xml`, `site.webmanifest`, a search-console verification file, and `CNAME`. Pages use directory routes (`/privacy` → `privacy/index.html`; likewise `/terms`, `/support`, `/blog`, and each `/blog/<slug>`). There is no package manager, build step, or backend. Check the live tree rather than relying on this summary.

The planned sequence is: establish this workflow, migrate the site unchanged to Namecheap shared hosting (cPanel), decide the future frontend/backend technology, then improve design, animation, performance, and selected marketing features. Each step requires its own authorization. Astro, Laravel, and Node.js are options under discussion, not decisions; possible future features are not approved requirements.

## Ownership

| Owner | Responsibility |
|---|---|
| User | Product, content, legal-copy, and technology decisions; approval of high-impact or destructive actions; authorization to publish, deploy, or change hosting, DNS, SSL, email, or GitHub Pages settings. |
| Codex | Scoping, prompt design, process guidance, evidence assessment, and next-step decisions. Direct implementation or independent review only when explicitly requested. |
| Claude Code | Investigation, implementation, regression analysis, self-review, verification, implementation-related documentation, factual reports, and authorized staging or commit preparation. |

The current task can explicitly authorize more. Tool permissions do not expand task scope or transfer ownership. Material product decisions stay visible; neither agent silently replaces one with a convenient choice.

## Task definition

Every task states, as relevant:

- **Outcome and acceptance criteria** — observable results.
- **Scope** — files, pages, or areas in play.
- **Exclusions** — what must not change (for example: legal copy, `CNAME`, public URLs, hosting settings).
- **Open decisions** — choices the user still owns, and whether work depending on them is blocked.
- **Git authorization** — whether staging or committing is allowed.

## Standing website guidance

- Verify relevant live code before relying on old plans, reports, or memory.
- Finish authorized work without asking for confirmation on routine choices within scope. Surface material product decisions and continue independent work while they remain open.
- Keep changes focused. Avoid speculative refactors and unnecessary dependencies.
- Preserve existing public URLs, including `/privacy`, `/terms`, `/support`, and blog routes, unless a URL change is explicitly authorized.
- Verify customer-facing app claims against current evidence. Development code alone does not prove a feature is available in the released app.
- The Tappr/iOS repository is read-only for website tasks unless the user separately authorizes an iOS change. Website work must not depend on it being present.
- Keep hosting migration separate from redesign and framework conversion.
- Never expose credentials or place secrets in frontend code or documentation.
- Future deployment packages must separate public website files or build output from repository-only material: these agent documents, configuration, and private files.
- Do not create additional agents unless the user explicitly authorizes them.

## Engineering states

Evidence states and outstanding gates, not a mandatory sequence.

| State | Meaning |
|---|---|
| Investigating | Scope, current behavior, or acceptance criteria are being established. |
| Implementing | Authorized changes are in progress. |
| Locally verified | Relevant local checks passed for an identified revision or working-tree state; unrun checks are disclosed. |
| Safe to commit | Sufficient verification for the scope, a clean commit boundary, and no commit-blocking issue. Deployment gates may remain open. |
| Committed | A specific commit exists; report its hash. Says nothing about deployment. |
| Deployment validation required | Behavior on the target host still needs checking: URLs, redirects, assets, HTTPS, caching, and rollback. |
| Safe to publish | Required decisions, local checks, and deployment validation are complete with evidence. Publishing authorization remains the user's. |

**Safe to commit does not mean safe to publish.** Neither readiness assessment authorizes staging, committing, pushing, deploying, or changing production services. On GitHub Pages, pushing to the published branch publishes the site, so a push is a publishing action.

## Evidence and verification

Scale verification to the change:

- **Documentation:** content, links, scope, and whitespace.
- **Visual changes:** representative desktop and mobile checks, keyboard access, reduced motion, and relevant performance checks.
- **Routing/deployment:** URLs, redirects, assets, HTTPS, and rollback.
- **Backend behavior (if one is ever authorized):** meaningful success and failure paths.

Identify the revision or working/staged state the evidence covers, and give the exact commands and results. Separate new checks from earlier evidence; rerun only what later changes invalidated. Always run `git diff --check` after edits, and also check new untracked files, which it does not cover. Report checks not run and why. Never invent test results, hosting capabilities, or deployment success.

This repository has no build or test command. Do not treat npm, PHP, or iOS build commands as requirements unless an authorized change introduces them.

Codex requests more evidence only for a meaningful gap, contradiction, changed scope, or unsupported claim.

## Completion report

Use the relevant items; a small task can use a short report without dropping material limitations. Mark an expected check that did not run as **not run**, with the reason.

1. **Outcome:** what changed and which acceptance criteria are met.
2. **Findings/cause:** evidence for the cause or investigation result.
3. **Files changed:** with purpose.
4. **Intentionally unchanged:** preserved behavior, URLs, and exclusions.
5. **Verification:** commands or checks and actual results, including `git diff --check` and untracked-file checks.
6. **Not verified:** skipped checks, unavailable environments, and what remains unproven.
7. **Git state:** HEAD, staged/unstaged/untracked files, unrelated work left alone, and the proposed commit boundary.
8. **Open decisions:** options, recommendation, and what is blocked.
9. **Safe to commit?** yes/no, with reasons.
10. **Safe to publish?** yes/no, with remaining deployment gates.

## Git and publishing boundaries

- Inspect Git state before changes and again before staging. Preserve unrelated staged, unstaged, and untracked work.
- Use explicit file or hunk boundaries when preparing a commit; never stage the whole tree blindly. Confirm the commit is reproducible from a clean checkout.
- **Staging ≠ committing ≠ pushing ≠ publishing.** Each needs its own authorization; one does not imply the next.
- Destructive Git operations require explicit need and authorization.
- DNS, hosting, SSL, email, and GitHub Pages settings change only with explicit authorization for that change.
