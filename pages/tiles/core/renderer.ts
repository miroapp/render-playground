const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 640;

interface RendererProps {
    canvas: HTMLCanvasElement
}

export class TilesRenderer {
    private container: HTMLCanvasElement
    private context: CanvasRenderingContext2D
    constructor({canvas}: RendererProps) {
        const ctx = canvas.getContext('2d')

        if (ctx === null) {
            throw new Error('Canvas2D renderer is uninitialized!')
        }

        canvas.width = CANVAS_WIDTH;
        canvas.height = CANVAS_HEIGHT;

        this.container = canvas
        this.context = ctx
    }

    background(color: string) {
        const ctx = this.context
        ctx.fillStyle = color
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)
    }

    refresh() {

    }

    destroy() {

    }
}