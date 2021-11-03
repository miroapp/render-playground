const MAX_VERTICES = 200000; // this is the maximum amount of vertices we can address without switching vertex buffer
const MAX_TRIANGLES = MAX_VERTICES; // lets just say one triangle have at least 1 unique vertex (quite a stretch actually)
const MAX_INDICES = MAX_TRIANGLES * 3; // but each triangle will still have 3 indices

type ImageSource = HTMLImageElement | HTMLCanvasElement | ImageData

enum PrimitiveType {
    TRIANGLE_WITH_COLOR = 1,
    IMAGE = 2,
    RENDER_TO_TEXTURE = 3
}

const MONSTER_SHADER_ATTRIBUTES = 
[
    {
        name: 'slot1',
        size: 4,
    },
    {
        name: 'slot2',
        size: 4
    }
]

// stride for vertex buffer, this is the maximum highest amount used by any shader included in monster shader

const STRIDE_IN_FLOATS = MONSTER_SHADER_ATTRIBUTES.reduce((acum, entry) => acum + entry.size, 0);
const STRIDE_IN_BYTES = STRIDE_IN_FLOATS * Float32Array.BYTES_PER_ELEMENT;

// here we just setting up canvas get a webgl context and some extentions
let canvas: HTMLCanvasElement;
let gl: WebGLRenderingContext;

let monsterShader;
let dummyTexture

// text generation
const textCanvas = document.createElement('canvas')
textCanvas.width = 1024;
textCanvas.height = 1024;
const textContext = textCanvas.getContext('2d')

let cameraX = 0, cameraY = 0
let scale = 1
const view = new Float32Array(4) // x, y, sx, sy

let ATLAS_SIZE

const SHAPE_STAR = [
    119.96963500976562, 194.0947265625,
    47.98785400390625, 242.618408203125,
    59.98481750488281, 152.84959716796874,
    0, 92.1949951171875,
    83.97874450683594, 80.06407470703125,
    119.96963500976562, 0,
    155.9605255126953, 80.06407470703125,
    239.93927001953125, 92.1949951171875,
    179.95445251464844, 152.84959716796874,
    191.951416015625, 242.618408203125,
    119.96963500976562, 194.0947265625,
    119.96963500976562, 194.0947265625,
]

type Atlas = {
    texture: WebGLTexture
    frameBuffer: WebGLFramebuffer
    shelf: any
    renderInCount: number
}

type Bin = {
    x: number
    y: number
    width: number
    height: number
}

type SpaceInAtlas = {
    atlas: Atlas
    space: Bin
}

type DrawCall = {
    indexCount: number
    textures: WebGLTexture[]
}

type DrawCallBuffer = {
    vertexBuffer: WebGLBuffer
    texIdBuffer: WebGLBuffer
    indexBuffer: WebGLBuffer

    vertexBufferRAM: Float32Array
    texIdBufferRAM: Float32Array
    indexBufferRAM: Uint32Array

    atlases: Atlas[]
    
    nextVertexIndex: number
    nextIndexIndex: number

    drawCalls: DrawCall[]
}

const buffers = [] as DrawCallBuffer[] // vertex buffer + index buffer goes here
let debugTextureWithoutAtlasesMemoryCount: number = 0

let atlasQuads: WebGLBuffer
let atlasQuadsDestUVs: WebGLBuffer
let atlasQuadsDestUVsBuffer: Float32Array;
let atlasQuadsIndices: WebGLBuffer

// fps output
let lastFrameTimestamp = 0;
const fpsElement = document.getElementById("fps");

initRand();
setupCanvas();
setupWebGL();
setupShaders();
setupAtlasRenderer();
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

    canvas.onmousedown = controls_mousedown;
    canvas.onmouseup = controls_mouseup;
    canvas.onmousemove = controls_mousemove;
    canvas.onwheel = controls_wheel;
}

function setupWebGL() {
    gl = (canvas.getContext("webgl", {
        alpha: true,
        premultipliedAlpha: false,
        stencil: false,
        depth: false,
        antialias: false,
        powerPreference: "low-power",
    }));
    // https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/WebGL_best_practices#understand_extension_availability
    gl.getExtension('OES_element_index_uint')
    ATLAS_SIZE = 4096;

    gl.viewport(0.0, 0.0, canvas.width, canvas.height);

    gl.disable(gl.DEPTH_TEST);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.enable(gl.BLEND);

    gl.clearColor(0.3, 0.55, 0.9, 1);
}

