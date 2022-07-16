import { Component, createSignal, Show } from "solid-js";
import s from "./App.module.scss";
import SourceView from "./SourceView";
import UploadButton from "./UploadButton";

type Point = { x: number; y: number };

const App: Component = () => {
  const [shape, setShape] = createSignal<"circle" | "rectangle">();
  const [a, setA] = createSignal<Point>({ x: 0, y: 0 });
  const [b, setB] = createSignal<Point>({ x: 0, y: 0 });
  const [c, setC] = createSignal<Point>({ x: 0, y: 0 });
  const [d, setD] = createSignal<Point>({ x: 0, y: 0 });
  const [source, setSource] = createSignal<File | null>(null);
  const [result, setResult] = createSignal<string | null>(null);
  return (
    <div class={s.App}>
      <header class={s.header}>Welcome to Photo Cutter!</header>
      <Show when={source() === null}>
        <UploadButton onFileUploaded={setSource}>Upload</UploadButton>
      </Show>
      <Show when={source() !== null}>
        <SourceView file={source()!} />
      </Show>
    </div>
  );
};

export default App;
