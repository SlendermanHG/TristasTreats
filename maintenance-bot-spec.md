# Tristas Treats Maintenance Bot Specification

## 1. Purpose

This document defines the planned Codex-powered maintenance bot for the Tristas Treats platform.

This bot is not the primary owner workspace and is not the business operator. It is a maintenance and support system intended to help keep the platform healthy, organized, and easier to manage over time.

The goal is to make the bot understandable and maintainable by:

- Slender
- Trista
- future admins
- future developers
- future Codex agents or other AI maintenance systems

This document should remain easy to find and easy to understand.

## 2. Documentation Intent

The maintenance bot must be documented clearly enough that someone can quickly answer:

- what it is
- what it can do
- what it cannot do
- where it operates
- what data it touches
- what always requires human approval
- how to update it later

This means the final system should have clearly named docs, folders, and configuration locations.

## 3. Core Principle

The maintenance bot should begin as a maintenance assistant, not an autonomous operator.

That means:

- it can inspect
- it can summarize
- it can suggest
- it can prepare drafts
- it can flag issues
- it can recommend actions

But it should not silently make sensitive business changes on its own.

## 4. Primary Bot Responsibilities

The maintenance bot is intended to help with:

- site health checks
- broken links
- missing images or media references
- content consistency checks
- SEO/meta consistency checks
- admin content QA
- draft content preparation
- maintenance reminders
- identifying stale or incomplete content
- surfacing issues in logs or system health summaries
- backup/export reminders or checks
- highlighting records that may need cleanup

## 5. Actions The Bot May Eventually Perform

With proper permission boundaries, the bot may be allowed to:

- generate draft content changes
- draft gallery descriptions
- draft review moderation suggestions
- draft abundance item copy
- suggest homepage or page copy improvements
- suggest metadata improvements
- summarize analytics changes
- summarize inbox/order anomalies
- identify records missing required fields
- prepare maintenance reports

These should generally be treated as reviewable outputs first.

## 6. Actions The Bot Must Not Perform Autonomously

The maintenance bot must not autonomously:

- publish public content
- send customer-facing email
- delete customer data permanently
- delete orders permanently
- delete reviews permanently
- modify authentication or security settings
- reset passwords
- change role permissions
- change domain, DNS, mail, or billing settings
- perform production deploys without explicit approval
- alter audit logs
- silently change order status or business workflow state

## 7. Human Approval Requirements

These areas should require explicit human approval:

- public publishing
- any customer-facing communication
- any destructive action
- any auth or permission change
- any production infrastructure change
- any database migration
- any mailbox/inbox integration change

## 8. Likely Bot Placement

The maintenance bot should likely exist as an internal admin/maintenance tool available to:

- `Owner`
- `TechAdmin`

It should not be exposed publicly to customers.

It may eventually appear as:

- an internal maintenance dashboard module
- an internal assistant panel
- scheduled reports
- task suggestions in admin

## 9. Recommended Bot Scope For Phase 1

Phase 1 should be narrow and safe.

Recommended Phase 1 responsibilities:

- detect broken public links
- detect missing images/media references
- detect content sections missing required data
- identify unpublished drafts older than a threshold
- identify gallery entries missing descriptions/tags
- identify inquiries/orders missing important fields
- summarize recent analytics movement
- prepare a maintenance summary for review

Phase 1 should mostly produce:

- reports
- alerts
- drafts
- suggestions

Not automatic live changes.

## 10. Recommended Bot Scope For Phase 2

Possible Phase 2 responsibilities:

- create draft fixes automatically
- propose image/title cleanup
- propose abundance item expiration cleanup
- suggest review-to-gallery linking
- suggest contact merges
- suggest order data normalization
- generate internal summaries for Trista and TechAdmin

Still, Phase 2 should remain approval-based for sensitive actions.

## 11. Documentation Requirements For The Bot

When implemented, the bot should have easy-to-find documentation in clearly named files/folders.

Recommended doc structure:

- `build-spec.md`
  - overall site/platform build requirements
- `maintenance-bot-spec.md`
  - what the maintenance bot is and is not
- `docs/architecture/`
  - system-level technical design
- `docs/admin/`
  - admin/owner workspace docs
- `docs/bot/`
  - bot-specific technical docs
- `docs/runbooks/`
  - maintenance and recovery procedures

Recommended bot docs to create later:

- `docs/bot/overview.md`
- `docs/bot/permissions.md`
- `docs/bot/data-sources.md`
- `docs/bot/approval-rules.md`
- `docs/bot/update-process.md`
- `docs/bot/troubleshooting.md`

## 12. Naming And Discoverability Rules

To keep everything easy to find later:

- use plain, explicit filenames
- avoid vague names like `notes.md` or `misc.md`
- group docs by purpose
- keep one canonical file per major topic
- cross-link docs where helpful
- include short "what this file is for" text at the top of each document

## 13. Configuration Principles

When the bot is implemented, configuration should be easy to locate and understand.

Recommended principles:

