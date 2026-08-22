"use client"

import { useEffect, useRef } from "react"
import * as THREE from "three"

/** deterministic pseudo-random so the ridges are stable across renders */
function seeded(seed: number) {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

function makeNebulaTexture(inner: string, outer: string) {
  const size = 256
  const canvas = document.createElement("canvas")
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext("2d")
  if (!ctx) return null
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  g.addColorStop(0, inner)
  g.addColorStop(0.45, outer)
  g.addColorStop(1, "rgba(0,0,0,0)")
  ctx.fillStyle = g
  ctx.fillRect(0, 0, size, size)
  const tex = new THREE.CanvasTexture(canvas)
  tex.needsUpdate = true
  return tex
}

/** builds a jagged ridge silhouette as a filled shape */
function makeRidge(seed: number, width: number, baseHeight: number, jag: number) {
  const rand = seeded(seed)
  const steps = 72
  const shape = new THREE.Shape()
  shape.moveTo(-width / 2, -40)

  const points: THREE.Vector2[] = []
  for (let i = 0; i <= steps; i++) {
    const t = i / steps
    const x = -width / 2 + t * width
    const y =
      baseHeight +
      Math.sin(t * 6.2 + seed) * jag * 0.55 +
      Math.sin(t * 17.3 + seed * 2) * jag * 0.28 +
      (rand() - 0.5) * jag * 0.5
    points.push(new THREE.Vector2(x, y))
  }
  points.forEach((p) => shape.lineTo(p.x, p.y))
  shape.lineTo(width / 2, -40)
  shape.closePath()
  return new THREE.ShapeGeometry(shape, 1)
}

export function HorizonCanvas() {
  const hostRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const host = hostRef.current
    if (!host) return

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(58, host.clientWidth / host.clientHeight, 0.1, 2000)
    camera.position.set(0, 6, 60)

    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" })
    } catch {
      return
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(host.clientWidth, host.clientHeight)
    renderer.setClearColor(0x000000, 0)
    renderer.domElement.style.display = "block"
    host.appendChild(renderer.domElement)

    const disposables: { dispose: () => void }[] = []

    /* ---------------- stars ---------------- */
    const starGroup = new THREE.Group()
    const starLayers: THREE.Points[] = []
    const starSpecs = [
      { count: 1400, spread: 700, size: 1.1, opacity: 0.9, color: 0xe6e9f5 },
      { count: 900, spread: 520, size: 1.7, opacity: 0.55, color: 0xa9b4ff },
      { count: 320, spread: 380, size: 2.6, opacity: 0.35, color: 0xc9a7ff },
    ]
    starSpecs.forEach((spec, layer) => {
      const rand = seeded(97 + layer * 31)
      const positions = new Float32Array(spec.count * 3)
      for (let i = 0; i < spec.count; i++) {
        positions[i * 3] = (rand() - 0.5) * spec.spread
        positions[i * 3 + 1] = rand() * spec.spread * 0.42 - 10
        positions[i * 3 + 2] = -rand() * spec.spread - 40
      }
      const geo = new THREE.BufferGeometry()
      geo.setAttribute("position", new THREE.BufferAttribute(positions, 3))
      const mat = new THREE.PointsMaterial({
        color: spec.color,
        size: spec.size,
        transparent: true,
        opacity: spec.opacity,
        depthWrite: false,
        sizeAttenuation: true,
      })
      const pts = new THREE.Points(geo, mat)
      starGroup.add(pts)
      starLayers.push(pts)
      disposables.push(geo, mat)
    })
    scene.add(starGroup)

    /* ---------------- nebula glows ---------------- */
    const nebulaGroup = new THREE.Group()
    const nebulaSpecs = [
      { tex: ["rgba(99,102,241,0.55)", "rgba(79,70,229,0.16)"], x: -70, y: 40, z: -260, scale: 320 },
      { tex: ["rgba(167,139,250,0.5)", "rgba(124,58,237,0.14)"], x: 90, y: 22, z: -300, scale: 380 },
      { tex: ["rgba(56,189,248,0.32)", "rgba(14,116,144,0.1)"], x: 10, y: -6, z: -200, scale: 240 },
    ]
    nebulaSpecs.forEach((spec) => {
      const tex = makeNebulaTexture(spec.tex[0], spec.tex[1])
      if (!tex) return
      const mat = new THREE.SpriteMaterial({
        map: tex,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        opacity: 0.85,
      })
      const sprite = new THREE.Sprite(mat)
      sprite.position.set(spec.x, spec.y, spec.z)
      sprite.scale.setScalar(spec.scale)
      nebulaGroup.add(sprite)
      disposables.push(tex, mat)
    })
    scene.add(nebulaGroup)

    /* ---------------- parallax mountain ridges ---------------- */
    const ridgeGroup = new THREE.Group()
    const ridgeSpecs = [
      { seed: 12, width: 900, base: 26, jag: 34, z: -220, color: 0x111a33, y: -14, opacity: 1 },
      { seed: 45, width: 760, base: 18, jag: 26, z: -160, color: 0x0d1428, y: -16, opacity: 1 },
      { seed: 78, width: 620, base: 12, jag: 18, z: -110, color: 0x090f1f, y: -18, opacity: 1 },
      { seed: 111, width: 520, base: 8, jag: 12, z: -70, color: 0x05080f, y: -20, opacity: 1 },
    ]
    const ridges: THREE.Mesh[] = []
    ridgeSpecs.forEach((spec) => {
      const geo = makeRidge(spec.seed, spec.width, spec.base, spec.jag)
      const mat = new THREE.MeshBasicMaterial({
        color: spec.color,
        transparent: true,
        opacity: spec.opacity,
      })
      const mesh = new THREE.Mesh(geo, mat)
      mesh.position.set(0, spec.y, spec.z)
      ridgeGroup.add(mesh)
      ridges.push(mesh)
      disposables.push(geo, mat)

      // thin luminous rim line along the ridge crest
      const edge = new THREE.EdgesGeometry(geo, 1)
      const edgeMat = new THREE.LineBasicMaterial({
        color: 0x6366f1,
        transparent: true,
        opacity: 0.22,
      })
      const line = new THREE.LineSegments(edge, edgeMat)
      line.position.copy(mesh.position)
      line.position.z += 0.2
      ridgeGroup.add(line)
      disposables.push(edge, edgeMat)
    })
    scene.add(ridgeGroup)

    /* ---------------- interaction state ---------------- */
    let scrollProgress = 0
    let pointerX = 0
    let pointerY = 0
    let targetPointerX = 0
    let targetPointerY = 0

    const onScroll = () => {
      const max = window.innerHeight * 1.4
      scrollProgress = Math.min(1, window.scrollY / max)
    }
    const onPointerMove = (e: PointerEvent) => {
      targetPointerX = (e.clientX / window.innerWidth - 0.5) * 2
      targetPointerY = (e.clientY / window.innerHeight - 0.5) * 2
    }
    const onResize = () => {
      if (!host.clientWidth || !host.clientHeight) return
      camera.aspect = host.clientWidth / host.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(host.clientWidth, host.clientHeight)
    }

    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("pointermove", onPointerMove, { passive: true })
    window.addEventListener("resize", onResize)

    let raf = 0
    const startedAt = performance.now()

    const render = () => {
      const t = (performance.now() - startedAt) / 1000

      pointerX += (targetPointerX - pointerX) * 0.045
      pointerY += (targetPointerY - pointerY) * 0.045

      if (!prefersReduced) {
        starGroup.rotation.y = t * 0.008
        starLayers.forEach((layer, i) => {
          layer.position.x = pointerX * (2 + i * 3)
          layer.position.y = -pointerY * (1 + i * 1.5) - scrollProgress * (6 + i * 4)
        })
        nebulaGroup.children.forEach((child, i) => {
          child.position.y = nebulaSpecs[i].y + Math.sin(t * 0.18 + i) * 4 - scrollProgress * (10 + i * 6)
          child.position.x = nebulaSpecs[i].x + pointerX * (6 + i * 4)
        })
        ridges.forEach((ridge, i) => {
          const depth = i + 1
          ridge.position.x = pointerX * depth * 4 + Math.sin(t * 0.05) * depth
          ridge.position.y = ridgeSpecs[i].y + scrollProgress * (10 + depth * 9)
          const line = ridgeGroup.children[i * 2 + 1]
          line.position.x = ridge.position.x
          line.position.y = ridge.position.y
        })
        camera.position.y = 6 + scrollProgress * 16
        camera.position.z = 60 - scrollProgress * 14
        camera.rotation.x = -scrollProgress * 0.06
      }

      renderer.render(scene, camera)
      raf = requestAnimationFrame(render)
    }
    raf = requestAnimationFrame(render)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("pointermove", onPointerMove)
      window.removeEventListener("resize", onResize)
      disposables.forEach((d) => d.dispose())
      renderer.dispose()
      if (renderer.domElement.parentNode === host) host.removeChild(renderer.domElement)
    }
  }, [])

  return (
    <div
      ref={hostRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0 select-none"
    />
  )
}
