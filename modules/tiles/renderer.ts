import { ViewportUpdateCallback, VisualUpdateParams } from "./types";
import { WidgetManager } from "./widget-manager";

const CANVAS_WIDTH = 1280;
const CANVAS_HEIGHT = 800;

interface RendererProps {
  canvas: HTMLCanvasElement;
  widgetManager: WidgetManager;
}

export class TilesRenderer {
  private widgetManager: WidgetManager;
  private container: HTMLCanvasElement;
  private context: CanvasRenderingContext2D;
  constructor({ canvas, widgetManager }: RendererProps) {
    this.widgetManager = widgetManager;
    const ctx = canvas.getContext("2d");

    if (ctx === null) {
      throw new Error("Canvas2D renderer is uninitialized!");
    }

    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;

    this.container = canvas;
    this.context = ctx;
  }

  background(color: string) {
    const ctx = this.context;
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  }

  render(params: VisualUpdateParams) {
    const width = CANVAS_WIDTH / params.scale;
    const height = CANVAS_HEIGHT / params.scale;
    const x = params.canvasOffset.x - width / 2;
    const y = params.canvasOffset.y - height / 2;
    const box = { x, y, width, height };

    const widgets = this.widgetManager.getWidgets(box);

    this.context.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    widgets.forEach((widget) => {
      console.log(widget.position.x, box.x);
      this.context.drawImage(
        widget.image,
        (widget.position.x - box.x) * params.scale,
        (widget.position.y - box.y) * params.scale,
        widget.image.width * 0.25 * params.scale,
        widget.image.height * 0.25 * params.scale
      );
    });
  }

  refresh() {}

  onViewportUpdate(callback: ViewportUpdateCallback) {}

  destroy() {}
}
