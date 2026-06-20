# Migration Summary

Migrated the primary `blom-cosmetics-main` Claude Code setup into Codex-native repository guidance while preserving all Claude files. The migration converts the root Claude cost-review requirement into a Codex skill, keeps the existing n8n-as-code skill as the workflow authority, adds Codex MCP configuration for Supabase, and documents unresolved security and setup follow-up.

# Inventory

Primary repository: `blom-cosmetics-main`.

- `CLAUDE.md`: Root Claude instruction requiring `/cost-reducer` after code changes.
- `.claude/mcp.json`: Claude Supabase MCP HTTP server for project `yvmnedjybrpvlupygusf`.
- `.claude/settings.local.json`: Local Claude permissions for shell, file, web, and multiple MCP connector namespaces.
- `.mcp.json`: Root MCP server configuration for the same Supabase project.
- `AGENTS.md`: Existing n8n-as-code generated bootstrap context.
- `.agents/skills/n8n-architect/SKILL.md`: Existing Codex-compatible n8n-as-code workflow skill.
- `.github/agents/n8n-architect.agent.md`: Generated workspace-agent version of the n8n skill.
- No `.claude/skills/`, `.claude/commands/`, `.claude/agents/`, or `.claude/hooks/` folders were present in `blom-cosmetics-main`.
- No existing `.codex/` folder was present.
- Project docs inspected: `README.md`, `ENVIRONMENT_VARIABLES.md`, `PAYFAST_SETUP.md`, `CHECKOUT_FLOW_DOCUMENTATION.md`, `docs/academy-database-schema.md`, `COURSE_ENROLLMENT_FLOW.md`.
- Tooling inspected: `package.json`, `package-lock.json`, `netlify.toml`, `vercel.json`, `.nvmrc`, `.gitignore`, `.netlifyignore`, TypeScript/ESLint/Tailwind/Vite config locations.

Other Claude setups found in sibling workspace folders and left unchanged:

- `watercolor-workshop/.claude/settings.local.json`
- `watercolor-workshop/.mcp.json`
- `watercolor-workshop/AI_RULES.md`
- `Blom-Admin-Trae/.claude/settings.local.json`
- `Blom-Admin-Trae/blom-admin/.claude/mcp.json`
- `Blom-Admin-Trae/blom-admin/.claude/BundleFix_Summary.md`
- `Blom-Admin-Trae/blom-admin/.claude/ShopPage (1).tsx`
- `Blom-Admin-Trae/blom-admin/.claude/ShopPage_BundlesFixed.tsx`

# Mapping

| Claude source | Codex destination | Action taken | Notes |
|---|---|---|---|
| `CLAUDE.md` | `AGENTS.md` and `.agents/skills/cost-review/SKILL.md` | Converted | Preserved the cost-review intent without Claude-specific `/cost-reducer` command syntax. |
| `.claude/mcp.json` | `.codex/config.toml` | Converted | Supabase MCP URL copied without secrets. Authentication remains external/manual. |
| `.claude/settings.local.json` | `AGENTS.md`, report manual follow-up | Partially mapped | Broad local permissions have no safe repo-scoped Codex equivalent. |
| `.mcp.json` | `.codex/config.toml` | Merged | Same Supabase server as `.claude/mcp.json`. |
| Existing `AGENTS.md` n8n block | `AGENTS.md` | Preserved and wrapped | Kept generated block intact in meaning, added Codex project guidance above it. |
| `.agents/skills/n8n-architect/SKILL.md` | Same path | Left unchanged | Already valid Codex skill. Listed in `AGENTS.md`. |
| `.github/agents/n8n-architect.agent.md` | `.codex/agents/n8n-architect.toml` | Converted | Added Codex custom agent wrapper that points to the skill as source of truth. |
| Missing `.claude/skills/` | None | No action | No Claude skills to copy. |
| Missing `.claude/commands/` | None | No action | No Claude commands to convert. |
| Missing `.claude/hooks/` | None | No action | No hooks to map. |
| Sibling project Claude files | None in `blom-cosmetics-main` | Left unchanged | Separate projects with separate context; inventoried only. |

# Files Created

- `.agents/skills/cost-review/SKILL.md`
- `.codex/config.toml`
- `.codex/agents/n8n-architect.toml`
- `docs/ai/CODEX_MIGRATION.md`

# Files Updated

- `AGENTS.md`
- `.gitignore`

# Preserved Claude Files

Confirmed preserved and unmodified:

- `CLAUDE.md`
- `.claude/mcp.json`
- `.claude/settings.local.json`

# Skills Migrated

