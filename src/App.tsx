import {
  Component,
  createEffect,
  createSignal,
  onCleanup,
  Show,
} from "solid-js";
import s from "./App.module.scss";
import { Point } from "./Point";
import ResultPreview from "./ResultPreview";
import SourceView from "./SourceView";
import UploadImageButton from "./UploadButton";
import Cutter from "./Cutter.worker?worker";
import { IRequest } from "./IRequest";
import { isValidResponse } from "./isValidResponse";

const cutterWorkers = (() => {
  const workers = Array.from({ length: 10 }, () => new Cutter());
  let nextWorker = 0;
  return {
    get: () => {
      const worker = workers[nextWorker];
      nextWorker = (nextWorker + 1) % workers.length;
      return worker;
    },
  };
})();

const DEFAULT_RES_SIZE = 512;
const App: Component = () => {
  const [getA, setA] = createSignal<Point>({ x: 0, y: 0 });
  const [getB, setB] = createSignal<Point>({ x: 0, y: 0 });
  const [getC, setC] = createSignal<Point>({ x: 0, y: 0 });
  const [getD, setD] = createSignal<Point>({ x: 0, y: 0 });
  const [getSource, setSource] = createSignal<ImageData | null>(null);
  const [getResultWidth, setResultWidth] = createSignal(0);
  const [getResultHeight, setResultHeight] = createSignal(0);
  createEffect(() => {
    const source = getSource();
    if (!source) return;
    setResultWidth(DEFAULT_RES_SIZE);
    setResultHeight(DEFAULT_RES_SIZE);
  });
  return (
    <div class={s.App}>
      <header class={s.header}>Welcome to Photo Cutter!</header>
      <Show when={getSource() === null}>
        <UploadImageButton onImageLoaded={setSource}>Upload</UploadImageButton>
      </Show>
      <Show when={getSource() !== null}>
        <input
          type="number"
          value={getResultWidth()}
          onChange={(e) => setResultWidth(Number(e.currentTarget.value))}
        />
        <input
          type="number"
          value={getResultHeight()}
          onChange={(e) => setResultHeight(Number(e.currentTarget.value))}
        />
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
        <ResultPreview
          source={getSource()!}
          width={getResultWidth()}
          height={getResultHeight()}
          a={getA()}
          b={getB()}
          c={getC()}
          d={getD()}
        />
      </Show>
    </div>
  );
};
export default App;
