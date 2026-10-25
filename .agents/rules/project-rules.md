# Project Rules — ISRO's PR

## Memory & Context Rules

1. **Always check `.agents/AGENTS.md`** at the start of every conversation for project context.
2. **Update `.agents/memory/session-log.md`** after completing significant work — append a dated entry summarizing what was done.
3. **Update `.agents/AGENTS.md`** when key decisions are made, architecture changes, or new files are added.
4. **Never assume** — if context is missing, read the memory files before proceeding.

## Coding Standards

1. Write clean, well-commented code.
2. Use meaningful variable and function names.
3. All files must have a header comment explaining their purpose.
4. Follow the tech stack conventions once decided.

## Git Workflow

1. Commit frequently with descriptive messages.
2. Use conventional commit format: `feat:`, `fix:`, `docs:`, `refactor:`, `chore:`.
3. Never commit secrets, API keys, or credentials.

## Communication

1. When uncertain, ask the user rather than guessing.
2. Provide clear progress updates.
3. Reference memory files when explaining past decisions.
