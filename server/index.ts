import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { AlipaySdk } from 'alipay-sdk';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

// 加载 .env 文件
dotenv.config({ path: path.join(rootDir, '.env') });

// ============================================================
// 支付宝沙箱配置
// 运行 node server/setup.mjs 进行交互式配置
// 文档: https://opendocs.alipay.com/open/270/105898
// ============================================================
const ALIPAY_APP_ID = process.env.ALIPAY_APP_ID || '';
const NOTIFY_URL = process.env.ALIPAY_NOTIFY_URL || 'http://localhost:3001/api/payment/notify';
const ALIPAY_PUBLIC_KEY = process.env.ALIPAY_PUBLIC_KEY || '';

// 沙箱环境 endpoint（SDK v4 使用 endpoint 而非 gateway）
const ALIPAY_ENDPOINT = process.env.ALIPAY_ENDPOINT || 'https://openapi-sandbox.dl.alipaydev.com';

if (!ALIPAY_APP_ID) {
  console.error('\n❌ 未配置 ALIPAY_APP_ID！');
  console.error('   请先运行配置脚本: node server/setup.mjs\n');
  process.exit(1);
}

// 读取RSA私钥
const privateKeyPath = path.join(__dirname, 'keys', 'app_private_key.pem');
if (!fs.existsSync(privateKeyPath)) {
  console.error('\n❌ 未找到RSA私钥文件！');
  console.error('   请先运行配置脚本: node server/setup.mjs\n');
  process.exit(1);
}
const privateKey = fs.readFileSync(privateKeyPath, 'utf-8');

// 初始化支付宝 SDK v4
// 使用公钥模式 + PKCS8 密钥格式（OpenSSL 默认生成 PKCS8）
const alipaySdk = new AlipaySdk({
  appId: ALIPAY_APP_ID,
  privateKey,
  alipayPublicKey: ALIPAY_PUBLIC_KEY,
  endpoint: ALIPAY_ENDPOINT,
  keyType: 'PKCS8',
  signType: 'RSA2',
});

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 存储订单状态（生产环境应使用数据库）
const orderStore = new Map<string, {
  outTradeNo: string;
  totalAmount: string;
  subject: string;
  status: 'WAIT_BUYER_PAY' | 'TRADE_SUCCESS' | 'TRADE_CLOSED' | 'TRADE_FINISHED';
  qrCode?: string;
  createdAt: number;
}>();

// 生成订单号
function generateOutTradeNo(): string {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, '');
  const rand = Math.random().toString(36).slice(2, 10).toUpperCase();
  return `LAURA${date}${rand}`;
}

// ============================================================
// API: 创建支付宝当面付订单（预创建）
// POST /api/payment/create
// 文档: https://opendocs.alipay.com/open/8ad49e4a_alipay.trade.precreate
// ============================================================
app.post('/api/payment/create', async (req, res) => {
  try {
    const { figurineId, figurineName, quantity, totalPrice } = req.body;

    if (!figurineId || !figurineName || !quantity || !totalPrice) {
      return res.status(400).json({ success: false, message: '参数不完整' });
    }

    const outTradeNo = generateOutTradeNo();
    const totalAmount = totalPrice.toFixed(2);
    const subject = `Laura小店 - ${figurineName} x${quantity}`;

    console.log(`[Payment] Creating order: ${outTradeNo}, amount: ¥${totalAmount}, subject: ${subject}`);

    try {
      // SDK v4: 使用 curl 方法调用 v3 API
      const result = await alipaySdk.curl<{
        qr_code: string;
        out_trade_no: string;
      }>('POST', '/v3/alipay/trade/precreate', {
        body: {
          out_trade_no: outTradeNo,
          total_amount: totalAmount,
          subject,
          notify_url: NOTIFY_URL,
        },
      });

      console.log('[Payment] Alipay precreate response:', JSON.stringify(result, null, 2));

      const qrCode = result.data?.qr_code;
      if (qrCode) {
        orderStore.set(outTradeNo, {
          outTradeNo,
          totalAmount,
          subject,
          status: 'WAIT_BUYER_PAY',
          qrCode,
          createdAt: Date.now(),
        });

        return res.json({
          success: true,
          data: { outTradeNo, qrCode, totalAmount },
        });
      } else {
        console.error('[Payment] No qr_code in response:', result);
        return res.json({
          success: false,
          message: '未获取到支付二维码，请检查沙箱配置',
        });
      }
    } catch (sdkError: any) {
      // SDK v4 会抛出 AlipayRequestError，包含详细错误信息
      console.error('[Payment] Alipay SDK error:', sdkError.message);
      console.error('[Payment] Error details:', JSON.stringify({
        code: sdkError.code,
        subCode: sdkError.subCode,
        subMsg: sdkError.subMsg,
        responseHttpStatus: sdkError.responseHttpStatus,
      }, null, 2));

      // 回退到 exec 方法（兼容旧版网关）
      console.log('[Payment] Falling back to exec method...');
      const fallbackResult = await alipaySdk.exec('alipay.trade.precreate', {
        notifyUrl: NOTIFY_URL,
        bizContent: {
          out_trade_no: outTradeNo,
          total_amount: totalAmount,
          subject,
          product_code: 'FACE_TO_FACE_PAYMENT',
        },
      });

      console.log('[Payment] Fallback response:', JSON.stringify(fallbackResult, null, 2));

      const qrCode = fallbackResult.qrCode || fallbackResult.qr_code;
      if (fallbackResult.code === '10000' && qrCode) {
        orderStore.set(outTradeNo, {
          outTradeNo,
          totalAmount,
          subject,
          status: 'WAIT_BUYER_PAY',
          qrCode,
          createdAt: Date.now(),
        });
        return res.json({
          success: true,
          data: { outTradeNo, qrCode, totalAmount },
        });
      }

      return res.json({
        success: false,
        message: sdkError.subMsg || sdkError.message || '创建订单失败，请检查沙箱配置',
      });
    }
  } catch (error: any) {
    console.error('[Payment] Create order error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || '服务器错误',
    });
  }
});