function setupAtlasRenderer() {
    const atlasQuadsBuffer = new Float32Array([
        PrimitiveType.RENDER_TO_TEXTURE, 1, 0, 0, 
        PrimitiveType.RENDER_TO_TEXTURE, 1, 1, 0,
        PrimitiveType.RENDER_TO_TEXTURE, 1, 0, 1,
        PrimitiveType.RENDER_TO_TEXTURE, 1, 1, 1,

        PrimitiveType.RENDER_TO_TEXTURE, 2, 0, 0, 
        PrimitiveType.RENDER_TO_TEXTURE, 2, 1, 0,
        PrimitiveType.RENDER_TO_TEXTURE, 2, 0, 1,
        PrimitiveType.RENDER_TO_TEXTURE, 2, 1, 1,

        PrimitiveType.RENDER_TO_TEXTURE, 3, 0, 0, 
        PrimitiveType.RENDER_TO_TEXTURE, 3, 1, 0,
        PrimitiveType.RENDER_TO_TEXTURE, 3, 0, 1,
        PrimitiveType.RENDER_TO_TEXTURE, 3, 1, 1,

        PrimitiveType.RENDER_TO_TEXTURE, 4, 0, 0, 
        PrimitiveType.RENDER_TO_TEXTURE, 4, 1, 0,
        PrimitiveType.RENDER_TO_TEXTURE, 4, 0, 1,
        PrimitiveType.RENDER_TO_TEXTURE, 4, 1, 1,

        PrimitiveType.RENDER_TO_TEXTURE, 5, 0, 0, 
        PrimitiveType.RENDER_TO_TEXTURE, 5, 1, 0,
        PrimitiveType.RENDER_TO_TEXTURE, 5, 0, 1,
        PrimitiveType.RENDER_TO_TEXTURE, 5, 1, 1,
        
        PrimitiveType.RENDER_TO_TEXTURE, 6, 0, 0, 
        PrimitiveType.RENDER_TO_TEXTURE, 6, 1, 0,
        PrimitiveType.RENDER_TO_TEXTURE, 6, 0, 1,
        PrimitiveType.RENDER_TO_TEXTURE, 6, 1, 1,

        PrimitiveType.RENDER_TO_TEXTURE, 7, 0, 0, 
        PrimitiveType.RENDER_TO_TEXTURE, 7, 1, 0,
        PrimitiveType.RENDER_TO_TEXTURE, 7, 0, 1,
        PrimitiveType.RENDER_TO_TEXTURE, 7, 1, 1,

        PrimitiveType.RENDER_TO_TEXTURE, 8, 0, 0, 
        PrimitiveType.RENDER_TO_TEXTURE, 8, 1, 0,
        PrimitiveType.RENDER_TO_TEXTURE, 8, 0, 1,
        PrimitiveType.RENDER_TO_TEXTURE, 8, 1, 1,

        PrimitiveType.RENDER_TO_TEXTURE, 9, 0, 0, 
        PrimitiveType.RENDER_TO_TEXTURE, 9, 1, 0,
        PrimitiveType.RENDER_TO_TEXTURE, 9, 0, 1,
        PrimitiveType.RENDER_TO_TEXTURE, 9, 1, 1,

        PrimitiveType.RENDER_TO_TEXTURE, 10, 0, 0, 
        PrimitiveType.RENDER_TO_TEXTURE, 10, 1, 0,
        PrimitiveType.RENDER_TO_TEXTURE, 10, 0, 1,
        PrimitiveType.RENDER_TO_TEXTURE, 10, 1, 1,

        PrimitiveType.RENDER_TO_TEXTURE, 11, 0, 0, 
        PrimitiveType.RENDER_TO_TEXTURE, 11, 1, 0,
        PrimitiveType.RENDER_TO_TEXTURE, 11, 0, 1,
        PrimitiveType.RENDER_TO_TEXTURE, 11, 1, 1,

        PrimitiveType.RENDER_TO_TEXTURE, 12, 0, 0, 
        PrimitiveType.RENDER_TO_TEXTURE, 12, 1, 0,
        PrimitiveType.RENDER_TO_TEXTURE, 12, 0, 1,
        PrimitiveType.RENDER_TO_TEXTURE, 12, 1, 1,

        PrimitiveType.RENDER_TO_TEXTURE, 13, 0, 0, 
        PrimitiveType.RENDER_TO_TEXTURE, 13, 1, 0,
        PrimitiveType.RENDER_TO_TEXTURE, 13, 0, 1,
        PrimitiveType.RENDER_TO_TEXTURE, 13, 1, 1,

        PrimitiveType.RENDER_TO_TEXTURE, 14, 0, 0, 
        PrimitiveType.RENDER_TO_TEXTURE, 14, 1, 0,
        PrimitiveType.RENDER_TO_TEXTURE, 14, 0, 1,
        PrimitiveType.RENDER_TO_TEXTURE, 14, 1, 1,

        PrimitiveType.RENDER_TO_TEXTURE, 15, 0, 0, 
        PrimitiveType.RENDER_TO_TEXTURE, 15, 1, 0,
        PrimitiveType.RENDER_TO_TEXTURE, 15, 0, 1,
        PrimitiveType.RENDER_TO_TEXTURE, 15, 1, 1,

        PrimitiveType.RENDER_TO_TEXTURE, 16, 0, 0, 
        PrimitiveType.RENDER_TO_TEXTURE, 16, 1, 0,
        PrimitiveType.RENDER_TO_TEXTURE, 16, 0, 1,
        PrimitiveType.RENDER_TO_TEXTURE, 16, 1, 1,
    ])

    atlasQuads = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, atlasQuads)
    gl.bufferData(gl.ARRAY_BUFFER, atlasQuadsBuffer, gl.STATIC_DRAW)

    atlasQuadsDestUVs = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, atlasQuadsDestUVs)
    gl.bufferData(gl.ARRAY_BUFFER, 16 * (4 * 4) * Float32Array.BYTES_PER_ELEMENT, gl.DYNAMIC_DRAW);
    atlasQuadsDestUVsBuffer = new Float32Array(16 * (4 * 4));

    atlasQuadsIndices = gl.createBuffer()
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, atlasQuadsIndices)
    const indices = new Uint16Array(16 * 6);
    let j = 0;
    for (let i = 0; i < indices.length; i += 6) {
        indices[i + 0] = j + 0;
        indices[i + 1] = j + 1;
        indices[i + 2] = j + 2;

        indices[i + 3] = j + 1;
        indices[i + 4] = j + 2;
        indices[i + 5] = j + 3;

        j += 4;
    }
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
}

