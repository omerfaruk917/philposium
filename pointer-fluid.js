/*
 * Fluid background extracted from https://917.world/js/biult.js.
 * Simulation derived from Pavel Dobryakov's WebGL Fluid Simulation (MIT).
 * See assets/vendor/webgl-fluid.LICENSE.txt.
 */
(() => {
  'use strict';

  const canvas = document.querySelector('.pointer-fluid');
  if (!canvas) return;

  const shaders = {
    vertex: `
      precision highp float;

      attribute vec2 aPosition;
      varying vec2 vUv;
      varying vec2 vL;
      varying vec2 vR;
      varying vec2 vT;
      varying vec2 vB;
      uniform vec2 texelSize;

      void main () {
          vUv = aPosition * 0.5 + 0.5;
          vL = vUv - vec2(texelSize.x, 0.0);
          vR = vUv + vec2(texelSize.x, 0.0);
          vT = vUv + vec2(0.0, texelSize.y);
          vB = vUv - vec2(0.0, texelSize.y);
          gl_Position = vec4(aPosition, 0.0, 1.0);
      }
    `,
    fade: `
      precision mediump float;
      precision mediump sampler2D;

      varying highp vec2 vUv;
      uniform sampler2D uTexture;
      uniform float value;

      void main () {
          gl_FragColor = value * texture2D(uTexture, vUv);
      }
    `,
    shadedDisplay: `
      precision highp float;
      precision highp sampler2D;

      varying vec2 vUv;
      varying vec2 vL;
      varying vec2 vR;
      varying vec2 vT;
      varying vec2 vB;
      uniform sampler2D uTexture;
      uniform sampler2D uBloom;
      uniform vec2 texelSize;

      void main () {
          vec3 L = texture2D(uTexture, vL).rgb;
          vec3 R = texture2D(uTexture, vR).rgb;
          vec3 T = texture2D(uTexture, vT).rgb;
          vec3 B = texture2D(uTexture, vB).rgb;
          vec3 C = texture2D(uTexture, vUv).rgb;

          float dx = length(R) - length(L);
          float dy = length(T) - length(B);

          vec3 n = normalize(vec3(dx, dy, length(texelSize)));
          vec3 l = vec3(0.0, 0.0, 1.0);

          float diffuse = clamp(dot(n, l) + 0.7, 0.7, 1.0);
          C.rgb *= diffuse;

          vec3 bloom = texture2D(uBloom, vUv).rgb;
          float strength = max(C.r, max(C.g, C.b));
          float halo = max(bloom.r, max(bloom.g, bloom.b));
          vec3 hue = C / max(strength, 0.001);
          vec3 pigment = mix(vec3(0.46, 0.25, 0.35), hue, 0.66);
          pigment = mix(pigment, vec3(1.0, 0.86, 0.62), min(halo * 0.55, 0.45));
          float alpha = (1.0 - exp(-2.2 * strength)) * 0.62 + min(halo * 0.28, 0.16);
          gl_FragColor = vec4(pigment * alpha, alpha);
      }
    `,
    bloomThreshold: `
      precision mediump float;
      precision mediump sampler2D;

      varying vec2 vUv;
      uniform sampler2D uTexture;
      uniform vec3 curve;
      uniform float threshold;

      void main () {
          vec3 c = texture2D(uTexture, vUv).rgb;
          float br = max(c.r, max(c.g, c.b));
          float rq = clamp(br - curve.x, 0.0, curve.y);
          rq = curve.z * rq * rq;
          c *= max(rq, br - threshold) / max(br, 0.0001);
          gl_FragColor = vec4(c, 0.0);
      }
    `,
    blur: `
      precision mediump float;
      precision mediump sampler2D;

      varying vec2 vL;
      varying vec2 vR;
      varying vec2 vT;
      varying vec2 vB;
      uniform sampler2D uTexture;

      void main () {
          vec4 sum = vec4(0.0);
          sum += texture2D(uTexture, vL);
          sum += texture2D(uTexture, vR);
          sum += texture2D(uTexture, vT);
          sum += texture2D(uTexture, vB);
          sum *= 0.25;
          gl_FragColor = sum;
      }
    `,
    bloomFinish: `
      precision mediump float;
      precision mediump sampler2D;

      varying vec2 vL;
      varying vec2 vR;
      varying vec2 vT;
      varying vec2 vB;
      uniform sampler2D uTexture;
      uniform float intensity;

      void main () {
          vec4 sum = vec4(0.0);
          sum += texture2D(uTexture, vL);
          sum += texture2D(uTexture, vR);
          sum += texture2D(uTexture, vT);
          sum += texture2D(uTexture, vB);
          sum *= 0.25;
          gl_FragColor = sum * intensity;
      }
    `,
    splat: `
      precision highp float;
      precision highp sampler2D;

      varying vec2 vUv;
      uniform sampler2D uTarget;
      uniform float aspectRatio;
      uniform vec3 color;
      uniform vec2 point;
      uniform float radius;

      void main () {
          vec2 p = vUv - point.xy;
          p.x *= aspectRatio;
          vec3 splat = exp(-dot(p, p) / radius) * color;
          vec3 base = texture2D(uTarget, vUv).xyz;
          gl_FragColor = vec4(base + splat, 1.0);
      }
    `,
    advect: `
      precision highp float;
      precision highp sampler2D;

      varying vec2 vUv;
      uniform sampler2D uVelocity;
      uniform sampler2D uSource;
      uniform vec2 texelSize;
      uniform float dt;
      uniform float dissipation;

      void main () {
          vec2 coord = vUv - dt * texture2D(uVelocity, vUv).xy * texelSize;
          gl_FragColor = dissipation * texture2D(uSource, coord);
          gl_FragColor.a = 1.0;
      }
    `,
    advectNearest: `
      precision highp float;
      precision highp sampler2D;

      varying vec2 vUv;
      uniform sampler2D uVelocity;
      uniform sampler2D uSource;
      uniform vec2 texelSize;
      uniform vec2 dyeTexelSize;
      uniform float dt;
      uniform float dissipation;

      vec4 bilerp (sampler2D sam, vec2 uv, vec2 tsize) {
          vec2 st = uv / tsize - 0.5;

          vec2 iuv = floor(st);
          vec2 fuv = fract(st);

          vec4 a = texture2D(sam, (iuv + vec2(0.5, 0.5)) * tsize);
          vec4 b = texture2D(sam, (iuv + vec2(1.5, 0.5)) * tsize);
          vec4 c = texture2D(sam, (iuv + vec2(0.5, 1.5)) * tsize);
          vec4 d = texture2D(sam, (iuv + vec2(1.5, 1.5)) * tsize);

          return mix(mix(a, b, fuv.x), mix(c, d, fuv.x), fuv.y);
      }

      void main () {
          vec2 coord = vUv - dt * bilerp(uVelocity, vUv, texelSize).xy * texelSize;
          gl_FragColor = dissipation * bilerp(uSource, coord, dyeTexelSize);
          gl_FragColor.a = 1.0;
      }
    `,
    divergence: `
      precision mediump float;
      precision mediump sampler2D;

      varying highp vec2 vUv;
      varying highp vec2 vL;
      varying highp vec2 vR;
      varying highp vec2 vT;
      varying highp vec2 vB;
      uniform sampler2D uVelocity;

      void main () {
          float L = texture2D(uVelocity, vL).x;
          float R = texture2D(uVelocity, vR).x;
          float T = texture2D(uVelocity, vT).y;
          float B = texture2D(uVelocity, vB).y;

          vec2 C = texture2D(uVelocity, vUv).xy;
          if (vL.x < 0.0) { L = -C.x; }
          if (vR.x > 1.0) { R = -C.x; }
          if (vT.y > 1.0) { T = -C.y; }
          if (vB.y < 0.0) { B = -C.y; }

          float div = 0.5 * (R - L + T - B);
          gl_FragColor = vec4(div, 0.0, 0.0, 1.0);
      }
    `,
    pressure: `
      precision mediump float;
      precision mediump sampler2D;

      varying highp vec2 vUv;
      varying highp vec2 vL;
      varying highp vec2 vR;
      varying highp vec2 vT;
      varying highp vec2 vB;
      uniform sampler2D uPressure;
      uniform sampler2D uDivergence;

      vec2 boundary (vec2 uv) {
          return uv;
          // uncomment if you use wrap or repeat texture mode
          // uv = min(max(uv, 0.0), 1.0);
          // return uv;
      }

      void main () {
          float L = texture2D(uPressure, boundary(vL)).x;
          float R = texture2D(uPressure, boundary(vR)).x;
          float T = texture2D(uPressure, boundary(vT)).x;
          float B = texture2D(uPressure, boundary(vB)).x;
          float C = texture2D(uPressure, vUv).x;
          float divergence = texture2D(uDivergence, vUv).x;
          float pressure = (L + R + B + T - divergence) * 0.25;
          gl_FragColor = vec4(pressure, 0.0, 0.0, 1.0);
      }
    `,
    subtractGradient: `
      precision mediump float;
      precision mediump sampler2D;

      varying highp vec2 vUv;
      varying highp vec2 vL;
      varying highp vec2 vR;
      varying highp vec2 vT;
      varying highp vec2 vB;
      uniform sampler2D uPressure;
      uniform sampler2D uVelocity;

      vec2 boundary (vec2 uv) {
          return uv;
          // uv = min(max(uv, 0.0), 1.0);
          // return uv;
      }

      void main () {
          float L = texture2D(uPressure, boundary(vL)).x;
          float R = texture2D(uPressure, boundary(vR)).x;
          float T = texture2D(uPressure, boundary(vT)).x;
          float B = texture2D(uPressure, boundary(vB)).x;
          vec2 velocity = texture2D(uVelocity, vUv).xy;
          velocity.xy -= vec2(R - L, T - B);
          gl_FragColor = vec4(velocity, 0.0, 1.0);
      }
    `,
  };

  function createFluid(gl, halfFloat, internalFormat, linearFiltering) {
    function compile(type, source) {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader));
      return shader;
    }

    const vertex = compile(gl.VERTEX_SHADER, shaders.vertex);
    const programs = {};
    for (const [name, source] of Object.entries(shaders)) {
      if (name === 'vertex' || name === (linearFiltering ? 'advectNearest' : 'advect')) continue;
      const fragment = compile(gl.FRAGMENT_SHADER, source);
      const program = gl.createProgram();
      gl.attachShader(program, vertex);
      gl.attachShader(program, fragment);
      gl.bindAttribLocation(program, 0, 'aPosition');
      gl.linkProgram(program);
      gl.deleteShader(fragment);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program));
      const locations = {};
      const count = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
      for (let index = 0; index < count; index++) {
        const { name: uniform } = gl.getActiveUniform(program, index);
        locations[uniform] = gl.getUniformLocation(program, uniform);
      }
      programs[name] = { program, locations };
    }
    gl.deleteShader(vertex);

    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(0);
    gl.clearColor(0, 0, 0, 0);

    const targets = [];
    let velocity, dye, divergence, pressure, bloom, aspect, sizeKey;

    function target(width, height, smooth = false) {
      const texture = gl.createTexture();
      const framebuffer = gl.createFramebuffer();
      gl.bindTexture(gl.TEXTURE_2D, texture);
      const filter = smooth && linearFiltering ? gl.LINEAR : gl.NEAREST;
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, width, height, 0, gl.RGBA, halfFloat, null);
      gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
      const result = { texture, framebuffer, width, height, texel: [1 / width, 1 / height] };
      targets.push(result);
      if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) {
        throw new Error('Float framebuffer unavailable');
      }
      gl.clear(gl.COLOR_BUFFER_BIT);
      return result;
    }

    function pair(dimensions, smooth) {
      return {
        read: target(...dimensions, smooth),
        write: target(...dimensions, smooth),
        swap() { [this.read, this.write] = [this.write, this.read]; },
      };
    }

    function resize() {
      const width = Math.max(1, canvas.clientWidth);
      const height = Math.max(1, canvas.clientHeight);
      const scale = Math.min(1, 1600 / Math.max(width, height));
      const size = [Math.round(width * scale), Math.round(height * scale)];
      const key = size.join('x');
      if (key === sizeKey) return;
      sizeKey = key;
      [canvas.width, canvas.height] = size;
      aspect = width / height;
      const dimensions = resolution => [
        Math.round(resolution * Math.min(3, Math.max(1, aspect))),
        Math.round(resolution * Math.min(3, Math.max(1, 1 / aspect))),
      ];
      for (const buffer of targets.splice(0)) {
        gl.deleteTexture(buffer.texture);
        gl.deleteFramebuffer(buffer.framebuffer);
      }
      velocity = pair(dimensions(80), true);
      dye = pair(dimensions(256), true);
      divergence = target(...dimensions(80));
      pressure = pair(dimensions(80), false);
      bloom = [64, 32, 16, 8, 4].map(resolution => target(...dimensions(resolution), true));
    }

    function pass(name, output, values, inputs) {
      const { program, locations } = programs[name];
      gl.useProgram(program);
      let slot = 0;
      for (const [uniform, input] of Object.entries(inputs)) {
        gl.activeTexture(gl.TEXTURE0 + slot);
        gl.bindTexture(gl.TEXTURE_2D, input.texture);
        gl.uniform1i(locations[uniform], slot++);
      }
      for (const [uniform, value] of Object.entries(values)) {
        if (typeof value === 'number') gl.uniform1f(locations[uniform], value);
        else if (value.length === 2) gl.uniform2fv(locations[uniform], value);
        else gl.uniform3fv(locations[uniform], value);
      }
      gl.bindFramebuffer(gl.FRAMEBUFFER, output?.framebuffer ?? null);
      gl.viewport(0, 0, output?.width ?? canvas.width, output?.height ?? canvas.height);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }

    function splat({ x, y, dx, dy, color }) {
      const position = { aspectRatio: aspect, point: [x, 1 - y], radius: .0018 };
      pass('splat', velocity.write, { ...position, color: [dx, -dy, 1] }, { uTarget: velocity.read });
      velocity.swap();
      pass('splat', dye.write, { ...position, color }, { uTarget: dye.read });
      dye.swap();
    }

    function advect(buffer, dt, dissipation) {
      pass(linearFiltering ? 'advect' : 'advectNearest', buffer.write, {
        texelSize: velocity.read.texel,
        ...(linearFiltering ? {} : { dyeTexelSize: buffer.read.texel }),
        dt,
        dissipation: dissipation ** (dt * 60),
      }, { uVelocity: velocity.read, uSource: buffer.read });
      buffer.swap();
    }

    function frame(dt, samples) {
      gl.disable(gl.BLEND);
      for (const sample of samples) splat(sample);
      const texelSize = velocity.read.texel;
      pass('divergence', divergence, { texelSize }, { uVelocity: velocity.read });
      pass('fade', pressure.write, { value: .8 }, { uTexture: pressure.read });
      pressure.swap();
      for (let iteration = 0; iteration < 12; iteration++) {
        pass('pressure', pressure.write, { texelSize }, { uPressure: pressure.read, uDivergence: divergence });
        pressure.swap();
      }
      pass('subtractGradient', velocity.write, { texelSize }, { uPressure: pressure.read, uVelocity: velocity.read });
      velocity.swap();
      advect(velocity, dt, .975);
      advect(dye, dt, .95);

      pass('bloomThreshold', bloom[0], { curve: [.15, .4, .625], threshold: .35 }, { uTexture: dye.read });
      for (let index = 1; index < bloom.length; index++) {
        const input = bloom[index - 1];
        pass('blur', bloom[index], { texelSize: input.texel }, { uTexture: input });
      }
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.ONE, gl.ONE);
      for (let index = bloom.length - 2; index > 0; index--) {
        const input = bloom[index + 1];
        pass('blur', bloom[index], { texelSize: input.texel }, { uTexture: input });
      }
      gl.disable(gl.BLEND);
      pass('bloomFinish', bloom[0], { texelSize: bloom[1].texel, intensity: .7 }, { uTexture: bloom[1] });
      pass('shadedDisplay', null, { texelSize: dye.read.texel }, { uTexture: dye.read, uBloom: bloom[0] });
    }

    function clear() {
      for (const buffer of targets) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, buffer.framebuffer);
        gl.clear(gl.COLOR_BUFFER_BIT);
      }
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.clear(gl.COLOR_BUFFER_BIT);
    }

    resize();
    return { resize, frame, clear };
  }

  function initialize() {
    const options = { alpha: true, premultipliedAlpha: true, depth: false, antialias: false };
    const modern = canvas.getContext('webgl2', options);
    if (modern) {
      if (!modern.getExtension('EXT_color_buffer_float')) return null;
      return createFluid(modern, modern.HALF_FLOAT, modern.RGBA16F, modern.getExtension('OES_texture_float_linear'));
    }
    const legacy = canvas.getContext('webgl', options);
    const halfFloat = legacy?.getExtension('OES_texture_half_float');
    if (!halfFloat) return null;
    return createFluid(legacy, halfFloat.HALF_FLOAT_OES, legacy.RGBA, legacy.getExtension('OES_texture_half_float_linear'));
  }

  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const palette = [[1, .57, .23], [.67, .46, 1], [1, .77, .33], [.82, .37, .42]];
  const pointers = new Map();
  const samples = [];
  let fluid, fallback;
  let initialized = false;
  let scheduled = 0;
  let lastFrame = 0;
  let activeUntil = 0;

  function stop() {
    cancelAnimationFrame(scheduled);
    scheduled = 0;
    lastFrame = 0;
    samples.length = 0;
    pointers.clear();
    fallback?.cancel();
    canvas.style.removeProperty('background-image');
    fluid?.clear();
  }

  function tick(time) {
    scheduled = 0;
    if (time >= activeUntil) {
      stop();
      return;
    }
    if (!lastFrame || time - lastFrame >= 13) {
      const dt = lastFrame ? Math.min(.04, (time - lastFrame) / 1000) : 1 / 60;
      fluid.frame(dt, samples.splice(0));
      lastFrame = time;
    }
    scheduled = requestAnimationFrame(tick);
  }

  function move(id, clientX, clientY, force, begin = false) {
    if (motion.matches || document.hidden) return;
    const bounds = canvas.getBoundingClientRect();
    if (!bounds.width || !bounds.height) return;
    const previous = pointers.get(id);
    pointers.set(id, [clientX, clientY]);
    const dx = previous && !begin ? clientX - previous[0] : 0;
    const dy = previous && !begin ? clientY - previous[1] : 0;
    if (!dx && !dy && !begin) return;

    if (!initialized) {
      initialized = true;
      try { fluid = initialize(); } catch { fluid = null; }
    }
    const time = performance.now();
    const color = palette[Math.floor(time / 230) % palette.length];
    const x = (clientX - bounds.left) / bounds.width;
    const y = (clientY - bounds.top) / bounds.height;

    if (!fluid) {
      const [r, g, b] = color.map(channel => Math.round(channel * 215));
      canvas.style.backgroundImage = `radial-gradient(circle at ${x * 100}% ${y * 100}%, rgba(${r}, ${g}, ${b}, .45), transparent 115px)`;
      fallback?.cancel();
      fallback = canvas.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 1000, fill: 'forwards' });
      return;
    }

    const limit = value => Math.max(-340, Math.min(340, value));
    samples.push({ x, y, dx: limit(dx * force), dy: limit(dy * force), color: color.map(channel => channel * .27) });
    if (samples.length > 12) samples.shift();
    activeUntil = time + 2700;
    if (!scheduled) scheduled = requestAnimationFrame(tick);
  }

  window.addEventListener('pointermove', event => {
    if (event.pointerType !== 'touch') move(event.pointerId, event.clientX, event.clientY, 5);
  }, { passive: true });
  window.addEventListener('pointerout', event => {
    if (!event.relatedTarget) pointers.delete(event.pointerId);
  }, { passive: true });
  for (const type of ['touchstart', 'touchmove', 'touchend', 'touchcancel']) {
    window.addEventListener(type, event => {
      for (const touch of event.changedTouches) {
        const id = 'touch-' + touch.identifier;
        if (type === 'touchend' || type === 'touchcancel') pointers.delete(id);
        else move(id, touch.clientX, touch.clientY, 8, type === 'touchstart');
      }
    }, { passive: true });
  }
  window.addEventListener('resize', () => {
    try { fluid?.resize(); } catch { fluid = null; stop(); }
  }, { passive: true });
  motion.addEventListener('change', stop);
  document.addEventListener('visibilitychange', stop);
  canvas.addEventListener('webglcontextlost', event => {
    event.preventDefault();
    fluid = null;
    stop();
  });
  canvas.addEventListener('webglcontextrestored', () => {
    stop();
    initialized = false;
  });
})();
