export interface Flower {
  id: string;
  name: string;
  scientificName: string;
  lat: number;
  lng: number;
  description: string;
  color: string;
  image?: string;
  emoji: string;
}

export const flowers: Flower[] = [
  {
    id: 'sakura',
    name: '樱花 (Sakura)',
    scientificName: 'Prunus serrulata',
    lat: 35.6528,
    lng: 139.8394,
    description: '樱花是春天的象征，代表着更新和生命的美丽与短暂。这些娇嫩的粉色花朵虽然花期短暂，却绽放得极为壮观，常在日本的“花见”季节引来无数人观赏。',
    color: '#ffb7c5',
    image: 'https://loremflickr.com/800/800/sakura,flower/all?lock=1',
    emoji: '🌸'
  },
  {
    id: 'tulip',
    name: '郁金香 (Tulip)',
    scientificName: 'Tulipa',
    lat: 52.1326,
    lng: 5.2913,
    description: '起源于中亚，但在荷兰发扬光大。郁金香以其大胆的色彩和完美的对称性而闻名，曾引发著名的“郁金香狂热”。',
    color: '#ff4d4d',
    image: 'https://loremflickr.com/800/800/tulip,flower/all?lock=1',
    emoji: '🌷'
  },
  {
    id: 'hibiscus',
    name: '黄槿花 (Yellow Hibiscus)',
    scientificName: 'Hibiscus brackenridgei',
    lat: 19.8968,
    lng: -155.5828,
    description: '夏威夷的州花，这种充满活力的黄色花朵代表着精致的美丽，常被草裙舞者佩戴，象征着热情与阳光。',
    color: '#ffd700',
    image: 'https://loremflickr.com/800/800/hibiscus,flower/all?lock=1',
    emoji: '🌺'
  },
  {
    id: 'lotus',
    name: '神圣莲花 (Sacred Lotus)',
    scientificName: 'Nelumbo nucifera',
    lat: 20.5937,
    lng: 78.9629,
    description: '在东方宗教中是纯洁和启蒙的象征，莲花出淤泥而不染，绽放出完美无瑕的花朵，代表着心灵的升华。',
    color: '#ff69b4',
    image: 'https://loremflickr.com/800/800/lotus,flower/all?lock=1',
    emoji: '🪷'
  },
  {
    id: 'protea',
    name: '帝王花 (King Protea)',
    scientificName: 'Protea cynaroides',
    lat: -30.5595,
    lng: 22.9375,
    description: '南非的国花，以其巨大的皇冠状花头和对恶劣环境的惊人适应力而闻名，象征着胜利、坚韧与多样性。',
    color: '#ff7f50',
    image: 'https://loremflickr.com/800/800/protea,flower/all?lock=1',
    emoji: '🏵️'
  },
  {
    id: 'lavender',
    name: '薰衣草 (Lavender)',
    scientificName: 'Lavandula',
    lat: 43.9366,
    lng: 5.0442,
    description: '以其舒缓的香气和法国普罗旺斯充满活力的紫色花海而闻名。几个世纪以来一直被用于香水、烹饪和疗愈。',
    color: '#9370db',
    image: 'https://loremflickr.com/800/800/lavender,flower/all?lock=1',
    emoji: '🪻'
  },
  {
    id: 'edelweiss',
    name: '雪绒花 (Edelweiss)',
    scientificName: 'Leontopodium nivale',
    lat: 46.8182,
    lng: 8.2275,
    description: '一种生长在阿尔卑斯山高处的坚韧、长满绒毛的白色花朵。它是登山运动、粗犷之美和深情的象征。',
    color: '#f8f8ff',
    image: 'https://loremflickr.com/800/800/edelweiss,flower/all?lock=1',
    emoji: '💮'
  },
  {
    id: 'rafflesia',
    name: '大王花 (Rafflesia Arnoldii)',
    scientificName: 'Rafflesia arnoldii',
    lat: -0.7893,
    lng: 113.9213,
    description: '地球上最大的单体花朵，发现于印度尼西亚的雨林中。它以其巨大的体积和强烈的气味而闻名，是一种奇特的寄生植物。',
    color: '#8b0000',
    image: 'https://loremflickr.com/800/800/rafflesia,flower/all?lock=1',
    emoji: '🥀'
  },
  {
    id: 'sunflower',
    name: '向日葵 (Sunflower)',
    scientificName: 'Helianthus annuus',
    lat: 48.3794,
    lng: 31.1656,
    description: '以其明亮的黄色花瓣和追随太阳穿过天空的习性而闻名。作为乌克兰的国花，它象征着阳光、希望和忠诚。',
    color: '#ffcc00',
    image: 'https://loremflickr.com/800/800/sunflower,flower/all?lock=1',
    emoji: '🌻'
  },
  {
    id: 'orchid',
    name: '卓锦万代兰 (Vanda Miss Joaquim)',
    scientificName: 'Papilionanthe Miss Joaquim',
    lat: 1.3521,
    lng: 103.8198,
    description: '一种美丽的杂交兰花，也是新加坡的国花，因其非凡的生命力和全年开花的特性而被选中，象征着国家的韧性。',
    color: '#da70d6',
    image: 'https://loremflickr.com/800/800/orchid,flower/all?lock=1',
    emoji: '🌸'
  }
];
