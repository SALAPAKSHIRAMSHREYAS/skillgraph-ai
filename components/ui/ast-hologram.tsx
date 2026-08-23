"use client"

import React, { useEffect, useRef } from "react"

interface Node3D {
  x: number
  y: number
  z: number
  origX: number
  origY: number
  origZ: number
  radius: number
  color: string
}

export function AstHologram({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let animId: number
    let width = (canvas.width = canvas.parentElement?.clientWidth || 400)
    let height = (canvas.height = canvas.parentElement?.clientHeight || 400)

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return
      width = canvas.width = canvas.parentElement.clientWidth
      height = canvas.height = canvas.parentElement.clientHeight
    }
    window.addEventListener("resize", handleResize)

    // Generate 3D Spherical/Lattice AST Cluster
    const numNodes = 42
    const nodes: Node3D[] = []
    const sphereRadius = Math.min(width, height) * 0.38

    for (let i = 0; i < numNodes; i++) {
      const phi = Math.acos(-1 + (2 * i) / numNodes)
      const theta = Math.sqrt(numNodes * Math.PI) * phi
      const x = sphereRadius * Math.cos(theta) * Math.sin(phi)
      const y = sphereRadius * Math.sin(theta) * Math.sin(phi)
      const z = sphereRadius * Math.cos(phi)

      const colors = ["#10b981", "#6366f1", "#a855f7", "#ffffff"]
      nodes.push({
        x,
        y,
        z,
        origX: x,
        origY: y,
        origZ: z,
        radius: Math.random() * 2.5 + 2,
        color: colors[i % colors.length],
      })
    }

    let angleX = 0.003
    let angleY = 0.005
    let mouseX = 0
    let mouseY = 0

    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      mouseX = ((e.clientX - rect.left) / width - 0.5) * 0.0005
      mouseY = ((e.clientY - rect.top) / height - 0.5) * 0.0005
    }
    window.addEventListener("mousemove", onMouseMove)

    const fov = 350

    const render = () => {
      ctx.clearRect(0, 0, width, height)

      const cx = width / 2
      const cy = height / 2

      const cosX = Math.cos(angleX + mouseY)
      const sinX = Math.sin(angleX + mouseY)
      const cosY = Math.cos(angleY + mouseX)
      const sinY = Math.sin(angleY + mouseX)

      // Rotate and project nodes
      const projected = nodes.map((node) => {
        // Rotate Y
        let x1 = node.origX * cosY - node.origZ * sinY
        let z1 = node.origZ * cosY + node.origX * sinY

        // Rotate X
        let y2 = node.origY * cosX - z1 * sinX
        let z2 = z1 * cosX + node.origY * sinX

        node.origX = x1
        node.origY = y2
        node.origZ = z2

        const scale = fov / (fov + z2)
        const projX = x1 * scale + cx
        const projY = y2 * scale + cy

        return { projX, projY, scale, z: z2, color: node.color, radius: node.radius }
      })

      // Sort by depth (Z-buffer simulation)
      projected.sort((a, b) => b.z - a.z)

      // Draw connection vectors
      ctx.lineWidth = 0.75
      for (let i = 0; i < projected.length; i++) {
        for (let j = i + 1; j < projected.length; j++) {
          const dx = projected[i].projX - projected[j].projX
          const dy = projected[i].projY - projected[j].projY
          const dist = Math.sqrt(dx * dx + dy * dy)

          if (dist < 85) {
            const alpha = (1 - dist / 85) * 0.35 * Math.min(projected[i].scale, 1)
            ctx.strokeStyle = `rgba(99, 102, 241, ${alpha})`
            ctx.beginPath()
            ctx.moveTo(projected[i].projX, projected[i].projY)
            ctx.lineTo(projected[j].projX, projected[j].projY)
            ctx.stroke()
          }
        }
      }

      // Draw Glowing Nodes
      projected.forEach((p) => {
        if (p.scale > 0) {
          ctx.beginPath()
          ctx.arc(p.projX, p.projY, p.radius * p.scale, 0, Math.PI * 2)
          ctx.fillStyle = p.color
          ctx.globalAlpha = Math.max(0.2, (p.z + sphereRadius) / (sphereRadius * 2))
          ctx.fill()
          ctx.globalAlpha = 1.0
        }
      })

      animId = requestAnimationFrame(render)
    }

    render()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener("resize", handleResize)
      window.removeEventListener("mousemove", onMouseMove)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className={`pointer-events-none absolute inset-0 size-full ${className}`}
    />
  )
}