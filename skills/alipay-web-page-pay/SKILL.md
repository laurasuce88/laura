---
name: alipay-web-page-pay
description: Build and harden Alipay PC Website Payment end-to-end (alipay.trade.page.pay + notify verification + active query + close/refund + reconciliation), including sandbox validation and production go-live rollout. Use when users ask for Alipay web checkout, QR/account pay on web, notify_url idempotency, sandbox-to-production migration, or online release readiness.
---

# Alipay Web Page Pay Skill

Implement a production-ready Alipay PC Website Payment integration, not just a demo.

## Required Inputs (Block If Missing)

Collect these first and return a blocking checklist if any are missing.

- `mode`: `merchant-self` or `isv-service-provider`
- `environment`: `sandbox` or `production`
- `app_id`
- signing mode: `public-key` or `certificate`
- merchant server stack (Node/Java/Python/PHP/.NET)
- public `notify_url` (HTTPS)
- business order source (`out_trade_no`, amount source, product title source)

If `mode=isv-service-provider`, also require `app_auth_token` flow.

## Human-Assisted Steps (Must Be Explicit)

Do not assume Codex can complete Alipay platform console operations automatically.
Always list human-owned setup tasks and mark them as blockers.

Human-owned mandatory items:

- create/open app in Alipay Open Platform
- enable target product for the app (PC website pay)
- obtain and provide `app_id`
- generate merchant private key and upload corresponding public key/certificate
- configure and publish `notify_url` (public HTTPS endpoint)
- complete sandbox buyer account preparation for sandbox tests
- complete production account/app compliance and activation steps

Classify input ownership clearly:

- can be shared directly in chat: `app_id`, `PID`, gateway URL, callback URL domain
- should be provided through secure local env/secret manager, not pasted in logs: merchant private key, cert private material
- public verification material (`ALIPAY_PUBLIC_KEY`) can be stored in env/config, but still avoid exposing in public logs

Codex-owned items:

- backend route implementation and SDK wiring
- signature verification logic and idempotency
- query/close/refund/reconciliation workflow
- env template generation, runbook, and test cases

If any human-owned blocker is missing, stop and return a clear checklist instead of pseudo-completion.

## Sensitive Data Handling Contract

When collecting config from users, enforce this rule:

1. do not request users to paste long private keys into chat when avoidable
2. prefer `.env` placeholders + local file/secret manager injection
3. if user already pasted secrets, remind immediate rotation before production go-live
4. never print secrets in generated logs, screenshots, or docs

## Output Contract (Always Return)

When this skill is used, produce all of the following:

1. Integration plan mapped to user stack and mode.
2. Endpoint contract for pay/notify/query/close/refund.
3. Exact env var list for sandbox and production.
4. Idempotency and reconciliation strategy.
5. Sandbox test matrix with pass/fail criteria.
6. Production go-live checklist and rollback plan.
7. Risks and mitigations.

## Standard Endpoint Contract

Use these route responsibilities (path names can vary by project):

- `POST /payments/alipay/page-pay`
  - create payment request with `alipay.trade.page.pay`
  - return HTML form or redirect URL to frontend
- `POST /payments/alipay/notify`
  - verify signature
  - validate business fields (`app_id`, `out_trade_no`, `total_amount`, merchant identity)
  - apply idempotent state transition
  - return plain text `success`
- `POST /payments/alipay/query`
  - call `alipay.trade.query`
  - used for polling/reconciliation
- `POST /payments/alipay/close`
  - close unpaid order before recreating payment
- `POST /payments/alipay/refund`
  - trigger refund and persist refund record

## Implementation Workflow

### 1) Initialize payment request

For `alipay.trade.page.pay`, ensure:

- unique `out_trade_no`
- correct `subject`
- correct `total_amount`
- `product_code=FAST_INSTANT_TRADE_PAY`
- explicit `notify_url`
- optional `return_url` for UX redirect only

Do not treat sync return page as final payment truth.

### 2) Implement notify as source of truth

Notify handler must do all checks before state change:

- verify sign
- verify `app_id`
- verify `out_trade_no`
- verify amount matches order snapshot
- optional merchant/seller identity check

State transition rules:

- `TRADE_SUCCESS` or `TRADE_FINISHED` -> mark paid (idempotent)
- other statuses -> update state machine without false success

Always return exact `success` only after successful processing.

### 3) Add active query and reconciliation

- if notify delayed/missing, query with `alipay.trade.query`
- schedule reconciliation job for pending orders
- before creating a new payment for same business intent:
  - query old trade
  - if `WAIT_BUYER_PAY`, close old trade first

### 4) Implement post-payment ops

- close: `alipay.trade.close`
- refund: `alipay.trade.refund`
- refund query: `alipay.trade.fastpay.refund.query`
- bill download URL: `alipay.data.dataservice.bill.downloadurl.query`

### 5) Harden for production

- strict secret management (env/secret manager; never hardcode)
- webhook replay protection and idempotency keying
- structured logs for pay/notify/query/refund with trace ID
- monitoring + alerting for notify failures and payment lag
- callback endpoint SLA and retry tolerance

## Non-Negotiable Guardrails

- payment success is determined by notify/query, not return page
- notify processing must be idempotent
- never reuse `out_trade_no` for new attempt
- do not skip signature verification
- do not ack notify before persistence succeeds
- keep sandbox and production configs fully isolated

## Environment Profile Checklist

Always separate these profiles:

- `ALIPAY_SANDBOX_*`
- `ALIPAY_PROD_*`
- `ALIPAY_ACTIVE_PROFILE` (`sandbox`/`production`)

Keep gateway and public key bound to active profile.

## Sandbox Self-Service Guidance

When user asks for sandbox setup, provide self-service path explicitly:

- console entry: `https://open.alipay.com/develop/sandbox/app`
- user needs to complete:
  - sandbox app config
  - sandbox buyer account retrieval/top-up
  - sandbox app login and payment testing

Codex should continue implementation with mock mode fallback when sandbox account setup is pending.

## Go-Live Strategy

Ship using phased rollout:

1. sandbox full pass
2. production shadow verification (small traffic)
3. canary release
4. full release after reconciliation and alert checks

If severe anomaly appears:

- disable new payment entry route
- keep query/refund endpoints online
- reconcile pending orders before reopening traffic

## Production Hard Gate (Do Not Skip)

Before claiming "production-ready", confirm all gates:

1. production app created and product enabled on platform
2. production key pair/cert configured and verified
3. production `notify_url` reachable and signature verification passing
4. amount/app_id/order validation and idempotency tested
5. reconciliation job running with alerting
6. refund and close flow tested in production-safe scenario
7. rollback procedure validated by drill

For exact human-side onboarding actions, load:

- [references/production-onboarding-checklist.md](references/production-onboarding-checklist.md)

## Reusable Assets

- Env template for dual-profile setup:
  - [assets/templates/alipay.env.example](assets/templates/alipay.env.example)

## When to load references

- API doc links and official constraints: [references/alipay-open-doc-links.md](references/alipay-open-doc-links.md)
- Node/Express practical blueprint (routes, env, idempotency): [references/node-express-blueprint.md](references/node-express-blueprint.md)
- Production release checklist and rollback runbook: [references/production-go-live-runbook.md](references/production-go-live-runbook.md)
- Validation prompt set for forward-testing: [references/acceptance-prompts.md](references/acceptance-prompts.md)
- Human ownership and platform setup checklist: [references/human-assist-checklist.md](references/human-assist-checklist.md)
- Production app creation and platform onboarding checklist: [references/production-onboarding-checklist.md](references/production-onboarding-checklist.md)
