import React, { useState, useEffect, useCallback } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Check, Smartphone, ShieldCheck, Clock } from 'lucide-react';
import { Figurine } from '../data/figurines';

type PaymentMethod = 'wechat' | 'alipay';
type PaymentStatus = 'pending' | 'scanning' | 'confirming' | 'success' | 'failed';

interface PaymentModalProps {
  figurine: Figurine;
  quantity: number;
  onClose: () => void;
  onSuccess: () => void;
}

export default function PaymentModal({ figurine, quantity, onClose, onSuccess }: PaymentModalProps) {
  const [method, setMethod] = useState<PaymentMethod>('wechat');
  const [status, setStatus] = useState<PaymentStatus>('pending');
  const [countdown, setCountdown] = useState(300);

  const totalPrice = figurine.price * quantity;
  const paymentUrl = `https://pay.example.com/order?id=${figurine.id}&qty=${quantity}&amount=${totalPrice}&method=${method}&t=${Date.now()}`;

  useEffect(() => {
    if (status !== 'pending' && status !== 'scanning') return;
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) { setStatus('failed'); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [status]);

  const simulatePayment = useCallback(() => {
    if (status !== 'pending') return;
    setStatus('scanning');
    setTimeout(() => {
      setStatus('confirming');
      setTimeout(() => {
        setStatus('success');
        setTimeout(() => onSuccess(), 2000);
      }, 1500);
    }, 2000);
  }, [status, onSuccess]);

  const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && status !== 'success' && onClose()}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="text-gray-800 text-lg font-bold">扫码支付</h2>
          {status !== 'success' && (
            <button onClick={onClose} className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400">
              <X size={18} />
            </button>
          )}
        </div>

        {/* Order info */}
        <div className="px-5 py-4 flex items-center gap-4 bg-pink-50/50">
          <div className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0" style={{ background: `linear-gradient(135deg, ${figurine.bgFrom}, ${figurine.bgTo})` }}>
            <span className="text-3xl select-none">{figurine.emoji}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-gray-800 font-bold text-sm truncate">{figurine.name}</p>
            <p className="text-gray-400 text-xs">x{quantity}</p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-pink-500 text-xl font-bold">¥{totalPrice}</p>
          </div>
        </div>

        {/* Payment method */}
        {status === 'pending' && (
          <div className="flex mx-5 mt-4 p-1 bg-gray-100 rounded-xl">
            <button
              onClick={() => setMethod('wechat')}
              className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${
                method === 'wechat' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-400'
              }`}
            >
              微信支付
            </button>
            <button
              onClick={() => setMethod('alipay')}
              className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${
                method === 'alipay' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400'
              }`}
            >
              支付宝
            </button>
          </div>
        )}

        {/* QR Code */}
        <div className="p-5 flex flex-col items-center">
          <AnimatePresence mode="wait">
            {(status === 'pending' || status === 'scanning') && (
              <motion.div key="qr" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center">
                <div
                  className="relative p-4 rounded-2xl border-2 cursor-pointer bg-white"
                  style={{
                    borderColor: method === 'wechat' ? '#22c55e' : '#3b82f6',
                    boxShadow: `0 4px 20px ${method === 'wechat' ? 'rgba(34,197,94,0.15)' : 'rgba(59,130,246,0.15)'}`,
                  }}
                  onClick={simulatePayment}
                  title="点击模拟扫码支付"
                >
                  <QRCodeSVG
                    value={paymentUrl}
                    size={180}
                    level="M"
                    bgColor="#ffffff"
                    fgColor="#333333"
                    imageSettings={{
                      src: method === 'wechat'
                        ? 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%2322c55e"><circle cx="12" cy="12" r="12"/><text x="12" y="17" text-anchor="middle" fill="white" font-size="14">W</text></svg>'
                        : 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%233b82f6"><circle cx="12" cy="12" r="12"/><text x="12" y="17" text-anchor="middle" fill="white" font-size="14">A</text></svg>',
                      width: 32,
                      height: 32,
                      excavate: true,
                    }}
                  />
                  {status === 'scanning' && (
                    <motion.div className="absolute inset-4 rounded-lg overflow-hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <motion.div
                        className="w-full h-0.5 rounded-full"
                        style={{ backgroundColor: method === 'wechat' ? '#22c55e' : '#3b82f6' }}
                        animate={{ y: [0, 180, 0] }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                      />
                    </motion.div>
                  )}
                </div>
                <div className="mt-4 flex items-center gap-2 text-gray-400 text-sm">
                  <Smartphone size={16} />
                  <span>{status === 'scanning' ? '已扫码，请在手机上确认...' : `请用${method === 'wechat' ? '微信' : '支付宝'}扫一扫`}</span>
                </div>
                {status === 'pending' && <p className="mt-2 text-gray-300 text-xs">(演示：点击二维码模拟支付)</p>}
                <div className="mt-3 flex items-center gap-1.5 text-gray-300 text-xs">
                  <Clock size={12} /><span>剩余 {formatTime(countdown)}</span>
                </div>
              </motion.div>
            )}

            {status === 'confirming' && (
              <motion.div key="confirming" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center py-8">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-14 h-14 rounded-full border-4 border-gray-200 border-t-pink-400"
                />
                <p className="mt-4 text-gray-500 text-sm">支付确认中...</p>
              </motion.div>
            )}

            {status === 'success' && (
              <motion.div key="success" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center py-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', delay: 0.1 }}
                  className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-4"
                >
                  <Check size={40} className="text-green-500" strokeWidth={3} />
                </motion.div>
                <h3 className="text-gray-800 text-xl font-bold">支付成功!</h3>
                <p className="mt-2 text-gray-400 text-sm">公仔正在打包中~</p>
                <p className="mt-1 text-pink-500 font-bold text-lg">¥{totalPrice}</p>
              </motion.div>
            )}

            {status === 'failed' && (
              <motion.div key="failed" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center py-8">
                <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mb-4">
                  <X size={40} className="text-red-400" strokeWidth={3} />
                </div>
                <h3 className="text-gray-800 text-xl font-bold">支付超时</h3>
                <p className="mt-2 text-gray-400 text-sm">请重新下单</p>
                <button onClick={onClose} className="mt-4 px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full text-sm font-medium">
                  返回
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="px-5 pb-5 flex items-center justify-center gap-2 text-gray-300 text-xs">
          <ShieldCheck size={14} /><span>安全加密 · 隐私保护</span>
        </div>
      </motion.div>
    </motion.div>
  );
}