- keep bot config separate from main app config where possible
- use explicit environment variable names
- document each variable and its purpose
- keep secrets out of repo
- clearly distinguish:
  - bot read permissions
  - bot draft/write permissions
  - bot approval-gated permissions

## 14. Logging And Audit Expectations

All bot activity should be logged in a way that makes review easy.

Important bot logs should include:

- what triggered the bot
- what it inspected
- what it suggested
- what it attempted
- whether an action required approval
- who approved it
- what changed

Bot actions should be visible enough that future admins can understand system behavior later.

## 15. OCI Direction

The user plans to create an OCI instance now.

The OCI-hosted component should be treated as future infrastructure for maintenance or supporting services, not as an excuse to skip documentation discipline.

Before implementation on OCI, we should still define:

- whether the bot runs on-demand, scheduled, or both
- whether it runs inside the main app or as a separate service
- what credentials it needs
- what systems it can access
- what approval workflow governs its actions

## 16. Current Direction Summary

Current recommendation:

- yes, plan a Codex-powered maintenance bot
- keep it internal only
- keep it documentation-heavy and easy to understand
- start with safe maintenance/reporting behavior
- require human approval for sensitive actions
- do not let it act like an autonomous business operator

## 17. Next Design Questions For The Bot

Before building the maintenance bot, the next questions to answer should be:

1. Should the bot run on a schedule, on demand, or both?
2. Should the bot be a separate service from the main app?
3. What exact data sources can it read?
4. What exact actions can it draft?
5. What exact actions, if any, can it execute after approval?
6. Where in the admin UI should it appear?

## 18. Locked Decisions

### Execution Model

- The maintenance bot should support both:
  - on-demand runs
  - scheduled runs

### Practical Interpretation

- on-demand runs support manual checks, investigations, and maintenance requests
- scheduled runs support recurring health checks, stale-content checks, and summary reporting

### Service Boundary

- The maintenance bot should be implemented as a separate service from the main app

### Why

- cleaner permission boundaries
- easier independent updates
- safer scheduling/background execution model
- better separation between business app behavior and maintenance automation

### Read Access

At launch, the maintenance bot may read:

- public site pages
- published content
- draft content
- gallery records
- reviews
- abundance items
- inquiries
- orders/projects
- contacts
- analytics summaries
- audit logs
- system health/error summaries

The maintenance bot should not have unrestricted access to:

- raw passwords
- secret tokens
- unrestricted mailbox credentials
- billing credentials
- domain/DNS credentials

### Drafting Permissions

At launch, the maintenance bot may draft for human review:

- content edits
- gallery descriptions
- gallery titles
- gallery tags
- abundance item copy
- review moderation suggestions
- contact merge suggestions
- order data cleanup suggestions
- maintenance reports
- analytics summaries
- broken-link fix suggestions
- missing-image/media fix suggestions

### Approval-Gated Execution

At launch, the maintenance bot may execute a narrow set of actions only after explicit approval.

Examples of approval-gated actions:

- publish already-reviewed draft content
- hide expired abundance items
- archive stale drafts
- apply approved metadata/content cleanup
- restore items from trash

The maintenance bot should not have broad autonomous execution authority.

### Admin Presence

The maintenance bot should appear in both of these ways:

- a dedicated maintenance section in admin for reports, history, configuration, and review
- an assistant entry point inside admin for quick interaction and requests

### Inbox Boundary

At launch, the maintenance bot should not operate inside Trista's inbox workflow as a participant.

It may only help with inbox health checks such as:

- whether inbox connectivity is functioning
- whether expected integrations are healthy
- whether mailbox-related security posture checks pass

It should not:

- read or summarize customer email threads for maintenance purposes by default
- draft customer-facing inbox replies
- execute inbox actions
- move, send, archive, or modify mailbox conversations

## 19. Implementation-Oriented Summary

The maintenance bot is defined well enough to be treated as planned implementation scope.

### Launch Shape

- separate service from the main application
- available both on demand and on a schedule
- internal/admin-only
- visible as:
  - a dedicated maintenance section
  - an assistant entry point inside admin

### Launch Read Scope

- public pages
- draft and published content
- gallery
- reviews
- abundance items
- inquiries
- orders/projects
- contacts
- analytics summaries
- audit logs
- system health/error summaries

### Launch Draft Scope

The bot may draft for human review:

- content edits
- gallery metadata improvements
- abundance copy
- review moderation suggestions
- contact merge suggestions
- order cleanup suggestions
- maintenance reports
- analytics summaries
- broken-link and missing-media fix suggestions

### Launch Approval-Gated Action Scope

The bot may execute only after explicit approval:

- publish already-reviewed draft content
- hide expired abundance items
- archive stale drafts
- apply approved cleanup changes
- restore from trash

### Launch Exclusions

The bot is not allowed to autonomously:

- send customer-facing email
- participate in inbox workflow
- delete permanently
- alter auth/security
- change roles
- change billing/domain/mail settings
- deploy production changes without explicit approval

### Inbox Rule

Inbox scope is limited to:

- inbox connectivity checks
- integration health checks
- mailbox-related security checks

No inbox content operation is part of launch bot behavior.
