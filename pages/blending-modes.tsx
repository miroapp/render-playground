import type { NextPage } from "next";
import { useCallback, useEffect, useRef, useState } from "react";
import styles from "../styles/BlendingModesPage.module.css";
import vertexShader from "../experiments/blending-modes/shaders/vertex-shader.glsl";
import fragmentShader from "../experiments/blending-modes/shaders/fragment-shader.glsl";

const CANVAS_WIDTH = 200;
const CANVAS_HEIGHT = 200;

function experiment1(canvas: HTMLCanvasElement, colors: string[]) {
  const ctx = canvas.getContext("2d");

  if (!ctx) return;

  canvas.width = CANVAS_WIDTH;
  canvas.height = CANVAS_HEIGHT;

  ctx.save();
  ctx.fillStyle = colors[0];
  ctx.fillRect(50, 20, 100, 100);
  ctx.restore();

  ctx.save();
  ctx.fillStyle = colors[1];
  ctx.fillRect(80, 50, 100, 100);
  ctx.restore();

  ctx.save();
  ctx.fillStyle = colors[2];
  ctx.fillRect(20, 80, 100, 100);
  ctx.restore();
}

function experiment2(
  canvas: HTMLCanvasElement,
  options: {
    colors: [number, number, number, number][];
    premultipliedAlpha: boolean;
    blend: boolean;
    depthTest: boolean;
  }
) {
  console.log(options.premultipliedAlpha);
  const gl = canvas.getContext("webgl", {
    premultipliedAlpha: options.premultipliedAlpha,
  });

  if (!gl) return;

  canvas.width = CANVAS_WIDTH;
  canvas.height = CANVAS_HEIGHT;

  // prettier-ignore
  const vertices = [
    -0.5, 0.5, 0.0,
    -0.5, -0.5, 0.0,
    0.5, -0.5, 0.0,
    0.5, 0.5, 0.0
  ]

  const indices = [3, 2, 1, 3, 1, 0];

  function init(gl: WebGLRenderingContext) {
    gl[options.blend ? "enable" : "disable"](gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl[options.depthTest ? "enable" : "disable"](gl.DEPTH_TEST);

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

    // Create buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

    const coords = gl.getAttribLocation(program, "coordinates");
    gl.vertexAttribPointer(coords, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(coords);

    gl.clearColor(0.0, 0.0, 0.0, 0.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.viewport(0, 0, canvas.width, canvas.height);

    return program;
  }

  function fillRect(
    gl: WebGLRenderingContext,
    program: WebGLProgram,
    translate: [number, number, number, number],
    color: [number, number, number, number]
  ) {
    const fragColor = gl.getUniformLocation(program, "u_fragColor");
    gl.uniform4f(fragColor, ...color);

    const translation = gl.getUniformLocation(program, "translation");
    gl.uniform4f(translation, ...translate);

    gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
  }

  const program = init(gl);

  fillRect(gl, program, [0, 0.25, 0, 0], options.colors[0]);
  fillRect(gl, program, [0.25, 0, 0, 0], options.colors[1]);
  fillRect(gl, program, [-0.25, -0.25, 0, 0], options.colors[2]);
}

function experiment3(canvas: HTMLCanvasElement, colors: string[]) {
  const ctx = canvas.getContext("2d");

  if (!ctx) return;

  canvas.width = CANVAS_WIDTH;
  canvas.height = CANVAS_HEIGHT;

  ctx.save();
  ctx.fillStyle = colors[0];
  ctx.fillRect(50, 20, 100, 100);
  ctx.restore();

  ctx.save();
  ctx.fillStyle = colors[1];
  ctx.fillRect(80, 50, 100, 100);
  ctx.restore();

  ctx.save();
  ctx.fillStyle = colors[2];
  ctx.fillRect(20, 80, 100, 100);
  ctx.restore();

  ctx.save();
  ctx.fillStyle = colors[3];
  ctx.fillRect(30, 90, 100, 100);
  ctx.restore();
}

function experiment4(
  canvas: HTMLCanvasElement,
  options: {
    colors: [number, number, number, number][];
    premultipliedAlpha: boolean;
    blend: boolean;
    depthTest: boolean;
  }
) {
  console.log(options.premultipliedAlpha);
  const gl = canvas.getContext("webgl", {
    premultipliedAlpha: options.premultipliedAlpha,
  });

  if (!gl) return;

  canvas.width = CANVAS_WIDTH;
  canvas.height = CANVAS_HEIGHT;

  // prettier-ignore
  const vertices = [
    -0.5, 0.5, 0.0,
    -0.5, -0.5, 0.0,
    0.5, -0.5, 0.0,
    0.5, 0.5, 0.0
  ]

  const indices = [3, 2, 1, 3, 1, 0];

  function init(gl: WebGLRenderingContext) {
    gl[options.blend ? "enable" : "disable"](gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl[options.depthTest ? "enable" : "disable"](gl.DEPTH_TEST);

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

    // Create buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

    const coords = gl.getAttribLocation(program, "coordinates");
    gl.vertexAttribPointer(coords, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(coords);

    gl.clearColor(0.0, 0.0, 0.0, 0.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.viewport(0, 0, canvas.width, canvas.height);

    return program;
  }

  function fillRect(
    gl: WebGLRenderingContext,
    program: WebGLProgram,
    translate: [number, number, number, number],
    color: [number, number, number, number]
  ) {
    const fragColor = gl.getUniformLocation(program, "u_fragColor");
    gl.uniform4f(fragColor, ...color);

    const translation = gl.getUniformLocation(program, "translation");
    gl.uniform4f(translation, ...translate);

    gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
  }

  const program = init(gl);

  fillRect(gl, program, [-0.15, -0.35, -0.3, 0], options.colors[3]);
  // gl.disable(gl.DEPTH_TEST)
  fillRect(gl, program, [0, 0.25, 0, 0], options.colors[0]);
  fillRect(gl, program, [0.25, 0, -0.1, 0], options.colors[1]);
  fillRect(gl, program, [-0.25, -0.25, -0.2, 0], options.colors[2]);
}


const BlendingModesPage: NextPage = () => {
  const canvas1 = useRef<HTMLCanvasElement>(null);
  const canvas2 = useRef<HTMLCanvasElement>(null);
  const canvas3 = useRef<HTMLCanvasElement>(null);
  const canvas4 = useRef<HTMLCanvasElement>(null);
  const canvas5 = useRef<HTMLCanvasElement>(null);
  const canvas6 = useRef<HTMLCanvasElement>(null);
  const canvas7 = useRef<HTMLCanvasElement>(null);
  const canvas8 = useRef<HTMLCanvasElement>(null);

  const [premultipliedAlpha, setPremultipliedAlpha] = useState(true);
  const [blend, setBlend] = useState(true);
  const [depthTest, setDepthTest] = useState(false);
  const resetKey = `${premultipliedAlpha}|${blend}|${depthTest}`

  const handlePremultipliedAlphaClick = useCallback(() => {
    setPremultipliedAlpha(!premultipliedAlpha);
  }, [premultipliedAlpha]);

  const handleBlendClick = useCallback(() => {
    setBlend(!blend);
  }, [blend]);

  const handleDepthTestClick = useCallback(() => {
    setDepthTest(!depthTest);
  }, [depthTest]);

  useEffect(() => {
    if (canvas1.current) {
      experiment1(canvas1.current, ["#FF000080", "#00FF0080", "#0000FF80"]);
    }
    if (canvas2.current) {
      experiment1(canvas2.current, ["#00FF0080", "#0000FF80", "#FF000080"]);
    }
    if (canvas3.current) {
      experiment1(canvas3.current, ["#0000FF80", "#FF000080", "#00FF0080"]);
    }
    if (canvas4.current) {
      experiment2(canvas4.current, {
        premultipliedAlpha,
        blend,
        depthTest,
        colors: [
          [1, 0, 0, 0.5],
          [0, 1, 0, 0.5],
          [0, 0, 1, 0.5],
        ],
      });
    }
    if (canvas5.current) {
      experiment2(canvas5.current, {
        premultipliedAlpha,
        blend,
        depthTest,
        colors: [
          [0, 1, 0, 0.5],
          [0, 0, 1, 0.5],
          [1, 0, 0, 0.5],
        ],
      });
    }
    if (canvas6.current) {
      experiment2(canvas6.current, {
        premultipliedAlpha,
        blend,
        depthTest,
        colors: [
          [0, 0, 1, 0.5],
          [1, 0, 0, 0.5],
          [0, 1, 0, 0.5],
        ],
      });
    }
    if (canvas8.current) {
      experiment4(canvas8.current, {
        premultipliedAlpha,
        blend,
        depthTest,
        colors: [
          [0, 0, 1, .8],
          [1, 0, 0, 0.5],
          [0, 1, 0, 0.5],
          [1, 0, 0, 1]
        ],
      });
    }
    if (canvas7.current) {
      experiment3(canvas7.current, ["#0000FFff", "#FF000080", "#00FF0080", "#ff0000ff"])
    }
  }, [premultipliedAlpha, blend, depthTest]);

  return (
    <div>
      <div>
        <h2 className={styles.title}>Canvas 2D Blending (50% opacity)</h2>
        <div className={styles.card}>
          <canvas ref={canvas1} className={styles.canvas} />
        </div>
        <div className={styles.card}>
          <canvas ref={canvas2} className={styles.canvas} />
        </div>
        <div className={styles.card}>
          <canvas ref={canvas3} className={styles.canvas} />
        </div>
        <div className={styles.card}>
          <canvas key={`canvas-7-${resetKey}`} ref={canvas7} className={styles.canvas} />
        </div>
      </div>
      <div>
        <h2 className={styles.title}>Canvas WebGL Blending</h2>
        <div>
          <label className={styles.option}>
            <input
              type="checkbox"
              onClick={handlePremultipliedAlphaClick}
              defaultChecked={premultipliedAlpha}
            />
            Premultiplied Alpha
          </label>
          <label className={styles.option}>
            <input
              type="checkbox"
              onClick={handleBlendClick}
              defaultChecked={blend}
            />
            Blend
          </label>
          <label className={styles.option}>
            <input
              type="checkbox"
              onClick={handleDepthTestClick}
              defaultChecked={depthTest}
            />
            Depth Test
          </label>
        </div>
        <div className={styles.card}>
          <canvas key={`canvas-4-${resetKey}`} ref={canvas4} className={styles.canvas} />
        </div>
        <div className={styles.card}>
          <canvas key={`canvas-5-${resetKey}`} ref={canvas5} className={styles.canvas} />
        </div>
        <div className={styles.card}>
          <canvas key={`canvas-6-${resetKey}`} ref={canvas6} className={styles.canvas} />
        </div>
        <div className={styles.card}>
          <canvas key={`canvas-8-${resetKey}`} ref={canvas8} className={styles.canvas} />
        </div>
      
      </div>
    </div>
  );
};

export default BlendingModesPage;
