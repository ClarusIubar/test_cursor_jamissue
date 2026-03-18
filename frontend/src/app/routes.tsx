import { createBrowserRouter } from 'react-router'
import { MainLayout } from './components/layouts/MainLayout'
import { HomePage } from './pages/HomePage'
import { LoginPage } from './pages/LoginPage'
import { NaverCallbackPage } from './pages/NaverCallbackPage'
import { PlaceDetailPage } from './pages/PlaceDetailPage'
import { MyPage } from './pages/MyPage'

export const router = createBrowserRouter([
  {
    path: '/',
    Component: MainLayout,
    children: [
      { index: true, Component: HomePage },
      { path: 'auth/naver/callback', Component: NaverCallbackPage },
      { path: 'login', Component: LoginPage },
      { path: 'place/:id', Component: PlaceDetailPage },
      { path: 'my', Component: MyPage },
    ],
  },
])
