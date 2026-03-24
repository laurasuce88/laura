export interface Figurine {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  emoji: string;
  bgColor: string;
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
    image: 'https://cdn.pixabay.com/photo/2023/06/02/14/50/ai-generated-8035004_640.jpg',
    emoji: '😺',
    bgColor: '#fff0f5',
    category: '萌宠系列',
    tags: ['热销'],
    stock: 30
  },
  {
    id: 'bunny-strawberry',
    name: '草莓兔兔',
    description: '头戴草莓帽的害羞小兔子，粉嫩的脸颊和圆溜溜的大眼睛让人忍不住想捏一捏！',
    price: 69,
    image: 'https://cdn.pixabay.com/photo/2023/09/01/17/25/ai-generated-8227030_640.jpg',
    emoji: '🐰',
    bgColor: '#fff0f0',
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
    image: 'https://cdn.pixabay.com/photo/2023/08/24/15/08/ai-generated-8210759_640.jpg',
    emoji: '🐧',
    bgColor: '#f0f4ff',
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
    image: 'https://cdn.pixabay.com/photo/2023/04/01/10/42/ai-generated-7892795_640.jpg',
    emoji: '🧸',
    bgColor: '#fff8f0',
    category: '甜点伙伴',
    tags: ['限量'],
    stock: 10
  },
  {
    id: 'duck-raincoat',
    name: '雨衣小黄鸭',
    description: '穿着透明雨衣的小黄鸭，头顶一片小荷叶，脚边有迷你水洼和小青蛙伙伴。',
    price: 59,
    image: 'https://cdn.pixabay.com/photo/2023/07/04/09/22/ai-generated-8105991_640.jpg',
    emoji: '🐥',
    bgColor: '#fffff0',
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
    image: 'https://cdn.pixabay.com/photo/2023/05/17/08/43/ai-generated-7999515_640.jpg',
    emoji: '🐶',
    bgColor: '#fff5ee',
    category: '甜点伙伴',
    tags: ['热销', '限量'],
    stock: 8
  },
  {
    id: 'unicorn-donut',
    name: '甜甜圈独角兽',
    description: '坐在巨大甜甜圈上的迷你独角兽，彩虹色鬃毛配上星星眼，梦幻少女心爆棚！',
    price: 129,
    image: 'https://cdn.pixabay.com/photo/2023/06/15/17/41/ai-generated-8065495_640.jpg',
    emoji: '🦄',
    bgColor: '#f8f0ff',
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
    image: 'https://cdn.pixabay.com/photo/2023/03/25/18/02/ai-generated-7876382_640.jpg',
    emoji: '🚀',
    bgColor: '#f0f0ff',
    category: '梦幻世界',
    tags: ['限量'],
    stock: 6
  }
];
