const shaders = {
    // <!-- this shader is used to implement simple batching -->
    "shader.vert": `
          attribute vec2 vertexPosition;
          attribute vec4 vertexColor;
          varying vec4 color;
          void main()
          {
            color = vertexColor;
            gl_Position = vec4(vertexPosition, 0, 1);
          }`,

    "shader.frag": `
          precision mediump float;
          varying vec4 color;
          void main()
          {
            gl_FragColor = color;
          }`,
    // <!-- this shader is basically a copy of a batch shader just to test shader switches -->
    "batch2.vert": `
          attribute vec2 vertexPosition;
          attribute vec4 vertexColor;
          varying vec4 color;
          void main()
          {
              color = vertexColor;
              gl_Position = vec4(vertexPosition, 1, 1);
          }`,
    "batch2.frag": `
          precision mediump float;
          varying vec4 color;
          void main()
          {
              gl_FragColor = color;
          }`,
    //<!-- this shader is to implement instancing -->
    "instancing.vert": `
          attribute vec2 vertexPosition;
          // per quad
          attribute vec2 vertexOffset;
          attribute vec2 vertexScale;
          attribute vec4 vertexColor;
          varying vec4 color;
          void main()
          {
              color = vertexColor;
              gl_Position = vec4(vertexPosition * vertexScale + vertexOffset, 0, 1);
          }`,
    "instancing.frag": `
          precision mediump float;
          varying vec4 color;
          void main()
          {
              gl_FragColor = color;
          }`,
    //<!-- this shader is to test effect of branching -->
    "branching.vert": `
          attribute vec2 vertexPosition;
          attribute vec4 vertexColor;
          varying vec4 color;
          void main()
          {
              color = vertexColor;
              float z = 0.0;
              // 0.2 .. 0.7
              if (vertexColor.a > 0.49) {
                  z = 3.9;
              } else if (vertexColor.a > 0.50) {
                  z = 4.0;
              } else if (vertexColor.a > 0.51) {
                  z = 4.1;
              } else if (vertexColor.a > 0.52) {
                  z = 4.2;
              } else if (vertexColor.a > 0.53) {
                  z = 4.3;
              } else if (vertexColor.a > 0.54) {
                  z = 4.4;
              } else if (vertexColor.a > 0.55) {
                  z = 4.5;
              } else if (vertexColor.a > 0.56) {
                  z = 4.6;
              } else if (vertexColor.a > 0.57) {
                  z = 4.7;
              } else {
                  z = 0.0;
              }
              gl_Position = vec4(vertexPosition, z, 1);
          }`,
    "branching.frag": `
          precision mediump float;
          varying vec4 color;
          void main()
          {
              float a = 0.0;
              if (color.a > 0.3) {
                  a = 0.3;
              } else if (color.a > 0.31) {
                  a = 0.31;
              } else if (color.a > 0.32) {
                  a = 0.32;
              } else if (color.a > 0.33) {
                  a = 0.33;
              } else if (color.a > 0.34) {
                  a = 0.34;
              } else if (color.a > 0.35) {
                  a = 0.35;
              } else if (color.a > 0.36) {
                  a = 0.36;
              } else if (color.a > 0.37) {
                  a = 0.37;
              } else if (color.a > 0.38) {
                  a = 0.38;
              } else if (color.a > 0.39) {
                  a = 0.39;
              } else if (color.a > 0.40) {
                  a = 0.40;
              } else if (color.a > 0.41) {
                  a = 0.41;
              } else if (color.a > 0.42) {
                  a = 0.42;
              } else if (color.a > 0.43) {
                  a = 0.43;
              } else if (color.a > 0.44) {
                  a = 0.44;
              } else if (color.a > 0.45) {
                  a = 0.45;
              } else if (color.a > 0.46) {
                  a = 0.46;
              } else if (color.a > 0.47) {
                  a = 0.47;
              } else if (color.a > 0.48) {
                  a = 0.48;
              } else if (color.a > 0.49) {
                  a = 0.49;
              } else if (color.a > 0.50) {
                  a = 0.50;
              } else if (color.a > 0.51) {
                  a = 0.51;
              } else if (color.a > 0.52) {
                  a = 0.52;
              } else if (color.a > 0.53) {
                  a = 0.53;
              } else if (color.a > 0.54) {
                  a = 0.54;
              } else if (color.a > 0.55) {
                  a = 0.55;
              } else if (color.a > 0.56) {
                  a = 0.56;
              } else if (color.a > 0.57) {
                  a = 0.57;
              } else {
                  a = 0.1;
              }
              gl_FragColor = vec4(color.rgb, a);
          }`,
};
const STATE = {
    // amount of quads to allocate buffers for
    MAX_QUADS: 2000000,

    // amount of quads to be added to buffers and rendered
    QUAD_COUNT: 2000000,

    // this is amount of degenerate quads (triangles) to add to the start and to the end of buffer
    DEGEN_START_COUNT: 0,
    DEGEN_END_COUNT: 0,

    // testing how update buffer in GPU every frame affects performance
    UPDATE_BATCH_EVERY_FRAME: false,
    // this is to test how amount of actual draw calls affects performance
    // works only for batching
    // also this need to be enabled to test shader switches
    // as they occur every drawCall if SWITCH_SHADERS_FOR_EACH_DRAW_CALL is enabled
    SEPARATE_DRAW_CALLS: false,
    // if SEPARATE_DRAW_CALLS if set to true, this option specifies
    // how many quads should be rendered per drawCall
    HOW_MANY_QUADS_PER_CALL: 20,
    // this is to test how switching shader for every drawCall affects performance
    // this flag only works if SEPARATE_DRAW_CALLS is set to true
    // shader switch occur once per drawCall which is affected by HOW_MANY_QUADS_PER_CALL option
    SWITCH_SHADERS_FOR_EACH_DRAW_CALL: false,
    // this is to test how instancing affects performance
    // SEPARATE_DRAW_CALLS and SWITCH_SHADERS_FOR_EACH_DRAW_CALL do not work with instancing enabled
    USE_INSTANCING: false,
    // this is mainly to test how amount of pixels filled by GPU affect performance
    // since quads are transparent, random placed quads are overlapping
    // this results in a scene with huge amount of Fillrate (https://en.wikipedia.org/wiki/Fillrate)
    // NOTE: random is deterministic and page refresh should produce same scene
    USE_RANDOM_PLACING: false,
    // this is to test how branches in shader affect performance
    USE_SHADER_BRANCHING: true,
    // this is to test effect of triangle strips instead of triangles
    // works only with USE_INSTANCING set to true
    // TODO make this work with batching
    USE_TRIANGLE_STRIP: true,
};

