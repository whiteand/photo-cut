export function createShader(
  gl: WebGL2RenderingContext,
  type: number,
  source: string,
): WebGLShader | null {
  const shader = gl.createShader(type);

  if (!shader) return null;

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);

  if (!success) {
    console.log(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

export function createProgram(
  gl: WebGL2RenderingContext,
  vertexShader: WebGLShader,
  fragmentShader: WebGLShader,
): WebGLProgram | null {
  const program = gl.createProgram();
  if (!program) return null;
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  const success = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (!success) {
    console.log(gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);
    return null;
  }
  return program;
}

export function randomInt(range: number): number {
  return Math.floor(Math.random() * range);
}

export function setRectangle(
  gl: WebGL2RenderingContext,
  x: number,
  y: number,
  width: number,
  height: number,
) {
  const x1 = x;
  const x2 = x + width;
  const y1 = y;
  const y2 = y + height;
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([x1, y1, x2, y1, x1, y2, x1, y2, x2, y2, x2, y1]),
    gl.STATIC_DRAW,
  );
}
export function setColoredRectangle(
  gl: WebGL2RenderingContext,
  x: number,
  y: number,
  width: number,
  height: number,
  aColor: number,
  bColor: number,
  cColor: number,
  dColor: number,
) {
  const a = [aColor >>> 16, aColor >>> 8 & 0xff, aColor & 0xff, 0xff].map(e => e / 255);
  const b = [bColor >>> 16, bColor >>> 8 & 0xff, bColor & 0xff, 0xff].map(e => e / 255);
  const c = [cColor >>> 16, cColor >>> 8 & 0xff, cColor & 0xff, 0xff].map(e => e / 255);
  const d = [dColor >>> 16, dColor >>> 8 & 0xff, dColor & 0xff, 0xff].map(e => e / 255);
  const x1 = x;
  const x2 = x + width;
  const y1 = y;
  const y2 = y + height;
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([
      x1,
      y1,
      ...a,
      x2,
      y1,
      ...b,
      x1,
      y2,
      ...c,
      x1,
      y2,
      ...c,
      x2,
      y2,
      ...d,
      x2,
      y1,
      ...b,
    ]),
    gl.STATIC_DRAW,
  );
}
