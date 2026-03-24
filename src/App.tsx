/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import FlowerGlobe from './components/Globe';
import FigurineShop from './components/FigurineShop';

type Page = 'globe' | 'shop';

export default function App() {
  const [page, setPage] = useState<Page>('globe');

  return (
    <div className="w-full min-h-screen bg-black">
      {page === 'globe' && (
        <>
          <FlowerGlobe />
          {/* 商城入口按钮 */}
          <button
            onClick={() => setPage('shop')}
            className="fixed bottom-8 right-8 z-50 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-400 hover:to-purple-400 text-white rounded-2xl font-medium shadow-lg shadow-pink-500/30 transition-all hover:scale-105 backdrop-blur-md border border-white/10"
          >
            🎀 公仔商城
          </button>
        </>
      )}
      {page === 'shop' && (
        <FigurineShop onBack={() => setPage('globe')} />
      )}
    </div>
  );
}
