import { Outlet, useLocation, useNavigate } from 'react-router'
import { Home, User } from 'lucide-react'

export function MainLayout() {
  const location = useLocation()
  const navigate = useNavigate()

  const navItems = [
    { path: '/', icon: Home, label: '홈' },
    { path: '/my', icon: User, label: '마이' },
  ]

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/'
    }
    return location.pathname.startsWith(path)
  }

  // 로그인 페이지나 상세 페이지에서는 내비게이션 숨기기
  const hideNav =
    location.pathname === '/login' ||
    location.pathname.startsWith('/place/') ||
    location.pathname.startsWith('/auth/')

  return (
    <div className="min-h-screen w-full flex flex-col bg-background overflow-hidden">
      <main className="flex-1 overflow-hidden">
        <Outlet />
      </main>

      {!hideNav && (
        <nav className="bg-card border-t border-border shadow-lg">
          <div className="max-w-screen-sm mx-auto flex justify-around items-center h-16 px-4">
            {navItems.map(item => {
              const Icon = item.icon
              const active = isActive(item.path)

              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`flex flex-col items-center justify-center gap-1 px-6 py-2 rounded-xl transition-all ${
                    active
                      ? 'text-primary bg-accent'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${active ? 'scale-110' : ''}`} />
                  <span className="text-[10px]">{item.label}</span>
                </button>
              )
            })}
          </div>
        </nav>
      )}
    </div>
  )
}