function fillTexturesWithDummy(offset = 0) {
    for (let i = offset; i < 16; i++) {
        gl.activeTexture(gl.TEXTURE0 + i);
        gl.bindTexture(gl.TEXTURE_2D, dummyTexture);
    }
}

function setupShaders() {
    monsterShader = compileShader(
        "monster",
        ["view", 'textures', 'views'],
        ['texId'].concat(MONSTER_SHADER_ATTRIBUTES.map(entry => entry.name))
    );
    monsterShader.use();
    gl.uniform1iv(monsterShader.textures, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]);

    dummyTexture = gl.createTexture()
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, dummyTexture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 2, 2, 0, gl.RGBA, gl.UNSIGNED_BYTE, undefined)

    fillTexturesWithDummy()
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

function loadImage(url) {
    return new Promise((resolve, reject) => {
        const img = new Image()
        img.onload = () => {
            resolve(img)
        }
        img.onerror = () => reject(url);
        img.src = url;
    })
}

function getElementsPositionsWithoutIntersections(elements) {
    const positions = []

    let dist = 50;
    for (const element of elements) {
        const angle = dist / 25
        const s = Math.sin(angle)
        const c = Math.cos(angle)

        const x = s * dist;
        const y = c * dist;

        positions.push({
            x: canvas.width / 2 + x, 
            y: canvas.height / 2 + y,
            width: element.width,
            height: element.height,
        });

        dist += 5000 / dist
    }

    return positions;
}

function getTextSizeInPixels(text: string, font: string) {
    textContext.font = font;
    const measures = textContext.measureText(text)

    const width = measures.width;
    const height = measures.fontBoundingBoxAscent + measures.fontBoundingBoxDescent;

    return {
        width,
        height
    }
}

function generateRandomText(): string {
    const n1 = Math.round(randomRange(0, 9))
    const n2 = Math.round(randomRange(0, 9))
    const n3 = Math.round(randomRange(0, 9))
    const n4 = Math.round(randomRange(0, 9))
    const n5 = Math.round(randomRange(0, 9))

    return `${n1}M${n2}I${n3}R${n4}O${n5}`
}

function renderText(text: string, font: string, color: string, size) {
    textContext.font = font;
    textContext.fillStyle = color;
    textContext.textAlign = 'left';
    textContext.textBaseline = 'top'
    textContext.clearRect(0, 0, size.width, size.height)
    textContext.fillText(text, 0, 0);
    const data = textContext.getImageData(0, 0, size.width, size.height)
    return data
}

function getShapeSize(points: number[]) {
    let width = 0;
    let height = 0;

    for (let i = 0; i < points.length; i += 2) {
        const x = points[i + 0]
        const y = points[i + 1]

        width = Math.max(width, x);
        height = Math.max(height, y);
    }

    return {
        width,
        height
    }
}