// ============================================================
// API: 查询订单支付状态
// GET /api/payment/query?outTradeNo=xxx
// ============================================================
app.get('/api/payment/query', async (req, res) => {
  try {
    const { outTradeNo } = req.query;

    if (!outTradeNo || typeof outTradeNo !== 'string') {
      return res.status(400).json({ success: false, message: '缺少订单号' });
    }

    // 先查本地缓存
    const localOrder = orderStore.get(outTradeNo);
    if (localOrder?.status === 'TRADE_SUCCESS') {
      return res.json({ success: true, data: { status: 'TRADE_SUCCESS' } });
    }

    try {
      // SDK v4: 使用 curl 方法查询
      const result = await alipaySdk.curl<{
        trade_status: string;
        buyer_logon_id?: string;
        total_amount?: string;
      }>('POST', '/v3/alipay/trade/query', {
        body: {
          out_trade_no: outTradeNo,
        },
      });

      console.log('[Payment] Query result:', JSON.stringify(result, null, 2));

      const tradeStatus = result.data?.trade_status;
      if (tradeStatus) {
        if (localOrder) {
          localOrder.status = tradeStatus as any;
        }
        return res.json({
          success: true,
          data: {
            status: tradeStatus,
            buyerLogonId: result.data?.buyer_logon_id,
            totalAmount: result.data?.total_amount,
          },
        });
      }
    } catch (sdkError: any) {
      // 回退到 exec
      try {
        const fallbackResult = await alipaySdk.exec('alipay.trade.query', {
          bizContent: { out_trade_no: outTradeNo },
        });

        if (fallbackResult.code === '10000') {
          const tradeStatus = fallbackResult.tradeStatus || fallbackResult.trade_status;
          if (localOrder && tradeStatus) {
            localOrder.status = tradeStatus;
          }
          return res.json({
            success: true,
            data: {
              status: tradeStatus,
              buyerLogonId: fallbackResult.buyerLogonId,
              totalAmount: fallbackResult.totalAmount,
            },
          });
        }
      } catch (e) {
        // ignore fallback error
      }
    }

    return res.json({
      success: true,
      data: { status: localOrder?.status || 'WAIT_BUYER_PAY' },
    });
  } catch (error: any) {
    console.error('[Payment] Query error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================================
// API: 支付宝异步通知回调
// POST /api/payment/notify
// ============================================================
app.post('/api/payment/notify', async (req, res) => {
  try {
    console.log('[Payment] Received notify:', JSON.stringify(req.body, null, 2));

    // 验证通知签名
    const isValid = alipaySdk.checkNotifySign(req.body);
    if (!isValid) {
      console.warn('[Payment] Invalid notify signature!');
      return res.send('fail');
    }

    const { out_trade_no, trade_status } = req.body;
    if (out_trade_no && trade_status) {
      const order = orderStore.get(out_trade_no);
      if (order) {
        order.status = trade_status;
        console.log(`[Payment] Order ${out_trade_no} updated to ${trade_status}`);
      }
    }

    res.send('success');
  } catch (error) {
    console.error('[Payment] Notify error:', error);
    res.send('fail');
  }
});

// ============================================================
// API: 取消订单
// POST /api/payment/cancel
// ============================================================
app.post('/api/payment/cancel', async (req, res) => {
  try {
    const { outTradeNo } = req.body;
    if (!outTradeNo) {
      return res.status(400).json({ success: false, message: '缺少订单号' });
    }

    try {
      await alipaySdk.curl('POST', '/v3/alipay/trade/cancel', {
        body: { out_trade_no: outTradeNo },
      });
    } catch {
      await alipaySdk.exec('alipay.trade.cancel', {
        bizContent: { out_trade_no: outTradeNo },
      });
    }

    const order = orderStore.get(outTradeNo);
    if (order) {
      order.status = 'TRADE_CLOSED';
    }

    return res.json({ success: true });
  } catch (error: any) {
    console.error('[Payment] Cancel error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log('');
  console.log('╔══════════════════════════════════════════════════╗');
  console.log('║   Laura 支付服务已启动                           ║');
  console.log('╚══════════════════════════════════════════════════╝');
  console.log('');
  console.log(`  地址:     http://localhost:${PORT}`);
  console.log(`  App ID:   ${ALIPAY_APP_ID}`);
  console.log(`  Endpoint: ${ALIPAY_ENDPOINT}`);
  console.log(`  密钥格式: PKCS8 / RSA2`);
  console.log('');
  console.log('  API 端点:');
  console.log('    POST /api/payment/create   创建订单');
  console.log('    GET  /api/payment/query    查询状态');
  console.log('    POST /api/payment/notify   异步通知');
  console.log('    POST /api/payment/cancel   取消订单');
  console.log('');
});
