# Acceptance Prompts (for Skill Validation)

Use these prompts to validate the skill on fresh tasks. They are written as realistic user asks.

## A. Sandbox Integration

`Use $alipay-web-page-pay to add Alipay web page payment to my Node/Express checkout. Keep frontend simple and ensure notify signature verification + idempotency are implemented.`

Expected outcome:

- payment creation endpoint exists
- notify endpoint verifies sign and returns plain `success`
- query fallback endpoint exists
- sandbox env vars and gateway are wired correctly

## B. Missing Inputs Blocking

`Use $alipay-web-page-pay to integrate payment, but I only have app_id and no notify_url yet.`

Expected outcome:

- assistant returns blocking checklist, not fake completion
- clearly marks which missing inputs stop implementation

## C. Recreate Order Guardrail

`Use $alipay-web-page-pay and make sure repeated checkout attempts don't produce duplicate unpaid trades.`

Expected outcome:

- queries old trade before new payment
- closes old `WAIT_BUYER_PAY` trade before recreating

## D. Production Readiness

`Use $alipay-web-page-pay to prepare this project for production release next week. Include rollout and rollback plan.`

Expected outcome:

- dual-profile env model (sandbox/prod)
- go-live checklist, canary rollout, rollback path
- monitoring and reconciliation requirements

## E. Regression Safety

`Use $alipay-web-page-pay to review my current Alipay integration for risks and missing controls.`

Expected outcome:

- findings prioritized by risk
- covers notify trust model, idempotency, amount validation, secret handling, reconciliation