// here we create our quads using current placing plan
async function fillBuffer() {
    const shapes = []

    const shapeSize = getShapeSize(SHAPE_STAR);
    for (let i = 0; i < 30000; i++) {
        shapes.push({
            width: shapeSize.width,
            height: shapeSize.height,
            shape: SHAPE_STAR,
            color: {
                r: randomRange(0, 1),
                g: randomRange(0, 1),
                b: randomRange(0, 1),
                a: randomRange(0.2, 0.8)
            }
        })
    }

    const lines = []
    for (let i = 0; i < 30000; i++) {
        const width = randomRange(10, 500)
        const height = randomRange(10, 500)

        lines.push({
            width,
            height,
            line: {
                width: randomRange(5, 50),
            },
            color: {
                r: randomRange(0, 1),
                g: randomRange(0, 1),
                b: randomRange(0, 1),
                a: randomRange(0.2, 0.8)
            }
        })
    }

    console.time('text rendering')

    const texts = []
    for (let i = 0; i < 1000; i++) {
        const font = `${Math.round(randomRange(8, 128))}px Arial`
        const text = generateRandomText()
        const size = getTextSizeInPixels(text, font);
        const texture = renderText(text, font, '#000000', size);
        texts.push({
            width: size.width,
            height: size.height,
            texture
        })
    }
    console.timeEnd('text rendering')

    const promises = []
    for (let i = 1; i <= 1000; i++) {
        promises.push(loadImage(`images/${i}.jpg`))
    }
    const images = await Promise.all(promises)

    const combination = [].concat(texts, images, shapes, lines);
    for (let i = combination.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp = combination[i];
        combination[i] = combination[j];
        combination[j] = temp;
    }
    const randomCombination = combination;

    const positions = getElementsPositionsWithoutIntersections(randomCombination)

    for (let i = 0; i < randomCombination.length; i++) {
        const element = randomCombination[i]
        const pos = positions[i]
        if (element.line) {
            addLine([pos.x, pos.y, pos.x + element.width, pos.y + element.height], 
                element.line.width, element.line.width,
                element.color.r, element.color.g, element.color.b, element.color.a);
        } else if (element.shape) {
            addShape(SHAPE_STAR, pos.x, pos.y, 
                element.color.r, element.color.g, element.color.b, element.color.a);
        } else {
            addImage(pos.x, pos.y, element.width, element.height, element.texture || element);
        }
    }
}

function outputMemoryAndFPS(timestamp) {
    let memory = 0;
    for (const buffer of buffers) {
        memory += buffer.atlases.length * (ATLAS_SIZE * ATLAS_SIZE * 4)
    }

    const wastedPercent = memory > 0 ? Math.round((1 - (debugTextureWithoutAtlasesMemoryCount / memory)) * 100) : 0;
    const atlasMB = Math.round(memory / (1024 * 1024))

    const fps = Math.round(1000 / (timestamp - lastFrameTimestamp))
    lastFrameTimestamp = timestamp;

    fpsElement.textContent = `${atlasMB} MB fot Atlases, ${wastedPercent}% wasted, FPS: ${fps}`;
}

function updateCamera() {
    view[0] = -canvas.width / 2 - cameraX
    view[1] = -canvas.height / 2 - cameraY
    view[2] =  1 / (canvas.width / 2 / scale)
    view[3] = -1 / (canvas.height / 2 / scale)

    gl.uniform4fv(monsterShader.view, view);
}

