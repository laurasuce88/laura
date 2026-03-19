import React, { useEffect, useRef, useState, useMemo } from 'react';
import Globe from 'react-globe.gl';
import { Flower, flowers } from '../data/flowers';
import { motion, AnimatePresence } from 'motion/react';
import { X, MapPin, ChevronRight } from 'lucide-react';

export default function FlowerGlobe() {
  const globeRef = useRef<any>();
  const [selectedFlower, setSelectedFlower] = useState<Flower | null>(null);
  const [dimensions, setDimensions] = useState({ width: window.innerWidth, height: window.innerHeight });

  // 生成遍布全球的真实背景花朵数据
  const backgroundFlowers = useMemo(() => {
    // 生成 600 朵背景花，让地球看起来开满鲜花
    return Array.from({ length: 600 }).map((_, i) => {
      // 随机选择一种真实的花朵图片作为背景
      const randomFlower = flowers[Math.floor(Math.random() * flowers.length)];
      return {
        ...randomFlower, // 继承所有属性（名称、描述等），以便点击时能正常显示详情
        isBackground: true,
        id: `bg-${i}`,
        lat: (Math.random() - 0.5) * 160,
        lng: (Math.random() - 0.5) * 360,
        size: Math.random() * 14 + 10 // 10px 到 24px 大小不等
      };
    });
  }, []);

  // 合并主要互动花朵和背景花朵
  const allElements = useMemo(() => [...flowers, ...backgroundFlowers], [backgroundFlowers]);

  useEffect(() => {
    const handleResize = () => {
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (globeRef.current) {
      // 自动旋转
      globeRef.current.controls().autoRotate = true;
      globeRef.current.controls().autoRotateSpeed = 0.5;
      
      // 初始视角
      globeRef.current.pointOfView({ lat: 20, lng: 0, altitude: 2.5 });
    }
  }, []);

  const handleFlowerClick = (flower: Flower) => {
    setSelectedFlower(flower);
    if (globeRef.current) {
      globeRef.current.controls().autoRotate = false;
      globeRef.current.pointOfView({ lat: flower.lat, lng: flower.lng, altitude: 1.2 }, 1500);
    }
  };

  const handleCloseModal = () => {
    setSelectedFlower(null);
    if (globeRef.current) {
      globeRef.current.controls().autoRotate = true;
      globeRef.current.pointOfView({ altitude: 2.5 }, 1500);
    }
  };

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden font-sans">
      {/* 星空背景 */}
      <div className="absolute inset-0 z-0 opacity-50 pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(circle at center, #1a1a2e 0%, #000000 100%)' }} />
      
      <div className="absolute inset-0 z-10">
        <Globe
          ref={globeRef}
          width={dimensions.width}
          height={dimensions.height}
          globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
          bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
          backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
          
          // 渲染所有花朵（真实的图片）
          htmlElementsData={allElements}
          ringsData={selectedFlower ? [selectedFlower] : []}
          ringColor={(d: any) => d.color}
          ringMaxRadius={8}
          ringPropagationSpeed={2}
          ringRepeatPeriod={800}
          htmlElement={(d: any) => {
            const el = document.createElement('div');
            
            if (d.isBackground) {
              // 背景小花朵
              el.innerHTML = `
                <div class="rounded-full overflow-hidden opacity-60 hover:opacity-100 transition-all duration-300 cursor-pointer hover:scale-150"
                     style="width: ${d.size}px; height: ${d.size}px; border: 1px solid ${d.color}; box-shadow: 0 0 8px ${d.color}">
                  <img src="${d.image}" class="w-full h-full object-cover" onerror="if(!this.dataset.fallback){this.dataset.fallback='true';this.src='https://image.pollinations.ai/prompt/beautiful%20${d.id}%20flower?width=800&height=800&nologo=true';}" />
                </div>
              `;
              el.style.pointerEvents = 'auto';
              el.onclick = () => handleFlowerClick(d as Flower);
            } else {
              // 主要可互动的花朵
              const flower = d as Flower;
              el.innerHTML = `
                <div class="flower-marker group cursor-pointer relative flex items-center justify-center">
                  <!-- 静态呼吸光晕 -->
                  <div class="absolute w-16 h-16 rounded-full animate-ping opacity-30" style="background-color: ${flower.color}"></div>
                  <div class="absolute w-12 h-12 rounded-full opacity-40 animate-pulse" style="background-color: ${flower.color}; filter: blur(8px);"></div>
                  
                  <!-- 真实花朵图片 -->
                  <div class="relative w-10 h-10 rounded-full overflow-hidden border-2 transition-transform duration-500 group-hover:scale-150 z-10" 
                       style="border-color: ${flower.color}; box-shadow: 0 0 15px ${flower.color}, 0 0 30px ${flower.color}">
                    <img src="${flower.image}" class="w-full h-full object-cover" onerror="if(!this.dataset.fallback){this.dataset.fallback='true';this.src='https://image.pollinations.ai/prompt/beautiful%20${flower.id}%20flower?width=800&height=800&nologo=true';}" />
                  </div>
                  
                  <!-- 提示框 -->
                  <div class="absolute top-14 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-white text-sm font-medium bg-black/80 px-3 py-1 rounded-full backdrop-blur-md border border-white/20 z-20">
                    ${flower.name}
                  </div>
                </div>
              `;
              
              el.style.pointerEvents = 'auto';
              el.onclick = () => handleFlowerClick(flower);
            }
            
            return el;
          }}
        />
      </div>

      {/* 头部与侧边栏 */}
      <div className="absolute top-0 left-0 h-full z-20 pointer-events-none flex flex-col">
        <div className="p-8">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="text-4xl md:text-5xl font-serif text-white tracking-wider drop-shadow-lg"
          >
            繁花<span className="text-pink-400 font-light">星球</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1 }}
            className="text-white/60 mt-2 font-light tracking-widest uppercase text-xs"
          >
            探索世界各地的绚丽繁花 (10个品种，600处分布)
          </motion.p>
        </div>

        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, delay: 1.5 }}
          className="flex-1 overflow-y-auto pointer-events-auto px-6 pb-8 w-80 custom-scrollbar"
          style={{ scrollbarWidth: 'none' }}
        >
          <div className="space-y-4">
            {flowers.map((flower, index) => (
              <motion.div
                key={flower.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.5 + index * 0.1 }}
                onClick={() => handleFlowerClick(flower)}
                className={`group cursor-pointer p-4 rounded-2xl border transition-all duration-300 ${
                  selectedFlower?.name === flower.name 
                    ? 'bg-white/10 border-white/30 shadow-[0_0_20px_rgba(255,255,255,0.1)]' 
                    : 'bg-black/20 border-white/5 hover:bg-white/5'
                } backdrop-blur-md`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full overflow-hidden border-2 shrink-0 group-hover:scale-110 transition-transform duration-300"
                         style={{ borderColor: flower.color, boxShadow: `0 0 10px ${flower.color}` }}>
                      <img 
                        src={flower.image} 
                        alt={flower.name} 
                        className="w-full h-full object-cover" 
                        onError={(e) => { 
                          const target = e.currentTarget;
                          if (!target.dataset.fallback) {
                            target.dataset.fallback = 'true';
                            target.src = `https://image.pollinations.ai/prompt/beautiful%20${flower.id}%20flower?width=800&height=800&nologo=true`;
                          }
                        }}
                      />
                    </div>
                    <div>
                      <h3 className="text-white font-serif text-lg group-hover:text-pink-200 transition-colors">{flower.name.split(' ')[0]}</h3>
                      <p className="text-white/40 text-xs italic font-serif">{flower.scientificName}</p>
                    </div>
                  </div>
                  <ChevronRight size={16} className={`text-white/30 transition-transform duration-300 ${selectedFlower?.name === flower.name ? 'translate-x-1 text-white' : 'group-hover:translate-x-1'}`} />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* 花朵详情弹窗 */}
      <AnimatePresence>
        {selectedFlower && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.9, x: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed right-4 md:right-8 top-1/2 -translate-y-1/2 z-50 w-[calc(100vw-2rem)] sm:w-80 md:w-96 max-h-[90vh] flex flex-col bg-black/60 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
          >
            <div className="relative h-48 sm:h-56 shrink-0 overflow-hidden flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent z-10" />
              <motion.img 
                key={selectedFlower.id}
                initial={{ scale: 1.2, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.8 }}
                src={selectedFlower.image} 
                alt={selectedFlower.name}
                className="absolute inset-0 w-full h-full object-cover"
                onError={(e: any) => { 
                  const target = e.currentTarget;
                  if (!target.dataset.fallback) {
                    target.dataset.fallback = 'true';
                    target.src = `https://image.pollinations.ai/prompt/beautiful%20${selectedFlower.id}%20flower?width=800&height=800&nologo=true`;
                  }
                }}
              />
              <button 
                onClick={handleCloseModal}
                className="absolute top-4 right-4 z-20 p-2 bg-black/50 hover:bg-black/80 rounded-full text-white/80 hover:text-white transition-colors backdrop-blur-md"
              >
                <X size={18} />
              </button>
              
              {/* 绽放特效：真实的图片放大并消散 */}
              <motion.div 
                key={`bloom-img-${selectedFlower.id}`}
                initial={{ scale: 0.5, opacity: 0.9, rotate: -20 }}
                animate={{ scale: 4, opacity: 0, rotate: 20 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="absolute z-20 pointer-events-none rounded-full overflow-hidden border-4"
                style={{ 
                  width: '120px', 
                  height: '120px', 
                  borderColor: selectedFlower.color,
                  boxShadow: `0 0 40px ${selectedFlower.color}` 
                }}
              >
                <img 
                  src={selectedFlower.image} 
                  className="w-full h-full object-cover" 
                  onError={(e) => { 
                    const target = e.currentTarget;
                    if (!target.dataset.fallback) {
                      target.dataset.fallback = 'true';
                      target.src = `https://image.pollinations.ai/prompt/beautiful%20${selectedFlower.id}%20flower?width=800&height=800&nologo=true`;
                    }
                  }}
                />
              </motion.div>
              
              <div className="absolute bottom-4 left-6 z-20">
                <h2 className="text-3xl font-serif text-white mb-1 drop-shadow-md">{selectedFlower.name.split(' ')[0]}</h2>
                <p className="text-sm text-white/70 italic font-serif drop-shadow-md">{selectedFlower.scientificName}</p>
              </div>
            </div>
            
            <div className="p-6 relative overflow-y-auto custom-scrollbar">
              <motion.div 
                key={`line-${selectedFlower.id}`}
                initial={{ width: 0 }}
                animate={{ width: "3rem" }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="h-1 mb-6 rounded-full"
                style={{ backgroundColor: selectedFlower.color, boxShadow: `0 0 10px ${selectedFlower.color}` }}
              />
              
              <p className="text-white/80 text-sm leading-relaxed font-light">
                {selectedFlower.description}
              </p>
              
              <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4 shrink-0">
                <div className="flex items-center gap-2 text-xs text-white/50 uppercase tracking-widest flex-wrap">
                  <MapPin size={14} className="text-white/40 shrink-0" />
                  <span className="whitespace-nowrap">纬度: {selectedFlower.lat.toFixed(2)}°</span>
                  <span className="hidden sm:inline">•</span>
                  <span className="whitespace-nowrap">经度: {selectedFlower.lng.toFixed(2)}°</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
