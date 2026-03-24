import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingCart, Plus, Minus, ArrowLeft, Star, Package, Sparkles } from 'lucide-react';
import { figurines, Figurine } from '../data/figurines';
import PaymentModal from './PaymentModal';

interface CartItem {
  figurine: Figurine;
  quantity: number;
}

interface FigurineShopProps {
  onBack: () => void;
}

export default function FigurineShop({ onBack }: FigurineShopProps) {
  const [selectedFigurine, setSelectedFigurine] = useState<Figurine | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [payingItem, setPayingItem] = useState<{ figurine: Figurine; quantity: number } | null>(null);
  const [successMessage, setSuccessMessage] = useState('');

  const addToCart = (figurine: Figurine) => {
    setCart(prev => {
      const existing = prev.find(item => item.figurine.id === figurine.id);
      if (existing) {
        return prev.map(item =>
          item.figurine.id === figurine.id
            ? { ...item, quantity: Math.min(item.quantity + 1, figurine.stock) }
            : item
        );
      }
      return [...prev, { figurine, quantity: 1 }];
    });
  };

  const removeFromCart = (figurineId: string) => {
    setCart(prev => {
      const existing = prev.find(item => item.figurine.id === figurineId);
      if (existing && existing.quantity > 1) {
        return prev.map(item =>
          item.figurine.id === figurineId ? { ...item, quantity: item.quantity - 1 } : item
        );
      }
      return prev.filter(item => item.figurine.id !== figurineId);
    });
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.figurine.price * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleBuyNow = (figurine: Figurine) => {
    setPayingItem({ figurine, quantity: 1 });
  };

  const handleCheckout = () => {
    if (cart.length === 0) return;
    // 简化处理：用购物车第一件商品生成支付
    const totalItem: Figurine = {
      ...cart[0].figurine,
      name: `${cart.length}件商品`,
      price: cartTotal,
    };
    setPayingItem({ figurine: totalItem, quantity: 1 });
    setShowCart(false);
  };

  const handlePaymentSuccess = () => {
    setSuccessMessage('下单成功！公仔将很快送达~ 🎉');
    setPayingItem(null);
    setCart([]);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black text-white">
      {/* 顶部导航栏 */}
      <nav className="sticky top-0 z-50 bg-gray-950/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="p-2 rounded-xl hover:bg-white/10 text-white/60 hover:text-white transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-xl font-serif tracking-wide">
                繁花<span className="text-pink-400">公仔</span>商城
              </h1>
              <p className="text-white/40 text-xs tracking-wider">FLORA FIGURINE SHOP</p>
            </div>
          </div>
          <button
            onClick={() => setShowCart(!showCart)}
            className="relative p-2.5 rounded-xl hover:bg-white/10 transition-colors"
          >
            <ShoppingCart size={22} className="text-white/70" />
            {cartCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 w-5 h-5 bg-pink-500 rounded-full text-white text-xs flex items-center justify-center font-bold"
              >
                {cartCount}
              </motion.span>
            )}
          </button>
        </div>
      </nav>

      {/* 成功提示 */}
      <AnimatePresence>
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-6 py-3 bg-green-500/20 border border-green-500/30 rounded-2xl text-green-400 font-medium backdrop-blur-xl"
          >
            {successMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 横幅 */}
      <div className="relative overflow-hidden py-12 sm:py-16 px-4">
        <div className="absolute inset-0 bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-blue-500/10" />
        <div className="relative max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center justify-center gap-2 mb-3">
              <Sparkles size={18} className="text-pink-400" />
              <span className="text-pink-400/80 text-sm tracking-widest uppercase">限量发售中</span>
              <Sparkles size={18} className="text-pink-400" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-serif mb-3">花之精灵系列公仔</h2>
            <p className="text-white/50 max-w-xl mx-auto text-sm leading-relaxed">
              每一款公仔都以世界各地的名花为灵感，纯手工上色，限量发售。扫码即可完成支付，轻松拥有你的花之守护精灵。
            </p>
          </motion.div>
        </div>
      </div>

      {/* 商品列表 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {figurines.map((figurine, index) => (
            <motion.div
              key={figurine.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-hidden hover:border-white/15 transition-all duration-500 hover:shadow-[0_0_40px_rgba(255,255,255,0.05)]"
            >
              {/* 商品图片 */}
              <div
                className="relative aspect-square overflow-hidden cursor-pointer"
                onClick={() => setSelectedFigurine(figurine)}
              >
                <img
                  src={figurine.image}
                  alt={figurine.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                {/* 标签 */}
                {figurine.tags.length > 0 && (
                  <div className="absolute top-3 left-3 flex gap-2">
                    {figurine.tags.map(tag => (
                      <span
                        key={tag}
                        className={`px-2.5 py-1 rounded-full text-xs font-medium backdrop-blur-md ${
                          tag === '限量'
                            ? 'bg-red-500/30 text-red-300 border border-red-500/30'
                            : tag === '新品'
                            ? 'bg-blue-500/30 text-blue-300 border border-blue-500/30'
                            : 'bg-orange-500/30 text-orange-300 border border-orange-500/30'
                        }`}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                {/* 库存 */}
                {figurine.stock <= 5 && (
                  <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs bg-black/60 text-white/70 backdrop-blur-md border border-white/10">
                    仅剩 {figurine.stock} 件
                  </div>
                )}
                <div className="absolute bottom-3 left-3">
                  <span className="text-white/50 text-xs tracking-wider uppercase">{figurine.category}</span>
                </div>
              </div>

              {/* 商品信息 */}
              <div className="p-5">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-white font-medium text-lg">{figurine.name}</h3>
                  <div className="flex items-center gap-0.5 text-yellow-400 shrink-0 ml-2">
                    <Star size={14} fill="currentColor" />
                    <span className="text-xs text-white/50">4.9</span>
                  </div>
                </div>
                <p className="text-white/40 text-sm line-clamp-2 leading-relaxed mb-4">{figurine.description}</p>
                <div className="flex items-end justify-between">
                  <div>
                    <span className="text-orange-400 text-2xl font-bold">¥{figurine.price}</span>
                    {figurine.originalPrice && (
                      <span className="text-white/30 text-sm line-through ml-2">¥{figurine.originalPrice}</span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => addToCart(figurine)}
                      className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors border border-white/5"
                      title="加入购物车"
                    >
                      <ShoppingCart size={18} />
                    </button>
                    <button
                      onClick={() => handleBuyNow(figurine)}
                      className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-400 hover:to-purple-400 text-white text-sm font-medium transition-all shadow-lg shadow-pink-500/20"
                    >
                      立即购买
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* 购物车侧边栏 */}
      <AnimatePresence>
        {showCart && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowCart(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-sm bg-gray-950 border-l border-white/10 flex flex-col"
            >
              <div className="p-5 border-b border-white/10 flex items-center justify-between">
                <h3 className="text-white font-medium text-lg">购物车 ({cartCount})</h3>
                <button
                  onClick={() => setShowCart(false)}
                  className="p-1.5 rounded-full hover:bg-white/10 text-white/60"
                >
                  <ArrowLeft size={18} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {cart.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-white/30">
                    <Package size={48} className="mb-3" />
                    <p>购物车是空的</p>
                  </div>
                ) : (
                  cart.map(item => (
                    <div key={item.figurine.id} className="flex gap-4 p-3 rounded-xl bg-white/[0.03] border border-white/5">
                      <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 border border-white/10">
                        <img src={item.figurine.image} alt={item.figurine.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium truncate">{item.figurine.name}</p>
                        <p className="text-orange-400 font-bold mt-1">¥{item.figurine.price}</p>
                        <div className="flex items-center gap-3 mt-2">
                          <button
                            onClick={() => removeFromCart(item.figurine.id)}
                            className="p-1 rounded-md bg-white/5 hover:bg-white/10 text-white/50"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="text-white text-sm w-6 text-center">{item.quantity}</span>
                          <button
                            onClick={() => addToCart(item.figurine)}
                            className="p-1 rounded-md bg-white/5 hover:bg-white/10 text-white/50"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {cart.length > 0 && (
                <div className="p-5 border-t border-white/10">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-white/50">合计</span>
                    <span className="text-orange-400 text-2xl font-bold">¥{cartTotal}</span>
                  </div>
                  <button
                    onClick={handleCheckout}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-400 hover:to-purple-400 text-white font-medium transition-all shadow-lg shadow-pink-500/20"
                  >
                    扫码结算
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* 商品详情弹窗 */}
      <AnimatePresence>
        {selectedFigurine && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
            onClick={(e) => e.target === e.currentTarget && setSelectedFigurine(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-950 border border-white/10 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl max-h-[90vh] flex flex-col"
            >
              <div className="relative aspect-[4/3] overflow-hidden shrink-0">
                <img src={selectedFigurine.image} alt={selectedFigurine.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-transparent to-transparent" />
                <button
                  onClick={() => setSelectedFigurine(null)}
                  className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/80 rounded-full text-white/80 backdrop-blur-md"
                >
                  <ArrowLeft size={18} />
                </button>
                <div className="absolute bottom-4 left-5">
                  <span className="text-white/50 text-xs tracking-wider uppercase">{selectedFigurine.category}</span>
                  <h2 className="text-white text-2xl font-serif mt-1">{selectedFigurine.name}</h2>
                </div>
              </div>
              <div className="p-5 overflow-y-auto">
                <p className="text-white/60 text-sm leading-relaxed">{selectedFigurine.description}</p>
                <div className="mt-5 flex items-end justify-between">
                  <div>
                    <span className="text-orange-400 text-3xl font-bold">¥{selectedFigurine.price}</span>
                    {selectedFigurine.originalPrice && (
                      <span className="text-white/30 text-sm line-through ml-2">¥{selectedFigurine.originalPrice}</span>
                    )}
                    <p className="text-white/30 text-xs mt-1">库存: {selectedFigurine.stock} 件</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => { addToCart(selectedFigurine); setSelectedFigurine(null); }}
                      className="px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white text-sm border border-white/10 transition-colors"
                    >
                      加入购物车
                    </button>
                    <button
                      onClick={() => { setSelectedFigurine(null); handleBuyNow(selectedFigurine); }}
                      className="px-5 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-400 hover:to-purple-400 text-white text-sm font-medium shadow-lg shadow-pink-500/20"
                    >
                      立即购买
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 支付弹窗 */}
      <AnimatePresence>
        {payingItem && (
          <PaymentModal
            figurine={payingItem.figurine}
            quantity={payingItem.quantity}
            onClose={() => setPayingItem(null)}
            onSuccess={handlePaymentSuccess}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