function addPrimitiveVertices(primitiveType: PrimitiveType, data: number[], strideInFloats: number,
    indices: number[], image?: ImageSource, uvIndexes?: number[]) {
    const strideInFloatsWithType = strideInFloats + 1
    if (strideInFloatsWithType > STRIDE_IN_FLOATS) {
        throw new Error("Not enough attribute slots.")
    }
    if (data.length % strideInFloats !== 0) {
        throw new Error("Data is not aligned with stride.")
    }

    const vertexCount = data.length / strideInFloats
    const buffer = getBuffer(vertexCount, indices.length)

    const indexData = new Uint32Array(indices.length)
    for (let i = 0; i < indices.length; i++) {
        indexData[i] = buffer.nextVertexIndex + indices[i];
    }

    const texIdData = new Float32Array(vertexCount)
    if (image) {
        if (!uvIndexes) {
            throw new Error("Texture must include UV.")
        }
        const prevAtlasCount = buffer.atlases.length
        const prevAtlasGroup = Math.trunc(prevAtlasCount / 16)

        const { atlas, space } = getSpaceInAtlas(buffer, image.width, image.height)
        addRenderToAtlasQueue(atlas, space, image)

        const tx = space.x / ATLAS_SIZE
        const ty = space.y / ATLAS_SIZE

        const sx = image.width / ATLAS_SIZE
        const sy = image.height / ATLAS_SIZE

        // transform source uv to atlas uv
        for (let i = 0; i < vertexCount; i++) {
            const srcIndex = i * strideInFloats

            data[srcIndex + uvIndexes[0]] = data[srcIndex + uvIndexes[0]] * sx + tx
            data[srcIndex + uvIndexes[1]] = data[srcIndex + uvIndexes[1]] * sy + ty

            texIdData[i] = 1 + (buffer.atlases.indexOf(atlas) % 16) // hack
        }

        const currentAtlasCount = buffer.atlases.length
        const currentAtlasGroup = Math.trunc(currentAtlasCount / 16)

        // ultra hack
        if (currentAtlasGroup !== prevAtlasGroup) {
            buffer.drawCalls.push({
                indexCount: 0,
                textures: []
            })
        }
        
        // new atlas? need to push
        if (currentAtlasCount !== prevAtlasCount) {
            const lastDrawCall = buffer.drawCalls[buffer.drawCalls.length - 1]
            lastDrawCall.textures.push(atlas.texture)
        }
    }

    const vertexData = new Float32Array(vertexCount * STRIDE_IN_FLOATS)
    for (let i = 0; i < vertexCount; i++) {
        const srcIndex = i * strideInFloats
        const dstIndex = i * STRIDE_IN_FLOATS

        vertexData[dstIndex + 0] = primitiveType
        for (let j = 0; j < strideInFloats; j++) {
            vertexData[dstIndex + 1 + j] = data[srcIndex + j]
        }
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, buffer.vertexBuffer)
    gl.bufferSubData(gl.ARRAY_BUFFER, buffer.nextVertexIndex * STRIDE_IN_BYTES, vertexData)
    // buffer.vertexBufferRAM.set(vertexData, buffer.nextVertexIndex * STRIDE_IN_FLOATS);

    gl.bindBuffer(gl.ARRAY_BUFFER, buffer.texIdBuffer)
    gl.bufferSubData(gl.ARRAY_BUFFER, buffer.nextVertexIndex * Float32Array.BYTES_PER_ELEMENT, texIdData)
    // buffer.texIdBufferRAM.set(texIdData, buffer.nextVertexIndex);

    buffer.nextVertexIndex += vertexCount

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer.indexBuffer)
    gl.bufferSubData(gl.ELEMENT_ARRAY_BUFFER, buffer.nextIndexIndex * Uint32Array.BYTES_PER_ELEMENT,
        indexData);
    // buffer.indexBufferRAM.set(indexData, buffer.nextIndexIndex);
    buffer.nextIndexIndex += indices.length

    const lastDrawCall = buffer.drawCalls[buffer.drawCalls.length - 1]
    lastDrawCall.indexCount += indices.length;
}

// мы говорим - добавь изображение
// вот т.е. для нас по сути uv это tuv
// textureId, u, v
// textureId это id текстуры в текущем блоке отрисовки, т.е. от 0 до 15
// u, v также нужно апдейтить исходя из места в атласе

function addImage(x: number, y: number, width: number, height: number, image: HTMLImageElement) {
    addPrimitiveVertices(PrimitiveType.IMAGE,
        [
            x,         y,          0, 0, 0, 0,
            x + width, y,          0, 0, 1, 0,
            x,         y + height, 0, 0, 0, 1,
            x + width, y + height, 0, 0, 1, 1,
        ],
        6,
        [0, 1, 2, 1, 2, 3],
        image,
        [4, 5]
    );
}

function addLine(coordinates: number[], lineWidthInside: number, lineWidthOutside: number,
    r: number, g: number, b: number, a: number) {
    if (coordinates.length % 2 !== 0) {
        throw new Error('Invalid coordinates.')
    }
    const pointsCount = coordinates.length / 2;
    if (pointsCount < 2) {
        throw new Error("Line should consist of two or more points.")
    }

    const vertices = []
    const indices = []

    let startIndex = 0;
    for (let i = 0; i < coordinates.length - 2; i += 2) {
        const x0 = coordinates[i + 0];
        const y0 = coordinates[i + 1];

        const x1 = coordinates[i + 2];
        const y1 = coordinates[i + 3];

        const dx = x1 - x0;
        const dy = y1 - y0;

        const len = Math.sqrt(dx * dx + dy * dy);

        const nx = -dy / len
        const ny =  dx / len

        vertices.push(
            x0 + nx * lineWidthOutside, y0 + ny * lineWidthOutside, 0,
            r, g, b, a,

            x0 - nx * lineWidthInside, y0 - ny * lineWidthInside, 0,
            r, g, b, a,

            x1 + nx * lineWidthOutside, y1 + ny * lineWidthOutside, 0,
            r, g, b, a,

            x1 - nx * lineWidthInside, y1 - ny * lineWidthInside, 0,
            r, g, b, a,
        )

        indices.push(
            startIndex + 0,
            startIndex + 1,
            startIndex + 2,

            startIndex + 1,
            startIndex + 2,
            startIndex + 3,
        )

        startIndex += 4;
    }

    addPrimitiveVertices(PrimitiveType.TRIANGLE_WITH_COLOR, vertices, 7, indices);
}

