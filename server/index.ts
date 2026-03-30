import express from 'express';
import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';
import { AlipaySdk } from 'alipay-sdk';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

// 加载 .env 文件
dotenv.config({ path: path.join(rootDir, '.env') });

// ============================================================
// 支付宝沙箱配置
// 文档: https://opendocs.alipay.com/open/270/105898
// ============================================================
const ALIPAY_APP_ID = process.env.ALIPAY_APP_ID || '';
const NOTIFY_URL = process.env.ALIPAY_NOTIFY_URL || 'http://localhost:3001/api/payment/notify';
const ALIPAY_PUBLIC_KEY = process.env.ALIPAY_PUBLIC_KEY || '';
const ALIPAY_ENDPOINT = process.env.ALIPAY_ENDPOINT || 'https://openapi-sandbox.dl.alipaydev.com';

let useMockMode = false;
let alipaySdk: AlipaySdk | null = null;

// 尝试初始化 SDK
const privateKeyPath = path.join(__dirname, 'keys', 'app_private_key.pem');
if (ALIPAY_APP_ID && fs.existsSync(privateKeyPath)) {
  const privateKey = fs.readFileSync(privateKeyPath, 'utf-8');
  alipaySdk = new AlipaySdk({
    appId: ALIPAY_APP_ID,
    privateKey,
    alipayPublicKey: ALIPAY_PUBLIC_KEY,
    endpoint: ALIPAY_ENDPOINT,
    keyType: 'PKCS8',
    signType: 'RSA2',
    timeout: 15000,
  });
}

// 检测网络连通性
function checkNetwork(): Promise<boolean> {
  return new Promise((resolve) => {
    const req = https.request({ hostname: 'openapi-sandbox.dl.alipaydev.com', port: 443, method: 'HEAD', timeout: 5000 }, () => resolve(true));
    req.on('error', () => resolve(false));
    req.on('timeout', () => { req.destroy(); resolve(false); });
    req.end();
  });
}

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 订单存储
const orderStore = new Map<string, {
  outTradeNo: string;
  totalAmount: string;
  subject: string;
  status: 'WAIT_BUYER_PAY' | 'TRADE_SUCCESS' | 'TRADE_CLOSED' | 'TRADE_FINISHED';
  qrCode?: string;
  createdAt: number;
  mock?: boolean;
}>();

function generateOutTradeNo(): string {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const rand = Math.random().toString(36).slice(2, 10).toUpperCase();
  return `LAURA${date}${rand}`;
}

// ============================================================
// POST /api/payment/create - 创建订单
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

    console.log(`[Payment] Creating order: ${outTradeNo}, ¥${totalAmount}, ${subject}`);

    // 尝试真实 API
    if (alipaySdk && !useMockMode) {
      try {
        const result = await alipaySdk.curl<{ qr_code: string; out_trade_no: string }>(
          'POST', '/v3/alipay/trade/precreate', {
            body: { out_trade_no: outTradeNo, total_amount: totalAmount, subject, notify_url: NOTIFY_URL },
          }
        );

        const qrCode = result.data?.qr_code;
        if (qrCode) {
          console.log(`[Payment] ✅ 真实二维码已生成: ${qrCode.substring(0, 40)}...`);
          orderStore.set(outTradeNo, { outTradeNo, totalAmount, subject, status: 'WAIT_BUYER_PAY', qrCode, createdAt: Date.now() });
          return res.json({ success: true, data: { outTradeNo, qrCode, totalAmount }, mock: false });
        }
      } catch (sdkError: any) {
        // 尝试 exec 回退
        try {
          const fallback = await alipaySdk.exec('alipay.trade.precreate', {
            notifyUrl: NOTIFY_URL,
            bizContent: { out_trade_no: outTradeNo, total_amount: totalAmount, subject, product_code: 'FACE_TO_FACE_PAYMENT' },
          });
          const qrCode = fallback.qrCode || fallback.qr_code;
          if (fallback.code === '10000' && qrCode) {
            console.log(`[Payment] ✅ 真实二维码已生成(exec): ${qrCode.substring(0, 40)}...`);
            orderStore.set(outTradeNo, { outTradeNo, totalAmount, subject, status: 'WAIT_BUYER_PAY', qrCode, createdAt: Date.now() });
            return res.json({ success: true, data: { outTradeNo, qrCode, totalAmount }, mock: false });
          }
        } catch {}

        console.warn(`[Payment] ⚠️ 支付宝 API 调用失败，切换到模拟模式: ${sdkError.message}`);
        useMockMode = true;
      }
    }

    // 模拟模式：生成一个看起来真实的二维码链接
    console.log('[Payment] 📋 使用模拟模式生成二维码');
    const mockQrCode = `https://qr.alipay.com/bax0${outTradeNo.toLowerCase()}`;
    orderStore.set(outTradeNo, { outTradeNo, totalAmount, subject, status: 'WAIT_BUYER_PAY', qrCode: mockQrCode, createdAt: Date.now(), mock: true });

    return res.json({
      success: true,
      data: { outTradeNo, qrCode: mockQrCode, totalAmount },
      mock: true,
    });
  } catch (error: any) {
    console.error('[Payment] Create order error:', error);
    return res.status(500).json({ success: false, message: error.message || '服务器错误' });
  }
});

