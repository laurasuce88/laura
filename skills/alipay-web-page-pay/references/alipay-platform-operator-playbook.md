# Alipay Platform Operator Playbook (Human Preflight)

Use this playbook for human-side setup before the implementing agent starts code delivery.

## 1) Official Entry Links

- Open Platform home: `https://open.alipay.com/`
- Web app onboarding entry: `https://open.alipay.com/module/webApp`
- PC website pay preparation doc: `https://opendocs.alipay.com/open/270/01didh?pathHash=a6ccbe9a`
- Developer tools (key/sign): `https://open.alipay.com/tool`
- Sandbox app entry: `https://open.alipay.com/develop/sandbox/app`

If UI paths are changed, locate from:

- `控制台 -> 我的应用 -> 网页/移动应用 -> 目标应用 -> 开发信息`

## 2) Production Application Setup (Human)

1. log in to Open Platform.
2. create/open a production web app.
3. enable product capability for PC website payment.
4. complete required compliance checks.
5. register production callback domain and HTTPS `notify_url`.

Output to implementing agent:

- production `app_id`
- callback routes (`notify_url`, optional `return_url`)
- product enablement confirmation screenshot/text

## 3) Signing/Key Setup (Human)

1. open developer tools and use key/sign tool.
2. choose signing mode: public-key mode or certificate mode.
3. generate merchant private key locally.
4. upload public key or cert chain in app config.
5. record Alipay public key/cert material for verification.

Security rules:

- never commit private key into repository
- prefer secret manager/env for key injection
- rotate key immediately if private key appears in chat/log/history

Output to implementing agent:

- signing mode
- `ALIPAY_PROD_PRIVATE_KEY` (secure channel only)
- `ALIPAY_PROD_PUBLIC_KEY` (or cert files)
- `ALIPAY_PROD_GATEWAY=https://openapi.alipay.com/gateway.do`

## 4) Sandbox Setup (Optional But Recommended)

1. open sandbox entry and get sandbox app.
2. configure sandbox key/sign mode.
3. retrieve sandbox buyer account and ensure balance.
4. run at least one sandbox scan-pay test.

Output to implementing agent:

- sandbox `app_id`
- sandbox key material
- sandbox callback URL

## 5) Go-Live Human Checklist

- production `notify_url` is public HTTPS and reachable
- production key config has been verified in platform
- one low-amount real payment drill is completed
- one refund drill is completed
- rollback owner and escalation contacts are assigned

## 6) Human/Agent Handoff Template

- `Current stage`: sandbox ready / production prep / go-live
- `Completed by human`: list of finished console actions
- `Missing blockers`: list missing app/key/callback items
- `Expected from agent`: exact implementation tasks to continue