function addShape(points: number[], x: number, y: number, r: number, g: number, b: number, a: number) {
    const earcut = (window as any).earcut;

    const indices = earcut(points);

    const vertices = [];

    for (let i = 0; i < points.length; i += 2) {
        const vx = points[i + 0] + x;
        const vy = points[i + 1] + y;

        vertices.push(vx, vy, 0, r, g, b, a);
    }

    addPrimitiveVertices(PrimitiveType.TRIANGLE_WITH_COLOR, vertices, 7, indices);
}

function draw(timestamp) {
    scale *= .999;

    outputMemoryAndFPS(timestamp)

    processAtlasGenerationQueue()

    // filling render target with our blank color
    gl.clear(gl.COLOR_BUFFER_BIT);

    updateCamera();

    for (const buffer of buffers) {
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer.indexBuffer)
        describeVertices(buffer.vertexBuffer, buffer.texIdBuffer)

        let offset = 0;
        for (const drawCall of buffer.drawCalls) {
            for (let i = 0; i < drawCall.textures.length; i++) {
                gl.activeTexture(gl.TEXTURE0 + i);
                gl.bindTexture(gl.TEXTURE_2D, drawCall.textures[i])
            }

            gl.drawElements(gl.TRIANGLES, drawCall.indexCount, gl.UNSIGNED_INT, offset);
            offset += drawCall.indexCount * Uint32Array.BYTES_PER_ELEMENT;
        }
    }

    requestAnimationFrame(draw);
}

requestAnimationFrame(draw);

function describeVertices(vertexBuffer: WebGLBuffer, texIdBuffer: WebGLBuffer) {
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer)
    let offset = 0
    for (const attributeDesc of MONSTER_SHADER_ATTRIBUTES) {
        const attributeIndex = monsterShader[attributeDesc.name]
        gl.vertexAttribPointer(
            attributeIndex,
            attributeDesc.size,
            gl.FLOAT,
            false,
            STRIDE_IN_BYTES,
            offset * Float32Array.BYTES_PER_ELEMENT
        );
        gl.enableVertexAttribArray(attributeIndex);
        offset += attributeDesc.size
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, texIdBuffer)
    gl.vertexAttribPointer(
        monsterShader.texId,
        1,
        gl.FLOAT,
        false,
        Float32Array.BYTES_PER_ELEMENT,
        0
    );
    gl.enableVertexAttribArray(monsterShader.texId);
}

function describeVerticesForAtlas(quadsBuffer: WebGLBuffer, quadsDestUVsBuffer: WebGLBuffer) {
    for (const attributeDesc of MONSTER_SHADER_ATTRIBUTES) {
        const attributeIndex = monsterShader[attributeDesc.name]
        gl.disableVertexAttribArray(attributeIndex);
    }
    gl.disableVertexAttribArray(monsterShader.texId);

    gl.bindBuffer(gl.ARRAY_BUFFER, quadsBuffer);
    gl.vertexAttribPointer(
        monsterShader.slot1,
        4,
        gl.FLOAT,
        false,
        4 * Float32Array.BYTES_PER_ELEMENT,
        0 * Float32Array.BYTES_PER_ELEMENT
    );
    gl.enableVertexAttribArray(monsterShader.slot1);

    gl.bindBuffer(gl.ARRAY_BUFFER, quadsDestUVsBuffer);
    gl.vertexAttribPointer(
        monsterShader.slot2,
        4,
        gl.FLOAT,
        false,
        4 * Float32Array.BYTES_PER_ELEMENT,
        0 * Float32Array.BYTES_PER_ELEMENT
    );
    gl.enableVertexAttribArray(monsterShader.slot2);
}

function allocBuffer(): DrawCallBuffer {
    const vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(
        gl.ARRAY_BUFFER,
        MAX_VERTICES * STRIDE_IN_BYTES,
        gl.STREAM_DRAW
    );
    const vertexBufferRAM = new Float32Array(MAX_VERTICES * STRIDE_IN_FLOATS);

    const texIdBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texIdBuffer);
    gl.bufferData(
        gl.ARRAY_BUFFER,
        MAX_VERTICES * Float32Array.BYTES_PER_ELEMENT,
        gl.STREAM_DRAW
    );
    const texIdBufferRAM = new Float32Array(MAX_VERTICES);

    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(
        gl.ELEMENT_ARRAY_BUFFER,
        MAX_INDICES * Uint32Array.BYTES_PER_ELEMENT,
        gl.STREAM_DRAW
    );

    const indexBufferRAM = new Uint32Array(MAX_INDICES)

    const buffer = {
        vertexBuffer,
        texIdBuffer,
        indexBuffer,
        vertexBufferRAM,
        texIdBufferRAM,
        indexBufferRAM,
        atlases: [],
        nextVertexIndex: 0,
        nextIndexIndex: 0,
        drawCalls: [
            {
                indexCount: 0,
                textures: []
            }
        ]
    } as DrawCallBuffer

    buffers.push(buffer)

    return buffer
}

