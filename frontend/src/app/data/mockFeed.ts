export interface FeedItem {
  id: string
  placeId: string
  userName: string
  userAvatar: string
  title: string
  content: string
  createdAt: string
}

export const mockFeed: FeedItem[] = [
  {
    id: '1',
    placeId: '1',
    userName: '수박이',
    userAvatar: '🍉',
    title: '빵 진짜 대박이에요!',
    content: '성심당 튀김소보로는 언제 먹어도 맛있네요. 테이블이 꽉 차지만 꼭 가볼 가치가 있어요.',
    createdAt: '2시간 전',
  },
  {
    id: '2',
    placeId: '3',
    userName: '커피홀릭',
    userAvatar: '☕',
    title: '카페 온리 감성 최고',
    content: '분위기 너무 좋고 디저트가 맛있어요. 창가 자리 추천합니다!',
    createdAt: '5시간 전',
  },
  {
    id: '3',
    placeId: '4',
    userName: '과학덕후',
    userAvatar: '🔬',
    title: '엑스포 과학공원 재밌네요',
    content: '아이들과 함께 가기 좋고, 사진 찍을 곳 많아요.',
    createdAt: '1일 전',
  },
]
