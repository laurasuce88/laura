# Human Assist Checklist (Sandbox + Production)

Use this file to explicitly separate human tasks and agent tasks.

## 0) Quick Entry Links (Human Console)

- Alipay Open Platform home: `https://open.alipay.com/`
- Web app onboarding entry: `https://open.alipay.com/module/webApp`
- Official preparation doc (PC website pay): `https://opendocs.alipay.com/open/270/01didh?pathHash=a6ccbe9a`
- Developer tools (key/sign tool entry): `https://open.alipay.com/tool`
- Sandbox entry: `https://open.alipay.com/develop/sandbox/app`

If any path changes in UI, enter from home page and locate via:

- `控制台 -> 我的应用 -> 网页/移动应用 -> 目标应用 -> 开发信息`

## A. Sandbox Phase

### Human must do

- open sandbox console: `https://open.alipay.com/develop/sandbox/app`
- get sandbox `app_id`
- set key mode and upload public key/cert as required
- provide sandbox private key/public key material to local env
- prepare sandbox buyer account and balance
- use sandbox app to complete real scan/pay test
- provide `notify_url` that is publicly reachable via HTTPS (tunnel/domain allowed for test)
- validate with sandbox buyer account (not merchant account) and keep payment screenshots/logs

### Implementing agent does

- wire sandbox env vars and gateway in backend
- implement precreate/query flow and frontend polling
- provide mock fallback if sandbox account not ready
- provide sandbox test cases and expected outcomes

## B. Production Phase

### Human must do

- create/open production app in Alipay Open Platform
- ensure product capability is enabled for production app
- finish platform-side compliance/business prerequisites
- configure production domain and callback URLs
- provision production key material via secure channel
- approve canary/full-release plan
- ensure on-call and incident owner are assigned before launch window
- execute at least one low-amount real payment + refund drill in production-safe window

Direct operator reference:

- [alipay-platform-operator-playbook.md](alipay-platform-operator-playbook.md)

### Implementing agent does

- implement production profile switching (`ALIPAY_ACTIVE_PROFILE`)
- enforce signature verification and amount/order checks
- add idempotency and reconciliation logic
- add observability (logs, metrics, alert points)
- generate go-live checklist and rollback runbook

## C. Production Go/No-Go Questions

All must be "yes" before go-live:

- Is production `notify_url` publicly reachable with HTTPS?
- Is notify signature verification passing with production key/cert?
- Is payment state transition idempotent under notify replay?
- Is amount mismatch rejected and audited?
- Is reconciliation job active and monitored?
- Is rollback action executable within minutes?

## D. Communication Template

When missing human inputs, use this structure:

- `Blocked by human setup`
- `Already completed by implementing agent`
- `Exact human actions to finish next`
- `What implementing agent will do immediately after inputs arrive`

Suggested wording:

- `Blocked by human setup: missing production notify_url and key upload confirmation.`
- `Already completed by implementing agent: payment routes, notify verification, idempotency, reconciliation skeleton, env profile split.`
- `Human next actions: finish app product enablement, upload public key, provide HTTPS notify_url, confirm canary window.`
- `Implementing agent next actions after input: switch to production profile, run end-to-end checklist, generate go-live evidence report.`