// this is constants needed to actually bind attributes to their respective buffers
let ramBuffer: Float32Array
// batching
const VERTEX_STRIDE = 2 + 4; // amount of floats per vertex
const QUAD_STRIDE = 6 * VERTEX_STRIDE; // one quad have 6 vertices, since we use gl.TRIANGLES
const QUAD_STRIDE_IN_BYTES = QUAD_STRIDE * Float32Array.BYTES_PER_ELEMENT; // amount of bytes per quad

// instancing
const INSTANCE_STRIDE = 2 + 2 + 4; // amount of floats per instance
const INSTANCE_STRIDE_IN_BYTES =
    INSTANCE_STRIDE * Float32Array.BYTES_PER_ELEMENT; // amount of bytes per instance

// here we just setting up canvas get a webgl context and some extentions
let canvas: HTMLCanvasElement;
let gl, gl_inst;

let mainShader, shaderForSwitch;

let buffer; // buffer with vertices (or instances for instancing)
let quadsCount = 0; // amount of quad currenly added to the buffer

let instancedQuadBuffer; // this one is only needed to instanciate quads as geometry

// fps output
let lastFrameTimestamp = 0;
const fpsElement = document.getElementById("fps");

initRand();
setupCanvas();
setupWebGL();
setupShaders();
allocBuffer();
fillBuffer();

function setupCanvas() {
    canvas = document.getElementById("scene") as HTMLCanvasElement;

    const dpr = window.devicePixelRatio;
    const screenWidth = document.body.clientWidth;
    const screenHeight = document.body.clientHeight;

    canvas.width = screenWidth * dpr;
    canvas.height = screenHeight * dpr;

    canvas.style.width = screenWidth + "px";
    canvas.style.height = screenHeight + "px";
}

function setupWebGL() {
    gl = canvas.getContext("webgl", {
        alpha: false,
        premultipliedAlpha: false,
        stencil: false,
        depth: false,
        antialias: false,
        powerPreference: "low-power",
    });
    gl_inst = gl.getExtension("ANGLE_instanced_arrays");

    gl.viewport(0.0, 0.0, canvas.width, canvas.height);

    gl.disable(gl.DEPTH_TEST);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.enable(gl.BLEND);

    gl.clearColor(0.3, 0.55, 0.9, 1);
}

