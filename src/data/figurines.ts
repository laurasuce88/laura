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
    id: 'sleepy-cat',
    name: '瞌睡猫咪',
    description: '趴在云朵上打盹的小猫咪，柔软的肉垫和微微翘起的尾巴，治愈感满满。附赠迷你毛线球配件。',
    price: 89,
    originalPrice: 129,
    image: 'https://image.pollinations.ai/prompt/super%20cute%20kawaii%20sleeping%20cat%20figurine%20on%20cloud%20pastel%20colors%20chibi%20style%20soft%20lighting%20studio%20photo%20white%20background?width=600&height=600&nologo=true',
    category: '萌宠系列',
    tags: ['热销'],
    stock: 30
  },
  {
    id: 'bunny-strawberry',
    name: '草莓兔兔',
    description: '头戴草莓帽的害羞小兔子，粉嫩的脸颊和圆溜溜的大眼睛让人忍不住想捏一捏！',
    price: 69,
    image: 'https://image.pollinations.ai/prompt/super%20cute%20kawaii%20bunny%20figurine%20wearing%20strawberry%20hat%20pink%20cheeks%20chibi%20style%20pastel%20studio%20photo%20white%20background?width=600&height=600&nologo=true',
    category: '萌宠系列',
    tags: ['新品', '热销'],
    stock: 50
  },
  {
    id: 'penguin-scarf',
    name: '围巾小企鹅',
    description: '围着红色围巾的呆萌企鹅宝宝，胖嘟嘟的身体摇摇晃晃，放在桌上超级解压。',
    price: 79,
    originalPrice: 99,
    image: 'https://image.pollinations.ai/prompt/super%20cute%20kawaii%20baby%20penguin%20figurine%20wearing%20red%20scarf%20chubby%20chibi%20style%20pastel%20studio%20photo%20white%20background?width=600&height=600&nologo=true',
    category: '萌宠系列',
    tags: [],
    stock: 25
  },
  {
    id: 'bear-honey',
    name: '蜂蜜小熊',
    description: '抱着蜂蜜罐的贪吃小熊，嘴角沾着蜂蜜的样子太可爱了！底座是一片小花园。',
    price: 99,
    originalPrice: 139,
    image: 'https://image.pollinations.ai/prompt/super%20cute%20kawaii%20bear%20figurine%20hugging%20honey%20jar%20chibi%20style%20pastel%20yellow%20studio%20photo%20white%20background?width=600&height=600&nologo=true',
    category: '甜点伙伴',
    tags: ['限量'],
    stock: 10
  },
  {
    id: 'duck-raincoat',
    name: '雨衣小黄鸭',
    description: '穿着透明雨衣的小黄鸭，头顶一片小荷叶，脚边有迷你水洼和小青蛙伙伴。',
    price: 59,
    image: 'https://image.pollinations.ai/prompt/super%20cute%20kawaii%20yellow%20rubber%20duck%20figurine%20wearing%20transparent%20raincoat%20chibi%20style%20pastel%20studio%20photo%20white%20background?width=600&height=600&nologo=true',
    category: '萌宠系列',
    tags: ['新品'],
    stock: 40
  },
  {
    id: 'corgi-bread',
    name: '面包柯基',
    description: '化身为一条法式面包的柯基犬，圆滚滚的屁股是面包的形状，每一只表情都不一样哦。',
    price: 109,
    originalPrice: 149,
    image: 'https://image.pollinations.ai/prompt/super%20cute%20kawaii%20corgi%20dog%20figurine%20shaped%20like%20bread%20loaf%20chibi%20style%20pastel%20studio%20photo%20white%20background?width=600&height=600&nologo=true',
    category: '甜点伙伴',
    tags: ['热销', '限量'],
    stock: 8
  },
  {
    id: 'unicorn-donut',
    name: '甜甜圈独角兽',
    description: '坐在巨大甜甜圈上的迷你独角兽，彩虹色鬃毛配上星星眼，梦幻少女心爆棚！',
    price: 129,
    image: 'https://image.pollinations.ai/prompt/super%20cute%20kawaii%20unicorn%20figurine%20sitting%20on%20donut%20rainbow%20mane%20chibi%20style%20pastel%20studio%20photo%20white%20background?width=600&height=600&nologo=true',
    category: '梦幻世界',
    tags: ['新品'],
    stock: 18
  },
  {
    id: 'shiba-astronaut',
    name: '太空柴犬',
    description: '穿着宇航服探索宇宙的柴犬，头盔里的笑脸永远那么治愈。配有迷你星球底座。',
    price: 159,
    originalPrice: 199,
    image: 'https://image.pollinations.ai/prompt/super%20cute%20kawaii%20shiba%20inu%20dog%20figurine%20wearing%20astronaut%20suit%20chibi%20style%20pastel%20studio%20photo%20white%20background?width=600&height=600&nologo=true',
    category: '梦幻世界',
    tags: ['限量'],
    stock: 6
  }
];
