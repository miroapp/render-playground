import type { NextPage } from "next";
import { useEffect, useRef } from "react";
import styles from "./shapes_page_style.module.css";
import vertexShader from "./shaders/ellipse-vertex.glsl";
import fragmentShader from "./shaders/ellipse-fragment.glsl";
import {
  clear,
  createProgram,
  draw,
  setIndices,
  setVertexAttribute,
} from "../../modules/webgl-utils";

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 640;
const RECT_VERTICES = [0, 0, 1, 0, 0, 1, 1, 1];
const RECT_INDICES = [0, 1, 2, 3, 2, 1];

function experiment1(canvas: HTMLCanvasElement) {
  const gl = canvas.getContext("webgl");

  if (!gl) return;

  canvas.width = CANVAS_WIDTH;
  canvas.height = CANVAS_HEIGHT;

  const positionData: number[] = [];
  const scaleData: number[] = [];
  const translateData: number[] = [];
  const depthData: number[] = [];
  const strokeWidthData: number[] = [];
  const strokeColorData: number[] = [];
  const fillColorData: number[] = [];
  const indexData: number[] = [];

  let nEllipses = 0;

  function ellipse(options: {
    scale: [number, number];
    translate: [number, number];
    depth: number;
    strokeWidth: number;
    strokeColor: [number, number, number, number];
    fillColor: [number, number, number, number];
  }) {
    // Push the bounding box vertices to the position buffer
    positionData.push(...RECT_VERTICES);

    // Push the indices, with an offset by n. of vertices at every new ellipse
    indexData.push(...RECT_INDICES.map((index) => 4 * nEllipses + index));

    // Push 4 identical copies of the attributes, one for every vertex
    for (let i = 0; i < 4; i++) {
      scaleData.push(...options.scale);
      translateData.push(...options.translate);
      depthData.push(options.depth);
      strokeWidthData.push(options.strokeWidth);
      strokeColorData.push(...options.strokeColor);
      fillColorData.push(...options.fillColor);
    }

    // Increment n. of ellipses in the scene by 1
    nEllipses += 1;
  }

  ellipse({
    scale: [0.9, 0.3],
    translate: [-0.1, 0.5],
    depth: -0.1,
    strokeWidth: 0.01,
    strokeColor: [1.0, 1.0, 1.0, 0.1],
    fillColor: [0.75, 0.0, 0.0, 0.5],
  });

  ellipse({
    scale: [0.8, 1.3],
    translate: [-0.6, -0.4],
    depth: -0.2,
    strokeWidth: 0.03,
    strokeColor: [1.0, 1.0, 1.0, 0.9],
    fillColor: [0.0, 0.0, 0.75, 0.6],
  });

  ellipse({
    scale: [1.5, 1.2],
    translate: [-0.8, -0.8],
    depth: -0.3,
    strokeWidth: 0.02,
    strokeColor: [1.0, 1.0, 1.0, 0.5],
    fillColor: [0.0, 0.75, 0.0, 0.7],
  });

  const program = createProgram(gl, vertexShader, fragmentShader);

  // Create buffers
  setVertexAttribute(gl, program, "position", 2, positionData);
  setVertexAttribute(gl, program, "scale", 2, scaleData);
  setVertexAttribute(gl, program, "translate", 2, translateData);
  setVertexAttribute(gl, program, "depth", 1, depthData);
  setVertexAttribute(gl, program, "strokeWidth", 1, strokeWidthData);
  setVertexAttribute(gl, program, "strokeColor", 4, strokeColorData);
  setVertexAttribute(gl, program, "fillColor", 4, fillColorData);
  setIndices(gl, indexData);

  clear(gl);
  draw(gl, canvas, indexData.length);
}

const ShapesPage: NextPage = () => {
  const canvas1 = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvas1.current) {
      experiment1(canvas1.current);
    }
  }, []);

  return (
    <div>
      <div>
        <h2 className={styles.title}>Ellipses - Alpha blending, single draw call</h2>
        <div className={styles.card}>
          <canvas ref={canvas1} className={styles.canvas} />
        </div>
      </div>
    </div>
  );
};

export default ShapesPage;