// ============================================================
// GET /api/payment/query - 查询支付状态
// ============================================================
app.get('/api/payment/query', async (req, res) => {
  try {
    const { outTradeNo } = req.query;
    if (!outTradeNo || typeof outTradeNo !== 'string') {
      return res.status(400).json({ success: false, message: '缺少订单号' });
    }

    const localOrder = orderStore.get(outTradeNo);
    if (localOrder?.status === 'TRADE_SUCCESS') {
      return res.json({ success: true, data: { status: 'TRADE_SUCCESS' } });
    }

    // 模拟模式：不调用远程 API
    if (localOrder?.mock) {
      return res.json({ success: true, data: { status: localOrder.status } });
    }

    // 真实 API 查询
    if (alipaySdk && !useMockMode) {
      try {
        const result = await alipaySdk.curl<{ trade_status: string; buyer_logon_id?: string; total_amount?: string }>(
          'POST', '/v3/alipay/trade/query', { body: { out_trade_no: outTradeNo } }
        );
        const tradeStatus = result.data?.trade_status;
        if (tradeStatus && localOrder) localOrder.status = tradeStatus as any;
        return res.json({ success: true, data: { status: tradeStatus || 'WAIT_BUYER_PAY' } });
      } catch {
        try {
          const fb = await alipaySdk.exec('alipay.trade.query', { bizContent: { out_trade_no: outTradeNo } });
          if (fb.code === '10000') {
            const s = fb.tradeStatus || fb.trade_status;
            if (localOrder && s) localOrder.status = s;
            return res.json({ success: true, data: { status: s } });
          }
        } catch {}
      }
    }

    return res.json({ success: true, data: { status: localOrder?.status || 'WAIT_BUYER_PAY' } });
  } catch (error: any) {
    console.error('[Payment] Query error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================================
// POST /api/payment/mock-pay - 模拟支付成功（仅模拟模式可用）
// ============================================================
app.post('/api/payment/mock-pay', (req, res) => {
  const { outTradeNo } = req.body;
  const order = orderStore.get(outTradeNo);
  if (order?.mock) {
    order.status = 'TRADE_SUCCESS';
    console.log(`[Payment] 🎉 模拟支付成功: ${outTradeNo}`);
    return res.json({ success: true });
  }
  return res.status(400).json({ success: false, message: '仅模拟订单可用' });
});

// ============================================================
// POST /api/payment/notify - 支付宝异步通知
// ============================================================
app.post('/api/payment/notify', async (req, res) => {
  try {
    console.log('[Payment] Received notify:', JSON.stringify(req.body, null, 2));
    if (alipaySdk) {
      const isValid = alipaySdk.checkNotifySign(req.body);
      if (!isValid) { console.warn('[Payment] Invalid signature!'); return res.send('fail'); }
    }
    const { out_trade_no, trade_status } = req.body;
    if (out_trade_no && trade_status) {
      const order = orderStore.get(out_trade_no);
      if (order) { order.status = trade_status; console.log(`[Payment] Order ${out_trade_no} → ${trade_status}`); }
    }
    res.send('success');
  } catch (error) { console.error('[Payment] Notify error:', error); res.send('fail'); }
});

// ============================================================
// POST /api/payment/cancel - 取消订单
// ============================================================
app.post('/api/payment/cancel', async (req, res) => {
  try {
    const { outTradeNo } = req.body;
    if (!outTradeNo) return res.status(400).json({ success: false, message: '缺少订单号' });
    const order = orderStore.get(outTradeNo);
    if (order) order.status = 'TRADE_CLOSED';
    if (alipaySdk && !order?.mock && !useMockMode) {
      try { await alipaySdk.curl('POST', '/v3/alipay/trade/cancel', { body: { out_trade_no: outTradeNo } }); } catch {
        try { await alipaySdk.exec('alipay.trade.cancel', { bizContent: { out_trade_no: outTradeNo } }); } catch {}
      }
    }
    return res.json({ success: true });
  } catch (error: any) { console.error('[Payment] Cancel error:', error); return res.status(500).json({ success: false, message: error.message }); }
});

// 启动
const PORT = process.env.PORT || 3001;
app.listen(PORT, async () => {
  const networkOk = await checkNetwork();
  useMockMode = !networkOk || !alipaySdk;

  console.log('');
  console.log('╔══════════════════════════════════════════════════╗');
  console.log('║   Laura 支付服务已启动                           ║');
  console.log('╚══════════════════════════════════════════════════╝');
  console.log('');
  console.log(`  地址:     http://localhost:${PORT}`);
  console.log(`  App ID:   ${ALIPAY_APP_ID || '(未配置)'}`);
  console.log(`  模式:     ${useMockMode ? '📋 模拟模式（无外网）' : '✅ 真实 API 模式'}`);
  console.log('');
  if (useMockMode) {
    console.log('  ⚠️  当前无法连接支付宝服务器，使用模拟模式');
    console.log('  ⚠️  二维码为模拟数据，点击二维码可模拟支付成功');
    console.log('  ⚠️  在有外网的环境中将自动切换为真实 API');
    console.log('');
  }
});
