import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { AlipaySdk } from 'alipay-sdk';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ============================================================
// 支付宝沙箱配置
// 请在 .env 中配置以下变量，或直接修改这里的默认值
// 沙箱环境申请：https://open.alipay.com/develop/sandbox/app
// ============================================================
const ALIPAY_APP_ID = process.env.ALIPAY_APP_ID || '9021000144679587';
const ALIPAY_GATEWAY = process.env.ALIPAY_GATEWAY || 'https://openapi-sandbox.dl.alipaydev.com/gateway.do';
const NOTIFY_URL = process.env.ALIPAY_NOTIFY_URL || 'http://localhost:3001/api/payment/notify';

// 读取RSA私钥
const privateKeyPath = path.join(__dirname, 'keys', 'app_private_key.pem');
const privateKey = fs.readFileSync(privateKeyPath, 'utf-8');

// 初始化支付宝 SDK
const alipaySdk = new AlipaySdk({
  appId: ALIPAY_APP_ID,
  privateKey,
  gateway: ALIPAY_GATEWAY,
  signType: 'RSA2',
  // 沙箱环境下可跳过证书验证
  alipayPublicKey: process.env.ALIPAY_PUBLIC_KEY || '',
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

    // 调用支付宝当面付 - 预创建接口
    const result = await alipaySdk.exec('alipay.trade.precreate', {
      notifyUrl: NOTIFY_URL,
      bizContent: {
        out_trade_no: outTradeNo,
        total_amount: totalAmount,
        subject,
        product_code: 'FACE_TO_FACE_PAYMENT',
      },
    });

    console.log('[Payment] Alipay precreate response:', JSON.stringify(result, null, 2));

    // 检查响应
    if (result.code === '10000' && result.qrCode) {
      // 保存订单
      orderStore.set(outTradeNo, {
        outTradeNo,
        totalAmount,
        subject,
        status: 'WAIT_BUYER_PAY',
        qrCode: result.qrCode,
        createdAt: Date.now(),
      });

      return res.json({
        success: true,
        data: {
          outTradeNo,
          qrCode: result.qrCode,
          totalAmount,
        },
      });
    } else {
      console.error('[Payment] Alipay precreate failed:', result);
      return res.json({
        success: false,
        message: result.subMsg || result.msg || '创建订单失败',
        code: result.code,
        subCode: result.subCode,
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

    // 调用支付宝查询接口
    const result = await alipaySdk.exec('alipay.trade.query', {
      bizContent: {
        out_trade_no: outTradeNo,
      },
    });

    console.log('[Payment] Query result:', JSON.stringify(result, null, 2));

    if (result.code === '10000') {
      const tradeStatus = result.tradeStatus;

      // 更新本地状态
      if (localOrder) {
        localOrder.status = tradeStatus;
      }

      return res.json({
        success: true,
        data: {
          status: tradeStatus,
          buyerLogonId: result.buyerLogonId,
          totalAmount: result.totalAmount,
        },
      });
    } else {
      return res.json({
        success: true,
        data: {
          status: localOrder?.status || 'WAIT_BUYER_PAY',
        },
      });
    }
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

    const { out_trade_no, trade_status } = req.body;

    if (out_trade_no && trade_status) {
      const order = orderStore.get(out_trade_no);
      if (order) {
        order.status = trade_status;
        console.log(`[Payment] Order ${out_trade_no} updated to ${trade_status}`);
      }
    }

    // 返回 success 告诉支付宝已收到通知
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

    const result = await alipaySdk.exec('alipay.trade.cancel', {
      bizContent: {
        out_trade_no: outTradeNo,
      },
    });

    console.log('[Payment] Cancel result:', JSON.stringify(result, null, 2));

    // 更新本地
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
  console.log(`\n🔧 支付服务已启动: http://localhost:${PORT}`);
  console.log(`📱 支付宝沙箱环境`);
  console.log(`   App ID: ${ALIPAY_APP_ID}`);
  console.log(`   Gateway: ${ALIPAY_GATEWAY}`);
  console.log(`\n⚠️  请确保已在支付宝沙箱控制台配置应用公钥！`);
  console.log(`   公钥文件: ${path.join(__dirname, 'keys', 'app_public_key.pem')}\n`);
});
