import { useState } from 'react'

interface ImageWithFallbackProps {
  src: string
  alt: string
  className?: string
}

export function ImageWithFallback({ src, alt, className }: ImageWithFallbackProps) {
  const [failed, setFailed] = useState(false)

  return (
    <img
      src={failed ? 'https://via.placeholder.com/400x300?text=No+Image' : src}
      alt={alt}
      className={className}
      onError={() => setFailed(true)}
    />
  )
}