function getBuffer(requiredVertices: number, requiredIndices: number): DrawCallBuffer {
    const lastBuffer = buffers[buffers.length - 1]
    if (!lastBuffer) {
        return allocBuffer()
    }
    
    const remainingVertices = MAX_VERTICES - lastBuffer.nextVertexIndex
    const remainingIndices = MAX_INDICES - lastBuffer.nextIndexIndex

    if (remainingVertices < requiredVertices || remainingIndices < requiredIndices) {
        return allocBuffer()
    }

    return lastBuffer
}

function allocAtlas(buffer: DrawCallBuffer): Atlas {
    const texture = gl.createTexture()
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, ATLAS_SIZE, ATLAS_SIZE, 0, gl.RGBA, gl.UNSIGNED_BYTE, undefined)

    // Create and bind the framebuffer
    const frameBuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer)
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
    
    const shelf = new (window as any).ShelfPack(ATLAS_SIZE, ATLAS_SIZE, { autoResize: false })

    const atlas = {
        texture,
        frameBuffer,
        shelf,
        renderInCount: 0,
    } as Atlas

    buffer.atlases.push(atlas)

    return atlas
}

function tryFindSpaceForTexture(atlas: Atlas, width: number, height: number) {
    const bin = atlas.shelf.packOne(width, height)
    return bin
}

function getSpaceInAtlas(buffer: DrawCallBuffer, width: number, height: number): SpaceInAtlas {
    for (let i = 0; i < buffer.atlases.length; i++) {
        const atlas = buffer.atlases[i]
        const space = tryFindSpaceForTexture(atlas, width, height)
        if (space) {
            return {
                atlas,
                space
            }
        }
    }
    const atlas = allocAtlas(buffer)
    const space = tryFindSpaceForTexture(atlas, width, height)
    return {
        atlas,
        space
    }
}

type AtlasQueueEntry = {
    space: Bin
    image: ImageSource
}

const atlasGenerationQueue = new Map<Atlas, AtlasQueueEntry[]>()

function addRenderToAtlasQueue(atlas: Atlas, space: Bin, image: ImageSource): void {
    debugTextureWithoutAtlasesMemoryCount += (image.width * image.height * 4)

    let entries = atlasGenerationQueue.get(atlas)
    if (!entries) {
        entries = []
        atlasGenerationQueue.set(atlas, entries)
    }
    entries.push({
        space,
        image
    })
}

function processAtlasGenerationQueue(): void {
    if (atlasGenerationQueue.size < 1) {
        return
    }

    console.time('atlas processing')

    fillTexturesWithDummy(1);
    gl.viewport(0, 0, ATLAS_SIZE, ATLAS_SIZE);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, atlasQuadsIndices);
    describeVerticesForAtlas(atlasQuads, atlasQuadsDestUVs)

    atlasGenerationQueue.forEach((entries, atlas) => {
        gl.bindFramebuffer(gl.FRAMEBUFFER, atlas.frameBuffer);

        for (let i = 0; i < entries.length; i += 16) {
            const entriesCount = Math.min(entries.length - i, 16);
            for (let j = 0; j < entriesCount; j++) {
                const { space, image } = entries[i + j];

                const uv = [
                    0, 0,
                    1, 0,
                    0, 1,
                    1, 1,
                ]

                const offsetX = -1 + space.x / (ATLAS_SIZE / 2)
                const offsetY = -1 + space.y / (ATLAS_SIZE / 2)
                const scaleX = image.width / (ATLAS_SIZE / 2)
                const scaleY = image.height / (ATLAS_SIZE / 2)

                let bufferIndex = j * (4 * 4);
                for (let k = 0; k < uv.length; k += 2) {
                    const u = uv[k + 0] * scaleX + offsetX
                    const v = uv[k + 1] * scaleY + offsetY

                    atlasQuadsDestUVsBuffer[bufferIndex + 0] = u;
                    atlasQuadsDestUVsBuffer[bufferIndex + 1] = v;

                    bufferIndex += 4;
                }

                const imageTexture = gl.createTexture()
                gl.activeTexture(gl.TEXTURE0 + j);
                gl.bindTexture(gl.TEXTURE_2D, imageTexture);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
            }

            gl.bindBuffer(gl.ARRAY_BUFFER, atlasQuadsDestUVs);
            gl.bufferSubData(gl.ARRAY_BUFFER, 0, atlasQuadsDestUVsBuffer);

            gl.drawElements(gl.TRIANGLES, entriesCount * 6, gl.UNSIGNED_SHORT, 0);
        }
    })
    atlasGenerationQueue.clear()
    
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0.0, 0.0, canvas.width, canvas.height);

    console.timeEnd('atlas processing')
}

