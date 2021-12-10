import { NavigationManager } from "./navigation-manager";
import { BoundaryBox, IPoint, ViewportUpdateCallback, VisualUpdateParams } from "./types";
import { WidgetManager } from "./widget-manager";

const CANVAS_WIDTH = 1280;
const CANVAS_HEIGHT = 800;

export interface RendererProps {
  canvas: HTMLCanvasElement;
  widgetManager: WidgetManager;
}

export abstract class RendererBase {
  /**
   * container location on HTML page (top-left)
   */
  private _location: IPoint = { x: 0, y: 0 };
  /**
   * last cached cursor position
   */
  private _lastMousePosition?: IPoint;

  protected _container: HTMLCanvasElement;
  protected _context: CanvasRenderingContext2D;

  protected widgetManager: WidgetManager;
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
    this.navigationManager = new NavigationManager(this);

    this._container.addEventListener("pointerover", this.dispatchMouseOrWheelOverEvent);
    this._container.addEventListener("pointermove", this.dispatchMouseOrWheelOverEvent);
    this._container.addEventListener("wheel", this.dispatchMouseOrWheelOverEvent, {
      capture: true,
    });
    window.addEventListener("scroll", this.captureLocation.bind(this));

    // initialize location of the canvas
    this.captureLocation();

    // Start rendering loop
    setTimeout(this.refresh.bind(this), 1000);
  }

  get container(): HTMLCanvasElement {
    return this._container;
  }

  get context(): CanvasRenderingContext2D {
    return this._context;
  }

  background(color: string) {
    const ctx = this._context;
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  }

  abstract render(params: VisualUpdateParams): void;

  abstract reset(): void;

  refresh() {
    const needsRender = this.navigationManager.refresh();
    if (needsRender) {
      this.render({
        canvasOffset: this.navigationManager.position,
        scale: this.navigationManager.scale,
      });
    }
    requestAnimationFrame(this.refresh.bind(this));
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

  protected drawContext(context: CanvasRenderingContext2D, box: BoundaryBox, scale: number) {
    const widgets = this.widgetManager.getWidgets(box);
    context.clearRect(0, 0, this._container.width, this._container.width);
    widgets.forEach((widget) => {
      context.drawImage(
        widget.image,
        (widget.position.x - box.x) * scale,
        (widget.position.y - box.y) * scale,
        // Images are stored at 4x resolution
        (widget.image.width * scale) / 4,
        (widget.image.height * scale) / 4
      );
    });
  }

  protected getVisualUpdateParamsBox(params: VisualUpdateParams) {
    const width = this._container.width / params.scale;
    const height = this._container.height / params.scale;
    const x = params.canvasOffset.x - width / 2;
    const y = params.canvasOffset.y - height / 2;
    return { x, y, width, height };
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
