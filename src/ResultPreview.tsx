import { createEffect } from "solid-js";

interface IResultPreviewProps {
  image: HTMLImageElement;
}

export default function ResultPreview(props: IResultPreviewProps) {
  let canvas!: HTMLCanvasElement;
  createEffect(() => {
    const img = props.image;
    if (!img) return;
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  });

  return <canvas ref={canvas}></canvas>;
}
