import { createEffect, createSignal, onCleanup } from "solid-js";
import { JSX } from "solid-js/jsx-runtime";
import s from "./UploadButton.module.scss";

interface IUploadButtonProps {
  onImageLoaded: (imageData: { image: ImageData; name: string }) => void;
  children?: JSX.Element;
}

export default function UploadImageButton(props: IUploadButtonProps) {
  let fileInput!: HTMLInputElement;
  const [file, setFile] = createSignal<File | null>(null);

  createEffect(() => {
    const f = file();
    if (!f) return;
    const reader = new FileReader();
    let ignored = false;
    reader.onload = (e) => {
      if (ignored) return;
      const data = e.target!.result as string;
      const img = new Image();
      img.onload = () => {
        if (ignored) return;
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        props.onImageLoaded({ image: imageData, name: f.name });
      };
      img.src = data;
    };
    reader.readAsDataURL(f);
    onCleanup(() => {
      ignored = true;
    });
  });
  return (
    <>
      <input
        ref={fileInput}
        class={s.fileInput}
        type="file"
        onChange={(e) => {
          const { files } = e.currentTarget;
          if (files && files.length > 0) {
            setFile(files[0]);
          }
        }}
      />
      <div
        class={s.button}
        onClick={() => {
          if (fileInput) {
            fileInput.click();
          }
        }}
      >
        <button type="button">{props.children}</button>
      </div>
    </>
  );
}
