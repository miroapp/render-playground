import { IPoint, ViewportUpdateCallback, VisualUpdateParams } from "./types";
import { WidgetManager } from "./widget-manager";
import { NavigationManager } from "./navigation-manager";

const CANVAS_WIDTH = 1280;
const CANVAS_HEIGHT = 800;

interface RendererProps {
  canvas: HTMLCanvasElement;
  widgetManager: WidgetManager;
}

export class TilesRenderer {
  /**
   * container location on HTML page (top-left)
   */
  private _location: IPoint = { x: 0, y: 0 };
  /**
   * last cached cursor position
   */
  private _lastMousePosition?: IPoint;

  private _container: HTMLCanvasElement;
  private _context: CanvasRenderingContext2D;

  private widgetManager: WidgetManager;
  private navigationManager: NavigationManager;

  constructor({ canvas, widgetManager }: RendererProps) {
    
    const ctx = canvas.getContext("2d");

    if (ctx === null) {
      throw new Error("Canvas2D renderer is uninitialized!");
    }

    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;

    this._container = canvas;
    this._context = ctx;
    
    this.widgetManager = widgetManager;
    this.navigationManager = new NavigationManager(this)

    this._container.addEventListener("pointerover", this.dispatchMouseOrWheelOverEvent);
    this._container.addEventListener("pointermove", this.dispatchMouseOrWheelOverEvent);
    this._container.addEventListener("wheel", this.dispatchMouseOrWheelOverEvent, { capture: true });
    window.addEventListener("scroll", this.captureLocation.bind(this));
    window.requestAnimationFrame(this.refresh.bind(this))

    // initialize location of the canvas
    this.captureLocation();

  }

  get container(): HTMLCanvasElement {
    return this._container
  }

  get context(): CanvasRenderingContext2D {
    return this._context
  }

  background(color: string) {
    const ctx = this._context;
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

    this._context.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    widgets.forEach((widget) => {
      this._context.drawImage(
        widget.image,
        (widget.position.x - box.x) * params.scale,
        (widget.position.y - box.y) * params.scale,
        // Images are stored at 4x resolution
        (widget.image.width * params.scale) / 4,
        (widget.image.height * params.scale) / 4
      );
    });
    this.context.fillStyle = "#000000";
    this.context.fillText(`${widgets.length}/${this.widgetManager.widgets.length}`, 0, 20);
  }

  refresh() {
    // this._context.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    const needsRender = this.navigationManager.refresh()
    if (needsRender) {
      this.render({
        canvasOffset: this.navigationManager.position,
        scale: this.navigationManager.scale
    })
    }
    requestAnimationFrame(this.refresh.bind(this))
  }

  onViewportUpdate(callback: ViewportUpdateCallback) {}

  destroy() {}

  clientToEngineSpace(x: number, y: number): IPoint {
    return { x: x - this._location.x, y: y - this._location.y };
  }

  setMousePosition(x: number, y: number): IPoint {
    const position = this.clientToEngineSpace(x, y);
    this._lastMousePosition = position;
    return this._lastMousePosition;
  }

  getMousePosition(): IPoint | undefined {
    return this._lastMousePosition;
  }

  private captureLocation(): void {
    const canvas = this._container;
    const { left, top } = canvas.getBoundingClientRect();
    this._location.x = left;
    this._location.y = top;
  }

  private dispatchMouseOrWheelOverEvent = (event: MouseEvent | WheelEvent | PointerEvent) => {
    this.setMousePosition(event.clientX, event.clientY);
  };
}
