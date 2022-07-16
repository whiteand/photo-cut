import { Component, createEffect, createSignal, Show } from "solid-js";
import s from "./App.module.scss";
import { Point } from "./Point";
import ResultPreview from "./ResultPreview";
import SourceView from "./SourceView";
import UploadImageButton from "./UploadButton";

function triangleArea(a: number, b: number, c: number) {
  const p = (a + b + c) / 2;
  return Math.sqrt(p * (p - a) * (p - b) * (p - c));
}

const App: Component = () => {
  const [shape, setShape] = createSignal<"circle" | "rectangle">();
  const [getA, setA] = createSignal<Point>({ x: 0, y: 0 });
  const [getB, setB] = createSignal<Point>({ x: 0, y: 0 });
  const [getC, setC] = createSignal<Point>({ x: 0, y: 0 });
  const [getD, setD] = createSignal<Point>({ x: 0, y: 0 });
  const [getSource, setSource] = createSignal<ImageData | null>(null);
  const [result, setResult] = createSignal<ImageData | null>(null);
  const [getResultWidth, setResultWidth] = createSignal(0);
  const [getResultHeight, setResultHeight] = createSignal(0);
  createEffect(() => {
    const source = getSource();
    if (!source) return;
    setResultWidth(source.width / 2);
    setResultHeight(source.height / 2);
  });
  createEffect(() => {
    const src = getSource();
    if (!src) return
    const a = getA();
    const b = getA();
    const c = getA();
    const d = getA();
    src.

  });
  return (
    <div class={s.App}>
      <header class={s.header}>Welcome to Photo Cutter!</header>
      <Show when={getSource() === null}>
        <UploadImageButton onImageLoaded={setSource}>Upload</UploadImageButton>
      </Show>
      <Show when={getSource() !== null}>
        <SourceView
          image={getSource()!}
          a={getA()}
          b={getB()}
          c={getC()}
          d={getD()}
          onAChange={setA}
          onBChange={setB}
          onCChange={setC}
          onDChange={setD}
        />
        <ResultPreview image={result()!} />
      </Show>
    </div>
  );
};

export default App;
