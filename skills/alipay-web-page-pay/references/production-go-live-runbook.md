# Production Go-Live Runbook

## A. Pre-Launch (T-7 to T-1)

- confirm production app/product enablement in Alipay platform
- verify production keys and gateway are loaded from secret manager
- verify public HTTPS `notify_url` reachable from internet
- verify signature verification path in production profile
- dry run full flow with low-value real order in production environment
- validate reconciliation job schedule and alert channels

## B. Launch Day (T0)

- set `ALIPAY_ACTIVE_PROFILE=production`
- enable payment entry with canary traffic first
- watch metrics:
  - create-pay success rate
  - notify success/failed ratio
  - pending orders over threshold
- if stable, increase traffic gradually to full

## C. Post-Launch (T+1 to T+7)

- run daily reconciliation against Alipay query result
- audit refund and close operations logs
- inspect duplicate/late notify handling
- confirm no amount mismatch incidents

## D. Rollback Plan

If severe issue occurs:

- disable new pay route traffic immediately
- keep query/refund/close endpoints available
- mark uncertain orders as `reconcile_required`
- run manual/automatic reconciliation before reopening

## E. Minimum Acceptance Criteria

- no unverified success transitions
- notify idempotency proven by replay test
- reconciliation job catches missing notify cases
- payment, refund, close all traceable by order id and trade id
- monitoring and on-call escalation path documented
