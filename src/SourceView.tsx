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

export default function SourceView(props: ISourceViewProps) {
  let canvas!: HTMLCanvasElement;
  let controlsCanvas!: HTMLCanvasElement;
  let wrapper!: HTMLDivElement;
  const width = createMemo(() => props.image?.width || 0);
  const height = createMemo(() => props.image?.height || 0);

  createEffect(() => {
    const img = props.image;
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
    const { a, b, c, d } = props;
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
    const R = 20;
    drawCircle(ctx, a, R, pointColor);
    drawCircle(ctx, b, R, pointColor);
    drawCircle(ctx, c, R, pointColor);
    drawCircle(ctx, d, R, pointColor);

    ctx.font = '100px Arial'
    ctx.fillStyle = 'black'
    const SHIFT = 100
    ctx.fillText("A", a.x - SHIFT, a.y - SHIFT);
    ctx.fillText("B", b.x + SHIFT, b.y - SHIFT);
    ctx.fillText("C", c.x + SHIFT, c.y + SHIFT);
    ctx.fillText("D", d.x - SHIFT, d.y + SHIFT);
  });

  const [nextPoint, setNextPoint] = createSignal<"a" | "b" | "c" | "d">("a");
  const handleClick = (event: MouseEvent) => {
    const setter = {
      a: props.onAChange,
      b: props.onBChange,
      c: props.onCChange,
      d: props.onDChange,
    }[nextPoint()];
    const W = width();
    const H = height();
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor(((event.clientX - rect.left) / rect.width) * W);
    const y = Math.floor(((event.clientY - rect.top) / rect.height) * H);
    setter({ x, y });
    setNextPoint((p) => {
      if (p === "a") return "b";
      if (p === "b") return "c";
      if (p === "c") return "d";
      return "a";
    });
  };

  return (
    <div ref={wrapper} class={s.wrapper}>
      <canvas ref={canvas!}></canvas>
      <canvas ref={controlsCanvas!} onClick={handleClick}></canvas>
    </div>
  );
}