function setupShaders() {
    if (STATE.USE_SHADER_BRANCHING) {
        mainShader = compileShader(
            "branching",
            [],
            ["vertexPosition", "vertexColor"]
        );
    } else if (STATE.USE_INSTANCING) {
        mainShader = compileShader(
            "instancing",
            [],
            ["vertexPosition", "vertexOffset", "vertexScale", "vertexColor"]
        );
    } else {
        mainShader = compileShader(
            "shader",
            [],
            ["vertexPosition", "vertexColor"]
        );
    }
    shaderForSwitch = compileShader(
        "batch2",
        [],
        ["vertexPosition", "vertexColor"]
    );

    mainShader.use();
}

// this function adds quad to the buffer in order to render it
function addQuad(x, y, width, height, r, g, b, a) {
    if (quadsCount >= STATE.MAX_QUADS) {
        throw new Error("overflow");
    }

    if (STATE.USE_INSTANCING) {
        // if we use instancing we have just add data describing the instance
        const data = new Float32Array([x, y, width, height, r, g, b, a]);

        // uploading data to GPU
        gl.bufferSubData(
            gl.ARRAY_BUFFER,
            quadsCount * INSTANCE_STRIDE_IN_BYTES,
            data
        );
        // and to our RAM buffer
        ramBuffer.set(data, quadsCount * INSTANCE_STRIDE);
    } else {
        // in case we don't use instancing we have to duplicate our data
        // for every vertex of the quad
        const data = new Float32Array([
            x,
            y,
            r,
            g,
            b,
            a,

            x + width,
            y,
            r,
            g,
            b,
            a,

            x,
            y + height,
            r,
            g,
            b,
            a,

            x + width,
            y,
            r,
            g,
            b,
            a,

            x,
            y + height,
            r,
            g,
            b,
            a,

            x + width,
            y + height,
            r,
            g,
            b,
            a,
        ]);

        // uploading data to GPU
        gl.bufferSubData(
            gl.ARRAY_BUFFER,
            quadsCount * QUAD_STRIDE_IN_BYTES,
            data
        );
        // and to our RAM buffer
        ramBuffer.set(data, quadsCount * QUAD_STRIDE);
    }

    quadsCount++;
}

// this function give coordinates to place quads in a grid
function getRectByNum(num, max_rects) {
    const quads_in_a_row = Math.floor(Math.sqrt(max_rects));

    const screen_padding = 0.15;

    const length = 2 - screen_padding * 2;
    const quad_size = length / quads_in_a_row;
    const padding = quad_size * 0.05;

    const x_num = num % quads_in_a_row;
    const y_num = Math.floor(num / quads_in_a_row);

    return {
        x: -1 + screen_padding + x_num * quad_size,
        y: -1 + screen_padding + y_num * quad_size,
        width: quad_size - padding,
        height: quad_size - padding,
    };
}

// here we create our quads using current placing plan
function fillBuffer() {
    for (let i = 0; i < STATE.DEGEN_START_COUNT; i++) {
        addQuad(0, 0, 0, 0, 0, 0, 0, 0);
    }
    for (let i = 0; i < STATE.QUAD_COUNT; i++) {
        let x, y, width, height;
        if (STATE.USE_RANDOM_PLACING) {
            width = randomRange(0.05, 0.2) * 1;
            height = randomRange(0.05, 0.2) * 1;
            x = randomRange(-1, 1 - width);
            y = randomRange(-1, 1 - height);
        } else {
            ({ x, y, width, height } = getRectByNum(i, STATE.QUAD_COUNT));
        }
        const r = randomRange(0, 1);
        const g = randomRange(0, 1);
        const b = randomRange(0, 1);
        const a = randomRange(0.2, 0.7);
        addQuad(x, y, width, height, r, g, b, a);
    }
    for (let i = 0; i < STATE.DEGEN_END_COUNT; i++) {
        addQuad(0, 0, 0, 0, 0, 0, 0, 0);
    }
}

function outputFPS(timestamp) {
    const frameTime = Math.max(timestamp - lastFrameTimestamp, 1);
    const fps = 1000 / frameTime; // TODO this needs to be more accured
    lastFrameTimestamp = timestamp;
    fpsElement.textContent = `${Math.round(fps)} FPS`;
}

