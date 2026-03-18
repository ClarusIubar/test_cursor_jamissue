import { useEffect } from 'react'
import './ToastPopup.css'

export type ToastPopupProps = {
  open: boolean
  title: string
  subtitle?: string
  jamColor: string
  onClose: () => void
  onOpenDetail: () => void
}

export default function ToastPopup(props: ToastPopupProps) {
  useEffect(() => {
    if (!props.open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') props.onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [props])

  if (!props.open) return null

  return (
    <div className="toastOverlay" role="presentation" onPointerDown={props.onClose}>
      <div
        className="toastCard"
        role="dialog"
        aria-modal="true"
        onPointerDown={(e) => e.stopPropagation()}
      >
        <div className="toastJam" style={{ background: props.jamColor }} />
        <div className="toastBody">
          <div className="toastTitle">{props.title}</div>
          {props.subtitle ? <div className="toastSubtitle">{props.subtitle}</div> : null}
          <button className="toastButton" onClick={props.onOpenDetail}>
            피드 보러가기
          </button>
        </div>
      </div>
    </div>
  )
}

