import React, { useState, useEffect, useCallback, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Check, Smartphone, ShieldCheck, Clock, AlertCircle, Loader2 } from 'lucide-react';
import { Figurine } from '../data/figurines';

type PaymentMethod = 'wechat' | 'alipay';
type PaymentStatus = 'loading' | 'pending' | 'scanning' | 'confirming' | 'success' | 'failed' | 'error';

interface PaymentModalProps {
  figurine: Figurine;
  quantity: number;
  onClose: () => void;
  onSuccess: () => void;
}

export default function PaymentModal({ figurine, quantity, onClose, onSuccess }: PaymentModalProps) {
  const [method, setMethod] = useState<PaymentMethod>('alipay');
  const [status, setStatus] = useState<PaymentStatus>('loading');
  const [countdown, setCountdown] = useState(300);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [outTradeNo, setOutTradeNo] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const totalPrice = figurine.price * quantity;

  // 创建支付宝订单
  const createOrder = useCallback(async () => {
    setStatus('loading');
    setErrorMsg('');
    setQrCodeUrl('');

    try {
      const res = await fetch('/api/payment/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          figurineId: figurine.id,
          figurineName: figurine.name,
          quantity,
          totalPrice,
        }),
      });

      const data = await res.json();

      if (data.success && data.data?.qrCode) {
        setQrCodeUrl(data.data.qrCode);
        setOutTradeNo(data.data.outTradeNo);
        setStatus('pending');
        setCountdown(300);
      } else {
        setErrorMsg(data.message || '创建订单失败');
        setStatus('error');
      }
    } catch (err: any) {
      console.error('Create order error:', err);
      setErrorMsg('网络错误，请检查支付服务是否启动');
      setStatus('error');
    }
  }, [figurine, quantity, totalPrice]);

  // 初始化：支付宝直接创建订单
  useEffect(() => {
    if (method === 'alipay') {
      createOrder();
    } else {
      // 微信支付保留模拟模式
      setStatus('pending');
      setQrCodeUrl(`https://pay.example.com/wechat?id=${figurine.id}&qty=${quantity}&amount=${totalPrice}&t=${Date.now()}`);
    }
  }, [method]);

  // 轮询支付状态
  useEffect(() => {
    if (status !== 'pending' || method !== 'alipay' || !outTradeNo) return;

    const startTimer = setTimeout(() => {
      pollRef.current = setInterval(async () => {
        try {
          const res = await fetch(`/api/payment/query?outTradeNo=${outTradeNo}`);
          const data = await res.json();

          if (data.success && data.data) {
            const tradeStatus = data.data.status;
            if (tradeStatus === 'TRADE_SUCCESS' || tradeStatus === 'TRADE_FINISHED') {
              setStatus('success');
              setTimeout(() => onSuccess(), 2000);
            } else if (tradeStatus === 'TRADE_CLOSED') {
              setStatus('failed');
            }
          }
        } catch (err) {
          console.error('Poll error:', err);
        }
      }, 3000);
    }, 3000);

    return () => {
      clearTimeout(startTimer);
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
  }, [status, method, outTradeNo, onSuccess]);

  // 倒计时
  useEffect(() => {
    if (status !== 'pending' && status !== 'scanning') return;
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          setStatus('failed');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [status]);

  // 微信模拟支付
  const simulateWechatPayment = useCallback(() => {
    if (status !== 'pending' || method !== 'wechat') return;
    setStatus('scanning');
    setTimeout(() => {
      setStatus('confirming');
      setTimeout(() => {
        setStatus('success');
        setTimeout(() => onSuccess(), 2000);
      }, 1500);
    }, 2000);
  }, [status, method, onSuccess]);

  // 清理轮询
  useEffect(() => {
    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
      }
    };
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const accentColor = method === 'wechat' ? '#22c55e' : '#3b82f6';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && status !== 'success' && onClose()}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="bg-gradient-to-b from-gray-900 to-gray-950 rounded-3xl border border-white/10 shadow-2xl w-full max-w-md overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <h2 className="text-white text-lg font-medium">扫码支付</h2>
          {status !== 'success' && (
            <button onClick={onClose} className="p-1.5 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition-colors">
              <X size={18} />
            </button>
          )}
        </div>

        {/* Order info */}
        <div className="px-5 py-4 flex items-center gap-4 border-b border-white/5">
          <div className="w-14 h-14 rounded-xl overflow-hidden border border-white/10 shrink-0">
            <img src={figurine.image} alt={figurine.name} className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-medium truncate">{figurine.name}</p>
            <p className="text-white/40 text-sm">x{quantity}</p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-orange-400 text-xl font-bold">¥{totalPrice}</p>
          </div>
        </div>

        {/* Payment method tabs */}
        {(status === 'pending' || status === 'loading' || status === 'error') && (
          <div className="flex mx-5 mt-4 p-1 bg-white/5 rounded-xl">
            <button
              onClick={() => setMethod('wechat')}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                method === 'wechat'
                  ? 'bg-green-500/20 text-green-400 shadow-sm'
                  : 'text-white/50 hover:text-white/70'
              }`}
            >
              <span className="mr-1.5">💬</span> 微信支付
            </button>
            <button
              onClick={() => setMethod('alipay')}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                method === 'alipay'
                  ? 'bg-blue-500/20 text-blue-400 shadow-sm'
                  : 'text-white/50 hover:text-white/70'
              }`}
            >
              <span className="mr-1.5">🔷</span> 支付宝
            </button>
          </div>
        )}

        {/* QR Code / Status area */}
        <div className="p-5 flex flex-col items-center">
          <AnimatePresence mode="wait">
            {/* Loading state */}
            {status === 'loading' && (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center py-8">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                >
                  <Loader2 size={40} className="text-blue-400" />
                </motion.div>
                <p className="mt-4 text-white/50 text-sm">正在创建支付订单...</p>
              </motion.div>
            )}

            {/* Error state */}
            {status === 'error' && (
              <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center py-6">
                <div className="w-16 h-16 rounded-full bg-orange-500/20 flex items-center justify-center mb-4">
                  <AlertCircle size={32} className="text-orange-400" />
                </div>
                <h3 className="text-white text-base font-medium">订单创建失败</h3>
                <p className="mt-2 text-white/40 text-sm text-center px-4">{errorMsg}</p>
                <button
                  onClick={createOrder}
                  className="mt-4 px-6 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-sm font-medium transition-colors"
                >
                  重新创建
                </button>
              </motion.div>
            )}

            {/* QR Code display */}
            {(status === 'pending' || status === 'scanning') && qrCodeUrl && (
              <motion.div
                key="qr"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex flex-col items-center"
              >
                <div
                  className="relative p-4 rounded-2xl border-2"
                  style={{
                    borderColor: accentColor,
                    boxShadow: `0 0 30px ${method === 'wechat' ? 'rgba(34,197,94,0.15)' : 'rgba(59,130,246,0.15)'}`,
                    background: 'white',
                    cursor: method === 'wechat' ? 'pointer' : 'default',
                  }}
                  onClick={method === 'wechat' ? simulateWechatPayment : undefined}
                  title={method === 'wechat' ? '点击模拟扫码支付' : '请用支付宝扫描此二维码'}
                >
                  <QRCodeSVG
                    value={qrCodeUrl}
                    size={200}
                    level="M"
                    bgColor="#ffffff"
                    fgColor="#1a1a2e"
                    imageSettings={{
                      src: method === 'wechat'
                        ? 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%2322c55e"><circle cx="12" cy="12" r="12"/><text x="12" y="17" text-anchor="middle" fill="white" font-size="14">W</text></svg>'
                        : 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%233b82f6"><circle cx="12" cy="12" r="12"/><text x="12" y="17" text-anchor="middle" fill="white" font-size="14">A</text></svg>',
                      width: 36,
                      height: 36,
                      excavate: true,
                    }}
                  />
                  {status === 'scanning' && (
                    <motion.div
                      className="absolute inset-4 rounded-lg overflow-hidden"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <motion.div
                        className="w-full h-0.5 rounded-full"
                        style={{ backgroundColor: accentColor }}
                        animate={{ y: [0, 200, 0] }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                      />
                    </motion.div>
                  )}
                </div>

                <div className="mt-4 flex items-center gap-2 text-white/50 text-sm">
                  <Smartphone size={16} />
                  <span>
                    {status === 'scanning'
                      ? '已扫码，请在手机上确认支付...'
                      : method === 'alipay'
                        ? '请使用支付宝扫描二维码'
                        : '请使用微信扫描二维码'}
                  </span>
                </div>

                {method === 'alipay' && status === 'pending' && (
                  <p className="mt-2 text-blue-400 text-xs">支付宝沙箱环境 · 扫码即可真实支付</p>
                )}
                {method === 'wechat' && status === 'pending' && (
                  <p className="mt-2 text-white/30 text-xs">(演示模式：点击二维码模拟扫码支付)</p>
                )}

                <div className="mt-3 flex items-center gap-1.5 text-white/30 text-xs">
                  <Clock size={12} />
                  <span>支付剩余时间 {formatTime(countdown)}</span>
                </div>
              </motion.div>
            )}

            {status === 'confirming' && (
              <motion.div
                key="confirming"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex flex-col items-center py-8"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-16 h-16 rounded-full border-4 border-white/10 border-t-blue-400"
                />
                <p className="mt-4 text-white/70 text-sm">支付确认中...</p>
              </motion.div>
            )}

            {status === 'success' && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', damping: 15, stiffness: 200 }}
                className="flex flex-col items-center py-8"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', delay: 0.1 }}
                  className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mb-4"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', delay: 0.3 }}
                  >
                    <Check size={40} className="text-green-400" strokeWidth={3} />
                  </motion.div>
                </motion.div>
                <h3 className="text-white text-xl font-medium">支付成功</h3>
                <p className="mt-2 text-white/50 text-sm">感谢您的购买！</p>
                <p className="mt-1 text-green-400 font-bold text-lg">¥{totalPrice}</p>
              </motion.div>
            )}

            {status === 'failed' && (
              <motion.div
                key="failed"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center py-8"
              >
                <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center mb-4">
                  <X size={40} className="text-red-400" strokeWidth={3} />
                </div>
                <h3 className="text-white text-xl font-medium">支付超时</h3>
                <p className="mt-2 text-white/50 text-sm">二维码已过期，请重新下单</p>
                <button
                  onClick={onClose}
                  className="mt-4 px-6 py-2 bg-white/10 hover:bg-white/15 text-white rounded-xl transition-colors text-sm"
                >
                  返回商品
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Security badge */}
        <div className="px-5 pb-5 flex items-center justify-center gap-2 text-white/25 text-xs">
          <ShieldCheck size={14} />
          <span>安全加密支付 · 隐私保护</span>
        </div>
      </motion.div>
    </motion.div>
  );
}
