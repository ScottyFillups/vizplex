import vert from './vert.glsl'
import rawFrag from './frag.glsl'
import eqParser from './eq-parser'

import glClear from 'gl-clear'
import glContext from 'gl-context'
import glShader from 'gl-shader'
import glReset from 'gl-reset'
import now from 'right-now'
import draw from 'a-big-triangle'
import CCapture from 'ccapture.js'

const clear = glClear({ color: [0, 1, 0, 1] })
const fragLookup = {
  "%R_FN%": 0,
  "%G_FN%": 1,
  "%B_FN%": 2,
  "%A_FN%": 3
}
let gl
let shader
let tFactor
let canvas
let capturer
let reset
let time = now() / 1000

function animate () {
  time = now() / 1000
}
function render () {
  const width = gl.drawingBufferWidth
  const height = gl.drawingBufferHeight

  animate()
  clear(gl)
  gl.viewport(0, 0, width, height)

  shader.bind()
  shader.uniforms.t = tFactor * time
  shader.attributes.position.pointer()
  draw(gl)
  
  if (capturer) {
    capturer.capture(canvas)
  }
}

export default function vizplex (target, rgba, options) {
  options = options || {}
  capturer = options.ccapConfig ? new CCapture(options.ccapConfig) : null
  tFactor = options.timeFactor || 1
  canvas = typeof target === "string"
    ? document.querySelector(target)
    : target
  let frag

  if (capturer) {
    capturer.start()
  }
  if (gl) {
    reset()
  }

  gl = glContext(canvas, render)
  reset = glReset(gl)
  rgba = rgba.map(fnStr => eqParser(fnStr))
  frag = rawFrag.replace(/(%R_FN%|%G_FN%|%B_FN%|%A_FN%)/g, substr => rgba[fragLookup[substr]])
                .replace(/%NOISE%/g, 'snoise_1_3')
  shader = glShader(gl, vert, frag)
}
