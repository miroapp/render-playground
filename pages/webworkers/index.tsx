import type { NextPage } from "next";
import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./index.module.css";

interface Object {
  x: number;
  y: number;
  width: number;
  height: number;
  dirX: number;
  dirY: number;
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

interface GenerateObjectsOptions {
  objectsCount: number;
  objectWidthRange: [number, number];
  objectHeightRange: [number, number];
  viewportWidth: number;
  viewportHeight: number;
  fillColors: string[];
}

// Returns a random number between min (inclusive) and max (exclusive)
function getRandomArbitrary(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

// Returns a random integer between min (inclusive) and max (inclusive).
function getRandomInt(min: number, max: number): number {
  min = Math.ceil(min);
  max = Math.floor(max);

  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateObjects(options: GenerateObjectsOptions): Object[] {
  const objects = [];
  const {
    viewportWidth,
    viewportHeight,
    objectWidthRange,
    objectHeightRange,
    objectsCount,
    fillColors,
  } = options;

  for (let i = 0; i < objectsCount; i++) {
    objects.push({
      x: getRandomArbitrary(0, viewportWidth),
      y: getRandomArbitrary(0, viewportHeight),
      width: getRandomArbitrary(...objectWidthRange),
      height: getRandomArbitrary(...objectHeightRange),
      dirX: Math.random() > 0.5 ? 1 : -1,
      dirY: Math.random() > 0.5 ? 1 : -1,
      fillColor: fillColors[getRandomInt(0, fillColors.length)],
    });
  }

  return objects;
}

function render(canvas: HTMLCanvasElement, objects: Object[], options: RenderOptions) {
  const { cameraX, cameraY, tileWidth, tileHeight } = options;

  const ctx = canvas.getContext("2d");

  ctx.clearRect(0, 0, tileWidth, tileHeight);

  for (let i = 0; i < objects.length; i++) {
    const object = objects[i];
    let { x, y, width, height, fillColor } = object;

    x -= cameraX;
    y -= cameraY;

    ctx.fillStyle = fillColor;
    ctx.fillRect(x, y, width, height);
  }
}

const devicePixelRatio = typeof window !== "undefined" ? window.devicePixelRatio : 1;

const canvasWidth = 600;
const canvasHeight = 600;
const tileHoriz = 2;
const tileVert = 2;
const tileWidth = (canvasWidth * devicePixelRatio) / tileHoriz;
const tileHeight = (canvasHeight * devicePixelRatio) / tileVert;

const tileBoundaries = [];

for (let y = 0; y < tileVert; y++) {
  for (let x = 0; x < tileHoriz; x++) {
    tileBoundaries.push([
      x * tileWidth,
      y * tileHeight,
      x * tileWidth + tileWidth,
      y * tileHeight + tileHeight,
    ]);
  }
}

let frameId = 0;

const WebWorkersPage: NextPage = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvas2Ref = useRef<HTMLCanvasElement>(null);
  const offscreenCanvas1Ref = useRef<HTMLCanvasElement>();
  const offscreenCanvas2Ref = useRef<HTMLCanvasElement>();
  const offscreenCanvas3Ref = useRef<HTMLCanvasElement>();
  const offscreenCanvas4Ref = useRef<HTMLCanvasElement>();
  const offscreenCanvasesRef = useRef([]);

  const onscreenCanvas1Ref = useRef<HTMLCanvasElement>();
  const onscreenCanvas2Ref = useRef<HTMLCanvasElement>();
  const onscreenCanvas3Ref = useRef<HTMLCanvasElement>();
  const onscreenCanvas4Ref = useRef<HTMLCanvasElement>();
  const onscreenCanvasesRef = useRef([]);

  const workersRef = useRef<Worker[]>([]);
  const worker1Ref = useRef<Worker>();
  const worker2Ref = useRef<Worker>();
  const worker3Ref = useRef<Worker>();
  const worker4Ref = useRef<Worker>();
  const worker5Ref = useRef<Worker>();
  const worker6Ref = useRef<Worker>();
  const worker7Ref = useRef<Worker>();
  const worker8Ref = useRef<Worker>();
  const worker9Ref = useRef<Worker>();

  const objectsRef = useRef<Object[]>();
  const currentFrameCommits = useRef<number>();
  const rafRef = useRef<number>();
  const raf2Ref = useRef<number>();

  useEffect(() => {
    if (!canvasRef.current || !canvas2Ref.current) return;

    console.log("hardwareConcurrency", navigator.hardwareConcurrency);

    canvasRef.current.width = canvasWidth * devicePixelRatio;
    canvasRef.current.height = canvasHeight * devicePixelRatio;

    canvas2Ref.current.width = canvasWidth * devicePixelRatio;
    canvas2Ref.current.height = canvasHeight * devicePixelRatio;

    offscreenCanvas1Ref.current = document.createElement("canvas");
    offscreenCanvas1Ref.current.width = tileWidth;
    offscreenCanvas1Ref.current.height = tileHeight;

    offscreenCanvas2Ref.current = document.createElement("canvas");
    offscreenCanvas2Ref.current.width = tileWidth;
    offscreenCanvas2Ref.current.height = tileHeight;

    offscreenCanvas3Ref.current = document.createElement("canvas");
    offscreenCanvas3Ref.current.width = tileWidth;
    offscreenCanvas3Ref.current.height = tileHeight;

    offscreenCanvas4Ref.current = document.createElement("canvas");
    offscreenCanvas4Ref.current.width = tileWidth;
    offscreenCanvas4Ref.current.height = tileHeight;

    offscreenCanvasesRef.current = [
      offscreenCanvas1Ref.current,
      offscreenCanvas2Ref.current,
      offscreenCanvas3Ref.current,
      offscreenCanvas4Ref.current,
    ];

    onscreenCanvas1Ref.current = document.createElement("canvas");
    onscreenCanvas1Ref.current.width = tileWidth;
    onscreenCanvas1Ref.current.height = tileHeight;

    onscreenCanvas2Ref.current = document.createElement("canvas");
    onscreenCanvas2Ref.current.width = tileWidth;
    onscreenCanvas2Ref.current.height = tileHeight;

    onscreenCanvas3Ref.current = document.createElement("canvas");
    onscreenCanvas3Ref.current.width = tileWidth;
    onscreenCanvas3Ref.current.height = tileHeight;

    onscreenCanvas4Ref.current = document.createElement("canvas");
    onscreenCanvas4Ref.current.width = tileWidth;
    onscreenCanvas4Ref.current.height = tileHeight;

    onscreenCanvasesRef.current = [
      onscreenCanvas1Ref.current,
      onscreenCanvas2Ref.current,
      onscreenCanvas3Ref.current,
      onscreenCanvas4Ref.current,
    ];

    worker1Ref.current = new Worker(new URL("./workers/canvas.worker.ts", import.meta.url));
    worker2Ref.current = new Worker(new URL("./workers/canvas.worker.ts", import.meta.url));
    worker3Ref.current = new Worker(new URL("./workers/canvas.worker.ts", import.meta.url));
    worker4Ref.current = new Worker(new URL("./workers/canvas.worker.ts", import.meta.url));
    // worker5Ref.current = new Worker(new URL("./workers/canvas.worker.ts", import.meta.url));
    // worker6Ref.current = new Worker(new URL("./workers/canvas.worker.ts", import.meta.url));
    // worker7Ref.current = new Worker(new URL("./workers/canvas.worker.ts", import.meta.url));
    // worker8Ref.current = new Worker(new URL("./workers/canvas.worker.ts", import.meta.url));
    // worker9Ref.current = new Worker(new URL("./workers/canvas.worker.ts", import.meta.url));

    workersRef.current = [
      worker1Ref.current,
      worker2Ref.current,
      worker3Ref.current,
      worker4Ref.current,
      // worker5Ref.current,
      // worker6Ref.current,
      // worker7Ref.current,
      // worker8Ref.current,
      // worker9Ref.current,
    ];

    // worker1Ref.current?.postMessage("init");
    // worker2Ref.current?.postMessage("init");
    // worker3Ref.current?.postMessage("init");
    // worker4Ref.current?.postMessage("init");
    // worker5Ref.current?.postMessage("init");
    // worker6Ref.current?.postMessage("init");
    // worker7Ref.current?.postMessage("init");
    // worker8Ref.current?.postMessage("init");
    // worker9Ref.current?.postMessage("init");

    const ctx = canvasRef.current.getContext("2d");

    function transferCanvas(worker: Worker, offscreenCanvas: OffscreenCanvas) {
      worker.postMessage(offscreenCanvas, [offscreenCanvas]);
    }

    function renderFrame(frameId) {
      const timeLabel = `render (main) (${frameId})`;
      console.time(timeLabel);

      for (let i = 0; i < offscreenCanvasesRef.current.length; i++) {
        const [cameraX, cameraY] = tileBoundaries[i];

        ctx.clearRect(cameraX, cameraY, tileWidth, tileHeight);
        ctx.drawImage(
          offscreenCanvasesRef.current[i],
          0,
          0,
          tileWidth,
          tileHeight,
          cameraX,
          cameraY,
          tileWidth,
          tileHeight
        );
      }
      console.timeEnd(timeLabel);
    }

    function createListener(worker: Worker, idx: number) {
      worker.addEventListener("message", (evt) => {
        console.log(`received (main) (${idx}) (${evt.data})`, Date.now());

        // if (evt.data.frameId < frameId) return;
        // if (evt.data < frameId) return;

        // const timeLabel = `render (main) (${idx}) (${evt.data})`;
        // console.time(timeLabel);
        // // const imageData = new ImageData(
        // //   new Uint8ClampedArray(evt.data.imageData),
        // //   tileWidth,
        // //   tileHeight
        // // );
        // const [cameraX, cameraY] = tileBoundaries[idx];
        //
        // ctx.clearRect(cameraX, cameraY, tileWidth, tileHeight);
        // ctx.drawImage(offscreenCanvasesRef.current[idx], 0, 0, tileWidth, tileHeight, cameraX, cameraY, tileWidth, tileHeight);
        //
        // // ctx.clearRect(evt.data.cameraX, evt.data.cameraY, tileWidth, tileHeight);
        // // ctx.drawImage(offscreenCanvasesRef.current[idx], evt.data.cameraX, evt.data.cameraY);
        // // ctx.putImageData(imageData, evt.data.cameraX, evt.data.cameraY);
        // console.timeEnd(timeLabel);

        currentFrameCommits.current++;

        if (currentFrameCommits.current === tileHoriz * tileVert) {
          renderFrame(evt.data);
          console.timeEnd(`frame`);
        }
      });
    }

    for (let i = 0; i < offscreenCanvasesRef.current.length; i++) {
      transferCanvas(
        workersRef.current[i],
        offscreenCanvasesRef.current[i].transferControlToOffscreen()
      );
    }

    for (let i = 0; i < workersRef.current.length; i++) {
      createListener(workersRef.current[i], i);
    }

    return () => {
      worker1Ref.current?.terminate();
      worker2Ref.current?.terminate();
      worker3Ref.current?.terminate();
      worker4Ref.current?.terminate();
      worker5Ref.current?.terminate();
      worker6Ref.current?.terminate();
      worker7Ref.current?.terminate();
      worker8Ref.current?.terminate();
      worker9Ref.current?.terminate();

      cancelAnimationFrame(rafRef.current!);
      cancelAnimationFrame(raf2Ref.current!);
    };
  }, []);
  
  const getTiles = useCallback(() => {
    if (!objectsRef.current) {
      objectsRef.current = generateObjects({
        objectsCount: 5000,
        objectWidthRange: [10, 30],
        objectHeightRange: [10, 30],
        viewportWidth: canvasWidth * devicePixelRatio,
        viewportHeight: canvasHeight * devicePixelRatio,
        fillColors: ["black", "red", "blue", "green", "orange", "purple"],
      });
    }

    const objects = objectsRef.current!;

    const tiles = Array.from({ length: tileBoundaries.length }, () => []);

    for (let i = 0; i < objects.length; i++) {
      const object = objects[i];

      for (let j = 0; j < tileBoundaries.length; j++) {
        const boundary = tileBoundaries[j];

        if (
          object.x + object.width >= boundary[0] &&
          object.x < boundary[2] &&
          object.y + object.height >= boundary[1] &&
          object.y < boundary[3]
        ) {
          tiles[j].push(object);
        }
      }
    }
    
    return tiles;
  }, [])

  const handleWorkerRender = useCallback(() => {
    const tiles = getTiles()

    let index = 0;

    for (let y = 0; y < tileVert; y++) {
      for (let x = 0; x < tileHoriz; x++) {
        const culledObjects = tiles[index];

        const data = new TextEncoder().encode(
          JSON.stringify({
            objects: culledObjects,
            options: {
              tileWidth,
              tileHeight,
              cameraX: x * tileWidth,
              cameraY: y * tileHeight,
              frameId,
              workerId: index,
            },
          })
        );

        console.log(`post (main) (${index}) (${frameId})`, Date.now());
        workersRef.current[index].postMessage(data.buffer, [data.buffer]);

        index++;

        // workerIndexRef.current = (workerIndexRef.current + 1) % workersRef.current!.length;
      }
    }
  }, []);

  const handleWorkerAnimation = useCallback(() => {
    frameId++;

    objectsRef.current?.forEach((object) => {
      object.x += object.dirX;
      object.y += object.dirY;

      if (object.x <= 0) {
        object.dirX = 1;
      } else if (object.x + object.width >= canvasWidth * devicePixelRatio) {
        object.dirX = -1;
      }
      if (object.y <= 0) {
        object.dirY = 1;
      } else if (object.y + object.height >= canvasHeight * devicePixelRatio) {
        object.dirY = -1;
      }
    });

    if (
      currentFrameCommits.current === undefined ||
      currentFrameCommits.current === tileHoriz * tileVert
    ) {
      currentFrameCommits.current = 0;

      console.time(`frame`);
      handleWorkerRender();
    }

    rafRef.current = requestAnimationFrame((time) => {
      handleWorkerAnimation();
    });
  }, []);

  const handleStandardRender = useCallback(() => {
    // const objects = objectsRef.current!;
    //
    // const ctx = canvas2Ref.current!.getContext("2d");
    //
    // ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    //
    // for (let i = 0; i < objects.length; i++) {
    //   const object = objects[i];
    //   let { x, y, width, height, fillColor } = object;
    //
    //   ctx.fillStyle = fillColor;
    //   ctx.fillRect(x, y, width, height);
    // }

    const tiles = getTiles()

    let index = 0;
    const ctx = canvas2Ref.current.getContext('2d');

    for (let y = 0; y < tileVert; y++) {
      for (let x = 0; x < tileHoriz; x++) {
        const culledObjects = tiles[index];

        render(onscreenCanvasesRef.current[index], culledObjects, {
          tileWidth,
          tileHeight,
          cameraX: x * tileWidth,
          cameraY: y * tileHeight,
          frameId,
          workerId: index,
        })

        index++;
      }
    }

    index = 0;

    for (let y = 0; y < tileVert; y++) {
      for (let x = 0; x < tileHoriz; x++) {
        const [cameraX, cameraY] = tileBoundaries[index];

        ctx.clearRect(cameraX, cameraY, tileWidth, tileHeight);
        ctx.drawImage(
          onscreenCanvasesRef.current[index],
          0,
          0,
          tileWidth,
          tileHeight,
          cameraX,
          cameraY,
          tileWidth,
          tileHeight
        );

        index++;
      }
    }
  }, []);

  const handleStandardAnimation = useCallback(() => {
    objectsRef.current?.forEach((object) => {
      object.x += object.dirX;
      object.y += object.dirY;

      if (object.x <= 0) {
        object.dirX = 1;
      } else if (object.x + object.width >= canvasWidth * devicePixelRatio) {
        object.dirX = -1;
      }
      if (object.y <= 0) {
        object.dirY = 1;
      } else if (object.y + object.height >= canvasHeight * devicePixelRatio) {
        object.dirY = -1;
      }
    });

    handleStandardRender();

    raf2Ref.current = requestAnimationFrame((time) => {
      handleStandardAnimation();
    });
  }, []);

  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      <div>
        <div>
          <canvas
            ref={canvasRef}
            style={{ width: canvasWidth, height: canvasHeight, border: "1px solid black" }}
          />
        </div>
        <div>
          <button onClick={handleWorkerAnimation}>Start (worker)</button>
        </div>
      </div>
      <div>
        <div>
          <canvas
            ref={canvas2Ref}
            style={{ width: canvasWidth, height: canvasHeight, border: "1px solid black" }}
          />
        </div>
        <div>
          <button onClick={handleStandardAnimation}>Start (standard)</button>
        </div>
      </div>
    </div>
  );
};

export default WebWorkersPage;
