import { createEffect, createSignal, onCleanup } from "solid-js";
import { Point } from "./Point";
import { createProgram, createShader, setRectangle } from "./webgl";

interface IResultPreviewProps {
  source: ImageData;
  width: number;
  height: number;
  sourceName: string;
  a: Point;
  b: Point;
  c: Point;
  d: Point;
}

const VERTEX_SHADER = `
#version 300 es
 
// an attribute is an input (in) to a vertex shader.
// It will receive data from a buffer
in vec2 a_position;
out vec2 u_uv;

uniform vec2 u_resolution;
 
// all shaders have a main function
void main() {
  vec2 zeroToOne = a_position / u_resolution;
  vec2 mopo = zeroToOne * 2.0;
  vec2 clip = mopo - 1.0;
  gl_Position = vec4(clip.x, -clip.y, 0, 1);
  u_uv = zeroToOne;
}

`.trim();

const FRAGMENT_SHADER = `
#version 300 es
 
precision highp float;

in vec2 u_uv;
uniform vec2 u_resolution;
uniform vec2 u_src_resolution;
uniform sampler2D u_src;
uniform vec2 u_a;
uniform vec2 u_b;
uniform vec2 u_c;
uniform vec2 u_d;

out vec4 outColor;
 
void main() {
  vec2 ab = u_a + (u_b - u_a) * u_uv.x;
  vec2 dc = u_d + (u_c - u_d) * u_uv.x;
  vec2 p = ab + (dc - ab) * u_uv.y;
  vec2 texCoord = p / u_src_resolution;
  outColor = texture(u_src, texCoord);
}
`.trim();
export default function ResultPreview(props: IResultPreviewProps) {
  let canvas!: HTMLCanvasElement;
  const [getShouldRender, setShouldRender] = createSignal(false);

  createEffect(() => {
    const shouldRender = getShouldRender();
    if (shouldRender) return;
    const source = props.source;
    if (!source) return;
    const timeout = setTimeout(() => {
      setShouldRender(true);
    }, 500);
    onCleanup(() => clearTimeout(timeout));
  });

  createEffect(() => {
    const shouldRender = getShouldRender();
    if (!shouldRender) return;
    const { source } = props;
    if (!source) return;
    const { width, height, a, b, c, d } = props;
    canvas.width = width;
    canvas.height = height;
    const gl = canvas.getContext("webgl2");
    if (!gl) return;
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
    const fragmentShader = createShader(
      gl,
      gl.FRAGMENT_SHADER,
      FRAGMENT_SHADER
    );
    if (!vertexShader || !fragmentShader) return;
    const program = createProgram(gl, vertexShader, fragmentShader);
    if (!program) return;
    onCleanup(() => {
      gl.deleteProgram(program);
      gl.deleteShader(fragmentShader);
      gl.deleteShader(vertexShader);
    });

    const vao = gl.createVertexArray();
    if (!vao) return;
    onCleanup(() => {
      gl.deleteVertexArray(vao);
    });
    gl.bindVertexArray(vao);
    const n: number = setGeometry(gl, program, width, height);
    const resolutionLocation = gl.getUniformLocation(program, "u_resolution");
    const srcResolutionLocation = gl.getUniformLocation(
      program,
      "u_src_resolution"
    );

    const srcImageLocation = gl.getUniformLocation(program, "u_src");

    const texture = gl.createTexture();
    if (!texture) return;
    onCleanup(() => gl.deleteTexture(texture));
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    var mipLevel = 0; // the largest mip
    var internalFormat = gl.RGBA; // format we want in the texture
    var srcFormat = gl.RGBA; // format of data we are supplying
    var srcType = gl.UNSIGNED_BYTE; // type of data we are supplying
    gl.texImage2D(
      gl.TEXTURE_2D,
      mipLevel,
      internalFormat,
      srcFormat,
      srcType,
      source
    );
    const aLocation = gl.getUniformLocation(program, "u_a");
    const bLocation = gl.getUniformLocation(program, "u_b");
    const cLocation = gl.getUniformLocation(program, "u_c");
    const dLocation = gl.getUniformLocation(program, "u_d");

    gl.useProgram(program);

    // render
    gl.uniform2f(resolutionLocation, width, height);
    gl.uniform2f(srcResolutionLocation, source.width, source.height);

    gl.uniform2f(aLocation, a.x, a.y);
    gl.uniform2f(bLocation, b.x, b.y);
    gl.uniform2f(cLocation, c.x, c.y);
    gl.uniform2f(dLocation, d.x, d.y);

    gl.uniform1i(srcImageLocation, 0);

    gl.drawArrays(gl.TRIANGLES, 0, n);
  });

  return <canvas ref={canvas}></canvas>;
}
function setGeometry(
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  width: number,
  height: number
) {
  const positionLocation = gl.getAttribLocation(program, "a_position");
  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  setRectangle(gl, 0, 0, width, height);
  gl.enableVertexAttribArray(positionLocation);
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

  return 6;
}
