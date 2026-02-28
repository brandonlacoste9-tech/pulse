import { useEffect, useRef } from 'react'

const COLORS = ['#6366f1', '#8b5cf6', '#fbbf24', '#f472b6', '#34d399', '#60a5fa']

export default function Confetti() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const pieces: Array<{
      x: number
      y: number
      w: number
      h: number
      color: string
      vx: number
      vy: number
      rotation: number
      rotationSpeed: number
    }> = []

    // Create confetti pieces
    for (let i = 0; i < 100; i++) {
      pieces.push({
        x: Math.random() * canvas.width,
        y: -20 - Math.random() * 100,
        w: 8 + Math.random() * 8,
        h: 8 + Math.random() * 8,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        vx: (Math.random() - 0.5) * 4,
        vy: 3 + Math.random() * 5,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 10
      })
    }

    let animationId: number

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      pieces.forEach(p => {
        p.x += p.vx
        p.y += p.vy
        p.rotation += p.rotationSpeed
        p.vy += 0.1 // gravity

        ctx.save()
        ctx.translate(p.x, p.y)
        ctx.rotate((p.rotation * Math.PI) / 180)
        ctx.fillStyle = p.color
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h)
        ctx.restore()
      })

      animationId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      cancelAnimationFrame(animationId)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 9999
      }}
    />
  )
}