function downloadBase64File(contentBase64, fileName) {
    const linkSource = contentBase64;
    const downloadLink = document.createElement('a');
    document.body.appendChild(downloadLink);

    downloadLink.href = linkSource;
    downloadLink.target = '_self';
    downloadLink.download = fileName;
    downloadLink.click();

    document.body.removeChild(downloadLink);
}

function debugOutputAtlas(atlas: Atlas): void {
    const width = ATLAS_SIZE
    const height = ATLAS_SIZE

    gl.bindFramebuffer(gl.FRAMEBUFFER, atlas.frameBuffer);
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const context = canvas.getContext('2d')
    const imageData = context.createImageData(width, height)
    gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, imageData.data);
    context.putImageData(imageData, 0, 0)
    const str = canvas.toDataURL('image/jpeg', 0.1)
    downloadBase64File(str, 'atlas.jpeg')
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
}

function debugOutputAtlasPng(atlas: Atlas): void {
    const width = ATLAS_SIZE
    const height = ATLAS_SIZE

    gl.bindFramebuffer(gl.FRAMEBUFFER, atlas.frameBuffer);
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const context = canvas.getContext('2d')
    const imageData = context.createImageData(width, height)
    gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, imageData.data);
    context.putImageData(imageData, 0, 0)
    const str = canvas.toDataURL('image/png')
    downloadBase64File(str, 'atlas.png')
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
}

// shader util

function compileShader(name, uniforms, attributes) {
    const vertexShaderCode = document.getElementById(name + '.vert').textContent;
    const fragmentShaderCode = document.getElementById(name + '.frag').textContent;

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

// web-gl debug

function glEnumToString(gl, value) {
    // Optimization for the most common enum:
    if (value === gl.NO_ERROR) {
        return "NO_ERROR";
    }
    for (const p in gl) {
        if (gl[p] === value) {
            return p;
        }
    }
    return "0x" + value.toString(16);
}

function createGLErrorWrapper(context, fname) {
    return function() {
        const rv = context[fname].apply(context, arguments);
        const err = context.getError();
        if (err !== context.NO_ERROR) {
            throw "GL error " + glEnumToString(context, err) + " in " + fname;
        }
        return rv;
    };
}

function create3DContextWithWrapperThatThrowsOnGLError(context: WebGLRenderingContext): WebGLRenderingContext {
    const wrap = {} as any;
    for (const i in context) {
        try {
            if (typeof context[i] === 'function') {
                wrap[i] = createGLErrorWrapper(context, i);
            } else {
                wrap[i] = context[i];
            }
        } catch (e) {
            throw new Error("createContextWrapperThatThrowsOnGLError: Error accessing " + i);
        }
    }
    wrap.getError = function() {
        return context.getError();
    };
    return wrap as WebGLRenderingContext;
}

// controls

let isDown = false;
let lastX = 0
let lastY = 0

function controls_mousedown(e) {
    if (e.button === 0) {
        isDown = true
    }
    lastX = e.clientX;
    lastY = e.clientY;
}
function controls_mouseup(e) {
    if (e.button === 0) {
        isDown = false
    }
    lastX = e.clientX;
    lastY = e.clientY;
}

function moveCameraBy(dx, dy) {
    cameraX -= dx / scale * devicePixelRatio;
    cameraY -= dy / scale * devicePixelRatio;
}

function screenToWorld(x, y) {
    return [
        x / scale - cameraX,
        y / scale - cameraY
    ]
}

function scaleCameraBy(s) {
    const screenX = lastX * window.devicePixelRatio - canvas.width / 2;
    const screenY = lastY * window.devicePixelRatio - canvas.height / 2;

    const [ x0, y0 ] = screenToWorld(screenX, screenY);
    
    scale = Math.max(0.01, Math.min(100, scale / (1 + Math.min(Math.max(-0.999, s / 100), 0.999))));

    const [ x1, y1 ] = screenToWorld(screenX, screenY);

    const dx = x1 - x0
    const dy = y1 - y0

    cameraX -= dx;
    cameraY -= dy;
}

function controls_mousemove(e) {
    const x = e.clientX;
    const y = e.clientY;
    if (isDown) {
        const dx = x - lastX;
        const dy = y - lastY;

        moveCameraBy(dx, dy)
    }
    lastX = x;
    lastY = y;
}

function controls_wheel(e) {
    const isTouchPad = e.wheelDeltaY ? e.wheelDeltaY === -3 * e.deltaY : e.deltaMode === 0

    if (isTouchPad) {
        moveCameraBy(e.deltaX, e.deltaY)
    } else {
        scaleCameraBy(e.deltaY)
    }
    
    e.preventDefault()
}