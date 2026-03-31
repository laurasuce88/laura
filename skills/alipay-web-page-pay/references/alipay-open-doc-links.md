# Alipay Open Docs Links (PC Website Payment)

Updated on: 2026-03-30

## Product Docs

- Product intro: https://opendocs.alipay.com/open/270/105898?pathHash=b3b2b667
- Integration preparation: https://opendocs.alipay.com/open/270/01didh?pathHash=a6ccbe9a
- Quick integration: https://opendocs.alipay.com/open/270/105899?pathHash=d57664bf
- Async notify details: https://opendocs.alipay.com/open/270/105902?pathHash=d5cd617e
- Sandbox debug guide: https://opendocs.alipay.com/open/00dn7o?pathHash=c1e36251
- API list root: https://opendocs.alipay.com/open/02ivbm?pathHash=73e25944

## Core APIs

- `alipay.trade.page.pay`: https://opendocs.alipay.com/open/59da99d0_alipay.trade.page.pay
- `alipay.trade.query`: https://opendocs.alipay.com/open/bff76748_alipay.trade.query
- `alipay.trade.close`: https://opendocs.alipay.com/open/8dc9ebb3_alipay.trade.close
- `alipay.trade.refund`: https://opendocs.alipay.com/open/f60979b3_alipay.trade.refund
- `alipay.trade.fastpay.refund.query`: https://opendocs.alipay.com/open/357441a2_alipay.trade.fastpay.refund.query
- `alipay.data.dataservice.bill.downloadurl.query`: https://opendocs.alipay.com/open/e099d91f_alipay.data.dataservice.bill.downloadurl.query
- refund depositback completed notify: https://opendocs.alipay.com/open/42a9ce75_alipay.trade.refund.depositback.completed

## High-Value Constraints

- use `product_code=FAST_INSTANT_TRADE_PAY` for PC page pay
- payment truth comes from async notify or active query, not return page
- always verify notify signature and key business fields
- keep notify processing idempotent
- never reuse `out_trade_no` for new payment attempt
- if recreating payment, close old unpaid trade first
- sandbox gateway: `https://openapi-sandbox.dl.alipaydev.com/gateway.do`
- sandbox behavior differs from production and supports fewer payment methods
