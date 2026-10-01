# AI-assisted engineering

Field Inspections runs no AI inference. AI coding agents are used as development tools, and their changes meet the same bar as any other change.

1. **Constraints first.** Give the agent [AGENTS.md](../AGENTS.md) and [DESIGN.md](../DESIGN.md) as explicit constraints, with a bounded task and observable acceptance criteria.
2. **Real APIs only.** Resolve APIs against the versioned Expo SDK 57 documentation and the installed type definitions. Reject invented APIs and packages.
3. **Rules stay in code.** Business transitions stay pure, untrusted data is validated at boundaries and persistence stays serialized. Model output never replaces these rules.
4. **Review every diff.** Check for unnecessary dependencies, secret exposure, wider permissions, data-loss paths, accessibility regressions and claims the app does not support.
5. **Verify.** Run `npm run check`, `npm run format:check` and `npx expo-doctor`, and exercise native changes on simulators or devices. Never report a check as passing unless it ran.
6. **Data boundaries.** Never give a model customer code, real photos, personal data or credentials.
