# Work OS V2 — AI Architecture

**Status:** LOCKED ARCHITECTURE TARGET  
**Date:** 2026-09-03

## 1. Purpose

AI is a first-class Work OS intelligence layer over authorized business context. It helps users understand, plan and operate work, but it does not become a second authorization system or a hidden source of truth.

The architecture must remain provider-abstracted so the product can change AI vendors without rewriting Work/People/Communication domains.

## 2. Non-negotiable rules

1. Provider secrets are server-side only.
2. AI sees only context the authenticated user is authorized to access.
3. Organization scope is validated, not trusted from browser preference.
4. AI never bypasses RLS/RBAC/trusted mutation boundaries.
5. AI output is untrusted proposal/content until validated by the target domain.
6. Protected record changes require the same domain validation as human-driven changes.
7. Significant AI-assisted mutations are auditable.
8. No fake production AI response when a provider is unavailable.
9. AI does not perform disciplinary, payroll or punitive HR decisioning.
10. Hidden surveillance/productivity signals are not AI ranking inputs.

## 3. Action levels

### READ
AI analyzes authorized context without mutating authoritative business records.

Examples:
- summarize a Project
- explain blockers
- summarize a conversation
- answer a question across authorized files
- prepare a daily briefing

READ operations may run without a separate confirmation after normal user invocation, provided data-access policy allows it.

### DRAFT
AI prepares structured proposed changes.

Examples:
- draft a project plan
- draft milestones/tasks/subtasks
- draft a recovery plan
- draft a status update
- draft tasks from a meeting/conversation

Drafts are not authoritative Work records and must be clearly labelled as drafts.

### EXECUTE
AI causes authoritative domain mutations.

Requirements:
- authenticated user
- validated organization/membership
- action-specific permission
- user confirmation for significant writes
- target-domain schema validation
- trusted mutation path
- optimistic/concurrency checks where relevant
- audit evidence where required
- bounded result/error returned to UI

AI must not call the database with elevated authority merely because it is AI.

## 4. Layered architecture

Recommended conceptual flow:

`AI UI / Agent Center`

→ `AI use-case / orchestration layer`

→ `AI authorization + context builder`

→ `provider-neutral AI client`

→ `server/Edge provider adapter`

→ `external model provider`

For actions:

`AI structured proposal`

→ `human review/confirmation`

→ `normal Work OS domain use-case`

→ `repository / trusted server mutation`

→ `RLS / DB constraints / audit`

AI does not own Project, Task, People or Time repositories.

## 5. Provider abstraction

Create a provider-neutral interface capable of operations such as:
- structured generation
- text summarization
- classification/extraction
- tool/action planning
- embeddings/retrieval if later approved
- streaming response where UX requires it

Provider configuration should be represented as server configuration, never bundled browser secrets.

If no provider is configured, UI should show a safe state such as:

> AI is not configured for this environment.

It must not silently return canned/fake insights.

## 6. AI request context

Every AI request envelope should contain only bounded, validated metadata such as:
- authenticated user identity reference
- tenant/organization scope
- membership/role capabilities
- current route/entity context
- requested AI capability
- action level
- approved data-source references
- correlation/request ID

Do not put access tokens, provider keys, unrestricted database dumps or unrelated organization data into prompts.

## 7. Context building

The AI context builder queries normal authorized domain services/repositories.

Examples:

### Project context
May include, if the user can read them:
- Project fields
- milestones/tasks/subtasks
- dependencies
- assignments
- progress/health
- relevant recent activity
- selected conversation summaries/messages
- selected files/evidence metadata/content allowed by policy
- time aggregates
- Work Impact Graph signals

### Employee/My Work context
May include only the user's authorized work and legitimate planning context. It must not infer hidden performance rankings.

### Org Admin context
May include organization-level operational projections permitted to Org Admin, never Platform-wide/customer-crossing context.

## 8. Prompt injection and untrusted content

Messages, uploaded documents, task descriptions and external content are untrusted input.

AI tooling must:
- distinguish system policy/tool definitions from retrieved user content
- never follow retrieved instructions that attempt to override Work OS policy
- restrict available tools by requested capability and permission
- validate tool/action arguments independently
- cap context size and data scope
- avoid secrets in prompts

Document/file retrieval should preserve source references so summaries/answers can identify what context informed them where practical.

## 9. Structured output

Whenever AI output feeds a Work OS draft/action, require a typed schema rather than parsing arbitrary prose.

Example Project Autopilot draft shape:

```ts
type ProjectAutopilotDraft = {
  summary: string;
  assumptions: string[];
  milestones: Array<{
    title: string;
    description?: string;
    targetOffsetDays?: number;
    tasks: Array<{
      title: string;
      description?: string;
      estimatedEffortHours?: number;
      requiredSkills?: string[];
      dependencyRefs?: string[];
      suggestedAssigneeMembershipId?: string;
      riskNotes?: string[];
      subtasks?: Array<{ title: string; estimatedEffortHours?: number }>;
    }>;
  }>;
  projectRisks: string[];
  deliverables: string[];
};
```

Exact implementation types may differ, but all references must be validated against real authorized entities before execution.

AI may suggest a skill or assignee, but the application must verify the membership exists, is active, is in the same organization and is eligible before offering/persisting that assignment.