function draw(timestamp) {
    outputFPS(timestamp);

    if (STATE.UPDATE_BATCH_EVERY_FRAME) {
        // upload buffer to GPU
        // only existing quads, not whole allocated buffer
        // this is why we need to create another view into our RAM buffer
        gl.bufferSubData(
            gl.ARRAY_BUFFER,
            0,
            new Float32Array(
                ramBuffer.buffer,
                0,
                quadsCount * (STATE.USE_INSTANCING ? INSTANCE_STRIDE : QUAD_STRIDE)
            )
        );
    }

    // filling render target with our blank color
    gl.clear(gl.COLOR_BUFFER_BIT);

    if (quadsCount > 0) {
        if (STATE.USE_INSTANCING) {
            // draw all quads using instancing method
            if (STATE.USE_TRIANGLE_STRIP) {
                gl_inst.drawArraysInstancedANGLE(
                    gl.TRIANGLE_STRIP,
                    0,
                    4,
                    quadsCount
                );
            } else {
                gl_inst.drawArraysInstancedANGLE(gl.TRIANGLES, 0, 6, quadsCount);
            }
        } else {
            if (STATE.SEPARATE_DRAW_CALLS) {
                // drawing quads in muliple draw calls
                let currentShader = mainShader;
                for (
                    let quadNum = 0;
                    quadNum < quadsCount;
                    quadNum += STATE.HOW_MANY_QUADS_PER_CALL
                ) {
                    if (STATE.SWITCH_SHADERS_FOR_EACH_DRAW_CALL) {
                        // choosing another shader
                        currentShader =
                            currentShader === mainShader ? shaderForSwitch : mainShader;
                        currentShader.use();
                        // we also have to describe all of our attributes after shader switch
                        describeBuffer(currentShader);
                    }
                    // doing our drawCall
                    gl.drawArrays(
                        gl.TRIANGLES,
                        quadNum * 6,
                        6 * STATE.HOW_MANY_QUADS_PER_CALL
                    );
                }
            } else {
                // drawing all quads in batch using one drawCall
                gl.drawArrays(gl.TRIANGLES, 0, quadsCount * 6);
            }
        }
    }

    // gl.finish();

    requestAnimationFrame(draw);
}

requestAnimationFrame(draw);

function describeBuffer(shader) {
    if (STATE.USE_INSTANCING) {
        gl.bindBuffer(gl.ARRAY_BUFFER, instancedQuadBuffer);
        gl.vertexAttribPointer(
            mainShader.vertexPosition,
            2,
            gl.FLOAT,
            false,
            2 * Float32Array.BYTES_PER_ELEMENT,
            0 * Float32Array.BYTES_PER_ELEMENT
        );
        gl.enableVertexAttribArray(mainShader.vertexPosition);
        gl_inst.vertexAttribDivisorANGLE(mainShader.vertexPosition, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.vertexAttribPointer(
            mainShader.vertexOffset,
            2,
            gl.FLOAT,
            false,
            INSTANCE_STRIDE_IN_BYTES,
            0 * Float32Array.BYTES_PER_ELEMENT
        );
        gl.enableVertexAttribArray(mainShader.vertexOffset);
        gl_inst.vertexAttribDivisorANGLE(mainShader.vertexOffset, 1);

        gl.vertexAttribPointer(
            mainShader.vertexScale,
            2,
            gl.FLOAT,
            false,
            INSTANCE_STRIDE_IN_BYTES,
            2 * Float32Array.BYTES_PER_ELEMENT
        );
        gl.enableVertexAttribArray(mainShader.vertexScale);
        gl_inst.vertexAttribDivisorANGLE(mainShader.vertexScale, 1);

        gl.vertexAttribPointer(
            mainShader.vertexColor,
            4,
            gl.FLOAT,
            false,
            INSTANCE_STRIDE_IN_BYTES,
            4 * Float32Array.BYTES_PER_ELEMENT
        );
        gl.enableVertexAttribArray(mainShader.vertexColor);
        gl_inst.vertexAttribDivisorANGLE(mainShader.vertexColor, 1);
    } else {
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.vertexAttribPointer(
            mainShader.vertexPosition,
            2,
            gl.FLOAT,
            false,
            VERTEX_STRIDE * Float32Array.BYTES_PER_ELEMENT,
            0 * Float32Array.BYTES_PER_ELEMENT
        );
        gl.enableVertexAttribArray(mainShader.vertexPosition);

        gl.vertexAttribPointer(
            mainShader.vertexColor,
            4,
            gl.FLOAT,
            false,
            VERTEX_STRIDE * Float32Array.BYTES_PER_ELEMENT,
            2 * Float32Array.BYTES_PER_ELEMENT
        );
        gl.enableVertexAttribArray(mainShader.vertexColor);
    }
}

// here we allocaing our buffers for maximum amount of quads possible
function allocBuffer() {
    if (STATE.USE_INSTANCING) {
        instancedQuadBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, instancedQuadBuffer);
        if (STATE.USE_TRIANGLE_STRIP) {
            gl.bufferData(
                gl.ARRAY_BUFFER,
                new Float32Array([0, 0, 1, 0, 0, 1, 1, 1]),
                gl.STATIC_DRAW
            );
        } else {
            gl.bufferData(
                gl.ARRAY_BUFFER,
                new Float32Array([0, 0, 1, 0, 0, 1, 1, 0, 0, 1, 1, 1]),
                gl.STATIC_DRAW
            );
        }

        buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(
            gl.ARRAY_BUFFER,
            STATE.MAX_QUADS * INSTANCE_STRIDE_IN_BYTES,
            gl.STATIC_DRAW
        );
        ramBuffer = new Float32Array(STATE.MAX_QUADS * INSTANCE_STRIDE);
    } else {
        buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(
            gl.ARRAY_BUFFER,
            STATE.MAX_QUADS * QUAD_STRIDE_IN_BYTES,
            gl.STATIC_DRAW
        );

        ramBuffer = new Float32Array(STATE.MAX_QUADS * QUAD_STRIDE);
    }

    describeBuffer(mainShader);
}

