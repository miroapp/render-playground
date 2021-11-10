import type { NextPage } from "next";
import { useCallback, useEffect, useRef, useState } from "react";
import styles from "../styles/ShapesPage.module.css";
import vertexShader from "../experiments/shapes/shaders/ellipse-vertex.glsl";
import fragmentShader from "../experiments/shapes/shaders/ellipse-fragment.glsl";

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 800;

function experiment1(canvas: HTMLCanvasElement) {
  const gl = canvas.getContext("webgl");

  if (!gl) return;

  canvas.width = CANVAS_WIDTH;
  canvas.height = CANVAS_HEIGHT;

  // prettier-ignore
  const vertices = [
    0.0, 0.0,
    1.0, 0.0,
    0.0, 1.0,
    1.0, 1.0,
  ]

  const indices = [0, 1, 2, 1, 2, 3];

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
    positionData.push(...vertices);

    // Push the indices. Offset by n. of vertices at every new ellipse
    indexData.push(...indices.map((index) => 4 * nEllipses + index));

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

  gl.enable(gl.BLEND);
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
  gl.enable(gl.DEPTH_TEST);

  // Create vertex shader
  const vs = gl.createShader(gl.VERTEX_SHADER)!;
  gl.shaderSource(vs, vertexShader);
  gl.compileShader(vs);

  // Create fragment shader
  const fs = gl.createShader(gl.FRAGMENT_SHADER)!;
  gl.shaderSource(fs, fragmentShader);
  gl.compileShader(fs);

  // Link
  const program = gl.createProgram()!;
  gl.attachShader(program, fs);
  gl.attachShader(program, vs);
  gl.linkProgram(program);
  gl.useProgram(program);

  // Create buffers
  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positionData), gl.STATIC_DRAW);

  const positionLocation = gl.getAttribLocation(program, "position");
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, true, 0, 0);
  gl.enableVertexAttribArray(positionLocation);

  const scaleBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, scaleBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(scaleData), gl.STATIC_DRAW);

  const scaleLocation = gl.getAttribLocation(program, "scale");
  gl.vertexAttribPointer(scaleLocation, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(scaleLocation);

  const translateBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, translateBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(translateData), gl.STATIC_DRAW);

  const translateLocation = gl.getAttribLocation(program, "translate");
  gl.vertexAttribPointer(translateLocation, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(translateLocation);

  const depthBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, depthBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(depthData), gl.STATIC_DRAW);

  const depthLocation = gl.getAttribLocation(program, "depth");
  gl.vertexAttribPointer(depthLocation, 1, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(depthLocation);

  const strokeWidthBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, strokeWidthBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(strokeWidthData), gl.STATIC_DRAW);

  const strokeWidthLocation = gl.getAttribLocation(program, "strokeWidth");
  gl.vertexAttribPointer(strokeWidthLocation, 1, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(strokeWidthLocation);

  const strokeColorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, strokeColorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(strokeColorData), gl.STATIC_DRAW);

  const strokeColorLocation = gl.getAttribLocation(program, "strokeColor");
  gl.vertexAttribPointer(strokeColorLocation, 4, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(strokeColorLocation);

  const fillColorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, fillColorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(fillColorData), gl.STATIC_DRAW);

  const fillColorLocation = gl.getAttribLocation(program, "fillColor");
  gl.vertexAttribPointer(fillColorLocation, 4, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(fillColorLocation);

  const indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexData), gl.STATIC_DRAW);

  gl.clearColor(0.0, 0.0, 0.0, 0.0);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.viewport(0, 0, canvas.width, canvas.height);

  gl.drawElements(gl.TRIANGLES, indexData.length, gl.UNSIGNED_SHORT, 0);
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
