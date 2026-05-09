# Project: claude-agents

Claude Code plugin marketplace — 81 plugins (80 local + 1 external via git-subdir), 185 agents, 153 skills, 100 commands.

## Repository Structure

```
claude-agents/
├── .claude-plugin/marketplace.json   # Registry of all plugins
├── plugins/                          # All 80 local plugins
│   ├── <plugin-name>/
│   │   ├── .claude-plugin/plugin.json
│   │   ├── agents/*.md
│   │   ├── commands/*.md
│   │   └── skills/<skill-name>/SKILL.md
│   └── ...
├── docs/                             # Documentation
└── tools/                            # Development utilities
```

## Plugin Authoring Conventions

### Agent frontmatter

```yaml
---
name: agent-name
description: "What this agent does. Use PROACTIVELY when [trigger conditions]."
model: opus|sonnet|haiku|inherit
---
```

### Skill structure

```
skills/<skill-name>/
├── SKILL.md              # Required
└── references/           # Optional
```

### plugin.json

Only `name` is required. Agents, commands, and skills are auto-discovered.

```json
{ "name": "plugin-name" }
```

## Model Tiers

| Tier   | Model   | Use Case                                               |
| ------ | ------- | ------------------------------------------------------ |
| Tier 1 | Opus    | Architecture, security, code review, production coding |
| Tier 2 | Inherit | Complex tasks — user chooses model                     |
| Tier 3 | Sonnet  | Docs, testing, debugging, support                      |
| Tier 4 | Haiku   | Fast ops, SEO, deployment, simple tasks                |

## Development

Use the Astral Rust toolchain: `uv` (package manager), `ruff` (linter/formatter), `ty` (type checker).