// shader util

function compileShader(name, uniforms, attributes) {
    const vertexShaderCode = shaders[name + ".vert"];
    const fragmentShaderCode = shaders[name + ".frag"];

    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

    gl.shaderSource(vertexShader, vertexShaderCode);
    gl.shaderSource(fragmentShader, fragmentShaderCode);

    gl.compileShader(vertexShader);
    if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
        throw ("ERROR compiling vertex shader for " + name + "!\n" +
            gl.getShaderInfoLog(vertexShader))
    }

    gl.compileShader(fragmentShader);
    if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
        throw ("ERROR compiling fragment shader for " + name + "!\n" +
            gl.getShaderInfoLog(fragmentShader))
    }

    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        throw ("ERROR linking program!\n" + gl.getProgramInfoLog(program));
    }
    gl.validateProgram(program);
    if (!gl.getProgramParameter(program, gl.VALIDATE_STATUS)) {
        throw ("ERROR validating program!\n" + gl.getProgramInfoLog(program));
    }

    const instance = {
        program: program,

        use: function () {
            gl.useProgram(this.program);
        },
    };

    uniforms.forEach(function (uniform) {
        instance[uniform] = gl.getUniformLocation(program, uniform);
    });

    attributes.forEach(function (attribute) {
        instance[attribute] = gl.getAttribLocation(program, attribute);
    });

    return instance;
}

// deterministic random

function xmur3(str) {
    for (var i = 0, h = 1779033703 ^ str.length; i < str.length; i++)
        (h = Math.imul(h ^ str.charCodeAt(i), 3432918353)),
            (h = (h << 13) | (h >>> 19));
    return function () {
        h = Math.imul(h ^ (h >>> 16), 2246822507);
        h = Math.imul(h ^ (h >>> 13), 3266489909);
        return (h ^= h >>> 16) >>> 0;
    };
}

function sfc32(a, b, c, d) {
    return function () {
        a >>>= 0;
        b >>>= 0;
        c >>>= 0;
        d >>>= 0;
        var t = (a + b) | 0;
        a = b ^ (b >>> 9);
        b = (c + (c << 3)) | 0;
        c = (c << 21) | (c >>> 11);
        d = (d + 1) | 0;
        t = (t + d) | 0;
        c = (c + t) | 0;
        return (t >>> 0) / 4294967296;
    };
}

var rand;

function initRand() {
    // Create xmur3 state:
    const seed = xmur3("apples");
    // Output four 32-bit hashes to provide the seed for sfc32.
    rand = sfc32(seed(), seed(), seed(), seed());
}

function randomRange(min, max) {
    return min + rand() * (max - min);
}