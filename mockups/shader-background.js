// ShaderBackground: a creme field with a faint, slowly drifting orange glow
// and a film-grain overlay. One WebGL canvas, no dependencies. The canvas
// setup and render loop started from the 21st.dev Shader Builder component
// (adapted from Paper Shaders, Apache-2.0); the shader itself is new.
//
// Usage: <canvas data-shader-background class="absolute inset-0"></canvas>
// The canvas fills its parent. With prefers-reduced-motion it draws a single
// still frame.

const VERT = `attribute vec2 a_position;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}`

const FRAG = `precision highp float;

uniform vec2 u_resolution;
uniform float u_time;
uniform vec3 u_base;
uniform vec3 u_glow;
uniform vec3 u_warm;
uniform float u_strength;
uniform float u_grain;

float hash21(vec2 p) {
  p = fract(p * vec2(234.34, 435.345));
  p += dot(p, p + 34.23);
  return fract(p.x * p.y);
}

// Even white noise for the grain (Dave Hoskins hash12).
float grainHash(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash21(i), hash21(i + vec2(1.0, 0.0)), u.x),
    mix(hash21(i + vec2(0.0, 1.0)), hash21(i + vec2(1.0, 1.0)), u.x),
    u.y);
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 4; i++) {
    v += a * noise(p);
    p = p * 2.03 + vec2(17.0, 9.2);
    a *= 0.5;
  }
  return v;
}

// A soft round glow centred on c.
float blob(vec2 p, vec2 c, float r) {
  vec2 d = p - c;
  return exp(-dot(d, d) / (r * r));
}

void main() {
  vec2 p = (gl_FragCoord.xy - 0.5 * u_resolution) / min(u_resolution.x, u_resolution.y);
  float t = u_time;

  // Slow organic warp so the glows read as smoke, not circles.
  p += 0.35 * (vec2(fbm(p * 1.3 + t * 0.04), fbm(p * 1.3 + vec2(5.2, 1.3) - t * 0.03)) - 0.5);

  // Three glows on slow looping paths, kept mostly toward the edges.
  float g = 0.0;
  g += blob(p, vec2(-0.75 + 0.18 * sin(t * 0.21), -0.35 + 0.15 * cos(t * 0.17)), 0.55);
  g += blob(p, vec2( 0.80 + 0.15 * cos(t * 0.19),  0.30 + 0.20 * sin(t * 0.23)), 0.50) * 0.85;
  g += blob(p, vec2( 0.10 + 0.35 * sin(t * 0.13), -0.75 + 0.10 * cos(t * 0.29)), 0.45) * 0.6;
  g = clamp(g, 0.0, 1.0) * u_strength;

  // Creme -> peach -> orange, so the glow edges stay warm rather than muddy.
  vec3 col = mix(u_base, u_warm, smoothstep(0.0, 0.6, g));
  col = mix(col, u_glow, smoothstep(0.35, 1.0, g));

  col += (grainHash(gl_FragCoord.xy) - 0.5) * u_grain;
  gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}
`

const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255)

const SETTINGS = {
  base: "#FAF7EE",   // base-100
  warm: "#FBD9BF",   // peach midpoint
  glow: "#FF8A57",   // softened primary orange
  strength: 0.6,     // how far toward the glow colour the brightest spot gets
  grain: 0.07,
  timeScale: 1.8,
}

function mount(canvas) {
  const gl = canvas.getContext("webgl", { antialias: false })
  if (!gl) return

  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches
  const timeScale = reducedMotion ? 0 : SETTINGS.timeScale

  const compile = (type, src) => {
    const s = gl.createShader(type)
    gl.shaderSource(s, src)
    gl.compileShader(s)
    return s
  }
  const program = gl.createProgram()
  gl.attachShader(program, compile(gl.VERTEX_SHADER, VERT))
  gl.attachShader(program, compile(gl.FRAGMENT_SHADER, FRAG))
  gl.linkProgram(program)
  gl.useProgram(program)

  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer())
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
  const loc = gl.getAttribLocation(program, "a_position")
  gl.enableVertexAttribArray(loc)
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)

  const u = (name) => gl.getUniformLocation(program, name)
  const uResolution = u("u_resolution")
  const uTime = u("u_time")
  gl.uniform3fv(u("u_base"), hex(SETTINGS.base))
  gl.uniform3fv(u("u_warm"), hex(SETTINGS.warm))
  gl.uniform3fv(u("u_glow"), hex(SETTINGS.glow))
  gl.uniform1f(u("u_strength"), SETTINGS.strength)
  gl.uniform1f(u("u_grain"), SETTINGS.grain)

  let raf = 0
  let visible = document.visibilityState === "visible"
  let inView = true
  const start = performance.now()

  // Render at device pixels (capped) so the grain stays fine and crisp.
  const resizeCanvas = () => {
    const { width, height } = canvas.getBoundingClientRect()
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const rawW = Math.max(1, Math.round(width * dpr))
    const rawH = Math.max(1, Math.round(height * dpr))
    const k = Math.min(1, Math.sqrt(2_000_000 / (rawW * rawH)))
    const w = Math.max(1, Math.round(rawW * k))
    const h = Math.max(1, Math.round(rawH * k))
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w
      canvas.height = h
      gl.viewport(0, 0, w, h)
    }
  }

  const requestRender = () => {
    if (visible && inView && raf === 0) raf = requestAnimationFrame(render)
  }
  const stop = () => {
    if (raf !== 0) cancelAnimationFrame(raf)
    raf = 0
  }

  new ResizeObserver(requestRender).observe(canvas)
  new IntersectionObserver(([entry]) => {
    inView = entry?.isIntersecting ?? true
    inView ? requestRender() : stop()
  }).observe(canvas)
  document.addEventListener("visibilitychange", () => {
    visible = document.visibilityState === "visible"
    visible ? requestRender() : stop()
  })

  function render(now) {
    raf = 0
    if (!visible || !inView) return
    resizeCanvas()
    gl.uniform2f(uResolution, canvas.width, canvas.height)
    gl.uniform1f(uTime, ((now - start) / 1000) * timeScale)
    gl.drawArrays(gl.TRIANGLES, 0, 3)
    if (timeScale !== 0) requestRender()
  }
  requestRender()
}

document.querySelectorAll("canvas[data-shader-background]").forEach(mount)
