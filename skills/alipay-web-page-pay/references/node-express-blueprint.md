# Node/Express Blueprint (Alipay Web Page Pay)

## 1) Env Contract

Use explicit dual-profile env vars:

- `ALIPAY_ACTIVE_PROFILE=sandbox|production`
- sandbox
  - `ALIPAY_SANDBOX_APP_ID`
  - `ALIPAY_SANDBOX_PRIVATE_KEY`
  - `ALIPAY_SANDBOX_PUBLIC_KEY`
  - `ALIPAY_SANDBOX_GATEWAY`
  - `ALIPAY_SANDBOX_NOTIFY_URL`
  - `ALIPAY_SANDBOX_RETURN_URL`
- production
  - `ALIPAY_PROD_APP_ID`
  - `ALIPAY_PROD_PRIVATE_KEY`
  - `ALIPAY_PROD_PUBLIC_KEY`
  - `ALIPAY_PROD_GATEWAY`
  - `ALIPAY_PROD_NOTIFY_URL`
  - `ALIPAY_PROD_RETURN_URL`

Never mix sandbox and production keys/gateway.

## 2) Recommended Routes

- `POST /payments/alipay/page-pay`
- `POST /payments/alipay/notify`
- `POST /payments/alipay/query`
- `POST /payments/alipay/close`
- `POST /payments/alipay/refund`

Optional helper:

- `GET /payments/alipay/profile/status` to expose current active profile and missing config.

## 3) Notify Handler Checklist

Before writing payment success:

- verify signature first
- verify `app_id`
- verify `out_trade_no`
- verify `total_amount` equals immutable order snapshot
- verify order exists and status transition is valid
- perform idempotent update by unique business key (`out_trade_no` or `trade_no`)
- return plain text `success`

## 4) Idempotency Pattern

Use DB constraint to prevent duplicate success updates:

- `UNIQUE(out_trade_no)` on payment table
- idempotent transition check `if already paid -> no-op`
- store `notify_received_at`, `trade_no`, `raw_notify_payload_hash`

## 5) Reconciliation Job

Run periodic job for orders in pending state:

- query Alipay by `out_trade_no`
- update local status if changed
- alert if order stays pending beyond SLO threshold

## 6) Error/Retry Strategy

- notify: fail fast on bad signature/invalid business fields
- notify: do not return `success` when DB write fails
- page-pay request: map gateway errors to stable application codes
- query/refund/close: log request id + order id + alipay code/sub_code

## 7) Security Notes

- keys from secret manager or env only
- no keys in logs
- redact payload fields in logs where required
- keep callback endpoint HTTPS only
- restrict admin/refund routes by auth and audit log