| Skill | Trigger | Location |
|---|---|---|
| `cost-review` | Use after code/config changes that may affect cloud, infrastructure, APIs, database, bundles, automation, or operational cost. | `.agents/skills/cost-review/SKILL.md` |
| `n8n-architect` | Use for n8n workflow creation, editing, validation, sync, push/pull, testing, and troubleshooting. | `.agents/skills/n8n-architect/SKILL.md` |

# MCP Migration

Converted the Supabase MCP server into Codex TOML:

- Codex destination: `.codex/config.toml`
- Server: `supabase`
- URL: `https://mcp.supabase.com/mcp?project_ref=yvmnedjybrpvlupygusf&features=docs%2Caccount%2Cdatabase%2Cdebugging%2Cdevelopment%2Cfunctions%2Cbranching%2Cstorage`

No API keys or tokens were copied. Manual authentication may still be required through Codex's MCP authentication flow or user environment, depending on the local Codex version and Supabase MCP requirements.

# Agents and Commands

- Created `.codex/agents/n8n-architect.toml` for the distinct n8n-as-code role.
- No Claude commands existed under `.claude/commands/`, so no prompt files were created.
- No Claude specialized agents existed under `.claude/agents/`; the generated GitHub agent was mapped to one Codex custom agent.

# Conflicts Resolved

- `package.json` and `netlify.toml` specify Node 22, while `.nvmrc` says Node 20. `AGENTS.md` now instructs Codex to prefer Node 22 unless the user decides otherwise.
- Existing `AGENTS.md` said it was generated n8n bootstrap context only. The migration kept the generated block and added project-level Codex instructions above it, with a reminder not to hand-edit generated n8n state.
- `ENVIRONMENT_VARIABLES.md` contains real-looking credentials and tokens despite warning not to commit secrets. New Codex files reference variable names only and flag the existing file for cleanup.

# Manual Follow-Up

- Rotate any real secrets already present in `ENVIRONMENT_VARIABLES.md`, `.env`, or `.env.production` if they have been committed or shared.
- Decide whether `.nvmrc` should be updated from `20` to `22` to match `package.json` and `netlify.toml`.
- Authenticate the Supabase MCP server for Codex if required.
- If n8n work is needed, verify the generated context root path still exists or regenerate with `npx --yes n8nac update-ai`.
- Sibling projects (`watercolor-workshop`, `Blom-Admin-Trae`) have their own Claude setups and were not merged into this repository's Codex setup.

# Verification

Checks performed:

- Inspected Claude, MCP, AGENTS, existing skill, GitHub agent, package, build, deployment, env, and project documentation files.
- Confirmed `CLAUDE.md` and `.claude/` files were not edited.
- Created only repository-scoped Codex files.
- Preserved the existing unrelated dirty worktree state, including deleted `public/` assets.
- Markdown/YAML front matter validation for `.agents/skills/*/SKILL.md`: passed.
- TOML syntax validation for `.codex/config.toml` and `.codex/agents/n8n-architect.toml`: passed.
- Reference/path checks for `AGENTS.md`, skills, Codex config, and report paths: passed.
- Secret-pattern scan of newly created Codex files: passed; matches were warning text and variable names only, not copied secret values.
- `npm run build`: passed after rerunning in unrestricted execution mode.
- `npm run typecheck`: failed on pre-existing application TypeScript issues unrelated to the migration, including unused imports/variables, missing `../lib/products`, Supabase auth type mismatches, course data union property issues, cart item type mismatch, and test runner globals missing from `src/tests/ProductDetailPage.test.tsx`.
- `npm run lint`: failed on pre-existing application lint issues unrelated to the migration, including parse errors in `ShopPage-Fix/ShopPage (1).tsx` and `frontend_max_discount_bypass_fix.js`, many `no-explicit-any` violations, unused variables, empty blocks, and React hook dependency warnings.
- Cost review: low/none for runtime cost. The migration adds agent instructions, local Codex MCP metadata, and documentation only; it does not change application runtime paths, database queries, functions, workflows, bundles, or production infrastructure.

The existing `.gitignore` ignored all of `.agents/`. It was updated to keep `.agents/skills/**` trackable so repository-scoped Codex skills can be versioned while other local `.agents` state remains ignored.

# How to Verify Codex Loads Everything

From the repository root:

```bash
cd "C:\Users\User\Desktop\Blom Cosmetics\Blom-Debug\blom-cosmetics-main"
codex
```

Then ask Codex:

```text
Summarize the project rules from AGENTS.md and list available repository skills.
```

For file-level verification without starting another nested Codex session:

```bash
Get-Content -Raw AGENTS.md
Get-ChildItem -Recurse .agents\skills
Get-Content -Raw .codex\config.toml
Get-Content -Raw .codex\agents\n8n-architect.toml
```
