/** Create the WebGL program for the given context and shaders */
function createProgram(
  gl: WebGLRenderingContext,
  vertexShader: string,
  fragmentShader: string
): WebGLProgram {
  // Enable depth test and blending
  gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

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

  return program;
}

/** Create, bind, and enable a vertex attribute */
function setVertexAttribute(
  gl: WebGLRenderingContext,
  program: WebGLProgram,
  name: string,
  size: number,
  data: number[]
): void {
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);

  const location = gl.getAttribLocation(program, name);
  gl.vertexAttribPointer(location, size, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(location);
}

/** Create and bind the indices */
function setIndices(gl: WebGLRenderingContext, data: number[]): void {
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(data), gl.STATIC_DRAW);
}

/** Clear the WebGL context */
function clear(gl: WebGLRenderingContext): void {
  gl.clearColor(0.0, 0.0, 0.0, 0.0);
  gl.clear(gl.COLOR_BUFFER_BIT);
}

/** Render the WebGL context on the canvas */
function draw(gl: WebGLRenderingContext, canvas: HTMLCanvasElement, nIndices: number): void {
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.drawElements(gl.TRIANGLES, nIndices, gl.UNSIGNED_SHORT, 0);
}

export { clear, createProgram, draw, setIndices, setVertexAttribute };
