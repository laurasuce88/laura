import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingCart, Plus, Minus, Star, Package, X, Heart, Truck, ShieldCheck } from 'lucide-react';
import { figurines, Figurine } from '../data/figurines';
import PaymentModal from './PaymentModal';

interface CartItem {
  figurine: Figurine;
  quantity: number;
}

export default function FigurineShop() {
  const [selectedFigurine, setSelectedFigurine] = useState<Figurine | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [payingItem, setPayingItem] = useState<{ figurine: Figurine; quantity: number } | null>(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [activeCategory, setActiveCategory] = useState('全部');

  const categories = ['全部', ...Array.from(new Set(figurines.map(f => f.category)))];
  const filteredFigurines = activeCategory === '全部' ? figurines : figurines.filter(f => f.category === activeCategory);

  const addToCart = (figurine: Figurine, e?: React.MouseEvent) => {
    e?.stopPropagation();
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
    setSelectedFigurine(null);
    setPayingItem({ figurine, quantity: 1 });
  };

  const handleCheckout = () => {
    if (cart.length === 0) return;
    const totalItem: Figurine = {
      ...cart[0].figurine,
      name: `${cart.length}件商品`,
      price: cartTotal,
    };
    setPayingItem({ figurine: totalItem, quantity: 1 });
    setShowCart(false);
  };

  const handlePaymentSuccess = () => {
    setSuccessMessage('下单成功！可爱公仔正在打包中~');
    setPayingItem(null);
    setCart([]);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  return (
    <div className="min-h-screen bg-[#fef7f0] text-gray-800">
      {/* 顶部导航栏 */}
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-pink-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🧸</span>
            <div>
              <h1 className="text-lg font-bold text-gray-800 tracking-wide">
                咕咕公仔屋
              </h1>
              <p className="text-[10px] text-pink-400 tracking-widest">GUGU FIGURINE HOUSE</p>
            </div>
          </div>
          <button
            onClick={() => setShowCart(!showCart)}
            className="relative p-2.5 rounded-2xl hover:bg-pink-50 transition-colors"
          >
            <ShoppingCart size={22} className="text-gray-600" />
            {cartCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-pink-500 rounded-full text-white text-[11px] flex items-center justify-center font-bold"
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
            className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-6 py-3 bg-green-50 border border-green-200 rounded-2xl text-green-600 font-medium shadow-lg"
          >
            {successMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 横幅 */}
      <div className="relative overflow-hidden bg-gradient-to-r from-pink-100 via-purple-50 to-yellow-50 py-10 sm:py-14 px-4">
        <div className="absolute top-2 left-10 text-4xl opacity-30 animate-bounce" style={{ animationDelay: '0s' }}>🐱</div>
        <div className="absolute top-4 right-16 text-3xl opacity-30 animate-bounce" style={{ animationDelay: '0.5s' }}>🐰</div>
        <div className="absolute bottom-2 left-1/4 text-3xl opacity-20 animate-bounce" style={{ animationDelay: '1s' }}>⭐</div>
        <div className="absolute bottom-4 right-1/3 text-2xl opacity-20 animate-bounce" style={{ animationDelay: '1.5s' }}>🌈</div>
        <div className="relative max-w-6xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-3">
              把可爱带回家 <span className="inline-block animate-pulse">💕</span>
            </h2>
            <p className="text-gray-500 max-w-md mx-auto text-sm leading-relaxed">
              每一只公仔都有独特的小故事，选一只你最喜欢的，扫码支付即可拥有~
            </p>
          </motion.div>
        </div>
      </div>

      {/* 信任标识 */}
      <div className="max-w-6xl mx-auto px-4 py-4 flex justify-center gap-6 sm:gap-10 text-xs text-gray-400">
        <div className="flex items-center gap-1.5"><Truck size={14} /> 全国包邮</div>
        <div className="flex items-center gap-1.5"><ShieldCheck size={14} /> 正品保证</div>
        <div className="flex items-center gap-1.5"><Heart size={14} /> 7天无理由</div>
      </div>

      {/* 分类标签 */}
      <div className="max-w-6xl mx-auto px-4 pb-2">
        <div className="flex gap-2 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-all ${
                activeCategory === cat
                  ? 'bg-pink-500 text-white shadow-md shadow-pink-200'
                  : 'bg-white text-gray-500 hover:bg-pink-50 border border-gray-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* 商品列表 */}
      <div className="max-w-6xl mx-auto px-4 py-6 pb-24">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
          {filteredFigurines.map((figurine, index) => (
            <motion.div
              key={figurine.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => setSelectedFigurine(figurine)}
              className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer border border-pink-50 hover:border-pink-200"
            >
              <div className="relative aspect-square overflow-hidden" style={{ backgroundColor: figurine.bgColor }}>
                {/* Emoji 背景兜底 */}
                <div className="absolute inset-0 flex items-center justify-center text-8xl opacity-80 pointer-events-none select-none">
                  {figurine.emoji}
                </div>
                <img
                  src={figurine.image}
                  alt={figurine.name}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  loading="lazy"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
                {figurine.tags.length > 0 && (
                  <div className="absolute top-2 left-2 flex flex-col gap-1">
                    {figurine.tags.map(tag => (
                      <span
                        key={tag}
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          tag === '限量'
                            ? 'bg-red-500 text-white'
                            : tag === '新品'
                            ? 'bg-blue-500 text-white'
                            : 'bg-orange-500 text-white'
                        }`}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                {figurine.stock <= 10 && (
                  <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md text-[10px] bg-black/50 text-white backdrop-blur-sm">
                    仅剩{figurine.stock}件
                  </div>
                )}
              </div>
              <div className="p-3 sm:p-4">
                <h3 className="font-bold text-sm sm:text-base text-gray-800 truncate">{figurine.name}</h3>
                <p className="text-gray-400 text-xs mt-1 line-clamp-1">{figurine.description}</p>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-baseline gap-1">
                    <span className="text-pink-500 text-lg sm:text-xl font-bold">¥{figurine.price}</span>
                    {figurine.originalPrice && (
                      <span className="text-gray-300 text-xs line-through">¥{figurine.originalPrice}</span>
                    )}
                  </div>
                  <button
                    onClick={(e) => addToCart(figurine, e)}
                    className="p-2 rounded-xl bg-pink-500 hover:bg-pink-400 text-white transition-colors shadow-sm shadow-pink-200 active:scale-90"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* 底部购物栏 */}
      {cartCount > 0 && (
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-pink-100 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]"
        >
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
            <button onClick={() => setShowCart(true)} className="flex items-center gap-3">
              <div className="relative">
                <ShoppingCart size={24} className="text-gray-600" />
                <span className="absolute -top-2 -right-2 w-5 h-5 bg-pink-500 rounded-full text-white text-[11px] flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              </div>
              <div className="text-left">
                <p className="text-pink-500 text-xl font-bold">¥{cartTotal}</p>
              </div>
            </button>
            <button
              onClick={handleCheckout}
              className="px-8 py-3 rounded-full bg-gradient-to-r from-pink-500 to-rose-400 text-white font-bold shadow-lg shadow-pink-200 active:scale-95 transition-transform"
            >
              去结算
            </button>
          </div>
        </motion.div>
      )}

      {/* 购物车侧边栏 */}
      <AnimatePresence>
        {showCart && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/30"
              onClick={() => setShowCart(false)}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl max-h-[70vh] flex flex-col"
            >
              <div className="p-5 border-b border-gray-100 flex items-center justify-between shrink-0">
                <h3 className="font-bold text-lg text-gray-800">购物车 ({cartCount})</h3>
                <button onClick={() => setShowCart(false)} className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400">
                  <X size={18} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {cart.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-gray-300">
                    <Package size={48} className="mb-3" />
                    <p>购物车空空的~</p>
                  </div>
                ) : (
                  cart.map(item => (
                    <div key={item.figurine.id} className="flex gap-3 p-3 rounded-2xl bg-pink-50/50 border border-pink-100">
                      <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0" style={{ backgroundColor: item.figurine.bgColor }}>
                        <div className="absolute inset-0 flex items-center justify-center text-3xl select-none">{item.figurine.emoji}</div>
                        <img src={item.figurine.image} alt={item.figurine.name} className="absolute inset-0 w-full h-full object-cover" loading="lazy" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm text-gray-800 truncate">{item.figurine.name}</p>
                        <p className="text-pink-500 font-bold mt-1">¥{item.figurine.price}</p>
                        <div className="flex items-center gap-3 mt-1.5">
                          <button
                            onClick={() => removeFromCart(item.figurine.id)}
                            className="p-1 rounded-lg bg-white border border-gray-200 text-gray-400 active:scale-90"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="text-sm font-bold w-5 text-center">{item.quantity}</span>
                          <button
                            onClick={() => addToCart(item.figurine)}
                            className="p-1 rounded-lg bg-white border border-gray-200 text-gray-400 active:scale-90"
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
                <div className="p-4 border-t border-gray-100 shrink-0">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-gray-400 text-sm">合计</span>
                    <span className="text-pink-500 text-2xl font-bold">¥{cartTotal}</span>
                  </div>
                  <button
                    onClick={handleCheckout}
                    className="w-full py-3.5 rounded-full bg-gradient-to-r from-pink-500 to-rose-400 text-white font-bold shadow-lg shadow-pink-200 active:scale-[0.98] transition-transform"
                  >
                    扫码支付
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
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/30"
            onClick={(e) => e.target === e.currentTarget && setSelectedFigurine(null)}
          >
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-md max-h-[85vh] flex flex-col overflow-hidden"
            >
              <div className="relative aspect-square overflow-hidden shrink-0" style={{ backgroundColor: selectedFigurine.bgColor }}>
                <div className="absolute inset-0 flex items-center justify-center text-[120px] opacity-80 pointer-events-none select-none">{selectedFigurine.emoji}</div>
                <img src={selectedFigurine.image} alt={selectedFigurine.name} className="absolute inset-0 w-full h-full object-cover" loading="lazy" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                <button
                  onClick={() => setSelectedFigurine(null)}
                  className="absolute top-4 right-4 p-2 bg-white/80 hover:bg-white rounded-full text-gray-500 backdrop-blur-md shadow-sm"
                >
                  <X size={18} />
                </button>
                {selectedFigurine.originalPrice && (
                  <div className="absolute top-4 left-4 px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-lg shadow-sm">
                    省¥{selectedFigurine.originalPrice - selectedFigurine.price}
                  </div>
                )}
              </div>
              <div className="p-5 overflow-y-auto">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] px-2 py-0.5 bg-pink-100 text-pink-500 rounded-md font-medium">{selectedFigurine.category}</span>
                  <div className="flex items-center gap-0.5 text-yellow-400">
                    <Star size={12} fill="currentColor" />
                    <Star size={12} fill="currentColor" />
                    <Star size={12} fill="currentColor" />
                    <Star size={12} fill="currentColor" />
                    <Star size={12} fill="currentColor" />
                    <span className="text-xs text-gray-400 ml-1">4.9</span>
                  </div>
                </div>
                <h2 className="text-xl font-bold text-gray-800 mt-2">{selectedFigurine.name}</h2>
                <p className="text-gray-500 text-sm leading-relaxed mt-3">{selectedFigurine.description}</p>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-pink-500 text-3xl font-bold">¥{selectedFigurine.price}</span>
                  {selectedFigurine.originalPrice && (
                    <span className="text-gray-300 text-sm line-through">¥{selectedFigurine.originalPrice}</span>
                  )}
                </div>
                <p className="text-gray-400 text-xs mt-1">库存 {selectedFigurine.stock} 件 · 全国包邮</p>
                <div className="flex gap-3 mt-5">
                  <button
                    onClick={() => { addToCart(selectedFigurine); setSelectedFigurine(null); }}
                    className="flex-1 py-3 rounded-full bg-pink-50 text-pink-500 font-bold border-2 border-pink-200 hover:bg-pink-100 transition-colors active:scale-[0.98]"
                  >
                    加入购物车
                  </button>
                  <button
                    onClick={() => handleBuyNow(selectedFigurine)}
                    className="flex-1 py-3 rounded-full bg-gradient-to-r from-pink-500 to-rose-400 text-white font-bold shadow-lg shadow-pink-200 active:scale-[0.98] transition-transform"
                  >
                    立即购买
                  </button>
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
