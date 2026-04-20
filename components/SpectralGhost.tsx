'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js'

const FLUORESCENT: Record<string, number> = {
  orange: 0xff4500, green: 0x00ff80, cyan: 0x00ffff, lime: 0x00ff00,
  magenta: 0xff00ff, yellow: 0xffff00, pink: 0xff1493, purple: 0x9400d3,
  blue: 0x0080ff, red: 0xff0040, teal: 0x00ffaa, violet: 0x8a2be2,
}

const ANALOG_VERT = /* glsl */`
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const ANALOG_FRAG = /* glsl */`
  uniform sampler2D tDiffuse;
  uniform float uTime;
  uniform vec2 uResolution;
  uniform float uAnalogGrain;
  uniform float uAnalogBleeding;
  uniform float uAnalogVSync;
  uniform float uAnalogScanlines;
  uniform float uAnalogVignette;
  uniform float uAnalogJitter;
  uniform float uAnalogIntensity;

  varying vec2 vUv;

  float random(vec2 st) { return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123); }
  float random(float x)  { return fract(sin(x) * 43758.5453123); }
  float gaussian(float z, float u, float o) {
    return (1.0 / (o * sqrt(2.0 * 3.1415))) * exp(-(((z-u)*(z-u)) / (2.0*(o*o))));
  }
  vec3 grain(vec2 uv, float time, float intensity) {
    float seed  = dot(uv, vec2(12.9898, 78.233));
    float noise = fract(sin(seed) * 43758.5453 + time * 2.0);
    noise = gaussian(noise, 0.0, 0.5 * 0.5);
    return vec3(noise) * intensity;
  }

  void main() {
    vec2 uv   = vUv;
    float t   = uTime * 1.8;
    vec2 jUV  = uv;

    if (uAnalogJitter > 0.01) {
      jUV.x += (random(vec2(floor(t * 60.0))) - 0.5) * 0.003 * uAnalogJitter * uAnalogIntensity;
      jUV.y += (random(vec2(floor(t * 30.0) + 1.0)) - 0.5) * 0.001 * uAnalogJitter * uAnalogIntensity;
    }
    if (uAnalogVSync > 0.01) {
      float roll   = sin(t * 2.0 + uv.y * 100.0) * 0.02 * uAnalogVSync * uAnalogIntensity;
      float chance = step(0.95, random(vec2(floor(t * 4.0))));
      jUV.y += roll * chance;
    }

    vec4 color = texture2D(tDiffuse, jUV);

    if (uAnalogBleeding > 0.01) {
      float amt    = 0.012 * uAnalogBleeding * uAnalogIntensity;
      float phase  = t * 1.5 + uv.y * 20.0;
      color = vec4(
        texture2D(tDiffuse, jUV + vec2( sin(phase)        * amt, 0.0)).r,
        texture2D(tDiffuse, jUV).g,
        texture2D(tDiffuse, jUV + vec2(-sin(phase * 1.1)  * amt * 0.8, 0.0)).b,
        color.a
      );
    }
    if (uAnalogGrain > 0.01) {
      vec3 g = grain(uv, t, 0.075 * uAnalogGrain * uAnalogIntensity);
      color.rgb += g * (1.0 - color.rgb);
    }
    if (uAnalogScanlines > 0.01) {
      float freq = 600.0 + uAnalogScanlines * 400.0;
      color.rgb *= 1.0 - sin(uv.y * freq) * 0.5 * 0.1 * uAnalogScanlines * uAnalogIntensity;
      color.rgb *= 1.0 - sin(uv.y * freq * 0.1) * 0.02 * uAnalogScanlines * uAnalogIntensity;
    }
    if (uAnalogVignette > 0.01) {
      vec2 v = (uv - 0.5) * 2.0;
      color.rgb *= 1.0 - dot(v, v) * 0.3 * uAnalogVignette * uAnalogIntensity;
    }

    gl_FragColor = color;
  }
