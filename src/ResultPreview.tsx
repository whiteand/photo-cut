import { createEffect, createSignal, onCleanup } from "solid-js";
import { Point } from "./Point";
import { createProgram, createShader, randomInt, setRectangle } from "./webgl";

interface IResultPreviewProps {
  source: ImageData;
  width: number;
  height: number;
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

uniform vec2 u_resolution;
 
// all shaders have a main function
void main() {
  vec2 zeroToOne = a_position / u_resolution;
  vec2 mopo = zeroToOne * 2.0;
  vec2 clip = mopo - 1.0;
  gl_Position = vec4(clip.x, -clip.y, 0, 1);
}

`.trim();

const FRAGMENT_SHADER = `
#version 300 es
 
// fragment shaders don't have a default precision so we need
// to pick one. highp is a good default. It means "high precision"
precision highp float;

// we need to declare an output for the fragment shader
out vec4 outColor;
uniform vec4 u_color;
 
void main() {
  // Just set the output to a constant reddish-purple
  outColor = u_color;
}
`.trim();
export default function ResultPreview(props: IResultPreviewProps) {
  let canvas!: HTMLCanvasElement;
  const [getContext, setContext] = createSignal<WebGL2RenderingContext | null>(
    null
  );
  createEffect(() => {
    const { width, height } = props;
    canvas.width = width;
    canvas.height = height;
    const gl = canvas.getContext("webgl2");
    if (!gl) return;
    setContext(gl);
  });

  createEffect(() => {
    const gl = getContext();
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

    const positionBuffer = gl.createBuffer();
    if (!positionBuffer) return;
    onCleanup(() => {
      gl.deleteBuffer(positionBuffer);
    });
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    setRectangle(gl, 10, 20, 60, 10);

    const vao = gl.createVertexArray();

    if (!vao) return;

    onCleanup(() => {
      gl.deleteVertexArray(vao);
    });

    gl.bindVertexArray(vao);

    const aPositionAttributeLoc = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(aPositionAttributeLoc);
    gl.vertexAttribPointer(aPositionAttributeLoc, 2, gl.FLOAT, false, 0, 0);

    const uResolutionUniformLoc = gl.getUniformLocation(
      program,
      "u_resolution"
    );

    const uColorUniformLoc = gl.getUniformLocation(program, "u_color");

    gl.viewport(0, 0, props.width, props.height);

    gl.clearColor(0, 0, 0, 0);

    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(program);
    onCleanup(() => {
      gl.useProgram(null);
    });
    gl.uniform2f(uResolutionUniformLoc, props.width, props.height);

    for (let i = 0; i < 100; i++) {
      const x = randomInt(props.width);
      const y = randomInt(props.height);
      const w = randomInt(props.width - x);
      const h = randomInt(props.height - y);
      const r = randomInt(255) / 255;
      const g = randomInt(255) / 255;
      const b = randomInt(255) / 255;
      console.log(x, y, w, h, r, g, b);
      const a = 1;
      setRectangle(gl, x, y, w, h);
      gl.uniform4f(uColorUniformLoc, r, g, b, a);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    }
  });

  return <canvas ref={canvas}></canvas>;
}
