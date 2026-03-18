import { ReactNode } from 'react'

interface BottomSheetProps {
  open: boolean
  title: string
  onClose: () => void
  children: ReactNode
}

export function BottomSheet({ open, title, onClose, children }: BottomSheetProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 bg-black/40"
        aria-label="닫기"
      />

      <div className="relative w-full max-w-md bg-card rounded-t-3xl shadow-xl pb-8">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <p className="text-sm font-medium">{title}</p>
          <button
            type="button"
            onClick={onClose}
            className="text-muted-foreground text-lg"
            aria-label="바텀시트 닫기"
          >
            ×
          </button>
        </div>
        <div className="p-4 overflow-y-auto max-h-[70vh]">{children}</div>
      </div>
    </div>
  )
}
