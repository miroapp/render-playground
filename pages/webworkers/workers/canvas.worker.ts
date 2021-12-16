// const canvas = new OffscreenCanvas(400, 400);
// const ctx = canvas.getContext("2d");

// const canvasWidth = 800;
// const canvasHeight = 800;

let canvas: OffsreenCanvas;

interface Object {
  x: number;
  y: number;
  width: number;
  height: number;
  fillColor: string;
}

interface RenderOptions {
  cameraX: number;
  cameraY: number;
  tileWidth: number;
  tileHeight: number;
  frameId: number;
  workerId: number;
}

function render(canvas: OffsreenCanvas, objects: Object[], options: RenderOptions) {
  const { cameraX, cameraY, tileWidth, tileHeight, frameId } = options;

  // const canvas = new OffscreenCanvas(tileWidth, tileHeight);
  const ctx = canvas.getContext("2d");

  // console.time("clear rect");
  ctx.clearRect(0, 0, tileWidth, tileHeight);
  // console.timeEnd("clear rect");

  for (let i = 0; i < objects.length; i++) {
    const object = objects[i];
    let { x, y, width, height, fillColor } = object;

    x -= cameraX;
    y -= cameraY;

    ctx.fillStyle = fillColor;
    ctx.fillRect(x, y, width, height);
  }

  // return ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
}

const decoder = new TextDecoder("utf-8");

onmessage = (evt) => {
  // if (evt.data === "init") return;

  if (evt.data instanceof OffscreenCanvas) {
    canvas = evt.data;
    return;
  }

  const json = decoder.decode(new DataView(evt.data, 0, evt.data.byteLength));
  const { objects, options } = JSON.parse(json);

  console.log(`received (worker) (${options.workerId}) (${options.frameId})`, Date.now())

  const timeLabel = `render (worker) (${options.workerId}) (${options.frameId})`;
  console.time(timeLabel);
  //const imageData = render(canvas, objects, options);
  render(canvas, objects, options);
  console.timeEnd(timeLabel);

  console.log(`post (worker) (${options.workerId}) (${options.frameId})`, Date.now())
  postMessage(options.frameId);

  // postMessage(
  //   {
  //     // imageData: imageData.data.buffer,
  //     // cameraX: options.cameraX,
  //     // cameraY: options.cameraY,
  //     // frameId: options.frameId,
  //   },
  //   [
  //     // imageData.data.buffer,
  //   ]
  // );
};
