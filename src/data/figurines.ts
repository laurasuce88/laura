export interface Figurine {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  tags: string[];
  stock: number;
}

export const figurines: Figurine[] = [
  {
    id: 'sakura-fairy',
    name: '樱花精灵',
    description: '以日本樱花为灵感的精灵公仔，手持一枝盛开的樱花，裙摆如花瓣般飘逸。限量手工上色，每一件都独一无二。',
    price: 299,
    originalPrice: 399,
    image: 'https://image.pollinations.ai/prompt/cute%20anime%20figurine%20sakura%20fairy%20girl%20holding%20cherry%20blossom%20branch%20pink%20dress%20detailed%20PVC%20figure%20studio%20lighting?width=600&height=600&nologo=true',
    category: '花仙系列',
    tags: ['限量', '热销'],
    stock: 12
  },
  {
    id: 'lavender-dream',
    name: '薰衣草之梦',
    description: '普罗旺斯薰衣草田中沉睡的少女，紫色长发随风飘散，周围环绕着梦幻的薰衣草花环。',
    price: 359,
    originalPrice: 459,
    image: 'https://image.pollinations.ai/prompt/cute%20anime%20figurine%20sleeping%20girl%20lavender%20field%20purple%20hair%20flower%20wreath%20detailed%20PVC%20figure%20studio%20lighting?width=600&height=600&nologo=true',
    category: '花仙系列',
    tags: ['新品'],
    stock: 8
  },
  {
    id: 'sunflower-guardian',
    name: '向日葵守护者',
    description: '阳光少年手持巨大的向日葵盾牌，金色铠甲在阳光下闪耀。充满正能量的守护者系列。',
    price: 259,
    image: 'https://image.pollinations.ai/prompt/cute%20anime%20figurine%20boy%20sunflower%20shield%20golden%20armor%20detailed%20PVC%20figure%20studio%20lighting?width=600&height=600&nologo=true',
    category: '守护者系列',
    tags: ['热销'],
    stock: 20
  },
  {
    id: 'lotus-princess',
    name: '莲花公主',
    description: '端坐于莲花宝座之上的优雅公主，身着粉白渐变汉服，手持莲花法杖，气质超然脱俗。',
    price: 499,
    originalPrice: 599,
    image: 'https://image.pollinations.ai/prompt/cute%20anime%20figurine%20lotus%20princess%20sitting%20on%20lotus%20throne%20chinese%20hanfu%20pink%20white%20detailed%20PVC%20figure%20studio%20lighting?width=600&height=600&nologo=true',
    category: '花仙系列',
    tags: ['限量', '新品'],
    stock: 5
  },
  {
    id: 'rose-knight',
    name: '玫瑰骑士',
    description: '身披红色斗篷的英勇骑士，手持玫瑰剑，是爱与勇气的化身。底座精心还原玫瑰花园场景。',
    price: 329,
    image: 'https://image.pollinations.ai/prompt/cute%20anime%20figurine%20rose%20knight%20red%20cape%20rose%20sword%20detailed%20PVC%20figure%20studio%20lighting?width=600&height=600&nologo=true',
    category: '守护者系列',
    tags: [],
    stock: 15
  },
  {
    id: 'orchid-dancer',
    name: '兰花舞者',
    description: '翩翩起舞的兰花精灵，透明的蝴蝶翅膀在光线下折射出梦幻光彩。动态舞姿定格最美瞬间。',
    price: 389,
    originalPrice: 489,
    image: 'https://image.pollinations.ai/prompt/cute%20anime%20figurine%20orchid%20dancer%20butterfly%20wings%20dancing%20pose%20purple%20detailed%20PVC%20figure%20studio%20lighting?width=600&height=600&nologo=true',
    category: '花仙系列',
    tags: ['限量'],
    stock: 3
  }
];
