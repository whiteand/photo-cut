import { JSX } from "solid-js/jsx-runtime";
import s from "./UploadButton.module.scss";

interface IUploadButtonProps {
  onFileUploaded: (file: File) => void;
  children?: JSX.Element;
}

export default function UploadButton(props: IUploadButtonProps) {
  let fileInput!: HTMLInputElement;
  return (
    <>
      <input
        ref={fileInput}
        class={s.fileInput}
        type="file"
        onChange={(e) => {
          const { files } = e.currentTarget;
          if (files && files.length > 0) {
            props.onFileUploaded(files[0]);
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
