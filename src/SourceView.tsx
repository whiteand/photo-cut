import { createEffect, createSignal, onCleanup } from "solid-js";

interface ISourceViewProps {
  file: File;
}

export default function SourceView(props: ISourceViewProps) {
  let canvas!: HTMLCanvasElement;
  let controlsCanvas!: HTMLCanvasElement;
  let [image, setImage] = createSignal<HTMLImageElement | null>(null);

  createEffect(() => {
    const file = props.file;
    console.log(file);
    if (!file) return;
    const reader = new FileReader();
    let ignored = false;
    reader.onload = (e) => {
      if (ignored) return;
      const data = e.target!.result as string;
      const img = new Image();
      img.onload = () => {
        if (ignored) return;
        setImage(img);
      };
      img.src = data;
    };
    reader.readAsDataURL(file);
    onCleanup(() => {
      ignored = true;
    });
  });

  createEffect(() => {
    const img = image();
    if (!img) return;
    canvas.width = img.width;
    canvas.height = img.height;
    controlsCanvas.width = img.width;
    controlsCanvas.height = img.width;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  });

  return (
    <div>
      <canvas ref={canvas!}></canvas>
      <canvas ref={controlsCanvas!}></canvas>
    </div>
  );
}
