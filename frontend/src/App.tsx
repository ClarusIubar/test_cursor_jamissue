import { Navigate, Route, Routes } from 'react-router-dom'
import FeedDetailPage from './pages/FeedDetailPage'
import MapPage from './pages/MapPage'
import MyPage from './pages/MyPage'
import NaverCallbackPage from './pages/NaverCallbackPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<MapPage />} />
      <Route path="/feed/:placeId" element={<FeedDetailPage />} />
      <Route path="/me" element={<MyPage />} />
      <Route path="/auth/naver/callback" element={<NaverCallbackPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