## 10. Project Autopilot

Input examples:
- project brief
- target date
- selected team/department
- selected templates/files
- constraints

Draft output:
- milestones
- tasks/subtasks
- dependencies
- estimated effort
- required skills
- suggested assignees
- timeline assumptions
- risks
- deliverables

UX flow:

`Describe → Generate Draft → Review/adjust → Validate dependencies/people/dates → Confirm → Execute through normal Work domain → Show created records`

Autopilot should never create dozens of authoritative records before user review.

## 11. Project Copilot

READ capabilities:
- project briefing
- what changed
- blockers
- overdue/at-risk work
- impact explanation
- dependency consequences

DRAFT capabilities:
- recovery plan
- stakeholder status update
- milestone/task additions
- schedule alternatives

Execution remains confirmation-gated.

## 12. Task Copilot

Capabilities:
- improve/clarify task description
- propose subtasks
- identify missing acceptance/evidence requirements
- suggest dependencies
- summarize task activity/conversation
- suggest next step

AI cannot mark a task complete merely because it believes work is done. Normal completion/evidence policy remains authoritative.

## 13. Communication intelligence

READ:
- summarize a channel/thread
- identify unresolved questions
- identify recorded decisions
- extract candidate action items

DRAFT:
- draft Tasks from action items
- draft meeting follow-up

The UI must distinguish extracted suggestion from confirmed decision/action.

## 14. Meeting intelligence

Target flow:

`Meeting/transcript or approved notes → summary → decisions → candidate actions → user review → draft Tasks/Milestones → confirmed creation`

Recording/transcription consent and external meeting integrations require separate privacy/product review.

## 15. Work Impact and risk intelligence

AI may interpret deterministic/derived Work Impact Graph signals but must not invent unexplained scores.

Example answer:

> Task X is high impact because it blocks five downstream tasks, two are already scheduled this week, and the Launch milestone depends on that chain.

AI risk output should expose contributing factors and uncertainty.

## 16. Workload Agent

Inputs may include approved:
- estimated effort
- assigned work
- due dates
- dependencies
- working capacity/availability
- skills metadata

Outputs:
- workload warnings
- suggested rebalancing
- candidate assignees
- schedule alternatives

It must not treat time tracked or activity alone as proof of productivity or employee value.

## 17. Agent Center

Target Agent Center manages/configures bounded agents such as:
- Project Manager Agent
- Risk Agent
- Workload Agent
- Reporting Agent
- Knowledge Agent
- Meeting Agent
- Onboarding Agent

Each agent needs:
- purpose
- allowed action levels
- allowed domain tools
- scope
- trigger mode (manual/scheduled/event-driven where approved)
- required confirmations
- execution history/audit visibility
- enabled/disabled state

Do not allow arbitrary all-powerful agents.

## 18. AI tool model

Tools should map to domain use-cases, not raw SQL/database access.

Examples:
- `readProject(projectId)`
- `listAuthorizedTasks(filters)`
- `draftTask(input)` (non-authoritative)
- `createTasksConfirmed(plan, confirmation)` through Work use-case
- `summarizeConversation(conversationId)`
- `readWorkloadProjection(scope)`

Tool registration must be permission/capability scoped.

## 19. Audit / observability

Log bounded operational metadata for AI calls/actions:
- request/correlation ID
- capability/agent
- organization
- actor identity reference
- action level
- provider/model identifier where appropriate
- result status
- confirmed mutation IDs where appropriate

Do not log raw secrets, access tokens, full sensitive prompts or unnecessary personal content.

Trusted domain audit remains the source of truth for authoritative mutations; AI operational logs complement it.

## 20. Failure behavior

Handle distinctly:
- AI not configured
- provider unavailable/time-out
- context not authorized
- requested source missing
- invalid structured output
- stale Work record during confirmed action
- permission changed between draft and execution
- organization switched while draft is open

A stale or unauthorized draft must not execute. Revalidation happens at execution time.

## 21. Data minimization / retention

Send only data required for the capability. Provider retention/training configuration must be reviewed before production enablement. Organization-level AI settings may later control allowed capabilities/providers subject to platform policy.

## 22. Testing strategy

Required test classes:
- provider adapter contract
- missing-provider safe state
- permission/context filtering
- cross-org denial
- READ vs DRAFT vs EXECUTE enforcement
- confirmation required for significant writes
- stale membership/organization switch before execution
- structured output validation
- prompt-injection/tool-scope defense
- no secret in browser/config payload
- target-domain RLS still blocks unauthorized mutation
- AI-generated assignments validated against active same-org membership

## 23. Delivery sequence

1. contracts/types and governance
2. server provider boundary + safe disabled state
3. context builder + permission tests
4. READ copilots
5. DRAFT flows
6. Project Autopilot
7. controlled EXECUTE flow
8. Agent Center
9. event/scheduled agents only after governance/audit are proven

## 24. Completion definition

AI V2 is not complete because a chatbot returns text. It is complete when it is:
- useful against real Work OS context
- provider abstracted
- permission aware
- organization scoped
- safe without provider config
- structurally validated
- confirmation governed
- auditable
- tested against cross-org/stale-action scenarios
