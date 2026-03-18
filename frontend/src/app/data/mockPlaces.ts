export interface Place {
  id: string;
  name: string;
  category: 'restaurant' | 'cafe' | 'attraction' | 'culture';
  latitude: number;
  longitude: number;
  description: string;
  tags: string[];
  imageUrl: string;
}

export const DAEJEON_CENTER = {
  latitude: 36.3504,
  longitude: 127.3845,
};

export const mockPlaces: Place[] = [
  {
    id: '1',
    name: '성심당 본점',
    category: 'restaurant',
    latitude: 36.3285,
    longitude: 127.4264,
    description: '대전의 랜드마크 빵집! 튀김소보로와 부추빵이 유명해요',
    tags: ['빵집', '대전명소', '소보로'],
    imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800',
  },
  {
    id: '2',
    name: '대청호 오백리길',
    category: 'attraction',
    latitude: 36.4392,
    longitude: 127.4739,
    description: '아름다운 호수 뷰와 산책로가 있는 힐링 명소',
    tags: ['자연', '산책', '포토존'],
    imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
  },
  {
    id: '3',
    name: '카페 온리',
    category: 'cafe',
    latitude: 36.3513,
    longitude: 127.3782,
    description: '감성 가득한 인테리어와 맛있는 디저트 카페',
    tags: ['카페', '디저트', '감성'],
    imageUrl: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800',
  },
  {
    id: '4',
    name: '대전 엑스포 과학공원',
    category: 'culture',
    latitude: 36.3736,
    longitude: 127.3845,
    description: '과학과 문화가 어우러진 체험형 공원',
    tags: ['과학', '체험', '가족'],
    imageUrl: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800',
  },
  {
    id: '5',
    name: '은행동 카페거리',
    category: 'cafe',
    latitude: 36.3557,
    longitude: 127.4176,
    description: '트렌디한 카페들이 모여있는 핫플레이스',
    tags: ['카페거리', '핫플', '데이트'],
    imageUrl: 'https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=800',
  },
  {
    id: '6',
    name: '계룡산 갑사',
    category: 'attraction',
    latitude: 36.3636,
    longitude: 127.2264,
    description: '고즈넉한 사찰과 아름다운 단풍길',
    tags: ['사찰', '단풍', '등산'],
    imageUrl: 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=800',
  },
  {
    id: '7',
    name: '뿌까 쌀국수',
    category: 'restaurant',
    latitude: 36.3474,
    longitude: 127.3891,
    description: '진한 육수가 일품인 쌀국수 맛집',
    tags: ['쌀국수', '맛집', '베트남'],
    imageUrl: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=800',
  },
  {
    id: '8',
    name: '한밭수목원',
    category: 'attraction',
    latitude: 36.3679,
    longitude: 127.3895,
    description: '도심 속 힐링 공간, 계절마다 다른 풍경',
    tags: ['수목원', '산책', '힐링'],
    imageUrl: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=800',
  },
]

export const categoryInfo = {
  restaurant: {
    name: '맛집',
    color: '#FFB3C6',
    icon: '🍞',
    jamColor: '#FF6B9D',
  },
  cafe: {
    name: '카페',
    color: '#A8D5E2',
    icon: '☕',
    jamColor: '#7CB9D1',
  },
  attraction: {
    name: '명소',
    color: '#FFD4E0',
    icon: '🌸',
    jamColor: '#FFB3C6',
  },
  culture: {
    name: '문화',
    color: '#C9E4EA',
    icon: '🎨',
    jamColor: '#A8D5E2',
  },
}
