import { IRequest } from "./IRequest";
import { IResponse } from "./IResponse";

function isValidMessage(request: any): request is IRequest {
  return true;
}

globalThis.addEventListener("message", async (message) => {
  console.log("cutter", message);
  const { data } = message;
  if (!isValidMessage(data)) return;
  const { resW, resH, ax, ay, bx, by, cx, id, cy, dx, dy, src, width } = data;
  const res = new ImageData(resW, resH);
  const srcBytes = new Uint8ClampedArray(src);
  let resPtr = 0;
  let u = 0;
  let v = 0;
  let lastSrcX = 0;
  let lastSrcY = 0;
  for (let y = 0; y < resH; y++) {
    for (let x = 0; x < resW; x++) {
      u = x / resW;
      v = y / resH;
      const abx = ax + (bx - ax) * u;
      const aby = ay + (by - ay) * u;
      const dcx = dx + (cx - dx) * u;
      const dcy = dy + (cy - dy) * u;
      const px = abx + (dcx - abx) * v;
      const py = aby + (dcy - aby) * v;
      const srcX = Math.floor(px);
      const srcY = Math.floor(py);
      if (lastSrcX !== srcX || lastSrcY !== srcY) {
        lastSrcX = srcX;
        lastSrcY = srcY;
        console.log(lastSrcX, lastSrcY);
      }
      let srcPtr = (srcY * width + srcX) * 4;
      res.data[resPtr++] = srcBytes[srcPtr++];
      res.data[resPtr++] = srcBytes[srcPtr++];
      res.data[resPtr++] = srcBytes[srcPtr++];
      res.data[resPtr++] = srcBytes[srcPtr++];
    }
  }
  const resBitmap = await createImageBitmap(res, 0, 0, resW, resH);
  const response: IResponse = {
    id: id,
    data: resBitmap,
  };
  postMessage(response, {
    transfer: [resBitmap],
  });
  return response;
});
