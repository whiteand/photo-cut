import { createEffect, createMemo, createSignal, onCleanup } from "solid-js";
import { fillPolygon } from "./fillPolygon";
import { Point } from "./Point";
import s from "./SourceView.module.scss";
function drawCircle(
  ctx: CanvasRenderingContext2D,
  point: Point,
  r: number,
  color: string
) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(point.x, point.y, r, 0, 2 * Math.PI);
  ctx.fill();
  ctx.restore();
}
interface ISourceViewProps {
  image: ImageData;
  a: Point;
  b: Point;
  c: Point;
  d: Point;
  onAChange: (newValue: Point) => void;
  onBChange: (newValue: Point) => void;
  onCChange: (newValue: Point) => void;
  onDChange: (newValue: Point) => void;
}

function distance(a: Point, b: Point): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export default function SourceView(props: ISourceViewProps) {
  let canvas!: HTMLCanvasElement;
  let controlsCanvas!: HTMLCanvasElement;
  let wrapper!: HTMLDivElement;
  const width = createMemo(() => props.image?.width || 0);
  const height = createMemo(() => props.image?.height || 0);
  const [getWindowSize, setWindowSize] = createSignal({
    x: window.innerWidth,
    y: window.innerHeight,
  });

  createEffect(() => {
    const resize = () => {
      setWindowSize({
        x: window.innerWidth,
        y: window.innerHeight,
      });
    };
    window.addEventListener("resize", resize);
    onCleanup(() => {
      window.removeEventListener("resize", resize);
    });
  });

  createEffect(() => {
    const img = props.image;
    getWindowSize();
    if (!img) return;
    canvas.width = img.width;
    canvas.height = img.height;
    controlsCanvas.width = img.width;
    controlsCanvas.height = img.height;
    const rect = canvas.getBoundingClientRect();
    wrapper.style.height = rect.height + "px";
    wrapper.style.width = rect.width + "px";
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.putImageData(img, 0, 0);
    props.onAChange({ x: img.width / 4, y: img.height / 4 });
    props.onBChange({ x: (img.width * 3) / 4, y: img.height / 4 });
    props.onCChange({ x: (img.width * 3) / 4, y: (img.height * 3) / 4 });
    props.onDChange({ x: img.width / 4, y: (img.height * 3) / 4 });
  });

  createEffect(() => {
    if (!controlsCanvas) {
      return;
    }
    const W = width();
    const H = height();
    const rect = controlsCanvas.getBoundingClientRect();
    const ratio = Math.max(rect.width, rect.height) / Math.max(W, H);
    const { a, b, c, d } = props;
    const selectedPoint = getSelectedPoint();
    const ctx = controlsCanvas.getContext("2d");
    if (!ctx) return;
    const LEFT_TOP = { x: 0, y: 0 };
    const RIGHT_TOP = { x: W, y: 0 };
    const RIGHT_BOTTOM = { x: W, y: H };
    const LEFT_BOTTOM = { x: 0, y: H };

    ctx.clearRect(0, 0, W, H);
    const darken = "rgba(0,0,0,0.3)";
    fillPolygon(ctx, [LEFT_TOP, RIGHT_TOP, b, a], darken);
    fillPolygon(ctx, [RIGHT_TOP, RIGHT_BOTTOM, c, b], darken);
    fillPolygon(ctx, [RIGHT_BOTTOM, LEFT_BOTTOM, d, c], darken);
    fillPolygon(ctx, [LEFT_BOTTOM, LEFT_TOP, a, d], darken);

    const pointColor = "rgba(255, 0, 0, 0.3)";
    const selectedColor = "rgba(0, 0, 255, 0.3)";
    const R = 5 / ratio;
    drawCircle(ctx, a, R, selectedPoint === "a" ? selectedColor : pointColor);
    drawCircle(ctx, b, R, selectedPoint === "b" ? selectedColor : pointColor);
    drawCircle(ctx, c, R, selectedPoint === "c" ? selectedColor : pointColor);
    drawCircle(ctx, d, R, selectedPoint === "d" ? selectedColor : pointColor);

    ctx.font = `${Math.round(12 / ratio)}px Arial`;
    ctx.fillStyle = "black";
    const SHIFT = Math.floor(20 / ratio);
    ctx.fillText("A", a.x - SHIFT, a.y - SHIFT);
    ctx.fillText("B", b.x + SHIFT, b.y - SHIFT);
    ctx.fillText("C", c.x + SHIFT, c.y + SHIFT);
    ctx.fillText("D", d.x - SHIFT, d.y + SHIFT);
  });

  const toImageCoords = (mousePosition: Point): Point => {
    const W = width();
    const H = height();
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor(((mousePosition.x - rect.left) / rect.width) * W);
    const y = Math.floor(((mousePosition.y - rect.top) / rect.height) * H);
    return { x, y };
  };

  const [getStartMouse, setStartMouse] = createSignal<Point | null>(null);
  const [getLastImageMousePosition, setLastImageMousePosition] =
    createSignal<Point | null>(null);
  const [getSelectedPoint, setSelectedPoint] = createSignal<
    "a" | "b" | "c" | "d" | null
  >(null);

  const handleMouseDown = (event: MouseEvent) => {
    const { clientX, clientY } = event;
    const mousePosition = { x: clientX, y: clientY };
    const imageMousePosition = toImageCoords(mousePosition);
    const { a, b, c, d } = props;
    const aDist = distance(imageMousePosition, a);
    const bDist = distance(imageMousePosition, b);
    const cDist = distance(imageMousePosition, c);
    const dDist = distance(imageMousePosition, d);
    const minDist = Math.min(aDist, bDist, cDist, dDist);
    if (minDist === aDist) {
      setSelectedPoint("a");
    }
    if (minDist === bDist) {
      setSelectedPoint("b");
    }
    if (minDist === cDist) {
      setSelectedPoint("c");
    }
    if (minDist === dDist) {
      setSelectedPoint("d");
    }
    setLastImageMousePosition(imageMousePosition);
  };

  const handleMouseMove = (event: MouseEvent) => {
    const selectedPoint = getSelectedPoint();
    if (selectedPoint == null) return;
    const mousePosition = { x: event.clientX, y: event.clientY };
    const imageMousePosition = toImageCoords(mousePosition);
    setLastImageMousePosition(imageMousePosition);
  };

  createEffect(() => {
    const selectedPoint = getSelectedPoint();
    if (selectedPoint == null) return;
    const lastImageMousePosition = getLastImageMousePosition();
    if (lastImageMousePosition == null) return;
    if (selectedPoint === "a") props.onAChange(lastImageMousePosition);
    if (selectedPoint === "b") props.onBChange(lastImageMousePosition);
    if (selectedPoint === "c") props.onCChange(lastImageMousePosition);
    if (selectedPoint === "d") props.onDChange(lastImageMousePosition);
  });
  const handleMouseUp = () => {
    setSelectedPoint(null);
  };
  return (
    <div ref={wrapper} class={s.wrapper}>
      <canvas ref={canvas!}></canvas>
      <canvas
        ref={controlsCanvas!}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      ></canvas>
    </div>
  );
}
