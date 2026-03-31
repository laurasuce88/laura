# Production Onboarding Checklist (Human + Agent)

This checklist is for real go-live preparation, not sandbox-only demos.

## 1) Human: Platform App Setup

- create/open production app in Alipay Open Platform
- enable target product capability for PC website payment
- complete required business/compliance verification
- confirm merchant account and app relationship is correct
- register production callback domain and HTTPS `notify_url`

Deliverables to implementing agent:

- production `app_id`
- confirmed gateway (`https://openapi.alipay.com/gateway.do`)
- callback URLs and route mapping

## 2) Human: Key/Certificate Setup

- choose signing mode: public-key mode or certificate mode
- generate production merchant private key locally
- upload corresponding public key or cert chain in platform
- obtain Alipay platform public key/cert info

Security rules:

- private key must not be committed to repo
- private key should be injected through secret manager/env
- rotate key immediately if leaked in chat/logs

## 3) Implementing Agent: Backend Production Wiring

- add production profile vars (`ALIPAY_PROD_*`)
- wire sign/verify with production key materials
- ensure notify performs strict verification + idempotency
- enable query/close/refund/reconciliation in production profile
- add redaction and trace IDs in logs

## 4) Joint: Go-Live Drill

- run one low-amount real payment
- verify notify-driven paid transition
- run one close flow on unpaid order
- run one refund flow and verify result
- compare local status vs Alipay query result

Evidence to keep:

- order ids and trade ids
- notify logs (redacted)
- query/refund response summaries
- reconciliation report snapshot

## 5) Release Decision Gate

Release only when all true:

- production payment is successful end-to-end
- notify replay is idempotent
- amount/app/order validation blocks tampering
- alerting is active for notify failures and pending backlog
- rollback runbook owner + trigger condition is documented

## 6) Common Misunderstandings

- return page success is not final payment success
- sandbox success does not prove production readiness
- missing reconciliation means hidden financial risk
- mixing sandbox and production keys/gateway leads to signature failures
