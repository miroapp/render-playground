/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable @next/next/no-img-element */
import type { NextPage } from "next";
import { useEffect, useRef } from "react";
import styles from "./points_page_style.module.css";
import vertexShader from "./shaders/points-vertex.glsl";
import fragmentShader from "./shaders/points-fragment.glsl";
import { clear, createProgram, setVertexAttribute } from "../../modules/webgl-utils";
import { mat4, vec3 } from "gl-matrix";

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 640;
const NUM_POINTS = 10000000;

function experiment(
  canvas: HTMLCanvasElement,
  pointsCount: number = NUM_POINTS,
  icon = document.getElementById("icon") as HTMLImageElement
) {
  const gl = canvas.getContext("webgl");

  if (!gl) return;

  canvas.width = CANVAS_WIDTH;
  canvas.height = CANVAS_HEIGHT;

  const positionData: number[] = [];
  for (let index = 0; index < NUM_POINTS; index++) {
    positionData.push(
      // x
      (Math.random() - 0.5) * 8,
      // y
      (Math.random() - 0.5) * 8,
      // z
      (Math.random() - 0.5) * 8
    );
  }

  const program = createProgram(gl, vertexShader, fragmentShader);
  const u_projection = gl.getUniformLocation(program, "u_camera");

  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, icon);
  gl.generateMipmap(gl.TEXTURE_2D);

  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positionData), gl.STATIC_DRAW);

  // gl.clearColor(0.0, 0.0, 0.0, 0.0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  gl.enable(gl.BLEND);
  // gl.disable(gl.DEPTH_TEST);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  // Create buffers
  setVertexAttribute(gl, program, "a_position", 3, positionData);

  const pMatrix = mat4.create();
  const vMatrix = mat4.create();
  const ivMatrix = mat4.create();
  const mMatrix = mat4.create();
  const mvMatrix = mat4.create();
  const mvpMatrix = mat4.create();
  const position = vec3.create();

  mat4.perspective(pMatrix, Math.PI * 0.35, canvas.width / canvas.height, 0.01, 100000.0);

  vec3.set(position, 0.0, 0.0, 0.0);

  let angle = 0.0;
  let frameId = 0;

  function draw(now: number) {
    gl!.viewport(0, 0, canvas.width, canvas.height);
    gl!.clear(gl!.COLOR_BUFFER_BIT);
    mat4.perspective(pMatrix, Math.PI * 0.35, canvas.width / canvas.height, 0.01, 1000.0);
    angle += 0.0005;
    // P * V * M
    // mat4.translate(mvpMatrix, mvpMatrix, position);
    // mat4.identity(mMatrix)

    position[2] = Math.sin(now / 50000);

    mat4.identity(vMatrix);
    mat4.translate(vMatrix, vMatrix, position);
    mat4.rotateX(vMatrix, vMatrix, angle);
    mat4.rotateY(vMatrix, vMatrix, angle);
    mat4.rotateZ(vMatrix, vMatrix, angle);

    mat4.invert(ivMatrix, vMatrix);

    mat4.multiply(mvMatrix, ivMatrix, mMatrix);
    mat4.multiply(mvpMatrix, pMatrix, mvMatrix);

    gl!.uniformMatrix4fv(u_projection, false, mvpMatrix);
    gl!.drawArrays(gl!.POINTS, 0, pointsCount);
    frameId = window.requestAnimationFrame(draw);
  }
  frameId = window.requestAnimationFrame(draw);
}

const PointsSprite: NextPage = () => {
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvas.current) {
      experiment(canvas.current);
    }
  }, []);
  const FORMATTED_NUM_POINTS = NUM_POINTS.toLocaleString();
  return (
    <div>
      <div>
        <h2 className={styles.title}>{FORMATTED_NUM_POINTS} Points - single draw call</h2>
        <img
          src="DATA:image/png;base64,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"
          hidden
          id="icon"
        />
        <canvas ref={canvas} className={styles.canvas} />
      </div>
    </div>
  );
};

export default PointsSprite;