`

const ATMO_VERT = /* glsl */`
  varying vec3 vWorldPos;
  void main() {
    vec4 wp = modelMatrix * vec4(position, 1.0);
    vWorldPos = wp.xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const ATMO_FRAG = /* glsl */`
  uniform vec3  ghostPosition;
  uniform float revealRadius;
  uniform float fadeStrength;
  uniform float baseOpacity;
  uniform float revealOpacity;
  uniform float time;
  varying vec3 vWorldPos;

  void main() {
    float dist          = distance(vWorldPos.xy, ghostPosition.xy);
    float dynRadius     = revealRadius + sin(time * 2.0) * 5.0;
    float reveal        = pow(smoothstep(dynRadius * 0.2, dynRadius, dist), fadeStrength);
    float opacity       = mix(revealOpacity, baseOpacity, reveal);
    gl_FragColor        = vec4(0.001, 0.001, 0.002, opacity);
  }
`

export const SpectralGhost = () => {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    let rafId = 0
    const W = () => container.clientWidth
    const H = () => container.clientHeight

    // ── Scene / Camera ──────────────────────────────────────────────
    const scene  = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(75, W() / H(), 0.1, 1000)
    camera.position.z = 20

    // ── Renderer ────────────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({
      antialias: true, powerPreference: 'high-performance',
      alpha: true, premultipliedAlpha: false,
      stencil: false, depth: true, preserveDrawingBuffer: false,
    })
    renderer.setSize(W(), H())
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 0.9
    renderer.setClearColor(0x000000, 0)
    container.appendChild(renderer.domElement)

    // ── Post-processing ─────────────────────────────────────────────
    const composer   = new EffectComposer(renderer)
    composer.addPass(new RenderPass(scene, camera))

    const bloomPass  = new UnrealBloomPass(new THREE.Vector2(W(), H()), 0.3, 1.25, 0.0)
    composer.addPass(bloomPass)

    const analogPass = new ShaderPass({
      uniforms: {
        tDiffuse:        { value: null },
        uTime:           { value: 0.0 },
        uResolution:     { value: new THREE.Vector2(W(), H()) },
        uAnalogGrain:    { value: 0.4 },
        uAnalogBleeding: { value: 1.0 },
        uAnalogVSync:    { value: 1.0 },
        uAnalogScanlines:{ value: 1.0 },
        uAnalogVignette: { value: 1.0 },
        uAnalogJitter:   { value: 0.4 },
        uAnalogIntensity:{ value: 0.6 },
      },
      vertexShader:   ANALOG_VERT,
      fragmentShader: ANALOG_FRAG,
    })
    composer.addPass(analogPass)
    composer.addPass(new OutputPass())

    // ── Atmosphere overlay ──────────────────────────────────────────
    const atmoMat = new THREE.ShaderMaterial({
      uniforms: {
        ghostPosition: { value: new THREE.Vector3() },
        revealRadius:  { value: 43 },
        fadeStrength:  { value: 2.2 },
        baseOpacity:   { value: 0.35 },
        revealOpacity: { value: 0.0 },
        time:          { value: 0 },
      },
      vertexShader: ATMO_VERT, fragmentShader: ATMO_FRAG,
      transparent: true, depthWrite: false,
    })
    const atmo = new THREE.Mesh(new THREE.PlaneGeometry(300, 300), atmoMat)
    atmo.position.z  = -50
    atmo.renderOrder = -100
    scene.add(atmo)

    // ── Lights ──────────────────────────────────────────────────────
    scene.add(new THREE.AmbientLight(0x0a0a2e, 0.08))
    const rim1 = new THREE.DirectionalLight(0x4a90e2, 1.8)
    rim1.position.set(-8, 6, -4)
    scene.add(rim1)
    const rim2 = new THREE.DirectionalLight(0x50e3c2, 1.26)
    rim2.position.set(8, -4, -6)
    scene.add(rim2)

    // ── Ghost body ──────────────────────────────────────────────────
    const ghostGroup = new THREE.Group()
    scene.add(ghostGroup)

    const ghostGeo  = new THREE.SphereGeometry(2, 40, 40)
    const posAttr   = ghostGeo.getAttribute('position') as THREE.BufferAttribute
    for (let i = 0; i < posAttr.count; i++) {
      if (posAttr.getY(i) < -0.2) {
        const x = posAttr.getX(i), z = posAttr.getZ(i)
        posAttr.setY(i, -2.0 + Math.sin(x * 5) * 0.35 + Math.cos(z * 4) * 0.25 + Math.sin((x + z) * 3) * 0.15)
      }
    }
    posAttr.needsUpdate = true
    ghostGeo.computeVertexNormals()

    const ghostMat = new THREE.MeshStandardMaterial({
      color: 0x0f2027, transparent: true, opacity: 0.88,
      emissive: new THREE.Color(FLUORESCENT['orange']), emissiveIntensity: 5.8,
      roughness: 0.02, metalness: 0.0, side: THREE.DoubleSide, alphaTest: 0.1,
    })
    const ghostBody = new THREE.Mesh(ghostGeo, ghostMat)
    ghostGroup.add(ghostBody)

    // ── Eyes ────────────────────────────────────────────────────────
    const eyeGroup = new THREE.Group()
    ghostGroup.add(eyeGroup)

    const socketGeo = new THREE.SphereGeometry(0.45, 16, 16)
    const socketMat = new THREE.MeshBasicMaterial({ color: 0x000000 })
    ;[-0.7, 0.7].forEach(x => {
      const s = new THREE.Mesh(socketGeo, socketMat)
      s.position.set(x, 0.6, 1.9)
      s.scale.set(1.1, 1.0, 0.6)
      eyeGroup.add(s)
    })

    const eyeGeo    = new THREE.SphereGeometry(0.3, 12, 12)
    const leftEyeMat  = new THREE.MeshBasicMaterial({ color: FLUORESCENT['green'], transparent: true, opacity: 0 })
    const rightEyeMat = new THREE.MeshBasicMaterial({ color: FLUORESCENT['green'], transparent: true, opacity: 0 })
    const leftEye  = new THREE.Mesh(eyeGeo, leftEyeMat);  leftEye.position.set(-0.7, 0.6, 2.0);  eyeGroup.add(leftEye)
    const rightEye = new THREE.Mesh(eyeGeo, rightEyeMat); rightEye.position.set(0.7,  0.6, 2.0); eyeGroup.add(rightEye)

    const glowGeo      = new THREE.SphereGeometry(0.525, 12, 12)
    const leftGlowMat  = new THREE.MeshBasicMaterial({ color: FLUORESCENT['green'], transparent: true, opacity: 0, side: THREE.BackSide })
    const rightGlowMat = new THREE.MeshBasicMaterial({ color: FLUORESCENT['green'], transparent: true, opacity: 0, side: THREE.BackSide })
    const leftGlow  = new THREE.Mesh(glowGeo, leftGlowMat);  leftGlow.position.set(-0.7, 0.6, 1.95);  eyeGroup.add(leftGlow)
    const rightGlow = new THREE.Mesh(glowGeo, rightGlowMat); rightGlow.position.set(0.7,  0.6, 1.95); eyeGroup.add(rightGlow)

    // ── Fireflies ───────────────────────────────────────────────────
    const ffGroup = new THREE.Group()
    scene.add(ffGroup)
    const fireflies: THREE.Mesh[] = []

    for (let i = 0; i < 20; i++) {
      const ffMat  = new THREE.MeshBasicMaterial({ color: 0xffff44, transparent: true, opacity: 0.9 })
      const ff     = new THREE.Mesh(new THREE.SphereGeometry(0.02, 2, 2), ffMat)
      ff.position.set((Math.random() - 0.5) * 40, (Math.random() - 0.5) * 30, (Math.random() - 0.5) * 20)
      const glowMat = new THREE.MeshBasicMaterial({ color: 0xffff88, transparent: true, opacity: 0.4, side: THREE.BackSide })
      ff.add(new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), glowMat))
      const light   = new THREE.PointLight(0xffff44, 0.8, 3, 2)
      ff.add(light)
      ff.userData   = {
        vel: new THREE.Vector3((Math.random()-0.5)*0.04, (Math.random()-0.5)*0.04, (Math.random()-0.5)*0.04),
        phase: Math.random() * Math.PI * 2,
        pulseSpeed: 2 + Math.random() * 3,
        ffMat, glowMat, light,
      }
      ffGroup.add(ff)
      fireflies.push(ff)
    }

    // ── Particles ───────────────────────────────────────────────────
    const pGroup = new THREE.Group()
    scene.add(pGroup)
    const particles: THREE.Mesh[] = []
    const pool: THREE.Mesh[]      = []
    const pGeos = [
      new THREE.SphereGeometry(0.05, 6, 6),
      new THREE.TetrahedronGeometry(0.04, 0),
      new THREE.OctahedronGeometry(0.045, 0),
    ]

    for (let i = 0; i < 100; i++) {
      const mat = new THREE.MeshBasicMaterial({ color: FLUORESCENT['orange'], transparent: true, opacity: 0, alphaTest: 0.1 })
      const p   = new THREE.Mesh(pGeos[i % 3], mat)
      p.visible = false
      pGroup.add(p)
      pool.push(p)
    }

    function spawnParticle() {
      if (pool.length === 0 && particles.length >= 250) return
      let p: THREE.Mesh
      if (pool.length > 0) {
        p = pool.pop()!
        p.visible = true
      } else {
        const mat = new THREE.MeshBasicMaterial({ color: FLUORESCENT['orange'], transparent: true, opacity: 0, alphaTest: 0.1 })
        p = new THREE.Mesh(pGeos[Math.floor(Math.random() * 3)], mat)
        pGroup.add(p)
      }
      const mat = p.material as THREE.MeshBasicMaterial
      mat.color.set(FLUORESCENT['orange'])
      p.position.copy(ghostGroup.position)
      p.position.z -= 0.8 + Math.random() * 0.6
      p.position.x += (Math.random() - 0.5) * 3.5
      p.position.y += (Math.random() - 0.5) * 3.5 - 0.8
      const s = 0.6 + Math.random() * 0.7
      p.scale.setScalar(s)
      p.rotation.set(Math.random()*Math.PI*2, Math.random()*Math.PI*2, Math.random()*Math.PI*2)
      p.userData = {
        life: 1.0,
        decay: Math.random() * 0.003 + 0.005,
        rot: { x: (Math.random()-0.5)*0.015, y: (Math.random()-0.5)*0.015, z: (Math.random()-0.5)*0.015 },
        vel: { x: (Math.random()-0.5)*0.012, y: (Math.random()-0.5)*0.012 - 0.002, z: (Math.random()-0.5)*0.012 - 0.006 },
        mat,
      }
      particles.push(p)
    }

    // ── Mouse ───────────────────────────────────────────────────────
    const mouse    = new THREE.Vector2()
    const prevMouse = new THREE.Vector2()
    const mouseSpeed = new THREE.Vector2()
    let lastMouseT   = 0
    let isMoving     = false
    let moveTimer: ReturnType<typeof setTimeout> | null = null

    const onMouse = (e: MouseEvent) => {
      const now = performance.now()
      if (now - lastMouseT < 16) return
      prevMouse.copy(mouse)
      const rect = container.getBoundingClientRect()
      mouse.x = ((e.clientX - rect.left) / rect.width)  * 2 - 1
      mouse.y = -((e.clientY - rect.top)  / rect.height) * 2 + 1
      mouseSpeed.subVectors(mouse, prevMouse)
      isMoving = true
      if (moveTimer) clearTimeout(moveTimer)
      moveTimer = setTimeout(() => { isMoving = false }, 80)
      lastMouseT = now
    }
    window.addEventListener('mousemove', onMouse, { passive: true })

    // ── Resize ──────────────────────────────────────────────────────
    let resizeTimeout: ReturnType<typeof setTimeout>
    const onResize = () => {
      clearTimeout(resizeTimeout)
      resizeTimeout = setTimeout(() => {
        const w = W(), h = H()
        camera.aspect = w / h
        camera.updateProjectionMatrix()
        renderer.setSize(w, h)
        composer.setSize(w, h)
        bloomPass.setSize(w, h)
        analogPass.uniforms.uResolution.value.set(w, h)
      }, 250)
    }
    window.addEventListener('resize', onResize)

    // ── Animation ───────────────────────────────────────────────────
    let time       = 0
    let movement   = 0
    let lastFrame  = 0
    let lastPart   = 0
    let frame      = 0

    composer.render()
    for (let i = 0; i < 10; i++) spawnParticle()

    const animate = (ts: number) => {
      rafId = requestAnimationFrame(animate)
      const delta = ts - lastFrame
      lastFrame   = ts
      if (delta > 100) return

      time  += (delta / 16.67) * 0.01
      frame++

      atmoMat.uniforms.time.value      = time
      analogPass.uniforms.uTime.value  = time

      const tx = mouse.x * 11
      const ty = mouse.y * 7
      const prev = ghostGroup.position.clone()
      ghostGroup.position.x += (tx - ghostGroup.position.x) * 0.075
      ghostGroup.position.y += (ty - ghostGroup.position.y) * 0.075

      atmoMat.uniforms.ghostPosition.value.copy(ghostGroup.position)
      movement = movement * 0.95 + prev.distanceTo(ghostGroup.position) * 0.05

      // Float
      ghostGroup.position.y +=
        Math.sin(time * 2.4)  * 0.03 +
        Math.cos(time * 1.05) * 0.018 +
        Math.sin(time * 3.45) * 0.008

      // Pulse + glow
      const pulse = Math.sin(time * 1.6) * 0.6
      ghostMat.emissiveIntensity = 5.8 + pulse + Math.sin(time * 0.6) * 0.12

      // Fireflies
      fireflies.forEach(ff => {
        const ud = ff.userData
        const p  = Math.sin(time * ud.pulseSpeed + ud.phase) * 0.4 + 0.6
        ud.ffMat.opacity    = 2.6 * 0.9 * p
        ud.glowMat.opacity  = 2.6 * 0.4 * p
        ud.light.intensity  = 2.6 * 0.8 * p
        ud.vel.x += (Math.random()-0.5)*0.001
        ud.vel.y += (Math.random()-0.5)*0.001
        ud.vel.z += (Math.random()-0.5)*0.001
        ud.vel.clampLength(0, 0.04)
        ff.position.add(ud.vel)
        if (Math.abs(ff.position.x) > 30) ud.vel.x *= -0.5
        if (Math.abs(ff.position.y) > 20) ud.vel.y *= -0.5
        if (Math.abs(ff.position.z) > 15) ud.vel.z *= -0.5
      })

      // Body tilt + breath
      const dir = new THREE.Vector2(tx - ghostGroup.position.x, ty - ghostGroup.position.y).normalize()
      ghostBody.rotation.z = ghostBody.rotation.z * 0.95 + (-dir.x * 0.035) * 0.05
      ghostBody.rotation.x = ghostBody.rotation.x * 0.95 + (dir.y  * 0.035) * 0.05
      ghostBody.rotation.y = Math.sin(time * 1.4) * 0.018
      const scl = (1 + Math.sin(time * 2.1) * 0.009 + pulse * 0.015) * (1 + Math.sin(time * 0.8) * 0.012)
      ghostBody.scale.setScalar(scl)

      // Eye glow on movement
      const eyeMoving  = movement > 0.07
      const eyeTarget  = eyeMoving ? 1.0 : 0.0
      const eyeSpeed   = eyeMoving ? 0.62 : 0.31
      const newGlow    = leftEyeMat.opacity + (eyeTarget - leftEyeMat.opacity) * eyeSpeed
      leftEyeMat.opacity   = newGlow
      rightEyeMat.opacity  = newGlow
      leftGlowMat.opacity  = newGlow * 0.3
      rightGlowMat.opacity = newGlow * 0.3

      // Particles
      const spd = Math.sqrt(mouseSpeed.x**2 + mouseSpeed.y**2) * 8
      if (movement > 0.005 && isMoving && ts - lastPart > 100) {
        const rate = Math.min(5, Math.max(1, Math.floor(spd * 3)))
        for (let i = 0; i < rate; i++) spawnParticle()
        lastPart = ts
      }

      const cap = Math.min(particles.length, 60)
      for (let i = 0; i < cap; i++) {
        const idx = (frame + i) % particles.length
        if (idx >= particles.length) continue
        const p  = particles[idx]
        const ud = p.userData
        ud.life -= ud.decay
        ud.mat.opacity = ud.life * 0.85
        p.position.x += ud.vel.x + Math.cos(time * 1.8 + p.position.y) * 0.0008
        p.position.y += ud.vel.y
        p.position.z += ud.vel.z
        p.rotation.x += ud.rot.x
        p.rotation.y += ud.rot.y
        p.rotation.z += ud.rot.z
        if (ud.life <= 0) {
          p.visible = false; ud.mat.opacity = 0
          pool.push(p); particles.splice(idx, 1); i--
        }
      }

      composer.render()
    }

    rafId = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('mousemove', onMouse)
      window.removeEventListener('resize', onResize)
      if (moveTimer) clearTimeout(moveTimer)
      composer.dispose()
      renderer.dispose()
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement)
    }
  }, [])

  return (
    <div className="ghost-box">
      <div ref={containerRef} className="ghost-canvas-container" />
      <div className="ghost-text">
        <h2 className="ghost-quote">
          Veil of Dust<br />
          Trail of Ash<br />
          Heart of Ice
        </h2>
        <p className="ghost-byline">Whispers through memory</p>
      </div>
    </div>
  )
}
